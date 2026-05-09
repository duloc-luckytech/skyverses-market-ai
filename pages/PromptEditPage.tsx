import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  Globe,
  Eye,
  Upload,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { promptMarketApi } from '../apis/prompt-market';
import { uploadToGCS } from '../services/storage';
import type { PromptVariable, Language, PromptSet } from '../types';

/* ─── Constants ─── */

const CATEGORIES = [
  'coding', 'writing', 'marketing', 'design', 'business', 'education', 'other',
] as const;

const LANGS: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'vi', label: 'Tiếng Việt', flag: 'VI' },
  { code: 'ko', label: '한국어', flag: 'KO' },
  { code: 'ja', label: '日本語', flag: 'JA' },
];

const INPUT_CLASS =
  'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#7036F0]/50 focus:outline-none w-full transition-colors';
const LABEL_CLASS = 'text-sm text-white/60 mb-1.5 block';

/* ─── Types ─── */

interface PromptItemForm {
  _id: string;
  title: string;
  content: string;
  description: string;
  variables: (PromptVariable & { _id: string })[];
}

interface LocalizedFields {
  en: string;
  vi: string;
  ko: string;
  ja: string;
}

interface FormState {
  title: LocalizedFields;
  description: LocalizedFields;
  category: string;
  tags: string;
  coverImage: string;
  isFree: boolean;
  priceSKT: number;
  previewText: string;
  prompts: PromptItemForm[];
}

/* ─── Helpers ─── */

function uid() {
  return Math.random().toString(36).slice(2);
}

function makeVariable(): PromptVariable & { _id: string } {
  return { _id: uid(), name: '', description: '', defaultValue: '' };
}

function makePrompt(): PromptItemForm {
  return { _id: uid(), title: '', content: '', description: '', variables: [] };
}

function emptyLocalized(): LocalizedFields {
  return { en: '', vi: '', ko: '', ja: '' };
}

/* ─── Section wrapper ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
      <h2 className="text-white font-semibold text-base">{title}</h2>
      {children}
    </div>
  );
}

/* ─── Language tab switcher ─── */

