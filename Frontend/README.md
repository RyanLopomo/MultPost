# Multipost Frontend

Frontend operacional para o projeto **Multipost**, feito com React, TypeScript, Vite, React Router, Tailwind CSS e Axios.

## Recursos implementados

- Login com persistência de sessão em `localStorage`
- Interceptor Axios com `Authorization: Bearer <token>`
- Logout automático em erro `401`
- Rotas autenticadas e rotas somente `ADMIN`
- Layout autenticado responsivo com sidebar mobile/desktop
- Lista de posts com paginação
- Criação de post com validação frontend compatível com a API
- Exibição de resultado de publicação por canal
- Detalhe do post com histórico/status por canal
- Dashboard administrativo
- Gestão de usuários
- Minha conta com troca de senha
- Componentes reutilizáveis: botão, input, textarea, tabela, badge, loading, alerta e card

## Stack

- React + TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

Nesta maquina, o frontend foi instalado e validado com `pnpm` por causa de uma falha interna do npm local:

```bash
pnpm install
pnpm run dev
```

A aplicação abrirá em:

```bash
http://localhost:5173
```

A API esperada fica em:

```bash
http://localhost:3333
```

O backend precisa estar rodando com `CORS_ORIGIN=http://localhost:5173`.

## Variável de ambiente

Crie o arquivo `.env` com:

```env
VITE_API_URL=http://localhost:3333
```

## Criacao de posts

A tela de criacao de post possui os campos da oferta, os canais de publicacao e dois links de convite:

- `Imagem do post`: upload opcional de imagem ate 5 MB.
- `Convite Telegram`: usado no texto gerado para WhatsApp.
- `Convite WhatsApp`: usado na mensagem publicada no Telegram.

Validacao aplicada na tela:

- Selecionar `TELEGRAM` exige preencher `Convite WhatsApp`.
- Selecionar `WHATSAPP` exige preencher `Convite Telegram`.
- Se os dois canais forem selecionados, os dois convites sao obrigatorios.
- Links preenchidos precisam ser URLs validas.

## Scripts

```bash
npm run dev      # roda em desenvolvimento
npm run build    # gera build de produção
npm run preview  # pré-visualiza build
npm run lint     # executa eslint
```

## Estrutura

```txt
src/
  api/          # cliente Axios e serviços da API
  components/   # componentes reutilizáveis
  contexts/     # AuthContext
  hooks/        # hooks reutilizáveis
  layouts/      # layouts de login e painel
  pages/        # telas do sistema
  routes/       # rotas e guards
  types/        # tipagens da API
  utils/        # helpers
```

## Credenciais de teste sugeridas

A tela de login vem preenchida com:

```txt
email: admin@empresa.com
senha: admin@123
```

Altere conforme os usuários cadastrados no backend.
