import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Save, Globe, Tag, Image, FileText, Hash, Clock,
  User, Star, Link2, Eye, Loader2, ChevronDown
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

export const BlogDrawer: React.FC<BlogDrawerProps> = ({ post, isNew, onClose, onSave, categories }) => {
  const [data, setData] = useState<any>({ ...post });
  const [activeLang, setActiveLang] = useState('en');
  const [activeSection, setActiveSection] = useState<'content' | 'seo' | 'settings'>('content');
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

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

  const handleSave = async () => {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !data.tags?.includes(t)) {
      setField('tags', [...(data.tags || []), t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setField('tags', (data.tags || []).filter((t: string) => t !== tag));
  };

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (k && !data.seo?.keywords?.includes(k)) {
      setField('seo.keywords', [...(data.seo?.keywords || []), k]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setField('seo.keywords', (data.seo?.keywords || []).filter((k: string) => k !== kw));
  };

  const inputClass = "w-full bg-white/60 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] px-3 py-2 rounded-lg text-[12px] focus:border-brand-blue outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600";
  const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-[500]" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-[501] w-full max-w-[680px] bg-white dark:bg-[#0a0a0c] border-l border-black/[0.04] dark:border-white/[0.04] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-5 border-b border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-brand-blue" />
            <h2 className="text-[13px] font-bold text-slate-800 dark:text-white">
              {isNew ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Section tabs */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">

          {/* ═══ CONTENT SECTION ═══ */}
          {activeSection === 'content' && (
            <>
              {/* Slug */}
              <div>
                <label className={labelClass}><Link2 size={10} /> Slug (URL)</label>
                <input value={data.slug || ''} onChange={e => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="my-awesome-post" className={inputClass} />
              </div>

              {/* Cover Image */}
              <div>
                <label className={labelClass}><Image size={10} /> Cover Image URL</label>
                <input value={data.coverImage || ''} onChange={e => setField('coverImage', e.target.value)}
                  placeholder="https://..." className={inputClass} />
                {data.coverImage && (
                  <img src={data.coverImage} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg border border-black/[0.04] dark:border-white/[0.04]" />
                )}
              </div>

              {/* Language Tabs */}
              <div className="flex gap-1 mb-1">
                {LANG_TABS.map(l => (
                  <button key={l.key} onClick={() => setActiveLang(l.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeLang === l.key ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className={labelClass}>Tiêu đề ({activeLang.toUpperCase()})</label>
                <input value={data.title?.[activeLang] || ''} onChange={e => setField(`title.${activeLang}`, e.target.value)}
                  placeholder="Enter title..." className={inputClass} />
              </div>

              {/* Excerpt */}
              <div>
                <label className={labelClass}>Mô tả ngắn ({activeLang.toUpperCase()})</label>
                <textarea value={data.excerpt?.[activeLang] || ''} onChange={e => setField(`excerpt.${activeLang}`, e.target.value)}
                  placeholder="Brief description for listing..." rows={3} className={inputClass + ' resize-none'} />
              </div>

              {/* Content */}
              <div>
                <label className={labelClass}>Nội dung HTML ({activeLang.toUpperCase()})</label>
                <textarea value={data.content?.[activeLang] || ''} onChange={e => setField(`content.${activeLang}`, e.target.value)}
                  placeholder="<h2>Introduction</h2><p>Your content here...</p>" rows={14}
                  className={inputClass + ' resize-y font-mono text-[11px]'} />
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}><Tag size={10} /> Danh mục</label>
                <select value={data.category || ''} onChange={e => setField('category', e.target.value)} className={inputClass}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className={labelClass}><Tag size={10} /> Tags</label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {(data.tags || []).map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-brand-blue/[0.06] text-brand-blue rounded-lg text-[10px] font-medium">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-brand-blue/50 hover:text-red-500"><X size={9} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Thêm tag..." className={inputClass + ' flex-1'} />
                  <button onClick={addTag} className="px-3 py-1.5 bg-brand-blue text-white text-[10px] font-bold rounded-lg">+</button>
                </div>
              </div>
            </>
          )}

          {/* ═══ SEO SECTION ═══ */}
          {activeSection === 'seo' && (
            <>
              <div className="flex gap-1 mb-1">
                {LANG_TABS.map(l => (
                  <button key={l.key} onClick={() => setActiveLang(l.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeLang === l.key ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>

              <div>
                <label className={labelClass}><Globe size={10} /> Meta Title ({activeLang.toUpperCase()})</label>
                <input value={data.seo?.metaTitle?.[activeLang] || ''} onChange={e => setField(`seo.metaTitle.${activeLang}`, e.target.value)}
                  placeholder="SEO title..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Meta Description ({activeLang.toUpperCase()})</label>
                <textarea value={data.seo?.metaDescription?.[activeLang] || ''} onChange={e => setField(`seo.metaDescription.${activeLang}`, e.target.value)}
                  placeholder="SEO description..." rows={3} className={inputClass + ' resize-none'} />
              </div>
              <div>
                <label className={labelClass}><Image size={10} /> OG Image URL</label>
                <input value={data.seo?.ogImage || ''} onChange={e => setField('seo.ogImage', e.target.value)}
                  placeholder="https://..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Hash size={10} /> Keywords</label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {(data.seo?.keywords || []).map((kw: string) => (
                    <span key={kw} className="flex items-center gap-1 px-2 py-1 bg-purple-500/[0.06] text-purple-500 rounded-lg text-[10px] font-medium">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="text-purple-400/50 hover:text-red-500"><X size={9} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Thêm keyword..." className={inputClass + ' flex-1'} />
                  <button onClick={addKeyword} className="px-3 py-1.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg">+</button>
                </div>
              </div>
            </>
          )}

          {/* ═══ SETTINGS SECTION ═══ */}
          {activeSection === 'settings' && (
            <>
              {/* Author */}
              <div>
                <label className={labelClass}><User size={10} /> Tên tác giả</label>
                <input value={data.author?.name || ''} onChange={e => setField('author.name', e.target.value)}
                  placeholder="Author name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Avatar URL</label>
                <input value={data.author?.avatar || ''} onChange={e => setField('author.avatar', e.target.value)}
                  placeholder="https://..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Vai trò</label>
                <input value={data.author?.role || ''} onChange={e => setField('author.role', e.target.value)}
                  placeholder="Editor" className={inputClass} />
              </div>

              {/* Read time & order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}><Clock size={10} /> Thời gian đọc (phút)</label>
                  <input type="number" value={data.readTime || 5} onChange={e => setField('readTime', parseInt(e.target.value) || 5)}
                    min={1} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Hash size={10} /> Thứ tự</label>
                  <input type="number" value={data.order || 0} onChange={e => setField('order', parseInt(e.target.value) || 0)}
                    className={inputClass} />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-white/60 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Star size={14} className={data.isFeatured ? 'text-amber-500' : 'text-slate-400'} />
                    <span className="text-[12px] font-medium text-slate-600 dark:text-gray-300">Bài nổi bật</span>
                  </div>
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${data.isFeatured ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`}
                    onClick={() => setField('isFeatured', !data.isFeatured)}>
                    <div className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all ${data.isFeatured ? 'left-[19px]' : 'left-[3px]'}`} />
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 bg-white/60 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className={data.isPublished ? 'text-emerald-500' : 'text-slate-400'} />
                    <span className="text-[12px] font-medium text-slate-600 dark:text-gray-300">Xuất bản</span>
                  </div>
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${data.isPublished ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}
                    onClick={() => setField('isPublished', !data.isPublished)}>
                    <div className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all ${data.isPublished ? 'left-[19px]' : 'left-[3px]'}`} />
                  </div>
                </label>
              </div>

              {/* Related slugs */}
              <div>
                <label className={labelClass}><Link2 size={10} /> Bài viết liên quan (slugs, phân cách bằng dấu phẩy)</label>
                <input value={(data.relatedSlugs || []).join(', ')} onChange={e => setField('relatedSlugs', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  placeholder="post-slug-1, post-slug-2" className={inputClass} />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};
