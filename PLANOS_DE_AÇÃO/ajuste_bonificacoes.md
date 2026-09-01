# Plano de Ação - Ajuste de Bonificações

## Objetivo

Garantir que os Administradores vejam apenas as bonificações criadas por eles em `Bonificacoes.jsx` e que os Parceiros vejam apenas as bonificações criadas pelos seus respectivos Administradores (baseado no `master_id`) em `MeusGanhos.jsx`.

## Entradas necessárias

- Arquivo: `app/src/pages/Bonificacoes.jsx`
- Arquivo: `app/src/pages/MeusGanhos.jsx`

## Passos detalhados

[x] 1. No arquivo `app/src/pages/Bonificacoes.jsx`, ajustar a comparação no filtro de bonificações para Administradores, forçando a conversão para `String` para evitar problemas de tipagem (ex: `String(item.userId) === String(userId)`).
[x] 2. No arquivo `app/src/pages/MeusGanhos.jsx`, adicionar lógica de filtragem nas bonificações retornadas pela API.

- Para Parceiros (`userLevel === "Parceiro" || userLevel === "Corretor"`), filtrar onde `String(b.userId) === String(masterId) || String(b.master_id) === String(masterId)`.
- Para Administradores (`userLevel === "Administrador" || userLevel === "Admin"`), filtrar onde `String(b.userId) === String(userId) || String(b.master_id) === String(userId)`.
  [x] 3. Validar se não há erros de sintaxe nos arquivos.

## Saídas/entregáveis

[x] - Arquivo `Bonificacoes.jsx` atualizado com o filtro seguro por tipo.
[x] - Arquivo `MeusGanhos.jsx` atualizado com o filtro por nível de acesso para a trilha de bonificações.

## Riscos e validações

[x] - Risco de `masterId` ou `userId` virem como `undefined` (tratado convertendo para string, mas pode ser verificado para garantir).
[x] - Validação: os componentes devem renderizar normalmente e não quebrar.

## Status Final

- Tarefa Concluída e Aprovada com sucesso. Nenhuma correção adicional necessária.
