
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
    <footer aria-label="Site footer" className="relative bg-[#fafbfc] dark:bg-[#060608] border-t border-black/[0.04] dark:border-white/[0.04] transition-colors duration-500 overflow-hidden">
      {/* ═══ Background Effects ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-30%] right-[-10%] w-[700px] h-[700px] bg-brand-blue/[0.03] dark:bg-brand-blue/[0.05] rounded-full blur-[180px]" />
        <div className="absolute top-[-20%] left-[-5%] w-[400px] h-[400px] bg-purple-500/[0.02] dark:bg-purple-500/[0.04] rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(0,144,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,144,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ═══ Newsletter / CTA Banner ═══ */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="relative -mt-px py-10 md:py-14">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0a0e1a] via-[#0c1225] to-[#0a0e1a] dark:from-[#080a14] dark:via-[#0a0e1e] dark:to-[#080a14] p-8 md:p-12 border border-white/[0.04]">
            {/* CTA Glow */}
            <div className="absolute top-0 right-[20%] w-[400px] h-[300px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-[10%] w-[300px] h-[200px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
                  <Sparkles size={22} className="text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tight">Sẵn sàng sáng tạo với AI?</h3>
                  <p className="text-[12px] text-white/40 mt-0.5">Đăng ký miễn phí và nhận 50 Credits trải nghiệm ngay hôm nay.</p>
                </div>
              </div>
              <Link to="/login" className="group shrink-0 inline-flex items-center gap-3 bg-white text-black px-7 py-3.5 rounded-xl text-sm font-bold hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
                Bắt đầu miễn phí
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Footer Content ═══ */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 pt-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white transition-colors">Skyverses</span>
                <span className="text-[8px] font-black tracking-[0.5em] uppercase text-brand-blue">AI Market</span>
              </div>
            </Link>
            <p className="text-[13px] text-slate-500 dark:text-gray-400 leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>

            {/* Social Icons */}
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
            {/* Products */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Sản phẩm</h4>
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

            {/* About */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">{t('footer.about_title')}</h4>
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

            {/* Support */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">{t('footer.support_title')}</h4>
              <ul className="space-y-3">
                {[
                  { label: t('footer.contact'), href: 'https://skyverses.com/contact', icon: null },
                  { label: t('footer.center'), href: 'https://skyverses.com/support', icon: null },
                  { label: t('footer.partners'), href: 'https://skyverses.com/partners', icon: null },
                ].map(link => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors duration-200 flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-brand-blue group-hover:scale-150 transition-all duration-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {/* Telegram & Zalo Support */}
              <div className="pt-2 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600">Hỗ trợ kỹ thuật</p>
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

            {/* Legal */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Legal</h4>
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

        {/* ═══ Bottom Bar ═══ */}
        <div className="pt-8 border-t border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex justify-center items-center">
            <p className="text-[10px] font-medium text-slate-400 dark:text-gray-600 tracking-wide">
              © 2026 Skyverses. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
