export type Role = "ADMIN" | "EMPLOYEE";
export type PostStatus = "PENDING" | "PUBLISHED" | "FAILED";
export type Channel = "TELEGRAM" | "WHATSAPP";
export type PubStatus = "SUCCESS" | "FAILED";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sessionId: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PostCreateInput {
  title: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  link?: string;
  tags?: string;
  telegramInviteLink?: string;
  whatsappInviteLink?: string;
  channels: ("TELEGRAM" | "WHATSAPP")[];
}

export interface InviteLinks {
  telegram?: string;
  whatsapp?: string;
}

export interface PublishResult {
  channel: "TELEGRAM" | "WHATSAPP";
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface PostRecord {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  oldPrice: string | null;
  link: string | null;
  tags: string | null;
  authorId: string;
  status: PostStatus | string;
  createdAt: Date;
  updatedAt: Date;
}
