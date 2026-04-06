import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost, Language } from '../types';

const PostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const currentLang = lang as Language;

  const title = post.title[currentLang] || post.title.en;
  const excerpt = post.excerpt[currentLang] || post.excerpt.en;
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return (
    <article
      onClick={() => navigate(`/${post.slug}`)}
      className="group bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden cursor-pointer hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-lg hover:shadow-brand-blue/[0.03] transition-all flex flex-col"
    >
      {/* Cover */}
      <div className="relative h-[200px] overflow-hidden">
        <img src={post.coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {post.isFeatured && (
            <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-lg flex items-center gap-1">
              <Sparkles size={9} fill="currentColor" /> {t('blog.featured')}
            </span>
          )}
          <span className="px-2 py-1 bg-brand-blue/90 backdrop-blur-sm text-white text-[9px] font-bold rounded-lg uppercase">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-[16px] font-bold text-slate-800 dark:text-white group-hover:text-brand-blue transition-colors line-clamp-2 mb-2">
          {title}
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-gray-500">
            <span>{date}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime} {t('blog.min_read')}</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {post.viewCount}</span>
          </div>
          <span className="flex items-center gap-1 text-[12px] font-medium text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
            {t('blog.read_more')} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
