import fs from 'node:fs';
import path from 'node:path';
import { pool } from './db.js';
autoRunSetup().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[server] db setup failed:', err);
    process.exitCode = 1;
});
async function autoRunSetup() {
    // Garantir que o caminho do SQL é relativo ao diretório do arquivo, não ao cwd.
    const sqlFile = path.resolve(process.cwd(), 'server', 'sql_init.sql');
    const altSqlFile = path.resolve(process.cwd(), 'sql_init.sql');
    const finalSqlFile = fs.existsSync(sqlFile) ? sqlFile : altSqlFile;
    if (!fs.existsSync(finalSqlFile)) {
        // eslint-disable-next-line no-console
        console.warn('[server] sql_init.sql not found, skipping db setup', { tried: { sqlFile, altSqlFile } });
        return;
    }
    const sql = fs.readFileSync(finalSqlFile, 'utf-8');
    // Execução em lote simples (para iniciar rápido)
    await pool.query(sql);
    // eslint-disable-next-line no-console
    console.log('[server] db schema initialized/verified from sql_init.sql');
}
