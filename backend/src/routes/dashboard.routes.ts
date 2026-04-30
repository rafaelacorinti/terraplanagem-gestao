import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();
router.use(authenticate);

// GET /dashboard/summary
router.get('/summary', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      monthlyRevenue,
      monthlyCosts,
      projectsInProgress,
      machinesOperating,
      machinesMaintenance,
      totalMachines,
      fuelingThisMonth,
      maintenanceAlerts,
      overdueEntries,
    ] = await Promise.all([
      prisma.financialEntry.aggregate({
        where: {
          type: 'RECEIVABLE',
          status: 'PAID',
          paidDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: {
          type: 'PAYABLE',
          status: 'PAID',
          paidDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { value: true },
      }),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.machine.count({ where: { status: 'OPERATING' } }),
      prisma.machine.count({ where: { status: 'MAINTENANCE' } }),
      prisma.machine.count(),
      prisma.fueling.aggregate({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { totalCost: true, liters: true },
      }),
      prisma.maintenancePlan.findMany({
        include: { machine: { select: { id: true, name: true, hourMeter: true } } },
      }),
      prisma.financialEntry.count({
        where: { status: 'OVERDUE' },
      }),
    ]);

    // Calculate profit by project (top 5)
    const projects = await prisma.project.findMany({
      where: { status: 'IN_PROGRESS' },
      select: { id: true, name: true, contractValue: true },
    });

    const projectProfits = await Promise.all(
      projects.map(async (p) => {
        const [rev, cost] = await Promise.all([
          prisma.financialEntry.aggregate({
            where: { projectId: p.id, type: 'RECEIVABLE', status: 'PAID' },
            _sum: { value: true },
          }),
          prisma.financialEntry.aggregate({
            where: { projectId: p.id, type: 'PAYABLE', status: 'PAID' },
            _sum: { value: true },
          }),
        ]);
        return {
          projectId: p.id,
          name: p.name,
          revenue: Number(rev._sum.value || 0),
          cost: Number(cost._sum.value || 0),
          profit: Number(rev._sum.value || 0) - Number(cost._sum.value || 0),
        };
      })
    );

    // Maintenance alerts count
    const alertsCount = maintenanceAlerts.filter((plan) => {
      const currentHour = Number(plan.machine.hourMeter);
      const nextService = Number(plan.nextServiceHourMeter);
      return nextService - currentHour <= 20;
    }).length;

    const revenue = Number(monthlyRevenue._sum.value || 0);
    const costs = Number(monthlyCosts._sum.value || 0);

    res.json({
      monthlyRevenue: revenue,
      monthlyCosts: costs,
      monthlyProfit: revenue - costs,
      projectsInProgress,
      machinesOperating,
      machinesMaintenance,
      totalMachines,
      fuelingThisMonth: {
        totalCost: Number(fuelingThisMonth._sum.totalCost || 0),
        totalLiters: Number(fuelingThisMonth._sum.liters || 0),
      },
      maintenanceAlerts: alertsCount,
      overdueEntries,
      profitByProject: projectProfits.sort((a, b) => b.profit - a.profit).slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
