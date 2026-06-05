import { FormEvent, useMemo, useState } from 'react';
import { ExternalLink, Send } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import type { Channel, CreatePostPayload, CreatePostResponse } from '../../types/post';

const channelOptions: Channel[] = ['TELEGRAM', 'WHATSAPP'];

type Errors = Partial<Record<keyof CreatePostPayload, string>>;

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function CreatePostPage() {
  const [form, setForm] = useState<CreatePostPayload>({
    title: '',
    description: '',
    price: '',
    oldPrice: '',
    link: '',
    tags: '',
    telegramInviteLink: '',
    whatsappInviteLink: '',
    channels: ['TELEGRAM'],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatePostResponse | null>(null);

  const selectedChannels = useMemo(() => new Set(form.channels), [form.channels]);

  function update<K extends keyof CreatePostPayload>(field: K, value: CreatePostPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleChannel(channel: Channel) {
    const next = selectedChannels.has(channel)
      ? form.channels.filter((item) => item !== channel)
      : [...form.channels, channel];
    update('channels', next);
  }

  function validate() {
    const next: Errors = {};
    if (!form.title.trim()) next.title = 'Titulo obrigatorio';
    if (form.title.length > 200) next.title = 'Maximo de 200 caracteres';
    if ((form.description || '').length > 1000) next.description = 'Maximo de 1000 caracteres';
    if (form.link?.trim() && !isValidUrl(form.link)) next.link = 'Informe uma URL valida';
    if (form.telegramInviteLink?.trim() && !isValidUrl(form.telegramInviteLink)) {
      next.telegramInviteLink = 'Informe uma URL valida';
    }
    if (form.whatsappInviteLink?.trim() && !isValidUrl(form.whatsappInviteLink)) {
      next.whatsappInviteLink = 'Informe uma URL valida';
    }
    if (selectedChannels.has('WHATSAPP') && !form.telegramInviteLink?.trim()) {
      next.telegramInviteLink = 'Obrigatorio para posts no WhatsApp';
    }
    if (selectedChannels.has('TELEGRAM') && !form.whatsappInviteLink?.trim()) {
      next.whatsappInviteLink = 'Obrigatorio para posts no Telegram';
    }
    if (!form.channels.length) next.channels = 'Selecione pelo menos um canal';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const payload: CreatePostPayload = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        price: form.price?.trim() || undefined,
        oldPrice: form.oldPrice?.trim() || undefined,
        link: form.link?.trim() || undefined,
        tags: form.tags?.trim() || undefined,
        telegramInviteLink: form.telegramInviteLink?.trim() || undefined,
        whatsappInviteLink: form.whatsappInviteLink?.trim() || undefined,
        channels: form.channels,
      };
      const response = await postsApi.create(payload);
      setResult(response);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao criar post');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Criar post</h1>
        <p className="text-sm text-slate-500">Preencha a oferta e escolha os canais de publicacao.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Dados do post</h2>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {apiError && <Alert variant="error" message={apiError} />}
              <Input label="Titulo" value={form.title} onChange={(e) => update('title', e.target.value)} maxLength={200} error={errors.title} required />
              <Textarea label="Descricao" value={form.description} onChange={(e) => update('description', e.target.value)} maxLength={1000} error={errors.description} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Preco" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="R$ 299,90" />
                <Input label="Preco antigo" value={form.oldPrice} onChange={(e) => update('oldPrice', e.target.value)} placeholder="R$ 399,90" />
              </div>
              <Input label="Link" value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://loja.com/produto" error={errors.link} />
              <Input label="Tags" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="promocao, tenis, nike" />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Convite Telegram"
                  value={form.telegramInviteLink}
                  onChange={(e) => update('telegramInviteLink', e.target.value)}
                  placeholder="https://t.me/+codigo"
                  error={errors.telegramInviteLink}
                />
                <Input
                  label="Convite WhatsApp"
                  value={form.whatsappInviteLink}
                  onChange={(e) => update('whatsappInviteLink', e.target.value)}
                  placeholder="https://chat.whatsapp.com/codigo"
                  error={errors.whatsappInviteLink}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Canais</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {channelOptions.map((channel) => (
                    <button
                      type="button"
                      key={channel}
                      onClick={() => toggleChannel(channel)}
                      className={`rounded-xl border p-4 text-left transition ${selectedChannels.has(channel) ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      <p className="font-bold">{channel}</p>
                      <p className="text-xs opacity-70">Publicar neste canal</p>
                    </button>
                  ))}
                </div>
                {errors.channels && <p className="text-xs font-medium text-rose-600">{errors.channels}</p>}
              </div>

              <Button loading={loading} leftIcon={<Send className="h-4 w-4" />}>Publicar post</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Resultado</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result && <p className="text-sm text-slate-500">O resultado da publicacao aparecera aqui.</p>}
            {result && (
              <>
                <Alert variant="success" message="Post criado com sucesso." />
                <div className="space-y-3">
                  {result.publishResults.map((item) => (
                    <div key={`${item.channel}-${item.messageId || item.error || 'result'}`} className="rounded-xl border border-slate-200 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge>{item.channel}</Badge>
                        <Badge>{item.success ? 'SUCCESS' : 'FAILED'}</Badge>
                      </div>
                      <p className="break-all text-xs text-slate-500">{item.messageId || item.error || 'Sem detalhes'}</p>
                    </div>
                  ))}
                </div>
                {result.whatsappLink && (
                  <a href={result.whatsappLink} target="_blank" rel="noreferrer">
                    <Button className="w-full" leftIcon={<ExternalLink className="h-4 w-4" />}>Abrir WhatsApp</Button>
                  </a>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
