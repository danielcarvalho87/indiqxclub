# Plano de Ação - Ajuste Visual Modal Cliente

## Objetivo
Adicionar sinalização de campos obrigatórios (Nome, Telefone, Tipo de Serviço) no modal de cadastro de clientes. Além disso, tornar o campo Tipo de Serviço largura total (full width) e reorganizar o layout para um design mais fluido e balanceado.

## Entradas necessárias
- Arquivo: `app/src/components/Modals/ClientRegistrationModal.jsx`
- Arquivo: `app/src/components/ui/Input.jsx`

## Passos detalhados
[x] 1. Atualizar o componente global `Input.jsx` para garantir que as `labels` sejam renderizadas visualmente, caso ainda não o fossem, possibilitando inserir o asterisco (`*`) formatado em vermelho.
[x] 2. Em `ClientRegistrationModal.jsx`, adicionar a marcação `*` na prop `label` dos campos obrigatórios (nome, telefone, tipo_servico).
[x] 3. Colocar os campos `Tipo de Serviço` e `Valor do Contrato` na mesma linha (removendo `md:col-span-2` do Tipo de Serviço).
[x] 4. Colocar os campos `Parceiro` e `Status` na última linha juntos (removendo `md:col-span-2` do Parceiro e agrupando-os no final do grid).
[x] 5. Validar a sintaxe e compilação do React.

## Saídas/entregáveis
[x] - Arquivo `Input.jsx` modificado para exibir labels adequadamente.
[x] - Arquivo `ClientRegistrationModal.jsx` ajustado esteticamente e sinalizando campos obrigatórios.

## Riscos e validações
[x] - Risco: Atualizar o componente base `Input.jsx` poderia desalinhar algo globalmente, mitigado aplicando `w-full` flexível.
[x] - Validação: O projeto foi testado via compilação e a sintaxe foi validada com sucesso.

## Status Final
- Tarefa Concluída e Aprovada com sucesso. Nenhuma correção adicional necessária.