import { useState } from 'react'
import { FiCheck, FiX, FiClock, FiUser, FiMail, FiPhone, FiBriefcase, FiFileText, FiFilter } from 'react-icons/fi'
import { accessRequestStorage } from '../services/storage'
import { AccessRequest, AccessRequestStatus } from '../types'

const STATUS_LABELS: Record<AccessRequestStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}

const STATUS_STYLES: Record<AccessRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export default function AccessRequestsPage() {
  const [filter, setFilter] = useState<AccessRequestStatus | 'ALL'>('ALL')
  const [requests, setRequests] = useState<AccessRequest[]>(() => accessRequestStorage.getAll())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const refresh = () => setRequests(accessRequestStorage.getAll())

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter)

  const pendingCount = requests.filter(r => r.status === 'PENDING').length

  const handleApprove = (id: string) => {
    accessRequestStorage.update(id, {
      status: 'APPROVED',
      approvedDate: new Date().toISOString(),
      approvedBy: 'admin@terra.com',
    })
    refresh()
  }

  const handleReject = (id: string) => {
    accessRequestStorage.update(id, {
      status: 'REJECTED',
      approvedDate: new Date().toISOString(),
      approvedBy: 'admin@terra.com',
    })
    refresh()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja excluir esta solicitação?')) {
      accessRequestStorage.delete(id)
      refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitações de Acesso</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie os pedidos de cadastro no sistema
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                <FiClock className="w-3 h-3" />
                {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <FiFilter className="w-4 h-4 text-gray-400" />
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? 'Todas' : STATUS_LABELS[f]}
            {f === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma solicitação encontrada</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'ALL' ? 'Não há solicitações de acesso ainda.' : `Não há solicitações com status "${STATUS_LABELS[filter as AccessRequestStatus]}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-bold text-sm flex-shrink-0">
                      {req.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{req.name}</p>
                      <p className="text-sm text-gray-500">{req.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(req.requestDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === req.id && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{req.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiBriefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{req.company || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{req.email}</span>
                    </div>
                    {req.reason && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
                        <FiFileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{req.reason}</span>
                      </div>
                    )}
                    {req.approvedDate && (
                      <div className="text-xs text-gray-400 sm:col-span-2">
                        {req.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'} em{' '}
                        {new Date(req.approvedDate).toLocaleDateString('pt-BR')} por {req.approvedBy}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiCheck className="w-4 h-4" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </>
                    )}
                    {req.status === 'APPROVED' && (
                      <button
                        onClick={() => handleReject(req.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        Revogar acesso
                      </button>
                    )}
                    {req.status === 'REJECTED' && (
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <FiCheck className="w-4 h-4" />
                        Aprovar mesmo assim
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
