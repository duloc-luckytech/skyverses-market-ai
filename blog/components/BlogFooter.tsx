import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, Twitter, MessageCircle, Mail, Send, ArrowRight, BookOpen, TrendingUp, Zap, Users, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FOOTER_PLATFORM = [
  { label: 'AI Marketplace', href: 'https://ai.skyverses.com/markets' },
  { label: 'AI Models', href: 'https://ai.skyverses.com/models' },
  { label: 'Buy Credits', href: 'https://ai.skyverses.com/credits' },
  { label: 'Enterprise', href: 'https://ai.skyverses.com/booking' },
  { label: 'Referral Program', href: 'https://ai.skyverses.com/referral' },
];

const FOOTER_INSIGHTS = [
  { label: 'All Articles', to: '/' },
  { label: 'Tutorials', to: '/category/Tutorials' },
  { label: 'News & Updates', to: '/category/News' },
  { label: 'Case Studies', to: '/category/Case Study' },
  { label: 'Tips & Tricks', to: '/category/Tips' },
];

const FOOTER_CATEGORIES = [
  { icon: <BookOpen size={12} />, label: 'Tutorials', to: '/category/Tutorials', color: 'text-blue-400' },
  { icon: <Zap size={12} />, label: 'News', to: '/category/News', color: 'text-violet-400' },
  { icon: <TrendingUp size={12} />, label: 'Case Studies', to: '/category/Case Study', color: 'text-emerald-400' },
  { icon: <Users size={12} />, label: 'Community', to: '/category/Community', color: 'text-pink-400' },
];

