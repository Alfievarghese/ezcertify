import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ezcertify',
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  // URLs
  verifyBaseUrl: process.env.VERIFY_BASE_URL || 'http://localhost:5173/verify',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // File storage
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  generatedDir: process.env.GENERATED_DIR || './generated',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  
  // Retention
  uploadRetentionHours: parseInt(process.env.UPLOAD_RETENTION_HOURS || '2', 10),
  generatedRetentionHours: parseInt(process.env.GENERATED_RETENTION_HOURS || '48', 10),
  
  // Rendering
  maxWorkerConcurrency: parseInt(process.env.MAX_WORKER_CONCURRENCY || '4', 10),
} as const;
