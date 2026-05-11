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
  Cpu,
  FileOutput,
  Image as ImageIcon,
  Video,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { promptMarketApi } from '../apis/prompt-market';
import { uploadToGCS } from '../services/storage';
import type { PromptVariable, Language, PromptSet, AIModel, PromptExample } from '../types';
import { PROMPT_TEMPLATES, type PromptTemplate } from '../constants/prompt-templates';

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

const AI_MODELS: { value: AIModel; label: string }[] = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-5', label: 'GPT-5' },
  { value: 'claude-3', label: 'Claude 3' },
  { value: 'claude-4', label: 'Claude 4' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'gemini-2', label: 'Gemini 2' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'dall-e-3', label: 'DALL-E 3' },
  { value: 'stable-diffusion', label: 'Stable Diffusion' },
  { value: 'flux', label: 'Flux' },
  { value: 'llama', label: 'Llama' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'other', label: 'Other' },
];

const INPUT_CLASS =
  'bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#C9A84C]/50 focus:outline-none w-full transition-colors';
const LABEL_CLASS = 'text-sm text-white/60 mb-1.5 block';

/* ─── Types ─── */

interface ExampleItemForm {
  _id: string;
  input: string;
  output: string;
  image: string;
  video: string;
}

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
  models: AIModel[];
  examples: ExampleItemForm[];
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

function makeExample(): ExampleItemForm {
  return { _id: uid(), input: '', output: '', image: '', video: '' };
}

function emptyLocalized(): LocalizedFields {
  return { en: '', vi: '', ko: '', ja: '' };
}

