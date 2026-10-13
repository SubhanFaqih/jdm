import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/index.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`JDM API running on port ${env.PORT}`);
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close(async (error) => {
    try {
      await pool.end();
      process.exitCode = error ? 1 : 0;
    } catch (closeError) {
      console.error(closeError);
      process.exitCode = 1;
    } finally {
      clearTimeout(timeout);
    }
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
