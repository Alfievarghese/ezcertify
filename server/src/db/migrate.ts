import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createMigrationClient } from './index.js';

async function runMigrations() {
  console.log('Running migrations...');
  const client = createMigrationClient();
  const db = drizzle(client);
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations complete.');
  await client.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
