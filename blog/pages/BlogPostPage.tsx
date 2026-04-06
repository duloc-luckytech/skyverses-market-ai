import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calendar, User, Tag, Share2, Copy, Check, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { blogApi } from '../apis/blog';
import { BlogPost, Language } from '../types';
import PostCard from '../components/PostCard';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const currentLang = lang as Language;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await blogApi.getPost(slug);
        if (res?.success && res.data) {
          setPost(res.data);

          // Fetch related posts by same category
          if (res.data.category) {
            const relRes = await blogApi.getPosts({ category: res.data.category, limit: 3, lang: currentLang });
            if (relRes?.data) {
              setRelated(relRes.data.filter(p => p.slug !== slug).slice(0, 3));
            }
          }
        } else {
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Blog post fetch:', err);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug, currentLang]);

  const title = post?.title[currentLang] || post?.title.en || '';
  const content = post?.content[currentLang] || post?.content.en || '';
  const excerpt = post?.excerpt[currentLang] || post?.excerpt.en || '';
  const metaTitle = post?.seo?.metaTitle?.[currentLang] || post?.seo?.metaTitle?.en || title;
  const metaDesc = post?.seo?.metaDescription?.[currentLang] || post?.seo?.metaDescription?.en || excerpt;

  usePageMeta({
    title: metaTitle ? `${metaTitle} — Skyverses Blog` : 'Skyverses Blog',
    description: metaDesc,
    keywords: post?.seo?.keywords?.join(', ') || post?.tags?.join(', '),
    ogImage: post?.seo?.ogImage || post?.coverImage,
    canonical: `/${slug}`,
    type: 'article',
    jsonLd: post ? {
      '@type': 'Article',
      headline: title,
      description: excerpt,
      image: post.coverImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: { '@type': 'Person', name: post.author?.name || 'Skyverses Team' },
      publisher: {
        '@type': 'Organization',
        name: 'Skyverses',
        logo: { '@type': 'ImageObject', url: 'https://framerusercontent.com/images/EIgpJkAezmTH65ZZbHE7BDbzD60.png' },
      },
    } : undefined,
  });

  const date = post?.publishedAt ? new Date(post.publishedAt).toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  ) : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, text: excerpt, url: window.location.href }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-[#fafafa] dark:bg-[#0a0a0c]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 animate-pulse">
          <div className="h-4 bg-slate-100 dark:bg-white/[0.04] rounded w-24 mb-6" />
          <div className="h-8 bg-slate-100 dark:bg-white/[0.04] rounded w-3/4 mb-4" />
          <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded w-1/2 mb-8" />
          <div className="h-[400px] bg-slate-100 dark:bg-white/[0.03] rounded-2xl mb-8" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-3 bg-slate-100 dark:bg-white/[0.02] rounded" style={{ width: `${75 + Math.random() * 25}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-[#fafafa] dark:bg-[#0a0a0c]">
      <article className="max-w-3xl mx-auto px-4 md:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 mb-6 text-[12px] text-slate-400">
          <Link to="/" className="hover:text-brand-blue transition-colors">{t('blog.title')}</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${post.category}`} className="hover:text-brand-blue transition-colors">{post.category}</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 dark:text-gray-300 truncate max-w-[200px]">{title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          {title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-[12px] text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue"><User size={13} /></div>
            )}
            <span className="font-medium text-slate-700 dark:text-gray-200">{post.author?.name || 'Skyverses Team'}</span>
          </div>
          <span className="flex items-center gap-1"><Calendar size={12} /> {date}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime} {t('blog.min_read')}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount.toLocaleString()} {t('blog.views')}</span>
        </div>

        {/* Cover image */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-lg shadow-black/[0.04]">
          <img src={post.coverImage} alt={title} className="w-full h-auto max-h-[500px] object-cover" />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {post.tags.map(tag => (
              <Link key={tag} to={`/?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 rounded-lg text-[11px] font-medium border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/30 hover:text-brand-blue transition-all">
                <Tag size={10} className="inline mr-1" />{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose max-w-none text-[15px]" dangerouslySetInnerHTML={{ __html: content }} />

        {/* Share bar */}
        <div className="mt-10 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-brand-blue transition-colors">
            <ArrowLeft size={14} /> {t('blog.back')}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${copied ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20 hover:text-brand-blue'}`}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? t('blog.copied') : t('blog.copy_link')}
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white rounded-lg text-[12px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-sm shadow-brand-blue/20">
              <Share2 size={13} /> {t('blog.share')}
            </button>
          </div>
        </div>

        {/* Author card */}
        <div className="mt-8 p-6 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl flex items-center gap-4">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <User size={24} />
            </div>
          )}
          <div>
            <p className="text-[14px] font-bold text-slate-800 dark:text-white">{post.author?.name || 'Skyverses Team'}</p>
            <p className="text-[12px] text-slate-400 dark:text-gray-500">{post.author?.role || 'Editor'}</p>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-brand-blue" />
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">{t('blog.related')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map(p => <PostCard key={p._id} post={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPostPage;
