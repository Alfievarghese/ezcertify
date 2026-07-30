import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { uploadRoutes } from './routes/upload.js';
import { generateRoutes } from './routes/generate.js';
import { verifyRoutes } from './routes/verify.js';
import { createGenerationWorker } from './queue/worker.js';
import { runCleanup } from './jobs/cleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
      // Don't log request bodies (may contain personal data)
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
          };
        },
      },
    },
  });
  
  // CORS — allow frontend origin
  await fastify.register(cors, {
    origin: config.clientUrl,
    credentials: true,
  });
  
  // Multipart file uploads (50MB max)
  await fastify.register(multipart, {
    limits: {
      fileSize: config.maxFileSizeMb * 1024 * 1024,
    },
  });
  
  // Serve uploaded template images (for canvas editor preview)
  await fs.mkdir(config.uploadDir, { recursive: true });
  await fastify.register(fastifyStatic, {
    root: path.resolve(config.uploadDir),
    prefix: '/api/uploads/',
    decorateReply: false,
  });
  
  // Serve generated files (for download)
  await fs.mkdir(config.generatedDir, { recursive: true });
  await fastify.register(fastifyStatic, {
    root: path.resolve(config.generatedDir),
    prefix: '/api/generated/',
    decorateReply: false,
  });
  
  // Register routes
  await fastify.register(uploadRoutes);
  await fastify.register(generateRoutes);
  await fastify.register(verifyRoutes);
  
  // Health check
  fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
  
  // Start the BullMQ worker (in the same process for local dev)
  let worker: ReturnType<typeof createGenerationWorker> | null = null;
  try {
    worker = createGenerationWorker();
    console.log('BullMQ worker started');
  } catch (error) {
    console.warn('BullMQ worker failed to start (Redis may not be running):', (error as Error).message);
    console.warn('Certificate generation will not work without Redis.');
  }
  
  // Schedule cleanup job (runs every hour)
  const cleanupInterval = setInterval(() => {
    runCleanup().catch(err => console.error('Cleanup error:', err));
  }, 60 * 60 * 1000);
  
  // Run initial cleanup on startup
  runCleanup().catch(() => {});
  
  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down...');
    clearInterval(cleanupInterval);
    if (worker) await worker.close();
    await fastify.close();
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  
  // Start server
  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://${config.host}:${config.port}`);
    console.log(`Accepting uploads from: ${config.clientUrl}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
