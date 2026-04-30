import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Email e senha são obrigatórios', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      return next(createError('Credenciais inválidas', 401));
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(createError('Credenciais inválidas', 401));
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) return next(createError('Usuário não encontrado', 404));
    res.json(user);
  } catch (error) {
    next(error);
  }
};
