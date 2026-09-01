# Plano de Ação: Correção de visualização de dados para Full Admin

**a) Objetivo**
Corrigir a visualização de dados gerais (parceiros, usuários, clientes, relatórios, etc.) para o nível "Full Admin" ou "FullAdmin", permitindo que ele visualize todas as informações do sistema, sem as restrições aplicadas aos níveis "Administrador" e "Parceiro".

**b) Entradas necessárias**

- Permissão de escrita nos arquivos de serviço do backend (NestJS).

**c) Passos detalhados**

- [x] 1. Alterar `api/src/user/user.service.ts` no método `findAll`: Separar a validação de `FullAdmin` e `Administrador`. Se for `FullAdmin`, retornar todos os usuários (`this.userRepository.find()`).
- [x] 2. Alterar `api/src/clientes/clientes.service.ts` no método `findAll`: Separar a validação de `FullAdmin` e `Administrador`. Se for `FullAdmin`, retornar todos os clientes.
- [x] 3. Alterar `app/src/components/Layout/Sidebar.jsx`: Liberar a exibição do menu "Configurações" para o Full Admin, que estava sendo ocultado.
- [x] 4. Alterar `app/src/pages/Usuarios.jsx`: Filtrar a listagem para mostrar apenas usuários com level `Administrador`, `Admin`, `FullAdmin` ou `Full Admin` (ocultando Parceiros dessa tela).
- [x] 5. Validar se o painel geral agora carrega os dados corretamente.

**d) Saídas/entregáveis**

- Arquivos `user.service.ts` e `clientes.service.ts` atualizados com a nova lógica de verificação de `Full Admin`.
- Nível `Full Admin` capaz de visualizar dados globais no frontend sem ser barrado por filtros do backend.

**e) Riscos e validações**

- Risco baixo: a mudança afeta apenas a visualização de dados para usuários do tipo `FullAdmin`. Validar se as regras de negócio para os demais níveis (`Administrador`, `Parceiro`) continuam intactas.
