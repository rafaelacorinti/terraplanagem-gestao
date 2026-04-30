import {
  Project, Machine, Employee, FinancialEntry, MaintenancePlan,
  MaintenanceRecord, DailyProduction, Fueling, Measurement, Additive, Training,
  AccessRequest
} from '../types'
import {
  mockProjects, mockMachines, mockEmployees, mockFinancialEntries,
  mockMaintenancePlans, mockMaintenanceRecords, mockProductions,
  mockFuelings, mockMeasurements, mockAdditives, mockTrainings
} from '../data/mockData'

const KEYS = {
  projects: 'terra_projects',
  machines: 'terra_machines',
  employees: 'terra_employees',
  financialEntries: 'terra_financial_entries',
  maintenancePlans: 'terra_maintenance_plans',
  maintenanceRecords: 'terra_maintenance_records',
  productions: 'terra_productions',
  fuelings: 'terra_fuelings',
  measurements: 'terra_measurements',
  additives: 'terra_additives',
  trainings: 'terra_trainings',
  accessRequests: 'terra_access_requests',
} as const

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function getFromStorage<T>(key: string, defaultData: T[]): T[] {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // If parse fails, use default
  }
  localStorage.setItem(key, JSON.stringify(defaultData))
  return defaultData
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function createCRUD<T extends { id: string }>(key: string, defaultData: T[]) {
  return {
    getAll(): T[] {
      return getFromStorage<T>(key, defaultData)
    },
    getById(id: string): T | undefined {
      const items = getFromStorage<T>(key, defaultData)
      return items.find(item => item.id === id)
    },
    create(item: Omit<T, 'id'>): T {
      const items = getFromStorage<T>(key, defaultData)
      const newItem = { ...item, id: generateId() } as T
      items.push(newItem)
      saveToStorage(key, items)
      return newItem
    },
    update(id: string, updates: Partial<T>): T | undefined {
      const items = getFromStorage<T>(key, defaultData)
      const index = items.findIndex(item => item.id === id)
      if (index === -1) return undefined
      items[index] = { ...items[index], ...updates, id }
      saveToStorage(key, items)
      return items[index]
    },
    delete(id: string): boolean {
      const items = getFromStorage<T>(key, defaultData)
      const filtered = items.filter(item => item.id !== id)
      if (filtered.length === items.length) return false
      saveToStorage(key, filtered)
      return true
    },
    setAll(items: T[]): void {
      saveToStorage(key, items)
    }
  }
}

export const projectStorage = createCRUD<Project>(KEYS.projects, mockProjects)
export const machineStorage = createCRUD<Machine>(KEYS.machines, mockMachines)
export const employeeStorage = createCRUD<Employee>(KEYS.employees, mockEmployees)
export const financialStorage = createCRUD<FinancialEntry>(KEYS.financialEntries, mockFinancialEntries)
export const maintenancePlanStorage = createCRUD<MaintenancePlan>(KEYS.maintenancePlans, mockMaintenancePlans)
export const maintenanceRecordStorage = createCRUD<MaintenanceRecord>(KEYS.maintenanceRecords, mockMaintenanceRecords)
export const productionStorage = createCRUD<DailyProduction>(KEYS.productions, mockProductions)
export const fuelingStorage = createCRUD<Fueling>(KEYS.fuelings, mockFuelings)
export const measurementStorage = createCRUD<Measurement>(KEYS.measurements, mockMeasurements)
export const additiveStorage = createCRUD<Additive>(KEYS.additives, mockAdditives)
export const trainingStorage = createCRUD<Training>(KEYS.trainings, mockTrainings)
export const accessRequestStorage = createCRUD<AccessRequest>(KEYS.accessRequests, [])
