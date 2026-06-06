import type { User } from '../types/auth';

const TOKEN_KEY = 'multipost:token';
const USER_KEY = 'multipost:user';

localStorage.removeItem(TOKEN_KEY);
localStorage.removeItem(USER_KEY);

export const authStorage = {
  getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  },
  getUser(): User | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser(user: User) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser() {
    sessionStorage.removeItem(USER_KEY);
  },
  clear() {
    this.removeToken();
    this.removeUser();
  },
};
