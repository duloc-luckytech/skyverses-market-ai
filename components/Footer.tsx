import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Twitter, Linkedin, Mail, Github, MessageCircle, Send,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Footer — Atlas Cloud-style dark footer with rainbow bar.
 * 5-column grid: PRODUCTS | MODELS | RESOURCES | COMPANY | FOLLOW US
 * Certification badges (SOC I/II, HIPAA) + rainbow animated bar.
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

  return (
    <footer
      aria-label="Site footer"
      className="relative overflow-hidden"
      style={{ backgroundColor: '#1a2330' }}
    >
      {/* ═══ MOBILE compact ═══ */}
      <div className="md:hidden px-4 py-10 space-y-7" style={{ color: '#ebf4fb' }}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="Skyverses" className="w-7 h-7 object-contain invert brightness-200" />
            <span className="text-base font-bold tracking-tight" style={{ color: '#ebf4fb' }}>Skyverses</span>
          </Link>
          <div className="flex items-center gap-1.5">
            {[
              { icon: <Linkedin size={13} />, href: 'https://linkedin.com/', label: 'LinkedIn' },
              { icon: <Send size={13} />, href: 'https://t.me/nhomhotrokythuat', label: 'Telegram' },
              { icon: <MessageCircle size={13} />, href: 'https://zalo.me/g/brzhpkvbxtnvicdtgpkv', label: 'Zalo' },
              { icon: <Mail size={13} />, href: 'mailto:support@skyverses.com', label: 'Email' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                className="w-8 h-8 rounded flex items-center justify-center transition-all"
                style={{ background: 'rgba(235,244,251,0.05)', border: '1px solid rgba(235,244,251,0.1)', color: 'rgba(235,244,251,0.6)' }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

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
              <Link key={link.label} to={link.to!} className="transition-colors" style={{ color: '#ebf4fb' }}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={(link as any).href} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: '#ebf4fb' }}>
                {link.label}
              </a>
            )
          ))}
        </div>

        {/* Certifications — Mobile */}
        <div className="flex items-center gap-3">
          <img src="https://static.atlascloud.ai/images/home/footer/cert-1.png" alt="AICPA SOC" className="h-10 grayscale" />
          <img src="https://static.atlascloud.ai/images/home/footer/cert-2.png" alt="SOC 2" className="h-10 grayscale" />
          <img src="https://static.atlascloud.ai/images/home/footer/cert-3.png" alt="HIPAA" className="h-10 grayscale" />
        </div>

        <div className="pt-4 flex items-center justify-between text-[10px]" style={{ borderTop: '1px solid rgba(235,244,251,0.1)', color: 'rgba(235,244,251,0.5)' }}>
          <span>© 2026 Skyverses</span>
          <span className="text-[9px] uppercase tracking-wider">SOC I & II · HIPAA</span>
        </div>
      </div>

      {/* ═══ DESKTOP — Atlas 5-column grid ═══ */}
      <div className="hidden md:block">
        <div className="max-w-[1440px] mx-auto" style={{ padding: '52px 64px 0' }}>
          {/* Top row: Logo + Certifications */}
          <div className="flex items-start justify-between mb-12">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={logoUrl} alt="Skyverses" className="w-9 h-9 object-contain invert brightness-200" />
              <span className="text-lg font-bold tracking-tight" style={{ color: '#ebf4fb' }}>Skyverses</span>
            </Link>
            <div className="flex items-center gap-4">
              <img src="https://static.atlascloud.ai/images/home/footer/cert-1.png" alt="AICPA SOC" className="h-14 grayscale" />
              <img src="https://static.atlascloud.ai/images/home/footer/cert-2.png" alt="SOC 2" className="h-14 grayscale" />
              <img src="https://static.atlascloud.ai/images/home/footer/cert-3.png" alt="HIPAA" className="h-14 grayscale" style={{ width: 140 }} />
            </div>
          </div>

          {/* Certification text */}
          <p className="text-xs uppercase tracking-wider mb-10" style={{ color: '#ebf4fb' }}>
            SOC I & II CERTIFIED | HIPAA COMPLIANT
          </p>

          {/* Separator */}
          <div style={{ height: 1, background: 'rgba(235,244,251,0.2)' }} className="mb-10" />

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
              <FooterExtIcon href="https://linkedin.com/" icon={<Linkedin size={14} />}>LinkedIn</FooterExtIcon>
              <FooterExtIcon href="https://t.me/nhomhotrokythuat" icon={<Send size={14} />}>Telegram</FooterExtIcon>
              <FooterExtIcon href="https://twitter.com/" icon={<Twitter size={14} />}>X</FooterExtIcon>
              <FooterExtIcon href="https://github.com/" icon={<Github size={14} />}>Github</FooterExtIcon>
              <FooterExtIcon href="mailto:support@skyverses.com" icon={<Mail size={14} />}>Email</FooterExtIcon>
            </FooterCol>
          </div>

          {/* Bottom strip */}
          <div className="mt-12 py-6 flex items-center justify-between text-sm" style={{ borderTop: '1px solid rgba(235,244,251,0.2)' }}>
            <span style={{ color: '#ebf4fb' }}>© 2026 Skyverses</span>
            <div className="flex items-center gap-2">
              <Link to="/policy" className="hover:opacity-70 transition-opacity" style={{ color: '#ebf4fb' }}>Privacy & Terms</Link>
              <span style={{ color: 'rgba(235,244,251,0.5)' }}>|</span>
              <Link to="/policy" className="hover:opacity-70 transition-opacity" style={{ color: '#ebf4fb' }}>Acceptable Use</Link>
              <span style={{ color: 'rgba(235,244,251,0.5)' }}>|</span>
              <Link to="/policy" className="hover:opacity-70 transition-opacity" style={{ color: '#ebf4fb' }}>Data Deletion Policy</Link>
            </div>
          </div>
        </div>

        {/* ═══ RAINBOW BAR ═══ */}
        <div className="relative w-full h-[2px] overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: '200%',
              background: `linear-gradient(90deg,
                #7036f0 0%, #7036f0 7.145%,
                #4a75d6 7.145%, #4a75d6 14.29%,
                #d7416e 14.29%, #d7416e 21.435%,
                #50ceb8 21.435%, #50ceb8 28.58%,
                #ce9c50 28.58%, #ce9c50 35.725%,
                #ececec 35.725%, #ececec 42.87%,
                #454545 42.87%, #454545 50%,
                #7036f0 50%, #7036f0 57.145%,
                #4a75d6 57.145%, #4a75d6 64.29%,
                #d7416e 64.29%, #d7416e 71.435%,
                #50ceb8 71.435%, #50ceb8 78.58%,
                #ce9c50 78.58%, #ce9c50 85.725%,
                #ececec 85.725%, #ececec 92.87%,
                #454545 92.87%, #454545 100%)`,
              animation: 'rainbowSlide 14s linear infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes rainbowSlide {
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
      className="text-sm font-normal uppercase mb-5"
      style={{ color: 'rgba(235,244,251,0.5)' }}
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
      className="text-sm hover:opacity-70 transition-opacity"
      style={{ color: '#ebf4fb' }}
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
      className="text-sm hover:opacity-70 transition-opacity"
      style={{ color: '#ebf4fb' }}
    >
      {children}
    </a>
  </li>
);

const FooterExtIcon: React.FC<{ href: string; icon: React.ReactNode; children: React.ReactNode }> = ({ href, icon, children }) => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
      style={{ color: '#ebf4fb' }}
    >
      {icon}
      {children}
    </a>
  </li>
);

export default Footer;
