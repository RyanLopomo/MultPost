# Arquitetura

## Inicializacao da aplicacao

O ponto de entrada e `src/index.ts`.

Fluxo de bootstrap:

1. Cria a aplicacao Express.
2. Aplica middlewares globais de seguranca, CORS, rate limit e parser de body.
3. Registra a rota `/health`.
4. Monta os grupos de rotas:
   - `/api/auth`
   - `/api/posts`
   - `/api/admin`
5. Registra handlers de rota inexistente e erro.
6. Valida variaveis obrigatorias.
7. Conecta no banco via Prisma.
8. Inicia o servidor na porta `PORT` ou `3333`.

O encerramento trata `SIGTERM`, `uncaughtException` e `unhandledRejection`, registrando logs e desconectando o Prisma quando aplicavel.

## Camadas

### Routes

Arquivos em `src/routes` definem apenas o mapeamento HTTP e os middlewares aplicados.

- `auth.ts`: login, logout, usuario atual e troca de senha.
- `posts.ts`: todas as rotas exigem autenticacao.
- `admin.ts`: todas as rotas exigem autenticacao e perfil `ADMIN`.

### Controllers

Arquivos em `src/controllers` recebem `Request`, validam dados com Zod, chamam services ou Prisma e devolvem JSON.

- `authController.ts`: login, logout, `me` e troca de senha.
- `postController.ts`: criacao, listagem paginada e detalhe de posts.
- `adminController.ts`: dashboard, listagem/criacao de usuarios e ativacao/desativacao.

### Services

Arquivos em `src/services` concentram regras de negocio reutilizaveis.

- `authService.ts`:
  - valida credenciais;
  - gera JWT;
  - cria sessao no banco;
  - remove sessao no logout;
  - troca senha e revoga sessoes antigas.

- `publishService.ts`:
  - adapta o post para cada canal;
  - aplica convites cruzados entre Telegram e WhatsApp;
  - envia mensagem ao Telegram quando configurado;
  - gera link de compartilhamento para WhatsApp;
  - registra cada tentativa em `Publishing`;
  - atualiza o status geral do post.

### Middlewares

- `authenticate`: exige header `Authorization: Bearer <token>`, valida JWT, confere sessao no banco e bloqueia usuarios inativos.
- `requireAdmin`: permite acesso somente a usuarios com `role` igual a `ADMIN`.
- `errorHandler`: normaliza erros de validacao, erros conhecidos e erros internos.
- `notFound`: responde rotas inexistentes com 404.

### Prisma

`src/models/prisma.ts` exporta uma instancia compartilhada de `PrismaClient`.

Em ambiente diferente de producao, a instancia e armazenada em `globalThis` para reduzir conexoes duplicadas durante hot reload.

## Fluxo de autenticacao

1. Cliente envia `POST /api/auth/login` com `email` e `password`.
2. `authController` valida o body com Zod.
3. `authService.loginUser` busca o usuario ativo.
4. A senha e comparada com bcrypt.
5. Um JWT e assinado.
6. Uma sessao e criada no banco.
7. O token final inclui `sessionId` e e salvo na sessao.
8. Rotas autenticadas validam tanto o JWT quanto a existencia da sessao.

Esse desenho permite logout real: remover a sessao do banco invalida o token mesmo antes de ele expirar.

## Fluxo de criacao e publicacao de posts

1. Cliente autenticado envia `POST /api/posts`.
2. O controller valida titulo, campos opcionais, links de convite e lista de canais.
3. O post e criado com status `PENDING`.
4. `publishPost` adapta o conteudo para Telegram e WhatsApp.
5. Para Telegram, a API envia a mensagem ao chat configurado e inclui o convite do WhatsApp quando informado.
6. Para WhatsApp, a API cria um link `https://wa.me/?text=...` e inclui o convite do Telegram quando informado.
7. Cada resultado e salvo em `Publishing`.
8. O post fica `PUBLISHED` se todos os canais derem certo; caso contrario, `FAILED`.

Regra de convites:

- Post em `TELEGRAM` exige link de convite do WhatsApp.
- Post em `WHATSAPP` exige link de convite do Telegram.
- Post nos dois canais usa os dois links, cada um divulgado no canal oposto.

## Modelo de permissao

- `ADMIN`
  - Acessa dashboard administrativo.
  - Lista todos os usuarios.
  - Cria usuarios.
  - Ativa/desativa usuarios.
  - Lista e acessa posts de todos os autores.

- `EMPLOYEE`
  - Cria posts.
  - Lista somente seus proprios posts.
  - Acessa somente detalhes dos proprios posts.

## Banco de dados

Modelos definidos em `prisma/schema.prisma`:

- `User`: usuarios da aplicacao, com senha hash, perfil e status ativo.
- `Session`: sessoes ativas associadas a usuarios.
- `Post`: posts criados por usuarios.
- `Publishing`: historico de publicacao por canal.
- `Channel_Config`: configuracoes persistidas para canais, ainda nao usada pelos services atuais.

Campos com valores controlados:

- `User.role`: `ADMIN`, `EMPLOYEE`
- `Post.status`: `PENDING`, `PUBLISHED`, `FAILED`
- `Publishing.channel`: `TELEGRAM`, `WHATSAPP`
- `Publishing.status`: `SUCCESS`, `FAILED`

Como o datasource local usa SQLite, esses valores ficam como `String` no Prisma schema. A validacao dos valores acontece na aplicacao com Zod e pelas regras dos services.

## Seguranca

Medidas presentes:

- Helmet para headers HTTP.
- CORS restrito por `CORS_ORIGIN`.
- Rate limit global de 100 requisicoes por minuto por IP.
- Rate limit especifico de login: 5 tentativas por 15 minutos por IP.
- Body limitado a 1 MB.
- Senhas com bcrypt e salt de 12 rounds.
- JWT com expiracao.
- Sessoes persistidas para revogacao.
- Zod para validacao de entradas.
- Mensagens genericas para credenciais invalidas.
- Logs internos com Winston.
