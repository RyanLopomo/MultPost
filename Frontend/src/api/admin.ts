import { api, unwrap } from './client';
import type { AdminDashboard, CreateUserPayload, UsersResponse } from '../types/admin';
import type { User } from '../types/auth';

export const adminApi = {
  dashboard() {
    return unwrap<AdminDashboard>(api.get('/api/admin/dashboard'));
  },
  users() {
    return unwrap<UsersResponse>(api.get('/api/admin/users'));
  },
  createUser(payload: CreateUserPayload) {
    return unwrap<User>(api.post('/api/admin/users', payload));
  },
  toggleUser(id: string) {
    return unwrap<User>(api.patch(`/api/admin/users/${id}/toggle`));
  },
};
