import { Queue, Worker, Job } from 'bullmq';
import { createRedisConnection } from './connection.js';
import { generateCertificates, type GenerationOptions, type GenerationResult } from '../services/certificate-generator.js';
import { config } from '../config.js';

const QUEUE_NAME = 'certificate-generation';

// In-memory progress store (per job ID)
// In production, this could be Redis-backed for multi-instance
export const jobProgress = new Map<string, {
  current: number;
  total: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  result?: GenerationResult;
  error?: string;
}>();

/**
 * Create the BullMQ queue for producing generation jobs.
 */
export function createGenerationQueue() {
  const connection = createRedisConnection();
  
  const queue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      removeOnComplete: { age: 3600 }, // Remove completed jobs after 1 hour
      removeOnFail: { age: 7200 },     // Remove failed jobs after 2 hours
      attempts: 1,                       // Don't retry — bulk renders should not auto-retry
    },
  });
  
  return queue;
}

/**
 * Create the BullMQ worker that processes generation jobs.
 * 
 * CPU-intensive work (canvas rendering) runs in this process.
 * Concurrency is set to 1 per worker process since rendering is CPU-bound.
 * Scale by running multiple worker processes (PM2/Render), not by increasing concurrency.
 */
export function createGenerationWorker() {
  const connection = createRedisConnection();
  
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const { layout, rows, outputFormat, qrBoundColumn, extraDisplayColumns } = job.data;
      
      // Initialize progress
      jobProgress.set(job.id!, {
        current: 0,
        total: rows.length,
        status: 'active',
      });
      
      try {
        const result = await generateCertificates({
          layout,
          rows,
          outputFormat,
          qrBoundColumn,
          extraDisplayColumns,
          onProgress: (current, total) => {
            jobProgress.set(job.id!, {
              current,
              total,
              status: 'active',
            });
            // Update BullMQ job progress
            job.updateProgress({ current, total });
          },
        });
        
        jobProgress.set(job.id!, {
          current: rows.length,
          total: rows.length,
          status: 'completed',
          result,
        });
        
        return result;
        
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        
        jobProgress.set(job.id!, {
          current: 0,
          total: rows.length,
          status: 'failed',
          error: message,
        });
        
        throw error;
      }
    },
    {
      connection,
      concurrency: 1, // CPU-bound: 1 job at a time per worker
    }
  );
  
  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });
  
  worker.on('failed', (job, error) => {
    console.log(`Job ${job?.id} failed: ${error.message}`);
  });
  
  return worker;
}
