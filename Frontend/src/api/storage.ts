import type { User } from '../types/auth';

const TOKEN_KEY = 'multipost:token';
const USER_KEY = 'multipost:user';

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },
  clear() {
    this.removeToken();
    this.removeUser();
  },
};
