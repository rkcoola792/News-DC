import { createPool } from './pool.js';
import { migrate } from './migrations.js';
let pool;
try {
  pool = createPool();
  console.log(JSON.stringify({ event: 'migrations_complete', applied: await migrate(pool) }));
} catch {
  console.error(
    JSON.stringify({
      event: 'migration_failed',
      message: 'Check database connectivity and migration compatibility.',
    }),
  );
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
