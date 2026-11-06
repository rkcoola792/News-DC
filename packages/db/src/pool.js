import pg from 'pg';
export function createPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error('DATABASE_URL is required');
  if (!['postgres:', 'postgresql:'].includes(new URL(connectionString).protocol))
    throw new Error('DATABASE_URL must use PostgreSQL');
  return new pg.Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
    statement_timeout: 5000,
  });
}
