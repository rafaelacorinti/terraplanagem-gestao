import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../utils/schemas';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// POST /auth/register
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role } = req.body as {
        name: string;
        email: string;
        password: string;
        role?: string;
      };
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ error: 'Email já cadastrado' });
        return;
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashed, role: (role as any) || 'VIEWER' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      res.status(201).json({ token, user });
    } catch (error) {
      next(error);
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.active) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      next(error);
    }
  }
);

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
