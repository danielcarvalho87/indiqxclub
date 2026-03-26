-- Migration para criar tabela configuracoes 
-- Data: 2026-03-26 

-- Verificar se a tabela users existe antes de criar a constraint
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'users';

-- Criar a tabela configuracoes
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

-- Adicionar constraint de chave estrangeira se a tabela users existir
-- Se houver erro, podemos adicionar manualmente depois de verificar a estrutura
-- ALTER TABLE `configuracoes` 
-- ADD CONSTRAINT `FK_configuracoes_master` 
-- FOREIGN KEY (`master_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;