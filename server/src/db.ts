
console.log("DB.TS CARREGADO");
import pg from 'pg';

const { Pool } = pg;

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

console.log("PGHOST =", process.env.PGHOST);
console.log("PGDATABASE =", process.env.PGDATABASE);
console.log("PGUSER =", process.env.PGUSER);
console.log("PGPASSWORD length =", process.env.PGPASSWORD?.length);




export const pool = new Pool({
  host: requiredEnv('PGHOST'),
  port: Number(process.env.PGPORT || 5432),
  database: requiredEnv('PGDATABASE'),
  user: requiredEnv('PGUSER'),
  password: requiredEnv('PGPASSWORD'),
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}