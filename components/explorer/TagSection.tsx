import React from 'react';
import { Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TagSectionProps {
  tags?: string[];
  categories?: string[];
}

const TagSection: React.FC<TagSectionProps> = ({ tags, categories }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 pt-2">
       <div className="flex items-center gap-3 px-1">
          <Tag size={14} className="text-brand-blue" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-gray-500">{t('explorer.modal.tags')}</h4>
       </div>
       <div className="flex flex-wrap gap-2">
          {categories?.map(cat => (
            <span key={cat} className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-md text-[9px] font-black uppercase tracking-widest border border-brand-blue/20">
              {cat}
            </span>
          ))}
          {tags?.map(tag => (
            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 rounded-md text-[9px] font-bold uppercase tracking-widest border border-black/5 dark:border-white/10">
              #{tag}
            </span>
          ))}
          {(!tags || tags.length === 0) && (!categories || categories.length === 0) && (
            <span className="text-[10px] text-slate-400 italic">Không có nhãn dữ liệu</span>
          )}
       </div>
    </div>
  );
};

export default TagSection;