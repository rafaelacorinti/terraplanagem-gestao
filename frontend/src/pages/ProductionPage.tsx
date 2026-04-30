import { useState } from 'react'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import { productionStorage, machineStorage, employeeStorage, projectStorage } from '../services/storage'
import { DailyProduction } from '../types'
import { FiPlus, FiFilter, FiTrash2 } from 'react-icons/fi'

export default function ProductionPage() {
  const [productions, setProductions] = useState(productionStorage.getAll())
  const [showForm, setShowForm] = useState(false)
  const [projectFilter, setProjectFilter] = useState('')
  const [machineFilter, setMachineFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const machines = machineStorage.getAll()
  const employees = employeeStorage.getAll()
  const projects = projectStorage.getAll()

  // Form state
  const [formData, setFormData] = useState({ date: '', machineId: '', operatorId: '', projectId: '', hoursWorked: '', volumeMoved: '', transportDistance: '', stoppageHours: '', serviceDescription: '', stoppageReason: '' })

  const refreshProductions = () => setProductions(productionStorage.getAll())

  const filtered = productions.filter(p => {
    if (projectFilter && p.projectId !== projectFilter) return false
    if (machineFilter && p.machineId !== machineFilter) return false
    return true
  })

  const totalHours = filtered.reduce((s, p) => s + p.hoursWorked, 0)
  const totalVolume = filtered.reduce((s, p) => s + (p.volumeMoved || 0), 0)
  const totalStoppage = filtered.reduce((s, p) => s + p.stoppageHours, 0)

  const handleSave = () => {
    const machine = machines.find(m => m.id === formData.machineId)
    const operator = employees.find(e => e.id === formData.operatorId)
    const project = projects.find(p => p.id === formData.projectId)
    const data: Omit<DailyProduction, 'id'> = {
      date: formData.date,
      machineId: formData.machineId,
      operatorId: formData.operatorId,
      projectId: formData.projectId,
      hoursWorked: parseFloat(formData.hoursWorked) || 0,
      volumeMoved: formData.volumeMoved ? parseFloat(formData.volumeMoved) : undefined,
      transportDistance: formData.transportDistance ? parseFloat(formData.transportDistance) : undefined,
      stoppageHours: parseFloat(formData.stoppageHours) || 0,
      serviceDescription: formData.serviceDescription,
      stoppageReason: formData.stoppageReason || undefined,
      machine: machine ? { name: machine.name } : undefined,
      operator: operator ? { name: operator.name } : undefined,
      project: project ? { name: project.name } : undefined,
    }
    productionStorage.create(data)
    refreshProductions()
    setFormData({ date: '', machineId: '', operatorId: '', projectId: '', hoursWorked: '', volumeMoved: '', transportDistance: '', stoppageHours: '', serviceDescription: '', stoppageReason: '' })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    productionStorage.delete(id)
    refreshProductions()
    setDeleteConfirm(null)
  }

  const columns = [
    { key: 'date', header: 'Data', render: (p: DailyProduction) => new Date(p.date).toLocaleDateString('pt-BR') },
    { key: 'machine', header: 'Maquina', render: (p: DailyProduction) => <span className="font-medium">{p.machine?.name}</span> },
    { key: 'operator', header: 'Operador', render: (p: DailyProduction) => p.operator?.name },
    { key: 'project', header: 'Obra', render: (p: DailyProduction) => p.project?.name },
    { key: 'hoursWorked', header: 'Horas', render: (p: DailyProduction) => `${p.hoursWorked.toFixed(1)}h` },
    { key: 'serviceDescription', header: 'Servico' },
    { key: 'volumeMoved', header: 'Volume (m3)', render: (p: DailyProduction) => p.volumeMoved ? `${p.volumeMoved.toFixed(0)}` : '-' },
    { key: 'stoppageHours', header: 'Paradas', render: (p: DailyProduction) => p.stoppageHours > 0 ? (
      <span className="text-red-600">{p.stoppageHours.toFixed(1)}h</span>
    ) : '-' },
    { key: 'actions', header: '', sortable: false, render: (p: DailyProduction) => (
      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id) }} className="p-1.5 hover:bg-gray-100 rounded">
        <FiTrash2 className="w-4 h-4 text-red-500" />
      </button>
    )},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apontamentos de Producao</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Novo Apontamento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiFilter className="w-4 h-4" /> Filtros:
        </div>
        <select className="select-field w-auto" value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="">Todas as obras</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="select-field w-auto" value={machineFilter} onChange={e => setMachineFilter(e.target.value)}>
          <option value="">Todas as maquinas</option>
          {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total de Horas</p>
          <p className="text-xl font-bold text-primary-600">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Volume Total</p>
          <p className="text-xl font-bold text-blue-600">{totalVolume.toLocaleString('pt-BR')} m3</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Horas Paradas</p>
          <p className="text-xl font-bold text-red-600">{totalStoppage.toFixed(1)}h</p>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Apontamento" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Data" type="date" value={formData.date} onChange={e => setFormData({...formData, date: (e.target as HTMLInputElement).value})} />
          <FormField label="Maquina" fieldType="select" value={formData.machineId} onChange={e => setFormData({...formData, machineId: (e.target as HTMLSelectElement).value})} options={machines.map(m => ({ value: m.id, label: m.name }))} />
          <FormField label="Operador" fieldType="select" value={formData.operatorId} onChange={e => setFormData({...formData, operatorId: (e.target as HTMLSelectElement).value})} options={employees.filter(e => e.role === 'OPERATOR').map(e => ({ value: e.id, label: e.name }))} />
          <FormField label="Obra" fieldType="select" value={formData.projectId} onChange={e => setFormData({...formData, projectId: (e.target as HTMLSelectElement).value})} options={projects.map(p => ({ value: p.id, label: p.name }))} />
          <FormField label="Horas Trabalhadas" type="number" placeholder="0.0" value={formData.hoursWorked} onChange={e => setFormData({...formData, hoursWorked: (e.target as HTMLInputElement).value})} />
          <FormField label="Volume Movido (m3)" type="number" placeholder="0" value={formData.volumeMoved} onChange={e => setFormData({...formData, volumeMoved: (e.target as HTMLInputElement).value})} />
          <FormField label="Distancia (km)" type="number" placeholder="0" value={formData.transportDistance} onChange={e => setFormData({...formData, transportDistance: (e.target as HTMLInputElement).value})} />
          <FormField label="Horas Paradas" type="number" placeholder="0.0" value={formData.stoppageHours} onChange={e => setFormData({...formData, stoppageHours: (e.target as HTMLInputElement).value})} />
        </div>
        <FormField label="Servico Realizado" fieldType="textarea" placeholder="Descricao do servico..." value={formData.serviceDescription} onChange={e => setFormData({...formData, serviceDescription: (e.target as HTMLTextAreaElement).value})} />
        <FormField label="Motivo da Parada" placeholder="Se houver parada, descreva o motivo" value={formData.stoppageReason} onChange={e => setFormData({...formData, stoppageReason: (e.target as HTMLInputElement).value})} />
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">Salvar</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Excluir Apontamento"
        message="Tem certeza que deseja excluir este apontamento?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
