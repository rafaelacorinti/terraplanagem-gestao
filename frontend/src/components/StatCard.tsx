import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: { value: number; positive: boolean }
  color?: string
}

export default function StatCard({ title, value, icon, trend, color = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '+' : ''}{trend.value}% vs. mês anterior
            </p>
          )}
        </div>
        {icon && (
          <div className="text-3xl text-gray-300">{icon}</div>
        )}
      </div>
    </div>
  )
}
