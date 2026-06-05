import { InviteLinks, PostRecord as Post } from "../types";

interface AdaptedPost {
  telegram: string;
  whatsapp: string;
}

function formatTags(raw: string | null): string {
  if (!raw) return "";
  return raw
    .split(",")
    .map((t) => "#" + t.trim().replace(/\s+/g, "_"))
    .filter(Boolean)
    .join(" ");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function adaptPost(post: Post, inviteLinks: InviteLinks = {}): AdaptedPost {
  const tags = formatTags(post.tags);

  const telegram = buildTelegram(post, tags, inviteLinks.whatsapp);
  const whatsapp = buildWhatsApp(post, tags, inviteLinks.telegram);

  return { telegram, whatsapp };
}

function buildTelegram(post: Post, tags: string, whatsappInviteLink?: string): string {
  const parts: string[] = [];

  if (post.title) parts.push(`<b>${escapeHtml(post.title)}</b>`);
  if (post.description) parts.push(escapeHtml(post.description));

  if (post.price) {
    const priceStr = post.oldPrice
      ? `💰 <b>${escapeHtml(post.price)}</b>  <s>${escapeHtml(post.oldPrice)}</s>`
      : `💰 <b>${escapeHtml(post.price)}</b>`;
    parts.push(priceStr);
  }

  if (post.link) parts.push(`\n${escapeHtml(post.link)}`);
  if (whatsappInviteLink) {
    parts.push(`Entre no nosso grupo do WhatsApp:\n${escapeHtml(whatsappInviteLink)}`);
  }
  if (tags) parts.push(escapeHtml(tags));

  return parts.join("\n\n").trim();
}

function buildWhatsApp(post: Post, tags: string, telegramInviteLink?: string): string {
  const parts: string[] = [];

  if (post.title) parts.push(`*${post.title}*`);
  if (post.description) parts.push(post.description);

  if (post.price) {
    const priceStr = post.oldPrice
      ? `*Preço: ${post.price}* (de ${post.oldPrice})`
      : `*Preço: ${post.price}*`;
    parts.push(priceStr);
  }

  if (post.link) parts.push(`\n${post.link}`);
  if (telegramInviteLink) {
    parts.push(`Entre no nosso grupo do Telegram:\n${telegramInviteLink}`);
  }
  if (tags) parts.push(tags);

  return parts.join("\n\n").trim();
}

export function buildWhatsAppLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
