# Setup, variaveis e comandos

## Requisitos

- Node.js 20 ou superior.
- npm.
- Acesso as variaveis de ambiente necessarias.

O backend carrega automaticamente o arquivo `.env` usando `dotenv`.

## Instalacao

Dentro da pasta `Backend`:

```bash
npm install
```

## Variaveis de ambiente

Crie um arquivo `.env` na pasta `Backend`.

Exemplo:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="coloque_uma_string_longa_e_segura_aqui"
JWT_EXPIRES_IN="8h"
PORT=3333
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
```

Variaveis obrigatorias na inicializacao:

- `DATABASE_URL`
- `JWT_SECRET`

Variaveis usadas para Telegram:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Ao alterar qualquer variavel do `.env`, reinicie o backend. Para grupos/canais do Telegram,
o `TELEGRAM_CHAT_ID` e o ID do destino, mas o bot do `TELEGRAM_BOT_TOKEN` precisa ser
adicionado ao grupo/canal para conseguir publicar.

Variaveis opcionais:

- `JWT_EXPIRES_IN`: padrao `8h`.
- `PORT`: padrao `3333`.
- `NODE_ENV`: altera nivel de logs e comportamento de cache do Prisma.
- `CORS_ORIGIN`: padrao `http://localhost:5173`. Aceita multiplas origens separadas por virgula.

Para conectar com o frontend local, mantenha `CORS_ORIGIN` igual a URL do Vite:

```env
CORS_ORIGIN="http://localhost:5173"
```

Se o Vite subir em outra porta, inclua tambem essa origem:

```env
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
```

## Banco de dados

Gerar Prisma Client:

```bash
npm run db:generate
```

Rodar migrations em desenvolvimento:

```bash
npm run db:migrate
```

Para sincronizar rapidamente o SQLite local sem criar migration, tambem e possivel usar:

```bash
npx prisma db push
```

Se o schema engine do Prisma falhar no Windows, use o inicializador local:

```bash
npm run db:init
```

Popular usuarios iniciais:

```bash
npm run db:seed
```

Usuarios criados pelo seed:

```text
admin@empresa.com / admin@123
ana@empresa.com   / func@123
```

## Execucao

Desenvolvimento:

```bash
npm run dev
```

Se aparecer `EADDRINUSE` na porta `3333`, ja existe um servidor usando essa porta. No PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3333 | Select-Object LocalAddress,LocalPort,State,OwningProcess
Get-CimInstance Win32_Process -Filter "ProcessId = <PID>" | Select-Object ProcessId,CommandLine
Stop-Process -Id <PID>
```

Tambem e possivel subir o backend em outra porta:

```powershell
$env:PORT=3334; npm run dev
```

Build:

```bash
npm run build
```

Producao:

```bash
npm start
```

## Publicacao de posts

Ao criar um post, informe os links de convite de Telegram e WhatsApp quando os canais forem usados.
Os convites sao aplicados de forma cruzada:

- Canal `TELEGRAM`: inclui no texto o convite do WhatsApp.
- Canal `WHATSAPP`: inclui no texto gerado o convite do Telegram.
- Canais `TELEGRAM` e `WHATSAPP`: cada canal divulga o convite do outro.

Tambem e possivel anexar uma imagem no post. O backend salva o arquivo em `uploads/posts`
e, quando o canal `TELEGRAM` for selecionado, envia a imagem como foto com legenda. O
link de WhatsApp continua sendo apenas texto, pois `wa.me` nao anexa arquivos automaticamente.

## Scripts disponiveis

| Script | Descricao |
| --- | --- |
| `npm run dev` | Inicia o servidor com hot reload via `tsx watch`. |
| `npm run build` | Compila TypeScript para `dist`. |
| `npm run build:render` | Instala dependencias de build, gera Prisma prod e compila para Render. |
| `npm start` | Executa `dist/index.js`. |
| `npm run db:migrate` | Roda `prisma migrate dev`. |
| `npm run db:migrate:deploy:prod` | Aplica migrations PostgreSQL de producao. |
| `npm run db:generate` | Gera Prisma Client. |
| `npm run db:generate:prod` | Gera Prisma Client usando `schema.production.prisma`. |
| `npm run db:init` | Cria/sincroniza as tabelas SQLite locais sem usar o schema engine. |
| `npm run db:seed` | Executa o seed de usuarios iniciais. |
| `npm run start:prod` | Aplica migrations de producao e inicia o backend compilado. |

## Observacoes de producao

- Usar `prisma/schema.production.prisma` com PostgreSQL.
- Versionar e aplicar migrations em `prisma/migrations`.
- Usar `NODE_ENV=production`.
- Configurar HTTPS via proxy reverso ou plataforma de deploy.
- Guardar `.env` fora do versionamento.
- Definir `JWT_SECRET` longo, aleatorio e exclusivo do ambiente.
- Configurar rotacao e coleta dos arquivos em `logs/`.
