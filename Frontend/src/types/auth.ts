export type UserRole = 'ADMIN' | 'EMPLOYEE';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
  postsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SessionUser = {
  sub: string;
  email: string;
  role: UserRole;
  sessionId: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};
