import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: "Dados invalidos.",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err.name === "MulterError") {
    const message = "code" in err && err.code === "LIMIT_FILE_SIZE"
      ? "Imagem deve ter no maximo 5 MB."
      : "Upload de imagem invalido.";

    res.status(422).json({
      success: false,
      error: message,
    });
    return;
  }

  logger.error("Erro interno nao tratado", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(500).json({
    success: false,
    error: "Erro interno do servidor.",
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Rota ${req.method} ${req.path} nao encontrada.`,
  });
}
