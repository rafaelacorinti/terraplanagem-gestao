import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { mockDashboardData, mockMachines, mockFuelings, mockFinancialEntries, mockCashFlow } from '../data/mockData'
import { FiDownload, FiPrinter } from 'react-icons/fi'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<'profitability' | 'equipment' | 'fuel' | 'financial'>('profitability')

  const profitData = mockDashboardData.profitByProject

  const equipmentCosts = mockMachines.slice(0, 6).map(m => {
    const fuelCost = mockFuelings.filter(f => f.machineId === m.id).reduce((s, f) => s + f.totalCost, 0)
    const maintenanceCost = m.id === '1' ? 2800 : m.id === '2' ? 4500 : m.id === '4' ? 12500 : 0
    return {
      name: m.name.split(' ').slice(0, 2).join(' '),
      combustivel: fuelCost,
      manutencao: maintenanceCost,
      total: fuelCost + maintenanceCost,
    }
  }).filter(e => e.total > 0)

  const fuelData = mockMachines.map(m => {
    const mFuelings = mockFuelings.filter(f => f.machineId === m.id)
    const totalLiters = mFuelings.reduce((s, f) => s + f.liters, 0)
    return { name: m.name.split(' ').slice(0, 2).join(' '), litros: totalLiters }
  }).filter(f => f.litros > 0)

  const receivables = mockFinancialEntries.filter(e => e.type === 'RECEIVABLE')
  const payables = mockFinancialEntries.filter(e => e.type === 'PAYABLE')
  const totalReceivable = receivables.reduce((s, e) => s + e.value, 0)
  const totalPayable = payables.reduce((s, e) => s + e.value, 0)
  const financialPie = [
    { name: 'A Receber', value: totalReceivable },
    { name: 'A Pagar', value: totalPayable },
  ]

  const handleExportPDF = () => { window.print() }

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(profitData.map(p => ({
      Obra: p.project,
      Receita: p.revenue,
      Custos: p.costs,
      Lucro: p.profit,
      'Margem (%)': ((p.profit / p.revenue) * 100).toFixed(1),
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rentabilidade')
    XLSX.writeFile(wb, 'relatorio.xlsx')
  }

  const reports = [
    { key: 'profitability' as const, label: 'Rentabilidade por Obra' },
    { key: 'equipment' as const, label: 'Custo por Equipamento' },
    { key: 'fuel' as const, label: 'Consumo Combustível' },
    { key: 'financial' as const, label: 'Indicadores Financeiros' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
            <FiDownload className="w-4 h-4" /> Exportar Excel
          </button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2">
            <FiPrinter className="w-4 h-4" /> Imprimir PDF
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-3 mb-6">
        <div>
          <label className="text-xs text-gray-500">De</label>
          <input type="date" className="input-field" defaultValue="2024-01-01" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Até</label>
          <input type="date" className="input-field" defaultValue="2024-06-30" />
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {reports.map(r => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeReport === r.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Profitability Report */}
      {activeReport === 'profitability' && (
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Rentabilidade por Obra</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => fmt(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" name="Custos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Lucro" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Obra</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Receita</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Custos</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Lucro</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {profitData.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-sm">{p.project}</td>
                    <td className="px-5 py-3 text-sm text-green-600">{fmt(p.revenue)}</td>
                    <td className="px-5 py-3 text-sm text-red-600">{fmt(p.costs)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-blue-600">{fmt(p.profit)}</td>
                    <td className="px-5 py-3 text-sm">{((p.profit / p.revenue) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Cost Report */}
      {activeReport === 'equipment' && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Custo por Equipamento</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={equipmentCosts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip formatter={(value) => fmt(Number(value))} />
              <Legend />
              <Bar dataKey="combustivel" name="Combustível" fill="#f59e0b" stackId="a" />
              <Bar dataKey="manutencao" name="Manutenção" fill="#3b82f6" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Fuel Consumption Report */}
      {activeReport === 'fuel' && (
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Consumo de Combustível por Máquina</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value)}L`} />
                <Bar dataKey="litros" name="Litros" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Financial Indicators Report */}
      {activeReport === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Distribuição Financeira</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={financialPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {financialPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(value) => fmt(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Evolução Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockCashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => fmt(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Entradas" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" name="Saídas" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="balance" name="Saldo" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5 lg:col-span-2">
            <h2 className="font-semibold text-gray-700 mb-4">Resumo Financeiro</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600">Total a Receber</p>
                <p className="text-xl font-bold text-green-700">{fmt(totalReceivable)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-red-600">Total a Pagar</p>
                <p className="text-xl font-bold text-red-700">{fmt(totalPayable)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600">Saldo Previsto</p>
                <p className="text-xl font-bold text-blue-700">{fmt(totalReceivable - totalPayable)}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs text-yellow-600">Margem Geral</p>
                <p className="text-xl font-bold text-yellow-700">
                  {((totalReceivable - totalPayable) / totalReceivable * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
