import pg from 'pg';
const { Pool } = pg;
function requiredEnv(name) {
    const v = process.env[name];
    if (!v) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return v;
}
export const pool = new Pool({
    host: requiredEnv('PGHOST'),
    port: Number(process.env.PGPORT || 5432),
    database: requiredEnv('PGDATABASE'),
    user: requiredEnv('PGUSER'),
    password: requiredEnv('PGPASSWORD'),
});
export async function query(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows;
}
