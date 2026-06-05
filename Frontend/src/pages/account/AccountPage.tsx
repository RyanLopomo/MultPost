import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof PasswordForm, string>>;

function validatePassword(value: string) {
  return value.length >= 8 && /[A-Z]/.test(value) && /\d/.test(value);
}

export function AccountPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: Errors = {};
    if (!form.currentPassword) next.currentPassword = 'Informe a senha atual';
    if (!validatePassword(form.newPassword)) next.newPassword = 'Mínimo 8 caracteres, 1 maiúscula e 1 número';
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'As senhas não conferem';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setSuccess(null);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Senha alterada com sucesso.');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao trocar senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Minha conta</h1>
        <p className="text-sm text-slate-500">Dados do usuário e segurança.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Dados do usuário</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Info label="Nome" value={user?.name || '-'} />
            <Info label="Email" value={user?.email || '-'} />
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Perfil</p>
              <Badge>{user?.role || 'EMPLOYEE'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Trocar senha</h2>
          </CardHeader>
          <CardContent>
            <form className="max-w-xl space-y-4" onSubmit={handleSubmit}>
              {apiError && <Alert variant="error" message={apiError} />}
              {success && <Alert variant="success" message={success} />}
              <Input label="Senha atual" type="password" value={form.currentPassword} error={errors.currentPassword} onChange={(e) => setForm((current) => ({ ...current, currentPassword: e.target.value }))} />
              <Input label="Nova senha" type="password" value={form.newPassword} error={errors.newPassword} onChange={(e) => setForm((current) => ({ ...current, newPassword: e.target.value }))} />
              <Input label="Confirmar nova senha" type="password" value={form.confirmPassword} error={errors.confirmPassword} onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))} />
              <Button loading={loading} leftIcon={<KeyRound className="h-4 w-4" />}>Salvar senha</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
