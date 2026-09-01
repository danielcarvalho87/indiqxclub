#Idioma padrão

-Responder sempre em Português do Brasil (pt-BR), inclusive logs e mensagens de erro.

#Imutabilidade de banco de dados

-Nunca alterar, editar, apagar ou criar tabelas, índices, views, funções no banco.

-Somente leitura de dados quando necessário para cumprir a tarefa.

#Configurações e segredos

-Sempre buscar variáveis de ambiente no arquivo .env (ou no ambiente do processo).

-Nunca embutir segredos/URLs/keys no código ou resposta.

-Se a variável não existir, solicitar que seja criada e parar a execução.

#Escopo estrito de implementação

-Não criar funções, módulos, endpoints ou tarefas além do solicitado.

-Se identificar melhoria opcional, sugerir separadamente e aguardar aprovação.

#Plano de ação antes de executar

-Para toda solicitação, gerar um Plano de Ação contendo:
a) Objetivo
b) Entradas necessárias (.env, arquivos, permissões)
c) Passos detalhados (passo a passo)
d) Saídas/entregáveis
e) Riscos e validações

-Pedir aprovação explícita antes de qualquer execução/código/consulta.

#SEMPRE QUE UMA TAREFA FOR SOLICIDATA CRIAR UM PLANO DE AÇÃO DETALHADO DO QUE PRECISAR SER FEITO PARA ATENDER ESSA DEMANDA, ESSE PPLANO DE AÇÃO DEVE FICAR DENTRO DA PASTA PLANOS_DE_AÇÃO, E CONFORME AS TAREFAS FOREM SENDO REALIZADAS A LISTA DEVE IR SENDO MARCADA NO ARQUIVO CRIADO. E ATÉ SER CONFIRMADO QUE A SOLICITAÇÃO FOI CONCLUIDA ADICIONE AO ARQUIVO TODOS OS ERROS E CORREÇÕES FEITAS PARA DEIXAR O QUER FOR SOLICITADO PRONTO.

#Confirmações e pré-checagens

-Validar pré-requisitos (variáveis .env, acessos, paths).

-Em caso de dúvida/ambiguidade, parar e pedir esclarecimento.

#Segurança e conformidade

-Não expor dados sensíveis em logs/respostas.

-Respeitar limites de acesso (somente o mínimo necessário).

#Registro e auditabilidade (somente leitura)

-Manter resumo de ações planejadas e aprovadas (timestamp, autor da aprovação).

-Registrar resultados/erros de forma sucinta em pt-BR.

#Idempotência e reversibilidade conceitual

-Planejar ações de modo que possam ser repetidas sem efeitos colaterais.

-Se alguma etapa não for idempotente, destacar no Plano de Ação.

#Encerramento de tarefa

#NUNCA DE FORMA ALGUMA USE any PARA RESOLVER ERROS

-Entregar o que foi aprovado, com breve relatório: o que foi feito, onde está, como validar.
-Só parar a tarefa após verificar se existem erros nos arquivos do sistema.
-Nada além do escopo aprovado.

#USE SEMPRE Invoke-WebRequest -Uri PARA TESTAR AS URLS

#SEMPRE VERIFICAR A PORTA QUE ESTA SETADA NO PROJETO NO ARQUIVO .env

#SEMPRE QUE PRECISAR INSTALAR NOVA BIBLIOTECA, SOLICITAR, POIS PRECISA INSTALAR COM USUARIO ROOT
