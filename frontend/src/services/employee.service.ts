import api from './api'
import { Employee, Training } from '../types'

export const employeeService = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await api.get('/employees', { params })
    return data as Employee[]
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/employees/${id}`)
    return data as Employee
  },
  create: async (employee: Partial<Employee>) => {
    const { data } = await api.post('/employees', employee)
    return data as Employee
  },
  update: async (id: string, employee: Partial<Employee>) => {
    const { data } = await api.put(`/employees/${id}`, employee)
    return data as Employee
  },
  delete: async (id: string) => {
    await api.delete(`/employees/${id}`)
  },
  getTrainings: async (employeeId: string) => {
    const { data } = await api.get(`/employees/${employeeId}/trainings`)
    return data as Training[]
  },
  addTraining: async (employeeId: string, training: Partial<Training>) => {
    const { data } = await api.post(`/employees/${employeeId}/trainings`, training)
    return data as Training
  },
}
