import { api, unwrap } from './client';
import type { CreatePostPayload, CreatePostResponse, Post, PostsListResponse } from '../types/post';

export const postsApi = {
  list(page = 1, limit = 20) {
    return unwrap<PostsListResponse>(api.get('/api/posts', { params: { page, limit } }));
  },
  detail(id: string) {
    return unwrap<Post>(api.get(`/api/posts/${id}`));
  },
  create(payload: CreatePostPayload) {
    const body = new FormData();

    body.append('title', payload.title);
    if (payload.description) body.append('description', payload.description);
    if (payload.price) body.append('price', payload.price);
    if (payload.link) body.append('link', payload.link);
    if (payload.presetText) body.append('presetText', payload.presetText);
    if (payload.telegramInviteLink) body.append('telegramInviteLink', payload.telegramInviteLink);
    if (payload.whatsappInviteLink) body.append('whatsappInviteLink', payload.whatsappInviteLink);
    if (payload.image) body.append('image', payload.image);
    body.append('channels', JSON.stringify(payload.channels));

    return unwrap<CreatePostResponse>(api.post('/api/posts', body));
  },
};
