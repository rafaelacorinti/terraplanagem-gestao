import { Project, Machine, Employee, FinancialEntry, MaintenancePlan, MaintenanceRecord, DailyProduction, Fueling, Alert, Measurement, Additive, Training, CashFlowEntry } from '../types'

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Terraplanagem Loteamento Parque das Flores',
    client: 'Construtora Horizonte',
    location: 'Ribeirão Preto - SP',
    contractValue: 850000,
    startDate: '2024-01-15',
    endDate: '2024-08-30',
    status: 'IN_PROGRESS',
    description: 'Serviço de terraplanagem completa para loteamento residencial',
    companyId: '1',
  },
  {
    id: '2',
    name: 'Aterro Industrial Zona Norte',
    client: 'Grupo Votorantim',
    location: 'Campinas - SP',
    contractValue: 1200000,
    startDate: '2024-03-01',
    status: 'IN_PROGRESS',
    description: 'Aterro e compactação para galpão industrial',
    companyId: '1',
  },
  {
    id: '3',
    name: 'Estrada Rural Fazenda São José',
    client: 'Prefeitura de Araraquara',
    location: 'Araraquara - SP',
    contractValue: 320000,
    startDate: '2023-09-01',
    endDate: '2024-02-28',
    status: 'COMPLETED',
    description: 'Abertura e pavimentação de estrada rural',
    companyId: '1',
  },
  {
    id: '4',
    name: 'Drenagem Condomínio Lago Azul',
    client: 'Incorporadora Lago Azul',
    location: 'São Carlos - SP',
    contractValue: 450000,
    startDate: '2024-06-01',
    status: 'PLANNING',
    description: 'Sistema de drenagem e terraplanagem para condomínio',
    companyId: '1',
  },
  {
    id: '5',
    name: 'Corte e Aterro BR-153',
    client: 'DNIT',
    location: 'Marília - SP',
    contractValue: 2100000,
    startDate: '2024-02-01',
    status: 'IN_PROGRESS',
    description: 'Serviços de corte e aterro para duplicação da BR-153',
    companyId: '1',
  },
  {
    id: '6',
    name: 'Platô Industrial Distrito Leste',
    client: 'Prefeitura de Bauru',
    location: 'Bauru - SP',
    contractValue: 680000,
    startDate: '2024-04-15',
    status: 'PAUSED',
    description: 'Terraplanagem para novo distrito industrial',
    companyId: '1',
  },
]

export const mockMeasurements: Measurement[] = [
  { id: '1', projectId: '1', date: '2024-02-15', description: 'Medição 1 - Limpeza do terreno', value: 127500, approved: true },
  { id: '2', projectId: '1', date: '2024-03-15', description: 'Medição 2 - Corte e aterro parcial', value: 212500, approved: true },
  { id: '3', projectId: '1', date: '2024-04-15', description: 'Medição 3 - Compactação', value: 170000, approved: false },
  { id: '4', projectId: '2', date: '2024-04-01', description: 'Medição 1 - Mobilização e limpeza', value: 180000, approved: true },
  { id: '5', projectId: '2', date: '2024-05-01', description: 'Medição 2 - Aterro fase 1', value: 360000, approved: true },
  { id: '6', projectId: '5', date: '2024-03-01', description: 'Medição 1 - Mobilização', value: 315000, approved: true },
  { id: '7', projectId: '5', date: '2024-04-01', description: 'Medição 2 - Corte km 12-18', value: 525000, approved: true },
]

export const mockAdditives: Additive[] = [
  { id: '1', projectId: '1', date: '2024-03-20', description: 'Aditivo - Área extra 2.000m²', value: 95000, approved: true },
  { id: '2', projectId: '2', date: '2024-05-10', description: 'Aditivo - Reforço de base', value: 150000, approved: false },
  { id: '3', projectId: '5', date: '2024-04-15', description: 'Aditivo - Extensão km 18-20', value: 280000, approved: true },
]

