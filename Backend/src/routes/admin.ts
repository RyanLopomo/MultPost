import { Router } from "express";
import { getDashboard, listUsers, createUser, toggleUser } from "../controllers/adminController";
import { authenticate, requireAdmin } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id/toggle", toggleUser);

export default router;
