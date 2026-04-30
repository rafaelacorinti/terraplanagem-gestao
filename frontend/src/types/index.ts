export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'
export type MachineType = 'EXCAVATOR' | 'BULLDOZER' | 'LOADER' | 'TRUCK' | 'GRADER' | 'ROLLER' | 'OTHER'
export type MachineStatus = 'AVAILABLE' | 'OPERATING' | 'MAINTENANCE' | 'INACTIVE'
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE'
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type FinancialType = 'PAYABLE' | 'RECEIVABLE'
export type FinancialStatus = 'PENDING' | 'PAID' | 'OVERDUE'
export type EmployeeRole = 'OPERATOR' | 'MECHANIC' | 'ENGINEER' | 'ADMIN_STAFF'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface Project {
  id: string
  name: string
  client: string
  location: string
  contractValue: number
  startDate: string
  endDate?: string
  status: ProjectStatus
  description?: string
  companyId: string
  measurements?: Measurement[]
  additives?: Additive[]
}

export interface Measurement {
  id: string
  projectId: string
  date: string
  description: string
  value: number
  approved: boolean
}

export interface Additive {
  id: string
  projectId: string
  date: string
  description: string
  value: number
  approved: boolean
}

export interface Machine {
  id: string
  name: string
  model: string
  manufacturer: string
  year: number
  patrimonyCode: string
  type: MachineType
  status: MachineStatus
  hourMeter: number
  odometer?: number
  companyId: string
}

export interface Employee {
  id: string
  name: string
  cpf: string
  role: EmployeeRole
  phone?: string
  email?: string
  hireDate: string
  status: string
  companyId: string
  trainings?: Training[]
}

export interface Training {
  id: string
  employeeId: string
  name: string
  date: string
  validUntil?: string
  certificate?: string
}

export interface FinancialEntry {
  id: string
  type: FinancialType
  description: string
  value: number
  dueDate: string
  paidDate?: string
  status: FinancialStatus
  projectId?: string
  category?: string
  project?: { name: string }
}

export interface MaintenancePlan {
  id: string
  machineId: string
  description: string
  intervalHours: number
  lastServiceHourMeter: number
  nextServiceHourMeter: number
  machine?: { name: string; hourMeter: number }
}

export interface MaintenanceRecord {
  id: string
  machineId: string
  planId?: string
  type: MaintenanceType
  status: MaintenanceStatus
  description: string
  scheduledDate: string
  completedDate?: string
  cost?: number
  machine?: { name: string; model: string }
}

export interface DailyProduction {
  id: string
  date: string
  machineId: string
  operatorId: string
  projectId: string
  hoursWorked: number
  serviceDescription: string
  volumeMoved?: number
  transportDistance?: number
  stoppageHours: number
  stoppageReason?: string
  machine?: { name: string }
  operator?: { name: string }
  project?: { name: string }
}

export interface Fueling {
  id: string
  machineId: string
  date: string
  liters: number
  pricePerLiter: number
  totalCost: number
  hourMeter: number
  operatorId?: string
  machine?: { name: string }
  operator?: { name: string }
}

export interface CashFlowEntry {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface DREEntry {
  category: string
  value: number
}

export interface Alert {
  id: string
  type: 'maintenance' | 'financial' | 'fuel'
  title: string
  description: string
  severity: 'info' | 'warning' | 'danger'
  date: string
}


export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AccessRequest {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  reason: string
  password: string
  status: AccessRequestStatus
  requestDate: string
  approvedDate?: string
  approvedBy?: string
}
