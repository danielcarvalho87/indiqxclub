-- Migration: data de fechamento do contrato + taxa de pontos por real
-- Data: 2026-09-01
--
-- 1) clientes.data_fechamento
--    Relatórios usavam `updated_at` como data de fechamento. Qualquer edição
--    num contrato antigo movia o valor dele para o faturamento do mês atual.
--
-- 2) configuracoes.pontos_por_real
--    A pontuação somava 1 ponto por real faturado, um valor fixo em código que
--    tornava `pontos_por_novo_usuario` irrelevante. Agora é configurável.
--    O default 1 preserva exatamente a pontuação atual de todos os parceiros.

-- ============================================
-- 1. clientes.data_fechamento
-- ============================================
ALTER TABLE `clientes`
ADD COLUMN `data_fechamento` DATETIME NULL DEFAULT NULL
AFTER `status`;

-- Backfill: para contratos já fechados, `updated_at` é a melhor aproximação
-- disponível da data de fechamento.
UPDATE `clientes`
SET `data_fechamento` = COALESCE(`updated_at`, `created_at`)
WHERE `status` = 'Contrato fechado'
  AND `data_fechamento` IS NULL;

-- ============================================
-- 2. configuracoes.pontos_por_real
-- ============================================
ALTER TABLE `configuracoes`
ADD COLUMN `pontos_por_real` DECIMAL(10,2) NOT NULL DEFAULT 1.00
AFTER `pontos_por_novo_usuario`;

SELECT
  (SELECT COUNT(*) FROM `clientes` WHERE `data_fechamento` IS NOT NULL) AS contratos_com_data_fechamento,
  (SELECT COUNT(*) FROM `configuracoes`) AS configuracoes_atualizadas,
  'Migration concluida com sucesso.' AS status;
