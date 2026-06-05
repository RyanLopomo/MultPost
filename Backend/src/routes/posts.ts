import { Router } from "express";
import { createPost, listPosts, getPost } from "../controllers/postController";
import { authenticate } from "../middlewares/auth";
import { uploadPostImage } from "../middlewares/upload";

const router = Router();

router.use(authenticate);

router.post("/", uploadPostImage.single("image"), createPost);
router.get("/", listPosts);
router.get("/:id", getPost);

export default router;
