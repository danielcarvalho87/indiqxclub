-- Migration para criar tabela configuracoes
-- Data: 2026-03-26

-- Primeiro, vamos verificar se a tabela users existe e sua estrutura
-- SHOW CREATE TABLE users;

-- Criar a tabela configuracoes sem a constraint de chave estrangeira primeiro
CREATE TABLE IF NOT EXISTS `configuracoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `master_id` int NOT NULL,
  `nome_empresa` varchar(200) NOT NULL,
  `cnpj` varchar(18) NOT NULL,
  `pontos_por_novo_usuario` int NOT NULL,
  `comissao_por_venda` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_configuracoes_master` (`master_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar se a tabela users existe antes de adicionar a constraint
-- Se houver erro, podemos adicionar a constraint manualmente depois
-- ALTER TABLE `configuracoes`
-- ADD CONSTRAINT `FK_configuracoes_master`
-- FOREIGN KEY (`master_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
