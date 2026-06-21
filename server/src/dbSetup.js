import fs from 'node:fs';
import path from 'node:path';
import { pool } from './db.js';

autoRunSetup().catch((err) => {
  console.error('[server] db setup failed:', err);
  process.exitCode = 1;
});

async function autoRunSetup() {
  const sqlFile = path.resolve(process.cwd(), 'sql_init.sql');
  if (!fs.existsSync(sqlFile)) {
    console.warn('[server] sql_init.sql not found, skipping db setup');
    return;
  }

  const sql = fs.readFileSync(sqlFile, 'utf-8');
  await pool.query(sql);
  console.log('[server] db schema initialized/verified from sql_init.sql');
}

