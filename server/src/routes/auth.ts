import { Router } from 'express';
import { query } from '../db.js';



export const authRouter = Router();

type LoginBody = {
  identifier: string;
  password: string;
};

type Patient = {
  id: string;
  nome: string;
  cpf: string;
};

type Doctor = {
  id: string;
  nome: string;
  cpf: string;
  crm: string;
};

authRouter.post('/login', async (req, res) => {
  const body = req.body as LoginBody;
  const { identifier, password } = body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier e password são obrigatórios' });
  }

  // Por simplicidade: senha em texto. Em produção, use hash (bcrypt/argon2).
  const rows = await query<Patient>(
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
  const body = req.body as LoginBody;
  const { identifier, password } = body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier e password são obrigatórios' });
  }

  const rows = await query<Doctor>(
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

