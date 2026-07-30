import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { config } from '../config.js';

// Connection for queries (pool)
const queryClient = postgres(config.databaseUrl);

// Drizzle instance
export const db = drizzle(queryClient, { schema });

// Export for migration client (needs max 1 connection)
export function createMigrationClient() {
  return postgres(config.databaseUrl, { max: 1 });
}