const BlogFooter: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('success');
    setEmail('');
  };

  return (
    <footer className="bg-white dark:bg-[#080809] border-t border-black/[0.05] dark:border-white/[0.06]">

      {/* ══════════ Newsletter CTA — desktop only ══════════ */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-12">

        <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-white/[0.06] shadow-2xl">
          {/* Glow layers */}
          <div className="absolute -top-32 left-1/4 w-[500px] h-[300px] bg-brand-blue/15 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 right-1/4 w-[400px] h-[250px] bg-purple-600/10 rounded-full blur-[100px]" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          {/* Shimmer borders */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          <div className="relative z-10 px-8 md:px-16 py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="flex items-center gap-2 px-4 py-1.5 bg-brand-blue/15 border border-brand-blue/25 rounded-full text-brand-blue text-[10px] font-black tracking-[0.15em] uppercase">
                  <Sparkles size={9} fill="currentColor" /> {t('blog.newsletter_title')}
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                Stay ahead of{' '}
                <span className="bg-gradient-to-r from-brand-blue to-purple-400 bg-clip-text text-transparent">
                  the AI curve
                </span>
              </h3>
              <p className="text-slate-400 text-[15px] mb-8 leading-relaxed">
                {t('blog.newsletter_desc')} No spam. Unsubscribe anytime.
              </p>

              {status === 'success' ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Sparkles size={18} className="text-emerald-400" fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-[14px]">You're in!</p>
                    <p className="text-emerald-400 text-[12px]">Welcome to Skyverses Insights.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder={t('blog.newsletter_placeholder')}
                      className="w-full h-12 bg-white/[0.05] border border-white/[0.10] pl-10 pr-4 rounded-2xl text-[13px] text-white placeholder:text-slate-500 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
                    />
                  </div>
                  <button type="submit"
                    className="h-12 flex items-center gap-2 px-6 bg-brand-blue text-white text-[13px] font-black rounded-2xl hover:brightness-110 active:scale-[0.97] transition-all shadow-xl shadow-brand-blue/25 whitespace-nowrap">
                    <Send size={13} /> {t('blog.newsletter_btn')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ Link Grid — desktop only ══════════ */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-8 pb-4">

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-t border-black/[0.05] dark:border-white/[0.05]">

          {/* Brand col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="https://ai.skyverses.com/assets/skyverses-logo.png" alt="Skyverses" className="w-8 h-8 object-contain" />
              <div>
                <p className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight leading-none">Skyverses</p>
                <p className="text-[11px] font-bold text-brand-blue">Insights</p>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 dark:text-gray-500 leading-relaxed max-w-[200px] mb-5">
              {t('footer.description')}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <a href="https://twitter.com/skyverses" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 hover:bg-brand-blue/[0.04] transition-all">
                <Twitter size={14} />
              </a>
              <a href="https://t.me/skyverses" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 hover:bg-brand-blue/[0.04] transition-all">
                <MessageCircle size={14} />
              </a>
              <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[11px] font-bold hover:bg-brand-blue/15 transition-all">
                <ArrowRight size={12} /> Visit App
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-[10px] font-black tracking-[0.15em] text-slate-400 dark:text-gray-600 uppercase mb-4">Topics</p>
            <ul className="space-y-2.5">
              {FOOTER_CATEGORIES.map(cat => (
                <li key={cat.label}>
                  <Link to={cat.to} className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors group">
                    <span className={`${cat.color} group-hover:text-brand-blue transition-colors`}>{cat.icon}</span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Insights links */}
          <div>
            <p className="text-[10px] font-black tracking-[0.15em] text-slate-400 dark:text-gray-600 uppercase mb-4">Insights</p>
            <ul className="space-y-2.5">
              {FOOTER_INSIGHTS.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[12px] font-semibold text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform links */}
          <div>
            <p className="text-[10px] font-black tracking-[0.15em] text-slate-400 dark:text-gray-600 uppercase mb-4">Platform</p>
            <ul className="space-y-2.5">
              {FOOTER_PLATFORM.map(item => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors">
                    {item.label} <ExternalLink size={9} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5 border-t border-black/[0.05] dark:border-white/[0.05]">
          <p className="text-[11px] text-slate-400 dark:text-gray-600">{t('footer.copyright')}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
              className="text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors flex items-center gap-1">
              Skyverses AI <ExternalLink size={9} />
            </a>
            <span className="text-slate-200 dark:text-gray-800">·</span>
            <a href="https://ai.skyverses.com/booking" target="_blank" rel="noopener noreferrer"
              className="text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors">
              Contact Us
            </a>
            <span className="text-slate-200 dark:text-gray-800">·</span>
            <a href="/privacy.html"
              className="flex items-center gap-1 text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors">
              <Shield size={9} /> {t('footer.privacy')}
            </a>
            <span className="text-slate-200 dark:text-gray-800">·</span>
            <span className="text-slate-400 dark:text-gray-600">Built by Skyverses</span>
          </div>
        </div>
      </div>

      {/* ══════════ Mobile compact footer ══════════ */}
      <div className="md:hidden px-4 py-6 border-t border-black/[0.05] dark:border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          {/* Mini logo */}
          <div className="flex items-center gap-2">
            <img src="https://ai.skyverses.com/assets/skyverses-logo.png" alt="Skyverses" className="w-6 h-6 object-contain" />
            <div>
              <p className="text-[13px] font-black text-slate-900 dark:text-white leading-none">Skyverses</p>
              <p className="text-[10px] font-bold text-brand-blue">Insights</p>
            </div>
          </div>
          {/* Social icons */}
          <div className="flex items-center gap-2">
            <a href="https://twitter.com/skyverses" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all">
              <Twitter size={13} />
            </a>
            <a href="https://t.me/skyverses" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all">
              <MessageCircle size={13} />
            </a>
            <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 h-8 px-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[11px] font-bold">
              <ArrowRight size={11} /> Try AI
            </a>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 dark:text-gray-600 mb-2">
          <span>{t('footer.copyright')}</span>
          <span>·</span>
          <a href="/privacy.html" className="flex items-center gap-1 hover:text-brand-blue transition-colors">
            <Shield size={9} /> {t('footer.privacy')}
          </a>
        </div>
        {/* Spacer for bottom nav bars: 60px nav + 52px article toolbar (post page) */}
        <div className="h-[72px]" />
      </div>
    </footer>
  );
};

export default BlogFooter;
