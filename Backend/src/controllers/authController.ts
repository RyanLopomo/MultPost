import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { loginUser, logoutUser, changePassword } from "../services/authService";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido.").toLowerCase(),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Nova senha deve ter ao menos 8 caracteres.")
    .regex(/[A-Z]/, "Nova senha deve ter ao menos uma letra maiúscula.")
    .regex(/[0-9]/, "Nova senha deve ter ao menos um número."),
});

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await loginUser(
      email,
      password,
      req.ip,
      req.headers["user-agent"]
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.slice(7) ?? "";
    await logoutUser(token);
    res.status(200).json({ success: true, message: "Logout realizado." });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, data: req.user });
}

export async function updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await changePassword(req.user!.sub, currentPassword, newPassword);
    res.status(200).json({ success: true, message: "Senha atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}
