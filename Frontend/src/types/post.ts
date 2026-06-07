export type Channel = 'TELEGRAM' | 'WHATSAPP';
export type PublishStatus = 'PENDING' | 'PUBLISHED' | 'FAILED' | 'SUCCESS';

export type PublishResult = {
  id?: string;
  channel: Channel;
  status?: PublishStatus;
  success?: boolean;
  messageId?: string;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PostAuthor = {
  id: string;
  name: string;
  email: string;
};

export type Post = {
  id: string;
  title: string;
  description?: string | null;
  price?: string | null;
  oldPrice?: string | null;
  link?: string | null;
  tags?: string | null;
  imagePath?: string | null;
  status?: PublishStatus;
  channels?: Channel[];
  author?: PostAuthor;
  user?: PostAuthor;
  userId?: string;
  publishResults?: PublishResult[];
  publications?: PublishResult[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePostPayload = {
  title: string;
  description?: string;
  price?: string;
  link?: string;
  image?: File | null;
  telegramInviteLink?: string;
  whatsappInviteLink?: string;
  channels: Channel[];
};

export type CreatePostResponse = {
  post: Post;
  publishResults: PublishResult[];
  whatsappLink?: string;
};

export type PostsListResponse = {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
};
