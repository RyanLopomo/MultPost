# Referencia da API

Base local esperada:

```text
http://localhost:3333
```

Rotas protegidas exigem:

```http
Authorization: Bearer <token>
```

## Health

### GET `/health`

Verifica se o servidor esta respondendo.

Resposta:

```json
{
  "status": "ok",
  "timestamp": "2026-06-04T00:00:00.000Z"
}
```

## Autenticacao

### POST `/api/auth/login`

Autentica usuario e cria sessao.

Rate limit: 5 tentativas a cada 15 minutos por IP.

Body:

```json
{
  "email": "admin@empresa.com",
  "password": "admin@123"
}
```

Validacoes:

- `email`: e-mail valido.
- `password`: minimo de 6 caracteres.

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "token": "jwt",
    "user": {
      "id": "user_id",
      "name": "Administrador",
      "email": "admin@empresa.com",
      "role": "ADMIN"
    }
  }
}
```

### POST `/api/auth/logout`

Remove a sessao do banco.

Autenticacao: obrigatoria.

Resposta `200`:

```json
{
  "success": true,
  "message": "Logout realizado."
}
```

### GET `/api/auth/me`

Retorna os dados do token autenticado.

Autenticacao: obrigatoria.

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "sub": "user_id",
    "email": "admin@empresa.com",
    "role": "ADMIN",
    "sessionId": "session_id"
  }
}
```

### PATCH `/api/auth/password`

Troca a senha do usuario logado e revoga suas sessoes.

Autenticacao: obrigatoria.

Body:

```json
{
  "currentPassword": "admin@123",
  "newPassword": "NovaSenha1"
}
```

Validacoes:

- `currentPassword`: obrigatoria.
- `newPassword`: minimo de 8 caracteres, ao menos uma letra maiuscula e ao menos um numero.

Resposta `200`:

```json
{
  "success": true,
  "message": "Senha atualizada com sucesso."
}
```

## Posts

Todas as rotas de posts exigem autenticacao.

### POST `/api/posts`

Cria um post e tenta publica-lo nos canais informados.

Body:

```json
{
  "title": "Tenis Nike Air Max",
  "description": "Lancamento exclusivo",
  "price": "R$ 299,90",
  "oldPrice": "R$ 399,90",
  "link": "https://loja.com/produto",
  "tags": "promocao, tenis, nike",
  "telegramInviteLink": "https://t.me/+codigo-do-grupo",
  "whatsappInviteLink": "https://chat.whatsapp.com/codigo-do-grupo",
  "channels": ["TELEGRAM", "WHATSAPP"]
}
```

Validacoes:

- `title`: obrigatorio, ate 200 caracteres.
- `description`: opcional, ate 1000 caracteres.
- `price`: opcional, ate 50 caracteres.
- `oldPrice`: opcional, ate 50 caracteres.
- `link`: opcional, precisa ser URL valida quando preenchido.
- `tags`: opcional, ate 200 caracteres.
- `telegramInviteLink`: URL do grupo/canal do Telegram. Obrigatoria quando `channels` inclui `WHATSAPP`.
- `whatsappInviteLink`: URL do grupo do WhatsApp. Obrigatoria quando `channels` inclui `TELEGRAM`.
- `channels`: lista obrigatoria com ao menos um item entre `TELEGRAM` e `WHATSAPP`.

Links de convite por canal:

- Ao publicar no `TELEGRAM`, o texto enviado inclui o `whatsappInviteLink`.
- Ao publicar no `WHATSAPP`, o link gerado inclui o `telegramInviteLink`.
- Ao publicar nos dois canais, cada mensagem recebe o convite do outro canal.

Resposta `201`:

```json
{
  "success": true,
  "data": {
    "post": {
      "id": "post_id",
      "title": "Tenis Nike Air Max",
      "status": "PENDING"
    },
    "publishResults": [
      {
        "channel": "TELEGRAM",
        "success": true,
        "messageId": "123"
      },
      {
        "channel": "WHATSAPP",
        "success": true,
        "messageId": "https://wa.me/?text=..."
      }
    ],
    "whatsappLink": "https://wa.me/?text=..."
  }
}
```

### GET `/api/posts`

Lista posts com paginacao.

Query params:

- `page`: pagina atual, padrao `1`.
- `limit`: itens por pagina, padrao `20`, maximo `50`.

Permissao:

- `ADMIN`: ve todos os posts.
- `EMPLOYEE`: ve apenas os proprios posts.

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "posts": [],
    "total": 0,
    "page": 1,
    "pages": 0
  }
}
```

### GET `/api/posts/:id`

Retorna o detalhe de um post.

Permissao:

- `ADMIN`: acessa qualquer post.
- `EMPLOYEE`: acessa somente posts em que e autor.

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "id": "post_id",
    "title": "Tenis Nike Air Max",
    "author": {},
    "publishings": []
  }
}
```

## Admin

Todas as rotas admin exigem autenticacao e perfil `ADMIN`.

### GET `/api/admin/dashboard`

Retorna metricas administrativas.

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "totalPosts": 10,
    "monthPosts": 3,
    "totalUsers": 2,
    "ranking": [],
    "recentPosts": []
  }
}
```

### GET `/api/admin/users`

Lista usuarios.

Resposta `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "Ana Lima",
      "email": "ana@empresa.com",
      "role": "EMPLOYEE",
      "active": true,
      "createdAt": "2026-06-04T00:00:00.000Z",
      "_count": {
        "posts": 0
      }
    }
  ]
}
```

### POST `/api/admin/users`

Cria usuario.

Body:

```json
{
  "name": "Ana Lima",
  "email": "ana@empresa.com",
  "password": "Senha123",
  "role": "EMPLOYEE"
}
```

Validacoes:

- `name`: entre 2 e 100 caracteres.
- `email`: e-mail valido.
- `password`: minimo de 8 caracteres, ao menos uma letra maiuscula e ao menos um numero.
- `role`: `ADMIN` ou `EMPLOYEE`; padrao `EMPLOYEE`.

Resposta `201`:

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Ana Lima",
    "email": "ana@empresa.com",
    "role": "EMPLOYEE",
    "createdAt": "2026-06-04T00:00:00.000Z"
  }
}
```

### PATCH `/api/admin/users/:id/toggle`

Ativa ou desativa usuario.

Regras:

- Admin nao pode desativar a propria conta.
- Ao desativar um usuario, as sessoes dele sao revogadas.

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Ana Lima",
    "active": false
  }
}
```

## Status de erro comuns

- `400`: regra de negocio invalida.
- `401`: token ausente, invalido, sessao expirada ou credenciais invalidas.
- `403`: usuario sem permissao ou conta desativada.
- `404`: recurso ou rota nao encontrado.
- `409`: conflito, como e-mail ja cadastrado.
- `422`: erro de validacao Zod.
- `500`: erro interno inesperado.
