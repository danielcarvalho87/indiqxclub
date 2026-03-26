-- Script para adicionar o campo observacoes na tabela financeiro
-- Este campo já foi adicionado na entidade TypeORM, mas precisa ser sincronizado no banco

ALTER TABLE `financeiro`
ADD COLUMN `observacoes` TEXT NULL DEFAULT NULL
AFTER `data_pagamento`;


-- Comando alternativo caso a tabela tenha nome diferente
-- ALTER TABLE `servicos`
-- ADD COLUMN `observacoes` TEXT NULL DEFAULT NULL
-- AFTER `data_pagamento`;
