
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

export const authRouter = Router();
// LISTAR PACIENTES CADASTRADOS
authRouter.get('/patients', async (req, res) => {
  try {
    const rows = await query(
      `SELECT
         nome,
         endereco,
         cpf,
         cartao_sus AS "cartaoSus"
       FROM pacientes
       ORDER BY nome ASC`
    );

    return res.json(rows);
  } catch (error) {
    console.error('[patients list]', error);

    return res.status(500).json({
      error: 'Erro ao listar pacientes.'
    });
  }
});
console.log('[ROTAS] GET /patients registrada');

// CADASTRAR PACIENTE
authRouter.post('/register', async (req, res) => {
  try {
    const { nome, endereco, cpf, cartaoSus, senha } = req.body || {};

    if (!nome || !endereco || !cpf || !cartaoSus || !senha) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios.'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        error: 'A senha deve ter no mínimo 6 caracteres.'
      });
    }

    const existing = await query(
      'SELECT id FROM pacientes WHERE cpf = $1 LIMIT 1',
      [cpf]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Já existe um usuário cadastrado com este CPF.'
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const rows = await query(
      `INSERT INTO pacientes
       (nome, endereco, cpf, cartao_sus, senha)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, endereco, cpf, cartao_sus`,
      [nome, endereco, cpf, cartaoSus, hashedPassword]
    );

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      user: rows[0]
    });

  } catch (error) {
    console.error('[register]', error);

    return res.status(500).json({
      error: 'Erro interno ao realizar cadastro.'
    });
  }
});


// LOGIN DO PACIENTE
authRouter.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'identifier e password são obrigatórios'
      });
    }

    const rows = await query(
      `SELECT id, nome, cpf, senha
       FROM pacientes
       WHERE cpf = $1
       LIMIT 1`,
      [identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'CPF ou senha inválidos'
      });
    }

    const user = rows[0];

    let passwordValid = false;

    // Compatibilidade com contas antigas que ainda possuem senha sem hash
    if (user.senha.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, user.senha);
    } else if (user.senha === password) {
      passwordValid = true;

      // Atualiza a senha antiga para uma senha criptografada
      const hashedPassword = await bcrypt.hash(password, 10);

      await query(
        'UPDATE pacientes SET senha = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
    }

    if (!passwordValid) {
      return res.status(401).json({
        error: 'CPF ou senha inválidos'
      });
    }

    return res.json({
      user: {
        id: user.id,
        nome: user.nome,
        cpf: user.cpf
      },
      role: 'paciente'
    });

  } catch (error) {
    console.error('[login]', error);

    return res.status(500).json({
      error: 'Erro interno ao realizar login.'
    });
  }
});


// LOGIN DO MÉDICO
authRouter.post('/doctor/login', async (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'identifier e password são obrigatórios'
      });
    }

    const rows = await query(
      `SELECT id, nome, cpf, crm, senha
       FROM medicos
       WHERE crm = $1
       LIMIT 1`,
      [identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'CRM ou senha inválidos'
      });
    }

    const doctor = rows[0];

    let passwordValid = false;

    if (doctor.senha.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, doctor.senha);
    } else if (doctor.senha === password) {
      passwordValid = true;

      const hashedPassword = await bcrypt.hash(password, 10);

      await query(
        'UPDATE medicos SET senha = $1 WHERE id = $2',
        [hashedPassword, doctor.id]
      );
    }

    if (!passwordValid) {
      return res.status(401).json({
        error: 'CRM ou senha inválidos'
      });
    }

    return res.json({
      user: {
        id: doctor.id,
        nome: doctor.nome,
        cpf: doctor.cpf,
        crm: doctor.crm
      },
      role: 'medico'
    });

  } catch (error) {
    console.error('[doctor login]', error);

    return res.status(500).json({
      error: 'Erro interno ao realizar login.'
    });
  }
});





// =========================================
// MEDICAMENTOS - LISTAR
// =========================================
authRouter.get('/medications', async (req, res) => {
  try {
    const { patientCpf } = req.query;

    if (!patientCpf) {
      return res.status(400).json({
        error: 'CPF do paciente é obrigatório.'
      });
    }

    const rows = await query(
      `SELECT
         id,
         nome AS name,
         dosagem AS dosage,
         paciente_cpf AS "patientCpf",
         horarios AS schedules,
         vezes_por_dia AS "vezesPorDia"
       FROM medicamentos
       WHERE paciente_cpf = $1
       ORDER BY criado_em DESC`,
      [patientCpf]
    );

    return res.json(rows);
  } catch (error) {
    console.error('[medications list]', error);
    return res.status(500).json({
      error: 'Erro ao listar medicamentos.'
    });
  }
});

