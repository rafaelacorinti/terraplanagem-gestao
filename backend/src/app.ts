import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import projectRoutes from './routes/project.routes';
import machineRoutes from './routes/machine.routes';
import employeeRoutes from './routes/employee.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import fuelingRoutes from './routes/fueling.routes';
import productionRoutes from './routes/production.routes';
import financialRoutes from './routes/financial.routes';
import dashboardRoutes from './routes/dashboard.routes';
import auditRoutes from './routes/audit.routes';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fueling', fuelingRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

app.use(errorHandler);

export default app;
