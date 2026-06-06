import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../models/prisma";
import { AppError } from "../middlewares/errorHandler";

export async function getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPosts,
      monthPosts,
      totalUsers,
      postsByEmployee,
      monthPostsByEmployee,
      employees,
      recentPosts,
    ] = await prisma.$transaction([
      prisma.post.count(),
      prisma.post.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { active: true, role: "EMPLOYEE" } }),
      prisma.post.groupBy({
        by: ["authorId"],
        _count: { id: true },
        orderBy: { authorId: "asc" },
      }),
      prisma.post.groupBy({
        by: ["authorId"],
        where: { createdAt: { gte: startOfMonth } },
        _count: { id: true },
        orderBy: { authorId: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "EMPLOYEE" },
        select: { id: true, name: true, email: true, active: true },
        orderBy: { name: "asc" },
      }),
      prisma.post.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
          publishings: { select: { channel: true, status: true } },
        },
      }),
    ]);

    const totalByEmployee = new Map(
      postsByEmployee.map((p) => [p.authorId, typeof p._count === "object" ? p._count?.id ?? 0 : 0])
    );
    const monthByEmployee = new Map(
      monthPostsByEmployee.map((p) => [p.authorId, typeof p._count === "object" ? p._count?.id ?? 0 : 0])
    );

    const ranking = employees
      .map((employee) => {
        const total = totalByEmployee.get(employee.id) ?? 0;
        return {
          userId: employee.id,
          id: employee.id,
          name: employee.name,
          email: employee.email,
          active: employee.active,
          totalPosts: total,
          postsCount: total,
          monthPosts: monthByEmployee.get(employee.id) ?? 0,
        };
      })
      .sort((a, b) => b.monthPosts - a.monthPosts || b.totalPosts - a.totalPosts || a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      data: { totalPosts, monthPosts, totalUsers, ranking, recentPosts },
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

const createUserSchema = z.object({
  name: z.string().min(2, "Nome muito curto.").max(100),
  email: z.string().email("E-mail invalido.").toLowerCase(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
});

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createUserSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new AppError("E-mail ja cadastrado.", 409);

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function toggleUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (id === req.user!.sub) {
      throw new AppError("Nao e possivel desativar sua propria conta.", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("Usuario nao encontrado.", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: { id: true, name: true, active: true },
    });

    if (!updated.active) {
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
