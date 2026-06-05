import { FormEvent, useState } from 'react';
import { Power, UserPlus } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Loading } from '../../components/Loading';
import { Table, Td, Th } from '../../components/Table';
import { useAsync } from '../../hooks/useAsync';
import type { CreateUserPayload } from '../../types/admin';
import type { UserRole } from '../../types/auth';

export function UsersPage() {
  const { data: users, loading, error, refetch } = useAsync(() => adminApi.users(), []);
  const [form, setForm] = useState<CreateUserPayload>({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [createError, setCreateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setCreateError(null);
    setSuccess(null);
    try {
      await adminApi.createUser(form);
      setForm({ name: '', email: '', password: '', role: 'EMPLOYEE' });
      setSuccess('Usuário criado com sucesso.');
      await refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: string) {
    setTogglingId(id);
    setCreateError(null);
    try {
      await adminApi.toggleUser(id);
      await refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Erro ao alterar usuário');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Usuários</h1>
        <p className="text-sm text-slate-500">Gerencie acessos e permissões da equipe.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">Usuários cadastrados</h2>
              <p className="text-sm text-slate-500">{users?.length ?? 0} usuários</p>
            </div>
            <Button variant="secondary" onClick={refetch}>Atualizar</Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <Loading />}
            {error && <div className="p-5"><Alert variant="error" message={error} /></div>}
            {users && (
              <>
                <Table>
                  <thead>
                    <tr>
                      <Th>Nome</Th>
                      <Th>Email</Th>
                      <Th>Perfil</Th>
                      <Th>Posts</Th>
                      <Th>Status</Th>
                      <Th>Ação</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <Td className="font-semibold text-slate-950">{user.name}</Td>
                        <Td>{user.email}</Td>
                        <Td><Badge>{user.role}</Badge></Td>
                        <Td>{user.postsCount ?? 0}</Td>
                        <Td><Badge>{user.active === false ? 'FAILED' : 'SUCCESS'}</Badge></Td>
                        <Td>
                          <Button
                            variant={user.active === false ? 'secondary' : 'danger'}
                            className="h-9 px-3"
                            loading={togglingId === user.id}
                            leftIcon={<Power className="h-4 w-4" />}
                            onClick={() => handleToggle(user.id)}
                          >
                            {user.active === false ? 'Ativar' : 'Desativar'}
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {users.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Nenhum usuário cadastrado.</div>}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Novo usuário</h2>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              {createError && <Alert variant="error" message={createError} />}
              {success && <Alert variant="success" message={success} />}
              <Input label="Nome" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} required />
              <Input label="Senha" type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} required />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Perfil</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as UserRole }))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-slate-100"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </label>
              <Button loading={submitting} leftIcon={<UserPlus className="h-4 w-4" />} className="w-full">Criar usuário</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
