import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, Eye, Calendar, User, Tag, Share2,
  Copy, Check, ChevronRight, Sparkles, ArrowUp, List, X,
} from 'lucide-react';

// ── Brand icons (inline SVG — lucide removed these) ──────────
const IconXTwitter = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconFacebook = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const IconLinkedIn = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { blogApi } from '../apis/blog';
import { BlogPost, Language } from '../types';
import PostCard from '../components/PostCard';

// ── Reading progress bar ──────────────────────────
const ReadingProgress: React.FC<{ contentRef: React.RefObject<HTMLElement> }> = ({ contentRef }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(100, (scrolled / total) * 100);
      setProgress(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[300] bg-slate-200/30 dark:bg-white/[0.05]">
      <div
        className="h-full bg-gradient-to-r from-brand-blue via-blue-400 to-purple-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// ── Table of Contents ─────────────────────────────
interface TocItem { id: string; text: string; level: number }

const extractToc = (html: string): TocItem[] => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const headings = div.querySelectorAll('h1, h2, h3, h4');
  return Array.from(headings).map(h => ({
    id: h.id || h.textContent!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    text: h.textContent || '',
    level: parseInt(h.tagName.slice(1)),
  }));
};

// Inject IDs into HTML headings for anchor navigation
const injectHeadingIds = (html: string): string => {
  return html.replace(/<(h[1-4])([^>]*)>(.*?)<\/h[1-4]>/gi, (_, tag, attrs, text) => {
    const plainText = text.replace(/<[^>]+>/g, '');
    const id = plainText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
  });
};

const TableOfContents: React.FC<{ items: TocItem[]; activeId: string }> = ({ items, activeId }) => {
  if (items.length < 2) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 no-scrollbar">
      <div className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <List size={13} className="text-brand-blue" />
          <p className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-wider">
            Contents
          </p>
        </div>
        <ul className="space-y-0.5">
          {items.map(item => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${activeId === item.id
                    ? 'bg-brand-blue/[0.08] text-brand-blue font-semibold'
                    : 'text-slate-500 dark:text-gray-400 hover:text-brand-blue hover:bg-brand-blue/[0.04]'
                  }`}
              >
                {item.level > 1 && <span className="text-slate-300 dark:text-gray-600 mr-1">›</span>}
                <span className="line-clamp-2">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

// ── Back to top button ────────────────────────────
const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      // On mobile: raised above bottom nav (60px) + article bar (52px) = bottom-[120px]
      // On desktop: bottom-6 as before
      className="fixed bottom-[120px] md:bottom-6 right-4 md:right-6 z-[100] w-10 h-10 md:w-11 md:h-11 bg-brand-blue text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-blue/30 hover:brightness-110 hover:scale-110 active:scale-95 transition-all"
      title="Back to top"
    >
      <ArrowUp size={16} />
    </button>
  );
};

// ── Mobile Article Toolbar (sticky) ───────────────
interface MobileArticleBarProps {
  toc: TocItem[];
  title: string;
  excerpt: string;
  onCopy: () => void;
  copied: boolean;
  onShare: () => void;
}

const MobileArticleBar: React.FC<MobileArticleBarProps> = ({ toc, title, excerpt, onCopy, copied, onShare }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tocSheetOpen, setTocSheetOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');

  return (
    <>
      {/* Sticky bottom toolbar */}
      <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-[130] bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-xl border-t border-black/[0.07] dark:border-white/[0.07] shadow-lg">
        <div className="flex items-stretch h-[52px] px-2">
          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-gray-400 active:text-brand-blue transition-colors">
            <ArrowLeft size={17} strokeWidth={2} />
            <span className="text-[8px] font-bold">{t('blog.back')}</span>
          </button>

          <div className="w-px bg-black/[0.06] dark:bg-white/[0.06] my-2" />

          {/* TOC */}
          {toc.length >= 2 && (
            <>
              <button
                onClick={() => setTocSheetOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-gray-400 active:text-brand-blue transition-colors">
                <List size={17} strokeWidth={2} />
                <span className="text-[8px] font-bold">Contents</span>
              </button>
              <div className="w-px bg-black/[0.06] dark:bg-white/[0.06] my-2" />
            </>
          )}

          {/* Copy link */}
          <button onClick={onCopy}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${copied ? 'text-emerald-500' : 'text-slate-500 dark:text-gray-400 active:text-brand-blue'}`}>
            {copied ? <Check size={17} strokeWidth={2} /> : <Copy size={17} strokeWidth={2} />}
            <span className="text-[8px] font-bold">{copied ? t('blog.copied') : t('blog.copy_link')}</span>
          </button>

          <div className="w-px bg-black/[0.06] dark:bg-white/[0.06] my-2" />

          {/* Share */}
          <button onClick={() => setShareSheetOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-gray-400 active:text-brand-blue transition-colors">
            <Share2 size={17} strokeWidth={2} />
            <span className="text-[8px] font-bold">{t('blog.share')}</span>
          </button>
        </div>
      </div>

      {/* TOC Bottom Sheet */}
      {tocSheetOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-[148] bg-black/40 backdrop-blur-sm" onClick={() => setTocSheetOpen(false)} />
          <div className="md:hidden fixed bottom-[112px] left-0 right-0 z-[149] bg-white dark:bg-[#0d0d12] rounded-t-3xl border-t border-l border-r border-black/[0.08] dark:border-white/[0.08] shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[65vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <List size={14} className="text-brand-blue" />
                <p className="text-[13px] font-black text-slate-800 dark:text-white">Table of Contents</p>
              </div>
              <button onClick={() => setTocSheetOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-slate-400">
                <X size={13} />
              </button>
            </div>
            <div className="overflow-y-auto px-4 pb-6">
              {toc.map(item => (
                <button key={item.id}
                  onClick={() => {
                    const el = document.getElementById(item.id);
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 130;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }
                    setTocSheetOpen(false);
                  }}
                  style={{ paddingLeft: `${(item.level - 1) * 14}px` }}
                  className="w-full text-left py-2.5 px-3 my-0.5 rounded-xl text-[13px] text-slate-600 dark:text-gray-300 hover:text-brand-blue hover:bg-brand-blue/[0.04] transition-all">
                  {item.level > 1 && <span className="text-slate-300 dark:text-gray-600 mr-1.5">›</span>}
                  <span className="line-clamp-2">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Share Bottom Sheet */}
      {shareSheetOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-[148] bg-black/40 backdrop-blur-sm" onClick={() => setShareSheetOpen(false)} />
          <div className="md:hidden fixed bottom-[112px] left-0 right-0 z-[149] bg-white dark:bg-[#0d0d12] rounded-t-3xl border-t border-l border-r border-black/[0.08] dark:border-white/[0.08] shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-white/[0.12]" />
            </div>
            <div className="px-5 pt-2 pb-8">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase mb-4">Share Article</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={shareLinkedIn}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 hover:bg-[#0A66C2] hover:text-white rounded-xl text-[12px] font-bold transition-all">
                  <IconLinkedIn size={13} /> LinkedIn
                </button>
                <button onClick={shareTwitter}
                  className="flex items-center justify-center gap-2 p-3.5 bg-black/[0.06] dark:bg-white/[0.06] text-slate-700 dark:text-white border border-black/[0.08] dark:border-white/[0.08] rounded-2xl text-[13px] font-bold">
                  <IconXTwitter size={15} /> Twitter (X)
                </button>
                <button onClick={shareFacebook}
                  className="flex items-center justify-center gap-2 p-3.5 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 rounded-2xl text-[13px] font-bold">
                  <IconFacebook size={15} /> Facebook
                </button>
                <button onClick={() => { onCopy(); setShareSheetOpen(false); }}
                  className={`col-span-2 flex items-center justify-center gap-2 p-3.5 rounded-2xl text-[13px] font-bold border transition-all ${
                    copied ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-gray-200 border-black/[0.06] dark:border-white/[0.06]'
                  }`}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? t('blog.copied') : t('blog.copy_link')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

// ── Main page component ───────────────────────────
const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const currentLang = lang as Language;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');
  const [tocOpen, setTocOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      setCoverLoaded(false);
      try {
        const res = await blogApi.getPost(slug);
        if (res?.success && res.data) {
          setPost(res.data);
          if (res.data.category) {
            const relRes = await blogApi.getPosts({ category: res.data.category, limit: 4, lang: currentLang });
            if (relRes?.data) setRelated(relRes.data.filter(p => p.slug !== slug).slice(0, 3));
          }
        } else {
          navigate('/', { replace: true });
        }
      } catch {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug, currentLang]);

  // Track active heading
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveHeading(e.target.id); });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    contentRef.current.querySelectorAll('h1, h2, h3, h4').forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [post]);

  const title = post?.title[currentLang] || post?.title.en || '';
  const rawContent = post?.content[currentLang] || post?.content.en || '';
  const content = useMemo(() => injectHeadingIds(rawContent), [rawContent]);
  const excerpt = post?.excerpt[currentLang] || post?.excerpt.en || '';
  const metaTitle = post?.seo?.metaTitle?.[currentLang] || post?.seo?.metaTitle?.en || title;
  const metaDesc = post?.seo?.metaDescription?.[currentLang] || post?.seo?.metaDescription?.en || excerpt;

  const toc = useMemo(() => (content ? extractToc(content) : []), [content]);

  usePageMeta({
    title: metaTitle ? `${metaTitle} — Skyverses Insights` : 'Skyverses Insights',
    description: metaDesc,
    keywords: post?.seo?.keywords?.join(', ') || post?.tags?.join(', '),
    ogImage: post?.seo?.ogImage?.trim() || post?.coverImage?.trim() || undefined,
    canonical: `/${slug}`,
    type: 'article',
    lang: currentLang,
    jsonLd: post ? {
      '@type': 'Article',
      headline: title,
      description: excerpt,
      image: post.seo?.ogImage?.trim() || post.coverImage,
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
    if (navigator.share) navigator.share({ title, text: excerpt, url: window.location.href }).catch(() => {});
    else handleCopyLink();
  };

  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');

  // ── Loading skeleton ───────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080809]">
        {/* ── Hero skeleton ── */}
        <div className="relative w-full h-[55vh] min-h-[360px] max-h-[600px] overflow-hidden bg-slate-900 dark:bg-[#0d0d14]">
          <div className="skeleton absolute inset-0 w-full h-full !rounded-none opacity-60" />
          {/* gradient overlay same as real page */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          {/* Breadcrumb skeleton */}
          <div className="absolute top-24 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="skeleton h-3 w-14 rounded-full opacity-50" />
              <div className="skeleton h-3 w-3 rounded-full opacity-30" />
              <div className="skeleton h-3 w-20 rounded-full opacity-50" />
              <div className="skeleton h-3 w-3 rounded-full opacity-30" />
              <div className="skeleton h-3 w-32 rounded-full opacity-40" />
            </div>
          </div>

          {/* Title area bottom */}
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8 pb-8">
            {/* Category badge */}
            <div className="flex gap-2 mb-4">
              <div className="skeleton h-6 w-20 rounded-full opacity-70" />
            </div>
            {/* Title lines */}
            <div className="skeleton h-9 md:h-12 w-4/5 rounded-xl mb-3 opacity-60" />
            <div className="skeleton h-9 md:h-12 w-3/5 rounded-xl mb-4 opacity-50" />
            {/* Excerpt */}
            <div className="skeleton h-4 w-2/3 rounded-lg mb-2 opacity-40" />
            <div className="skeleton h-4 w-1/2 rounded-lg opacity-30" />
          </div>
        </div>

        {/* ── Content area skeleton ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex gap-12">

            {/* ── Left: article skeleton ── */}
            <div className="flex-1 min-w-0">
              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-black/[0.06] dark:border-white/[0.06]">
                {/* Author avatar + name */}
                <div className="flex items-center gap-2.5">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-3 w-24 rounded-full" />
                    <div className="skeleton h-2.5 w-14 rounded-full" />
                  </div>
                </div>
                <div className="skeleton h-3 w-28 rounded-full" />
                <div className="skeleton h-3 w-20 rounded-full" />
                <div className="skeleton h-3 w-16 rounded-full" />
              </div>

              {/* Tags row */}
              <div className="flex gap-2 mb-8">
                {[44, 56, 36, 48].map((w, i) => (
                  <div key={i} className="skeleton h-6 rounded-full" style={{ width: `${w}px`, animationDelay: `${i * 80}ms` }} />
                ))}
              </div>

              {/* Content lines — vary widths for realistic look */}
              <div className="space-y-3">
                {/* H2 heading */}
                <div className="skeleton h-6 w-2/5 rounded-lg mb-5" style={{ animationDelay: '60ms' }} />
                {[100, 90, 95, 80, 85, 100, 75, 92].map((pct, i) => (
                  <div key={i} className="skeleton h-3.5 rounded" style={{ width: `${pct}%`, animationDelay: `${i * 40}ms` }} />
                ))}
                {/* Paragraph break */}
                <div className="h-4" />
                {/* H3 heading */}
                <div className="skeleton h-5 w-1/3 rounded-lg mb-4" style={{ animationDelay: '100ms' }} />
                {[88, 100, 93, 70, 97, 84].map((pct, i) => (
                  <div key={i} className="skeleton h-3.5 rounded" style={{ width: `${pct}%`, animationDelay: `${(i + 8) * 40}ms` }} />
                ))}
                {/* Paragraph break */}
                <div className="h-4" />
                {/* Blockquote-style */}
                <div className="skeleton h-16 w-full rounded-xl mb-4" style={{ animationDelay: '200ms' }} />
                {/* More lines */}
                {[95, 78, 100, 86, 60].map((pct, i) => (
                  <div key={i} className="skeleton h-3.5 rounded" style={{ width: `${pct}%`, animationDelay: `${(i + 14) * 40}ms` }} />
                ))}
              </div>

              {/* Extra padding mobile */}
              <div className="md:hidden h-[120px]" />
            </div>

            {/* ── Right: TOC sidebar skeleton ── */}
            <aside className="hidden lg:block w-[240px] xl:w-[280px] shrink-0">
              <div className="sticky top-20">
                <div className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4">
                  {/* TOC header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="skeleton w-3 h-3 rounded" />
                    <div className="skeleton h-2.5 w-16 rounded-full" />
                  </div>
                  {/* TOC items */}
                  <div className="space-y-2">
                    {[70, 55, 65, 48, 72, 52, 60, 44].map((pct, i) => (
                      <div key={i} className="skeleton h-3 rounded-lg"
                        style={{ width: `${pct}%`, marginLeft: i % 3 !== 0 ? '12px' : '0', animationDelay: `${i * 60}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── Related posts skeleton ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
          <div className="pt-10 border-t border-black/[0.06] dark:border-white/[0.06]">
            {/* Section title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="skeleton w-1 h-6 rounded-full" />
              <div className="skeleton h-5 w-36 rounded-xl" />
            </div>
            {/* 3-col grid desktop */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {[0, 1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="skeleton h-[200px] !rounded-none" style={{ animationDelay: `${i * 80}ms` }} />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-4 w-16 rounded-full" />
                    <div className="skeleton h-5 w-4/5 rounded-lg" />
                    <div className="skeleton h-3.5 w-full rounded" />
                    <div className="skeleton h-3.5 w-3/4 rounded" />
                    <div className="skeleton h-3 w-24 rounded-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile horizontal scroll */}
            <div className="flex md:hidden gap-3 overflow-x-auto no-scrollbar pb-2">
              {[0, 1].map(i => (
                <div key={i} className="shrink-0 w-[78vw] bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="skeleton h-[160px] !rounded-none" />
                  <div className="p-4 space-y-2.5">
                    <div className="skeleton h-3.5 w-14 rounded-full" />
                    <div className="skeleton h-5 w-4/5 rounded-lg" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080809]">
      <ReadingProgress contentRef={contentRef as React.RefObject<HTMLElement>} />
      <BackToTop />
      {/* Mobile article toolbar (above bottom nav) */}
      <MobileArticleBar
        toc={toc}
        title={title}
        excerpt={excerpt}
        onCopy={handleCopyLink}
        copied={copied}
        onShare={handleShare}
      />


      {/* ── Hero cover image ───────────────────── */}
      <div className="relative w-full h-[55vh] min-h-[360px] max-h-[600px] overflow-hidden bg-slate-900">
        <img
          src={post.coverImage}
          alt={title}
          onLoad={() => setCoverLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover opacity-80 img-blur${coverLoaded ? ' loaded' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Category + breadcrumb */}
        <div className="absolute top-24 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-1.5 text-[12px] text-white/60 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Insights</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${post.category}`} className="hover:text-white transition-colors">{post.category}</Link>
            <ChevronRight size={12} />
            <span className="text-white/80 truncate max-w-[200px]">{title}</span>
          </nav>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-brand-blue text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg shadow-brand-blue/30">
              {post.category}
            </span>
            {post.isFeatured && (
              <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/80 text-white text-[10px] font-black rounded-full">
                <Sparkles size={9} fill="currentColor" /> Featured
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] max-w-4xl mb-4">
            {title}
          </h1>
          <p className="text-[15px] text-white/60 max-w-2xl line-clamp-2">{excerpt}</p>
        </div>
      </div>

      {/* ── Content area ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex gap-12">

          {/* ── Left: main article ────────────── */}
          <article className="flex-1 min-w-0">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-black/[0.06] dark:border-white/[0.06]">
              {/* Author */}
              <div className="flex items-center gap-2.5">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-black/[0.06] dark:ring-white/[0.08]" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <User size={16} className="text-brand-blue" />
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-white">{post.author?.name || 'Skyverses Team'}</p>
                  <p className="text-[11px] text-slate-400">{post.author?.role || 'Editor'}</p>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.08] hidden sm:block" />
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-gray-400">
                <Calendar size={13} /> {date}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-gray-400">
                <Clock size={13} /> {post.readTime} {t('blog.min_read')}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-gray-400">
                <Eye size={13} /> {post.viewCount.toLocaleString()} {t('blog.views')}
              </span>
            </div>

            {/* Mobile TOC — handled by MobileArticleBar bottom sheet */}
            {/* Desktop MD TOC inline toggle for lg breakpoint */}
            {toc.length >= 2 && (
              <div className="hidden md:block lg:hidden mb-6">
                <button onClick={() => setTocOpen(!tocOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl text-[12px] font-bold text-slate-700 dark:text-white">
                  <span className="flex items-center gap-2"><List size={14} className="text-brand-blue" /> Table of Contents</span>
                  <ChevronRight size={14} className={`text-slate-400 transition-transform ${tocOpen ? 'rotate-90' : ''}`} />
                </button>
                {tocOpen && (
                  <div className="mt-2 bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4">
                    {toc.map(item => (
                      <button key={item.id}
                        onClick={() => { const el = document.getElementById(item.id); el?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTocOpen(false); }}
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                        className="w-full text-left py-1.5 text-[12px] text-slate-500 hover:text-brand-blue transition-colors">
                        {item.level > 1 && '› '}{item.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(tag => (
                  <Link key={tag} to={`/?q=${encodeURIComponent(tag)}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-gray-400 rounded-full text-[11px] font-semibold border border-black/[0.05] dark:border-white/[0.05] hover:border-brand-blue/30 hover:text-brand-blue transition-all">
                    <Tag size={10} />{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Main content */}
            <div
              ref={contentRef}
              className="prose max-w-none text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* ── Share bar — desktop only (mobile uses bottom sheet) ── */}
            <div className="hidden md:block mt-12 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4">Share this article</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={shareTwitter}
                  className="flex items-center gap-2 px-4 py-2 bg-black/[0.06] dark:bg-white/[0.06] text-slate-700 dark:text-white border border-black/[0.08] dark:border-white/[0.08] hover:bg-black hover:text-white rounded-xl text-[12px] font-bold transition-all">
                  <IconXTwitter size={13} /> Twitter (X)
                </button>
                <button onClick={shareFacebook}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 hover:bg-[#1877F2] hover:text-white rounded-xl text-[12px] font-bold transition-all">
                  <IconFacebook size={13} /> Facebook
                </button>
                <button onClick={shareLinkedIn}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 hover:bg-[#0A66C2] hover:text-white rounded-xl text-[12px] font-bold transition-all">
                  <IconLinkedIn size={13} /> LinkedIn
                </button>
                <button onClick={handleCopyLink}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${copied
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-gray-300 border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t('blog.copied') : t('blog.copy_link')}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-[12px] font-bold hover:brightness-110 active:scale-[0.97] transition-all shadow-md shadow-brand-blue/20">
                  <Share2 size={13} /> {t('blog.share')}
                </button>
              </div>
            </div>


            {/* ── Author card ── */}
            <div className="mt-8 p-5 bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl flex items-center gap-4">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-black/[0.04] dark:ring-white/[0.05]" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <User size={26} className="text-brand-blue" />
                </div>
              )}
              <div>
                <p className="text-[14px] font-bold text-slate-900 dark:text-white">{post.author?.name || 'Skyverses Team'}</p>
                <p className="text-[12px] text-slate-400 mb-1">{post.author?.role || 'Editor'}</p>
                <p className="text-[12px] text-slate-500 dark:text-gray-400">AI content creator at Skyverses Insights</p>
              </div>
            </div>

            {/* ── Back nav — desktop only (mobile uses toolbar) ── */}
            <div className="hidden md:flex mt-8 items-center justify-between">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors">
                <ArrowLeft size={15} /> {t('blog.back')}
              </button>
            </div>

            {/* Extra padding on mobile for double nav bars */}
            <div className="md:hidden h-[120px]" />
          </article>


          {/* ── Right: TOC sidebar ──────────────── */}
          <aside className="hidden lg:block w-[240px] xl:w-[280px] shrink-0">
            <TableOfContents items={toc} activeId={activeHeading} />
          </aside>
        </div>
      </div>

      {/* ── Related posts ──────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="pt-10 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-brand-blue to-purple-500 rounded-full" />
              <h2 className="text-[18px] font-black text-slate-900 dark:text-white">{t('blog.related')}</h2>
            </div>
            {/* Desktop: 3-col grid / Mobile: horizontal scroll */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {related.map(p => <PostCard key={p._id} post={p} size="normal" />)}
            </div>
            <div className="flex md:hidden gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
              {related.map(p => (
                <div key={p._id} className="snap-start shrink-0 w-[78vw]">
                  <PostCard post={p} size="normal" />
                </div>
              ))}
            </div>
          </div>

        </section>
      )}
    </div>
  );
};

export default BlogPostPage;
