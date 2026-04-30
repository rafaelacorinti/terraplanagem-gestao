import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { fuelingSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /fueling/consumption-report — must be before /:id style routes
router.get('/consumption-report', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, machineId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    if (machineId) where.machineId = machineId;

    const fuelings = await prisma.fueling.findMany({
      where,
      include: { machine: { select: { id: true, name: true, model: true, type: true } } },
      orderBy: { date: 'desc' },
    });

    // Group by machine
    const byMachine = fuelings.reduce<Record<string, { name: string; model: string; type: string; totalLiters: number; totalCost: number; count: number }>>((acc, f) => {
      if (!acc[f.machineId]) {
        acc[f.machineId] = {
          name: f.machine.name,
          model: f.machine.model,
          type: f.machine.type,
          totalLiters: 0,
          totalCost: 0,
          count: 0,
        };
      }
      acc[f.machineId].totalLiters += Number(f.liters);
      acc[f.machineId].totalCost += Number(f.totalCost);
      acc[f.machineId].count += 1;
      return acc;
    }, {});

    const totalLiters = fuelings.reduce((s, f) => s + Number(f.liters), 0);
    const totalCost = fuelings.reduce((s, f) => s + Number(f.totalCost), 0);

    res.json({
      summary: { totalLiters, totalCost, totalRecords: fuelings.length },
      byMachine: Object.entries(byMachine).map(([machineId, data]) => ({ machineId, ...data })),
      records: fuelings,
    });
  } catch (error) {
    next(error);
  }
});

// GET /fueling/alerts — consumo fora do padrao
router.get('/alerts', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const fuelings = await prisma.fueling.findMany({
      where: { date: { gte: since } },
      include: { machine: { select: { id: true, name: true, model: true } } },
      orderBy: { date: 'desc' },
    });

    const byMachine: Record<string, { name: string; liters: number[]; totalCost: number }> = {};
    fuelings.forEach((f) => {
      if (!byMachine[f.machineId]) {
        byMachine[f.machineId] = { name: f.machine.name, liters: [], totalCost: 0 };
      }
      byMachine[f.machineId].liters.push(Number(f.liters));
      byMachine[f.machineId].totalCost += Number(f.totalCost);
    });

    const alerts = Object.entries(byMachine)
      .map(([machineId, data]) => {
        const avg = data.liters.reduce((a, b) => a + b, 0) / data.liters.length;
        const stdDev = Math.sqrt(data.liters.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / data.liters.length);
        const anomalies = data.liters.filter((l) => l > avg + 2 * stdDev);
        return {
          machineId,
          machineName: data.name,
          averageLiters: avg,
          stdDev,
          anomaliesCount: anomalies.length,
          totalCost: data.totalCost,
          hasAlert: anomalies.length > 0,
        };
      })
      .filter((a) => a.hasAlert);

    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

// GET /fueling
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { machineId, operatorId, startDate, endDate, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (machineId) where.machineId = machineId;
    if (operatorId) where.operatorId = operatorId;
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const [fuelings, total] = await Promise.all([
      prisma.fueling.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          machine: { select: { name: true } },
          operator: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.fueling.count({ where }),
    ]);
    res.json({ data: fuelings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

// POST /fueling
router.post(
  '/',
  validate(fuelingSchema),
  auditLog('CREATE', 'Fueling'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fueling = await prisma.fueling.create({ data: req.body });
      res.status(201).json(fueling);
    } catch (error) {
      next(error);
    }
  }
);

// GET /fueling/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fueling = await prisma.fueling.findUnique({
      where: { id: req.params.id },
      include: {
        machine: { select: { name: true, model: true } },
        operator: { select: { name: true } },
      },
    });
    if (!fueling) {
      res.status(404).json({ error: 'Abastecimento nao encontrado' });
      return;
    }
    res.json(fueling);
  } catch (error) {
    next(error);
  }
});

// PUT /fueling/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(fuelingSchema),
  auditLog('UPDATE', 'Fueling'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fueling = await prisma.fueling.update({ where: { id: req.params.id }, data: req.body });
      res.json(fueling);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /fueling/:id
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  auditLog('DELETE', 'Fueling'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.fueling.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
