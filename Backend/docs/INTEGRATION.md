# Integracao Backend + Frontend

Este guia descreve como rodar o Multipost completo em desenvolvimento.

## URLs locais

| Aplicacao | URL |
| --- | --- |
| Backend API | `http://localhost:3333` |
| Frontend Vite | `http://localhost:5173` |

## Variaveis que conectam os dois lados

No backend, `CORS_ORIGIN` precisa apontar para o frontend:

```env
CORS_ORIGIN="http://localhost:5173"
```

No frontend, `VITE_API_URL` precisa apontar para a API:

```env
VITE_API_URL=http://localhost:3333
```

## Ordem recomendada para rodar

### 1. Backend

```bash
cd Backend
npm install
npm run db:generate
npm run db:init
npm run db:seed
npm run dev
```

O backend deve responder em:

```text
GET http://localhost:3333/health
```

### 2. Frontend

Em outro terminal:

```bash
cd Frontend
npm install
npm run dev
```

Acesse:

```text
http://localhost:5173
```

## Login de teste

Depois de rodar o seed:

```text
admin@empresa.com / admin@123
ana@empresa.com   / func@123
```

## Como a autenticacao se conecta

1. O frontend chama `POST /api/auth/login`.
2. O backend retorna `token` e `user`.
3. O frontend salva o token no `localStorage`.
4. As proximas requisicoes enviam `Authorization: Bearer <token>`.
5. O backend valida o JWT e confere a sessao no banco.
6. Em erro `401`, o frontend limpa a sessao local e volta para `/login`.

## Publicacao e convites cruzados

Na tela de criacao de post, alem dos dados da oferta, informe os links de convite:

- `Convite Telegram`: link do grupo/canal do Telegram.
- `Convite WhatsApp`: link do grupo do WhatsApp.

O backend usa esses links de forma cruzada:

- Se o canal `TELEGRAM` for selecionado, a mensagem publicada no Telegram inclui o convite do WhatsApp.
- Se o canal `WHATSAPP` for selecionado, o texto gerado no link do WhatsApp inclui o convite do Telegram.
- Se os dois canais forem selecionados, cada canal divulga o convite do outro.

Validacao:

- `TELEGRAM` exige `Convite WhatsApp`.
- `WHATSAPP` exige `Convite Telegram`.
- Ambos precisam ser URLs validas quando preenchidos.

## Pontos de atencao

- Para publicar no WhatsApp, o backend apenas gera o link `https://wa.me/?text=...`; o envio final ainda e feito ao abrir esse link.
- Para publicar no Telegram, configure `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.
- Depois de editar o `.env`, reinicie o backend para recarregar as variaveis.
- O `TELEGRAM_CHAT_ID` pode ser obtido com bots como Show Json Bot, mas o bot do `TELEGRAM_BOT_TOKEN` tambem precisa estar no grupo/canal de destino.
- Se o frontend abrir em outra porta, atualize `CORS_ORIGIN` no backend.
- Se o backend abrir em outra porta, atualize `VITE_API_URL` no frontend.
