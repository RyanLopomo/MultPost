import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ExternalLink, ImagePlus, Lightbulb, Plus, Send, Trash2, X } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import type { Channel, CreatePostPayload, CreatePostResponse } from '../../types/post';

const channelOptions: Channel[] = ['TELEGRAM', 'WHATSAPP'];
const suggestionStyles = [
  {
    description: () => 'APLICAR NA FINALIZACAO',
  },
  {
    description: () => 'CUPOM DISPONIVEL + Moedas',
  },
  {
    description: () => 'OFERTA RELAMPAGO',
  },
  {
    description: () => 'SEM CUPOM',
  },
];
const presetStorageKey = 'multipost:post-presets';
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
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [whatsappHint, setWhatsappHint] = useState<string | null>(null);
  const [presets, setPresets] = useState<string[]>(defaultPresets);
  const [presetDraft, setPresetDraft] = useState(defaultPresets[0]);

  const selectedChannels = useMemo(() => new Set(form.channels), [form.channels]);
  const imagePreviewUrl = useMemo(() => (form.image ? URL.createObjectURL(form.image) : null), [form.image]);

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

  function generateSuggestion() {
    const style = suggestionStyles[suggestionIndex % suggestionStyles.length];

    setForm((current) => ({
      ...current,
      description: style.description(),
    }));
    setSuggestionIndex((current) => current + 1);
    setErrors((current) => ({ ...current, description: undefined }));
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Sugestoes de cupom</p>
                    <p className="text-xs text-slate-500">Gere uma sugestao de cupom/complemento para o produto.</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<Lightbulb className="h-4 w-4" />}
                    onClick={generateSuggestion}
                  >
                    Sugerir
                  </Button>
                </div>
              </div>
              <Textarea
                label="Cupom e complemento"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                maxLength={1000}
                error={errors.description}
                placeholder="AEBR1 + Moedas"
              />
              <Input label="Preco" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="R$ 299,90" />
              <Input label="Link" value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://loja.com/produto" error={errors.link} />

              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Textarea
                      label="Preset abaixo do link"
                      value={presetDraft}
                      onChange={(event) => setPresetDraft(event.target.value)}
                      maxLength={500}
                      placeholder="🇧🇷 PRODUTO JÁ NO BRASIL&#10;(ENVIO RÁPIDO E SEM TAXA)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={savePreset}
                    className="shrink-0"
                  >
                    Salvar preset
                  </Button>
                </div>

                {presets.length > 0 && (
                  <div className="grid gap-2 md:grid-cols-2">
                    {presets.map((preset) => {
                      const active = form.presetText === preset;
                      return (
                        <div key={preset} className={`flex items-start gap-2 rounded-lg border bg-white p-2 ${active ? 'border-slate-950' : 'border-slate-200'}`}>
                          <button
                            type="button"
                            className="min-h-12 flex-1 whitespace-pre-wrap text-left text-xs font-semibold text-slate-700"
                            onClick={() => update('presetText', active ? '' : preset)}
                          >
                            {preset}
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
                      );
                    })}
                  </div>
                )}
                {errors.presetText && <p className="text-xs font-medium text-rose-600">{errors.presetText}</p>}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Imagem do post</span>
                <label className="flex min-h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-white">
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateImage(event.target.files?.[0] ?? null)}
                  />
                  {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Preview da imagem do post" className="h-56 w-full object-contain bg-white" />
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-5">
                      <ImagePlus className="h-4 w-4" />
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
              </div>

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
                {whatsappHint && <Alert variant="info" message={whatsappHint} />}
                {result.whatsappLink && (
                  <Button type="button" className="w-full" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={handleOpenWhatsApp}>
                    Abrir WhatsApp
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
