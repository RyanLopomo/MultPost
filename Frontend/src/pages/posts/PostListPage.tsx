import { useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { SearchInput } from '../../components/SearchInput';
import { Table, Td, Th } from '../../components/Table';
import { useAsync } from '../../hooks/useAsync';
import { formatDate } from '../../utils/format';
import type { Post } from '../../types/post';

function getAuthor(post: Post) {
  return post.author || post.user;
}

export function PostListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useAsync(() => postsApi.list(page, 20), [page]);
  const filteredPosts = (data?.posts || []).filter((post) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;

    return [post.title, post.description, post.price]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Posts</h1>
          <p className="text-sm text-slate-500">Acompanhe publicações e status por canal.</p>
        </div>
        <Link to="/posts/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Novo post</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-950">Lista de posts</h2>
            <p className="text-sm text-slate-500">{data?.total ?? 0} registros encontrados</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="sm:min-w-80">
              <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar posts" />
            </div>
            <Button variant="secondary" onClick={refetch}>Atualizar</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <Loading />}
          {error && <div className="p-5"><Alert variant="error" message={error} /></div>}
          {!loading && !error && data && (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>Título</Th>
                    <Th>Autor</Th>
                    <Th>Status</Th>
                    <Th>Canais</Th>
                    <Th>Data</Th>
                    <Th>Ação</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <Td className="font-semibold text-slate-950">{post.title}</Td>
                      <Td>{getAuthor(post)?.name || getAuthor(post)?.email || '-'}</Td>
                      <Td><Badge>{post.status || 'PENDING'}</Badge></Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          {(post.channels || post.publishResults?.map((item) => item.channel) || []).map((channel) => (
                            <Badge key={channel}>{channel}</Badge>
                          ))}
                        </div>
                      </Td>
                      <Td>{formatDate(post.createdAt)}</Td>
                      <Td>
                        <Link to={`/posts/${post.id}`}>
                          <Button variant="secondary" className="h-9 px-3" leftIcon={<Eye className="h-4 w-4" />}>Ver</Button>
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {data.posts.length === 0 && <EmptyState message="Nenhum post encontrado." />}
              {data.posts.length > 0 && filteredPosts.length === 0 && <EmptyState message="Nenhum post encontrado." />}

              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-sm text-slate-500">Página {data.page} de {data.pages || 1}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button>
                  <Button variant="secondary" disabled={page >= data.pages} onClick={() => setPage((current) => current + 1)}>Próxima</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
