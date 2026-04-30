import { useState } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import { projectStorage, measurementStorage, additiveStorage } from '../services/storage'
import { Project, Measurement, Additive } from '../types'
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'

const statusMap: Record<string, { label: string; variant: 'blue' | 'green' | 'yellow' | 'gray' }> = {
  PLANNING: { label: 'Planejamento', variant: 'blue' },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'green' },
  PAUSED: { label: 'Pausada', variant: 'yellow' },
  COMPLETED: { label: 'Concluida', variant: 'gray' },
}

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(projectStorage.getAll())
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showDetails, setShowDetails] = useState<Project | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showMeasurement, setShowMeasurement] = useState(false)
  const [showAdditive, setShowAdditive] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({ name: '', client: '', location: '', contractValue: '', startDate: '', endDate: '', status: 'PLANNING', description: '' })
  const [measurementForm, setMeasurementForm] = useState({ date: '', value: '', description: '' })
  const [additiveForm, setAdditiveForm] = useState({ date: '', value: '', description: '' })

  const filtered = statusFilter ? projects.filter(p => p.status === statusFilter) : projects

  const refreshProjects = () => setProjects(projectStorage.getAll())

  const openCreateForm = () => {
    setEditingProject(null)
    setFormData({ name: '', client: '', location: '', contractValue: '', startDate: '', endDate: '', status: 'PLANNING', description: '' })
    setShowForm(true)
  }

  const openEditForm = (p: Project) => {
    setEditingProject(p)
    setFormData({ name: p.name, client: p.client, location: p.location, contractValue: p.contractValue.toString(), startDate: p.startDate, endDate: p.endDate || '', status: p.status, description: p.description || '' })
    setShowForm(true)
  }

  const handleSave = () => {
    const data: Omit<Project, 'id'> = {
      name: formData.name,
      client: formData.client,
      location: formData.location,
      contractValue: parseFloat(formData.contractValue) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      status: formData.status as Project['status'],
      description: formData.description || undefined,
      companyId: '1',
    }
    if (editingProject) {
      projectStorage.update(editingProject.id, data)
    } else {
      projectStorage.create(data)
    }
    refreshProjects()
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    projectStorage.delete(id)
    refreshProjects()
    setDeleteConfirm(null)
  }

  const handleAddMeasurement = () => {
    if (!showDetails) return
    measurementStorage.create({
      projectId: showDetails.id,
      date: measurementForm.date,
      value: parseFloat(measurementForm.value) || 0,
      description: measurementForm.description,
      approved: false,
    } as Omit<Measurement, 'id'>)
    setMeasurementForm({ date: '', value: '', description: '' })
    setShowMeasurement(false)
    setShowDetails({ ...showDetails })
  }

  const handleAddAdditive = () => {
    if (!showDetails) return
    additiveStorage.create({
      projectId: showDetails.id,
      date: additiveForm.date,
      value: parseFloat(additiveForm.value) || 0,
      description: additiveForm.description,
      approved: false,
    } as Omit<Additive, 'id'>)
    setAdditiveForm({ date: '', value: '', description: '' })
    setShowAdditive(false)
    setShowDetails({ ...showDetails })
  }

  const projectMeasurements = showDetails ? measurementStorage.getAll().filter(m => m.projectId === showDetails.id) : []
  const projectAdditives = showDetails ? additiveStorage.getAll().filter(a => a.projectId === showDetails.id) : []
  const totalMeasured = projectMeasurements.reduce((s, m) => s + m.value, 0)
  const totalAdditives = projectAdditives.reduce((s, a) => s + a.value, 0)

  const columns = [
    { key: 'name', header: 'Nome', render: (p: Project) => <span className="font-medium text-gray-900">{p.name}</span> },
    { key: 'client', header: 'Cliente' },
    { key: 'location', header: 'Local' },
    { key: 'contractValue', header: 'Contrato', render: (p: Project) => fmt(p.contractValue) },
    { key: 'status', header: 'Status', render: (p: Project) => {
      const s = statusMap[p.status]
      return s ? <Badge label={s.label} variant={s.variant} /> : null
    }},
    { key: 'actions', header: '', sortable: false, render: (p: Project) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetails(p) }} className="p-1.5 hover:bg-gray-100 rounded" title="Ver detalhes">
          <FiEye className="w-4 h-4 text-gray-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); openEditForm(p) }} className="p-1.5 hover:bg-gray-100 rounded" title="Editar">
          <FiEdit2 className="w-4 h-4 text-gray-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id) }} className="p-1.5 hover:bg-gray-100 rounded" title="Excluir">
          <FiTrash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    )},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
        <div className="flex gap-2">
          <select className="select-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="PLANNING">Planejamento</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="PAUSED">Pausada</option>
            <option value="COMPLETED">Concluida</option>
          </select>
          <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Nova Obra
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} onRowClick={(item) => setShowDetails(item as unknown as Project)} />

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingProject ? 'Editar Obra' : 'Nova Obra'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome da Obra" placeholder="Ex: Terraplanagem Loteamento" value={formData.name} onChange={e => setFormData({...formData, name: (e.target as HTMLInputElement).value})} />
          <FormField label="Cliente" placeholder="Nome do cliente" value={formData.client} onChange={e => setFormData({...formData, client: (e.target as HTMLInputElement).value})} />
          <FormField label="Local" placeholder="Cidade - UF" value={formData.location} onChange={e => setFormData({...formData, location: (e.target as HTMLInputElement).value})} />
          <FormField label="Valor do Contrato" type="number" placeholder="0,00" value={formData.contractValue} onChange={e => setFormData({...formData, contractValue: (e.target as HTMLInputElement).value})} />
          <FormField label="Data de Inicio" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: (e.target as HTMLInputElement).value})} />
          <FormField label="Data de Termino" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: (e.target as HTMLInputElement).value})} />
          <FormField label="Status" fieldType="select" value={formData.status} onChange={e => setFormData({...formData, status: (e.target as HTMLSelectElement).value})} options={[
            { value: 'PLANNING', label: 'Planejamento' },
            { value: 'IN_PROGRESS', label: 'Em Andamento' },
            { value: 'PAUSED', label: 'Pausada' },
            { value: 'COMPLETED', label: 'Concluida' },
          ]} />
        </div>
        <FormField label="Descricao" fieldType="textarea" placeholder="Descricao do servico..." value={formData.description} onChange={e => setFormData({...formData, description: (e.target as HTMLTextAreaElement).value})} />
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">Salvar</button>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={!!showDetails} onClose={() => { setShowDetails(null); setShowMeasurement(false); setShowAdditive(false) }} title={showDetails?.name || ''} size="xl">
        {showDetails && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Cliente</p><p className="text-sm font-medium">{showDetails.client}</p></div>
              <div><p className="text-xs text-gray-500">Local</p><p className="text-sm font-medium">{showDetails.location}</p></div>
              <div><p className="text-xs text-gray-500">Contrato</p><p className="text-sm font-medium text-green-600">{fmt(showDetails.contractValue)}</p></div>
              <div><p className="text-xs text-gray-500">Status</p>{statusMap[showDetails.status] && <Badge label={statusMap[showDetails.status].label} variant={statusMap[showDetails.status].variant} />}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Resumo Financeiro</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><p className="text-gray-500">Valor Contrato</p><p className="font-bold text-gray-900">{fmt(showDetails.contractValue)}</p></div>
                <div><p className="text-gray-500">Total Medido</p><p className="font-bold text-blue-600">{fmt(totalMeasured)}</p></div>
                <div><p className="text-gray-500">Total Aditivos</p><p className="font-bold text-orange-600">{fmt(totalAdditives)}</p></div>
                <div><p className="text-gray-500">Saldo</p><p className="font-bold text-green-600">{fmt(showDetails.contractValue + totalAdditives - totalMeasured)}</p></div>
              </div>
            </div>

            {/* Measurements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Medicoes</h3>
                <button onClick={() => setShowMeasurement(!showMeasurement)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                  <FiPlus className="w-3 h-3" /> Nova Medicao
                </button>
              </div>
              {showMeasurement && (
                <div className="bg-blue-50 rounded-lg p-4 mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Data" type="date" value={measurementForm.date} onChange={e => setMeasurementForm({...measurementForm, date: (e.target as HTMLInputElement).value})} />
                  <FormField label="Valor" type="number" placeholder="0,00" value={measurementForm.value} onChange={e => setMeasurementForm({...measurementForm, value: (e.target as HTMLInputElement).value})} />
                  <FormField label="Descricao" placeholder="Descricao da medicao" value={measurementForm.description} onChange={e => setMeasurementForm({...measurementForm, description: (e.target as HTMLInputElement).value})} />
                  <div className="md:col-span-3 flex justify-end gap-2">
                    <button onClick={() => setShowMeasurement(false)} className="btn-secondary text-xs">Cancelar</button>
                    <button onClick={handleAddMeasurement} className="btn-primary text-xs">Adicionar</button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {projectMeasurements.map((m: Measurement) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{m.description}</p>
                      <p className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{fmt(m.value)}</p>
                      <Badge label={m.approved ? 'Aprovada' : 'Pendente'} variant={m.approved ? 'green' : 'yellow'} />
                    </div>
                  </div>
                ))}
                {projectMeasurements.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhuma medicao registrada</p>}
              </div>
            </div>

            {/* Additives */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Aditivos</h3>
                <button onClick={() => setShowAdditive(!showAdditive)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                  <FiPlus className="w-3 h-3" /> Novo Aditivo
                </button>
              </div>
              {showAdditive && (
                <div className="bg-orange-50 rounded-lg p-4 mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Data" type="date" value={additiveForm.date} onChange={e => setAdditiveForm({...additiveForm, date: (e.target as HTMLInputElement).value})} />
                  <FormField label="Valor" type="number" placeholder="0,00" value={additiveForm.value} onChange={e => setAdditiveForm({...additiveForm, value: (e.target as HTMLInputElement).value})} />
                  <FormField label="Descricao" placeholder="Descricao do aditivo" value={additiveForm.description} onChange={e => setAdditiveForm({...additiveForm, description: (e.target as HTMLInputElement).value})} />
                  <div className="md:col-span-3 flex justify-end gap-2">
                    <button onClick={() => setShowAdditive(false)} className="btn-secondary text-xs">Cancelar</button>
                    <button onClick={handleAddAdditive} className="btn-primary text-xs">Adicionar</button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {projectAdditives.map((a: Additive) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{a.description}</p>
                      <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{fmt(a.value)}</p>
                      <Badge label={a.approved ? 'Aprovado' : 'Pendente'} variant={a.approved ? 'green' : 'yellow'} />
                    </div>
                  </div>
                ))}
                {projectAdditives.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum aditivo registrado</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Excluir Obra"
        message="Tem certeza que deseja excluir esta obra? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
