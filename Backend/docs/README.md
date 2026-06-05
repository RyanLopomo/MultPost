# Documentacao do Multipost Backend

Esta pasta documenta o backend do Multipost e a integracao com o frontend.

## Indice

- [Visao geral e arquitetura](./ARCHITECTURE.md)
- [Referencia da API](./API.md)
- [Setup, variaveis e comandos](./SETUP.md)
- [Integracao Backend + Frontend](./INTEGRATION.md)

## Resumo rapido

O projeto e uma API Node.js com TypeScript e Express para criar posts promocionais e publica-los em canais externos. Atualmente os canais implementados sao Telegram e WhatsApp.

Principais responsabilidades:

- Autenticar usuarios com JWT.
- Manter sessoes no banco para permitir logout real e revogacao.
- Controlar permissao por perfil: `ADMIN` e `EMPLOYEE`.
- Criar, listar e detalhar posts.
- Publicar posts no Telegram e preparar links de compartilhamento para WhatsApp.
- Fornecer metricas administrativas e gestao basica de usuarios.

## Stack

- Node.js 20
- TypeScript
- Express
- Prisma ORM
- SQLite em desenvolvimento
- JWT
- bcrypt
- Zod
- Winston
- Helmet, CORS e rate limit

## Estrutura principal

```text
src/
  controllers/     Recebem requests, validam entradas e montam responses.
  middlewares/     Autenticacao, autorizacao e tratamento de erros.
  models/          Instancia compartilhada do Prisma.
  routes/          Declaracao das rotas HTTP.
  services/        Regras de negocio de autenticacao e publicacao.
  types/           Tipos TypeScript compartilhados.
  utils/           Logger, seed e adaptacao de conteudo.
prisma/
  schema.prisma    Modelos, enums e datasource do banco.
```

## Convencoes de resposta

As respostas seguem um formato simples:

```json
{
  "success": true,
  "data": {}
}
```

Em erros:

```json
{
  "success": false,
  "error": "Mensagem do erro"
}
```

Erros de validacao retornam tambem `details`, com o campo e a mensagem de validacao.
