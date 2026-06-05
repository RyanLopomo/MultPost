import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <Outlet />
      </div>
    </main>
  );
}
