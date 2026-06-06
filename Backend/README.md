# Multipost Backend

Backend robusto para sistema de postagem multicanal (Telegram + WhatsApp).

## Stack

- **Runtime**: Node.js 20 + TypeScript 5
- **Framework**: Express 4
- **Banco de dados**: SQLite via Prisma ORM (troque por PostgreSQL em produção)
- **Autenticação**: JWT + sessões no banco (permite logout real)
- **Segurança**: Helmet, CORS restrito, rate limiting, bcrypt, Zod

---

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e preencha:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | `file:./dev.db` para SQLite |
| `JWT_SECRET` | String aleatória longa (mín. 64 chars) |
| `TELEGRAM_BOT_TOKEN` | Token do bot criado no @BotFather |
| `TELEGRAM_CHAT_ID` | ID do grupo/canal de destino |
| `CORS_ORIGIN` | URL do frontend |

Gere um JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Criar banco e rodar migrations

```bash
npm run db:generate
npm run db:init
npm run db:migrate # opcional, se usar migrations do Prisma
```

### 4. Popular com usuários iniciais

```bash
npm run db:seed
```

Credenciais criadas:
- `admin@empresa.com` / `admin@123`
- `ana@empresa.com` / `func@123`

### 5. Iniciar servidor

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm run build && npm start
```

---

## Endpoints

### Autenticação

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Login (rate limit: 5/15min) |
| POST | `/api/auth/logout` | ✅ | Logout (revoga sessão) |
| GET | `/api/auth/me` | ✅ | Dados do usuário logado |
| PATCH | `/api/auth/password` | ✅ | Troca de senha |

**Login — exemplo:**
```json
POST /api/auth/login
{ "email": "admin@empresa.com", "password": "admin@123" }

Resposta:
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": "...", "name": "Administrador", "email": "...", "role": "ADMIN" }
  }
}
```

Todas as rotas autenticadas exigem header:
```
Authorization: Bearer <token>
```

---

### Posts

| Método | Rota | Role | Descrição |
|---|---|---|---|
| POST | `/api/posts` | EMPLOYEE / ADMIN | Criar e publicar post |
| GET | `/api/posts` | EMPLOYEE / ADMIN | Listar posts (funcionário vê só os seus) |
| GET | `/api/posts/:id` | EMPLOYEE / ADMIN | Detalhe do post |

**Criar post — exemplo:**
```json
POST /api/posts
{
  "title": "Tênis Nike Air Max",
  "description": "Lançamento exclusivo",
  "price": "R$ 299,90",
  "oldPrice": "R$ 399,90",
  "link": "https://loja.com/produto",
  "tags": "promoção, tênis, nike",
  "telegramInviteLink": "https://t.me/+codigo-do-grupo",
  "whatsappInviteLink": "https://chat.whatsapp.com/codigo-do-grupo",
  "channels": ["TELEGRAM", "WHATSAPP"]
}

Resposta:
{
  "success": true,
  "data": {
    "post": { ... },
    "publishResults": [
      { "channel": "TELEGRAM", "success": true, "messageId": "123" },
      { "channel": "WHATSAPP", "success": true, "messageId": "https://wa.me/?text=..." }
    ],
    "whatsappLink": "https://wa.me/?text=..."
  }
}
```

Convites cruzados:
- Ao publicar no `TELEGRAM`, o post inclui o convite do WhatsApp (`whatsappInviteLink`).
- Ao publicar no `WHATSAPP`, o texto gerado inclui o convite do Telegram (`telegramInviteLink`).
- Se selecionar os dois canais, cada canal recebe o convite do outro.
- `TELEGRAM` exige `whatsappInviteLink`; `WHATSAPP` exige `telegramInviteLink`.

---

### Admin (somente ADMIN)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/dashboard` | Métricas gerais + ranking de posts por funcionário |
| GET | `/api/admin/users` | Listar todos os usuários |
| POST | `/api/admin/users` | Criar novo usuário |
| PATCH | `/api/admin/users/:id/toggle` | Ativar/desativar usuário |

---

## Segurança implementada

| Camada | Medida |
|---|---|
| Senhas | bcrypt com salt 12 rounds |
| JWT | Assinado com HS256, expiração de 8h |
| Sessões | Armazenadas no banco — logout invalida o token de verdade |
| Login | Rate limit de 5 tentativas por 15 min por IP |
| Headers | Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | Restrito ao domínio do frontend |
| Rate limit global | 100 req/min por IP |
| Body | Limitado a 1MB |
| Validação | Zod em todos os inputs — nunca confia no cliente |
| Autorização | Funcionário não acessa dados de outros usuários |
| Erros | Mensagens genéricas ao cliente, detalhes apenas no log |
| Graceful shutdown | Desconecta o banco ao encerrar |

---

## Para produção

Use `prisma/schema.production.prisma` com PostgreSQL.

Scripts principais:

```bash
npm run db:generate:prod
npm run db:migrate:deploy:prod
npm run start:prod
```

Veja o passo a passo em `docs/DEPLOY.md`.

---

## Estrutura do projeto

```
src/
  controllers/     # Recebe req, chama service, devolve res
  middlewares/     # Auth JWT, tratamento de erros
  models/          # Instância do Prisma
  routes/          # Definição das rotas
  services/        # Lógica de negócio (auth, publicação)
  types/           # Interfaces TypeScript
  utils/           # Logger, adaptador de conteúdo, seed
prisma/
  schema.prisma    # Modelos do banco
```