// =========================================
// MEDICAMENTOS - CADASTRAR
// =========================================
authRouter.post('/medications', async (req, res) => {
  try {
    const {
      patientCpf,
      name,
      dosage,
      schedules = [],
      vezesPorDia
    } = req.body || {};

    if (!patientCpf || !name || !dosage) {
      return res.status(400).json({
        error: 'CPF, medicamento e dosagem são obrigatórios.'
      });
    }

    if (!Number.isInteger(vezesPorDia) ||
        ![1, 2].includes(vezesPorDia)) {
      return res.status(400).json({
        error: 'A frequência deve ser 1 ou 2 vezes ao dia.'
      });
    }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        error: 'Os horários devem ser enviados como uma lista.'
      });
    }

    const rows = await query(
      `INSERT INTO medicamentos
        (paciente_cpf, nome, dosagem, horarios, vezes_por_dia)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         nome AS name,
         dosagem AS dosage,
         paciente_cpf AS "patientCpf",
         horarios AS schedules,
         vezes_por_dia AS "vezesPorDia"`,
      [patientCpf, name, dosage, schedules, vezesPorDia]
    );

    return res.status(201).json({
      message: 'Medicamento cadastrado com sucesso!',
      medication: rows[0]
    });
  } catch (error) {
    console.error('[medications create]', error);
    return res.status(500).json({
      error: 'Erro ao cadastrar medicamento.'
    });
  }
});


// =========================================
// MEDICAMENTOS - EDITAR
// =========================================
authRouter.put('/medications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, schedules, vezesPorDia } = req.body || {};

    // Verifica se existe pelo menos um campo para atualizar
    if (
      name === undefined &&
      dosage === undefined &&
      schedules === undefined &&
      vezesPorDia === undefined
    ) {
      return res.status(400).json({
        error: 'Informe pelo menos um campo para atualizar.'
      });
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        error: 'O nome do medicamento não pode ficar vazio.'
      });
    }

    if (dosage !== undefined && (typeof dosage !== 'string' || !dosage.trim())) {
      return res.status(400).json({
        error: 'A dosagem não pode ficar vazia.'
      });
    }

    if (
      vezesPorDia !== undefined &&
      (!Number.isInteger(vezesPorDia) || ![1, 2].includes(vezesPorDia))
    ) {
      return res.status(400).json({
        error: 'A frequência deve ser 1 ou 2 vezes ao dia.'
      });
    }

    if (
      schedules !== undefined &&
      (!Array.isArray(schedules) ||
        !schedules.every(
          horario =>
            typeof horario === 'string' &&
            /^([01]\d|2[0-3]):[0-5]\d$/.test(horario)
        ))
    ) {
      return res.status(400).json({
        error: 'Informe horários válidos no formato HH:MM.'
      });
    }

    const rows = await query(
      `UPDATE medicamentos
       SET nome = COALESCE($1, nome),
           dosagem = COALESCE($2, dosagem),
           horarios = COALESCE($3::text[], horarios),
           vezes_por_dia = COALESCE($4::smallint, vezes_por_dia)
       WHERE id = $5
       RETURNING
         id,
         nome AS name,
         dosagem AS dosage,
         paciente_cpf AS "patientCpf",
         horarios AS schedules,
         vezes_por_dia AS "vezesPorDia"`,
      [
        name === undefined ? null : name.trim(),
        dosage === undefined ? null : dosage.trim(),
        schedules === undefined ? null : schedules,
        vezesPorDia === undefined ? null : vezesPorDia,
        id
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Medicamento não encontrado.'
      });
    }

    return res.json({
      message: 'Medicamento atualizado com sucesso!',
      medication: rows[0]
    });

  } catch (error) {
    console.error('[medications update]', error);

    return res.status(500).json({
      error: 'Erro ao atualizar medicamento.'
    });
  }
});


// =========================================
// MEDICAMENTOS - EXCLUIR
// =========================================
authRouter.delete('/medications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await query(
      `DELETE FROM medicamentos
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Medicamento não encontrado.'
      });
    }

    return res.json({
      message: 'Medicamento removido com sucesso!'
    });
  } catch (error) {
    console.error('[medications delete]', error);
    return res.status(500).json({
      error: 'Erro ao remover medicamento.'
    });
  }
});