export const mockMachines: Machine[] = [
  { id: '1', name: 'Escavadeira CAT 320', model: '320F', manufacturer: 'Caterpillar', year: 2020, patrimonyCode: 'EQ-001', type: 'EXCAVATOR', status: 'OPERATING', hourMeter: 4520, companyId: '1' },
  { id: '2', name: 'Escavadeira Komatsu PC200', model: 'PC200-8', manufacturer: 'Komatsu', year: 2019, patrimonyCode: 'EQ-002', type: 'EXCAVATOR', status: 'OPERATING', hourMeter: 5230, companyId: '1' },
  { id: '3', name: 'Trator de Esteira D6', model: 'D6T', manufacturer: 'Caterpillar', year: 2021, patrimonyCode: 'EQ-003', type: 'BULLDOZER', status: 'OPERATING', hourMeter: 3100, companyId: '1' },
  { id: '4', name: 'Pá Carregadeira 950', model: '950H', manufacturer: 'Caterpillar', year: 2018, patrimonyCode: 'EQ-004', type: 'LOADER', status: 'MAINTENANCE', hourMeter: 6800, companyId: '1' },
  { id: '5', name: 'Caminhão Caçamba Volvo', model: 'FMX 500', manufacturer: 'Volvo', year: 2022, patrimonyCode: 'EQ-005', type: 'TRUCK', status: 'OPERATING', hourMeter: 2100, odometer: 45000, companyId: '1' },
  { id: '6', name: 'Motoniveladora CAT 120', model: '120K', manufacturer: 'Caterpillar', year: 2020, patrimonyCode: 'EQ-006', type: 'GRADER', status: 'AVAILABLE', hourMeter: 3850, companyId: '1' },
  { id: '7', name: 'Rolo Compactador Dynapac', model: 'CA250', manufacturer: 'Dynapac', year: 2021, patrimonyCode: 'EQ-007', type: 'ROLLER', status: 'OPERATING', hourMeter: 2900, companyId: '1' },
  { id: '8', name: 'Caminhão Pipa Mercedes', model: 'Atego 2426', manufacturer: 'Mercedes-Benz', year: 2019, patrimonyCode: 'EQ-008', type: 'TRUCK', status: 'AVAILABLE', hourMeter: 3200, odometer: 68000, companyId: '1' },
  { id: '9', name: 'Retroescavadeira Case', model: '580N', manufacturer: 'Case', year: 2022, patrimonyCode: 'EQ-009', type: 'EXCAVATOR', status: 'OPERATING', hourMeter: 1800, companyId: '1' },
  { id: '10', name: 'Trator de Esteira Komatsu', model: 'D51EX', manufacturer: 'Komatsu', year: 2017, patrimonyCode: 'EQ-010', type: 'BULLDOZER', status: 'INACTIVE', hourMeter: 8500, companyId: '1' },
]

export const mockEmployees: Employee[] = [
  { id: '1', name: 'Carlos Alberto Silva', cpf: '123.456.789-00', role: 'OPERATOR', phone: '(16) 99123-4567', email: 'carlos@terra.com', hireDate: '2020-03-15', status: 'ACTIVE', companyId: '1' },
  { id: '2', name: 'José Ricardo Santos', cpf: '234.567.890-11', role: 'OPERATOR', phone: '(16) 99234-5678', email: 'jose@terra.com', hireDate: '2019-07-01', status: 'ACTIVE', companyId: '1' },
  { id: '3', name: 'Marcos Paulo Oliveira', cpf: '345.678.901-22', role: 'OPERATOR', phone: '(16) 99345-6789', hireDate: '2021-01-10', status: 'ACTIVE', companyId: '1' },
  { id: '4', name: 'Roberto Ferreira Lima', cpf: '456.789.012-33', role: 'MECHANIC', phone: '(16) 99456-7890', email: 'roberto@terra.com', hireDate: '2018-05-20', status: 'ACTIVE', companyId: '1' },
  { id: '5', name: 'Fernando Henrique Costa', cpf: '567.890.123-44', role: 'MECHANIC', phone: '(16) 99567-8901', hireDate: '2022-02-01', status: 'ACTIVE', companyId: '1' },
  { id: '6', name: 'Ana Paula Rodrigues', cpf: '678.901.234-55', role: 'ENGINEER', phone: '(16) 99678-9012', email: 'ana@terra.com', hireDate: '2021-06-15', status: 'ACTIVE', companyId: '1' },
  { id: '7', name: 'Maria Fernanda Souza', cpf: '789.012.345-66', role: 'ADMIN_STAFF', phone: '(16) 99789-0123', email: 'maria@terra.com', hireDate: '2020-11-01', status: 'ACTIVE', companyId: '1' },
  { id: '8', name: 'Pedro Augusto Mendes', cpf: '890.123.456-77', role: 'OPERATOR', phone: '(16) 99890-1234', hireDate: '2023-03-10', status: 'INACTIVE', companyId: '1' },
]

