
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, MonitorPlay } from 'lucide-react';
import { Solution, Language } from '../../types';

interface FeaturedSectionProps {
  solutions: Solution[];
  lang: string;
  onNavigate: (slug: string) => void;
  onOpenDemo: () => void;
}

const FeaturedSectionComponent: React.FC<FeaturedSectionProps> = ({ 
  solutions, lang, onNavigate, onOpenDemo 
}) => {
  const [index, setIndex] = useState(0);
  const currentLang = lang as Language;

  useEffect(() => {
    if (solutions.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % solutions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [solutions]);

  if (solutions.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Card stack */}
      <div className="flex justify-center lg:justify-end relative min-h-[280px] md:min-h-[380px]">
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
                  <img src={sol.imageUrl} loading="lazy" className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  {/* Overlay info on active card */}
                  {offset === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">{sol.category[currentLang]}</span>
                      <h3 className="text-base md:text-xl font-black text-white uppercase tracking-tight italic mt-1">{sol.name[currentLang]}</h3>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Dots + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {solutions.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-brand-blue' : 'w-2 bg-gray-200 dark:bg-white/10'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate(solutions[index].slug)} className="inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
            Explore <Wand2 size={12} fill="currentColor" />
          </button>
          <button onClick={onOpenDemo} className="inline-flex items-center gap-2 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] hover:bg-slate-50 transition-all">
            Demo <MonitorPlay size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FeaturedSection = React.memo(FeaturedSectionComponent);
