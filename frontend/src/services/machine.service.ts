import api from './api'
import { Machine } from '../types'

export const machineService = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await api.get('/machines', { params })
    return data as Machine[]
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/machines/${id}`)
    return data as Machine
  },
  create: async (machine: Partial<Machine>) => {
    const { data } = await api.post('/machines', machine)
    return data as Machine
  },
  update: async (id: string, machine: Partial<Machine>) => {
    const { data } = await api.put(`/machines/${id}`, machine)
    return data as Machine
  },
  delete: async (id: string) => {
    await api.delete(`/machines/${id}`)
  },
  updateHourMeter: async (id: string, hourMeter: number) => {
    const { data } = await api.patch(`/machines/${id}/hour-meter`, { hourMeter })
    return data as Machine
  },
}