export const mockTrainings: Training[] = [
  { id: '1', employeeId: '1', name: 'NR-11 Operador de Equipamentos', date: '2024-01-15', validUntil: '2026-01-15' },
  { id: '2', employeeId: '1', name: 'NR-35 Trabalho em Altura', date: '2023-06-20', validUntil: '2025-06-20' },
  { id: '3', employeeId: '2', name: 'NR-11 Operador de Equipamentos', date: '2024-02-10', validUntil: '2026-02-10' },
  { id: '4', employeeId: '3', name: 'NR-11 Operador de Equipamentos', date: '2023-11-05', validUntil: '2025-11-05' },
  { id: '5', employeeId: '4', name: 'NR-12 Segurança em Máquinas', date: '2024-03-01', validUntil: '2026-03-01' },
  { id: '6', employeeId: '6', name: 'Gestão de Projetos de Terraplenagem', date: '2024-04-10' },
]

export const mockFinancialEntries: FinancialEntry[] = [
  { id: '1', type: 'RECEIVABLE', description: 'Medição 1 - Parque das Flores', value: 127500, dueDate: '2024-03-15', paidDate: '2024-03-18', status: 'PAID', projectId: '1', category: 'Medição', project: { name: 'Parque das Flores' } },
  { id: '2', type: 'RECEIVABLE', description: 'Medição 2 - Parque das Flores', value: 212500, dueDate: '2024-04-15', paidDate: '2024-04-20', status: 'PAID', projectId: '1', category: 'Medição', project: { name: 'Parque das Flores' } },
  { id: '3', type: 'RECEIVABLE', description: 'Medição 3 - Parque das Flores', value: 170000, dueDate: '2024-05-15', status: 'PENDING', projectId: '1', category: 'Medição', project: { name: 'Parque das Flores' } },
  { id: '4', type: 'RECEIVABLE', description: 'Medição 1 - Aterro Industrial', value: 180000, dueDate: '2024-05-01', paidDate: '2024-05-03', status: 'PAID', projectId: '2', category: 'Medição', project: { name: 'Aterro Industrial' } },
  { id: '5', type: 'RECEIVABLE', description: 'Medição 2 - Aterro Industrial', value: 360000, dueDate: '2024-06-01', status: 'OVERDUE', projectId: '2', category: 'Medição', project: { name: 'Aterro Industrial' } },
  { id: '6', type: 'RECEIVABLE', description: 'Medição 1 - BR-153', value: 315000, dueDate: '2024-04-01', paidDate: '2024-04-05', status: 'PAID', projectId: '5', category: 'Medição', project: { name: 'BR-153' } },
  { id: '7', type: 'PAYABLE', description: 'Diesel - Posto Ipiranga', value: 45000, dueDate: '2024-04-10', paidDate: '2024-04-10', status: 'PAID', category: 'Combustível' },
  { id: '8', type: 'PAYABLE', description: 'Folha de Pagamento - Abril', value: 85000, dueDate: '2024-05-05', paidDate: '2024-05-05', status: 'PAID', category: 'Pessoal' },
  { id: '9', type: 'PAYABLE', description: 'Manutenção Pá Carregadeira', value: 12500, dueDate: '2024-05-20', status: 'PENDING', category: 'Manutenção' },
  { id: '10', type: 'PAYABLE', description: 'Aluguel Galpão', value: 8500, dueDate: '2024-05-01', status: 'OVERDUE', category: 'Aluguel' },
  { id: '11', type: 'PAYABLE', description: 'Diesel - Maio', value: 52000, dueDate: '2024-05-30', status: 'PENDING', category: 'Combustível' },
  { id: '12', type: 'PAYABLE', description: 'Folha de Pagamento - Maio', value: 85000, dueDate: '2024-06-05', status: 'PENDING', category: 'Pessoal' },
]

