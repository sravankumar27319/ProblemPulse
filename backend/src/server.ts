import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(
    `🚀 ProblemPulse Backend server running on port ${config.port} [${config.nodeEnv}]`
  );
  console.log(`🔗 Health check available at http://localhost:${config.port}/api/health`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
