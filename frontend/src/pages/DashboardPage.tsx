import { FiDollarSign, FiTrendingDown, FiTrendingUp, FiTruck, FiTool, FiDroplet } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import StatCard from '../components/StatCard'
import AlertCard from '../components/AlertCard'
import { machineStorage, fuelingStorage, financialStorage, maintenancePlanStorage } from '../services/storage'
import { mockDashboardData } from '../data/mockData'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function DashboardPage() {
  const machines = machineStorage.getAll()
  const fuelings = fuelingStorage.getAll()
  const financials = financialStorage.getAll()
  const plans = maintenancePlanStorage.getAll()

  const machinesOperating = machines.filter(m => m.status === 'OPERATING').length
  const machinesMaintenance = machines.filter(m => m.status === 'MAINTENANCE').length
  const totalFuelLiters = fuelings.reduce((s, f) => s + f.liters, 0)

  const receivables = financials.filter(e => e.type === 'RECEIVABLE')
  const payables = financials.filter(e => e.type === 'PAYABLE')
  const totalRevenue = receivables.reduce((s, e) => s + e.value, 0)
  const totalCosts = payables.reduce((s, e) => s + e.value, 0)
  const totalProfit = totalRevenue - totalCosts

  // Alerts
  const alerts: { id: string; title: string; description: string; severity: 'info' | 'warning' | 'danger' }[] = []

  // Overdue maintenance
  plans.forEach(p => {
    if (p.machine && p.machine.hourMeter >= p.nextServiceHourMeter) {
      alerts.push({ id: `maint-${p.id}`, title: 'Manutencao Vencida', description: `${p.machine.name} - ${p.description} (${p.machine.hourMeter}h / limite ${p.nextServiceHourMeter}h)`, severity: 'danger' })
    }
  })

  // Overdue financials
  financials.filter(e => e.status === 'OVERDUE').forEach(e => {
    alerts.push({ id: `fin-${e.id}`, title: 'Conta Vencida', description: `${e.description} - ${fmt(e.value)}`, severity: 'danger' })
  })

  const revenueVsCosts = mockDashboardData.revenueVsCosts
  const profitByProject = mockDashboardData.profitByProject

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard title="Faturamento Total" value={fmt(totalRevenue)} icon={<FiTrendingUp />} color="text-green-600" />
        <StatCard title="Custos Totais" value={fmt(totalCosts)} icon={<FiTrendingDown />} color="text-red-600" />
        <StatCard title="Lucro" value={fmt(totalProfit)} icon={<FiDollarSign />} color="text-blue-600" />
        <StatCard title="Em Operacao" value={`${machinesOperating} maquinas`} icon={<FiTruck />} color="text-primary-600" />
        <StatCard title="Em Manutencao" value={`${machinesMaintenance} maquinas`} icon={<FiTool />} color="text-yellow-600" />
        <StatCard title="Combustivel" value={`${totalFuelLiters.toLocaleString('pt-BR')} L`} icon={<FiDroplet />} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Faturamento x Custos (Ultimos 6 meses)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueVsCosts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => fmt(Number(value))} />
              <Legend />
              <Bar dataKey="faturamento" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="custos" name="Custos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Alertas Importantes</h2>
          <div className="space-y-3">
            {alerts.length > 0 ? alerts.slice(0, 5).map(alert => (
              <AlertCard key={alert.id} title={alert.title} description={alert.description} severity={alert.severity} />
            )) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum alerta no momento</p>
            )}
          </div>
        </div>
      </div>

      {/* Profit by Project */}
      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Lucro por Obra</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Obra</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Receita</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Custos</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Lucro</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profitByProject.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 text-sm">{p.project}</td>
                  <td className="px-5 py-3 text-sm text-green-600">{fmt(p.revenue)}</td>
                  <td className="px-5 py-3 text-sm text-red-600">{fmt(p.costs)}</td>
                  <td className="px-5 py-3 text-sm font-medium text-blue-600">{fmt(p.profit)}</td>
                  <td className="px-5 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.profit / p.revenue > 0.2 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {((p.profit / p.revenue) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

