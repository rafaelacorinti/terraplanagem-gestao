import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { maintenanceOrderSchema, maintenancePlanSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /maintenance/alerts - must be before /:id
router.get('/alerts', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await prisma.maintenancePlan.findMany({
      include: { machine: { select: { id: true, name: true, model: true, hourMeter: true, status: true } } },
    });
    const alerts = plans
      .map((plan) => {
        const currentHour = Number(plan.machine.hourMeter);
        const nextService = Number(plan.nextServiceHourMeter);
        const hoursUntilService = nextService - currentHour;
        return {
          planId: plan.id,
          machineId: plan.machine.id,
          machineName: plan.machine.name,
          description: plan.description,
          currentHourMeter: currentHour,
          nextServiceHourMeter: nextService,
          hoursUntilService,
          isOverdue: hoursUntilService <= 0,
          isWarning: hoursUntilService > 0 && hoursUntilService <= 20,
        };
      })
      .filter((a) => a.isOverdue || a.isWarning)
      .sort((a, b) => a.hoursUntilService - b.hoursUntilService);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

// GET /maintenance/orders
router.get('/orders', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, type, machineId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (machineId) where.machineId = machineId;
    const [orders, total] = await Promise.all([
      prisma.maintenanceOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          machine: { select: { name: true, model: true } },
        },
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.maintenanceOrder.count({ where }),
    ]);
    res.json({ data: orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

// POST /maintenance/orders
router.post(
  '/orders',
  authorize('ADMIN', 'MANAGER'),
  validate(maintenanceOrderSchema),
  auditLog('CREATE', 'MaintenanceOrder'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await prisma.maintenanceOrder.create({ data: req.body });
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
);

// GET /maintenance/orders/:id
router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await prisma.maintenanceOrder.findUnique({
      where: { id: req.params.id },
      include: {
        machine: true,
        partUsages: { include: { part: true } },
      },
    });
    if (!order) {
      res.status(404).json({ error: 'Registro de manutencao nao encontrado' });
      return;
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PUT /maintenance/orders/:id
router.put(
  '/orders/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(maintenanceOrderSchema),
  auditLog('UPDATE', 'MaintenanceOrder'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await prisma.maintenanceOrder.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /maintenance/orders/:id
router.delete(
  '/orders/:id',
  authorize('ADMIN'),
  auditLog('DELETE', 'MaintenanceOrder'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.maintenanceOrder.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /maintenance/orders/:id/complete - finalizar manutencao
router.patch(
  '/orders/:id/complete',
  authorize('ADMIN', 'MANAGER'),
  auditLog('UPDATE', 'MaintenanceOrder'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cost, completedDate, hourMeterAtService } = req.body as {
        cost?: number;
        completedDate?: string;
        hourMeterAtService?: number;
      };
      const order = await prisma.maintenanceOrder.update({
        where: { id: req.params.id },
        data: {
          status: 'COMPLETED',
          completedDate: completedDate ? new Date(completedDate) : new Date(),
          cost,
          hourMeterAtService,
        },
      });
      // Update machine status back to AVAILABLE if it was MAINTENANCE
      await prisma.machine.updateMany({
        where: { id: order.machineId, status: 'MAINTENANCE' },
        data: { status: 'AVAILABLE' },
      });
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

// GET /maintenance/plans
router.get('/plans', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { machineId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (machineId) where.machineId = machineId;
    const plans = await prisma.maintenancePlan.findMany({
      where,
      include: { machine: { select: { name: true, model: true, hourMeter: true } } },
    });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// POST /maintenance/plans
router.post(
  '/plans',
  authorize('ADMIN', 'MANAGER'),
  validate(maintenancePlanSchema),
  auditLog('CREATE', 'MaintenancePlan'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plan = await prisma.maintenancePlan.create({ data: req.body });
      res.status(201).json(plan);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /maintenance/plans/:id
router.put(
  '/plans/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(maintenancePlanSchema),
  auditLog('UPDATE', 'MaintenancePlan'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plan = await prisma.maintenancePlan.update({ where: { id: req.params.id }, data: req.body });
      res.json(plan);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /maintenance/plans/:id
router.delete(
  '/plans/:id',
  authorize('ADMIN', 'MANAGER'),
  auditLog('DELETE', 'MaintenancePlan'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.maintenancePlan.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
