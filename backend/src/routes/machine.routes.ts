import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { machineSchema, machineDocumentSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /machines
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, type, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { patrimonyCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [machines, total] = await Promise.all([
      prisma.machine.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          company: { select: { name: true } },
          _count: { select: { dailyProductions: true, fuelings: true, maintenanceOrders: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.machine.count({ where }),
    ]);
    res.json({ data: machines, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

// POST /machines
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(machineSchema),
  auditLog('CREATE', 'Machine'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const machine = await prisma.machine.create({ data: req.body });
      res.status(201).json(machine);
    } catch (error) {
      next(error);
    }
  }
);

// GET /machines/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const machine = await prisma.machine.findUnique({
      where: { id: req.params.id },
      include: {
        company: { select: { name: true } },
        documents: true,
        maintenanceOrders: { orderBy: { scheduledDate: 'desc' }, take: 20 },
        maintenancePlans: true,
        fuelings: { take: 10, orderBy: { date: 'desc' }, include: { operator: { select: { name: true } } } },
      },
    });
    if (!machine) {
      res.status(404).json({ error: 'Maquina nao encontrada' });
      return;
    }
    res.json(machine);
  } catch (error) {
    next(error);
  }
});

// PUT /machines/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(machineSchema),
  auditLog('UPDATE', 'Machine'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const machine = await prisma.machine.update({ where: { id: req.params.id }, data: req.body });
      res.json(machine);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /machines/:id
router.delete(
  '/:id',
  authorize('ADMIN'),
  auditLog('DELETE', 'Machine'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.machine.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /machines/:id/hour-meter
router.patch(
  '/:id/hour-meter',
  authorize('ADMIN', 'MANAGER', 'OPERATOR'),
  auditLog('UPDATE', 'Machine'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hourMeter } = req.body as { hourMeter: number };
      if (typeof hourMeter !== 'number' || hourMeter < 0) {
        res.status(400).json({ error: 'Horimetro invalido' });
        return;
      }
      const machine = await prisma.machine.update({
        where: { id: req.params.id },
        data: { hourMeter },
      });
      res.json(machine);
    } catch (error) {
      next(error);
    }
  }
);

// GET /machines/:id/history — maintenance + fueling history
router.get('/:id/history', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [maintenanceOrders, fuelings] = await Promise.all([
      prisma.maintenanceOrder.findMany({
        where: { machineId: req.params.id },
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.fueling.findMany({
        where: { machineId: req.params.id },
        orderBy: { date: 'desc' },
        include: { operator: { select: { name: true } } },
      }),
    ]);
    res.json({ maintenanceOrders, fuelings });
  } catch (error) {
    next(error);
  }
});

// POST /machines/:id/documents
router.post(
  '/:id/documents',
  authorize('ADMIN', 'MANAGER'),
  validate(machineDocumentSchema),
  auditLog('CREATE', 'MachineDocument'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await prisma.machineDocument.create({
        data: { ...req.body, machineId: req.params.id },
      });
      res.status(201).json(doc);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
