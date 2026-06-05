import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, updatePassword } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Rate limit específico para login — 5 tentativas por 15 min por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Muitas tentativas. Aguarde 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);
router.patch("/password", authenticate, updatePassword);

export default router;
