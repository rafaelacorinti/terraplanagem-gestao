import { useState } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import { employeeStorage, trainingStorage } from '../services/storage'
import { Employee, Training } from '../types'
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'

const roleLabel: Record<string, string> = {
  OPERATOR: 'Operador', MECHANIC: 'Mecanico', ENGINEER: 'Engenheiro', ADMIN_STAFF: 'Administrativo',
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(employeeStorage.getAll())
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showDetails, setShowDetails] = useState<Employee | null>(null)
  const [showTraining, setShowTraining] = useState(false)
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({ name: '', cpf: '', role: 'OPERATOR', phone: '', email: '', hireDate: '' })
  const [trainingForm, setTrainingForm] = useState({ name: '', date: '', validUntil: '', certificate: '' })

  const refreshEmployees = () => setEmployees(employeeStorage.getAll())

  const filtered = roleFilter ? employees.filter(e => e.role === roleFilter) : employees

  const openCreateForm = () => {
    setEditingEmployee(null)
    setFormData({ name: '', cpf: '', role: 'OPERATOR', phone: '', email: '', hireDate: '' })
    setShowForm(true)
  }

  const openEditForm = (emp: Employee) => {
    setEditingEmployee(emp)
    setFormData({ name: emp.name, cpf: emp.cpf, role: emp.role, phone: emp.phone || '', email: emp.email || '', hireDate: emp.hireDate })
    setShowForm(true)
  }

  const handleSave = () => {
    const data: Omit<Employee, 'id'> = {
      name: formData.name,
      cpf: formData.cpf,
      role: formData.role as Employee['role'],
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      hireDate: formData.hireDate,
      status: 'ACTIVE',
      companyId: '1',
    }
    if (editingEmployee) {
      employeeStorage.update(editingEmployee.id, data)
    } else {
      employeeStorage.create(data)
    }
    refreshEmployees()
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    employeeStorage.delete(id)
    refreshEmployees()
    setDeleteConfirm(null)
  }

  const handleAddTraining = () => {
    if (!showDetails) return
    trainingStorage.create({
      employeeId: showDetails.id,
      name: trainingForm.name,
      date: trainingForm.date,
      validUntil: trainingForm.validUntil || undefined,
      certificate: trainingForm.certificate || undefined,
    } as Omit<Training, 'id'>)
    setTrainingForm({ name: '', date: '', validUntil: '', certificate: '' })
    setShowTraining(false)
    setShowDetails({ ...showDetails })
  }

  const empTrainings = showDetails ? trainingStorage.getAll().filter(t => t.employeeId === showDetails.id) : []

  const columns = [
    { key: 'name', header: 'Nome', render: (e: Employee) => <span className="font-medium text-gray-900">{e.name}</span> },
    { key: 'cpf', header: 'CPF' },
    { key: 'role', header: 'Funcao', render: (e: Employee) => roleLabel[e.role] },
    { key: 'phone', header: 'Telefone', render: (e: Employee) => e.phone || '-' },
    { key: 'status', header: 'Status', render: (e: Employee) => (
      <Badge label={e.status === 'ACTIVE' ? 'Ativo' : 'Inativo'} variant={e.status === 'ACTIVE' ? 'green' : 'gray'} />
    )},
    { key: 'actions', header: '', sortable: false, render: (e: Employee) => (
      <div className="flex gap-1">
        <button onClick={(ev) => { ev.stopPropagation(); setShowDetails(e) }} className="p-1.5 hover:bg-gray-100 rounded"><FiEye className="w-4 h-4 text-gray-500" /></button>
        <button onClick={(ev) => { ev.stopPropagation(); openEditForm(e) }} className="p-1.5 hover:bg-gray-100 rounded"><FiEdit2 className="w-4 h-4 text-gray-500" /></button>
        <button onClick={(ev) => { ev.stopPropagation(); setDeleteConfirm(e.id) }} className="p-1.5 hover:bg-gray-100 rounded"><FiTrash2 className="w-4 h-4 text-red-500" /></button>
      </div>
    )},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
        <div className="flex gap-2">
          <select className="select-field w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">Todas as funcoes</option>
            {Object.entries(roleLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Novo Colaborador
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} onRowClick={(item) => setShowDetails(item as unknown as Employee)} />

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingEmployee ? 'Editar Colaborador' : 'Novo Colaborador'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome Completo" placeholder="Nome do colaborador" value={formData.name} onChange={e => setFormData({...formData, name: (e.target as HTMLInputElement).value})} />
          <FormField label="CPF" placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData({...formData, cpf: (e.target as HTMLInputElement).value})} />
          <FormField label="Funcao" fieldType="select" value={formData.role} onChange={e => setFormData({...formData, role: (e.target as HTMLSelectElement).value})} options={Object.entries(roleLabel).map(([k, v]) => ({ value: k, label: v }))} />
          <FormField label="Telefone" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: (e.target as HTMLInputElement).value})} />
          <FormField label="Email" type="email" placeholder="email@exemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: (e.target as HTMLInputElement).value})} />
          <FormField label="Data de Admissao" type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: (e.target as HTMLInputElement).value})} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">Salvar</button>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={!!showDetails} onClose={() => { setShowDetails(null); setShowTraining(false) }} title={showDetails?.name || ''} size="lg">
        {showDetails && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-xs text-gray-500">CPF</p><p className="text-sm font-medium">{showDetails.cpf}</p></div>
              <div><p className="text-xs text-gray-500">Funcao</p><p className="text-sm font-medium">{roleLabel[showDetails.role]}</p></div>
              <div><p className="text-xs text-gray-500">Telefone</p><p className="text-sm font-medium">{showDetails.phone || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{showDetails.email || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Admissao</p><p className="text-sm font-medium">{new Date(showDetails.hireDate).toLocaleDateString('pt-BR')}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><Badge label={showDetails.status === 'ACTIVE' ? 'Ativo' : 'Inativo'} variant={showDetails.status === 'ACTIVE' ? 'green' : 'gray'} /></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Treinamentos</h3>
                <button onClick={() => setShowTraining(!showTraining)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                  <FiPlus className="w-3 h-3" /> Novo Treinamento
                </button>
              </div>
              {showTraining && (
                <div className="bg-blue-50 rounded-lg p-4 mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Nome do Treinamento" placeholder="Ex: NR-11" value={trainingForm.name} onChange={e => setTrainingForm({...trainingForm, name: (e.target as HTMLInputElement).value})} />
                  <FormField label="Data" type="date" value={trainingForm.date} onChange={e => setTrainingForm({...trainingForm, date: (e.target as HTMLInputElement).value})} />
                  <FormField label="Validade" type="date" value={trainingForm.validUntil} onChange={e => setTrainingForm({...trainingForm, validUntil: (e.target as HTMLInputElement).value})} />
                  <FormField label="Certificado" placeholder="Numero do certificado" value={trainingForm.certificate} onChange={e => setTrainingForm({...trainingForm, certificate: (e.target as HTMLInputElement).value})} />
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <button onClick={() => setShowTraining(false)} className="btn-secondary text-xs">Cancelar</button>
                    <button onClick={handleAddTraining} className="btn-primary text-xs">Adicionar</button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {empTrainings.map((t: Training) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500">Data: {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      {t.validUntil && <p className="text-xs text-gray-500">Validade: {new Date(t.validUntil).toLocaleDateString('pt-BR')}</p>}
                      <Badge
                        label={t.validUntil && new Date(t.validUntil) > new Date() ? 'Valido' : 'Expirado'}
                        variant={t.validUntil && new Date(t.validUntil) > new Date() ? 'green' : 'red'}
                      />
                    </div>
                  </div>
                ))}
                {empTrainings.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum treinamento registrado</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Excluir Colaborador"
        message="Tem certeza que deseja excluir este colaborador? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
