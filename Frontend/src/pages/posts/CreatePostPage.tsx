import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, ExternalLink, ImagePlus, Link2, MessageCircle, Package, Pencil, Plus, Send, Trash2, X } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import type { Channel, CreatePostPayload, CreatePostResponse } from '../../types/post';

const channelOptions: Channel[] = ['TELEGRAM', 'WHATSAPP'];
const presetStorageKey = 'multipost:post-presets';
const normalizedDefaultPresets = [
  '\uD83C\uDDE7\uD83C\uDDF7 PRODUTO JA NO BRASIL\n(ENVIO RAPIDO E SEM TAXA)',
  '\uD83D\uDE9BPRODUTO JA NO BRASIL\n(ENVIO RAPIDO E SEM TAXA)',
];
const defaultPresets = [
  '🇧🇷 PRODUTO JÁ NO BRASIL\n(ENVIO RÁPIDO E SEM TAXA)',
  '🚛PRODUTO JÁ NO BRASIL\n(ENVIO RAPIDO E SEM TAXA)',
];

type Errors = Partial<Record<keyof CreatePostPayload, string>>;

async function imageFileToPngBlob(file: File): Promise<Blob> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = sourceUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas indisponivel');

    context.drawImage(image, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Nao foi possivel converter a imagem'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function copyImageToClipboard(file: File): Promise<void> {
  if (!navigator.clipboard?.write || !('ClipboardItem' in window)) {
    throw new Error('Clipboard de imagem indisponivel neste navegador');
  }

  const pngBlob = await imageFileToPngBlob(file);
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': pngBlob,
    }),
  ]);
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getPresetTitle(preset: string) {
  return preset.split('\n').find(Boolean) || 'Preset';
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Package; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">{title}</h3>
    </div>
  );
}

