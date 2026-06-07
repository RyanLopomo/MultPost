import { InviteLinks, PostRecord as Post } from "../types";

interface AdaptedPost {
  telegram: string;
  whatsapp: string;
}

const ICON_PRODUCT = "\uD83D\uDCA5";
const ICON_PRICE = "\uD83D\uDCB5";
const ICON_COUPON = "\uD83C\uDF9F\uFE0F";
const ICON_GROUP = "\u26A1\uFE0F";
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function adaptPost(post: Post, inviteLinks: InviteLinks = {}): AdaptedPost {
  const telegram = buildTelegram(post, inviteLinks.whatsapp);
  const whatsapp = buildWhatsApp(post, inviteLinks.telegram);

  return { telegram, whatsapp };
}

function buildTelegram(post: Post, whatsappInviteLink?: string): string {
  const offerLines: string[] = [];
  const parts: string[] = [];

  if (post.title) parts.push(`${ICON_PRODUCT}<b>${escapeHtml(post.title)}</b>`);
  if (post.price) offerLines.push(`${ICON_PRICE}<b>VALOR : ${escapeHtml(post.price)}</b>`);
  if (post.description) offerLines.push(`${ICON_COUPON}<b>CUPOM : ${escapeHtml(post.description)}</b>`);
  if (post.link) offerLines.push(escapeHtml(post.link));
  if (offerLines.length) parts.push(offerLines.join("\n"));
  if (whatsappInviteLink) {
    parts.push(`${ICON_GROUP}<b>GRUPO de OFERTAS</b>\n${escapeHtml(whatsappInviteLink)}`);
  }

  return parts.join("\n\n").trim();
}

function buildWhatsApp(post: Post, telegramInviteLink?: string): string {
  const offerLines: string[] = [];
  const parts: string[] = [];

  if (post.title) parts.push(`${ICON_PRODUCT}*${post.title}*`);
  if (post.price) offerLines.push(`${ICON_PRICE}*VALOR : ${post.price}*`);
  if (post.description) offerLines.push(`${ICON_COUPON}*CUPOM : ${post.description}*`);
  if (post.link) offerLines.push(post.link);
  if (offerLines.length) parts.push(offerLines.join("\n"));
  if (telegramInviteLink) {
    parts.push(`${ICON_GROUP}*GRUPO de OFERTAS*\n${telegramInviteLink}`);
  }

  return parts.join("\n\n").trim();
}

export function buildWhatsAppLink(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text.normalize("NFC"))}`;
}
