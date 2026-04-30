import api from './api'
import { DailyProduction } from '../types'

export const productionService = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await api.get('/production', { params })
    return data as DailyProduction[]
  },
  create: async (production: Partial<DailyProduction>) => {
    const { data } = await api.post('/production', production)
    return data as DailyProduction
  },
  update: async (id: string, production: Partial<DailyProduction>) => {
    const { data } = await api.put(`/production/${id}`, production)
    return data as DailyProduction
  },
  delete: async (id: string) => {
    await api.delete(`/production/${id}`)
  },
}
