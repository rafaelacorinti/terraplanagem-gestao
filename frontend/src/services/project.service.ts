import api from './api'
import { Project, Measurement, Additive } from '../types'

export const projectService = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await api.get('/projects', { params })
    return data as Project[]
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/projects/${id}`)
    return data as Project
  },
  create: async (project: Partial<Project>) => {
    const { data } = await api.post('/projects', project)
    return data as Project
  },
  update: async (id: string, project: Partial<Project>) => {
    const { data } = await api.put(`/projects/${id}`, project)
    return data as Project
  },
  delete: async (id: string) => {
    await api.delete(`/projects/${id}`)
  },
  getMeasurements: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/measurements`)
    return data as Measurement[]
  },
  addMeasurement: async (projectId: string, measurement: Partial<Measurement>) => {
    const { data } = await api.post(`/projects/${projectId}/measurements`, measurement)
    return data as Measurement
  },
  getAdditives: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/additives`)
    return data as Additive[]
  },
  addAdditive: async (projectId: string, additive: Partial<Additive>) => {
    const { data } = await api.post(`/projects/${projectId}/additives`, additive)
    return data as Additive
  },
}
