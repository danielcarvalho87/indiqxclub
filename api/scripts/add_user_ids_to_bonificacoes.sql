-- Migration para adicionar as colunas master_id e userId na tabela bonificacoes
-- Data: 2026-03-26

USE `saudeflow`; -- Substitua pelo nome do seu banco de dados se for diferente, geralmente é saudeflow ou indiqxclub

-- Adicionando as colunas
ALTER TABLE `bonificacoes`
ADD COLUMN `master_id` int DEFAULT NULL,
ADD COLUMN `userId` int DEFAULT NULL;

-- (Opcional) Adicionando as chaves estrangeiras referenciando a tabela users
-- Se o seu banco reclamar de foreign key, você pode rodar apenas os comandos de ADD COLUMN acima.
-- ALTER TABLE `bonificacoes`
-- ADD CONSTRAINT `FK_bonificacoes_master` FOREIGN KEY (`master_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
-- ADD CONSTRAINT `FK_bonificacoes_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL;

SELECT 'Migration concluída com sucesso. Colunas master_id e userId adicionadas em bonificacoes.' as 'Status';
