import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import DataTable from '../components/DataTable'
import AlertCard from '../components/AlertCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { financialStorage, projectStorage } from '../services/storage'
import { FinancialEntry } from '../types'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { mockCashFlow } from '../data/mockData'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const statusMap: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' }> = {
  PAID: { label: 'Pago', variant: 'green' },
  PENDING: { label: 'Pendente', variant: 'yellow' },
  OVERDUE: { label: 'Vencido', variant: 'red' },
}

const dreMock = [
  { category: 'Receita Bruta', value: 1365000 },
  { category: '(-) Deducoes', value: -68250 },
  { category: 'Receita Liquida', value: 1296750 },
  { category: '(-) Custo dos Servicos', value: -780000 },
  { category: 'Lucro Bruto', value: 516750 },
  { category: '(-) Despesas Operacionais', value: -185000 },
  { category: '(-) Despesas Administrativas', value: -95000 },
  { category: 'Lucro Operacional', value: 236750 },
  { category: '(-) Impostos', value: -35512 },
  { category: 'Lucro Liquido', value: 201238 },
]

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<'entries' | 'cashflow' | 'dre'>('entries')
  const [entries, setEntries] = useState(financialStorage.getAll())
  const [showForm, setShowForm] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dreProject, setDreProject] = useState<string>('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const projects = projectStorage.getAll()

  // Form state
  const [formData, setFormData] = useState({ type: 'RECEIVABLE', category: '', description: '', value: '', dueDate: '', projectId: '', status: 'PENDING' })

  const refreshEntries = () => setEntries(financialStorage.getAll())

  const filteredEntries = entries.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false
    if (statusFilter && e.status !== statusFilter) return false
    return true
  })

  const overdueEntries = entries.filter(e => e.status === 'OVERDUE')

  const handleSave = () => {
    const project = projects.find(p => p.id === formData.projectId)
    const data: Omit<FinancialEntry, 'id'> = {
      type: formData.type as FinancialEntry['type'],
      description: formData.description,
      value: parseFloat(formData.value) || 0,
      dueDate: formData.dueDate,
      status: formData.status as FinancialEntry['status'],
      projectId: formData.projectId || undefined,
      category: formData.category || undefined,
      project: project ? { name: project.name } : undefined,
    }
    financialStorage.create(data)
    refreshEntries()
    setFormData({ type: 'RECEIVABLE', category: '', description: '', value: '', dueDate: '', projectId: '', status: 'PENDING' })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    financialStorage.delete(id)
    refreshEntries()
    setDeleteConfirm(null)
  }

  const columns = [
    { key: 'description', header: 'Descricao', render: (e: FinancialEntry) => <span className="font-medium text-gray-900">{e.description}</span> },
    { key: 'type', header: 'Tipo', render: (e: FinancialEntry) => (
      <Badge label={e.type === 'RECEIVABLE' ? 'A Receber' : 'A Pagar'} variant={e.type === 'RECEIVABLE' ? 'green' : 'red'} />
    )},
    { key: 'category', header: 'Categoria', render: (e: FinancialEntry) => e.category || '-' },
    { key: 'value', header: 'Valor', render: (e: FinancialEntry) => (
      <span className={e.type === 'RECEIVABLE' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{fmt(e.value)}</span>
    )},
    { key: 'dueDate', header: 'Vencimento', render: (e: FinancialEntry) => new Date(e.dueDate).toLocaleDateString('pt-BR') },
    { key: 'status', header: 'Status', render: (e: FinancialEntry) => {
      const s = statusMap[e.status]
      return s ? <Badge label={s.label} variant={s.variant} /> : null
    }},
    { key: 'actions', header: '', sortable: false, render: (e: FinancialEntry) => (
      <button onClick={(ev) => { ev.stopPropagation(); setDeleteConfirm(e.id) }} className="p-1.5 hover:bg-gray-100 rounded">
        <FiTrash2 className="w-4 h-4 text-red-500" />
      </button>
    )},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Novo Lancamento
        </button>
      </div>

      {/* Alerts */}
      {overdueEntries.length > 0 && (
        <div className="space-y-2 mb-6">
          {overdueEntries.map(e => (
            <AlertCard key={e.id} title="Conta Vencida" description={`${e.description} - ${fmt(e.value)} vencido em ${new Date(e.dueDate).toLocaleDateString('pt-BR')}`} severity="danger" />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(['entries', 'cashflow', 'dre'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'entries' ? 'Lancamentos' : tab === 'cashflow' ? 'Fluxo de Caixa' : 'DRE'}
          </button>
        ))}
      </div>

      {activeTab === 'entries' && (
        <>
          <div className="flex gap-2 mb-4">
            <select className="select-field w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="RECEIVABLE">A Receber</option>
              <option value="PAYABLE">A Pagar</option>
            </select>
            <select className="select-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Vencido</option>
            </select>
          </div>
          <DataTable columns={columns} data={filteredEntries} />
        </>
      )}

      {activeTab === 'cashflow' && (
        <div>
          <div className="card p-5 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">Fluxo de Caixa Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockCashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => fmt(Number(value))} />
                <Legend />
                <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Saidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Mes</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Entradas</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Saidas</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockCashFlow.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 text-sm">{c.month}</td>
                    <td className="px-5 py-3 text-sm text-green-600">{fmt(c.income)}</td>
                    <td className="px-5 py-3 text-sm text-red-600">{fmt(c.expenses)}</td>
                    <td className={`px-5 py-3 text-sm font-bold ${c.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmt(c.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'dre' && (
        <div>
          <div className="mb-4">
            <select className="select-field w-auto" value={dreProject} onChange={e => setDreProject(e.target.value)}>
              <option value="">DRE Consolidada</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">
                Demonstrativo de Resultado {dreProject ? `- ${projects.find(p => p.id === dreProject)?.name}` : '- Consolidado'}
              </h2>
            </div>
            <table className="w-full">
              <tbody>
                {dreMock.map((row, i) => {
                  const isTotal = row.category.includes('Lucro') || row.category.includes('Receita L')
                  return (
                    <tr key={i} className={`${isTotal ? 'bg-gray-50 font-bold' : ''} border-b border-gray-50`}>
                      <td className={`px-5 py-3 text-sm ${isTotal ? 'text-gray-900' : 'text-gray-600'}`}>{row.category}</td>
                      <td className={`px-5 py-3 text-sm text-right ${row.value >= 0 ? (isTotal ? 'text-green-700' : 'text-gray-900') : 'text-red-600'}`}>{fmt(Math.abs(row.value))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Lancamento" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tipo" fieldType="select" value={formData.type} onChange={e => setFormData({...formData, type: (e.target as HTMLSelectElement).value})} options={[
            { value: 'RECEIVABLE', label: 'A Receber' },
            { value: 'PAYABLE', label: 'A Pagar' },
          ]} />
          <FormField label="Categoria" placeholder="Ex: Medicao, Combustivel" value={formData.category} onChange={e => setFormData({...formData, category: (e.target as HTMLInputElement).value})} />
          <FormField label="Descricao" placeholder="Descricao do lancamento" value={formData.description} onChange={e => setFormData({...formData, description: (e.target as HTMLInputElement).value})} />
          <FormField label="Valor (R$)" type="number" placeholder="0,00" value={formData.value} onChange={e => setFormData({...formData, value: (e.target as HTMLInputElement).value})} />
          <FormField label="Data de Vencimento" type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: (e.target as HTMLInputElement).value})} />
          <FormField label="Obra" fieldType="select" value={formData.projectId} onChange={e => setFormData({...formData, projectId: (e.target as HTMLSelectElement).value})} options={[
            { value: '', label: 'Nenhuma (geral)' },
            ...projects.map(p => ({ value: p.id, label: p.name })),
          ]} />
          <FormField label="Status" fieldType="select" value={formData.status} onChange={e => setFormData({...formData, status: (e.target as HTMLSelectElement).value})} options={[
            { value: 'PENDING', label: 'Pendente' },
            { value: 'PAID', label: 'Pago' },
          ]} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">Salvar</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Excluir Lancamento"
        message="Tem certeza que deseja excluir este lancamento?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
