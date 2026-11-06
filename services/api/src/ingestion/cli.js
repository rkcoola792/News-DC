import { createDatabase } from '@newsdc/db';
import { seedSources } from './sources.js';
import { createIngestion } from './service.js';
const db = createDatabase();
try {
  await seedSources(db);
  await createIngestion(db).run();
  console.log(
    JSON.stringify({
      event: 'ingestion_finished',
      runs: await db.ingestion_runs.findMany({
        take: 2,
        orderBy: { started_at: 'desc' },
        select: {
          status: true,
          fetched_count: true,
          inserted_count: true,
          skipped_count: true,
          failed_count: true,
          error_summary: true,
        },
      }),
    }),
  );
} finally {
  await db.$disconnect();
}
