import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, ArrowRight, Sparkles, User, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost, Language } from '../types';

const PostCard: React.FC<{ post: BlogPost; featured?: boolean }> = ({ post, featured = false }) => {
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

  return (
    <article
      onClick={() => navigate(`/${post.slug}`)}
      className={`group relative bg-white dark:bg-[#111114] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
        hover:border-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/[0.06] hover:-translate-y-0.5 flex flex-col`}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-blue/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Cover */}
      <div className="relative overflow-hidden" style={{ height: featured ? '240px' : '200px' }}>
        <img
          src={post.coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
          loading="lazy"
        />
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {post.isFeatured && (
            <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-lg flex items-center gap-1 shadow-lg shadow-amber-500/30">
              <Sparkles size={8} fill="currentColor" /> {t('blog.featured')}
            </span>
          )}
          <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-bold rounded-lg uppercase tracking-wide border border-white/10">
            {post.category}
          </span>
        </div>

        {/* Read more overlay on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-blue text-white text-[11px] font-semibold rounded-lg shadow-lg shadow-brand-blue/30">
            {t('blog.read_more')} <ArrowRight size={11} />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2.5">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 bg-slate-50 dark:bg-white/[0.04] text-slate-400 dark:text-gray-500 rounded-md text-[10px] font-medium border border-black/[0.04] dark:border-white/[0.04]">
                <Tag size={8} />{tag}
              </span>
            ))}
          </div>
        )}

        <h2 className={`font-bold text-slate-800 dark:text-white group-hover:text-brand-blue transition-colors line-clamp-2 mb-2 ${featured ? 'text-[18px]' : 'text-[15px]'}`}>
          {title}
        </h2>
        <p className="text-[12.5px] text-slate-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author?.avatar ? (
              <img src={post.author.avatar} className="w-6 h-6 rounded-full object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.06]" alt={post.author.name} />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <User size={11} className="text-brand-blue" />
              </div>
            )}
            <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400 truncate max-w-[80px]">
              {post.author?.name?.split(' ')[0] || 'Skyverses'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2.5 text-[10.5px] text-slate-400 dark:text-gray-500">
            <span className="flex items-center gap-0.5"><Clock size={10} /> {post.readTime}m</span>
            <span className="flex items-center gap-0.5"><Eye size={10} /> {post.viewCount > 999 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}</span>
            {date && <span className="hidden sm:block">{date}</span>}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
