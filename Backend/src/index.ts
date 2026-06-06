import "dotenv/config";
import path from "node:path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import adminRoutes from "./routes/admin";
import { logger } from "./utils/logger";
import { prisma } from "./models/prisma";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedVercelOriginPatterns = [
  /^https:\/\/mult-post\.vercel\.app$/,
  /^https:\/\/mult-post-[a-z0-9-]+-ryanlopomos-projects\.vercel\.app$/,
];

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (allowedVercelOriginPatterns.some((pattern) => pattern.test(origin))) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  }

  return false;
}

// ── Segurança ─────────────────────────────────────────────────────────────────

// Helmet define headers HTTP de segurança (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// CORS restrito ao domínio do frontend
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limit global — 100 req/min por IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Muitas requisições. Tente novamente em instantes." },
  })
);

// ── Parse ─────────────────────────────────────────────────────────────────────

// Limita o body a 1MB para evitar ataques de payload gigante
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// ── Rotas ─────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

// ── Erros ─────────────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ── Inicialização ─────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 3333;

async function bootstrap(): Promise<void> {
  // Valida variáveis obrigatórias antes de subir
  const required = ["JWT_SECRET", "DATABASE_URL"];
  for (const key of required) {
    if (!process.env[key]) {
      logger.error(`Variável de ambiente obrigatória ausente: ${key}`);
      process.exit(1);
    }
  }

  // Testa conexão com o banco
  await prisma.$connect();
  logger.info("Banco de dados conectado.");

  const server = app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT} [${process.env.NODE_ENV}]`);
  });

  server.on("error", async (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.error(
        `Porta ${PORT} ja esta em uso. Encerre o servidor antigo ou defina outra porta com PORT=${PORT + 1}.`
      );
    } else {
      logger.error("Erro ao iniciar listener HTTP", err);
    }

    await prisma.$disconnect();
    process.exit(1);
  });
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM recebido — encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  logger.error("Exceção não capturada", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Promise rejeitada sem tratamento", { reason });
  process.exit(1);
});

bootstrap().catch((err) => {
  logger.error("Falha ao iniciar o servidor", err);
  process.exit(1);
});
