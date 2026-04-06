import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, Save, Globe, Tag, Image, FileText, Hash, Clock,
  Star, Link2, Eye, Loader2, ExternalLink, Sparkles,
  Code2, LayoutTemplate, RefreshCw, ChevronDown
} from 'lucide-react';

const LANG_TABS = [
  { key: 'en', label: 'EN', flag: '🇺🇸' },
  { key: 'vi', label: 'VI', flag: '🇻🇳' },
  { key: 'ko', label: 'KO', flag: '🇰🇷' },
  { key: 'ja', label: 'JA', flag: '🇯🇵' },
];

interface BlogDrawerProps {
  post: any;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  categories: string[];
}

// Auto-generate slug from string
const slugify = (str: string) =>
  str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

// Extract headings from HTML
const countWords = (html: string) => {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200); // ~200 wpm
};

export const BlogDrawer: React.FC<BlogDrawerProps> = ({ post, isNew, onClose, onSave, categories }) => {
  const [data, setData] = useState<any>({ ...post });
  const [activeLang, setActiveLang] = useState('en');
  const [activeSection, setActiveSection] = useState<'content' | 'seo' | 'settings'>('content');
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [contentMode, setContentMode] = useState<'code' | 'preview'>('code');
  const [slugLocked, setSlugLocked] = useState(!isNew);
  const prevTitleRef = useRef('');

  // Auto-slug from EN title (only for new posts, unlocked)
  useEffect(() => {
    if (!slugLocked && data.title?.en && data.title.en !== prevTitleRef.current) {
      prevTitleRef.current = data.title.en;
      setField('slug', slugify(data.title.en));
    }
  }, [data.title?.en, slugLocked]);

  // Auto read-time from EN content
  useEffect(() => {
    if (data.content?.en) {
      const rt = countWords(data.content.en);
      if (rt > 0) setField('readTime', rt);
    }
  }, [data.content?.en]);

  const setField = (path: string, value: any) => {
    setData((prev: any) => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return clone;
    });
  };

  // Auto-fill SEO from content
  const autoFillSeo = () => {
    const lang = activeLang;
    if (!data.seo?.metaTitle?.[lang] && data.title?.[lang]) {
      setField(`seo.metaTitle.${lang}`, `${data.title[lang]} — Skyverses Insights`);
    }
    if (!data.seo?.metaDescription?.[lang] && data.excerpt?.[lang]) {
      setField(`seo.metaDescription.${lang}`, data.excerpt[lang].slice(0, 160));
    }
    if (!data.seo?.ogImage && data.coverImage) {
      setField('seo.ogImage', data.coverImage);
    }
  };

  const handleSave = async () => {
    if (!data.slug) {
      alert('Slug không được để trống!');
      return;
    }
    if (!data.title?.en) {
      alert('Title (EN) không được để trống!');
      return;
    }
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  const handlePreview = () => {
    if (data.slug) {
      window.open(`https://insights.skyverses.com/${data.slug}`, '_blank');
    } else {
      alert('Cần có slug để preview');
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !data.tags?.includes(t)) {
      setField('tags', [...(data.tags || []), t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setField('tags', (data.tags || []).filter((t: string) => t !== tag));

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (k && !data.seo?.keywords?.includes(k)) {
      setField('seo.keywords', [...(data.seo?.keywords || []), k]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) =>
    setField('seo.keywords', (data.seo?.keywords || []).filter((k: string) => k !== kw));

  const inputClass = 'w-full bg-white/60 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] px-3 py-2 rounded-lg text-[12px] focus:border-brand-blue outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600';
  const labelClass = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5';

  const isPublished = data.isPublished;
  const hasLangContent = (lang: string) => !!(data.title?.[lang] && data.content?.[lang]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-[500]" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-[501] w-full max-w-[720px] bg-white dark:bg-[#0a0a0c] border-l border-black/[0.04] dark:border-white/[0.04] flex flex-col shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="shrink-0 h-14 flex items-center justify-between px-5 border-b border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-brand-blue" />
            <h2 className="text-[13px] font-bold text-slate-800 dark:text-white">
              {isNew ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}
            </h2>
            {/* Status badge */}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isPublished
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
              }`}>
              {isPublished ? '● LIVE' : '○ DRAFT'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Preview */}
            {!isNew && data.slug && (
              <button onClick={handlePreview}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-gray-300 text-[11px] font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all border border-black/[0.04] dark:border-white/[0.04]">
                <ExternalLink size={11} /> Preview
              </button>
            )}
            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue text-white text-[11px] font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-brand-blue/20">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? 'Đang lưu...' : 'Lưu bài viết'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Section tabs ── */}
        <div className="shrink-0 flex border-b border-black/[0.04] dark:border-white/[0.04] px-5">
          {([
            { key: 'content', label: 'Nội dung', icon: FileText },
            { key: 'seo', label: 'SEO', icon: Globe },
            { key: 'settings', label: 'Cài đặt', icon: Hash },
          ] as const).map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-semibold border-b-2 transition-all ${activeSection === s.key
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <s.icon size={12} /> {s.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">

          {/* ═══ CONTENT SECTION ═══ */}
          {activeSection === 'content' && (
            <>
              {/* Slug row */}
              <div>
                <label className={labelClass}><Link2 size={10} /> Slug (URL)</label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[11px]">
                      /
                    </span>
                    <input
                      value={data.slug || ''}
                      onChange={e => { setSlugLocked(true); setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }}
                      placeholder="auto-generated-from-title"
                      className={inputClass + ' pl-5'}
                    />
                  </div>
                  {slugLocked && (
                    <button onClick={() => setSlugLocked(false)} title="Tự động từ title"
                      className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-400 hover:text-brand-blue transition-colors shrink-0">
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  URL: <span className="text-brand-blue">insights.skyverses.com/{data.slug || '...'}</span>
                </p>
              </div>

              {/* Cover Image */}
              <div>
                <label className={labelClass}><Image size={10} /> Cover Image URL</label>
                <input value={data.coverImage || ''} onChange={e => setField('coverImage', e.target.value)}
                  placeholder="https://images.unsplash.com/..." className={inputClass} />
                {data.coverImage && (
                  <img src={data.coverImage} alt="Preview"
                    className="mt-2 h-36 w-full object-cover rounded-xl border border-black/[0.04] dark:border-white/[0.04]" />
                )}
              </div>

              {/* Lang tabs with completion indicators */}
              <div className="flex gap-1.5 mb-1">
                {LANG_TABS.map(l => (
                  <button key={l.key} onClick={() => setActiveLang(l.key)}
                    className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeLang === l.key
                      ? 'bg-brand-blue text-white'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
                    {l.flag} {l.label}
                    {hasLangContent(l.key) && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0a0c]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className={labelClass}>Tiêu đề ({activeLang.toUpperCase()})</label>
                <input value={data.title?.[activeLang] || ''}
                  onChange={e => setField(`title.${activeLang}`, e.target.value)}
                  placeholder="Enter title..." className={inputClass} />
                {activeLang === 'en' && (
                  <p className="text-[10px] text-slate-400 mt-1">{(data.title?.en || '').length}/80 chars</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className={labelClass}>Mô tả ngắn ({activeLang.toUpperCase()})</label>
                <textarea value={data.excerpt?.[activeLang] || ''}
                  onChange={e => setField(`excerpt.${activeLang}`, e.target.value)}
                  placeholder="Brief description for listing..." rows={3}
                  className={inputClass + ' resize-none'} />
                <p className="text-[10px] text-slate-400 mt-1">{(data.excerpt?.[activeLang] || '').length} chars</p>
              </div>

              {/* Content — code/preview toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass + ' mb-0'}>Nội dung HTML ({activeLang.toUpperCase()})</label>
                  <div className="flex gap-1">
                    <button onClick={() => setContentMode('code')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${contentMode === 'code'
                        ? 'bg-brand-blue/10 text-brand-blue'
                        : 'text-slate-400 hover:text-slate-600'}`}>
                      <Code2 size={10} /> Code
                    </button>
                    <button onClick={() => setContentMode('preview')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${contentMode === 'preview'
                        ? 'bg-brand-blue/10 text-brand-blue'
                        : 'text-slate-400 hover:text-slate-600'}`}>
                      <LayoutTemplate size={10} /> Preview
                    </button>
                  </div>
                </div>
                {contentMode === 'code' ? (
                  <textarea value={data.content?.[activeLang] || ''}
                    onChange={e => setField(`content.${activeLang}`, e.target.value)}
                    placeholder="<h2>Introduction</h2><p>Your content here...</p>" rows={16}
                    className={inputClass + ' resize-y font-mono text-[11px]'} />
                ) : (
                  <div
                    className="prose max-w-none text-[13px] p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl min-h-[200px] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: data.content?.[activeLang] || '<p class="text-slate-400 italic">No content yet...</p>' }}
                  />
                )}
                <div className="flex justify-between mt-1">
                  <p className="text-[10px] text-slate-400">
                    ~{data.readTime || 5} min read (auto-calculated)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(data.content?.[activeLang] || '').length.toLocaleString()} chars
                  </p>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}><Tag size={10} /> Danh mục</label>
                <select value={data.category || ''} onChange={e => setField('category', e.target.value)}
                  className={inputClass}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className={labelClass}><Tag size={10} /> Tags</label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {(data.tags || []).map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-brand-blue/[0.07] text-brand-blue rounded-full text-[10px] font-semibold">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-brand-blue/40 hover:text-red-500 ml-0.5">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag + Enter" className={inputClass + ' flex-1'} />
                  <button onClick={addTag}
                    className="px-3 py-1.5 bg-brand-blue text-white text-[10px] font-bold rounded-lg hover:brightness-110 transition-all">
                    +
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ═══ SEO SECTION ═══ */}
          {activeSection === 'seo' && (
            <>
              {/* Auto-fill button */}
              <div className="flex items-center justify-between p-3 bg-brand-blue/[0.04] border border-brand-blue/10 rounded-xl">
                <div>
                  <p className="text-[12px] font-bold text-slate-700 dark:text-white">Auto-fill SEO</p>
                  <p className="text-[10px] text-slate-400">Tự động điền từ title & excerpt ({activeLang.toUpperCase()})</p>
                </div>
                <button onClick={autoFillSeo}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white text-[11px] font-bold rounded-lg hover:brightness-110 transition-all">
                  <Sparkles size={11} /> Auto-fill
                </button>
              </div>

              {/* Lang tabs */}
              <div className="flex gap-1.5 mb-1">
                {LANG_TABS.map(l => (
                  <button key={l.key} onClick={() => setActiveLang(l.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeLang === l.key
                      ? 'bg-brand-blue text-white'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>

              <div>
                <label className={labelClass}><Globe size={10} /> Meta Title ({activeLang.toUpperCase()})</label>
                <input value={data.seo?.metaTitle?.[activeLang] || ''}
                  onChange={e => setField(`seo.metaTitle.${activeLang}`, e.target.value)}
                  placeholder="SEO title..." className={inputClass} />
                <p className="text-[10px] text-slate-400 mt-1">
                  {(data.seo?.metaTitle?.[activeLang] || '').length}/60 chars
                  {(data.seo?.metaTitle?.[activeLang] || '').length > 60 && (
                    <span className="text-red-400 ml-1">⚠ Too long</span>
                  )}
                </p>
              </div>

              <div>
                <label className={labelClass}>Meta Description ({activeLang.toUpperCase()})</label>
                <textarea value={data.seo?.metaDescription?.[activeLang] || ''}
                  onChange={e => setField(`seo.metaDescription.${activeLang}`, e.target.value)}
                  placeholder="SEO description..." rows={3} className={inputClass + ' resize-none'} />
                <p className="text-[10px] text-slate-400 mt-1">
                  {(data.seo?.metaDescription?.[activeLang] || '').length}/160 chars
                  {(data.seo?.metaDescription?.[activeLang] || '').length > 160 && (
                    <span className="text-red-400 ml-1">⚠ Too long</span>
                  )}
                </p>
              </div>

              <div>
                <label className={labelClass}><Image size={10} /> OG Image URL</label>
                <input value={data.seo?.ogImage || ''}
                  onChange={e => setField('seo.ogImage', e.target.value)}
                  placeholder="https://..." className={inputClass} />
                {(data.seo?.ogImage || data.coverImage) && (
                  <img src={data.seo?.ogImage || data.coverImage} alt="OG preview"
                    className="mt-2 h-28 w-full object-cover rounded-lg border border-black/[0.04] dark:border-white/[0.04]" />
                )}
              </div>

              {/* SEO Preview card */}
              {(data.seo?.metaTitle?.en || data.title?.en) && (
                <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Google Preview</p>
                  <p className="text-[13px] text-blue-600 font-semibold truncate">
                    {data.seo?.metaTitle?.en || data.title?.en}
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    insights.skyverses.com/{data.slug || '...'}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {data.seo?.metaDescription?.en || data.excerpt?.en || 'No description set'}
                  </p>
                </div>
              )}

              <div>
                <label className={labelClass}><Hash size={10} /> Keywords</label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {(data.seo?.keywords || []).map((kw: string) => (
                    <span key={kw} className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/[0.07] text-purple-500 rounded-full text-[10px] font-semibold">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="text-purple-400/50 hover:text-red-500">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add keyword + Enter" className={inputClass + ' flex-1'} />
                  <button onClick={addKeyword}
                    className="px-3 py-1.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg hover:brightness-110 transition-all">
                    +
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ═══ SETTINGS SECTION ═══ */}
          {activeSection === 'settings' && (
            <>
              {/* Author info (read-only since server assigns) */}
              <div className="p-4 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={12} className="text-amber-500" />
                  <p className="text-[12px] font-bold text-slate-700 dark:text-white">Author — Auto Random</p>
                </div>
                <p className="text-[11px] text-slate-500">
                  Server tự động random 1 trong 5 preset creators khi tạo bài. Không thể chỉnh sửa sau khi tạo.
                </p>
                {data.author?.name && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-white dark:bg-white/[0.04] rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
                    {data.author?.avatar && (
                      <img src={data.author.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                    )}
                    <div>
                      <p className="text-[12px] font-bold text-slate-700 dark:text-white">{data.author.name}</p>
                      <p className="text-[10px] text-slate-400">{data.author.role}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Read time & order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}><Clock size={10} /> Thời gian đọc (phút)</label>
                  <input type="number" value={data.readTime || 5}
                    onChange={e => setField('readTime', parseInt(e.target.value) || 5)}
                    min={1} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Hash size={10} /> Thứ tự ưu tiên</label>
                  <input type="number" value={data.order || 0}
                    onChange={e => setField('order', parseInt(e.target.value) || 0)}
                    className={inputClass} />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {[
                  { field: 'isFeatured', label: 'Bài nổi bật (Featured)', desc: 'Hiển thị trên hero section', color: 'bg-amber-500', icon: Star },
                  { field: 'isPublished', label: 'Xuất bản (Publish)', desc: 'Công khai trên Insights', color: 'bg-emerald-500', icon: Eye },
                ].map(toggle => (
                  <label key={toggle.field} className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl cursor-pointer hover:border-brand-blue/20 transition-all">
                    <div className="flex items-center gap-3">
                      <toggle.icon size={15} className={data[toggle.field] ? 'text-brand-blue' : 'text-slate-400'} />
                      <div>
                        <p className="text-[12px] font-semibold text-slate-700 dark:text-gray-200">{toggle.label}</p>
                        <p className="text-[10px] text-slate-400">{toggle.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`relative w-10 h-5 rounded-full transition-colors ${data[toggle.field] ? toggle.color : 'bg-slate-200 dark:bg-white/10'}`}
                      onClick={() => setField(toggle.field, !data[toggle.field])}>
                      <div className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all ${data[toggle.field] ? 'left-[22px]' : 'left-[3px]'}`} />
                    </div>
                  </label>
                ))}
              </div>

              {/* Related slugs */}
              <div>
                <label className={labelClass}><Link2 size={10} /> Bài viết liên quan (slugs)</label>
                <input value={(data.relatedSlugs || []).join(', ')}
                  onChange={e => setField('relatedSlugs', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  placeholder="post-slug-1, post-slug-2" className={inputClass} />
                <p className="text-[10px] text-slate-400 mt-1">Phân cách bằng dấu phẩy</p>
              </div>
            </>
          )}
        </div>

        {/* ── Footer action bar ── */}
        <div className="shrink-0 border-t border-black/[0.04] dark:border-white/[0.04] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Slug: <span className="text-brand-blue font-medium">{data.slug || '—'}</span></span>
            <span>·</span>
            <span>~{data.readTime || 5} min</span>
            <span>·</span>
            <span>{(data.tags || []).length} tags</span>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-brand-blue text-white text-[12px] font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-md shadow-brand-blue/20">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </motion.div>
    </>
  );
};
