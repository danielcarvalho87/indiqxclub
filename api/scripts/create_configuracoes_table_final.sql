-- Migration para criar tabela configuracoes 
-- Data: 2026-03-26 

-- Criar a tabela configuracoes sem constraint de chave estrangeira
-- A constraint pode ser adicionada manualmente após verificar a estrutura da tabela user
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
  KEY `idx_configuracoes_master_id` (`master_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 

-- Instruções para adicionar a constraint manualmente:
-- 1. Primeiro verifique a estrutura da tabela user:
--    DESCRIBE user;
-- 
-- 2. Se a tabela user existir e tiver uma coluna 'id', adicione a constraint:
--    ALTER TABLE `configuracoes` 
--    ADD CONSTRAINT `FK_configuracoes_master` 
--    FOREIGN KEY (`master_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
--
-- 3. Se houver erro, verifique se o nome da tabela é 'users' ou 'user' e ajuste a referência