import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  console.log("🌱 Iniciando seed...");

  const adminPassword = await bcrypt.hash("admin@123", 12);
  const empPassword = await bcrypt.hash("func@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@empresa.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "ana@empresa.com" },
    update: {},
    create: {
      name: "Ana Lima",
      email: "ana@empresa.com",
      passwordHash: empPassword,
      role: "EMPLOYEE",
    },
  });

  console.log("✅ Seed concluído.");
  console.log("   admin@empresa.com  /  admin@123");
  console.log("   ana@empresa.com    /  func@123");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
