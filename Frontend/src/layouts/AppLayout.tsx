import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, FilePlus2, Files, LogOut, Menu, Settings, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';
import { getInitials } from '../utils/format';

const baseLinks = [
  { to: '/posts', label: 'Posts', icon: Files },
  { to: '/posts/new', label: 'Criar post', icon: FilePlus2 },
  { to: '/account', label: 'Minha conta', icon: Settings },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard Admin', icon: BarChart3 },
  { to: '/admin/users', label: 'Usuários', icon: Users },
];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = isAdmin ? [...adminLinks, ...baseLinks] : baseLinks;

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <div>
          <p className="text-lg font-black tracking-tight text-slate-950">Multipost</p>
          <p className="text-xs font-medium text-slate-500">Painel operacional</p>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
            {getInitials(user?.name, user?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">{user?.name || 'Usuário'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <Button variant="secondary" className="w-full" leftIcon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </button>
        <p className="font-black">Multipost</p>
        <div className="h-9 w-9 rounded-full bg-slate-950 text-white" />
      </header>

      <div className="flex min-h-screen">
        <div className="hidden lg:block">{sidebar}</div>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} aria-label="Fechar overlay" />
            <div className="relative h-full">{sidebar}</div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
