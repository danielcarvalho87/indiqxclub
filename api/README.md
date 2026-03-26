# 🏥 API SaudeFlow

API RESTful desenvolvida em NestJS para o sistema de gestão de clínicas SaudeFlow, oferecendo funcionalidades completas para gerenciamento de pacientes, agendamentos, finanças e integrações com serviços externos.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Módulos e Funcionalidades](#módulos-e-funcionalidades)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Integrações](#integrações)
- [Instalação e Execução](#instalação-e-execução)
- [Documentação da API](#documentação-da-api)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

## 🚀 Tecnologias

- **Framework**: NestJS v10
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL
- **ORM**: TypeORM
- **Autenticação**: JWT (JSON Web Token)
- **Documentação**: Swagger/OpenAPI
- **Validação**: class-validator
- **Testes**: Jest

## 🏗️ Arquitetura

A API segue o padrão modular do NestJS com arquitetura em camadas:

```
src/
├── [modulo]/
│   ├── dto/           # Data Transfer Objects
│   ├── entities/      # Entidades TypeORM
│   ├── [modulo].controller.ts  # Controladores REST
│   ├── [modulo].service.ts     # Lógica de negócio
│   └── [modulo].module.ts      # Módulo NestJS
├── auth/              # Módulo de autenticação
├── common/            # Filtros e interceptores globais
└── database/          # Configuração do banco de dados
```

## 📦 Módulos e Funcionalidades

### 1. 📅 Agendamentos

**Módulo**: `agendamentos`

**Funcionalidades**:

- Criar, listar, buscar, atualizar e excluir agendamentos
- Gerenciamento de status de agendamentos
- Controle de horários e procedimentos

**Entidade**: `Agendamentos`

- Campos: id, master_id, usuario_id, data_agendamento, nome_paciente, nascimento_paciente, telefone_paciente, procedimento, horario_agendado, status

**Endpoints**:

- `POST /agendamentos` - Criar agendamento
- `GET /agendamentos` - Listar todos
- `GET /agendamentos/:id` - Buscar por ID
- `PUT /agendamentos/:id` - Atualizar
- `PATCH /agendamentos/:id` - Atualizar parcialmente

### 2. 👥 Pacientes

**Módulo**: `pacientes`

**Funcionalidades**:

- Cadastro completo de pacientes com dados pessoais
- Sistema de verificação por e-mail com código
- Gerenciamento de informações de saúde e convênio
- Limpeza automática de códigos de verificação expirados

**Entidade**: `Pacientes`

- Campos: id, master_id, usuario_id, name, sobrenome, nascimento, cpf, sexo, ecivil, telefone, email, convenio, endereço completo

**Endpoints**:

- `POST /pacientes` - Criar paciente
- `GET /pacientes` - Listar todos
- `GET /pacientes/:id` - Buscar por ID
- `PATCH /pacientes/:id` - Atualizar
- `DELETE /pacientes/:id` - Excluir

### 3. 🔐 Autenticação

**Módulo**: `auth`

**Funcionalidades**:

- Login com JWT
- Registro de usuários públicos
- Geração de tokens de registro
- Proteção de rotas com guards

**Endpoints**:

- `POST /login` - Autenticar usuário
- `POST /public/register-token` - Gerar token de registro
- `POST /public/user/register` - Registrar novo usuário

### 4. 💰 Financeiro

**Módulo**: `financeiro`

**Funcionalidades**:

- Gerenciamento de transações financeiras
- Controle de serviços e valores
- Relacionamento com usuários

**Entidade**: `Servicos` (financeiro)

- Controle de serviços e valores financeiros

**Endpoints**:

- `POST /financeiro` - Criar transação
- `GET /financeiro` - Listar todas
- `GET /financeiro/:id` - Buscar por ID
- `PATCH /financeiro/:id` - Atualizar
- `DELETE /financeiro/:id` - Excluir
- `GET /financeiro/user/:userId` - Buscar por usuário

### 5. 📋 Assinaturas

**Módulo**: `assinaturas`

**Funcionalidades**:

- Gerenciamento de assinaturas de planos
- Controle de status e recorrência
- Integração com sistema de pagamentos

**Entidade**: `Assinaturas`

- Campos: id, user_id, customer_id, plano_id, subscription_id, recurrence, payment_type, status

**Endpoints**:

- `POST /assinaturas` - Criar assinatura
- `GET /assinaturas` - Listar todas
- `GET /assinaturas/:id` - Buscar por ID
- `PATCH /assinaturas/:id` - Atualizar
- `DELETE /assinaturas/:id` - Excluir

### 6. 💳 Integração Asaas (Pagamentos)

**Módulo**: `asaas`

**Funcionalidades**:

- Criação de clientes no Asaas
- Gerenciamento de assinaturas
- Controle de cobranças e pagamentos
- Webhooks para atualizações de status

**Endpoints**:

- `POST /asaas/customers` - Criar cliente
- `GET /asaas/customers/:id` - Buscar cliente
- `POST /asaas/subscriptions` - Criar assinatura
- `GET /asaas/subscriptions/:id` - Buscar assinatura
- `POST /asaas/charge` - Criar cobrança
- `GET /asaas/payments/:id` - Buscar pagamento
- `POST /asaas/webhook` - Receber webhooks

### 7. 🎯 Serviços

**Módulo**: `servicos`

**Funcionalidades**:

- Cadastro de serviços oferecidos
- Gerenciamento de tipos e valores
- Controle de status e descrições

**Endpoints**:

- `POST /servicos` - Criar serviço
- `GET /servicos` - Listar todos
- `GET /servicos/:id` - Buscar por ID
- `PATCH /servicos/:id` - Atualizar
- `DELETE /servicos/:id` - Excluir

### 8. 📊 Planos

**Módulo**: `planos`

**Funcionalidades**:

- Gerenciamento de planos de assinatura
- Controle de preços e benefícios
- Sistema de recorrência

**Endpoints**:

- `POST /planos` - Criar plano
- `GET /planos` - Listar todos
- `GET /planos/:id` - Buscar por ID
- `PATCH /planos/:id` - Atualizar
- `DELETE /planos/:id` - Excluir

### 9. 👤 Usuários

**Módulo**: `user`

**Funcionalidades**:

- Gerenciamento completo de usuários
- Upload de fotos de perfil (Firebase)
- Controle de status online/offline
- Último login e validação de e-mail
- Reset de senha por e-mail

**Entidade**: `User`

- Campos completos: dados pessoais, endereço, documentos, status online, último login, validação de e-mail, reset de senha

**Endpoints**:

- `POST /user` - Criar usuário
- `GET /user` - Listar todos
- `GET /user/:id` - Buscar por ID
- `PATCH /user/:id` - Atualizar
- `DELETE /user/:id` - Excluir
- `POST /user/upload-photo/:id` - Upload de foto
- `GET /user/status/:id` - Status online
- `POST /user/last-login/:id` - Atualizar último login

### 10. 🔔 Notificações

**Módulo**: `notificacoes`

**Funcionalidades**:

- Sistema de notificações internas
- Envio de e-mails
- Controle de status e tipos

**Endpoints**:

- `POST /notificacoes` - Criar notificação
- `GET /notificacoes` - Listar todas
- `GET /notificacoes/:id` - Buscar por ID
- `PATCH /notificacoes/:id` - Atualizar
- `DELETE /notificacoes/:id` - Excluir

### 11. 📧 E-mail

**Módulo**: `email`

**Funcionalidades**:

- Envio de e-mails transacionais
- Sistema de reset de senha
- Templates de e-mail
- Integração com SMTP/Brevo

**Endpoints**:

- `POST /email/password-reset` - Solicitar reset de senha
- `POST /email/verify-reset` - Verificar código de reset
- `POST /email/confirm-reset` - Confirmar nova senha

### 12. 📤 Upload de Imagens

**Módulo**: `uploads-img`

**Funcionalidades**:

- Upload de imagens para Firebase Storage
- Gerenciamento de arquivos
- Validação de tipos e tamanhos

**Endpoints**:

- `POST /uploads-img` - Criar registro
- `GET /uploads-img` - Listar todos
- `GET /uploads-img/:id` - Buscar por ID
- `PATCH /uploads-img/:id` - Atualizar
- `DELETE /uploads-img/:id` - Excluir
- `POST /uploads-img/upload` - Fazer upload

### 13. 📄 Upload de Documentos

**Módulo**: `uploads-doc`

**Funcionalidades**:

- Upload de documentos (PDF, DOC, etc.)
- Gerenciamento de arquivos profissionais
- Integração com Firebase Storage

**Endpoints**:

- `POST /uploads-doc` - Criar registro
- `GET /uploads-doc` - Listar todos
- `GET /uploads-doc/:id` - Buscar por ID
- `PATCH /uploads-doc/:id` - Atualizar
- `DELETE /uploads-doc/:id` - Excluir

### 14. 📋 CRM

**Módulo**: `crm`

**Funcionalidades**:

- Gerenciamento de relacionamento com clientes
- Controle de interações e histórico
- Segmentação e análise de dados

**Endpoints**:

- `POST /crm` - Criar registro
- `GET /crm` - Listar todos
- `GET /crm/:id` - Buscar por ID
- `PATCH /crm/:id` - Atualizar
- `DELETE /crm/:id` - Excluir

### 15. 🩺 Prontuário de Pacientes

**Módulo**: `paciente-prontuario`

**Funcionalidades**:

- Registro de prontuários médicos
- Histórico de atendimentos
- Controle de evolução do paciente

**Endpoints**:

- `POST /paciente-prontuario` - Criar prontuário
- `GET /paciente-prontuario` - Listar todos
- `GET /paciente-prontuario/:id` - Buscar por ID
- `PATCH /paciente-prontuario/:id` - Atualizar
- `DELETE /paciente-prontuario/:id` - Excluir

### 16. 📋 Anamnese de Pacientes

**Módulo**: `paciente-anamnese`

**Funcionalidades**:

- Registro de anamnese
- Questionários de saúde
- Histórico médico completo

**Endpoints**:

- `POST /paciente-anamnese` - Criar anamnese
- `GET /paciente-anamnese` - Listar todas
- `GET /paciente-anamnese/:id` - Buscar por ID
- `PATCH /paciente-anamnese/:id` - Atualizar
- `DELETE /paciente-anamnese/:id` - Excluir

### 17. 🎯 Page Views Analytics

**Módulo**: `page-view`

**Funcionalidades**:

- Rastreamento de visualizações de páginas
- Analytics de uso do sistema
- Estatísticas de acesso

**Endpoints**:

- `POST /page-view` - Registrar visualização
- `GET /page-view` - Listar todas
- `GET /page-view/:id` - Buscar por ID
- `GET /page-view/stats` - Estatísticas
- `PATCH /page-view/:id` - Atualizar
- `DELETE /page-view/:id` - Excluir

### 18. 🎭 Puppeteer (PDF/Scraping)

**Módulo**: `puppeteer`

**Funcionalidades**:

- Geração de PDFs a partir de HTML
- Web scraping automatizado
- Captura de telas

**Endpoints**:

- `POST /puppeteer/pdf` - Gerar PDF
- `POST /puppeteer/screenshot` - Capturar tela
- `POST /puppeteer/scrape` - Fazer scraping

### 19. 🆘 Suporte

**Módulo**: `suporte`

**Funcionalidades**:

- Sistema de tickets de suporte
- Envio de e-mails para equipe de suporte
- Gestão de solicitações de ajuda

**Endpoints**:

- `POST /suporte/ticket` - Criar ticket
- `GET /suporte/tickets` - Listar tickets
- `GET /suporte/ticket/:id` - Buscar ticket
- `PATCH /suporte/ticket/:id` - Atualizar ticket

## 🔒 Autenticação e Segurança

### JWT Authentication

- Tokens JWT para autenticação stateless
- Refresh tokens implementados
- Expiração configurável via variáveis de ambiente

### Guards e Decorators

- `JwtAuthGuard`: Proteção de rotas autenticadas
- `LocalAuthGuard`: Autenticação local (username/password)
- `RegisterTokenGuard`: Validação de tokens de registro
- `IsPublic`: Decorator para rotas públicas
- `CurrentUser`: Decorator para injetar usuário atual

### Validações de Segurança

- Validação de e-mail único
- Criptografia de senhas com bcrypt
- Rate limiting em endpoints sensíveis
- Validação de CPF e dados pessoais

## 🔗 Integrações

### Firebase Storage

- Upload de imagens e documentos
- Configuração via variáveis de ambiente
- Bucket e permissões configuráveis

### Asaas (Gateway de Pagamento)

- Integração completa com API do Asaas
- Webhooks para atualização de status
- Criação de clientes, assinaturas e cobranças
- Sandbox e produção configuráveis

### SMTP/Brevo (E-mail)

- Envio de e-mails transacionais
- Templates de e-mail personalizáveis
- Suporte a múltiplos provedores SMTP
- Reset de senha por e-mail

## 📖 Documentação da API

A documentação completa da API está disponível via Swagger:

```
http://localhost:3001/api
```

A documentação inclui:

- Descrição de todos os endpoints
- Parâmetros de requisição
- Exemplos de requisição e resposta
- Códigos de status HTTP
- Autenticação e autorização

## ⚙️ Variáveis de Ambiente

### Banco de Dados

```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASS=sua_senha
DATABASE_DB=saudeflow
```

### Autenticação

```env
JWT_SECRET=sua_chave_secreta_jwt
```

### Firebase

```env
FIREBASE_STORAGE_BUCKET=seu_bucket
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_CLIENT_EMAIL=seu_email
FIREBASE_PRIVATE_KEY=sua_chave_privada
```

### Asaas

```env
ASAAS_API_KEY=sua_api_key
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3
```

### SMTP/E-mail

```env
SMTP_HOST=smtp.seu_servidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_usuario
SMTP_PASS=sua_senha
SMTP_FROM_NAME=SaudeFlow
SMTP_FROM_EMAIL=noreply@saudeflow.com
```

### Outras Configurações

```env
PORT=3001
FRONTEND_URL=http://localhost:3005
PUSHER_APP_ID=seu_app_id
PUSHER_KEY=sua_key
PUSHER_SECRET=seu_secret
PUSHER_CLUSTER=seu_cluster
```

## 🚀 Instalação e Execução

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run start:dev
```

### Produção

```bash
npm run build
npm run start:prod
```

### Testes

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## 📞 Suporte

Para dúvidas e suporte, entre em contato através do sistema de tickets em `/suporte` ou envie e-mail para a equipe de suporte.

---

**SaudeFlow API** - Desenvolvido com ❤️ para gestão de clínicas e consultórios.
