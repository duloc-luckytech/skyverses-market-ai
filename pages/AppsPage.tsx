
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ChevronRight } from 'lucide-react';
import { useAppsPage } from '../hooks/useAppsPage';
import { AppsHero } from '../components/apps/AppsHero';
import { CategoryTabs } from '../components/apps/CategoryTabs';
import { AppCard } from '../components/apps/AppCard';
import { DeveloperPortal } from '../components/apps/DeveloperPortal';
import { ProposalModal } from '../components/apps/ProposalModal';

const AppsPage: React.FC = () => {
  const { 
    activeCategory, 
    setActiveCategory, 
    isModalOpen, 
    setIsModalOpen, 
    filteredApps 
  } = useAppsPage();

  return (
    <div className="pt-24 min-h-screen bg-[#fcfcfd] dark:bg-[#030304] text-slate-900 dark:text-white font-sans transition-all duration-500 selection:bg-brand-blue/30 overflow-x-hidden pb-40">
      
      <AppsHero />

      <section className="py-20 max-w-[1600px] mx-auto px-6 lg:px-12">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </AnimatePresence>

          {/* ADD YOUR APP CARD */}
          <motion.div 
            layout
            onClick={() => setIsModalOpen(true)}
            className="group relative border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6 cursor-pointer hover:border-brand-blue/40 hover:bg-brand-blue/[0.01] transition-all"
          >
             <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-gray-700 group-hover:scale-110 group-hover:text-brand-blue transition-all">
                <Plus size={32} />
             </div>
             <div className="space-y-2">
                <h4 className="text-xl font-black uppercase italic tracking-tight text-slate-800 dark:text-white">Deploy Your App</h4>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest max-w-[200px]">Đưa giải pháp AI của bạn vào hệ sinh thái Skyverses</p>
             </div>
             <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-blue">Gửi đề xuất <ChevronRight size={14}/></button>
          </motion.div>
        </div>
      </section>

      <DeveloperPortal onApply={() => setIsModalOpen(true)} />

      <AnimatePresence>
        <ProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </AnimatePresence>

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AppsPage;
