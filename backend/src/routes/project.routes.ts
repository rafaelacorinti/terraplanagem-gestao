import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { projectSchema, measurementSchema, additiveSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /projects - list with filters, pagination
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, client, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (client) where.client = { contains: client, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { client: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          company: { select: { name: true } },
          _count: { select: { measurements: true, dailyProductions: true, additives: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);
    res.json({ data: projects, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

// POST /projects
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(projectSchema),
  auditLog('CREATE', 'Project'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await prisma.project.create({ data: req.body });
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// GET /projects/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        additives: { orderBy: { date: 'desc' } },
        measurements: { orderBy: { createdAt: 'desc' } },
        dailyProductions: {
          take: 30,
          orderBy: { date: 'desc' },
          include: { machine: { select: { name: true } }, operator: { select: { name: true } } },
        },
        financialEntries: { orderBy: { dueDate: 'desc' } },
        _count: { select: { measurements: true, additives: true, dailyProductions: true } },
      },
    });
    if (!project) {
      res.status(404).json({ error: 'Obra nao encontrada' });
      return;
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PUT /projects/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(projectSchema),
  auditLog('UPDATE', 'Project'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /projects/:id
router.delete(
  '/:id',
  authorize('ADMIN'),
  auditLog('DELETE', 'Project'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.project.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// GET /projects/:id/measurements
router.get('/:id/measurements', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const measurements = await prisma.measurement.findMany({
      where: { projectId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(measurements);
  } catch (error) {
    next(error);
  }
});

// POST /projects/:id/measurements
router.post(
  '/:id/measurements',
  authorize('ADMIN', 'MANAGER'),
  validate(measurementSchema),
  auditLog('CREATE', 'Measurement'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const measurement = await prisma.measurement.create({
        data: { ...req.body, projectId: req.params.id },
      });
      res.status(201).json(measurement);
    } catch (error) {
      next(error);
    }
  }
);

// GET /projects/:id/additives
router.get('/:id/additives', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const additives = await prisma.projectAdditive.findMany({
      where: { projectId: req.params.id },
      orderBy: { date: 'desc' },
    });
    res.json(additives);
  } catch (error) {
    next(error);
  }
});

// POST /projects/:id/additives
router.post(
  '/:id/additives',
  authorize('ADMIN', 'MANAGER'),
  validate(additiveSchema),
  auditLog('CREATE', 'ProjectAdditive'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const additive = await prisma.projectAdditive.create({
        data: { ...req.body, projectId: req.params.id },
      });
      res.status(201).json(additive);
    } catch (error) {
      next(error);
    }
  }
);

// GET /projects/:id/financial-summary
router.get('/:id/financial-summary', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, contractValue: true },
    });
    if (!project) {
      res.status(404).json({ error: 'Obra nao encontrada' });
      return;
    }

    const [
      measurements,
      additives,
      receivable,
      payable,
      fuelingCosts,
      maintenanceCosts,
    ] = await Promise.all([
      prisma.measurement.findMany({ where: { projectId: req.params.id } }),
      prisma.projectAdditive.findMany({ where: { projectId: req.params.id } }),
      prisma.financialEntry.aggregate({
        where: { projectId: req.params.id, type: 'RECEIVABLE', status: 'PAID' },
        _sum: { value: true },
      }),
      prisma.financialEntry.aggregate({
        where: { projectId: req.params.id, type: 'PAYABLE', status: 'PAID' },
        _sum: { value: true },
      }),
      prisma.fueling.aggregate({
        where: { machine: { dailyProductions: { some: { projectId: req.params.id } } } },
        _sum: { totalCost: true },
      }),
      prisma.maintenanceOrder.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { cost: true },
      }),
    ]);

    const totalMeasured = measurements.reduce((s, m) => s + Number(m.value), 0);
    const totalAdditives = additives.reduce((s, a) => s + Number(a.value), 0);
    const totalRevenue = Number(receivable._sum.value || 0);
    const totalCost = Number(payable._sum.value || 0);
    const contractValue = Number(project.contractValue);

    res.json({
      projectId: project.id,
      projectName: project.name,
      contractValue,
      totalAdditives,
      revisedContract: contractValue + totalAdditives,
      totalMeasured,
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      estimatedFuelingCost: Number(fuelingCosts._sum.totalCost || 0),
      estimatedMaintenanceCost: Number(maintenanceCosts._sum.cost || 0),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