export function CreatePostPage() {
  const [form, setForm] = useState<CreatePostPayload>({
    title: '',
    description: '',
    price: '',
    link: '',
    presetText: '',
    image: null,
    telegramInviteLink: '',
    whatsappInviteLink: '',
    channels: ['TELEGRAM'],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatePostResponse | null>(null);
  const [whatsappHint, setWhatsappHint] = useState<string | null>(null);
  const [presets, setPresets] = useState<string[]>(normalizedDefaultPresets);
  const [presetDraft, setPresetDraft] = useState(normalizedDefaultPresets[0]);

  const selectedChannels = useMemo(() => new Set(form.channels), [form.channels]);
  const imagePreviewUrl = useMemo(() => (form.image ? URL.createObjectURL(form.image) : null), [form.image]);
  const previewText = useMemo(() => {
    const groupLink = selectedChannels.has('WHATSAPP')
      ? form.telegramInviteLink || 'https://t.me/grupo'
      : form.whatsappInviteLink || 'https://chat.whatsapp.com/grupo';
    const lines = [
      form.title ? `💥${form.title}` : '💥Produto',
      '',
      form.price ? `💵VALOR : ${form.price}` : '💵VALOR : -',
      form.description ? `🎟️CUPOM : ${form.description}` : '🎟️CUPOM : -',
      form.link || 'https://link-do-produto',
    ];

    if (form.presetText) lines.push(form.presetText);
    lines.push('', '⚡️GRUPO de OFERTAS', groupLink);

    return lines.join('\n');
  }, [form.description, form.link, form.presetText, form.price, form.telegramInviteLink, form.title, form.whatsappInviteLink, selectedChannels]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const pastedImage = Array.from(event.clipboardData?.files || []).find((file) => file.type.startsWith('image/'));
      if (pastedImage) {
        event.preventDefault();
        updateImage(pastedImage);
      }
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(presetStorageKey);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.every((item) => typeof item === 'string')) {
        setPresets(saved);
        setPresetDraft(saved[0] || '');
      }
    } catch {
      localStorage.removeItem(presetStorageKey);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(presetStorageKey, JSON.stringify(presets));
  }, [presets]);

  function update<K extends keyof CreatePostPayload>(field: K, value: CreatePostPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleChannel(channel: Channel) {
    const next = selectedChannels.has(channel)
      ? form.channels.filter((item) => item !== channel)
      : [...form.channels, channel];
    update('channels', next);
  }

  function updateImage(file: File | null) {
    setErrors((current) => ({ ...current, image: undefined }));
    update('image', file);
  }

  function savePreset() {
    const nextPreset = presetDraft.trim();
    if (!nextPreset) return;

    setPresets((current) => {
      const withoutDuplicate = current.filter((item) => item !== nextPreset);
      return [nextPreset, ...withoutDuplicate].slice(0, 12);
    });
    update('presetText', nextPreset);
  }

  function removePreset(preset: string) {
    setPresets((current) => current.filter((item) => item !== preset));
    if (form.presetText === preset) update('presetText', '');
  }

  function validate() {
    const next: Errors = {};
    if (!form.title.trim()) next.title = 'Titulo obrigatorio';
    if (form.title.length > 200) next.title = 'Maximo de 200 caracteres';
    if ((form.description || '').length > 1000) next.description = 'Maximo de 1000 caracteres';
    if ((form.presetText || '').length > 500) next.presetText = 'Maximo de 500 caracteres';
    if (form.link?.trim() && !isValidUrl(form.link)) next.link = 'Informe uma URL valida';
    if (form.image && !form.image.type.startsWith('image/')) next.image = 'Selecione um arquivo de imagem';
    if (form.image && form.image.size > 5 * 1024 * 1024) next.image = 'Imagem deve ter no maximo 5 MB';
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
        link: form.link?.trim() || undefined,
        presetText: form.presetText?.trim() || undefined,
        image: form.image || undefined,
        telegramInviteLink: form.telegramInviteLink?.trim() || undefined,
        whatsappInviteLink: form.whatsappInviteLink?.trim() || undefined,
        channels: form.channels,
      };
      const response = await postsApi.create(payload);
      setResult(response);
      setWhatsappHint(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao criar post');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenWhatsApp() {
    if (!result?.whatsappLink) return;

    let copiedImage = false;

    if (form.image) {
      try {
        await copyImageToClipboard(form.image);
        copiedImage = true;
      } catch {
        copiedImage = false;
      }
    }

    window.open(result.whatsappLink, '_blank', 'noopener,noreferrer');
    setWhatsappHint(
      copiedImage
        ? 'Imagem copiada. No WhatsApp, pressione Ctrl + V para anexar antes de enviar.'
        : 'WhatsApp aberto com o texto. Se quiser imagem, cole ou anexe manualmente no WhatsApp.'
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Editor de oferta</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Criar post</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
            <MessageCircle className="h-4 w-4" />
            {form.channels.length} canal{form.channels.length === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
            <ClipboardList className="h-4 w-4" />
            {form.presetText ? 'Preset ativo' : 'Sem preset'}
          </span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="font-bold text-slate-950">Dados do post</h2>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {apiError && <Alert variant="error" message={apiError} />}
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <SectionHeader icon={Package} title="Oferta" />
                <div className="space-y-4">
                  <Input label="Titulo" value={form.title} onChange={(e) => update('title', e.target.value)} maxLength={200} error={errors.title} required />
                  <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <Input label="Preco" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="R$ 299,90" />
                    <Input label="Link" value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://loja.com/produto" error={errors.link} />
                  </div>
                  <Textarea
                    label="Cupom e complemento"
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    maxLength={1000}
                    error={errors.description}
                    placeholder="AEBR1 + Moedas"
                    className="min-h-20"
                  />
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <SectionHeader icon={ImagePlus} title="Midia" />
                <label className="flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-white">
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateImage(event.target.files?.[0] ?? null)}
                  />
                  {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Preview da imagem do post" className="h-64 w-full object-contain bg-white" />
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-8">
                      <ImagePlus className="h-5 w-5" />
                      Selecionar imagem
                    </span>
                  )}
                </label>
                {form.image && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <span className="truncate text-slate-700">{form.image.name}</span>
                    <button
                      type="button"
                      className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => updateImage(null)}
                      aria-label="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {errors.image && <p className="text-xs font-medium text-rose-600">{errors.image}</p>}
              </section>

              <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <SectionHeader icon={Link2} title="Canais e convites" />
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
                <div className="grid gap-3 sm:grid-cols-2">
                  {channelOptions.map((channel) => (
                    <button
                      type="button"
                      key={channel}
                      onClick={() => toggleChannel(channel)}
                      className={`rounded-xl border p-4 text-left transition ${selectedChannels.has(channel) ? 'border-slate-950 bg-slate-950 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      <p className="flex items-center gap-2 font-bold">
                        {selectedChannels.has(channel) && <CheckCircle2 className="h-4 w-4" />}
                        {channel}
                      </p>
                    </button>
                  ))}
                </div>
                {errors.channels && <p className="text-xs font-medium text-rose-600">{errors.channels}</p>}
              </section>

              <Button loading={loading} leftIcon={<Send className="h-4 w-4" />}>Publicar post</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit overflow-hidden xl:sticky xl:top-8">
          <CardHeader>
            <h2 className="font-bold text-slate-950">Preview e resultado</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-white">
              <pre className="max-h-80 whitespace-pre-wrap break-words text-sm leading-relaxed">{previewText}</pre>
            </div>
            {!result && <p className="text-sm text-slate-500">A publicacao aparecera aqui apos o envio.</p>}
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
                {whatsappHint && <Alert variant="info" message={whatsappHint} />}
                {result.whatsappLink && (
                  <Button type="button" className="w-full" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={handleOpenWhatsApp}>
                    Abrir WhatsApp
                  </Button>
                )}
              </>
            )}

            <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <SectionHeader icon={ClipboardList} title="Presets" />
              <Textarea
                label="Criar ou editar preset"
                value={presetDraft}
                onChange={(event) => setPresetDraft(event.target.value)}
                maxLength={500}
                placeholder={'\uD83C\uDDE7\uD83C\uDDF7 PRODUTO JA NO BRASIL\n(ENVIO RAPIDO E SEM TAXA)'}
              />
              <Button
                type="button"
                variant="secondary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={savePreset}
                className="w-full"
              >
                Salvar preset
              </Button>

              {presets.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${!form.presetText ? 'border-slate-950 bg-slate-950 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
                    onClick={() => update('presetText', '')}
                  >
                    Sem preset
                  </button>

                  <div className="grid gap-2">
                    {presets.map((preset) => {
                      const active = form.presetText === preset;
                      return (
                        <div key={preset} className={`rounded-lg border bg-white p-3 shadow-sm transition ${active ? 'border-slate-950 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-300'}`}>
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => update('presetText', preset)}
                          >
                            <span className={`mb-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${active ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {active && <CheckCircle2 className="h-3 w-3" />}
                              {active ? 'Selecionado' : 'Usar'}
                            </span>
                            <span className="block text-xs font-bold text-slate-400">{getPresetTitle(preset)}</span>
                            <span className="mt-1 block whitespace-pre-wrap text-xs font-semibold text-slate-700">{preset}</span>
                          </button>

                          <div className="mt-2 flex justify-end gap-1">
                            <button
                              type="button"
                              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                              onClick={() => setPresetDraft(preset)}
                              aria-label="Editar preset"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
                              onClick={() => removePreset(preset)}
                              aria-label="Remover preset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {errors.presetText && <p className="text-xs font-medium text-rose-600">{errors.presetText}</p>}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
