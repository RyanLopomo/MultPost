import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { PostListPage } from '../pages/posts/PostListPage';
import { CreatePostPage } from '../pages/posts/CreatePostPage';
import { PostDetailPage } from '../pages/posts/PostDetailPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { AccountPage } from '../pages/account/AccountPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/posts" element={<PostListPage />} />
          <Route path="/posts/new" element={<CreatePostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/account" element={<AccountPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/posts" replace />} />
      <Route path="*" element={<Navigate to="/posts" replace />} />
    </Routes>
  );
}
