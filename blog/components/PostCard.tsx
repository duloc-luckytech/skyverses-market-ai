import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, ArrowUpRight, Sparkles, User, Tag, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost, Language } from '../types';

// Category accent colors
const CATEGORY_COLORS: Record<string, string> = {
  'Tutorials': 'from-blue-500 to-cyan-400',
  'News': 'from-violet-500 to-purple-400',
  'Tips': 'from-amber-500 to-yellow-400',
  'Case Study': 'from-emerald-500 to-teal-400',
  'Community': 'from-pink-500 to-rose-400',
};
const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat] || 'from-brand-blue to-blue-400';

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

  // ─────── HERO card (full-width editorial) ───────
  if (size === 'hero') {
    return (
      <article
        onClick={() => navigate(`/${post.slug}`)}
        className="group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-900 h-[520px] md:h-[600px] shadow-2xl shadow-black/20"
      >
        <img src={post.coverImage} alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-[1.03] transition-all duration-700" />

        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Featured badge */}
        {post.isFeatured && (
          <div className="absolute top-6 right-6">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${categoryGradient} text-white text-[11px] font-black tracking-wide rounded-full shadow-lg`}>
              <Sparkles size={10} fill="currentColor" /> FEATURED
            </span>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          {/* Category + read time */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-[11px] font-black tracking-widest uppercase text-white rounded-full bg-gradient-to-r ${categoryGradient} shadow-lg`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-white/60 text-[12px]">
              <Clock size={11} /> {post.readTime} min read
            </span>
            <span className="flex items-center gap-1 text-white/60 text-[12px]">
              <Eye size={11} /> {post.viewCount.toLocaleString()}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-4 group-hover:text-brand-blue transition-colors duration-300 max-w-3xl">
            {title}
          </h2>
          <p className="text-[15px] text-white/60 line-clamp-2 max-w-2xl mb-6 leading-relaxed">
            {excerpt}
          </p>

          {/* Author + Read CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center">
                  <User size={15} className="text-brand-blue" />
                </div>
              )}
              <div>
                <p className="text-[13px] font-bold text-white">{post.author?.name || 'Skyverses Team'}</p>
                <p className="text-[11px] text-white/50">{date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold text-[13px] rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              {t('blog.read_more')} <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─────── FEATURED card (medium, image+text) ───────
  if (size === 'featured') {
    return (
      <article
        onClick={() => navigate(`/${post.slug}`)}
        className="group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-900 h-[280px] shadow-xl shadow-black/10"
      >
        <img src={post.coverImage} alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-[1.04] transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className={`inline-block px-2.5 py-1 text-[9px] font-black tracking-widest uppercase text-white rounded-full bg-gradient-to-r ${categoryGradient} mb-3 shadow`}>
            {post.category}
          </span>
          <h3 className="text-[16px] font-bold text-white leading-tight line-clamp-2 group-hover:text-brand-blue transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-white/50">
            <Clock size={10} /> {post.readTime}m · <Eye size={10} /> {post.viewCount}
          </div>
        </div>
      </article>
    );
  }

  // ─────── COMPACT card (horizontal list item) ───────
  if (size === 'compact') {
    return (
      <article
        onClick={() => navigate(`/${post.slug}`)}
        className="group flex gap-4 items-start cursor-pointer p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all"
      >
        <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-white/[0.04]">
          <img src={post.coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${categoryGradient} mb-1.5`}>
            {post.category}
          </span>
          <h4 className="text-[13px] font-bold text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
            <Clock size={9} /> {post.readTime}m · {date}
          </div>
        </div>
      </article>
    );
  }

  // ─────── NORMAL card (default grid card) ───────
  return (
    <article
      onClick={() => navigate(`/${post.slug}`)}
      className="group relative bg-white dark:bg-[#0f0f17] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-brand-blue/25 hover:shadow-2xl hover:shadow-brand-blue/[0.08] hover:-translate-y-1 flex flex-col"
    >
      {/* Top accent */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${categoryGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Cover */}
      <div className="relative h-[210px] overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
        <img src={post.coverImage} alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category pill */}
        <div className="absolute top-3.5 left-3.5 flex gap-2">
          <span className={`px-2.5 py-1 text-[9px] font-black tracking-widest uppercase text-white rounded-full bg-gradient-to-r ${categoryGradient} shadow-md`}>
            {post.category}
          </span>
          {post.isFeatured && (
            <span className="px-2 py-1 text-[9px] font-black gap-1 flex items-center text-amber-300 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full">
              <Sparkles size={8} fill="currentColor" /> TOP
            </span>
          )}
        </div>

        {/* Read overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white font-bold text-[12px] rounded-2xl shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <BookOpen size={13} /> {t('blog.read_more')}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Tags */}
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
          {/* Author */}
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

          {/* Stats */}
          <div className="flex items-center gap-3 text-[10.5px] text-slate-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}m</span>
            <span className="flex items-center gap-1">
              <Eye size={10} />
              {post.viewCount > 999 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
