require('dotenv').config();
const createApp = require('./app');
const { pool, checkConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await checkConnection();
    console.log('Database connection verified.');
  } catch (err) {
    console.error('Failed to connect to the database on startup:', err.message);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`Veyra API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await pool.end();
        console.log('Database pool closed. Goodbye.');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    });

    // Force-exit if shutdown hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
