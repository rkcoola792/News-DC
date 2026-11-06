import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const password = randomBytes(24).toString('hex'),
  key = randomBytes(32).toString('hex');
try {
  await writeFile(
    new URL('../.env', import.meta.url),
    `POSTGRES_PASSWORD=${password}\nDATABASE_URL=postgresql://newsdc:${password}@127.0.0.1:55434/newsdc\nADMIN_API_KEY=${key}\nPORT=5000\nHOST=127.0.0.1\nINGESTION_ENABLED=false\nINGESTION_INTERVAL_MS=1800000\n`,
    { flag: 'wx', mode: 0o600 },
  );
  console.log(
    'Created local .env with random database and operator credentials. Open it locally for the Dashboard key.',
  );
} catch (error) {
  if (error.code === 'EEXIST')
    console.log(
      'Existing .env preserved. Check that DATABASE_URL and ADMIN_API_KEY are configured.',
    );
  else throw error;
}
