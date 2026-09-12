-- 2026_09_create_planos_e_assinaturas.sql
-- Catálogo de planos e vínculo de assinatura por administrador.
--
-- Sem FOREIGN KEY, seguindo o padrão das outras tabelas do projeto: o
-- synchronize do TypeORM está desligado justamente para não criar
-- constraints automáticas. A integridade é garantida na camada de serviço.
--
-- Execução: mysql -h <host> -u <user> -p <database> < este arquivo
-- O script é idempotente: rodar duas vezes não duplica nem sobrescreve
-- preços já ajustados pelo FullAdmin.

CREATE TABLE IF NOT EXISTS planos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(40) NOT NULL,
  nome VARCHAR(60) NOT NULL,
  limite_parceiros INT NULL COMMENT 'NULL = ilimitado',
  preco_mensal DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_anual DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_parceiro_extra DECIMAL(10,2) NULL,
  descricao VARCHAR(255) NULL,
  destaque TINYINT(1) NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_planos_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assinaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plano_id INT NOT NULL,
  ciclo VARCHAR(10) NOT NULL DEFAULT 'mensal' COMMENT 'mensal | anual',
  status VARCHAR(12) NOT NULL DEFAULT 'ativa' COMMENT 'ativa | cancelada | expirada',
  valor DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'valor fechado, não acompanha o catálogo',
  inicio DATE NOT NULL,
  expira_em DATE NULL COMMENT 'NULL = sem vencimento',
  observacao VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_assinaturas_user (user_id),
  KEY idx_assinaturas_plano (plano_id),
  KEY idx_assinaturas_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Catálogo inicial. INSERT IGNORE preserva ajustes de preço feitos depois.
INSERT IGNORE INTO planos
  (slug, nome, limite_parceiros, preco_mensal, preco_anual, preco_parceiro_extra, descricao, destaque, ativo, ordem)
VALUES
  ('free',       'Free',       3,    0.00,    0.00,    NULL,  'Para começar e testar a plataforma.',            0, 1, 1),
  ('start',      'Start',      10,   127.00,  1270.00, 19.00, 'Equipe pequena, até 10 parceiros ativos.',       0, 1, 2),
  ('growth',     'Growth',     30,   297.00,  2970.00, 14.00, 'O mais escolhido: até 30 parceiros ativos.',     1, 1, 3),
  ('scale',      'Scale',      100,  697.00,  6970.00, 9.00,  'Operação consolidada, até 100 parceiros.',       0, 1, 4),
  ('enterprise', 'Enterprise', NULL, 1497.00, 0.00,    NULL,  'Parceiros ilimitados, valor anual negociado.',   0, 1, 5);
