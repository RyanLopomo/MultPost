import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../models/prisma";
import { adaptPost, buildWhatsAppLink } from "../utils/contentAdapter";
import { InviteLinks, PublishResult, PostRecord as Post } from "../types";
import { logger } from "../utils/logger";

let telegramBot: TelegramBot | null = null;

type TelegramApiError = Error & {
  response?: {
    body?: {
      parameters?: {
        migrate_to_chat_id?: number;
      };
    };
  };
};

function getTelegramBot(): TelegramBot {
  if (!telegramBot) {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN nao configurado. Reinicie o backend apos editar o .env.");
    telegramBot = new TelegramBot(token);
  }
  return telegramBot;
}

async function publishToTelegram(post: Post, text: string): Promise<PublishResult> {
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!chatId) {
    return {
      channel: "TELEGRAM",
      success: false,
      error: "TELEGRAM_CHAT_ID nao configurado. Reinicie o backend apos editar o .env.",
    };
  }

  try {
    const bot = getTelegramBot();
    const message = await bot.sendMessage(chatId, text, { parse_mode: "HTML" });

    await prisma.publishing.create({
      data: {
        postId: post.id,
        channel: "TELEGRAM",
        status: "SUCCESS",
        messageId: String(message.message_id),
      },
    });

    logger.info("Post publicado no Telegram", { postId: post.id, messageId: message.message_id });
    return { channel: "TELEGRAM", success: true, messageId: String(message.message_id) };
  } catch (err) {
    const telegramError = err as TelegramApiError;
    const rawError = err instanceof Error ? err.message : "Erro desconhecido";
    const migratedChatId = telegramError.response?.body?.parameters?.migrate_to_chat_id;
    const error = migratedChatId
      ? `Grupo do Telegram migrado para supergrupo. Atualize TELEGRAM_CHAT_ID para ${migratedChatId} e reinicie o backend.`
      : rawError.includes("chat not found")
        ? "Chat do Telegram nao encontrado. Confira se o bot do TELEGRAM_BOT_TOKEN foi adicionado ao grupo/canal do TELEGRAM_CHAT_ID."
        : rawError;
    logger.error("Falha ao publicar no Telegram", { postId: post.id, error });

    await prisma.publishing.create({
      data: { postId: post.id, channel: "TELEGRAM", status: "FAILED", errorMsg: error },
    });

    return { channel: "TELEGRAM", success: false, error };
  }
}

async function prepareWhatsApp(post: Post, text: string): Promise<PublishResult> {
  try {
    const waLink = buildWhatsAppLink(text);

    await prisma.publishing.create({
      data: { postId: post.id, channel: "WHATSAPP", status: "SUCCESS", messageId: waLink },
    });

    return { channel: "WHATSAPP", success: true, messageId: waLink };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    logger.error("Falha ao preparar WhatsApp", { postId: post.id, error });
    return { channel: "WHATSAPP", success: false, error };
  }
}

export async function publishPost(
  post: Post,
  channels: ("TELEGRAM" | "WHATSAPP")[],
  inviteLinks: InviteLinks = {}
): Promise<PublishResult[]> {
  const { telegram, whatsapp } = adaptPost(post, inviteLinks);
  const results: PublishResult[] = [];

  for (const channel of channels) {
    if (channel === "TELEGRAM") {
      results.push(await publishToTelegram(post, telegram));
    }
    if (channel === "WHATSAPP") {
      results.push(await prepareWhatsApp(post, whatsapp));
    }
  }

  // Atualiza status geral do post
  const allOk = results.every((r) => r.success);
  await prisma.post.update({
    where: { id: post.id },
    data: { status: allOk ? "PUBLISHED" : "FAILED" },
  });

  return results;
}