export const mockMaintenancePlans: MaintenancePlan[] = [
  { id: '1', machineId: '1', description: 'Troca de óleo e filtros', intervalHours: 500, lastServiceHourMeter: 4000, nextServiceHourMeter: 4500, machine: { name: 'Escavadeira CAT 320', hourMeter: 4520 } },
  { id: '2', machineId: '1', description: 'Revisão do sistema hidráulico', intervalHours: 2000, lastServiceHourMeter: 3000, nextServiceHourMeter: 5000, machine: { name: 'Escavadeira CAT 320', hourMeter: 4520 } },
  { id: '3', machineId: '2', description: 'Troca de óleo e filtros', intervalHours: 500, lastServiceHourMeter: 5000, nextServiceHourMeter: 5500, machine: { name: 'Escavadeira Komatsu PC200', hourMeter: 5230 } },
  { id: '4', machineId: '3', description: 'Troca de óleo e filtros', intervalHours: 500, lastServiceHourMeter: 2800, nextServiceHourMeter: 3300, machine: { name: 'Trator de Esteira D6', hourMeter: 3100 } },
  { id: '5', machineId: '4', description: 'Revisão geral', intervalHours: 1000, lastServiceHourMeter: 6000, nextServiceHourMeter: 7000, machine: { name: 'Pá Carregadeira 950', hourMeter: 6800 } },
  { id: '6', machineId: '5', description: 'Revisão motor e transmissão', intervalHours: 1000, lastServiceHourMeter: 1500, nextServiceHourMeter: 2500, machine: { name: 'Caminhão Caçamba Volvo', hourMeter: 2100 } },
]

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  { id: '1', machineId: '1', planId: '1', type: 'PREVENTIVE', status: 'COMPLETED', description: 'Troca de óleo motor e filtros', scheduledDate: '2024-03-10', completedDate: '2024-03-10', cost: 2800, machine: { name: 'Escavadeira CAT 320', model: '320F' } },
  { id: '2', machineId: '2', type: 'CORRECTIVE', status: 'COMPLETED', description: 'Reparo mangueira hidráulica', scheduledDate: '2024-03-25', completedDate: '2024-03-26', cost: 4500, machine: { name: 'Escavadeira Komatsu PC200', model: 'PC200-8' } },
  { id: '3', machineId: '4', type: 'PREVENTIVE', status: 'IN_PROGRESS', description: 'Revisão geral - Pá Carregadeira', scheduledDate: '2024-05-01', cost: 12500, machine: { name: 'Pá Carregadeira 950', model: '950H' } },
  { id: '4', machineId: '3', planId: '4', type: 'PREVENTIVE', status: 'PENDING', description: 'Troca de óleo e filtros - Esteira D6', scheduledDate: '2024-05-15', machine: { name: 'Trator de Esteira D6', model: 'D6T' } },
  { id: '5', machineId: '1', planId: '1', type: 'PREVENTIVE', status: 'PENDING', description: 'Troca de óleo e filtros (próxima)', scheduledDate: '2024-06-01', machine: { name: 'Escavadeira CAT 320', model: '320F' } },
]

