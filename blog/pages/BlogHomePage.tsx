import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, TrendingUp, X, ChevronRight,
  BookOpen, Zap, Users, Eye
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { blogApi } from '../apis/blog';
import { BlogPost, CategoryCount, Language } from '../types';
import PostCard from '../components/PostCard';

const ITEMS_PER_PAGE = 12;

// Category icon map
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Tutorials': <BookOpen size={12} />,
  'News': <Zap size={12} />,
  'Case Study': <TrendingUp size={12} />,
  'Tips': <Sparkles size={12} />,
  'Community': <Users size={12} />,
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
    const fetchData = async () => {
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
      } catch (err) { console.error('Blog fetch:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [page, activeCategory, search, currentLang]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [search, page]);

  useEffect(() => { if (urlCategory) setActiveCategory(urlCategory); }, [urlCategory]);

  const handleCategoryClick = (cat: string) => {
    if (cat === activeCategory) { setActiveCategory(''); navigate('/'); }
    else { setActiveCategory(cat); navigate(`/category/${cat}`); }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };
  const heroPost = featured[0];
  const subFeatured = featured.slice(1, 3);
  const isFiltered = !!(activeCategory || search);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0c]">

      {/* ═══════════ HERO BANNER ═══════════ */}
      {!isFiltered && page === 1 && (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0a0a1a] to-[#0a0a0c] pt-20 pb-16">
          {/* Background glow orbs */}
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative max-w-6xl mx-auto px-4 md:px-6">
            {/* Label */}
            <div className="flex items-center justify-center mb-6">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-bold tracking-widest uppercase">
                <Sparkles size={10} fill="currentColor" /> Skyverses Insights
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[1.1] mb-4">
              AI Insights &{' '}
              <span className="bg-gradient-to-r from-brand-blue via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Creative Workflows
              </span>
            </h1>
            <p className="text-slate-400 text-center text-[15px] max-w-2xl mx-auto mb-8">
              {t('blog.subtitle')}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-8 mb-10">
              {[
                { icon: <BookOpen size={14} />, label: `${totalCount || posts.length}+ Articles` },
                { icon: <Eye size={14} />, label: `${categories.length} Categories` },
                { icon: <Users size={14} />, label: 'Skyverses Team' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[12px] text-slate-400">
                  <span className="text-brand-blue">{s.icon}</span> {s.label}
                </div>
              ))}
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('blog.search')}
                className="w-full bg-white/[0.06] border border-white/[0.10] backdrop-blur-sm pl-11 pr-12 py-3.5 rounded-2xl text-[14px] text-white placeholder:text-slate-500 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
              />
              {search ? (
                <button type="button" onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              ) : (
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-blue text-white text-[12px] font-semibold rounded-lg hover:brightness-110 transition-all">
                  <ArrowRight size={14} />
                </button>
              )}
            </form>
          </div>
        </section>
      )}

      <div className={`max-w-6xl mx-auto px-4 md:px-6 ${isFiltered ? 'pt-24' : 'pt-10'} pb-16`}>

        {/* ═══════════ FEATURED POSTS GRID ═══════════ */}
        {heroPost && !isFiltered && page === 1 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 bg-brand-blue rounded-full" />
              <h2 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('blog.featured')}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Main hero card */}
              <article
                onClick={() => navigate(`/${heroPost.slug}`)}
                className="lg:col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer h-[380px] shadow-xl shadow-black/10"
              >
                <img src={heroPost.coverImage} alt={heroPost.title[currentLang] || heroPost.title.en}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                {/* Shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-brand-blue text-white text-[10px] font-bold rounded-lg uppercase tracking-wide shadow-lg shadow-brand-blue/30">{heroPost.category}</span>
                    <span className="px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-[10px] font-medium rounded-lg border border-white/10">{heroPost.readTime} {t('blog.min_read')}</span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-extrabold text-white mb-2 group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight">
                    {heroPost.title[currentLang] || heroPost.title.en}
                  </h2>
                  <p className="text-[13px] text-gray-300 line-clamp-2 max-w-lg">
                    {heroPost.excerpt[currentLang] || heroPost.excerpt.en}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[12px] text-brand-blue font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('blog.read_more')} <ArrowRight size={13} />
                  </div>
                </div>
              </article>

              {/* Sub-featured stack */}
              <div className="lg:col-span-2 grid grid-rows-2 gap-4">
                {subFeatured.map(post => (
                  <article key={post._id}
                    onClick={() => navigate(`/${post.slug}`)}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-black/[0.06]"
                  >
                    <img src={post.coverImage} alt={post.title[currentLang] || post.title.en}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="px-2 py-0.5 bg-brand-blue text-white text-[9px] font-bold rounded uppercase mb-2 inline-block">{post.category}</span>
                      <h3 className="text-[14px] font-bold text-white group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug">
                        {post.title[currentLang] || post.title.en}
                      </h3>
                    </div>
                  </article>
                ))}
                {subFeatured.length < 2 && (
                  <div className="rounded-2xl bg-gradient-to-br from-brand-blue/[0.07] via-purple-500/[0.04] to-transparent border border-brand-blue/10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <TrendingUp size={22} className="text-brand-blue mx-auto mb-2 opacity-60" />
                      <p className="text-[12px] font-medium text-slate-500 dark:text-gray-400">More articles coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ CATEGORIES ═══════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
            <button onClick={() => handleCategoryClick('')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${!activeCategory
                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-black/[0.06] dark:border-white/[0.06] hover:text-brand-blue hover:border-brand-blue/20'}`}>
              ✦ {t('blog.all')}
            </button>
            {categories.map(cat => (
              <button key={cat.category} onClick={() => handleCategoryClick(cat.category)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${activeCategory === cat.category
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                  : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-black/[0.06] dark:border-white/[0.06] hover:text-brand-blue hover:border-brand-blue/20'}`}>
                {CATEGORY_ICONS[cat.category] || <BookOpen size={11} />}
                {cat.category}
                <span className="text-[10px] opacity-60 bg-current/10 px-1.5 py-0.5 rounded-md">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        {activeCategory && (
          <div className="flex items-center gap-1.5 mb-5 text-[12px] text-slate-400">
            <button onClick={() => { setActiveCategory(''); navigate('/'); }} className="hover:text-brand-blue transition-colors">{t('blog.home')}</button>
            <ChevronRight size={12} />
            <span className="text-brand-blue font-semibold">{activeCategory}</span>
          </div>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 bg-brand-blue rounded-full" />
            <h2 className="text-[15px] font-extrabold text-slate-800 dark:text-white">
              {activeCategory || (search ? `"${search}"` : t('blog.latest'))}
            </h2>
            {!loading && <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full">{posts.length}</span>}
          </div>
        </div>

        {/* ═══════════ POST GRID ═══════════ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-[200px] bg-slate-100 dark:bg-white/[0.03]" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-1"><div className="h-4 bg-slate-100 dark:bg-white/[0.04] rounded-md w-14" /><div className="h-4 bg-slate-100 dark:bg-white/[0.04] rounded-md w-10" /></div>
                  <div className="h-4 bg-slate-100 dark:bg-white/[0.04] rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-brand-blue/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-blue/10">
              <Search size={24} className="text-brand-blue opacity-60" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">{t('blog.no_posts')}</h3>
            <p className="text-[13px] text-slate-400">Try adjusting your search or browse all categories.</p>
            <button onClick={() => { setSearch(''); setActiveCategory(''); navigate('/'); }}
              className="mt-4 px-4 py-2 bg-brand-blue text-white text-[13px] font-semibold rounded-xl hover:brightness-110 transition-all">
              Browse All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, i) => (
              <PostCard key={post._id} post={post} featured={i === 0 && page === 1 && isFiltered} />
            ))}
          </div>
        )}

        {/* ═══════════ PAGINATION ═══════════ */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-3 py-2 rounded-xl text-[13px] font-semibold border border-black/[0.06] dark:border-white/[0.06] text-slate-500 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-all border ${p === page
                  ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                  : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border-black/[0.06] dark:border-white/[0.06] hover:text-brand-blue hover:border-brand-blue/30'}`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-3 py-2 rounded-xl text-[13px] font-semibold border border-black/[0.06] dark:border-white/[0.06] text-slate-500 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogHomePage;
