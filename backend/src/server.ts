import app from './app';
import { config } from './config/env';
import { prisma } from './config/db';

const host = '0.0.0.0';
const port = config.port;

const server = app.listen(port, host, async () => {
  console.log(
    `🚀 ProblemPulse Backend server running on port ${port} [${config.nodeEnv}]`
  );
  console.log(`🔗 Health check available at http://localhost:${port}/api/health`);

  try {
    // Verify database connection on startup
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL Database connected successfully.');
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('⚠️ Warning: Database connection issue on startup:', errorMsg);
    // Don't crash immediately so /api/health can report status
  }
});

process.on('unhandledRejection', (err: unknown) => {
  const errorMsg = err instanceof Error ? err.stack || err.message : String(err);
  console.error('Unhandled Rejection:', errorMsg);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.stack || err.message);
  server.close(() => process.exit(1));
});

