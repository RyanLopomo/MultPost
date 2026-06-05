import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../models/prisma";
import { JwtPayload } from "../types";
import { logger } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Token não fornecido." });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado.");

    const payload = jwt.verify(token, secret) as JwtPayload;

    // Verifica se a sessão ainda existe no banco (permite logout real)
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { active: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ success: false, error: "Sessão expirada." });
      return;
    }

    if (!session.user.active) {
      res.status(403).json({ success: false, error: "Conta desativada." });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    logger.warn("Tentativa de acesso com token inválido", { ip: req.ip });
    res.status(401).json({ success: false, error: "Token inválido." });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Acesso restrito ao administrador." });
    return;
  }
  next();
}
