import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, ArrowUpRight, Sparkles, User, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost, Language } from '../types';

// ─── Blur-up hook — image fades in sharp once loaded ───
const useBlurUp = () => {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);
  return { ref, loaded, onLoad: () => setLoaded(true) };
};

// Category accent colors
const CATEGORY_COLORS: Record<string, string> = {
  'Tutorials': 'from-blue-500 to-cyan-400',
  'News': 'from-violet-500 to-purple-400',
  'Tips': 'from-amber-500 to-yellow-400',
  'Case Study': 'from-emerald-500 to-teal-400',
  'Community': 'from-pink-500 to-rose-400',
};
const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat] || 'from-brand-blue to-blue-400';

const CATEGORY_BG: Record<string, string> = {
  'Tutorials': 'bg-blue-500/90',
  'News': 'bg-violet-500/90',
  'Tips': 'bg-amber-500/90',
  'Case Study': 'bg-emerald-500/90',
  'Community': 'bg-pink-500/90',
};
const getCategoryBg = (cat: string) => CATEGORY_BG[cat] || 'bg-brand-blue/90';

type CardSize = 'hero' | 'featured' | 'normal' | 'compact';

interface PostCardProps {
  post: BlogPost;
  size?: CardSize;
}

const PostCard: React.FC<PostCardProps> = ({ post, size = 'normal' }) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const currentLang = lang as Language;

  const title = post.title[currentLang] || post.title.en;
  const excerpt = post.excerpt[currentLang] || post.excerpt.en;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(
        lang === 'vi' ? 'vi-VN' : lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      )
    : '';

  const categoryGradient = getCategoryColor(post.category);
  const categoryBg = getCategoryBg(post.category);

  // ─────── HERO card — Apple Newsroom style (full editorial) ───────
  if (size === 'hero') {
    const img = useBlurUp();
    return (
      <article
        onClick={() => navigate(`/${post.slug}`)}
        className="group relative rounded-2xl lg:rounded-3xl overflow-hidden cursor-pointer bg-slate-900 h-[340px] sm:h-[420px] lg:h-full lg:min-h-[560px] shadow-2xl shadow-black/20"
      >
        {/* Cover image */}
        <img
          ref={img.ref}
          src={post.coverImage}
          alt={title}
          onLoad={img.onLoad}
          className={`absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-700 img-blur${img.loaded ? ' loaded' : ''}`}
        />

        {/* Gradient layers — Apple-style: very clean bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        {/* Top shimmer border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* Featured badge */}
        {post.isFeatured && (
          <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 ${categoryBg} backdrop-blur-md text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg`}>
              <Sparkles size={9} fill="currentColor" /> FEATURED
            </span>
          </div>
        )}

        {/* Content — bottom anchored */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          {/* Category + meta */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase text-white rounded-full bg-gradient-to-r ${categoryGradient} shadow-lg`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-white/50 text-[11px]">
              <Clock size={10} /> {post.readTime} min
            </span>
            <span className="flex items-center gap-1 text-white/50 text-[11px]">
              <Eye size={10} /> {post.viewCount.toLocaleString()}
            </span>
          </div>

          {/* Title — Apple Newsroom large editorial */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-[1.1] tracking-tight mb-3 group-hover:text-blue-200 transition-colors duration-300 max-w-2xl">
            {title}
          </h2>

          {/* Excerpt — hidden on small screens */}
          <p className="hidden sm:block text-[13px] lg:text-[15px] text-white/55 line-clamp-2 max-w-xl mb-5 leading-relaxed">
            {excerpt}
          </p>

          {/* Author + CTA row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover ring-2 ring-white/25" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <User size={13} className="text-white/70" />
                </div>
              )}
              <div>
                <p className="text-[12px] font-bold text-white leading-none">{post.author?.name || 'Skyverses Team'}</p>
                <p className="text-[10px] text-white/45 mt-0.5">{date}</p>
              </div>
            </div>
            {/* Apple-style read CTA: appears on hover */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-900 font-bold text-[12px] rounded-full shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              {t('blog.read_more')} <ArrowUpRight size={13} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─────── FEATURED card — Apple-style medium, clean overlay ───────
  if (size === 'featured') {
    const img = useBlurUp();
    return (
      <article
        onClick={() => navigate(`/${post.slug}`)}
        className="group relative rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer bg-slate-900 h-full min-h-[160px] shadow-lg shadow-black/10"
      >
        <img ref={img.ref} src={post.coverImage} alt={title} onLoad={img.onLoad}
          className={`absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-[1.04] transition-all duration-500 img-blur${img.loaded ? ' loaded' : ''}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className={`inline-block px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-white rounded-full bg-gradient-to-r ${categoryGradient} mb-2 shadow`}>
            {post.category}
          </span>
          <h3 className="text-[13px] lg:text-[15px] font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/45">
            <Clock size={9} /> {post.readTime}m · <Eye size={9} /> {post.viewCount}
            {date && <span>· {date}</span>}
          </div>
        </div>
      </article>
    );
  }

  // ─────── COMPACT card — horizontal list (Apple Newsroom sidebar style) ───────
  if (size === 'compact') {
    const img = useBlurUp();
    return (
      <article
        onClick={() => navigate(`/${post.slug}`)}
        className="group flex gap-3 items-start cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all"
      >
        <div className="w-[72px] h-[60px] lg:w-[80px] lg:h-[64px] rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-white/[0.04]">
          <img ref={img.ref} src={post.coverImage} alt={title} onLoad={img.onLoad}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 img-blur${img.loaded ? ' loaded' : ''}`} />
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <span className={`inline-block text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${categoryGradient} mb-1.5`}>
            {post.category}
          </span>
          <h4 className="text-[12px] font-bold text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
            <Clock size={8} /> {post.readTime}m · {date}
          </div>
        </div>
      </article>
    );
  }

  // ─────── NORMAL card — grid card (horizontal on mobile, vertical on desktop) ───────
  const imgMobile = useBlurUp();
  const imgDesktop = useBlurUp();
  return (
    <article
      onClick={() => navigate(`/${post.slug}`)}
      className="group relative bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-brand-blue/25 hover:shadow-2xl hover:shadow-brand-blue/[0.08] hover:-translate-y-1 flex flex-col"
    >
      {/* Top accent line on hover */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${categoryGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* ── MOBILE: Horizontal layout ── */}
      <div className="flex md:hidden gap-3 p-3">
        {/* Thumbnail */}
          <div className="relative w-[90px] h-[76px] rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-white/[0.04]">
            <img ref={imgMobile.ref} src={post.coverImage} alt={title} onLoad={imgMobile.onLoad}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 img-blur${imgMobile.loaded ? ' loaded' : ''}`}
              loading="lazy"
            />
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${categoryGradient}`} />
          </div>
        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <span className={`inline-block px-2 py-0.5 text-[8px] font-black tracking-widest uppercase text-white rounded-full bg-gradient-to-r ${categoryGradient} mb-1.5`}>
            {post.category}
          </span>
          <h2 className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
            {title}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 line-clamp-1 mt-0.5 leading-relaxed">
            {excerpt}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
            <Clock size={9} />{post.readTime}m
            <Eye size={9} />{post.viewCount > 999 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}
            <span className="text-slate-300 dark:text-white/10">·</span>
            <span>{date}</span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Vertical card layout ── */}
      <div className="hidden md:flex flex-col flex-1">
        {/* Cover */}
        <div className="relative h-[200px] overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
          <img ref={imgDesktop.ref} src={post.coverImage} alt={title} onLoad={imgDesktop.onLoad}
            className={`w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 img-blur${imgDesktop.loaded ? ' loaded' : ''}`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Category pill */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 text-[9px] font-black tracking-widest uppercase text-white rounded-full bg-gradient-to-r ${categoryGradient} shadow-md`}>
              {post.category}
            </span>
            {post.isFeatured && (
              <span className="px-2 py-1 text-[9px] font-black gap-1 flex items-center text-amber-300 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full">
                <Sparkles size={8} fill="currentColor" /> TOP
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 flex flex-col">
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-gray-500 bg-slate-50 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] rounded-md">
                  <Tag size={8} />{tag}
                </span>
              ))}
            </div>
          )}

          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-brand-blue transition-colors duration-200">
            {title}
          </h2>
          <p className="text-[12.5px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
            {excerpt}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-3.5 border-t border-black/[0.05] dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              {post.author?.avatar ? (
                <img src={post.author.avatar} className="w-6 h-6 rounded-full object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.08]" alt={post.author.name} />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <User size={11} className="text-brand-blue" />
                </div>
              )}
              <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 truncate max-w-[90px]">
                {post.author?.name?.split(' ')[0] || 'Skyverses'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10.5px] text-slate-400 dark:text-gray-500">
              {date && <span>{date}</span>}
              <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}m</span>
              <span className="flex items-center gap-1">
                <Eye size={10} />
                {post.viewCount > 999 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
