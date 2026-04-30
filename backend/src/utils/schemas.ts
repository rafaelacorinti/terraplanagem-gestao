import { z } from 'zod';

// -- Auth --
export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Senha obrigatoria'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']).optional(),
});

// -- Company --
export const companySchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().min(14, 'CNPJ invalido'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

// -- Project --
export const projectSchema = z.object({
  name: z.string().min(2),
  client: z.string().min(2),
  location: z.string().min(2),
  contractValue: z.coerce.number().nonnegative(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED']).optional(),
  description: z.string().optional(),
  companyId: z.string().cuid('companyId invalido'),
});

export const measurementSchema = z.object({
  period: z.string().min(1),
  value: z.coerce.number().positive(),
  status: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

export const additiveSchema = z.object({
  description: z.string().min(2),
  value: z.coerce.number(),
  date: z.coerce.date(),
});

// -- Machine --
export const machineSchema = z.object({
  name: z.string().min(2),
  model: z.string().min(1),
  manufacturer: z.string().min(1),
  year: z.coerce.number().int().min(1900).max(2100),
  patrimonyCode: z.string().min(1),
  type: z.enum(['EXCAVATOR', 'BULLDOZER', 'LOADER', 'TRUCK', 'GRADER', 'ROLLER', 'OTHER']),
  status: z.enum(['AVAILABLE', 'OPERATING', 'MAINTENANCE', 'INACTIVE']).optional(),
  hourMeter: z.coerce.number().nonnegative().optional(),
  odometer: z.coerce.number().nonnegative().optional(),
  companyId: z.string().cuid(),
});

export const machineDocumentSchema = z.object({
  type: z.string().min(1),
  number: z.string().min(1),
  expiryDate: z.coerce.date().optional(),
  fileUrl: z.string().url().optional().or(z.literal('')),
});

// -- Employee --
export const employeeSchema = z.object({
  name: z.string().min(2),
  cpf: z.string().min(11, 'CPF invalido'),
  role: z.enum(['OPERATOR', 'MECHANIC', 'ENGINEER', 'ADMIN_STAFF']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  hireDate: z.coerce.date(),
  status: z.string().optional(),
  companyId: z.string().cuid(),
});

export const trainingSchema = z.object({
  name: z.string().min(2),
  date: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  certificate: z.string().optional(),
});

// -- Maintenance --
export const maintenanceOrderSchema = z.object({
  machineId: z.string().cuid(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE']),
  description: z.string().min(5),
  scheduledDate: z.coerce.date(),
  cost: z.coerce.number().nonnegative().optional(),
  hourMeterAtService: z.coerce.number().nonnegative().optional(),
});

export const maintenancePlanSchema = z.object({
  machineId: z.string().cuid(),
  description: z.string().min(2),
  intervalHours: z.coerce.number().positive(),
  lastServiceHourMeter: z.coerce.number().nonnegative().optional(),
  nextServiceHourMeter: z.coerce.number().positive(),
});

// -- Fueling --
export const fuelingSchema = z.object({
  machineId: z.string().cuid(),
  date: z.coerce.date(),
  liters: z.coerce.number().positive(),
  pricePerLiter: z.coerce.number().positive(),
  totalCost: z.coerce.number().positive(),
  currentHourMeter: z.coerce.number().nonnegative(),
  operatorId: z.string().cuid(),
});

// -- Production --
export const productionSchema = z.object({
  date: z.coerce.date(),
  machineId: z.string().cuid(),
  operatorId: z.string().cuid(),
  projectId: z.string().cuid(),
  hoursWorked: z.coerce.number().nonnegative(),
  serviceDescription: z.string().min(2),
  volumeMoved: z.coerce.number().nonnegative().optional(),
  transportDistance: z.coerce.number().nonnegative().optional(),
  stoppageHours: z.coerce.number().nonnegative().optional(),
  stoppageReason: z.string().optional(),
});

// -- Financial --
export const financialEntrySchema = z.object({
  type: z.enum(['PAYABLE', 'RECEIVABLE']),
  description: z.string().min(2),
  value: z.coerce.number().positive(),
  dueDate: z.coerce.date(),
  paidDate: z.coerce.date().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
  projectId: z.string().cuid().optional(),
  category: z.string().optional(),
});
