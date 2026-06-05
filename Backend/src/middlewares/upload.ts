import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "./errorHandler";

const uploadDir = path.resolve(process.cwd(), "uploads", "posts");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
    callback(null, safeName);
  },
});

export const uploadPostImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError("Arquivo de imagem invalido.", 422));
      return;
    }

    callback(null, true);
  },
});
