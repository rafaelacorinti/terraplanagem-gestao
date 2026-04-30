import { ReactNode } from 'react'
import { FiInbox } from 'react-icons/fi'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({
  title = 'Nenhum registro',
  message = 'Nenhum dado encontrado para exibir.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 text-5xl mb-4">{icon || <FiInbox />}</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
