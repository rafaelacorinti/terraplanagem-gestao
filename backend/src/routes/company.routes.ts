import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../utils/prisma';
import { companySchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

// GET /companies
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

// POST /companies
router.post(
  '/',
  authorize('ADMIN'),
  validate(companySchema),
  auditLog('CREATE', 'Company'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const company = await prisma.company.create({ data: req.body });
      res.status(201).json(company);
    } catch (error) {
      next(error);
    }
  }
);

// GET /companies/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) {
      res.status(404).json({ error: 'Empresa nao encontrada' });
      return;
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
});

// PUT /companies/:id
router.put(
  '/:id',
  authorize('ADMIN'),
  validate(companySchema),
  auditLog('UPDATE', 'Company'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const company = await prisma.company.update({ where: { id: req.params.id }, data: req.body });
      res.json(company);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /companies/:id
router.delete(
  '/:id',
  authorize('ADMIN'),
  auditLog('DELETE', 'Company'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.company.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
