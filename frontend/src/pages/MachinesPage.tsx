import { useState } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import ConfirmDialog from '../components/ConfirmDialog'
import { machineStorage, maintenanceRecordStorage, fuelingStorage } from '../services/storage'
import { Machine } from '../types'
import { FiPlus, FiEdit2, FiEye, FiSearch, FiTrash2 } from 'react-icons/fi'

const statusMap: Record<string, { label: string; variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }> = {
  AVAILABLE: { label: 'Disponivel', variant: 'green' },
  OPERATING: { label: 'Operando', variant: 'blue' },
  MAINTENANCE: { label: 'Manutencao', variant: 'yellow' },
  INACTIVE: { label: 'Inativa', variant: 'gray' },
}

const typeLabel: Record<string, string> = {
  EXCAVATOR: 'Escavadeira', BULLDOZER: 'Trator de Esteira', LOADER: 'Pa Carregadeira',
  TRUCK: 'Caminhao', GRADER: 'Motoniveladora', ROLLER: 'Compactador', OTHER: 'Outro',
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>(machineStorage.getAll())
  const [showForm, setShowForm] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [showDetails, setShowDetails] = useState<Machine | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [hourMeterInput, setHourMeterInput] = useState('')

  // Form state
  const [formData, setFormData] = useState({ name: '', model: '', manufacturer: '', year: '', patrimonyCode: '', type: 'EXCAVATOR', hourMeter: '', status: 'AVAILABLE' })

  const refreshMachines = () => setMachines(machineStorage.getAll())

  const filtered = machines.filter(m => {
    if (typeFilter && m.type !== typeFilter) return false
    if (statusFilter && m.status !== statusFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openCreateForm = () => {
    setEditingMachine(null)
    setFormData({ name: '', model: '', manufacturer: '', year: '', patrimonyCode: '', type: 'EXCAVATOR', hourMeter: '', status: 'AVAILABLE' })
    setShowForm(true)
  }

  const openEditForm = (m: Machine) => {
    setEditingMachine(m)
    setFormData({ name: m.name, model: m.model, manufacturer: m.manufacturer, year: m.year.toString(), patrimonyCode: m.patrimonyCode, type: m.type, hourMeter: m.hourMeter.toString(), status: m.status })
    setShowForm(true)
  }

  const handleSave = () => {
    const data: Omit<Machine, 'id'> = {
      name: formData.name,
      model: formData.model,
      manufacturer: formData.manufacturer,
      year: parseInt(formData.year) || 2024,
      patrimonyCode: formData.patrimonyCode,
      type: formData.type as Machine['type'],
      hourMeter: parseFloat(formData.hourMeter) || 0,
      status: formData.status as Machine['status'],
      companyId: '1',
    }
    if (editingMachine) {
      machineStorage.update(editingMachine.id, data)
    } else {
      machineStorage.create(data)
    }
    refreshMachines()
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    machineStorage.delete(id)
    refreshMachines()
    setDeleteConfirm(null)
  }

  const handleUpdateHourMeter = () => {
    if (!showDetails || !hourMeterInput) return
    const newHour = parseFloat(hourMeterInput)
    if (isNaN(newHour)) return
    machineStorage.update(showDetails.id, { hourMeter: newHour })
    setShowDetails({ ...showDetails, hourMeter: newHour })
    setHourMeterInput('')
    refreshMachines()
  }

  const machineMaintenances = showDetails ? maintenanceRecordStorage.getAll().filter(r => r.machineId === showDetails.id) : []
  const machineFuelings = showDetails ? fuelingStorage.getAll().filter(f => f.machineId === showDetails.id) : []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maquinas</h1>
        <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Nova Maquina
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar maquina..." className="input-field pl-9" />
        </div>
        <select className="select-field w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Todos os tipos</option>
          {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="select-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Machine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{m.name}</h3>
                <p className="text-sm text-gray-500">{typeLabel[m.type]} - {m.manufacturer}</p>
              </div>
              <Badge label={statusMap[m.status]?.label || m.status} variant={statusMap[m.status]?.variant || 'gray'} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
              <div><span className="text-gray-400">Modelo:</span> {m.model}</div>
              <div><span className="text-gray-400">Ano:</span> {m.year}</div>
              <div><span className="text-gray-400">Patrimonio:</span> {m.patrimonyCode}</div>
              <div><span className="text-gray-400">Horimetro:</span> {m.hourMeter.toFixed(1)}h</div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setShowDetails(m)} className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                <FiEye className="w-3 h-3" /> Detalhes
              </button>
              <button onClick={() => openEditForm(m)} className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                <FiEdit2 className="w-3 h-3" /> Editar
              </button>
              <button onClick={() => setDeleteConfirm(m.id)} className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 text-red-500 hover:bg-red-50">
                <FiTrash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingMachine ? 'Editar Maquina' : 'Nova Maquina'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome" placeholder="Ex: Escavadeira CAT 320" value={formData.name} onChange={e => setFormData({...formData, name: (e.target as HTMLInputElement).value})} />
          <FormField label="Modelo" placeholder="320F" value={formData.model} onChange={e => setFormData({...formData, model: (e.target as HTMLInputElement).value})} />
          <FormField label="Fabricante" placeholder="Caterpillar" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: (e.target as HTMLInputElement).value})} />
          <FormField label="Ano" type="number" placeholder="2024" value={formData.year} onChange={e => setFormData({...formData, year: (e.target as HTMLInputElement).value})} />
          <FormField label="Codigo Patrimonio" placeholder="EQ-001" value={formData.patrimonyCode} onChange={e => setFormData({...formData, patrimonyCode: (e.target as HTMLInputElement).value})} />
          <FormField label="Tipo" fieldType="select" value={formData.type} onChange={e => setFormData({...formData, type: (e.target as HTMLSelectElement).value})} options={Object.entries(typeLabel).map(([k, v]) => ({ value: k, label: v }))} />
          <FormField label="Horimetro Atual" type="number" placeholder="0" value={formData.hourMeter} onChange={e => setFormData({...formData, hourMeter: (e.target as HTMLInputElement).value})} />
          <FormField label="Status" fieldType="select" value={formData.status} onChange={e => setFormData({...formData, status: (e.target as HTMLSelectElement).value})} options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">Salvar</button>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={!!showDetails} onClose={() => setShowDetails(null)} title={showDetails?.name || ''} size="xl">
        {showDetails && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Tipo</p><p className="text-sm font-medium">{typeLabel[showDetails.type]}</p></div>
              <div><p className="text-xs text-gray-500">Fabricante</p><p className="text-sm font-medium">{showDetails.manufacturer}</p></div>
              <div><p className="text-xs text-gray-500">Modelo / Ano</p><p className="text-sm font-medium">{showDetails.model} / {showDetails.year}</p></div>
              <div><p className="text-xs text-gray-500">Horimetro</p><p className="text-sm font-bold text-primary-600">{showDetails.hourMeter.toFixed(1)}h</p></div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Atualizar Horimetro</h3>
              <div className="flex gap-2">
                <input type="number" className="input-field w-40" placeholder={showDetails.hourMeter.toString()} value={hourMeterInput} onChange={e => setHourMeterInput(e.target.value)} />
                <button onClick={handleUpdateHourMeter} className="btn-primary text-xs">Atualizar</button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Historico de Manutencoes</h3>
              <div className="space-y-2">
                {machineMaintenances.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{r.description}</p>
                      <p className="text-xs text-gray-500">{new Date(r.scheduledDate).toLocaleDateString('pt-BR')} - {r.type === 'PREVENTIVE' ? 'Preventiva' : r.type === 'CORRECTIVE' ? 'Corretiva' : 'Preditiva'}</p>
                    </div>
                    <div className="text-right">
                      {r.cost && <p className="text-sm font-bold">R$ {r.cost.toLocaleString('pt-BR')}</p>}
                      <Badge label={r.status === 'COMPLETED' ? 'Concluida' : r.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente'} variant={r.status === 'COMPLETED' ? 'green' : r.status === 'IN_PROGRESS' ? 'blue' : 'yellow'} />
                    </div>
                  </div>
                ))}
                {machineMaintenances.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhuma manutencao registrada</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Historico de Abastecimentos</h3>
              <div className="space-y-2">
                {machineFuelings.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{f.liters}L - R$ {f.pricePerLiter.toFixed(2)}/L</p>
                      <p className="text-xs text-gray-500">{new Date(f.date).toLocaleDateString('pt-BR')} - Horimetro: {f.hourMeter}h</p>
                    </div>
                    <p className="text-sm font-bold">R$ {f.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
                {machineFuelings.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum abastecimento registrado</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Excluir Maquina"
        message="Tem certeza que deseja excluir esta maquina? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
