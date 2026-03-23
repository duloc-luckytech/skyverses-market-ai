
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
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
    <div className="pt-24 min-h-screen bg-[#fafafa] dark:bg-[#050507] text-slate-900 dark:text-white transition-colors duration-500 selection:bg-brand-blue/30 overflow-x-hidden pb-32">
      
      <AppsHero />

      <section className="py-12 md:py-16 max-w-[1400px] mx-auto px-4 md:px-8">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </AnimatePresence>

          {/* ADD YOUR APP CARD */}
          <motion.div 
            layout
            onClick={() => setIsModalOpen(true)}
            className="group border-2 border-dashed border-slate-200 dark:border-white/[0.06] rounded-2xl p-7 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:border-brand-blue/30 hover:bg-brand-blue/[0.02] transition-all min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300 dark:text-gray-600 group-hover:scale-110 group-hover:text-brand-blue transition-all">
              <Plus size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black tracking-tight text-slate-700 dark:text-white">Deploy Your App</h4>
              <p className="text-xs text-slate-400 dark:text-gray-500 max-w-[200px] leading-relaxed">Đưa giải pháp AI của bạn vào hệ sinh thái Skyverses</p>
            </div>
            <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-blue hover:underline">
              Gửi đề xuất <ArrowRight size={12} />
            </button>
          </motion.div>
        </div>
      </section>

      <DeveloperPortal onApply={() => setIsModalOpen(true)} />

      <AnimatePresence>
        <ProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </AnimatePresence>
    </div>
  );
};

export default AppsPage;
