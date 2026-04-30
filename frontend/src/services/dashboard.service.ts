import api from './api'

export const dashboardService = {
  getKPIs: async () => {
    const { data } = await api.get('/dashboard/kpis')
    return data
  },
  getAlerts: async () => {
    const { data } = await api.get('/dashboard/alerts')
    return data
  },
  getRevenueVsCosts: async () => {
    const { data } = await api.get('/dashboard/revenue-costs')
    return data
  },
}
