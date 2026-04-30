import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Company
  const company = await prisma.company.create({
    data: {
      name: 'Terraplanagem Exemplo Ltda',
      cnpj: '12.345.678/0001-90',
      address: 'Av. Principal, 1000, São Paulo - SP',
      phone: '(11) 9999-9999',
      email: 'contato@terraplanagem.com.br',
    },
  });

  // Users
  const adminPass = await bcrypt.hash('admin123', 10);
  const managerPass = await bcrypt.hash('manager123', 10);
  const operatorPass = await bcrypt.hash('operator123', 10);

  const adminUser = await prisma.user.create({
    data: { name: 'Administrador', email: 'admin@terra.com', password: adminPass, role: 'ADMIN' },
  });
  const managerUser = await prisma.user.create({
    data: { name: 'Gerente', email: 'manager@terra.com', password: managerPass, role: 'MANAGER' },
  });
  await prisma.user.create({
    data: { name: 'Operador', email: 'operator@terra.com', password: operatorPass, role: 'OPERATOR' },
  });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Terraplenagem Rodovia SP-123',
      client: 'DER - Departamento de Estradas de Rodagem',
      location: 'São Paulo, SP',
      contractValue: 2500000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      status: 'IN_PROGRESS',
      description: 'Terraplenagem e pavimentação da rodovia SP-123',
      companyId: company.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Loteamento Residencial Bela Vista',
      client: 'Construtora Bela Vista Ltda',
      location: 'Campinas, SP',
      contractValue: 850000,
      startDate: new Date('2024-03-01'),
      status: 'IN_PROGRESS',
      description: 'Terraplenagem para loteamento residencial',
      companyId: company.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Aterro Industrial Zona Norte',
      client: 'Indústrias ZN S/A',
      location: 'São Paulo, SP',
      contractValue: 1200000,
      startDate: new Date('2024-06-01'),
      status: 'PLANNING',
      description: 'Aterro e compactação para área industrial',
      companyId: company.id,
    },
  });

  // Machines
  const machines = await Promise.all([
    prisma.machine.create({
      data: {
        name: 'Escavadeira CAT 320',
        model: '320',
        manufacturer: 'Caterpillar',
        year: 2020,
        patrimonyCode: 'PAT-001',
        type: 'EXCAVATOR',
        status: 'OPERATING',
        hourMeter: 3450.5,
        companyId: company.id,
      },
    }),
    prisma.machine.create({
      data: {
        name: 'Trator de Esteira D6',
        model: 'D6T',
        manufacturer: 'Caterpillar',
        year: 2019,
        patrimonyCode: 'PAT-002',
        type: 'BULLDOZER',
        status: 'OPERATING',
        hourMeter: 5200.0,
        companyId: company.id,
      },
    }),
    prisma.machine.create({
      data: {
        name: 'Pá Carregadeira 966',
        model: '966M',
        manufacturer: 'Caterpillar',
        year: 2021,
        patrimonyCode: 'PAT-003',
        type: 'LOADER',
        status: 'AVAILABLE',
        hourMeter: 1800.0,
        companyId: company.id,
      },
    }),
    prisma.machine.create({
      data: {
        name: 'Caminhão Basculante VW 31.390',
        model: '31.390',
        manufacturer: 'Volkswagen',
        year: 2022,
        patrimonyCode: 'PAT-004',
        type: 'TRUCK',
        status: 'OPERATING',
        hourMeter: 950.0,
        odometer: 42500.0,
        companyId: company.id,
      },
    }),
    prisma.machine.create({
      data: {
        name: 'Motoniveladora 140M',
        model: '140M',
        manufacturer: 'Caterpillar',
        year: 2020,
        patrimonyCode: 'PAT-005',
        type: 'GRADER',
        status: 'MAINTENANCE',
        hourMeter: 4100.0,
        companyId: company.id,
      },
    }),
  ]);

  // Employees
  const employees = await Promise.all([
    prisma.employee.create({ data: { name: 'João Silva', cpf: '111.222.333-44', role: 'OPERATOR', phone: '(11) 9111-1111', hireDate: new Date('2020-03-01'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Maria Santos', cpf: '222.333.444-55', role: 'OPERATOR', phone: '(11) 9222-2222', hireDate: new Date('2019-07-15'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Pedro Oliveira', cpf: '333.444.555-66', role: 'OPERATOR', phone: '(11) 9333-3333', hireDate: new Date('2021-01-10'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Ana Costa', cpf: '444.555.666-77', role: 'MECHANIC', phone: '(11) 9444-4444', hireDate: new Date('2018-05-20'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Carlos Lima', cpf: '555.666.777-88', role: 'MECHANIC', phone: '(11) 9555-5555', hireDate: new Date('2020-11-01'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Fernanda Souza', cpf: '666.777.888-99', role: 'ENGINEER', phone: '(11) 9666-6666', hireDate: new Date('2017-08-15'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Roberto Pereira', cpf: '777.888.999-00', role: 'OPERATOR', phone: '(11) 9777-7777', hireDate: new Date('2022-02-01'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Juliana Alves', cpf: '888.999.000-11', role: 'ADMIN_STAFF', phone: '(11) 9888-8888', hireDate: new Date('2019-04-01'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Marcos Ferreira', cpf: '999.000.111-22', role: 'OPERATOR', phone: '(11) 9999-9999', hireDate: new Date('2023-01-15'), companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Luciana Rodrigues', cpf: '000.111.222-33', role: 'ENGINEER', phone: '(11) 9000-0000', hireDate: new Date('2016-09-01'), companyId: company.id } }),
  ]);

  // Parts
  const parts = await Promise.all([
    prisma.part.create({ data: { name: 'Filtro de Óleo Motor', code: 'FILT-001', quantity: 15, minQuantity: 5, unitPrice: 45.90, location: 'Prateleira A1' } }),
    prisma.part.create({ data: { name: 'Filtro de Combustível', code: 'FILT-002', quantity: 10, minQuantity: 4, unitPrice: 38.50, location: 'Prateleira A2' } }),
    prisma.part.create({ data: { name: 'Correia Dentada', code: 'CORR-001', quantity: 3, minQuantity: 2, unitPrice: 185.00, location: 'Prateleira B1' } }),
    prisma.part.create({ data: { name: 'Óleo Hidráulico 20L', code: 'OLEO-001', quantity: 8, minQuantity: 3, unitPrice: 320.00, location: 'Depósito' } }),
    prisma.part.create({ data: { name: 'Lâmina de Niveladora', code: 'LAM-001', quantity: 2, minQuantity: 1, unitPrice: 1250.00, location: 'Depósito Grande' } }),
  ]);

  // Maintenance Orders
  const mainOrder1 = await prisma.maintenanceOrder.create({
    data: {
      machineId: machines[4].id,
      type: 'CORRECTIVE',
      status: 'IN_PROGRESS',
      description: 'Troca de lâmina e revisão do sistema hidráulico',
      scheduledDate: new Date(),
      hourMeterAtService: 4100,
    },
  });

  await prisma.maintenanceOrder.create({
    data: {
      machineId: machines[0].id,
      type: 'PREVENTIVE',
      status: 'COMPLETED',
      description: 'Troca de filtros e lubrificação geral - 3000h',
      scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      cost: 850,
      hourMeterAtService: 3000,
    },
  });

  await prisma.maintenanceOrder.create({
    data: {
      machineId: machines[1].id,
      type: 'PREVENTIVE',
      status: 'OPEN',
      description: 'Troca de óleo do motor e filtros - 5000h',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      hourMeterAtService: 5000,
    },
  });

  // Part Usage on maintenance order
  await prisma.partUsage.create({
    data: {
      partId: parts[4].id,
      maintenanceOrderId: mainOrder1.id,
      quantity: 1,
      date: new Date(),
    },
  });

  // Maintenance Plans
  await Promise.all([
    prisma.maintenancePlan.create({
      data: { machineId: machines[0].id, description: 'Troca de óleo motor e filtros', intervalHours: 500, lastServiceHourMeter: 3000, nextServiceHourMeter: 3500 },
    }),
    prisma.maintenancePlan.create({
      data: { machineId: machines[1].id, description: 'Troca de óleo transmissão', intervalHours: 1000, lastServiceHourMeter: 4500, nextServiceHourMeter: 5500 },
    }),
  ]);

  // Daily Productions - last 30 days
  const projects = [project1, project2];
  const operators = [employees[0], employees[1], employees[2], employees[6], employees[8]];
  const activeMachines = [machines[0], machines[1], machines[2], machines[3]];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const machine = activeMachines[i % activeMachines.length];
    const operator = operators[i % operators.length];
    const project = projects[i % projects.length];

    await prisma.dailyProduction.create({
      data: {
        date,
        machineId: machine.id,
        operatorId: operator.id,
        projectId: project.id,
        hoursWorked: 8 + (i % 2),
        serviceDescription: `Escavação e transporte de material - Setor ${String.fromCharCode(65 + (i % 5))}`,
        volumeMoved: 150 + (i * 10) % 500,
        transportDistance: 0.8 + (i % 5) * 0.2,
        stoppageHours: i % 5 === 0 ? 1.5 : 0,
        stoppageReason: i % 5 === 0 ? 'Manutenção corretiva emergencial' : null,
      },
    });
  }

  // Fuelings
  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const machine = activeMachines[i % activeMachines.length];
    const liters = 80 + (i * 15) % 120;
    const price = 5.89 + (i % 3) * 0.1;

    await prisma.fueling.create({
      data: {
        machineId: machine.id,
        date,
        liters,
        pricePerLiter: price,
        totalCost: liters * price,
        currentHourMeter: machine.hourMeter.toNumber() + i * 8,
        operatorId: managerUser.id,
      },
    });
  }

  // Fuel Stock
  await Promise.all([
    prisma.fuelStock.create({ data: { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), type: 'DIESEL', quantity: 5000, pricePerLiter: 5.85 } }),
    prisma.fuelStock.create({ data: { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'DIESEL', quantity: 3000, pricePerLiter: 5.89 } }),
  ]);

  // Financial Entries
  await Promise.all([
    prisma.financialEntry.create({ data: { type: 'RECEIVABLE', description: 'Medição #1 - Rodovia SP-123', value: 350000, dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), status: 'PENDING', projectId: project1.id, category: 'Medição' } }),
    prisma.financialEntry.create({ data: { type: 'RECEIVABLE', description: 'Medição #2 - Bela Vista', value: 120000, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'PENDING', projectId: project2.id, category: 'Medição' } }),
    prisma.financialEntry.create({ data: { type: 'RECEIVABLE', description: 'Medição #1 - Bela Vista', value: 95000, dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), status: 'PAID', projectId: project2.id, category: 'Medição' } }),
    prisma.financialEntry.create({ data: { type: 'PAYABLE', description: 'Fornecimento de Diesel - Petro Combustíveis', value: 45000, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), status: 'PENDING', category: 'Combustível' } }),
    prisma.financialEntry.create({ data: { type: 'PAYABLE', description: 'Manutenção Motoniveladora 140M', value: 8500, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'PENDING', category: 'Manutenção' } }),
    prisma.financialEntry.create({ data: { type: 'PAYABLE', description: 'Folha de Pagamento - Março', value: 85000, dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'PAID', category: 'Pessoal' } }),
    prisma.financialEntry.create({ data: { type: 'PAYABLE', description: 'Aluguel de Equipamento - Compactador', value: 12000, dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), status: 'OVERDUE', category: 'Aluguel' } }),
  ]);

  // Stock Movements
  await Promise.all([
    prisma.stockMovement.create({ data: { partId: parts[0].id, type: 'IN', quantity: 10, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), reason: 'Compra de estoque' } }),
    prisma.stockMovement.create({ data: { partId: parts[0].id, type: 'OUT', quantity: 2, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), projectId: project1.id, reason: 'Manutenção preventiva' } }),
    prisma.stockMovement.create({ data: { partId: parts[3].id, type: 'IN', quantity: 5, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), reason: 'Compra de estoque' } }),
  ]);

  // Trainings
  await Promise.all([
    prisma.training.create({ data: { employeeId: employees[0].id, name: 'NR-12 Segurança em Máquinas', date: new Date('2024-01-10'), expiryDate: new Date('2026-01-10'), certificate: 'CERT-001' } }),
    prisma.training.create({ data: { employeeId: employees[1].id, name: 'Operação de Escavadeira', date: new Date('2023-06-15'), expiryDate: new Date('2025-06-15'), certificate: 'CERT-002' } }),
    prisma.training.create({ data: { employeeId: employees[5].id, name: 'Engenharia de Terraplenagem', date: new Date('2023-03-20'), certificate: 'CERT-003' } }),
  ]);

  // Measurements
  await Promise.all([
    prisma.measurement.create({ data: { projectId: project1.id, period: 'Janeiro/2024', value: 350000, status: 'PAID', invoiceNumber: 'NF-001' } }),
    prisma.measurement.create({ data: { projectId: project1.id, period: 'Fevereiro/2024', value: 420000, status: 'APPROVED', invoiceNumber: 'NF-002' } }),
    prisma.measurement.create({ data: { projectId: project2.id, period: 'Março/2024', value: 95000, status: 'PAID', invoiceNumber: 'NF-003' } }),
  ]);

  // Audit Log
  await prisma.auditLog.create({
    data: { userId: adminUser.id, action: 'CREATE', entity: 'Company', entityId: company.id, details: { message: 'Initial seed data created' } },
  });

  // Notification
  await prisma.notification.create({
    data: { userId: adminUser.id, title: 'Sistema iniciado', message: 'Dados de demonstração carregados com sucesso!', type: 'INFO' },
  });

  // Suppress unused variable warning
  void project3;

  console.log('Seed completed successfully!');
  console.log('Admin credentials: admin@terra.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
