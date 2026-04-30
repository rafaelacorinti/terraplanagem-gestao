import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message, err.stack);

  if (err.code === 'P2002') {
    res.status(409).json({ error: 'Registro duplicado' });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Registro não encontrado' });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Erro interno do servidor';

  res.status(statusCode).json({ error: message });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
};
