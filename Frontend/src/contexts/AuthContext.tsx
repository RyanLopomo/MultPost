/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { authStorage } from '../api/storage';
import type { LoginPayload, User } from '../types/auth';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authApi.login(payload);
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (authStorage.getToken()) await authApi.logout();
    } catch {
      // Logout local deve acontecer mesmo que a API falhe.
    } finally {
      authStorage.clear();
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    const session = await authApi.me();
    const current = authStorage.getUser();
    const nextUser: User = {
      id: current?.id || session.sub,
      name: current?.name || session.email,
      email: session.email,
      role: session.role,
    };
    authStorage.setUser(nextUser);
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
    refreshMe,
  }), [user, token, login, logout, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
