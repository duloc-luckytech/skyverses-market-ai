import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Search, Sparkles, X, ChevronRight, TrendingUp,
  BookOpen, Zap, Users, Flame, Tag, Calendar, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { blogApi } from '../apis/blog';
import { BlogPost, CategoryCount, Language } from '../types';
import PostCard from '../components/PostCard';

const ITEMS_PER_PAGE = 12;

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string }> = {
  'Tutorials': { icon: <BookOpen size={12} />, color: 'text-blue-500' },
  'News': { icon: <Zap size={12} />, color: 'text-violet-500' },
  'Tips': { icon: <Sparkles size={12} />, color: 'text-amber-500' },
  'Case Study': { icon: <TrendingUp size={12} />, color: 'text-emerald-500' },
  'Community': { icon: <Users size={12} />, color: 'text-pink-500' },
};

// ─── Reading progress bar (page-level) ───
const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-[2px] left-0 right-0 h-[2px] z-[199] bg-slate-200/20 dark:bg-white/5">
      <div className="h-full bg-gradient-to-r from-brand-blue to-purple-500 transition-all duration-150"
        style={{ width: `${progress}%` }} />
    </div>
  );
};

const BlogHomePage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: urlCategory } = useParams<{ category?: string }>();
  const currentLang = lang as Language;

  usePageMeta({
    title: urlCategory
      ? `${urlCategory} — Skyverses Insights`
      : 'Skyverses Insights — AI Tutorials, News & Workflows',
    description: t('blog.subtitle'),
    keywords: 'Skyverses insights, AI tutorials, AI tools, creative AI, video AI, image generation',
    canonical: urlCategory ? `/category/${urlCategory}` : '/',
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(urlCategory || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [postsRes, featRes, catRes] = await Promise.all([
          blogApi.getPosts({ page, limit: ITEMS_PER_PAGE, category: activeCategory || undefined, q: search || undefined, lang: currentLang }),
          page === 1 && !activeCategory && !search ? blogApi.getFeatured() : Promise.resolve({ success: true, data: [] }),
          blogApi.getCategories(),
        ]);
        if (postsRes?.data) setPosts(postsRes.data);
        if (postsRes?.pagination) { setTotalPages(postsRes.pagination.totalPages); setTotalCount(postsRes.pagination.total || 0); }
        if (featRes?.data) setFeatured(featRes.data);
        if (catRes?.data) setCategories(catRes.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [page, activeCategory, search, currentLang]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set('q', search);
    if (page > 1) p.set('page', String(page));
    setSearchParams(p, { replace: true });
  }, [search, page]);

  useEffect(() => { if (urlCategory !== undefined) setActiveCategory(urlCategory || ''); }, [urlCategory]);

  const handleCategory = (cat: string) => {
    if (cat === activeCategory) { setActiveCategory(''); navigate('/'); }
    else { setActiveCategory(cat); navigate(`/category/${cat}`); }
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };

  const heroPost = featured[0];
  const subFeatured = featured.slice(1, 4);
  const isFiltered = !!(activeCategory || search);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080809]">
      <ReadingProgress />

      {/* ══════════════════════════════════
          HERO — full-bleed cinematic
      ══════════════════════════════════ */}
      {!isFiltered && page === 1 && (
        <section className="relative">
          {/* Dark editorial header bg */}
          <div className="relative bg-slate-950 overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-brand-blue/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/3 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Dot grid bg */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-12">
              {/* Eyebrow */}
              <div className="flex items-center justify-center mb-6">
                <span className="flex items-center gap-2 px-4 py-1.5 border border-brand-blue/30 bg-brand-blue/10 rounded-full text-brand-blue text-[11px] font-black tracking-[0.15em] uppercase">
                  <Flame size={11} fill="currentColor" className="animate-pulse" />
                  Skyverses Insights — AI Knowledge Hub
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-center leading-[1.0] tracking-tight mb-5">
                Learn, Create &{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-brand-blue via-blue-300 to-purple-400 bg-clip-text text-transparent">
                    Master AI
                  </span>
                </span>
              </h1>

              <p className="text-center text-slate-400 text-[16px] max-w-xl mx-auto mb-10 leading-relaxed">
                {t('blog.subtitle')}
              </p>

              {/* Stats */}
              {totalCount > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                  {[
                    { icon: <BookOpen size={13} />, value: `${totalCount}+ Articles` },
                    { icon: <Tag size={13} />, value: `${categories.length} Categories` },
                    { icon: <Calendar size={13} />, value: 'Updated Daily' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] text-slate-400">
                      <span className="text-brand-blue">{s.icon}</span>
                      <span>{s.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Category quick-links */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map(cat => {
                  const meta = CATEGORY_META[cat.category] || { icon: <BookOpen size={12} />, color: 'text-slate-400' };
                  return (
                    <button key={cat.category} onClick={() => handleCategory(cat.category)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] border border-white/[0.08] hover:border-brand-blue/30 hover:bg-brand-blue/[0.08] rounded-2xl text-[12px] font-semibold text-slate-300 hover:text-brand-blue transition-all">
                      <span className={meta.color}>{meta.icon}</span>
                      {cat.category}
                      <span className="text-[10px] opacity-50 ml-0.5">({cat.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Featured editorial grid ── */}
          {heroPost && (
            <div className="bg-slate-950 pb-0">
              <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-white/[0.06]" />
                  <span className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-500 uppercase">
                    <Sparkles size={10} className="text-amber-400" fill="currentColor" /> Editor's Picks
                  </span>
                  <div className="h-[1px] flex-1 bg-white/[0.06]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main hero (2/3 width) */}
                  <div className="lg:col-span-2">
                    <PostCard post={heroPost} size="hero" />
                  </div>

                  {/* Side stack (1/3 width) */}
                  <div className="flex flex-col gap-4">
                    {subFeatured.slice(0, 2).map(p => (
                      <PostCard key={p._id} post={p} size="featured" />
                    ))}
                    {subFeatured.length < 2 && (
                      <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center min-h-[120px]">
                        <div className="text-center">
                          <TrendingUp size={20} className="text-slate-600 mx-auto mb-2" />
                          <p className="text-[12px] text-slate-600">More coming soon</p>
                        </div>
                      </div>
                    )}
                    {subFeatured[2] && (
                      <PostCard post={subFeatured[2]} size="compact" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wave separator */}
          <div className="h-12 bg-slate-950 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#f8fafc] dark:bg-[#080809] [clip-path:ellipse(55%_100%_at_50%_100%)]" />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <div className={`max-w-7xl mx-auto px-4 md:px-8 pb-20 ${isFiltered ? 'pt-28' : 'pt-8'}`}>

        {/* ── Search + Filter bar ── */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('blog.search')}
              className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.07] pl-10 pr-10 py-2.5 rounded-2xl text-[13px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:border-brand-blue/40 focus:ring-2 focus:ring-brand-blue/[0.08] outline-none transition-all shadow-sm dark:shadow-none"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors">
                <X size={13} />
              </button>
            )}
          </form>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => handleCategory('')}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[12px] font-bold transition-all ${!activeCategory
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                  : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-black/[0.07] dark:border-white/[0.07] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                }`}>
              ✦ {t('blog.all')}
            </button>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat.category] || { icon: <BookOpen size={11} />, color: 'text-slate-400' };
              const isActive = activeCategory === cat.category;
              return (
                <button key={cat.category} onClick={() => handleCategory(cat.category)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[12px] font-bold transition-all ${isActive
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/25'
                      : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-black/[0.07] dark:border-white/[0.07] hover:text-brand-blue hover:border-brand-blue/30'
                    }`}>
                  <span className={isActive ? 'text-white' : meta.color}>{meta.icon}</span>
                  {cat.category}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Breadcrumb when category selected */}
        {activeCategory && (
          <div className="flex items-center gap-1.5 mb-6 text-[12px] text-slate-400">
            <button onClick={() => { setActiveCategory(''); navigate('/'); }} className="hover:text-brand-blue transition-colors">
              {t('blog.home')}
            </button>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-700 dark:text-white">{activeCategory}</span>
            <span className="ml-1 text-slate-400">({totalCount} articles)</span>
          </div>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-brand-blue to-purple-500 rounded-full" />
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white tracking-tight">
              {activeCategory
                ? `${activeCategory} Articles`
                : search
                  ? `Results for "${search}"`
                  : t('blog.latest')
              }
            </h2>
            {!loading && posts.length > 0 && (
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2.5 py-1 rounded-full">
                {posts.length} shown
              </span>
            )}
          </div>
        </div>

        {/* ── Post grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-[210px] bg-slate-100 dark:bg-white/[0.04]" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 bg-slate-100 dark:bg-white/[0.04] rounded-full" />
                    <div className="h-5 w-12 bg-slate-100 dark:bg-white/[0.03] rounded-full" />
                  </div>
                  <div className="h-5 bg-slate-100 dark:bg-white/[0.04] rounded-lg w-4/5" />
                  <div className="h-3.5 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                  <div className="h-3.5 bg-slate-100 dark:bg-white/[0.03] rounded w-2/3" />
                  <div className="h-px bg-slate-100 dark:bg-white/[0.03] mt-4" />
                  <div className="flex justify-between">
                    <div className="h-6 w-20 bg-slate-100 dark:bg-white/[0.03] rounded-full" />
                    <div className="h-6 w-16 bg-slate-100 dark:bg-white/[0.03] rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-28 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center">
              <Search size={28} className="text-slate-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-black text-slate-700 dark:text-white mb-2">{t('blog.no_posts')}</h3>
            <p className="text-[14px] text-slate-400 mb-6 max-w-sm mx-auto">
              {search ? `No results for "${search}". Try different keywords.` : 'No articles in this category yet.'}
            </p>
            <button onClick={() => { setSearch(''); setActiveCategory(''); navigate('/'); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-[13px] font-bold rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand-blue/20">
              <ArrowRight size={14} /> Browse All Articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <PostCard key={post._id} post={post} size="normal" />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button disabled={page === 1}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-gray-400 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue hover:bg-brand-blue/[0.04] transition-all font-bold text-[14px]">
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-2xl text-[13px] font-bold transition-all border ${p === page
                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                    : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border-black/[0.08] dark:border-white/[0.08] hover:text-brand-blue hover:border-brand-blue/30 hover:bg-brand-blue/[0.04]'
                  }`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-gray-400 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue hover:bg-brand-blue/[0.04] transition-all font-bold text-[14px]">
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogHomePage;
