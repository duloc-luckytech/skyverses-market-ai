
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, MonitorPlay } from 'lucide-react';
import { Solution } from '../../types';

interface FeaturedSectionProps {
  solutions: Solution[];
  lang: string;
  onNavigate: (slug: string) => void;
  onOpenDemo: () => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ 
  solutions, lang, onNavigate, onOpenDemo 
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (solutions.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % solutions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [solutions]);

  if (solutions.length === 0) return null;

  return (
    <section className="mb-8 md:mb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center border-b border-black/5 dark:border-white/5 pb-16 md:pb-24">
      <div className="lg:col-span-5 space-y-6 md:space-y-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={solutions[index].id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-ping"></div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue italic">FEATURED_NODE // {solutions[index].category[lang as any]}</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-[0.9] text-black dark:text-white">{solutions[index].name[lang as any]}</h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg">{solutions[index].description[lang as any]}</p>
            </div>
            <div className="flex gap-2 pt-2">
              {solutions.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-brand-blue' : 'w-2 bg-gray-200 dark:bg-white/10'}`} />
              ))}
            </div>
            <div className="hidden lg:flex pt-4 md:pt-6 flex-wrap gap-3 md:gap-4">
              <button onClick={() => onNavigate(solutions[index].slug)} className="inline-flex items-center gap-4 md:gap-6 bg-brand-blue text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-[10px] md:text-11px font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-blue/30 hover:scale-105 active:scale-95 transition-all group">Explore <Wand2 size={16} fill="currentColor" className="group-hover:translate-x-1 transition-transform" /></button>
              <button onClick={onOpenDemo} className="inline-flex items-center gap-3 md:gap-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-8 md:px-10 py-4 md:py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">Watch Demo <MonitorPlay size={16} /></button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="lg:col-span-7 flex justify-center lg:justify-end pr-0 md:pr-20 relative min-h-[300px] md:min-h-[400px]">
         <div className="relative w-full max-w-[450px] aspect-[4/3]">
            <AnimatePresence>
              {solutions.map((sol, idx) => {
                const offset = (idx - index + solutions.length) % solutions.length;
                if (offset > 4) return null;
                return (
                  <motion.div
                    key={sol.id} initial={false}
                    animate={{ x: offset * (window.innerWidth < 768 ? 12 : 25), y: offset * (window.innerWidth < 768 ? -10 : -20), scale: 1 - offset * 0.06, rotate: offset * 2, opacity: 1 - offset * 0.2, zIndex: solutions.length - offset }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute inset-0 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 bg-black shadow-3xl cursor-pointer ${offset === 0 ? 'border-brand-blue' : 'border-white/10'}`}
                    onClick={() => onNavigate(sol.slug)}
                  >
                    <img src={sol.imageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
         </div>
      </div>
    </section>
  );
};
