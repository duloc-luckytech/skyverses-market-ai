import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface TagSectionProps {
  tags?: string[];
  categories?: string[];
}

const TagSection: React.FC<TagSectionProps> = ({ tags, categories }) => {
  const { t } = useLanguage();
  
  const hasContent = (tags && tags.length > 0) || (categories && categories.length > 0);
  if (!hasContent) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-slate-400 dark:text-gray-500 px-1">{t('explorer.modal.tags')}</h4>
      <div className="flex flex-wrap gap-1.5">
        {categories?.map(cat => (
          <span key={cat} className="px-2.5 py-1 bg-brand-blue/[0.06] text-brand-blue rounded-lg text-[11px] font-medium border border-brand-blue/10">
            {cat}
          </span>
        ))}
        {tags?.map(tag => (
          <span key={tag} className="px-2.5 py-1 bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 rounded-lg text-[11px] font-medium border border-black/[0.04] dark:border-white/[0.04]">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagSection;