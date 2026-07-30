import IORedis from 'ioredis';
import { config } from '../config.js';

/**
 * Shared Redis connection config for BullMQ queue and workers.
 */
export function createRedisConnection() {
  return new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null, // Required by BullMQ
  });
}
