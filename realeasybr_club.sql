-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 26/09/2026 às 21:28
-- Versão do servidor: 10.5.29-MariaDB-cll-lve
-- Versão do PHP: 8.4.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `realeasybr_club`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `assinaturas`
--

CREATE TABLE `assinaturas` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plano_id` int(11) NOT NULL,
  `ciclo` varchar(10) NOT NULL DEFAULT 'mensal' COMMENT 'mensal | anual',
  `status` varchar(12) NOT NULL DEFAULT 'ativa' COMMENT 'ativa | cancelada | expirada',
  `valor` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'valor fechado, não acompanha o catálogo',
  `inicio` date NOT NULL,
  `expira_em` date DEFAULT NULL COMMENT 'NULL = sem vencimento',
  `observacao` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `assinaturas`
--

INSERT INTO `assinaturas` (`id`, `user_id`, `plano_id`, `ciclo`, `status`, `valor`, `inicio`, `expira_em`, `observacao`, `created_at`, `updated_at`) VALUES
(1, 120, 5, 'mensal', 'ativa', 1497.00, '2026-09-12', '2026-10-12', NULL, '2026-09-12 00:56:01', '2026-09-12 00:56:01'),
(2, 119, 2, 'mensal', 'ativa', 127.00, '2026-09-12', '2026-10-12', NULL, '2026-09-12 00:56:14', '2026-09-12 00:56:14');

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonificacoes`
--

CREATE TABLE `bonificacoes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `pontuacao` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `master_id` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Despejando dados para a tabela `bonificacoes`
--

INSERT INTO `bonificacoes` (`id`, `titulo`, `descricao`, `pontuacao`, `status`, `created_at`, `updated_at`, `master_id`, `userId`) VALUES
(7, 'Diária em Pipa/RN', 'Ganhe um final de semana em Pipa/RN com direito a um acompanhanete', 50000, 'Ativo', '2026-03-26 11:42:57.377821', '2026-03-26 11:42:57.377821', 119, 119),
(8, 'Viagem Pipa', '1 Diaria  para pipa/RN', 10000, 'Ativo', '2026-09-01 14:23:58.272723', '2026-09-01 14:23:58.272723', 120, 120);

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `sobrenome` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `corretor_id` int(11) DEFAULT NULL,
  `tipo_servico` varchar(50) DEFAULT NULL,
  `valor_contrato` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Ativo',
  `data_fechamento` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `nome`, `sobrenome`, `telefone`, `email`, `corretor_id`, `tipo_servico`, `valor_contrato`, `status`, `data_fechamento`, `created_at`, `updated_at`) VALUES
(1, 'Daniel ', 'Alves', '(83) 99849-7422', NULL, 127, 'Construir uma casa', 800000.00, 'Contrato perdido', NULL, '2026-09-21 11:07:54.177935', '2026-09-21 11:13:00.000000');

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes`
--

