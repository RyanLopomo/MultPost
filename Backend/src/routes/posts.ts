import { Router } from "express";
import { createPost, listPosts, getPost } from "../controllers/postController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", createPost);
router.get("/", listPosts);
router.get("/:id", getPost);

export default router;
