import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from './auth';

export const auditLog = (action: string, entity: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: unknown) {
      if (_res.statusCode < 400 && req.user) {
        const entityId =
          (req.params && req.params.id) ||
          (body && typeof body === 'object' && (body as Record<string, unknown>)['id']) ||
          'unknown';
        prisma.auditLog
          .create({
            data: {
              userId: req.user.id,
              action,
              entity,
              entityId: String(entityId),
              details: { method: req.method, path: req.path, body: req.body } as object,
            },
          })
          .catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};
