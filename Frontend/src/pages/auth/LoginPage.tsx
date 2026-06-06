import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { Card, CardContent } from '../../components/Card';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/posts'} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await login({ email, password });
      const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(target || (loggedUser.role === 'ADMIN' ? '/admin/dashboard' : '/posts'), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-7">
        <div className="mb-6">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Entrar no Multipost</h1>
          <p className="mt-1 text-sm text-slate-500">Acesse o painel para criar e publicar posts.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <Alert variant="error" message={error} />}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="email@empresa.com"
            autoComplete="username"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Digite sua senha"
            autoComplete="current-password"
          />
          <Button className="w-full" loading={loading} leftIcon={<Mail className="h-4 w-4" />}>
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
