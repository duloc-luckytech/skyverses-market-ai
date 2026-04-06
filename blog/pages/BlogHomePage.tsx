import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, TrendingUp, Layers, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { blogApi } from '../apis/blog';
import { BlogPost, CategoryCount, Language } from '../types';
import PostCard from '../components/PostCard';

const ITEMS_PER_PAGE = 12;

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
    keywords: 'Skyverses blog, AI tutorials, AI tools, creative AI, video AI, image generation',
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

  // Fetch posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, featRes, catRes] = await Promise.all([
          blogApi.getPosts({
            page,
            limit: ITEMS_PER_PAGE,
            category: activeCategory || undefined,
            q: search || undefined,
            lang: currentLang,
          }),
          page === 1 && !activeCategory && !search ? blogApi.getFeatured() : Promise.resolve({ success: true, data: [] }),
          blogApi.getCategories(),
        ]);

        if (postsRes?.data) setPosts(postsRes.data);
        if (postsRes?.pagination) setTotalPages(postsRes.pagination.totalPages);
        if (featRes?.data) setFeatured(featRes.data);
        if (catRes?.data) setCategories(catRes.data);
      } catch (err) {
        console.error('Blog fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, activeCategory, search, currentLang]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [search, page]);

  useEffect(() => {
    if (urlCategory) setActiveCategory(urlCategory);
  }, [urlCategory]);

  const handleCategoryClick = (cat: string) => {
    if (cat === activeCategory) {
      setActiveCategory('');
      navigate('/');
    } else {
      setActiveCategory(cat);
      navigate(`/category/${cat}`);
    }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Featured hero post
  const heroPost = featured[0];
  const subFeatured = featured.slice(1, 3);

  return (
    <div className="pt-20 pb-16 min-h-screen bg-[#fafafa] dark:bg-[#0a0a0c]">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* ═══ HERO — Featured Posts ═══ */}
        {heroPost && !activeCategory && !search && page === 1 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-amber-500" />
              <h2 className="text-[14px] font-bold text-slate-700 dark:text-white">{t('blog.featured')}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Main featured */}
              <article
                onClick={() => navigate(`/${heroPost.slug}`)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer h-[360px] lg:h-auto"
              >
                <img src={heroPost.coverImage} alt={heroPost.title[currentLang] || heroPost.title.en}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 bg-brand-blue text-white text-[10px] font-bold rounded-lg uppercase">{heroPost.category}</span>
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium rounded-lg">{heroPost.readTime} {t('blog.min_read')}</span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                    {heroPost.title[currentLang] || heroPost.title.en}
                  </h2>
                  <p className="text-[13px] text-gray-300 line-clamp-2 max-w-lg">
                    {heroPost.excerpt[currentLang] || heroPost.excerpt.en}
                  </p>
                </div>
              </article>

              {/* Sub featured */}
              <div className="grid grid-rows-2 gap-4">
                {subFeatured.map(post => (
                  <article key={post._id}
                    onClick={() => navigate(`/${post.slug}`)}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer h-[170px]"
                  >
                    <img src={post.coverImage} alt={post.title[currentLang] || post.title.en}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="px-2 py-0.5 bg-brand-blue text-white text-[9px] font-bold rounded uppercase mb-2 inline-block">{post.category}</span>
                      <h3 className="text-[15px] font-bold text-white group-hover:text-brand-blue transition-colors line-clamp-2">
                        {post.title[currentLang] || post.title.en}
                      </h3>
                    </div>
                  </article>
                ))}
                {subFeatured.length < 2 && (
                  <div className="rounded-2xl bg-gradient-to-br from-brand-blue/[0.06] to-purple-500/[0.04] border border-brand-blue/10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <TrendingUp size={24} className="text-brand-blue mx-auto mb-2" />
                      <p className="text-[13px] font-medium text-slate-500 dark:text-gray-400">More articles coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══ SEARCH + CATEGORIES ═══ */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('blog.search')}
              className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-8 py-2.5 rounded-xl text-[13px] focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </form>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button onClick={() => handleCategoryClick('')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${!activeCategory ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 hover:text-brand-blue'}`}>
              {t('blog.all')}
            </button>
            {categories.map(cat => (
              <button key={cat.category} onClick={() => handleCategoryClick(cat.category)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeCategory === cat.category ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 hover:text-brand-blue'}`}>
                {cat.category} <span className="text-[10px] opacity-70 ml-0.5">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ BREADCRUMB ═══ */}
        {activeCategory && (
          <div className="flex items-center gap-1.5 mb-4 text-[12px] text-slate-400">
            <button onClick={() => { setActiveCategory(''); navigate('/'); }} className="hover:text-brand-blue transition-colors">{t('blog.home')}</button>
            <ChevronRight size={12} />
            <span className="text-brand-blue font-medium">{activeCategory}</span>
          </div>
        )}

        {/* ═══ SECTION TITLE ═══ */}
        <div className="flex items-center gap-2 mb-5">
          <Layers size={15} className="text-brand-blue" />
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">
            {activeCategory || (search ? `"${search}"` : t('blog.latest'))}
          </h2>
          {!loading && <span className="text-[12px] text-slate-400 ml-1">({posts.length})</span>}
        </div>

        {/* ═══ POST GRID ═══ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-[200px] bg-slate-100 dark:bg-white/[0.03]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-white/[0.04] rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-brand-blue/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-brand-blue" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">{t('blog.no_posts')}</h3>
            <p className="text-[13px] text-slate-400">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* ═══ PAGINATION ═══ */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-9 h-9 rounded-lg text-[13px] font-semibold transition-all ${p === page ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 hover:text-brand-blue'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogHomePage;
