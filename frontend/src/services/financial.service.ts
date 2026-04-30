import api from './api'
import { FinancialEntry, CashFlowEntry, DREEntry } from '../types'

export const financialService = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await api.get('/financial', { params })
    return data as FinancialEntry[]
  },
  create: async (entry: Partial<FinancialEntry>) => {
    const { data } = await api.post('/financial', entry)
    return data as FinancialEntry
  },
  update: async (id: string, entry: Partial<FinancialEntry>) => {
    const { data } = await api.put(`/financial/${id}`, entry)
    return data as FinancialEntry
  },
  delete: async (id: string) => {
    await api.delete(`/financial/${id}`)
  },
  getCashFlow: async (params?: Record<string, string>) => {
    const { data } = await api.get('/financial/cash-flow', { params })
    return data as CashFlowEntry[]
  },
  getDRE: async (projectId?: string) => {
    const params = projectId ? { projectId } : {}
    const { data } = await api.get('/financial/dre', { params })
    return data as DREEntry[]
  },
  getSummary: async () => {
    const { data } = await api.get('/financial/summary')
    return data
  },
}
