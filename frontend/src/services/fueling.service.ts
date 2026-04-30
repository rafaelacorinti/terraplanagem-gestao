import api from './api'
import { Fueling } from '../types'

export const fuelingService = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await api.get('/fueling', { params })
    return data as Fueling[]
  },
  create: async (fueling: Partial<Fueling>) => {
    const { data } = await api.post('/fueling', fueling)
    return data as Fueling
  },
  getConsumptionReport: async (params?: Record<string, string>) => {
    const { data } = await api.get('/fueling/report', { params })
    return data
  },
}
