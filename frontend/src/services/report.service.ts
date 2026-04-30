import api from './api'

export const reportService = {
  getProfitabilityByProject: async (params?: Record<string, string>) => {
    const { data } = await api.get('/reports/profitability', { params })
    return data
  },
  getCostByEquipment: async (params?: Record<string, string>) => {
    const { data } = await api.get('/reports/equipment-cost', { params })
    return data
  },
  getFuelConsumption: async (params?: Record<string, string>) => {
    const { data } = await api.get('/reports/fuel-consumption', { params })
    return data
  },
  getFinancialIndicators: async (params?: Record<string, string>) => {
    const { data } = await api.get('/reports/financial-indicators', { params })
    return data
  },
}
