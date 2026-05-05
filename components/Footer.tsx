
import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Twitter, Linkedin, Mail, Github, Facebook,
  Zap, ArrowRight, Globe2, Sparkles, MessageCircle, Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const logoUrl = "/assets/skyverses-logo.png";
  const { t } = useLanguage();

  // Prefetch route chunks on hover
  const prefetched = useRef(new Set<string>());
  const handleLinkHover = useCallback((to: string) => {
    if (prefetched.current.has(to)) return;
    prefetched.current.add(to);
    // Prefetch the SolutionDetail page (handles /product/* routes)
    if (to.startsWith('/product/')) {
      import('../pages/SolutionDetail').catch(() => {});
    }
  }, []);

  return (
    <footer aria-label="Site footer" className="relative bg-[var(--atlas-bg-page)] border-t border-[var(--atlas-border)] transition-colors duration-500 overflow-hidden">
      {/* ═══ Background Effects (Atlas purple wash) ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-30%] right-[-10%] w-[700px] h-[700px] bg-atlas-purple/[0.04] dark:bg-atlas-purple/[0.08] rounded-full blur-[180px]" />
        <div className="absolute top-[-20%] left-[-5%] w-[400px] h-[400px] bg-atlas-orangeBright/[0.02] dark:bg-atlas-orangeBright/[0.04] rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(112,54,240,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(112,54,240,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      {/* ═══ Newsletter / CTA Banner — Desktop only ═══ */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 hidden md:block">
        <div className="relative -mt-px py-10 md:py-14">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2E1670] via-[#5326B5] to-[#7036F0] p-8 md:p-12 border border-white/[0.08]">
            <div className="absolute top-0 right-[20%] w-[400px] h-[300px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-[10%] w-[300px] h-[200px] bg-atlas-orangeBright/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-atlas-card bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{t('footer.cta_title')}</h3>
                  <p className="text-[13px] text-white/70 mt-0.5">{t('footer.cta_desc')}</p>
                </div>
              </div>
              <Link to="/login" className="group shrink-0 inline-flex items-center gap-3 bg-white text-atlas-purple px-7 py-3 rounded text-sm font-bold hover:shadow-atlas-md hover:scale-[1.03] active:scale-[0.97] transition-all duration-200">
                {t('footer.cta_btn')}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Footer Content ═══ */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-12 pt-6 md:pt-8 pb-6 md:pb-8">
        
        {/* ═══ MOBILE: Compact footer ═══ */}
        <div className="md:hidden space-y-5">
          {/* Brand + Social row */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tighter uppercase italic text-slate-900 dark:text-white">Skyverses</span>
                <span className="text-[6px] font-bold tracking-[0.4em] uppercase text-brand-blue">AI Market</span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5">
              {[
                { icon: <Facebook size={13} />, href: 'https://skyverses.com/', label: 'Facebook' },
                { icon: <Send size={13} />, href: 'https://t.me/nhomhotrokythuat', label: 'Telegram', accent: true },
                { icon: <MessageCircle size={13} />, href: 'https://zalo.me/g/brzhpkvbxtnvicdtgpkv', label: 'Zalo', accent: true },
                { icon: <Mail size={13} />, href: 'mailto:support@skyverses.com', label: 'Email' },
              ].map(social => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" title={social.label}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    (social as any).accent
                      ? 'bg-[#2AABEE]/10 text-[#2AABEE]'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-gray-500'
                  }`}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Compact links — 2 columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: t('footer.ai_products'), to: '/apps' },
              { label: 'Credits & Pricing', to: '/credits' },
              { label: 'Explorer', to: '/explorer' },
              { label: 'Referral', to: '/referral' },
              { label: 'Terms & Policy', to: '/policy' },
              { label: t('footer.contact_us'), href: 'https://skyverses.com/contact' },
            ].map(link => (
              'to' in link ? (
                <Link key={link.label} to={link.to!} className="text-[11px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={(link as any).href} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors">
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Mobile CTA — Atlas gradient */}
          <Link to="/login" className="flex items-center justify-center gap-2 w-full py-2.5 rounded bg-atlas-cta text-white text-xs font-bold hover:shadow-atlas-glow transition-all">
            <Sparkles size={12} className="text-white" />
            {t('footer.mobile_cta')}
          </Link>

          {/* Copyright */}
          <p className="text-center text-[9px] font-medium text-slate-400 dark:text-gray-600">
            © 2026 Skyverses. All rights reserved.
          </p>
        </div>

        {/* ═══ DESKTOP: Full footer ═══ */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="flex items-center gap-3 group">
                <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tighter uppercase italic text-slate-900 dark:text-white transition-colors">Skyverses</span>
                  <span className="text-[8px] font-bold tracking-[0.5em] uppercase text-brand-blue">AI Market</span>
                </div>
              </Link>
              <p className="text-[13px] text-slate-500 dark:text-gray-400 leading-relaxed max-w-sm">
                {t('footer.description')}
              </p>
              <div className="flex items-center gap-2">
                {[
                  { icon: <Facebook size={16} />, href: 'https://skyverses.com/', label: 'Facebook' },
                  { icon: <Twitter size={16} />, href: 'https://twitter.com/', label: 'Twitter' },
                  { icon: <Linkedin size={16} />, href: 'https://linkedin.com/', label: 'LinkedIn' },
                  { icon: <Github size={16} />, href: 'https://github.com/', label: 'GitHub' },
                  { icon: <Mail size={16} />, href: 'mailto:support@skyverses.com', label: 'Email' },
                  { icon: <Send size={16} />, href: 'https://t.me/nhomhotrokythuat', label: 'Telegram', accent: true },
                ].map(social => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" title={social.label}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                      (social as any).accent
                        ? 'bg-[#2AABEE]/10 border border-[#2AABEE]/20 text-[#2AABEE] hover:bg-[#2AABEE] hover:border-[#2AABEE] hover:text-white hover:shadow-lg hover:shadow-[#2AABEE]/20'
                        : 'bg-slate-100 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04] text-slate-400 dark:text-gray-500 hover:bg-brand-blue hover:border-brand-blue hover:text-white hover:shadow-lg hover:shadow-brand-blue/20'
                    }`}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-10">
              <div className="space-y-5">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 dark:text-white">{t('footer.products')}</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'AI Video Studio', to: '/product/ai-video-generator' },
                    { label: 'AI Image Studio', to: '/product/ai-image-generator' },
                    { label: 'AI Voice Studio', to: '/product/voice-design-ai' },
                    { label: 'AI Music Studio', to: '/product/ai-music-generator' },
                    { label: 'All Products', to: '/apps' },
                  ].map(link => (
                    <li key={link.label}>
                      <Link to={link.to} onMouseEnter={() => handleLinkHover(link.to)} className="text-[12px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors duration-200 flex items-center gap-1.5 group">
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-brand-blue group-hover:scale-150 transition-all duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-5">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 dark:text-white">{t('footer.about_title')}</h4>
                <ul className="space-y-3">
                  {[
                    { label: t('footer.team'), to: '/about' },
                    { label: 'Solutions', to: '/solutions' },
                    { label: 'Use Cases', to: '/use-cases' },
                    { label: t('footer.library'), to: '/explorer' },
                  ].map(link => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-[12px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors duration-200 flex items-center gap-1.5 group">
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-brand-blue group-hover:scale-150 transition-all duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-5">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 dark:text-white">{t('footer.support_title')}</h4>
                <ul className="space-y-3">
                  {[
                    { label: t('footer.contact'), href: 'https://skyverses.com/contact' },
                    { label: t('footer.center'), href: 'https://skyverses.com/support' },
                    { label: t('footer.partners'), href: 'https://skyverses.com/partners' },
                  ].map(link => (
                    <li key={link.label}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors duration-200 flex items-center gap-1.5 group">
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-brand-blue group-hover:scale-150 transition-all duration-300" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600">{t('footer.tech_support')}</p>
                  <a href="https://t.me/nhomhotrokythuat" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#2AABEE]/[0.06] border border-[#2AABEE]/15 hover:border-[#2AABEE]/40 hover:bg-[#2AABEE]/10 transition-all group">
                    <Send size={14} className="text-[#2AABEE] group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-semibold text-[#2AABEE]">Telegram Support</span>
                  </a>
                  <a href="https://zalo.me/g/brzhpkvbxtnvicdtgpkv" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0068FF]/[0.06] border border-[#0068FF]/15 hover:border-[#0068FF]/40 hover:bg-[#0068FF]/10 transition-all group">
                    <MessageCircle size={14} className="text-[#0068FF] group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-semibold text-[#0068FF]">Zalo Support</span>
                  </a>
                </div>
              </div>
              <div className="space-y-5">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 dark:text-white">Legal</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'Terms of Service', to: '/policy' },
                    { label: 'Privacy Policy', to: '/policy' },
                    { label: 'Credits & Pricing', to: '/credits' },
                    { label: 'Referral', to: '/referral' },
                  ].map(link => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-[12px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors duration-200 flex items-center gap-1.5 group">
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-brand-blue group-hover:scale-150 transition-all duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex justify-center items-center">
              <p className="text-[10px] font-medium text-slate-400 dark:text-gray-600 tracking-wide">
                © 2026 Skyverses. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
