import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, ArrowLeft, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { blogApi } from '../apis/blog';
import { BlogPost, Language } from '../types';
import PostCard from '../components/PostCard';

const ITEMS_PER_PAGE = 12;

// ── Skeleton ────────────────────────────────────────────────
const CardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <div className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden flex flex-col" style={{ animationDelay: `${delay}ms` }}>
    <div className="skeleton h-[200px] !rounded-none" />
    <div className="p-5 space-y-3 flex-1">
      <div className="skeleton h-4 w-16 !rounded-full" />
      <div className="skeleton h-5 w-4/5 !rounded-lg" />
      <div className="skeleton h-5 w-3/5 !rounded-lg" />
      <div className="skeleton h-3.5 w-full !rounded-md" />
      <div className="skeleton h-3.5 w-2/3 !rounded-md" />
    </div>
  </div>
);

const TagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const currentLang = lang as Language;

  const decodedTag = decodeURIComponent(tag || '');

  usePageMeta({
    title: `#${decodedTag} — Bài viết & Tin tức AI | Skyverses Insights`,
    description: `Tổng hợp tất cả bài viết được gắn tag "${decodedTag}" trên Skyverses Insights. Tin tức, hướng dẫn và case study AI liên quan đến ${decodedTag}.`,
    keywords: `${decodedTag}, ${decodedTag} AI, tin tức ${decodedTag}, hướng dẫn ${decodedTag}, Skyverses insights, AI news`,
    canonical: `/tags/${encodeURIComponent(decodedTag)}`,
    lang: currentLang,
    jsonLd: {
      '@type': 'CollectionPage',
      name: `Tag: ${decodedTag} — Skyverses Insights`,
      description: `Bài viết được gắn tag "${decodedTag}" trên Skyverses Insights`,
      url: `https://insights.skyverses.com/tags/${encodeURIComponent(decodedTag)}`,
      isPartOf: {
        '@type': 'Blog',
        name: 'Skyverses Insights',
        url: 'https://insights.skyverses.com',
      },
    },
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!decodedTag) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await blogApi.getPosts({ tag: decodedTag, page, limit: ITEMS_PER_PAGE, lang: currentLang });
        if (res?.data) setPosts(res.data);
        if (res?.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total || 0);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [decodedTag, page, currentLang]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080809] pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-28 md:pb-20">

        {/* ── Back button ── */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 mt-6 mb-8 text-[12px] font-bold text-slate-400 hover:text-brand-blue transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại
        </button>

        {/* ── Tag header ── */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
            <Tag size={20} className="text-brand-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black tracking-[0.15em] text-slate-400 uppercase">Tag</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              #{decodedTag}
            </h1>
            {!loading && (
              <p className="text-[13px] text-slate-400 mt-1">
                {totalCount} bài viết
              </p>
            )}
          </div>
        </div>

        {/* ── Posts grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} delay={i * 60} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-28 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center">
              <Search size={28} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-700 dark:text-white mb-2">Không tìm thấy bài viết</h3>
            <p className="text-[14px] text-slate-400 mb-6 max-w-sm mx-auto">
              Chưa có bài viết nào được gắn tag <strong>#{decodedTag}</strong>.
            </p>
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-[13px] font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-brand-blue/20">
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, idx) => (
                <div key={post._id} className="card-reveal" style={{ animationDelay: `${idx * 55}ms` }}>
                  <PostCard post={post} size="normal" />
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-10 h-10 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-slate-500 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue transition-all font-bold text-[14px]">
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-2xl text-[13px] font-bold transition-all border ${p === page
                      ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                      : 'bg-white dark:bg-white/[0.04] text-slate-500 border-black/[0.08] dark:border-white/[0.08] hover:text-brand-blue hover:border-brand-blue/30'
                    }`}>
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-10 h-10 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-slate-500 disabled:opacity-30 hover:border-brand-blue/30 hover:text-brand-blue transition-all font-bold text-[14px]">
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

export default TagPage;