export const mockProductions: DailyProduction[] = [
  { id: '1', date: '2024-05-20', machineId: '1', operatorId: '1', projectId: '1', hoursWorked: 8.5, serviceDescription: 'Escavação de vala', volumeMoved: 450, stoppageHours: 0.5, stoppageReason: 'Abastecimento', machine: { name: 'Escavadeira CAT 320' }, operator: { name: 'Carlos Alberto Silva' }, project: { name: 'Parque das Flores' } },
  { id: '2', date: '2024-05-20', machineId: '2', operatorId: '2', projectId: '2', hoursWorked: 9, serviceDescription: 'Carregamento de material', volumeMoved: 520, stoppageHours: 1, stoppageReason: 'Aguardando caminhão', machine: { name: 'Escavadeira Komatsu PC200' }, operator: { name: 'José Ricardo Santos' }, project: { name: 'Aterro Industrial' } },
  { id: '3', date: '2024-05-20', machineId: '3', operatorId: '3', projectId: '5', hoursWorked: 10, serviceDescription: 'Espalhamento e nivelamento', volumeMoved: 800, stoppageHours: 0, machine: { name: 'Trator de Esteira D6' }, operator: { name: 'Marcos Paulo Oliveira' }, project: { name: 'BR-153' } },
  { id: '4', date: '2024-05-20', machineId: '5', operatorId: '1', projectId: '5', hoursWorked: 8, serviceDescription: 'Transporte de material', volumeMoved: 320, transportDistance: 12, stoppageHours: 2, stoppageReason: 'Chuva', machine: { name: 'Caminhão Caçamba Volvo' }, operator: { name: 'Carlos Alberto Silva' }, project: { name: 'BR-153' } },
  { id: '5', date: '2024-05-19', machineId: '1', operatorId: '1', projectId: '1', hoursWorked: 9, serviceDescription: 'Escavação para fundação', volumeMoved: 480, stoppageHours: 0, machine: { name: 'Escavadeira CAT 320' }, operator: { name: 'Carlos Alberto Silva' }, project: { name: 'Parque das Flores' } },
  { id: '6', date: '2024-05-19', machineId: '7', operatorId: '2', projectId: '1', hoursWorked: 7, serviceDescription: 'Compactação de base', volumeMoved: 600, stoppageHours: 1.5, stoppageReason: 'Manutenção preventiva', machine: { name: 'Rolo Compactador Dynapac' }, operator: { name: 'José Ricardo Santos' }, project: { name: 'Parque das Flores' } },
  { id: '7', date: '2024-05-18', machineId: '2', operatorId: '2', projectId: '2', hoursWorked: 8.5, serviceDescription: 'Escavação de talude', volumeMoved: 500, stoppageHours: 0.5, stoppageReason: 'Troca de dente', machine: { name: 'Escavadeira Komatsu PC200' }, operator: { name: 'José Ricardo Santos' }, project: { name: 'Aterro Industrial' } },
  { id: '8', date: '2024-05-18', machineId: '3', operatorId: '3', projectId: '5', hoursWorked: 10, serviceDescription: 'Regularização de plataforma', volumeMoved: 750, stoppageHours: 0, machine: { name: 'Trator de Esteira D6' }, operator: { name: 'Marcos Paulo Oliveira' }, project: { name: 'BR-153' } },
]

