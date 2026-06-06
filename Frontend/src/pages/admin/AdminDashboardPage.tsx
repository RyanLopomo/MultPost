import type { ReactNode } from 'react';
import { FileText, Users, CalendarDays } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { Table, Td, Th } from '../../components/Table';
import { useAsync } from '../../hooks/useAsync';
import { formatDate } from '../../utils/format';

export function AdminDashboardPage() {
  const { data, loading, error } = useAsync(() => adminApi.dashboard(), []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Dashboard Admin</h1>
        <p className="text-sm text-slate-500">Visão geral de operação e produtividade.</p>
      </div>

      {loading && <Loading />}
      {error && <Alert variant="error" message={error} />}
      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric title="Total de posts" value={data.totalPosts} icon={<FileText className="h-5 w-5" />} />
            <Metric title="Posts no mês" value={data.monthPosts} icon={<CalendarDays className="h-5 w-5" />} />
            <Metric title="Usuários" value={data.totalUsers} icon={<Users className="h-5 w-5" />} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="font-bold text-slate-950">Ranking de funcionários</h2>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <thead>
                    <tr>
                      <Th>Funcionário</Th>
                      <Th>Email</Th>
                      <Th>Posts no mes</Th>
                      <Th>Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ranking.map((item, index) => (
                      <tr key={item.userId || item.id || `${item.name}-${index}`}>
                        <Td className="font-semibold text-slate-950">{item.name}</Td>
                        <Td>{item.email || '-'}</Td>
                        <Td>{item.monthPosts ?? 0}</Td>
                        <Td>{item.totalPosts ?? item.postsCount ?? 0}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {data.ranking.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Sem dados de ranking.</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-bold text-slate-950">Posts recentes</h2>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <thead>
                    <tr>
                      <Th>Título</Th>
                      <Th>Status</Th>
                      <Th>Data</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentPosts.map((post) => (
                      <tr key={post.id}>
                        <Td className="font-semibold text-slate-950">{post.title}</Td>
                        <Td><Badge>{post.status || 'PENDING'}</Badge></Td>
                        <Td>{formatDate(post.createdAt)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {data.recentPosts.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Sem posts recentes.</div>}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-black text-slate-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
