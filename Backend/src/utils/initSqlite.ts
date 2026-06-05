import { prisma } from "../models/prisma";

async function initSqlite(): Promise<void> {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE',
    active BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`);

  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT,
    CONSTRAINT sessions_userId_fkey FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
  )`);

  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS posts (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    oldPrice TEXT,
    link TEXT,
    tags TEXT,
    imagePath TEXT,
    authorId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT posts_authorId_fkey FOREIGN KEY (authorId) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
  )`);

  const postColumns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info(posts)`);
  if (!postColumns.some((column) => column.name === "imagePath")) {
    await prisma.$executeRawUnsafe(`ALTER TABLE posts ADD COLUMN imagePath TEXT`);
  }

  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS publishings (
    id TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    sentAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    errorMsg TEXT,
    messageId TEXT,
    CONSTRAINT publishings_postId_fkey FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
  )`);

  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS channel_config (
    id TEXT NOT NULL PRIMARY KEY,
    telegramToken TEXT,
    telegramChatId TEXT,
    whatsappNumber TEXT,
    postSignature TEXT,
    updatedAt DATETIME NOT NULL
  )`);
}

initSqlite()
  .then(() => {
    console.log("SQLite local sincronizado.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