export const mockFuelings: Fueling[] = [
  { id: '1', machineId: '1', date: '2024-05-20', liters: 180, pricePerLiter: 5.89, totalCost: 1060.20, hourMeter: 4520, operatorId: '1', machine: { name: 'Escavadeira CAT 320' }, operator: { name: 'Carlos Alberto' } },
  { id: '2', machineId: '2', date: '2024-05-20', liters: 200, pricePerLiter: 5.89, totalCost: 1178.00, hourMeter: 5230, operatorId: '2', machine: { name: 'Escavadeira Komatsu PC200' }, operator: { name: 'José Ricardo' } },
  { id: '3', machineId: '3', date: '2024-05-19', liters: 250, pricePerLiter: 5.89, totalCost: 1472.50, hourMeter: 3100, operatorId: '3', machine: { name: 'Trator de Esteira D6' }, operator: { name: 'Marcos Paulo' } },
  { id: '4', machineId: '5', date: '2024-05-19', liters: 300, pricePerLiter: 5.79, totalCost: 1737.00, hourMeter: 2100, operatorId: '1', machine: { name: 'Caminhão Caçamba Volvo' }, operator: { name: 'Carlos Alberto' } },
  { id: '5', machineId: '7', date: '2024-05-18', liters: 120, pricePerLiter: 5.89, totalCost: 706.80, hourMeter: 2900, operatorId: '2', machine: { name: 'Rolo Compactador Dynapac' }, operator: { name: 'José Ricardo' } },
  { id: '6', machineId: '1', date: '2024-05-15', liters: 185, pricePerLiter: 5.85, totalCost: 1082.25, hourMeter: 4450, operatorId: '1', machine: { name: 'Escavadeira CAT 320' }, operator: { name: 'Carlos Alberto' } },
  { id: '7', machineId: '9', date: '2024-05-15', liters: 80, pricePerLiter: 5.89, totalCost: 471.20, hourMeter: 1800, machine: { name: 'Retroescavadeira Case' } },
  { id: '8', machineId: '6', date: '2024-05-14', liters: 160, pricePerLiter: 5.85, totalCost: 936.00, hourMeter: 3850, machine: { name: 'Motoniveladora CAT 120' } },
]

export const mockAlerts: Alert[] = [
  { id: '1', type: 'maintenance', title: 'Manutenção Vencida', description: 'Escavadeira CAT 320 ultrapassou horímetro para troca de óleo (4520h / limite 4500h)', severity: 'danger', date: '2024-05-20' },
  { id: '2', type: 'maintenance', title: 'Manutenção Próxima', description: 'Trator de Esteira D6 próximo da manutenção preventiva (3100h / limite 3300h)', severity: 'warning', date: '2024-05-20' },
  { id: '3', type: 'financial', title: 'Conta Vencida', description: 'Aluguel Galpão - R$ 8.500,00 vencido em 01/05/2024', severity: 'danger', date: '2024-05-20' },
  { id: '4', type: 'financial', title: 'Conta Vencida', description: 'Medição 2 Aterro Industrial - R$ 360.000,00 a receber vencido em 01/06/2024', severity: 'warning', date: '2024-05-20' },
  { id: '5', type: 'fuel', title: 'Consumo Elevado', description: 'Caminhão Caçamba Volvo com consumo 15% acima da média', severity: 'warning', date: '2024-05-19' },
]

export const mockCashFlow: CashFlowEntry[] = [
  { month: '2024-01', income: 315000, expenses: 195000, balance: 120000 },
  { month: '2024-02', income: 127500, expenses: 210000, balance: -82500 },
  { month: '2024-03', income: 392500, expenses: 225000, balance: 167500 },
  { month: '2024-04', income: 540000, expenses: 245000, balance: 295000 },
  { month: '2024-05', income: 350000, expenses: 280000, balance: 70000 },
  { month: '2024-06', income: 170000, expenses: 230000, balance: -60000 },
]

export const mockDashboardData = {
  monthlyRevenue: 540000,
  operationalCosts: 280000,
  totalProfit: 260000,
  machinesOperating: 6,
  machinesMaintenance: 1,
  fuelConsumption: 1475,
  revenueVsCosts: [
    { month: 'Jan', faturamento: 315000, custos: 195000 },
    { month: 'Fev', faturamento: 127500, custos: 210000 },
    { month: 'Mar', faturamento: 392500, custos: 225000 },
    { month: 'Abr', faturamento: 540000, custos: 245000 },
    { month: 'Mai', faturamento: 350000, custos: 280000 },
    { month: 'Jun', faturamento: 170000, custos: 230000 },
  ],
  profitByProject: [
    { project: 'Parque das Flores', revenue: 510000, costs: 320000, profit: 190000 },
    { project: 'Aterro Industrial', revenue: 540000, costs: 380000, profit: 160000 },
    { project: 'BR-153', revenue: 840000, costs: 520000, profit: 320000 },
    { project: 'Estrada Rural', revenue: 320000, costs: 240000, profit: 80000 },
  ],
}
