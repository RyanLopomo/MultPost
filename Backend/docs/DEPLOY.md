# Deploy em producao

Este guia usa:

- Frontend: Vercel
- Backend: Render Web Service
- Banco: Render PostgreSQL

## Estrutura de banco

O projeto mantem dois schemas Prisma:

- `prisma/schema.prisma`: desenvolvimento local com SQLite.
- `prisma/schema.production.prisma`: producao com PostgreSQL.

As migrations de producao ficam em `prisma/migrations` e devem ser versionadas no Git.

## 1. Banco PostgreSQL no Render

1. Crie um PostgreSQL no Render.
2. Copie a Internal Database URL.
3. Use essa URL como `DATABASE_URL` no backend.

## 2. Backend no Render

Crie um Web Service apontando para a pasta `Backend`.

Configuracao:

```text
Root Directory: Backend
Build Command: npm install && npm run db:generate:prod && npm run build
Start Command: npm run start:prod
```

Variaveis de ambiente:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=uma_string_longa_segura
JWT_EXPIRES_IN=8h
NODE_ENV=production
PORT=3333
CORS_ORIGIN=https://seu-frontend.vercel.app
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

O comando `start:prod` aplica migrations pendentes com:

```bash
prisma migrate deploy --schema prisma/schema.production.prisma
```

Depois inicia:

```bash
node dist/index.js
```

## 3. Frontend na Vercel

Crie um projeto na Vercel apontando para a pasta `Frontend`.

Configuracao:

```text
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
```

Variavel de ambiente:

```env
VITE_API_URL=https://seu-backend.onrender.com
```

Depois do deploy do frontend, atualize `CORS_ORIGIN` no backend com a URL final da Vercel.

## 4. Seed de usuarios

Para criar os usuarios iniciais em producao, rode no shell do Render:

```bash
npm run db:seed
```

Credenciais criadas pelo seed:

```text
admin@empresa.com / admin@123
ana@empresa.com   / func@123
```

Troque as senhas apos o primeiro acesso.

## 5. Uploads de imagem

O backend salva imagens em `uploads/posts`.

Em producao, use uma destas opcoes:

- Configurar Persistent Disk no Render para manter uploads entre deploys/restarts.
- Migrar uploads para um servico externo como Cloudinary, S3 ou Supabase Storage.

Sem armazenamento persistente, imagens locais podem ser perdidas em redeploys.
