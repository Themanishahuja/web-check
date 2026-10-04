import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import { closeBrowser } from './browser/browser-manager.js';
import { config } from './config.js';
import { scanRoutes } from './routes/scans.js';
import { ScanService } from './scan/scan-service.js';

export async function buildApp(): Promise<{
  app: FastifyInstance;
  service: ScanService;
}> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    trustProxy: process.env.TRUST_PROXY === 'true',
    bodyLimit: 4 * 1024,
  });
  const service = new ScanService();

  await app.register(cors, { origin: config.corsOrigins, methods: ['GET', 'POST'] });
  await app.register(rateLimit, { global: false });

  app.get('/health', async () => ({ status: 'ok' }));
  await app.register(scanRoutes(service), { prefix: '/api' });

  app.addHook('onClose', async () => {
    service.stop();
    await closeBrowser();
  });
  return { app, service };
}
