
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Twitter, Linkedin, Mail, Github, Facebook
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-[#050507] border-t border-black/5 dark:border-white/5 pt-24 pb-12 transition-colors duration-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[150px] pointer-events-none opacity-50"></div>
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter uppercase italic text-black dark:text-white transition-colors">Skyverses</span>
                <span className="text-[8px] font-black tracking-[0.6em] uppercase text-brand-blue">Market</span>
              </div>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-sm:max-w-none max-w-sm uppercase tracking-tight transition-colors">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-5">
              <a href="https://skyverses.com/" target="_blank" rel="noopener noreferrer" className="p-3 bg-black/5 dark:bg-white/5 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm" title="Fanpage"><Facebook size={18} /></a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="p-3 bg-black/5 dark:bg-white/5 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"><Twitter size={18} /></a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="p-3 bg-black/5 dark:bg-white/5 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"><Linkedin size={18} /></a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="p-3 bg-black/5 dark:bg-white/5 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"><Github size={18} /></a>
            </div>
          </div>

          {/* Links Wrapper */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
            {/* About Column */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue italic">{t('footer.about_title')}</h4>
              <ul className="space-y-4 text-[11px] md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">
                <li><a href="https://skyverses.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">{t('footer.team')}</a></li>
                <li><a href="https://skyverses.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">{t('footer.ecosystem')}</a></li>
                <li><Link to="/explorer" className="hover:text-brand-blue transition-colors">{t('footer.library')}</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue italic">{t('footer.support_title')}</h4>
              <ul className="space-y-4 text-[11px] md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">
                <li><a href="https://skyverses.com/contact" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">{t('footer.contact')}</a></li>
                <li><a href="https://skyverses.com/support" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">{t('footer.center')}</a></li>
                <li><a href="https://skyverses.com/partners" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">{t('footer.partners')}</a></li>
              </ul>
            </div>

            {/* Policy Column */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue italic">Policy & Rules</h4>
              <ul className="space-y-4 text-[11px] md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">
                <li><Link to="/policy" className="hover:text-brand-blue transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 transition-colors">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600">
            {t('footer.copyright')} <span className="mx-4 italic hidden sm:inline">{t('footer.version')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
