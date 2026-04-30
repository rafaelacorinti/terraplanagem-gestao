import { useState } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import AlertCard from '../components/AlertCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { maintenancePlanStorage, maintenanceRecordStorage, machineStorage } from '../services/storage'
import { MaintenancePlan, MaintenanceRecord } from '../types'
import { FiPlus, FiAlertTriangle, FiTrash2 } from 'react-icons/fi'

const typeLabel: Record<string, string> = { PREVENTIVE: 'Preventiva', CORRECTIVE: 'Corretiva', PREDICTIVE: 'Preditiva' }

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'records'>('plans')
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [plans, setPlans] = useState(maintenancePlanStorage.getAll())
  const [records, setRecords] = useState(maintenanceRecordStorage.getAll())
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'plan' | 'record'; id: string } | null>(null)

  const machines = machineStorage.getAll()

  // Form states
  const [planForm, setPlanForm] = useState({ machineId: '', description: '', intervalHours: '', lastServiceHourMeter: '' })
  const [recordForm, setRecordForm] = useState({ machineId: '', type: 'PREVENTIVE', scheduledDate: '', completedDate: '', cost: '', status: 'PENDING', description: '' })

  const refreshPlans = () => setPlans(maintenancePlanStorage.getAll())
  const refreshRecords = () => setRecords(maintenanceRecordStorage.getAll())

  const overduePlans = plans.filter(p => p.machine && p.machine.hourMeter >= p.nextServiceHourMeter)
  const upcomingPlans = plans.filter(p => p.machine && p.machine.hourMeter >= p.nextServiceHourMeter - 300 && p.machine.hourMeter < p.nextServiceHourMeter)

  const handleSavePlan = () => {
    const machine = machines.find(m => m.id === planForm.machineId)
    const intervalHours = parseInt(planForm.intervalHours) || 500
    const lastServiceHourMeter = parseInt(planForm.lastServiceHourMeter) || 0
    const data: Omit<MaintenancePlan, 'id'> = {
      machineId: planForm.machineId,
      description: planForm.description,
      intervalHours,
      lastServiceHourMeter,
      nextServiceHourMeter: lastServiceHourMeter + intervalHours,
      machine: machine ? { name: machine.name, hourMeter: machine.hourMeter } : undefined,
    }
    maintenancePlanStorage.create(data)
    refreshPlans()
    setPlanForm({ machineId: '', description: '', intervalHours: '', lastServiceHourMeter: '' })
    setShowPlanForm(false)
  }

  const handleSaveRecord = () => {
    const machine = machines.find(m => m.id === recordForm.machineId)
    const data: Omit<MaintenanceRecord, 'id'> = {
      machineId: recordForm.machineId,
      type: recordForm.type as MaintenanceRecord['type'],
      status: recordForm.status as MaintenanceRecord['status'],
      description: recordForm.description,
      scheduledDate: recordForm.scheduledDate,
      completedDate: recordForm.completedDate || undefined,
      cost: recordForm.cost ? parseFloat(recordForm.cost) : undefined,
      machine: machine ? { name: machine.name, model: machine.model } : undefined,
    }
    maintenanceRecordStorage.create(data)
    refreshRecords()
    setRecordForm({ machineId: '', type: 'PREVENTIVE', scheduledDate: '', completedDate: '', cost: '', status: 'PENDING', description: '' })
    setShowRecordForm(false)
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return
    if (deleteConfirm.type === 'plan') {
      maintenancePlanStorage.delete(deleteConfirm.id)
      refreshPlans()
    } else {
      maintenanceRecordStorage.delete(deleteConfirm.id)
      refreshRecords()
    }
    setDeleteConfirm(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manutencao</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowPlanForm(true)} className="btn-secondary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Novo Plano
          </button>
          <button onClick={() => setShowRecordForm(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Registrar Manutencao
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(overduePlans.length > 0 || upcomingPlans.length > 0) && (
        <div className="space-y-2 mb-6">
          {overduePlans.map(p => (
            <AlertCard key={p.id} title="Manutencao Vencida" description={`${p.machine?.name} - ${p.description} (${p.machine?.hourMeter}h / limite ${p.nextServiceHourMeter}h)`} severity="danger" />
          ))}
          {upcomingPlans.map(p => (
            <AlertCard key={p.id} title="Manutencao Proxima" description={`${p.machine?.name} - ${p.description} (${p.machine?.hourMeter}h / limite ${p.nextServiceHourMeter}h)`} severity="warning" />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setActiveTab('plans')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'plans' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Planos de Manutencao
        </button>
        <button onClick={() => setActiveTab('records')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'records' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Registros
        </button>
      </div>

      {activeTab === 'plans' ? (
        <div className="space-y-3">
          {plans.map((p: MaintenancePlan) => {
            const isOverdue = p.machine && p.machine.hourMeter >= p.nextServiceHourMeter
            const isNear = p.machine && p.machine.hourMeter >= p.nextServiceHourMeter - 300 && !isOverdue
            return (
              <div key={p.id} className={`card p-4 ${isOverdue ? 'border-red-200 bg-red-50/50' : isNear ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{p.description}</h3>
                      {isOverdue && <FiAlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-500">{p.machine?.name} - A cada {p.intervalHours}h</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Proxima revisao</p>
                      <p className={`text-lg font-bold ${isOverdue ? 'text-red-600' : isNear ? 'text-yellow-600' : 'text-gray-900'}`}>{p.nextServiceHourMeter}h</p>
                      <p className="text-xs text-gray-400">Atual: {p.machine?.hourMeter}h</p>
                    </div>
                    <button onClick={() => setDeleteConfirm({ type: 'plan', id: p.id })} className="p-1.5 hover:bg-gray-100 rounded">
                      <FiTrash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r: MaintenanceRecord) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.description}</h3>
                  <p className="text-sm text-gray-500">{r.machine?.name} - {typeLabel[r.type]} - {new Date(r.scheduledDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge label={r.status === 'COMPLETED' ? 'Concluida' : r.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente'} variant={r.status === 'COMPLETED' ? 'green' : r.status === 'IN_PROGRESS' ? 'blue' : 'yellow'} />
                    {r.cost && <p className="text-sm font-medium text-gray-700">R$ {r.cost.toLocaleString('pt-BR')}</p>}
                  </div>
                  <button onClick={() => setDeleteConfirm({ type: 'record', id: r.id })} className="p-1.5 hover:bg-gray-100 rounded">
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Form Modal */}
      <Modal isOpen={showPlanForm} onClose={() => setShowPlanForm(false)} title="Novo Plano de Manutencao" size="md">
        <div className="space-y-4">
          <FormField label="Maquina" fieldType="select" value={planForm.machineId} onChange={e => setPlanForm({...planForm, machineId: (e.target as HTMLSelectElement).value})} options={machines.map(m => ({ value: m.id, label: m.name }))} />
          <FormField label="Descricao" placeholder="Ex: Troca de oleo e filtros" value={planForm.description} onChange={e => setPlanForm({...planForm, description: (e.target as HTMLInputElement).value})} />
          <FormField label="Intervalo (horas)" type="number" placeholder="500" value={planForm.intervalHours} onChange={e => setPlanForm({...planForm, intervalHours: (e.target as HTMLInputElement).value})} />
          <FormField label="Ultimo Servico (horimetro)" type="number" placeholder="0" value={planForm.lastServiceHourMeter} onChange={e => setPlanForm({...planForm, lastServiceHourMeter: (e.target as HTMLInputElement).value})} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowPlanForm(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSavePlan} className="btn-primary">Salvar</button>
        </div>
      </Modal>

      {/* Record Form Modal */}
      <Modal isOpen={showRecordForm} onClose={() => setShowRecordForm(false)} title="Registrar Manutencao" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Maquina" fieldType="select" value={recordForm.machineId} onChange={e => setRecordForm({...recordForm, machineId: (e.target as HTMLSelectElement).value})} options={machines.map(m => ({ value: m.id, label: m.name }))} />
          <FormField label="Tipo" fieldType="select" value={recordForm.type} onChange={e => setRecordForm({...recordForm, type: (e.target as HTMLSelectElement).value})} options={[
            { value: 'PREVENTIVE', label: 'Preventiva' },
            { value: 'CORRECTIVE', label: 'Corretiva' },
            { value: 'PREDICTIVE', label: 'Preditiva' },
          ]} />
          <FormField label="Data Agendada" type="date" value={recordForm.scheduledDate} onChange={e => setRecordForm({...recordForm, scheduledDate: (e.target as HTMLInputElement).value})} />
          <FormField label="Data Conclusao" type="date" value={recordForm.completedDate} onChange={e => setRecordForm({...recordForm, completedDate: (e.target as HTMLInputElement).value})} />
          <FormField label="Custo (R$)" type="number" placeholder="0,00" value={recordForm.cost} onChange={e => setRecordForm({...recordForm, cost: (e.target as HTMLInputElement).value})} />
          <FormField label="Status" fieldType="select" value={recordForm.status} onChange={e => setRecordForm({...recordForm, status: (e.target as HTMLSelectElement).value})} options={[
            { value: 'PENDING', label: 'Pendente' },
            { value: 'IN_PROGRESS', label: 'Em Andamento' },
            { value: 'COMPLETED', label: 'Concluida' },
          ]} />
        </div>
        <FormField label="Descricao" fieldType="textarea" placeholder="Descreva o servico realizado..." value={recordForm.description} onChange={e => setRecordForm({...recordForm, description: (e.target as HTMLTextAreaElement).value})} />
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowRecordForm(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSaveRecord} className="btn-primary">Salvar</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Item"
        message="Tem certeza que deseja excluir este item?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
