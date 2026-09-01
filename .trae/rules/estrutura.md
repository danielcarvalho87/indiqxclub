# Estrutura do Projeto IndiqxClub

Este arquivo documenta a arquitetura e a estrutura padrão do projeto IndiqxClub, que é dividida em dois blocos principais: Backend (`/api`) e Frontend (`/app`). Sempre que for criar, ler ou modificar arquivos, respeite a estrutura detalhada abaixo.

## 1. Backend (`/api`)
O backend é desenvolvido em **Node.js** utilizando o framework **NestJS** e **TypeScript**.

### Estrutura de Pastas e Módulos
- **`/src`**: Código-fonte principal da aplicação.
  - **`main.ts`**: Ponto de entrada da aplicação NestJS.
  - **`app.module.ts`, `app.controller.ts`, `app.service.ts`**: Módulo e configuração principal raiz.
  - **Módulos de Domínio** (ex: `auth`, `bonificacoes`, `clientes`, `configuracoes`, `user`):
    - Cada domínio é encapsulado em sua própria pasta e costuma conter:
      - `*.module.ts`: Definição e agrupamento do módulo.
      - `*.controller.ts`: Controladores responsáveis por expor as rotas e endpoints REST.
      - `*.service.ts`: Camada de regras de negócio.
      - `*.providers.ts`: Provedores de injeção de dependência (geralmente gerenciam a conexão com DB e repositórios).
      - `/dto`: *Data Transfer Objects*, classes que validam e tipam os dados de entrada/saída.
      - `/entities`: Modelos/Entidades que representam as tabelas do banco de dados e suas colunas.
  - **`/auth`**: Contém lógicas de autenticação, estratégias (JWT, Local), guards (proteção de rotas), decorators customizados e middlewares.
  - **`/database`**: Configuração e provedores de conexão com o banco de dados.
  - **`/common`**: Recursos compartilhados da aplicação, como filtros globais de exceção (`filters/http-exception.filter.ts`).
  - **`/email`**: Módulo/Serviço dedicado ao disparo e formatação de e-mails.
- **`/scripts`**: Scripts utilitários auxiliares (ex: arquivos SQL para criação ou alteração de tabelas, scripts bash de manutenção).
- **`/test`**: Configuração e implementação de testes automatizados E2E.

## 2. Frontend (`/app`)
O frontend é desenvolvido em **React** (utilizando JSX) e empacotado através do **Vite**. A estilização é feita utilizando **Tailwind CSS**.

### Estrutura de Pastas e Componentização
- **Raiz do `/app`**: Contém arquivos de configuração de ambiente e build (`vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `package.json`, `firebase.json`).
- **`/public`**: Arquivos estáticos que são servidos diretamente sem processamento do bundler (ícones, favicon, manifestos web).
- **`/src`**: Código-fonte principal da interface do usuário.
  - **`main.jsx`**: Ponto de entrada principal do React (onde a aplicação é renderizada no DOM).
  - **`App.jsx`**: Componente raiz, onde normalmente são organizadas as rotas da aplicação.
  - **`api.js`**: Arquivo de configuração do cliente HTTP (ex: Axios/Fetch) centralizando as chamadas para a `/api`.
  - **`/assets`**: Recursos estáticos importados pelo código (imagens, logotipos, vetores).
  - **`/components`**: Componentes reutilizáveis de interface, organizados em subpastas:
    - `/Layout`: Estruturas globais de tela (ex: `Sidebar.jsx`, `PrivateLayout.jsx`).
    - `/Modals`: Janelas modais e diálogos (ex: `ConfirmModal.jsx`, `UserRegistrationModal.jsx`).
    - `/ui`: Componentes de interface genéricos e atômicos (ex: `Button.jsx`, `Card.jsx`, `Input.jsx`, `LoadingSpinner.jsx`).
  - **`/contexts`**: Provedores de estado global utilizando a Context API do React (ex: `AuthContext.jsx`).
  - **`/hooks`**: Hooks customizados compartilhados (ex: `useAuth.jsx`).
  - **`/pages`**: Componentes contêineres que representam páginas completas do sistema (ex: `Dashboard.jsx`, `Login.jsx`, `Clientes.jsx`, `Bonificacoes.jsx`, etc).
  - **`/utils`**: Funções utilitárias e auxiliares de formatação (ex: `masks.js`).

## Diretrizes e Padrões
1. **Separação de Responsabilidades no Backend**: Nunca misture lógica de banco de dados ou regras de negócio pesadas dentro dos `Controllers`. Utilize sempre os `Services` e `Providers`.
2. **Isolamento no Frontend**: Mantenha as `pages` enxutas focadas na montagem e ciclo de vida, extraindo toda a parte visual para componentes na pasta `/components`.
3. **Estado Global**: Para estados que precisam ser acessados em diversas áreas da aplicação (como dados do usuário logado), use o contexto configurado (`AuthContext`) através do hook correspondente (`useAuth`).
