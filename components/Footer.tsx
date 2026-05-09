import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Twitter, Linkedin, Mail, Github, MessageCircle, Send,
  Sparkles, Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Footer — Black + Gold + White premium footer.
 * 5-column grid: PRODUCTS | MODELS | RESOURCES | COMPANY | FOLLOW US
 * Gold accent bar at bottom.
 */

const Footer: React.FC = () => {
  const logoUrl = '/assets/skyverses-logo.png';
  const { t } = useLanguage();

  const prefetched = useRef(new Set<string>());
  const handleLinkHover = useCallback((to: string) => {
    if (prefetched.current.has(to)) return;
    prefetched.current.add(to);
    if (to.startsWith('/product/')) {
      import('../pages/SolutionDetail').catch(() => {});
    }
  }, []);

  const socials = [
    { icon: <Linkedin size={14} />, href: 'https://linkedin.com/', label: 'LinkedIn' },
    { icon: <Send size={14} />, href: 'https://t.me/nhomhotrokythuat', label: 'Telegram' },
    { icon: <Twitter size={14} />, href: 'https://twitter.com/', label: 'X' },
    { icon: <Github size={14} />, href: 'https://github.com/', label: 'Github' },
    { icon: <Mail size={14} />, href: 'mailto:support@skyverses.com', label: 'Email' },
  ];

  return (
    <footer
      aria-label="Site footer"
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0a0f1a' }}
    >
      {/* ═══ MOBILE compact ═══ */}
      <div className="md:hidden px-5 py-10 space-y-8">
        {/* Logo + socials */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="Skyverses" className="w-7 h-7 object-contain brightness-0 invert" />
            <span className="text-base font-bold tracking-tight" style={{ color: '#faf7f8' }}>Skyverses</span>
          </Link>
          <div className="flex items-center gap-1.5">
            {socials.slice(0, 4).map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
          {[
            { label: t('footer.ai_products') || 'AI Products', to: '/apps' },
            { label: 'Credits & Pricing', to: '/credits' },
            { label: 'Explorer', to: '/explorer' },
            { label: 'Referral', to: '/referral' },
            { label: 'Terms & Policy', to: '/policy' },
            { label: t('footer.contact_us') || 'Contact', href: 'https://skyverses.com/contact' },
          ].map(link => (
            'to' in link ? (
              <Link key={link.label} to={link.to!} className="transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(250,247,248,0.7)' }}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={(link as any).href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(250,247,248,0.7)' }}>
                {link.label}
              </a>
            )
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-4 flex items-center justify-between text-[10px]" style={{ borderTop: '1px solid rgba(201,168,76,0.12)', color: 'rgba(250,247,248,0.4)' }}>
          <span>© 2026 Skyverses</span>
        </div>
      </div>

      {/* ═══ DESKTOP — 5-column grid ═══ */}
      <div className="hidden md:block">
        <div className="max-w-[1440px] mx-auto" style={{ padding: '52px 64px 0' }}>
          {/* Top row: Logo + Trust badges */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2.5 group mb-4">
                <img src={logoUrl} alt="Skyverses" className="w-9 h-9 object-contain brightness-0 invert" />
                <span className="text-lg font-bold tracking-tight" style={{ color: '#faf7f8' }}>Skyverses</span>
              </Link>
              <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: 'rgba(250,247,248,0.4)' }}>
                AI-powered creative platform for image, video, 3D, and content generation.
              </p>
            </div>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: 'rgba(201,168,76,0.12)' }} className="mb-10" />

          {/* 5-column links */}
          <div className="grid grid-cols-5 gap-10 lg:gap-20">
            {/* PRODUCTS */}
            <FooterCol title="Products">
              <FooterLink to="/product/ai-image-generator" onHover={handleLinkHover}>Image Models</FooterLink>
              <FooterLink to="/product/ai-video-generator" onHover={handleLinkHover}>Video Models</FooterLink>
              <FooterLink to="/product/qwen-chat-ai" onHover={handleLinkHover}>LLMs</FooterLink>
            </FooterCol>

            {/* MODELS */}
            <FooterCol title="Models">
              <FooterLink to="/product/ai-video-generator" onHover={handleLinkHover}>Seedance 2.0</FooterLink>
              <FooterLink to="/product/ai-video-generator" onHover={handleLinkHover}>Kling 3.0</FooterLink>
              <FooterLink to="/product/ai-image-generator" onHover={handleLinkHover}>GPT Image 2</FooterLink>
              <FooterLink to="/product/ai-image-generator" onHover={handleLinkHover}>Midjourney</FooterLink>
              <FooterLink to="/product/qwen-chat-ai" onHover={handleLinkHover}>DeepSeek</FooterLink>
              <FooterLink to="/models">Explore More</FooterLink>
            </FooterCol>

            {/* RESOURCES */}
            <FooterCol title="Resources">
              <FooterLink to="/credits">Pricing</FooterLink>
              <FooterExt href="https://insights.skyverses.com">Docs</FooterExt>
              <FooterLink to="/explorer">Explorer Gallery</FooterLink>
              <FooterLink to="/use-cases">Use Cases</FooterLink>
              <FooterLink to="/referral">Referral</FooterLink>
            </FooterCol>

            {/* COMPANY */}
            <FooterCol title="Company">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/booking">Contact</FooterLink>
              <FooterLink to="/policy">Privacy & Terms</FooterLink>
              <FooterExt href="https://skyverses.com/support">Support</FooterExt>
            </FooterCol>

            {/* FOLLOW US */}
            <FooterCol title="Follow Us">
              {socials.map(s => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm transition-all group"
                  >
                    <span
                      className="w-7 h-7 rounded-md flex items-center justify-center transition-all group-hover:scale-105"
                      style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', color: '#C9A84C' }}
                    >
                      {s.icon}
                    </span>
                    <span style={{ color: 'rgba(250,247,248,0.7)' }} className="group-hover:text-[#C9A84C] transition-colors">
                      {s.label}
                    </span>
                  </a>
                </li>
              ))}
            </FooterCol>
          </div>

          {/* Bottom strip */}
          <div className="mt-12 py-6 flex items-center justify-between text-sm" style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
            <span style={{ color: 'rgba(250,247,248,0.5)' }}>© 2026 Skyverses</span>
            <div className="flex items-center gap-2 text-[13px]">
              <Link to="/policy" className="transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(250,247,248,0.5)' }}>Privacy & Terms</Link>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
              <Link to="/policy" className="transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(250,247,248,0.5)' }}>Acceptable Use</Link>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
              <Link to="/policy" className="transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(250,247,248,0.5)' }}>Data Deletion Policy</Link>
            </div>
          </div>
        </div>

        {/* ═══ GOLD ACCENT BAR ═══ */}
        <div className="relative w-full h-[2px] overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: '200%',
              background: `linear-gradient(90deg,
                #C9A84C 0%, #B8963F 25%,
                #E5C767 40%, #C9A84C 50%,
                #B8963F 65%, #E5C767 80%,
                #C9A84C 100%)`,
              animation: 'goldSlide 8s linear infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes goldSlide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </footer>
  );
};

/* ─────────── Sub-components ─────────── */
const FooterCol: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4
      className="text-[11px] font-bold uppercase tracking-widest mb-5"
      style={{ color: '#C9A84C' }}
    >
      {title}
    </h4>
    <ul className="space-y-3">{children}</ul>
  </div>
);

const FooterLink: React.FC<{
  to: string;
  children: React.ReactNode;
  onHover?: (to: string) => void;
}> = ({ to, children, onHover }) => (
  <li>
    <Link
      to={to}
      onMouseEnter={onHover ? () => onHover(to) : undefined}
      className="text-sm transition-colors hover:text-[#C9A84C]"
      style={{ color: 'rgba(250,247,248,0.7)' }}
    >
      {children}
    </Link>
  </li>
);

const FooterExt: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm transition-colors hover:text-[#C9A84C]"
      style={{ color: 'rgba(250,247,248,0.7)' }}
    >
      {children}
    </a>
  </li>
);

export default Footer;
