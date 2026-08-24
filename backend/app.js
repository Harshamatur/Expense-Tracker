const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const requestLogger = require('./middleware/requestLogger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const healthRoutes = require('./routes/healthRoutes');

/**
 * App initialization is kept separate from server startup (listen/pool
 * lifecycle) so the app can be imported and tested without binding a port.
 */
function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(generalLimiter);

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
