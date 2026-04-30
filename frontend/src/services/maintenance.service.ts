import api from './api'
import { MaintenancePlan, MaintenanceRecord } from '../types'

export const maintenanceService = {
  getPlans: async () => {
    const { data } = await api.get('/maintenance/plans')
    return data as MaintenancePlan[]
  },
  createPlan: async (plan: Partial<MaintenancePlan>) => {
    const { data } = await api.post('/maintenance/plans', plan)
    return data as MaintenancePlan
  },
  updatePlan: async (id: string, plan: Partial<MaintenancePlan>) => {
    const { data } = await api.put(`/maintenance/plans/${id}`, plan)
    return data as MaintenancePlan
  },
  getRecords: async (params?: Record<string, string>) => {
    const { data } = await api.get('/maintenance/records', { params })
    return data as MaintenanceRecord[]
  },
  createRecord: async (record: Partial<MaintenanceRecord>) => {
    const { data } = await api.post('/maintenance/records', record)
    return data as MaintenanceRecord
  },
  updateRecord: async (id: string, record: Partial<MaintenanceRecord>) => {
    const { data } = await api.put(`/maintenance/records/${id}`, record)
    return data as MaintenanceRecord
  },
}