CREATE TABLE `configuracoes` (
  `id` int(11) NOT NULL,
  `master_id` int(11) NOT NULL,
  `nome_empresa` varchar(200) NOT NULL,
  `cnpj` varchar(18) NOT NULL,
  `pontos_por_novo_usuario` int(11) NOT NULL,
  `pontos_por_real` decimal(10,2) NOT NULL DEFAULT 1.00,
  `comissao_por_venda` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `configuracoes`
--

INSERT INTO `configuracoes` (`id`, `master_id`, `nome_empresa`, `cnpj`, `pontos_por_novo_usuario`, `pontos_por_real`, `comissao_por_venda`, `created_at`, `updated_at`) VALUES
(1, 120, 'Realeasy Arquitetura e Engenharia', '41.145.893/0001-40', 100, 1.00, 5.00, '2026-09-21 14:09:54', '2026-09-21 14:21:47');

-- --------------------------------------------------------

--
-- Estrutura para tabela `planos`
--

CREATE TABLE `planos` (
  `id` int(11) NOT NULL,
  `slug` varchar(40) NOT NULL,
  `nome` varchar(60) NOT NULL,
  `limite_parceiros` int(11) DEFAULT NULL COMMENT 'NULL = ilimitado',
  `preco_mensal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preco_anual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preco_parceiro_extra` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `destaque` tinyint(1) NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `planos`
--

INSERT INTO `planos` (`id`, `slug`, `nome`, `limite_parceiros`, `preco_mensal`, `preco_anual`, `preco_parceiro_extra`, `descricao`, `destaque`, `ativo`, `ordem`, `created_at`, `updated_at`) VALUES
(2, 'start', 'Start', 10, 127.00, 1295.00, 19.00, 'Equipe pequena, até 10 parceiros ativos.', 0, 1, 2, '2026-09-12 00:53:33', '2026-09-12 01:49:24'),
(3, 'growth', 'Growth', 30, 297.00, 3029.00, 14.00, 'O mais escolhido: até 30 parceiros ativos.', 1, 1, 3, '2026-09-12 00:53:33', '2026-09-12 01:49:37'),
(4, 'scale', 'Scale', 100, 697.00, 7109.00, 9.00, 'Operação consolidada, até 100 parceiros.', 0, 1, 4, '2026-09-12 00:53:33', '2026-09-12 01:49:50'),
(5, 'enterprise', 'Enterprise', NULL, 1497.00, 0.00, NULL, 'Parceiros ilimitados, valor anual negociado.', 0, 1, 5, '2026-09-12 00:53:33', '2026-09-12 00:53:33');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sobrenome` varchar(100) DEFAULT NULL,
  `nascimento` varchar(10) DEFAULT NULL,
  `cpf` varchar(15) DEFAULT NULL,
  `sexo` varchar(15) DEFAULT NULL,
  `ecivil` varchar(15) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `especialidade` varchar(255) DEFAULT NULL,
  `nconselho` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `level` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `master_id` int(11) NOT NULL DEFAULT 0,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `plano_id` int(11) NOT NULL DEFAULT 0,
  `plano_expired` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `foto_perfil_firebase_path` varchar(255) DEFAULT NULL,
  `is_online` tinyint(4) NOT NULL DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL,
  `tipo_pessoa` enum('fisica','juridica') NOT NULL DEFAULT 'fisica',
  `razao_social` varchar(255) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `email_verified` tinyint(4) NOT NULL DEFAULT 0,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `email_verification_expires` timestamp NULL DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` timestamp NULL DEFAULT NULL,
  `cep` varchar(20) NOT NULL,
  `logradouro` varchar(255) NOT NULL,
  `bairro` varchar(255) NOT NULL,
  `complemento` varchar(255) NOT NULL,
  `numero` varchar(255) NOT NULL,
  `localidade` varchar(255) NOT NULL,
  `uf` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `user`
--

INSERT INTO `user` (`id`, `name`, `sobrenome`, `nascimento`, `cpf`, `sexo`, `ecivil`, `telefone`, `especialidade`, `nconselho`, `email`, `password`, `level`, `status`, `master_id`, `foto_perfil`, `plano_id`, `plano_expired`, `created_at`, `updated_at`, `foto_perfil_firebase_path`, `is_online`, `last_login`, `last_activity`, `tipo_pessoa`, `razao_social`, `cnpj`, `email_verified`, `email_verification_token`, `email_verification_expires`, `reset_password_token`, `reset_password_expires`, `cep`, `logradouro`, `bairro`, `complemento`, `numero`, `localidade`, `uf`) VALUES
(112, 'Admin', 'INDIQX', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'admin@indiqx.club', '$2a$12$JqATRXKLXpGdUPWTIneLMe8uqFjVSguI8EqL/wqGxl6rJErOIdtjy', 'Full Admin', 'Ativo', 0, NULL, 0, NULL, '2026-03-16 13:11:13.000000', '2026-03-31 20:52:12.889164', NULL, 0, NULL, NULL, 'fisica', NULL, NULL, 0, NULL, NULL, NULL, NULL, '58064007', 'Av Ruy Carneiro', 'Manaira', 'empresarial Sao Luiz', '1028', 'João Pessoa', 'PB'),
(119, 'K2X', 'COMUNICACAO', '', '', '', '', '', '', NULL, 'mkt@k2xcomunicacao.com.br', '$2b$08$HKKOgDj.72GZ4KERhvVxZe9RFYAnIoWRtqORlvBWon5lkhKAmyq1i', 'Administrador', 'Ativo', 0, NULL, 2, '2026-10-12', '2026-03-26 11:32:36.661843', '2026-09-11 21:56:14.000000', NULL, 0, NULL, NULL, 'fisica', NULL, NULL, 0, NULL, NULL, NULL, NULL, '', '', '', '', '', '', ''),
(120, 'REALEASY', 'ARQ E ENGENHARIA', '', NULL, '', '', '', '', NULL, 'admin@realeasybr.com.br', '$2b$10$/VHLvtnQl0Ksz7ihHOIB0OOe4ew.SnkeRl/rqBoqouKtEbVkcu3iu', 'Administrador', 'Ativo', 0, NULL, 5, '2026-10-12', '2026-03-26 11:34:31.547039', '2026-09-11 22:34:09.000000', NULL, 0, NULL, NULL, 'fisica', NULL, NULL, 0, NULL, NULL, NULL, NULL, '', '', '', '', '', '', ''),
(122, 'Daniel', 'Carvalho', '1987-01-19', '013.879.074-41', 'M', 'Casado', '(83) 99849-7422', '', NULL, 'danielcdesign@gmail.com', '$2b$10$e4Bv3xODNAO7oMKyxeS9GuxsM8Hv2SM.GHdoWXP4xuwmOjlCvFONW', 'Parceiro', 'Ativo', 119, NULL, 0, NULL, '2026-03-26 11:50:27.355713', '2026-09-11 22:35:06.000000', NULL, 0, NULL, NULL, 'fisica', NULL, NULL, 1, NULL, NULL, NULL, NULL, '58064007', 'Rua Genildo Carvalho da Silva', 'Valentina de Figueiredo', 'casa', '59', 'João Pessoa', 'PB'),
(123, 'Daniel', 'Alves', '1987-01-19', '013.879.074-41', 'M', 'Casado', '(83) 99849-7422', '', NULL, 'daniel.a.carvalho@outlook.com', '$2b$08$.5OVENiPsqg2d8/ceTe8dOM16zxv2/bBLphODv4l0nGfqphITC56.', 'Parceiro', 'Ativo', 119, NULL, 1, NULL, '2026-03-27 17:34:01.887063', '2026-03-27 17:41:48.000000', NULL, 0, NULL, NULL, 'fisica', NULL, NULL, 0, 'a185de001958649a4ecf652e19198c033eb2e8d921442f54a8cb7d7ba26346c8', '2026-03-28 20:34:02', NULL, NULL, '58064-007', 'Rua Genildo Carvalho da Silva', 'Valentina de Figueiredo', 'casa', '59', 'João Pessoa', 'PB'),
(127, 'Adriano', 'Terrazzan', '', '', '', '', '', '', NULL, 'adriterrazzan@gmail.com', '$2b$10$3yJm3PTE2JCfbF/4Gf02hOf3NlquU4JcVSomFPMPWeaqIF9pMy9US', 'Parceiro', 'Ativo', 120, NULL, 0, NULL, '2026-09-21 11:03:20.394775', '2026-09-21 11:05:14.000000', NULL, 0, NULL, NULL, 'fisica', NULL, NULL, 1, NULL, NULL, NULL, NULL, '58025-670', 'Rua Severina de Freitas', 'Treze de Maio', '', '284', 'João Pessoa', 'PB'),
(128, 'SAUDE FLOW', 'APP', '', '', '', '', '', '', NULL, 'appsaudeflow@gmail.com', '$2b$10$Ye28ta9bXxAOy12vYwXMWOhBEwiCjiP6d/JmoVI4lIs8K9PRljRhu', 'Administrador', 'Ativo', 0, NULL, 0, NULL, '2026-09-21 11:46:58.017301', '2026-09-21 11:48:05.000000', NULL, 0, NULL, NULL, 'fisica', NULL, NULL, 1, NULL, NULL, NULL, NULL, '', '', '', '', '', '', '');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `assinaturas`
--
ALTER TABLE `assinaturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assinaturas_user` (`user_id`),
  ADD KEY `idx_assinaturas_plano` (`plano_id`),
  ADD KEY `idx_assinaturas_user_status` (`user_id`,`status`);

--
-- Índices de tabela `bonificacoes`
--
ALTER TABLE `bonificacoes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_c9346515597d5afb4c1327e24a2` (`corretor_id`);

--
-- Índices de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_configuracoes_master` (`master_id`);

--
-- Índices de tabela `planos`
--
ALTER TABLE `planos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_planos_slug` (`slug`);

--
-- Índices de tabela `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_7734202d9aea21a0f3b0dad156` (`cnpj`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `assinaturas`
--
ALTER TABLE `assinaturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `bonificacoes`
--
ALTER TABLE `bonificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `planos`
--
ALTER TABLE `planos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `FK_c9346515597d5afb4c1327e24a2` FOREIGN KEY (`corretor_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
