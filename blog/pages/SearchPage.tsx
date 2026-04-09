import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { blogApi } from '../apis/blog';
import { BlogPost, Language } from '../types';
import PostCard from '../components/PostCard';

const ITEMS_PER_PAGE = 12;
const DEBOUNCE_MS = 400;

const SearchPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentLang = lang as Language;

  const initialQ = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync URL → inputValue when navigating directly with ?q=
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputValue(q);
    setActiveQuery(q);
    setPage(1);
  }, [searchParams.get('q')]);

  // Fetch results
  const fetchResults = useCallback(async (q: string, p: number) => {
    if (!q.trim()) {
      setPosts([]);
      setTotal(0);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await blogApi.getPosts({
        q: q.trim(),
        page: p,
        limit: ITEMS_PER_PAGE,
        lang: currentLang,
      });
      if (res?.data) setPosts(res.data);
      if (res?.pagination) {
        setTotal(res.pagination.total || 0);
        setTotalPages(res.pagination.totalPages);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  // Debounce: input change → update URL + fetch after delay
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = val.trim();
      setActiveQuery(trimmed);
      setPage(1);
      // Update URL
      if (trimmed) {
        setSearchParams({ q: trimmed }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
      fetchResults(trimmed, 1);
    }, DEBOUNCE_MS);
  };

  // Fetch on page change
  useEffect(() => {
    if (activeQuery) fetchResults(activeQuery, page);
  }, [page]);

  // Initial fetch if landed with ?q=
  useEffect(() => {
    if (initialQ) fetchResults(initialQ, 1);
  }, []);

  // Clear search
  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputValue('');
    setActiveQuery('');
    setPosts([]);
    setSearched(false);
    setSearchParams({}, { replace: true });
    inputRef.current?.focus();
  };

  usePageMeta({
    title: activeQuery
      ? `Tìm kiếm: "${activeQuery}" — Skyverses Insights`
      : 'Tìm kiếm bài viết AI — Skyverses Insights',
    description: activeQuery
      ? `Kết quả tìm kiếm cho "${activeQuery}" trên Skyverses Insights — hướng dẫn AI, tin tức và case study.`
      : 'Tìm kiếm hướng dẫn AI, tin tức và case study trên Skyverses Insights. Khám phá bài viết về Veo3, Kling, Gemini, GPT-4o, Midjourney và 50+ AI model.',
    keywords: activeQuery
      ? `${activeQuery}, hướng dẫn AI, Skyverses insights, tìm kiếm AI`
      : 'tìm kiếm AI, hướng dẫn AI, Skyverses insights',
    noindex: true,
    lang: currentLang,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080809] pt-16 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-28 md:pb-20">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 mt-6 mb-8 text-[12px] font-bold text-slate-400 hover:text-brand-blue transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          {t('blog.back')}
        </button>

        {/* ── Search input ── */}
        <div className="mb-8">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
              size={18}
            />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={t('blog.search')}
              className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.09] dark:border-white/[0.08] pl-12 pr-12 py-4 rounded-2xl text-[15px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:border-brand-blue/40 focus:ring-2 focus:ring-brand-blue/[0.10] outline-none transition-all shadow-sm dark:shadow-none"
            />
            {inputValue && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.12] transition-all"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between mt-3 h-5">
            {loading && (
              <div className="flex items-center gap-2 text-[12px] text-slate-400">
                <div className="w-3 h-3 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                Searching…
              </div>
            )}
            {!loading && searched && activeQuery && (
              <p className="text-[12px] text-slate-400">
                {total > 0
                  ? <><span className="font-bold text-slate-700 dark:text-white">{total}</span> result{total !== 1 ? 's' : ''} for <span className="font-bold text-brand-blue">"{activeQuery}"</span></>
                  : <>No results for <span className="font-bold text-slate-600 dark:text-gray-300">"{activeQuery}"</span></>
                }
              </p>
            )}
            {!loading && !searched && (
              <p className="text-[12px] text-slate-400 flex items-center gap-1.5">
                <SlidersHorizontal size={12} /> Search in titles, excerpts &amp; tags
              </p>
            )}
            <div />
          </div>
        </div>

        {/* ── Recent searches hint (empty state) ── */}
        {!searched && !loading && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center">
              <Search size={24} className="text-slate-300 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-slate-400 dark:text-gray-500">
              Start typing to search articles
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {['AI Video', 'Image Generation', 'Tutorials', 'Prompt Tips'].map(hint => (
                <button
                  key={hint}
                  onClick={() => {
                    setInputValue(hint);
                    setSearchParams({ q: hint }, { replace: true });
                    setActiveQuery(hint);
                    fetchResults(hint, 1);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] rounded-full text-[12px] font-semibold text-slate-500 dark:text-gray-400 hover:text-brand-blue hover:border-brand-blue/30 transition-all"
                >
                  <Clock size={10} />
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── No results ── */}
        {searched && !loading && posts.length === 0 && activeQuery && (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center">
              <Search size={24} className="text-slate-300 dark:text-gray-600" />
            </div>
            <h3 className="text-[16px] font-black text-slate-700 dark:text-white">No results found</h3>
            <p className="text-[13px] text-slate-400 max-w-xs mx-auto">
              Try different keywords or browse by category
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-brand-blue text-white text-[13px] font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand-blue/20"
            >
              Browse all articles
            </button>
          </div>
        )}

        {/* ── Skeleton loading ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-[180px] bg-slate-100 dark:bg-white/[0.04]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-16 bg-slate-100 dark:bg-white/[0.04] rounded-full" />
                  <div className="h-5 bg-slate-100 dark:bg-white/[0.04] rounded-lg w-4/5" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Results grid ── */}
        {!loading && posts.length > 0 && (
          <>
            {/* Desktop 3-col grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map(post => (
                <PostCard key={post._id} post={post} size="normal" />
              ))}
            </div>
            {/* Mobile list */}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-10 h-10 rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-gray-400 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue transition-all font-bold text-[14px]"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-xl text-[13px] font-bold transition-all border ${
                      p === page
                        ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                        : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border-black/[0.08] dark:border-white/[0.08] hover:text-brand-blue hover:border-brand-blue/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-10 h-10 rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-gray-400 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue transition-all font-bold text-[14px]"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
