import { api, unwrap } from './client';
import type { LoginPayload, LoginResponse, SessionUser } from '../types/auth';

export const authApi = {
  login(payload: LoginPayload) {
    return unwrap<LoginResponse>(api.post('/api/auth/login', payload));
  },
  logout() {
    return unwrap<Record<string, never>>(api.post('/api/auth/logout'));
  },
  me() {
    return unwrap<SessionUser>(api.get('/api/auth/me'));
  },
  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return unwrap<Record<string, never>>(api.patch('/api/auth/password', payload));
  },
};
