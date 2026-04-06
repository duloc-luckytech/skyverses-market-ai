import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BlogFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-[#0a0a0c] border-t border-black/[0.04] dark:border-white/[0.04]">
      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="relative bg-gradient-to-br from-brand-blue/[0.06] to-purple-500/[0.04] border border-brand-blue/10 rounded-2xl p-8 text-center overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-blue/[0.08] rounded-full blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-500/[0.06] rounded-full blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('blog.newsletter_title')}</h3>
            <p className="text-[13px] text-slate-500 dark:text-gray-400 mb-4 max-w-md mx-auto">{t('blog.newsletter_desc')}</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder={t('blog.newsletter_placeholder')}
                className="flex-1 bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] px-4 py-2.5 rounded-xl text-[13px] outline-none focus:border-brand-blue transition-colors" />
              <button className="px-5 py-2.5 bg-brand-blue text-white text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand-blue/20">
                {t('blog.newsletter_btn')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-blue rounded-lg flex items-center justify-center text-white">
              <BookOpen size={13} />
            </div>
            <span className="text-[12px] text-slate-400 dark:text-gray-500">{t('footer.copyright')}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-gray-500 hover:text-brand-blue transition-colors">
              Skyverses AI <ExternalLink size={10} />
            </a>
            <a href="https://ai.skyverses.com/booking" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-gray-500 hover:text-brand-blue transition-colors">
              Contact <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
