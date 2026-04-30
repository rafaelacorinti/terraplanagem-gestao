import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import DataTable from '../components/DataTable'
import AlertCard from '../components/AlertCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { fuelingStorage, machineStorage, employeeStorage } from '../services/storage'
import { Fueling } from '../types'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

export default function FuelingPage() {
  const [fuelings, setFuelings] = useState(fuelingStorage.getAll())
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const machines = machineStorage.getAll()
  const employees = employeeStorage.getAll()

  // Form state
  const [formData, setFormData] = useState({ machineId: '', date: '', liters: '', pricePerLiter: '', hourMeter: '', operatorId: '' })

  const refreshFuelings = () => setFuelings(fuelingStorage.getAll())

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  const consumptionByMachine = machines.map(m => {
    const mFuelings = fuelings.filter(f => f.machineId === m.id)
    const totalLiters = mFuelings.reduce((s, f) => s + f.liters, 0)
    const totalCost = mFuelings.reduce((s, f) => s + f.totalCost, 0)
    const avgConsumption = mFuelings.length > 0 ? totalLiters / mFuelings.length : 0
    return { name: m.name.split(' ').slice(0, 2).join(' '), totalLiters, totalCost, avgConsumption, count: mFuelings.length }
  }).filter(c => c.count > 0)

  const handleSave = () => {
    const machine = machines.find(m => m.id === formData.machineId)
    const operator = employees.find(e => e.id === formData.operatorId)
    const liters = parseFloat(formData.liters) || 0
    const pricePerLiter = parseFloat(formData.pricePerLiter) || 0
    const data: Omit<Fueling, 'id'> = {
      machineId: formData.machineId,
      date: formData.date,
      liters,
      pricePerLiter,
      totalCost: liters * pricePerLiter,
      hourMeter: parseFloat(formData.hourMeter) || 0,
      operatorId: formData.operatorId || undefined,
      machine: machine ? { name: machine.name } : undefined,
      operator: operator ? { name: operator.name } : undefined,
    }
    fuelingStorage.create(data)
    refreshFuelings()
    setFormData({ machineId: '', date: '', liters: '', pricePerLiter: '', hourMeter: '', operatorId: '' })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    fuelingStorage.delete(id)
    refreshFuelings()
    setDeleteConfirm(null)
  }

  const columns = [
    { key: 'date', header: 'Data', render: (f: Fueling) => new Date(f.date).toLocaleDateString('pt-BR') },
    { key: 'machine', header: 'Maquina', render: (f: Fueling) => <span className="font-medium">{f.machine?.name}</span> },
    { key: 'liters', header: 'Litros', render: (f: Fueling) => `${f.liters}L` },
    { key: 'pricePerLiter', header: 'Preco/L', render: (f: Fueling) => `R$ ${f.pricePerLiter.toFixed(2)}` },
    { key: 'totalCost', header: 'Total', render: (f: Fueling) => <span className="font-medium">{fmt(f.totalCost)}</span> },
    { key: 'hourMeter', header: 'Horimetro', render: (f: Fueling) => `${f.hourMeter}h` },
    { key: 'operator', header: 'Operador', render: (f: Fueling) => f.operator?.name || '-' },
    { key: 'actions', header: '', sortable: false, render: (f: Fueling) => (
      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(f.id) }} className="p-1.5 hover:bg-gray-100 rounded">
        <FiTrash2 className="w-4 h-4 text-red-500" />
      </button>
    )},
  ]

  const totalLiters = fuelings.reduce((s, f) => s + f.liters, 0)
  const totalCost = fuelings.reduce((s, f) => s + f.totalCost, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Combustivel</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Novo Abastecimento
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total de Litros</p>
          <p className="text-xl font-bold text-blue-600">{totalLiters.toLocaleString('pt-BR')}L</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Custo Total</p>
          <p className="text-xl font-bold text-red-600">{fmt(totalCost)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Preco Medio/L</p>
          <p className="text-xl font-bold text-gray-900">R$ {totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {/* Alert */}
      <div className="mb-6">
        <AlertCard title="Consumo Elevado" description="Caminhao Cacamba Volvo com consumo 15% acima da media" severity="warning" />
      </div>

      {/* Chart */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Consumo por Maquina (Litros)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={consumptionByMachine}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalLiters" name="Total Litros" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <h2 className="font-semibold text-gray-700 mb-3">Abastecimentos</h2>
      <DataTable columns={columns} data={fuelings} />

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Abastecimento" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Maquina" fieldType="select" value={formData.machineId} onChange={e => setFormData({...formData, machineId: (e.target as HTMLSelectElement).value})} options={machines.map(m => ({ value: m.id, label: m.name }))} />
          <FormField label="Data" type="date" value={formData.date} onChange={e => setFormData({...formData, date: (e.target as HTMLInputElement).value})} />
          <FormField label="Litros" type="number" placeholder="0" value={formData.liters} onChange={e => setFormData({...formData, liters: (e.target as HTMLInputElement).value})} />
          <FormField label="Preco por Litro" type="number" placeholder="0.00" value={formData.pricePerLiter} onChange={e => setFormData({...formData, pricePerLiter: (e.target as HTMLInputElement).value})} />
          <FormField label="Horimetro Atual" type="number" placeholder="0" value={formData.hourMeter} onChange={e => setFormData({...formData, hourMeter: (e.target as HTMLInputElement).value})} />
          <FormField label="Operador" fieldType="select" value={formData.operatorId} onChange={e => setFormData({...formData, operatorId: (e.target as HTMLSelectElement).value})} options={employees.filter(e => e.role === 'OPERATOR').map(e => ({ value: e.id, label: e.name }))} />
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
        title="Excluir Abastecimento"
        message="Tem certeza que deseja excluir este abastecimento?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