/* ─── Section wrapper ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 space-y-5">
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
              ? 'bg-[#C9A84C] text-white shadow-lg'
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
    models: [],
    examples: [],
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
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);

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
        models: (listing.models as AIModel[]) ?? [],
        examples: (listing.examples ?? []).map((ex) => ({
          _id: uid(),
          input: ex.input ?? '',
          output: ex.output ?? '',
          image: ex.image ?? '',
          video: ex.video ?? '',
        })),
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
          className="px-6 py-3 rounded-xl bg-[#C9A84C] text-white font-semibold hover:bg-[#B8963F] transition-colors"
        >
          {t('common.login') || 'Log In'}
        </button>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
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
          className="inline-flex items-center gap-2 text-[#C9A84C] hover:underline text-sm"
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

  /* ─── Model helpers ─── */
  function toggleModel(model: AIModel) {
    setForm((prev) => ({
      ...prev,
      models: prev.models.includes(model)
        ? prev.models.filter((m) => m !== model)
        : [...prev.models, model],
    }));
  }

  /* ─── Example helpers ─── */
  function addExample() {
    setForm((prev) => ({ ...prev, examples: [...prev.examples, makeExample()] }));
  }

  function removeExample(exId: string) {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.filter((ex) => ex._id !== exId),
    }));
  }

  function updateExample(exId: string, key: keyof Omit<ExampleItemForm, '_id'>, value: string) {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.map((ex) => (ex._id === exId ? { ...ex, [key]: value } : ex)),
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

  /* ─── Template helpers ─── */
  function applyTemplate(tpl: PromptTemplate) {
    const newPrompts: PromptItemForm[] = tpl.prompts.map((p) => ({
      _id: uid(),
      title: p.title,
      content: p.content,
      description: p.description,
      variables: p.variables.map((v) => ({ _id: uid(), ...v })),
    }));

    setForm((prev) => ({
      ...prev,
      category: tpl.category,
      tags: tpl.tags.join(', '),
      prompts: newPrompts,
    }));
    setAppliedTemplate(tpl.key);
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

    const cleanedExamples = form.examples
      .filter((ex) => ex.input.trim() || ex.output.trim())
      .map(({ _id, ...rest }) => ({
        input: rest.input.trim(),
        output: rest.output.trim(),
        ...(rest.image.trim() ? { image: rest.image.trim() } : {}),
        ...(rest.video.trim() ? { video: rest.video.trim() } : {}),
      }));

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
      models: form.models.length ? form.models : undefined,
      examples: cleanedExamples.length ? cleanedExamples : undefined,
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
          {/* ─── Replace from Template ─── */}
          <Section title="Replace from Template">
            <p className="text-xs text-white/30">
              Pick a template to replace current prompts with structured variables. This will overwrite existing prompts, category, and tags.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PROMPT_TEMPLATES.map((tpl) => {
                const isApplied = appliedTemplate === tpl.key;
                return (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className={`relative text-left p-4 rounded-xl border transition-all group ${
                      isApplied
                        ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40'
                        : 'bg-white/[0.03] border-white/10 hover:border-[#C9A84C]/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    {isApplied && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 size={16} className="text-[#C9A84C]" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{tpl.icon}</span>
                      <span className="text-sm font-semibold text-white">{tpl.label}</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-3">
                      {tpl.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-white/30">
                      <span className="flex items-center gap-1">
                        <Wand2 size={10} />
                        {tpl.prompts.length} prompts
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40">
                        {tpl.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {appliedTemplate && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#C9A84C]/80 flex items-center gap-1.5"
              >
                <CheckCircle2 size={12} />
                Template applied — category, tags, and prompts have been replaced. Edit freely below.
              </motion.p>
            )}
          </Section>

          {/* ─── Template Preview Modal ─── */}
          <AnimatePresence>
            {previewTemplate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={() => setPreviewTemplate(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[var(--atlas-bg-panel)] border border-white/10 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                >
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{previewTemplate.icon}</span>
                      <h3 className="text-lg font-bold text-white">{previewTemplate.label}</h3>
                    </div>
                    <p className="text-sm text-white/50">{previewTemplate.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-xs text-white/50">{previewTemplate.category}</span>
                      {previewTemplate.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-[#C9A84C]/10 text-xs text-[#C9A84C]/70">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h4 className="text-sm font-semibold text-white/70">Included Prompts ({previewTemplate.prompts.length})</h4>
                    {previewTemplate.prompts.map((p, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                        <div className="text-sm font-medium text-white mb-1">{p.title}</div>
                        <p className="text-xs text-white/40 mb-2">{p.description}</p>
                        <pre className="text-xs text-white/60 bg-black/30 rounded-lg p-3 whitespace-pre-wrap overflow-x-auto max-h-32">
                          {p.content}
                        </pre>
                        {p.variables.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {p.variables.map((v) => (
                              <span key={v.name} className="px-2 py-0.5 rounded bg-[#C9A84C]/10 text-[10px] text-[#C9A84C]/70">
                                {`{{${v.name}}}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(null)}
                      className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applyTemplate(previewTemplate);
                        setPreviewTemplate(null);
                      }}
                      className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#C9A84C] hover:bg-[#C9A84C]/80 transition-colors flex items-center gap-2"
                    >
                      <Wand2 size={14} />
                      Apply Template
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                {activeLang === 'en' && <span className="text-[#C9A84C] ml-1">*</span>}
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#E5C767] hover:bg-[#C9A84C]/30 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap"
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
                    ? 'bg-[#C9A84C] text-white'
                    : 'bg-white/[0.06] border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {t('promptCreate.free') || 'Free'}
              </button>
              <button
                type="button"
                onClick={() => setField('isFree', false)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !form.isFree
                    ? 'bg-[#C9A84C] text-white'
                    : 'bg-white/[0.06] border border-white/10 text-white/50 hover:text-white'
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

          {/* AI Models */}
          <Section title={t('promptCreate.sectionModels') || 'Compatible AI Models'}>
            <p className="text-xs text-white/30">
              {t('promptCreate.modelsHint') || 'Select the AI models these prompts are designed for.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {AI_MODELS.map((m) => {
                const selected = form.models.includes(m.value);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggleModel(m.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      selected
                        ? 'bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#E5C767]'
                        : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Cpu size={12} />
                    {m.label}
                  </button>
                );
              })}
            </div>
            {form.models.length > 0 && (
              <p className="text-xs text-white/30">
                {form.models.length} model{form.models.length > 1 ? 's' : ''} selected
              </p>
            )}
          </Section>

          {/* Examples */}
          <Section title={t('promptCreate.sectionExamples') || 'Examples'}>
            <p className="text-xs text-white/30">
              {t('promptCreate.examplesHint') || 'Add input/output examples to show buyers how your prompts work.'}
            </p>

            <AnimatePresence initial={false}>
              {form.examples.map((ex, idx) => (
                <motion.div
                  key={ex._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/40">
                        <FileOutput size={14} />
                        <span className="text-xs font-mono">Example #{idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExample(ex._id)}
                        className="text-red-400/70 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>Input</label>
                        <textarea
                          rows={3}
                          className={INPUT_CLASS + ' text-sm'}
                          placeholder="Example input / prompt used..."
                          value={ex.input}
                          onChange={(e) => updateExample(ex._id, 'input', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Output</label>
                        <textarea
                          rows={3}
                          className={INPUT_CLASS + ' text-sm'}
                          placeholder="Expected output / result..."
                          value={ex.output}
                          onChange={(e) => updateExample(ex._id, 'output', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>
                          <div className="flex items-center gap-1.5">
                            <ImageIcon size={12} />
                            Image URL
                            <span className="text-white/20 text-xs">(optional)</span>
                          </div>
                        </label>
                        <input
                          type="url"
                          className={INPUT_CLASS + ' text-sm'}
                          placeholder="https://..."
                          value={ex.image}
                          onChange={(e) => updateExample(ex._id, 'image', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>
                          <div className="flex items-center gap-1.5">
                            <Video size={12} />
                            Video URL
                            <span className="text-white/20 text-xs">(optional)</span>
                          </div>
                        </label>
                        <input
                          type="url"
                          className={INPUT_CLASS + ' text-sm'}
                          placeholder="https://..."
                          value={ex.video}
                          onChange={(e) => updateExample(ex._id, 'video', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={addExample}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-[#C9A84C]/40 transition-colors justify-center text-sm"
            >
              <Plus size={16} />
              {t('promptCreate.addExample') || 'Add Example'}
            </button>
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
                    whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(201,168,76,0.2)' }}
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
                        <span className="text-[#C9A84C]">*</span>
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
                        <span className="text-[#C9A84C]">*</span>
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
                          className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#E5C767] transition-colors"
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
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-[#C9A84C]/40 transition-colors justify-center text-sm"
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
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#C9A84C] text-white font-semibold hover:bg-[#B8963F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(201,168,76,0.3)]"
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
