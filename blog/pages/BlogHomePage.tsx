import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles, ChevronRight, TrendingUp,
  BookOpen, Zap, Users, Tag, ArrowRight, Newspaper, Search
} from 'lucide-react';import { useLanguage } from '../context/LanguageContext';
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

// ─── Reading progress bar ───
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
  const { category: urlCategory } = useParams<{ category?: string }>();
  const currentLang = lang as Language;

  usePageMeta({
    title: urlCategory
      ? `${urlCategory} — Skyverses Insights`
      : 'Skyverses Insights — AI Tutorials, News & Workflows',
    description: t('blog.subtitle'),
    keywords: 'Skyverses insights, AI tutorials, AI tools, creative AI, video AI, image generation',
    canonical: urlCategory ? `/category/${urlCategory}` : '/',
    lang: currentLang,
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(urlCategory || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [postsRes, featRes, catRes] = await Promise.all([
          blogApi.getPosts({ page, limit: ITEMS_PER_PAGE, category: activeCategory || undefined, lang: currentLang }),
          page === 1 && !activeCategory ? blogApi.getFeatured() : Promise.resolve({ success: true, data: [] }),
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
  }, [page, activeCategory, currentLang]);

  useEffect(() => { if (urlCategory !== undefined) setActiveCategory(urlCategory || ''); }, [urlCategory]);

  const handleCategory = (cat: string) => {
    if (cat === activeCategory) { setActiveCategory(''); navigate('/'); }
    else { setActiveCategory(cat); navigate(`/category/${cat}`); }
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heroPost = featured[0];
  const sidePosts = featured.slice(1, 4);
  const isFiltered = !!activeCategory;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080809]">
      <ReadingProgress />

      {/* ══════════════════════════════════════════════════════
          APPLE EDITORIAL GRID — content-first, straight to top
      ══════════════════════════════════════════════════════ */}
      {!isFiltered && page === 1 && heroPost && (
        <section className="bg-slate-950 pt-14 md:pt-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

            {/* "Editor's Picks" eyebrow */}
            <div className="flex items-center gap-3 mb-5 md:mb-7">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.20em] text-slate-500 uppercase">
                <Sparkles size={9} className="text-amber-400" fill="currentColor" /> Editor's Picks
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* ── DESKTOP: Apple 5-col editorial grid ── */}
            <div className="hidden md:grid grid-cols-5 gap-3 lg:gap-4" style={{ height: '560px' }}>
              <div className="col-span-3 h-full">
                <PostCard post={heroPost} size="hero" />
              </div>
              <div className="col-span-2 flex flex-col gap-3 lg:gap-4 h-full">
                {sidePosts[0] && (
                  <div className="flex-1"><PostCard post={sidePosts[0]} size="featured" /></div>
                )}
                {sidePosts[1] && (
                  <div className="flex-1"><PostCard post={sidePosts[1]} size="featured" /></div>
                )}
                {sidePosts[2] ? (
                  <div className="shrink-0 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <PostCard post={sidePosts[2]} size="compact" />
                  </div>
                ) : (
                  <div className="shrink-0 h-[80px] rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Newspaper size={13} /> More coming soon
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── MOBILE: Hero + 2 featured side-by-side ── */}
            <div className="flex md:hidden flex-col gap-3">
              <div className="h-[260px]">
                <PostCard post={heroPost} size="hero" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sidePosts.slice(0, 2).map(p => (
                  <div key={p._id} className="h-[145px]">
                    <PostCard post={p} size="featured" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wave separator */}
          <div className="h-10 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#f8fafc] dark:bg-[#080809] [clip-path:ellipse(55%_100%_at_50%_100%)]" />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <div className={`max-w-7xl mx-auto px-4 md:px-8 pb-28 md:pb-20 ${isFiltered ? 'pt-20 md:pt-24' : 'pt-8'}`}>

        {/* ── Filter bar — categories only ── */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => handleCategory('')}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[12px] font-bold transition-all ${!activeCategory
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-black/[0.07] dark:border-white/[0.07] hover:text-slate-900 dark:hover:text-white'
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

        {/* Breadcrumb */}
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

        {/* ── Post feed ── */}
        {loading ? (
          <>
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-[200px] bg-slate-100 dark:bg-white/[0.04]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-16 bg-slate-100 dark:bg-white/[0.04] rounded-full" />
                    <div className="h-5 bg-slate-100 dark:bg-white/[0.04] rounded-lg w-4/5" />
                    <div className="h-3.5 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex md:hidden flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden animate-pulse p-3 flex gap-3">
                  <div className="w-[90px] h-[76px] bg-slate-100 dark:bg-white/[0.04] rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-14 bg-slate-100 dark:bg-white/[0.04] rounded-full" />
                    <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                    <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : posts.length === 0 ? (
          <div className="py-28 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center">
              <Search size={28} className="text-slate-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-black text-slate-700 dark:text-white mb-2">{t('blog.no_posts')}</h3>
            <p className="text-[14px] text-slate-400 mb-6 max-w-sm mx-auto">
              No articles in this category yet.
            </p>
            <button onClick={() => { setActiveCategory(''); navigate('/'); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-[13px] font-bold rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand-blue/20">
              <ArrowRight size={14} /> Browse All Articles
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP: 3-column grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <PostCard key={post._id} post={post} size="normal" />
              ))}
            </div>
            {/* MOBILE: Vertical list feed */}
            <div className="flex md:hidden flex-col gap-2.5">
              {posts.map((post, idx) => (
                <React.Fragment key={post._id}>
                  <PostCard post={post} size="normal" />
                  {idx < posts.length - 1 && (
                    <div className="h-px bg-black/[0.04] dark:bg-white/[0.04] mx-3" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14 mb-4">
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
