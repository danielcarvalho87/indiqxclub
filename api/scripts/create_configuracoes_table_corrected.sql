-- Migration para criar tabela configuracoes 
-- Data: 2026-03-26 

-- Criar a tabela configuracoes com chave estrangeira para user (nome da tabela é 'user', não 'users')
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
  KEY `FK_configuracoes_master` (`master_id`),
  CONSTRAINT `FK_configuracoes_master` FOREIGN KEY (`master_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;