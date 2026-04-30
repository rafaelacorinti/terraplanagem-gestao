import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { employeeSchema, trainingSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /employees
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, status, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          company: { select: { name: true } },
          _count: { select: { trainings: true, dailyProductions: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.employee.count({ where }),
    ]);
    res.json({ data: employees, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

// POST /employees
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(employeeSchema),
  auditLog('CREATE', 'Employee'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await prisma.employee.create({ data: req.body });
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }
);

// GET /employees/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        company: { select: { name: true } },
        trainings: { orderBy: { date: 'desc' } },
        dailyProductions: {
          take: 30,
          orderBy: { date: 'desc' },
          include: {
            machine: { select: { name: true } },
            project: { select: { name: true } },
          },
        },
      },
    });
    if (!employee) {
      res.status(404).json({ error: 'Colaborador não encontrado' });
      return;
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
});

// PUT /employees/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(employeeSchema),
  auditLog('UPDATE', 'Employee'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await prisma.employee.update({ where: { id: req.params.id }, data: req.body });
      res.json(employee);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /employees/:id (soft delete via status)
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  auditLog('DELETE', 'Employee'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await prisma.employee.update({
        where: { id: req.params.id },
        data: { status: 'INACTIVE' },
      });
      res.json(employee);
    } catch (error) {
      next(error);
    }
  }
);

// GET /employees/:id/trainings
router.get('/:id/trainings', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trainings = await prisma.training.findMany({
      where: { employeeId: req.params.id },
      orderBy: { date: 'desc' },
    });
    res.json(trainings);
  } catch (error) {
    next(error);
  }
});

// POST /employees/:id/trainings
router.post(
  '/:id/trainings',
  authorize('ADMIN', 'MANAGER'),
  validate(trainingSchema),
  auditLog('CREATE', 'Training'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const training = await prisma.training.create({
        data: { ...req.body, employeeId: req.params.id },
      });
      res.status(201).json(training);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
