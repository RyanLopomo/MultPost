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
    return unwrap<CreatePostResponse>(api.post('/api/posts', payload));
  },
};
