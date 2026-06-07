import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { Table, Td, Th } from '../../components/Table';
import { useAsync } from '../../hooks/useAsync';
import { formatDate } from '../../utils/format';

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: post, loading, error } = useAsync(() => postsApi.detail(id!), [id]);

  const publications = post?.publishResults || post?.publications || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/posts"><Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>Voltar</Button></Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Detalhe do post</h1>
          <p className="text-sm text-slate-500">Dados completos e histórico de publicação.</p>
        </div>
      </div>

      {loading && <Loading />}
      {error && <Alert variant="error" message={error} />}
      {post && (
        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-black text-slate-950">{post.title}</h2>
                <p className="text-sm text-slate-500">Criado em {formatDate(post.createdAt)}</p>
              </div>
              <Badge>{post.status || 'PENDING'}</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Autor" value={post.author?.name || post.user?.name || '-'} />
                <Info label="Preço" value={post.price || '-'} />
              </div>
              <div>
                <p className="mb-1 text-sm font-bold text-slate-700">Cupom e complemento</p>
                <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{post.description || '-'}</p>
              </div>
              {post.link && (
                <a href={post.link} target="_blank" rel="noreferrer">
                  <Button variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>Abrir link</Button>
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-bold text-slate-950">Publicações</h2>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="rounded-b-2xl">
                <thead>
                  <tr>
                    <Th>Canal</Th>
                    <Th>Status</Th>
                    <Th>Mensagem</Th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((item, index) => (
                    <tr key={`${item.channel}-${index}`}>
                      <Td><Badge>{item.channel}</Badge></Td>
                      <Td><Badge>{item.status || (item.success ? 'SUCCESS' : 'FAILED')}</Badge></Td>
                      <Td className="break-all text-xs">{item.messageId || item.error || '-'}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {publications.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Sem histórico de publicação.</div>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
