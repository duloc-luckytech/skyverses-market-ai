import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, Twitter, MessageCircle, Mail, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BlogFooter: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(''); }
  };

  const footerLinks = [
    { label: 'Marketplace', href: 'https://ai.skyverses.com/markets' },
    { label: 'AI Models', href: 'https://ai.skyverses.com/models' },
    { label: 'Pricing', href: 'https://ai.skyverses.com/credits' },
    { label: 'Enterprise', href: 'https://ai.skyverses.com/booking' },
  ];

  return (
    <footer className="bg-white dark:bg-[#08080e] border-t border-black/[0.04] dark:border-white/[0.04]">

      {/* ═══ Newsletter CTA ═══ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-10">
        <div className="relative bg-gradient-to-br from-[#0a0a1e] to-[#0d0d20] rounded-2xl p-8 md:p-12 overflow-hidden border border-brand-blue/10 shadow-2xl">
          {/* BG glow */}
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-brand-blue/20 rounded-full blur-[100px]" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative z-10 text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="px-3 py-1 bg-brand-blue/15 border border-brand-blue/25 rounded-full text-brand-blue text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles size={9} fill="currentColor" /> Newsletter
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              {t('blog.newsletter_title')}
            </h3>
            <p className="text-[14px] text-slate-400 mb-7 leading-relaxed">
              {t('blog.newsletter_desc')}
            </p>
            {submitted ? (
              <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 font-semibold text-[14px]">
                <Sparkles size={16} fill="currentColor" /> You're in! Welcome to Skyverses Insights.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder={t('blog.newsletter_placeholder')}
                    className="w-full bg-white/[0.06] border border-white/[0.10] pl-9 pr-4 py-3 rounded-xl text-[13px] text-white placeholder:text-slate-500 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
                  />
                </div>
                <button type="submit"
                  className="flex items-center gap-2 px-5 py-3 bg-brand-blue text-white text-[13px] font-bold rounded-xl hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-brand-blue/30 whitespace-nowrap">
                  <Send size={13} /> {t('blog.newsletter_btn')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Footer Grid ═══ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-t border-black/[0.04] dark:border-white/[0.04]">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <img src="https://ai.skyverses.com/assets/skyverses-logo.png" alt="Skyverses" className="w-7 h-7 object-contain" />
              <div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">Skyverses</span>
                <span className="text-sm font-extrabold text-brand-blue ml-1">Insights</span>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 dark:text-gray-500 leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
            {/* Social */}
            <div className="flex items-center gap-2 mt-4">
              <a href="https://twitter.com/skyverses" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-all">
                <Twitter size={14} />
              </a>
              <a href="https://t.me/skyverses" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-all">
                <MessageCircle size={14} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">Platform</p>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors">
                    {link.label} <ExternalLink size={10} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Insights links */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">Insights</p>
            <ul className="space-y-2">
              <li><Link to="/" className="text-[12px] text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors">All Articles</Link></li>
              <li><Link to="/category/Tutorials" className="text-[12px] text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors">Tutorials</Link></li>
              <li><Link to="/category/News" className="text-[12px] text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors">News</Link></li>
              <li><Link to="/category/Case Study" className="text-[12px] text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors">Case Studies</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-black/[0.04] dark:border-white/[0.04]">
          <p className="text-[11px] text-slate-400 dark:text-gray-600">{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors flex items-center gap-1">
              Skyverses AI <ExternalLink size={9} />
            </a>
            <span className="text-slate-300 dark:text-gray-700">·</span>
            <a href="https://ai.skyverses.com/booking" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
