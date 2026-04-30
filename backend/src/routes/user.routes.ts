import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { registerSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authenticate);

// GET /users
router.get('/', authorize('ADMIN', 'MANAGER'), async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// POST /users
router.post(
  '/',
  authorize('ADMIN'),
  validate(registerSchema),
  auditLog('CREATE', 'User'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashed, role: role || 'VIEWER' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /users/:id
router.put(
  '/:id',
  authorize('ADMIN'),
  auditLog('UPDATE', 'User'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, role, active } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { name, email, role, active },
        select: { id: true, name: true, email: true, role: true, active: true },
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /users/:id
router.delete(
  '/:id',
  authorize('ADMIN'),
  auditLog('DELETE', 'User'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.user.update({
        where: { id: req.params.id },
        data: { active: false },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
