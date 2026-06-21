-- DiabeCare - schema inicial (sem migrations)
-- Ajuste tipos e constraints conforme seu produto evoluir.

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

-- Exemplos (opcional) - remova se preferir começar vazio.
-- INSERT INTO pacientes (nome, endereco, cpf, cartao_sus, senha)
-- VALUES ('Maria Silva Santos','Rua das Flores, 123, Centro','111.111.111-11','123 4567 8901 2345','123456');

-- INSERT INTO medicos (nome, crm, cpf, especialidade, senha)
-- VALUES ('Dr. Carlos Silva','123456','444.444.444-44','Endocrinologia','123456');

