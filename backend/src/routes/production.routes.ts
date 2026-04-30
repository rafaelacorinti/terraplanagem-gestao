import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { productionSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /production/summary - must be before /:id
router.get('/summary', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, projectId, machineId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    if (projectId) where.projectId = projectId;
    if (machineId) where.machineId = machineId;

    const productions = await prisma.dailyProduction.findMany({
      where,
      include: {
        machine: { select: { name: true, type: true } },
        operator: { select: { name: true } },
        project: { select: { name: true } },
      },
    });

    const totalHours = productions.reduce((s, p) => s + Number(p.hoursWorked), 0);
    const totalStoppageHours = productions.reduce((s, p) => s + Number(p.stoppageHours), 0);
    const totalVolume = productions.reduce((s, p) => s + Number(p.volumeMoved || 0), 0);
    const productiveHours = totalHours - totalStoppageHours;

    // Group by project
    const byProject: Record<string, { name: string; hours: number; volume: number; days: number }> = {};
    productions.forEach((p) => {
      if (!byProject[p.projectId]) {
        byProject[p.projectId] = { name: p.project.name, hours: 0, volume: 0, days: 0 };
      }
      byProject[p.projectId].hours += Number(p.hoursWorked);
      byProject[p.projectId].volume += Number(p.volumeMoved || 0);
      byProject[p.projectId].days += 1;
    });

    // Group by machine
    const byMachine: Record<string, { name: string; type: string; hours: number; volume: number }> = {};
    productions.forEach((p) => {
      if (!byMachine[p.machineId]) {
        byMachine[p.machineId] = { name: p.machine.name, type: p.machine.type, hours: 0, volume: 0 };
      }
      byMachine[p.machineId].hours += Number(p.hoursWorked);
      byMachine[p.machineId].volume += Number(p.volumeMoved || 0);
    });

    res.json({
      summary: {
        totalRecords: productions.length,
        totalHours,
        productiveHours,
        totalStoppageHours,
        totalVolume,
        efficiencyRate: totalHours > 0 ? (productiveHours / totalHours) * 100 : 0,
      },
      byProject: Object.entries(byProject).map(([projectId, d]) => ({ projectId, ...d })),
      byMachine: Object.entries(byMachine).map(([machineId, d]) => ({ machineId, ...d })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /production
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, machineId, projectId, operatorId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    if (machineId) where.machineId = machineId;
    if (projectId) where.projectId = projectId;
    if (operatorId) where.operatorId = operatorId;

    const [productions, total] = await Promise.all([
      prisma.dailyProduction.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          machine: { select: { name: true } },
          operator: { select: { name: true } },
          project: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.dailyProduction.count({ where }),
    ]);
    res.json({ data: productions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

// POST /production
router.post(
  '/',
  validate(productionSchema),
  auditLog('CREATE', 'DailyProduction'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const production = await prisma.dailyProduction.create({
        data: req.body,
        include: {
          machine: { select: { name: true } },
          operator: { select: { name: true } },
          project: { select: { name: true } },
        },
      });
      res.status(201).json(production);
    } catch (error) {
      next(error);
    }
  }
);

// GET /production/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const production = await prisma.dailyProduction.findUnique({
      where: { id: req.params.id },
      include: {
        machine: { select: { name: true, model: true } },
        operator: { select: { name: true } },
        project: { select: { name: true } },
      },
    });
    if (!production) {
      res.status(404).json({ error: 'Apontamento nao encontrado' });
      return;
    }
    res.json(production);
  } catch (error) {
    next(error);
  }
});

// PUT /production/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(productionSchema),
  auditLog('UPDATE', 'DailyProduction'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const production = await prisma.dailyProduction.update({ where: { id: req.params.id }, data: req.body });
      res.json(production);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /production/:id
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  auditLog('DELETE', 'DailyProduction'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.dailyProduction.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
