import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../models/prisma";
import { publishPost } from "../services/publishService";
import { AppError } from "../middlewares/errorHandler";

const createPostSchema = z
  .object({
    title: z.string().min(1, "Titulo obrigatorio.").max(200),
    description: z.string().max(1000).optional(),
    price: z.string().max(50).optional(),
    oldPrice: z.string().max(50).optional(),
    link: z.string().url("Link invalido.").optional().or(z.literal("")),
    tags: z.string().max(200).optional(),
    telegramInviteLink: z.string().url("Link do Telegram invalido.").optional().or(z.literal("")),
    whatsappInviteLink: z.string().url("Link do WhatsApp invalido.").optional().or(z.literal("")),
    channels: z
      .array(z.enum(["TELEGRAM", "WHATSAPP"]))
      .min(1, "Selecione ao menos um canal."),
  })
  .superRefine((data, ctx) => {
    if (data.channels.includes("TELEGRAM") && !data.whatsappInviteLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsappInviteLink"],
        message: "Link de convite do WhatsApp obrigatorio para posts no Telegram.",
      });
    }

    if (data.channels.includes("WHATSAPP") && !data.telegramInviteLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["telegramInviteLink"],
        message: "Link de convite do Telegram obrigatorio para posts no WhatsApp.",
      });
    }
  });

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createPostSchema.parse(req.body);
    const authorId = req.user!.sub;

    const post = await prisma.post.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        oldPrice: data.oldPrice,
        link: data.link || null,
        tags: data.tags,
        authorId,
        status: "PENDING",
      },
    });

    const results = await publishPost(post, data.channels, {
      telegram: data.telegramInviteLink || undefined,
      whatsapp: data.whatsappInviteLink || undefined,
    });

    const whatsappResult = results.find((r) => r.channel === "WHATSAPP");

    res.status(201).json({
      success: true,
      data: {
        post,
        publishResults: results,
        whatsappLink: whatsappResult?.messageId ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where =
      req.user!.role === "ADMIN" ? {} : { authorId: req.user!.sub };

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          publishings: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: { posts, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        publishings: true,
      },
    });

    if (!post) throw new AppError("Post nao encontrado.", 404);

    if (req.user!.role !== "ADMIN" && post.authorId !== req.user!.sub) {
      throw new AppError("Acesso negado.", 403);
    }

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}
