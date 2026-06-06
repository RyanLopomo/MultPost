import type { Post } from './post';
import type { User, UserRole } from './auth';

export type RankingItem = {
  userId?: string;
  id?: string;
  name: string;
  email?: string;
  active?: boolean;
  monthPosts?: number;
  postsCount?: number;
  totalPosts?: number;
};

export type AdminDashboard = {
  totalPosts: number;
  monthPosts: number;
  totalUsers: number;
  ranking: RankingItem[];
  recentPosts: Post[];
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UsersResponse = User[];
