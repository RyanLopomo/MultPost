import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../models/prisma";
import { AppError } from "../middlewares/errorHandler";
import { JwtPayload, Role } from "../types";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";

export async function loginUser(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ token: string; user: { id: string; name: string; email: string; role: string } }> {
  // Busca o usuário — mensagem genérica para não revelar se o e-mail existe
  const user = await prisma.user.findUnique({ where: { email } });

  const genericError = new AppError("Credenciais inválidas.", 401);

  if (!user || !user.active) throw genericError;

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    logger.warn("Tentativa de login com senha incorreta", { email, ip: ipAddress });
    throw genericError;
  }

  // Cria sessão no banco (permite logout e revogação)
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role as Role,
    sessionId: "",
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

  const session = await prisma.session.create({
    data: { userId: user.id, token, expiresAt, ipAddress, userAgent },
  });

  // Re-assina incluindo o sessionId real
  const finalPayload: JwtPayload = { ...payload, sessionId: session.id };
  const finalToken = jwt.sign(finalPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

  await prisma.session.update({
    where: { id: session.id },
    data: { token: finalToken },
  });

  logger.info("Login bem-sucedido", { userId: user.id, email: user.email });

  return {
    token: finalToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function logoutUser(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new AppError("Senha atual incorreta.", 401);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Invalida todas as sessões ativas ao trocar a senha
  await prisma.session.deleteMany({ where: { userId } });

  logger.info("Senha alterada e sessões revogadas", { userId });
}
