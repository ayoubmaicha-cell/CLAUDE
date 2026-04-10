import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import clientsRoutes from './routes/clients.routes';
import obligationsRoutes from './routes/obligations.routes';
import juridicalRoutes from './routes/juridical.routes';
import invoicesRoutes from './routes/invoices.routes';
import statsRoutes from './routes/stats.routes';
import alertsRoutes from './routes/alerts.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/clients', clientsRoutes);
app.use('/obligations', obligationsRoutes);
app.use('/juridical', juridicalRoutes);
app.use('/invoices', invoicesRoutes);
app.use('/stats', statsRoutes);
app.use('/alerts', alertsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 TaxBox API running on http://localhost:${PORT}`);
});
