
-- DiabeCare - schema inicial

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  endereco text NOT NULL,
  cpf text NOT NULL UNIQUE,
  cartao_sus text,
  senha text NOT NULL
);

CREATE TABLE IF NOT EXISTS medicos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  crm text NOT NULL UNIQUE,
  cpf text NOT NULL,
  especialidade text,
  senha text NOT NULL
);

-- =========================================
-- PACIENTES DE DEMONSTRAÇÃO
-- =========================================

INSERT INTO pacientes (nome, endereco, cpf, cartao_sus, senha)
VALUES
(
  'Maria Silva Santos',
  'Rua das Flores, 123, Centro, Saquarema - RJ',
  '111.111.111-11',
  '123 4567 8901 2345',
  '123456'
),
(
  'João Pedro Oliveira',
  'Av. Principal, 456, Bacaxá, Saquarema - RJ',
  '222.222.222-22',
  '234 5678 9012 3456',
  '123456'
),
(
  'Ana Paula Costa',
  'Rua do Comércio, 789, Sampaio Correia, Saquarema - RJ',
  '333.333.333-33',
  '345 6789 0123 4567',
  '123456'
)
ON CONFLICT (cpf) DO NOTHING;

-- =========================================
-- MÉDICOS DE DEMONSTRAÇÃO
-- =========================================

INSERT INTO medicos (nome, crm, cpf, especialidade, senha)
VALUES
(
  'Dr. Carlos Silva',
  '123456',
  '444.444.444-44',
  'Endocrinologia',
  '123456'
),
(
  'Dra. Fernanda Costa',
  '789012',
  '555.555.555-55',
  'Nutrição',
  '123456'
)
ON CONFLICT (crm) DO NOTHING;

-- =========================================
-- MEDICAMENTOS PRESCRITOS
-- =========================================

CREATE TABLE IF NOT EXISTS medicamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_cpf TEXT NOT NULL
        REFERENCES pacientes(cpf)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    nome TEXT NOT NULL,
    dosagem TEXT NOT NULL,
    horarios TEXT[] NOT NULL DEFAULT '{}',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicamentos_paciente
ON medicamentos(paciente_cpf);