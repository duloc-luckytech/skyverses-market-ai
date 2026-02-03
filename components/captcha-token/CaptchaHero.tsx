
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ShieldAlert } from 'lucide-react';
import { CaptchaTab } from '../../hooks/useCaptchaToken';

interface CaptchaHeroProps {
  activeTab: CaptchaTab;
  setActiveTab: (tab: CaptchaTab) => void;
}

export const CaptchaHero: React.FC<CaptchaHeroProps> = ({ activeTab, setActiveTab }) => {
  const tabs: CaptchaTab[] = ['UPLINK', 'SANDBOX', 'TELEMETRY', 'DOCS', 'ACCOUNT'];

  return (
    <section className="py-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-black/5 dark:border-white/5 mb-16 pb-12">
      <div className="space-y-6">
        <Link to="/apps" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">
          <ChevronLeft size={14} /> Back to App Console
        </Link>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <ShieldAlert size={20} />
             </div>
             <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none">Veo3 <span className="text-indigo-600">Captcha.</span></h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium italic">Hệ thống giải mã Captcha tốc độ cao cho AI Agent & Quy trình tự động.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/40 p-1 rounded-full border border-black/5 dark:border-white/10 shadow-inner transition-colors overflow-x-auto no-scrollbar max-w-full">
         {tabs.map(tab => (
           <button 
             key={tab} onClick={() => setActiveTab(tab)}
             className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}
           >
             {tab === 'ACCOUNT' ? 'Account' : tab === 'DOCS' ? 'API Docs' : tab}
           </button>
         ))}
      </div>
    </section>
  );
};
