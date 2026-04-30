import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { financialEntrySchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /financial/cashflow - must be before /:id style
router.get('/cashflow', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query as Record<string, string>;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const entries = await prisma.financialEntry.findMany({
      where: { dueDate: { gte: start, lte: end } },
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
    });

    // Group by month
    const byMonth: Record<string, { receivable: number; payable: number; balance: number }> = {};
    entries.forEach((e) => {
      const key = e.dueDate.toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { receivable: 0, payable: 0, balance: 0 };
      if (e.type === 'RECEIVABLE') {
        byMonth[key].receivable += Number(e.value);
      } else {
        byMonth[key].payable += Number(e.value);
      }
      byMonth[key].balance = byMonth[key].receivable - byMonth[key].payable;
    });

    const totalReceivable = entries.filter((e) => e.type === 'RECEIVABLE').reduce((s, e) => s + Number(e.value), 0);
    const totalPayable = entries.filter((e) => e.type === 'PAYABLE').reduce((s, e) => s + Number(e.value), 0);

    res.json({
      period: { start, end },
      summary: { totalReceivable, totalPayable, netBalance: totalReceivable - totalPayable },
      byMonth: Object.entries(byMonth).map(([month, data]) => ({ month, ...data })),
      entries,
    });
  } catch (error) {
    next(error);
  }
});

// GET /financial/dre - DRE consolidada
router.get('/dre', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { year } = req.query as Record<string, string>;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31);

    const [receivablePaid, payablePaid, receivablePending, payablePending] = await Promise.all([
      prisma.financialEntry.aggregate({
        where: { type: 'RECEIVABLE', status: 'PAID', paidDate: { gte: start, lte: end } },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: { type: 'PAYABLE', status: 'PAID', paidDate: { gte: start, lte: end } },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: { type: 'RECEIVABLE', status: { in: ['PENDING', 'OVERDUE'] }, dueDate: { gte: start, lte: end } },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: { type: 'PAYABLE', status: { in: ['PENDING', 'OVERDUE'] }, dueDate: { gte: start, lte: end } },
        _sum: { value: true },
      }),
    ]);

    const byCategory = await prisma.financialEntry.groupBy({
      by: ['category', 'type'],
      where: { dueDate: { gte: start, lte: end } },
      _sum: { value: true },
    });

    const grossRevenuePaid = Number(receivablePaid._sum.value || 0);
    const totalCostPaid = Number(payablePaid._sum.value || 0);
    const grossProfit = grossRevenuePaid - totalCostPaid;
    const profitMargin = grossRevenuePaid > 0 ? (grossProfit / grossRevenuePaid) * 100 : 0;

    res.json({
      year: targetYear,
      revenue: {
        paid: grossRevenuePaid,
        pending: Number(receivablePending._sum.value || 0),
      },
      costs: {
        paid: totalCostPaid,
        pending: Number(payablePending._sum.value || 0),
      },
      grossProfit,
      profitMargin,
      byCategory,
    });
  } catch (error) {
    next(error);
  }
});

// GET /financial/dre/:projectId - DRE por obra
router.get('/dre/:projectId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Obra nao encontrada' });
      return;
    }

    const [receivable, payable, measurements] = await Promise.all([
      prisma.financialEntry.aggregate({
        where: { projectId, type: 'RECEIVABLE' },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: { projectId, type: 'PAYABLE' },
        _sum: { value: true },
      }),
      prisma.measurement.findMany({ where: { projectId } }),
    ]);

    const totalRevenue = Number(receivable._sum.value || 0);
    const totalCost = Number(payable._sum.value || 0);
    const totalMeasured = measurements.reduce((s, m) => s + Number(m.value), 0);
    const contractValue = Number(project.contractValue);

    res.json({
      projectId,
      projectName: project.name,
      client: project.client,
      contractValue,
      totalMeasured,
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      status: project.status,
    });
  } catch (error) {
    next(error);
  }
});

// GET /financial/overdue - inadimplentes
router.get('/overdue', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    const overdue = await prisma.financialEntry.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { lt: today },
      },
      include: { project: { select: { name: true, client: true } } },
      orderBy: { dueDate: 'asc' },
    });

    const ids = overdue.map((e) => e.id);
    if (ids.length > 0) {
      await prisma.financialEntry.updateMany({
        where: { id: { in: ids }, status: 'PENDING' },
        data: { status: 'OVERDUE' },
      });
    }

    const totalOverdue = overdue.reduce((s, e) => s + Number(e.value), 0);
    res.json({ total: overdue.length, totalValue: totalOverdue, entries: overdue });
  } catch (error) {
    next(error);
  }
});

// GET /financial/summary
router.get('/summary', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [receivable, payable, paid, overdue] = await Promise.all([
      prisma.financialEntry.aggregate({
        where: { type: 'RECEIVABLE', status: 'PENDING' },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: { type: 'PAYABLE', status: 'PENDING' },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: { status: 'PAID' },
        _sum: { value: true },
      }),
      prisma.financialEntry.count({
        where: { status: 'OVERDUE' },
      }),
    ]);
    res.json({
      totalReceivable: Number(receivable._sum.value || 0),
      totalPayable: Number(payable._sum.value || 0),
      balance: Number(receivable._sum.value || 0) - Number(payable._sum.value || 0),
      totalPaid: Number(paid._sum.value || 0),
      overdueCount: overdue,
    });
  } catch (error) {
    next(error);
  }
});

// GET /financial
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status, projectId, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [entries, total] = await Promise.all([
      prisma.financialEntry.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { project: { select: { name: true } } },
        orderBy: { dueDate: 'desc' },
      }),
      prisma.financialEntry.count({ where }),
    ]);
    res.json({ data: entries, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

// POST /financial
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(financialEntrySchema),
  auditLog('CREATE', 'FinancialEntry'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entry = await prisma.financialEntry.create({ data: req.body });
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /financial/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(financialEntrySchema),
  auditLog('UPDATE', 'FinancialEntry'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entry = await prisma.financialEntry.update({ where: { id: req.params.id }, data: req.body });
      res.json(entry);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /financial/:id
router.delete(
  '/:id',
  authorize('ADMIN'),
  auditLog('DELETE', 'FinancialEntry'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.financialEntry.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
