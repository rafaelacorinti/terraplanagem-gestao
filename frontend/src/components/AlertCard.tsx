import { FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi'

interface AlertCardProps {
  title: string
  description: string
  severity: 'info' | 'warning' | 'danger'
}

const severityConfig = {
  info: { bg: 'bg-blue-50 border-blue-200', icon: FiInfo, color: 'text-blue-600' },
  warning: { bg: 'bg-yellow-50 border-yellow-200', icon: FiAlertTriangle, color: 'text-yellow-600' },
  danger: { bg: 'bg-red-50 border-red-200', icon: FiAlertCircle, color: 'text-red-600' },
}

export default function AlertCard({ title, description, severity }: AlertCardProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${config.bg}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
      <div>
        <p className={`text-sm font-medium ${config.color}`}>{title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  )
}