function LangTabs({
  active,
  onChange,
  filled,
}: {
  active: Language;
  onChange: (l: Language) => void;
  filled: Record<Language, boolean>;
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
      {LANGS.map(({ code, flag }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            active === code
              ? 'bg-[#7036F0] text-white shadow-lg'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
          }`}
        >
          <span>{flag}</span>
          {filled[code] && active !== code && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Page ─── */

export default function PromptEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, login } = useAuth();

  const [form, setForm] = useState<FormState>({
    title: emptyLocalized(),
    description: emptyLocalized(),
    category: 'other',
    tags: '',
    coverImage: '',
    isFree: false,
    priceSKT: 10,
    previewText: '',
    prompts: [makePrompt()],
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState<Language>('en');
  const [coverPreview, setCoverPreview] = useState('');
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  /* ─── Load existing listing ─── */

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setPageLoading(false);
      return;
    }

    (async () => {
      const res = await promptMarketApi.getMyListings();
      const listing: PromptSet | undefined = res.data?.find((p) => p._id === id);

      if (!listing) {
        setNotFound(true);
        setPageLoading(false);
        return;
      }

      const toLocalized = (
        val: string | { en?: string; vi?: string; ko?: string; ja?: string } | undefined
      ): LocalizedFields => {
        if (!val) return emptyLocalized();
        if (typeof val === 'string') return { ...emptyLocalized(), en: val };
        return {
          en: val.en ?? '',
          vi: val.vi ?? '',
          ko: val.ko ?? '',
          ja: val.ja ?? '',
        };
      };

      setForm({
        title: toLocalized(listing.title),
        description: toLocalized(listing.description),
        category: listing.category ?? 'other',
        tags: (listing.tags ?? []).join(', '),
        priceSKT: listing.priceSKT ?? 0,
        isFree: listing.isFree ?? false,
        previewText: listing.previewText ?? '',
        coverImage: listing.coverImage ?? '',
        prompts: listing.prompts?.length
          ? listing.prompts.map((p) => ({
              _id: uid(),
              title: p.title ?? '',
              content: p.content ?? '',
              description: p.description ?? '',
              variables: (p.variables ?? []).map((v) => ({
                _id: uid(),
                name: v.name ?? '',
                description: v.description ?? '',
                defaultValue: v.defaultValue ?? '',
              })),
            }))
          : [makePrompt()],
      });

      if (listing.coverImage) setCoverPreview(listing.coverImage);
      setPageLoading(false);
    })();
  }, [id]);

  /* ─── Auth guard ─── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black/95 flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-white/60 text-center text-base">
          {t('common.login_required') || 'You need to be logged in.'}
        </p>
        <button
          onClick={login}
          className="px-6 py-3 rounded-xl bg-[#7036F0] text-white font-semibold hover:bg-[#5d2ac8] transition-colors"
        >
          {t('common.login') || 'Log In'}
        </button>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7036F0] animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black/95 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-lg">
          {t('prompt_market.not_found') || 'Listing not found.'}
        </p>
        <Link
          to="/prompt-market/sell"
          className="inline-flex items-center gap-2 text-[#7036F0] hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Listings
        </Link>
      </div>
    );
  }

  /* ─── Field helpers ─── */
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setLocalized(field: 'title' | 'description', lang: Language, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  }

  /* ─── Prompt item helpers ─── */
  function addPrompt() {
    setForm((prev) => ({ ...prev, prompts: [...prev.prompts, makePrompt()] }));
  }

  function handleBulkImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        let items: { title?: string; content?: string; description?: string }[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          items = Array.isArray(parsed) ? parsed : parsed.prompts ?? [];
        } else {
          const lines = text.split('\n').filter((l) => l.trim());
          const hasHeader = lines[0]?.toLowerCase().includes('title');
          const dataLines = hasHeader ? lines.slice(1) : lines;
          items = dataLines.map((line) => {
            const [title = '', content = '', description = ''] = line
              .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
              .map((s) => s.trim().replace(/^"|"$/g, ''));
            return { title, content, description };
          });
        }

        const newPrompts: PromptItemForm[] = items
          .filter((it) => it.content?.trim())
          .map((it) => ({
            _id: uid(),
            title: it.title || '',
            content: it.content || '',
            description: it.description || '',
            variables: [],
          }));

        if (newPrompts.length > 0) {
          setForm((prev) => ({ ...prev, prompts: [...prev.prompts, ...newPrompts] }));
        }
      } catch {
        setError('Failed to parse import file. Use JSON array or CSV format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function removePrompt(promptId: string) {
    setForm((prev) => ({
      ...prev,
      prompts: prev.prompts.filter((p) => p._id !== promptId),
    }));
  }

  function updatePromptField(promptId: string, key: 'title' | 'content' | 'description', value: string) {
    setForm((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p) => (p._id === promptId ? { ...p, [key]: value } : p)),
    }));
  }

  /* ─── Variable helpers ─── */
  function addVariable(promptId: string) {
    setForm((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p) =>
        p._id === promptId
          ? { ...p, variables: [...p.variables, makeVariable()] }
          : p
      ),
    }));
  }

  function removeVariable(promptId: string, varIdx: number) {
    setForm((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p) =>
        p._id === promptId
          ? { ...p, variables: p.variables.filter((_, i) => i !== varIdx) }
          : p
      ),
    }));
  }

  function updateVariable(promptId: string, varIdx: number, key: keyof PromptVariable, value: string) {
    setForm((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p) => {
        if (p._id !== promptId) return p;
        const vars = p.variables.map((v, i) => (i === varIdx ? { ...v, [key]: value } : v));
        return { ...p, variables: vars };
      }),
    }));
  }

  /* ─── Cover image preview ─── */
  const handleCoverChange = useCallback((url: string) => {
    setField('coverImage', url);
    setCoverPreview(url);
  }, []);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const asset = await uploadToGCS(file);
      handleCoverChange(asset.url);
    } catch {
      setError('Failed to upload cover image.');
    } finally {
      setCoverUploading(false);
      e.target.value = '';
    }
  }

  /* ─── Submit ─── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError('');

    if (!form.title.en.trim()) {
      setError(t('promptCreate.errorTitle') || 'English title is required.');
      return;
    }
    if (form.prompts.length === 0) {
      setError(t('promptCreate.errorPrompts') || 'Add at least one prompt item.');
      return;
    }
    for (const p of form.prompts) {
      if (!p.title.trim() || !p.content.trim()) {
        setError(t('promptCreate.errorPromptFields') || 'Each prompt must have a title and content.');
        return;
      }
    }

    const tagsArray = form.tags.split(',').map((s) => s.trim()).filter(Boolean);

    const cleanLocalized = (obj: LocalizedFields) => {
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v.trim()) result[k] = v.trim();
      }
      return Object.keys(result).length > 0 ? result : undefined;
    };

    const payload = {
      title: cleanLocalized(form.title) ?? { en: form.title.en.trim() },
      description: cleanLocalized(form.description),
      category: form.category || undefined,
      tags: tagsArray.length ? tagsArray : undefined,
      coverImage: form.coverImage.trim() || undefined,
      priceSKT: form.isFree ? 0 : form.priceSKT,
      isFree: form.isFree,
      previewText: form.previewText.trim() || undefined,
      prompts: form.prompts.map(({ _id, variables, ...rest }) => ({
        ...rest,
        variables: variables.map(({ _id: _vid, ...vr }) => vr),
      })),
    };

    setSaving(true);
    try {
      const res = await promptMarketApi.update(id, payload);
      if (res.success) {
        navigate('/prompt-market/sell');
      } else {
        setError(res.message || 'Failed to update. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  }

  /* ─── Derived ─── */
  const titleFilled: Record<Language, boolean> = {
    en: !!form.title.en.trim(),
    vi: !!form.title.vi.trim(),
    ko: !!form.title.ko.trim(),
    ja: !!form.title.ja.trim(),
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-black/95 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/prompt-market/sell"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            {t('promptEdit.back') || 'Back to Sell'}
          </Link>
          <span className="text-white/20">|</span>
          <h1 className="text-xl font-bold text-white">
            {t('promptEdit.title') || 'Edit Prompt Set'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info — Multi-lang */}
          <Section title={t('promptCreate.sectionBasic') || 'Basic Info'}>
            {/* Language switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Globe size={14} />
                <span>{t('promptCreate.multiLang') || 'Multi-language'}</span>
              </div>
              <LangTabs active={activeLang} onChange={setActiveLang} filled={titleFilled} />
            </div>

            {/* Title per language */}
            <div>
              <label className={LABEL_CLASS}>
                {t('promptCreate.labelTitle') || 'Title'}{' '}
                ({LANGS.find((l) => l.code === activeLang)?.label})
                {activeLang === 'en' && <span className="text-[#7036F0] ml-1">*</span>}
              </label>
              <input
                type="text"
                className={INPUT_CLASS}
                placeholder={
                  activeLang === 'en'
                    ? 'e.g. Ultimate SEO Prompt Pack'
                    : `Title in ${LANGS.find((l) => l.code === activeLang)?.label}...`
                }
                value={form.title[activeLang]}
                onChange={(e) => setLocalized('title', activeLang, e.target.value)}
                maxLength={120}
              />
            </div>

            {/* Description per language */}
            <div>
              <label className={LABEL_CLASS}>
                {t('promptCreate.labelDescription') || 'Description'}{' '}
                ({LANGS.find((l) => l.code === activeLang)?.label})
              </label>
              <textarea
                rows={3}
                className={INPUT_CLASS}
                placeholder={`Description in ${LANGS.find((l) => l.code === activeLang)?.label}...`}
                value={form.description[activeLang]}
                onChange={(e) => setLocalized('description', activeLang, e.target.value)}
              />
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>
                  {t('promptCreate.labelCategory') || 'Category'}
                </label>
                <select
                  className={INPUT_CLASS + ' cursor-pointer'}
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                >
                  <option value="">{t('promptCreate.categoryPlaceholder') || 'Select category...'}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>
                  {t('promptCreate.labelTags') || 'Tags'}{' '}
                  <span className="text-white/30 text-xs">
                    ({t('promptCreate.tagsHint') || 'comma-separated'})
                  </span>
                </label>
                <input
                  type="text"
                  className={INPUT_CLASS}
                  placeholder="seo, copywriting, blog"
                  value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)}
                />
              </div>
            </div>

            {/* Cover Image URL + Upload */}
            <div>
              <label className={LABEL_CLASS}>
                {t('promptCreate.labelCoverImage') || 'Cover Image'}{' '}
                <span className="text-white/30 text-xs">({t('common.optional') || 'optional'})</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  className={`${INPUT_CLASS} flex-1`}
                  placeholder="https://... or upload below"
                  value={form.coverImage}
                  onChange={(e) => handleCoverChange(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => coverFileRef.current?.click()}
                  disabled={coverUploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7036F0]/20 border border-[#7036F0]/30 text-[#a87aff] hover:bg-[#7036F0]/30 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  {coverUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {coverUploading ? 'Uploading…' : 'Upload'}
                </button>
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>
              {coverPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 rounded-xl overflow-hidden border border-white/10"
                >
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full max-h-48 object-cover"
                    onError={() => setCoverPreview('')}
                  />
                </motion.div>
              )}
            </div>
          </Section>

          {/* Pricing */}
          <Section title={t('promptCreate.sectionPricing') || 'Pricing'}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setField('isFree', true)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.isFree
                    ? 'bg-[#7036F0] text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {t('promptCreate.free') || 'Free'}
              </button>
              <button
                type="button"
                onClick={() => setField('isFree', false)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !form.isFree
                    ? 'bg-[#7036F0] text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {t('promptCreate.paid') || 'Paid'}
              </button>
            </div>

            <AnimatePresence>
              {!form.isFree && (
                <motion.div
                  key="price-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className={LABEL_CLASS}>
                    {t('promptCreate.labelPrice') || 'Price (SKT)'}
                  </label>
                  <input
                    type="number"
                    className={INPUT_CLASS}
                    min={1}
                    value={form.priceSKT}
                    onChange={(e) => setField('priceSKT', Math.max(1, Number(e.target.value)))}
                  />
                  <p className="text-xs text-white/25 mt-1.5">
                    Platform fee: 10% — You receive {Math.round(form.priceSKT * 0.9)} SKT per sale
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* Preview Text */}
          <Section title={t('promptCreate.sectionPreview') || 'Preview Text'}>
            <div>
              <label className={LABEL_CLASS}>
                <div className="flex items-center gap-2">
                  <Eye size={14} />
                  {t('promptCreate.labelPreviewText') || 'Preview Text'}
                </div>
              </label>
              <p className="text-xs text-white/30 mb-2">
                {t('promptCreate.previewHint') ||
                  'This text is visible to potential buyers before they purchase.'}
              </p>
              <textarea
                rows={4}
                className={INPUT_CLASS}
                placeholder={
                  t('promptCreate.placeholderPreview') ||
                  "Show buyers a teaser of what they'll get..."
                }
                value={form.previewText}
                onChange={(e) => setField('previewText', e.target.value)}
              />
            </div>
          </Section>

          {/* Prompts — Drag reorder */}
          <Section title={t('promptCreate.sectionPrompts') || 'Prompts'}>
            <p className="text-xs text-white/30">
              Drag to reorder prompts. Each prompt can have variables using {'{{variable_name}}'} syntax.
            </p>

            <Reorder.Group
              axis="y"
              values={form.prompts}
              onReorder={(newOrder) => setField('prompts', newOrder)}
              className="space-y-4"
            >
              <AnimatePresence initial={false}>
                {form.prompts.map((prompt, promptIdx) => (
                  <Reorder.Item
                    key={prompt._id}
                    value={prompt}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-4 cursor-grab active:cursor-grabbing"
                    whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(112,54,240,0.2)' }}
                  >
                    {/* Prompt header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/40">
                        <GripVertical size={15} className="cursor-grab" />
                        <span className="text-xs font-mono">
                          {t('promptCreate.prompt') || 'Prompt'} #{promptIdx + 1}
                        </span>
                      </div>
                      {form.prompts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrompt(prompt._id)}
                          className="text-red-400/70 hover:text-red-400 transition-colors"
                          title="Remove prompt"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {/* Prompt title */}
                    <div>
                      <label className={LABEL_CLASS}>
                        {t('promptCreate.promptTitle') || 'Prompt Title'}{' '}
                        <span className="text-[#7036F0]">*</span>
                      </label>
                      <input
                        type="text"
                        className={INPUT_CLASS}
                        placeholder={t('promptCreate.placeholderPromptTitle') || 'e.g. Blog Post Outline'}
                        value={prompt.title}
                        onChange={(e) => updatePromptField(prompt._id, 'title', e.target.value)}
                      />
                    </div>

                    {/* Prompt description */}
                    <div>
                      <label className={LABEL_CLASS}>
                        {t('promptCreate.promptDescription') || 'Short Description'}
                      </label>
                      <input
                        type="text"
                        className={INPUT_CLASS}
                        placeholder={t('promptCreate.placeholderPromptDesc') || 'What does this prompt do?'}
                        value={prompt.description}
                        onChange={(e) => updatePromptField(prompt._id, 'description', e.target.value)}
                      />
                    </div>

                    {/* Prompt content */}
                    <div>
                      <label className={LABEL_CLASS}>
                        {t('promptCreate.promptContent') || 'Prompt Content'}{' '}
                        <span className="text-[#7036F0]">*</span>
                      </label>
                      <textarea
                        rows={5}
                        className={INPUT_CLASS + ' font-mono text-sm'}
                        placeholder={
                          t('promptCreate.placeholderPromptContent') ||
                          'Write your prompt here. Use {{variable_name}} for variables.'
                        }
                        value={prompt.content}
                        onChange={(e) => updatePromptField(prompt._id, 'content', e.target.value)}
                      />
                    </div>

                    {/* Variables */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40 font-medium uppercase tracking-wide">
                          {t('promptCreate.variables') || 'Variables'}
                        </span>
                        <button
                          type="button"
                          onClick={() => addVariable(prompt._id)}
                          className="flex items-center gap-1 text-xs text-[#7036F0] hover:text-[#8a52f5] transition-colors"
                        >
                          <Plus size={13} />
                          {t('promptCreate.addVariable') || 'Add Variable'}
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {prompt.variables.map((v, varIdx) => (
                          <motion.div
                            key={v._id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-white/30 font-mono">
                                  {'{{'}{v.name || `var_${varIdx + 1}`}{'}}'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeVariable(prompt._id, varIdx)}
                                  className="text-red-400/60 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className={LABEL_CLASS}>
                                    {t('promptCreate.varName') || 'Name'}
                                  </label>
                                  <input
                                    type="text"
                                    className={INPUT_CLASS + ' text-sm'}
                                    placeholder="variable_name"
                                    value={v.name}
                                    onChange={(e) => updateVariable(prompt._id, varIdx, 'name', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className={LABEL_CLASS}>
                                    {t('promptCreate.varDescription') || 'Description'}
                                  </label>
                                  <input
                                    type="text"
                                    className={INPUT_CLASS + ' text-sm'}
                                    placeholder="e.g. Topic to write about"
                                    value={v.description}
                                    onChange={(e) => updateVariable(prompt._id, varIdx, 'description', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className={LABEL_CLASS}>
                                    {t('promptCreate.varDefault') || 'Default Value'}
                                  </label>
                                  <input
                                    type="text"
                                    className={INPUT_CLASS + ' text-sm'}
                                    placeholder="e.g. AI"
                                    value={v.defaultValue}
                                    onChange={(e) => updateVariable(prompt._id, varIdx, 'defaultValue', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {prompt.variables.length === 0 && (
                        <p className="text-xs text-white/20 italic">
                          {t('promptCreate.noVariables') || 'No variables yet. Click "Add Variable" to add one.'}
                        </p>
                      )}
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>

            {/* Add Prompt + Bulk Import */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={addPrompt}
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-[#7036F0]/40 transition-colors justify-center text-sm"
              >
                <Plus size={16} />
                {t('promptCreate.addPrompt') || 'Add Prompt'}
              </button>
              <button
                type="button"
                onClick={() => bulkInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-emerald-500/40 transition-colors text-sm"
              >
                <Upload size={16} />
                Import
              </button>
              <input
                ref={bulkInputRef}
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={handleBulkImport}
              />
            </div>
          </Section>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-2 pb-8">
            <Link
              to="/prompt-market/sell"
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition"
            >
              {t('common.cancel') || 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#7036F0] text-white font-semibold hover:bg-[#5d2ac8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(112,54,240,0.3)]"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving
                ? t('common.saving') || 'Saving...'
                : t('promptEdit.saveChanges') || 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
