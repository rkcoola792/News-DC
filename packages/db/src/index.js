import { PrismaClient } from '../generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
export { createPool } from './pool.js';
export { migrate } from './migrations.js';
export { createContent, getContentById } from './content.js';

export function createDatabase(
  connectionString = process.env.DATABASE_URL,
  { schema = 'public' } = {},
) {
  if (!connectionString) throw new Error('DATABASE_URL is required');
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error('DATABASE_URL must use PostgreSQL');
  const adapter = new PrismaPg(
    {
      connectionString,
      max: 10,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
      statement_timeout: 5000,
    },
    { schema },
  );
  return new PrismaClient({ adapter, log: [] });
}
export async function checkDatabaseReady(db) {
  const applied = await db.schema_migrations.findMany({
    where: {
      name: {
        in: [
          '001_foundation.sql',
          '002_taxonomy.sql',
          '003_fingerprint.sql',
          '004_ai_provider_limits.sql',
          '005_remove_ai_demo_caps.sql',
        ],
      },
    },
    select: { name: true },
  });
  if (applied.length !== 5) throw new Error('Migrations pending');
}
