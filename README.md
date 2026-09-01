# IndiqxClub - Sistema de Gestão e Bonificações

O **IndiqxClub** é uma plataforma web completa para gerenciamento de clientes, parceiros e comissionamentos (bonificações). A aplicação é dividida em um backend robusto (NestJS) e um frontend moderno e responsivo (React + Vite + Tailwind CSS).

## 🚀 Funcionalidades do Sistema

Abaixo estão descritas todas as funcionalidades detalhadas do sistema, baseadas nos módulos e componentes implementados.

### 1. Autenticação e Segurança (Auth)
- **Login Seguro:** Acesso ao sistema validado por JWT (JSON Web Token) utilizando estratégias de segurança robustas.
- **Registro de Novos Usuários:** Cadastro de novos usuários/parceiros na plataforma (com rotas públicas controladas por tokens de convite ou acesso).
- **Recuperação e Reset de Senha:** Fluxo para usuários que esqueceram a senha, incluindo envio de e-mail e validação de token (Tela "Reset").
- **Proteção de Rotas:** Bloqueio de páginas privadas no frontend (via `PrivateLayout` e `AuthContext`) e validação de endpoints no backend através de Guards e Decorators customizados.
- **Gerenciamento de Sessão:** Controle de tempo de inatividade com alertas modais (`SessionTimeoutModal`).

### 2. Painel de Controle (Dashboard)
- **Visão Geral de Métricas:** Tela principal do usuário logado, exibindo de forma sumarizada indicadores de desempenho, total de ganhos, novos clientes e status atual das bonificações.

### 3. Gestão de Usuários e Perfil (Users)
- **Meus Dados:** Área dedicada para que o usuário conectado visualize e edite suas informações de perfil.
- **Gerenciamento de Usuários:** Tela de administração (`Usuarios.jsx`) para gerenciar todos os usuários do sistema, com capacidade de criar, visualizar e editar permissões ou status.
- **Gestão de Parceiros:** Listagem e gerenciamento de parceiros integrados à plataforma (`Parceiros.jsx`), permitindo rastrear as origens das indicações.

### 4. Gestão de Clientes (Clientes)
- **Cadastro de Clientes:** Interface e API completas para adicionar novos clientes à base (`ClientRegistrationModal`).
- **Listagem e Visualização:** Tabela de clientes com possibilidade de busca, ordenação e visualização detalhada de dados e histórico (`ClientViewModal`).
- **Edição de Clientes:** Atualização de informações de contato e status.

### 5. Gestão de Bonificações e Ganhos (Bonificações)
- **Registro de Bonificações:** Cadastro manual ou automático de bônus atrelados a usuários/parceiros e clientes (`BonificacaoRegistrationModal`).
- **Acompanhamento (Meus Ganhos):** Tela dedicada para os parceiros acompanharem suas comissões, recebimentos, e histórico de transações.
- **Gestão Global de Bonificações:** Tela administrativa para visualizar, aprovar, ou editar pagamentos de bonificações.

### 6. Relatórios (Relatórios)
- **Extração de Dados:** Tela de relatórios para cruzamento de dados de bonificações, novos clientes, desempenho de parceiros e conversões em um determinado período.

### 7. Configurações do Sistema (Configurações)
- **Parâmetros Globais:** Ajustes sistêmicos acessíveis a administradores (ex: valores padrão de bonificação, prazos, etc.). As configurações são persistidas em tabelas dedicadas do banco de dados e controladas pelo módulo `/api/src/configuracoes`.

### 8. Comunicação por E-mail (Email)
- **Envio Automático:** Módulo backend (`/api/src/email`) dedicado ao disparo de e-mails transacionais (como boas-vindas, recuperação de senha, notificação de novas bonificações aprovadas).

---

## 🏗️ Arquitetura e Tecnologias

### Backend (`/api`)
- **Framework:** NestJS (Node.js) com TypeScript.
- **Arquitetura:** Baseada em Módulos, Controladores, Serviços e Entidades (Padrão MVC e Injeção de Dependências).
- **Funcionalidades de Suporte:** Filtros de Exceções Globais, DTOs para validação de entrada, Guards de proteção.

### Frontend (`/app`)
- **Bibliotecas Base:** React com JSX.
- **Build Tool:** Vite para carregamento rápido e otimização.
- **Estilização:** Tailwind CSS para um design responsivo e moderno.
- **Estado e Integração:** Context API para estado global (autenticação), Hooks customizados, comunicação HTTP centralizada (`api.js`).

---

## 🛠️ Como Iniciar o Projeto

*Lembre-se: Todas as configurações e segredos devem ser inseridos em arquivos `.env` não versionados, tanto no `/api` quanto no `/app`.*

### Backend
```bash
cd api
npm install
npm run start:dev
```

### Frontend
```bash
cd app
npm install
npm run dev
```

*Nota: Garanta que os bancos de dados estão configurados corretamente de acordo com os provedores mapeados na pasta `/api/src/database`.*
