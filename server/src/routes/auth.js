import { Router } from 'express';
import { query } from '../db.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier e password são obrigatórios' });
  }

  const rows = await query(
    `SELECT id, nome, cpf
     FROM pacientes
     WHERE cpf = $1 AND senha = $2
     LIMIT 1`,
    [identifier, password]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'CPF ou senha inválidos' });
  }

  return res.json({ user: rows[0], role: 'paciente' });
});

authRouter.post('/doctor/login', async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier e password são obrigatórios' });
  }

  const rows = await query(
    `SELECT id, nome, cpf, crm
     FROM medicos
     WHERE crm = $1 AND senha = $2
     LIMIT 1`,
    [identifier, password]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'CRM ou senha inválidos' });
  }

  return res.json({ user: rows[0], role: 'medico' });
});

