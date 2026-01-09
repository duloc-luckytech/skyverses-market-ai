
import React, { useState, useEffect } from 'react';
import { aiModelsApi, AIModel } from '../apis/ai-models';
import { Loader2 } from 'lucide-react';

const AIModelsMarquee: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      const res = await aiModelsApi.getModels();
      if (res && res.data) {
        setModels(res.data);
      }
      setLoading(false);
    };
    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="mb-10 md:mb-24 w-full py-4 md:py-8 border-y border-black/5 dark:border-white/5 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (models.length === 0) return null;

  return (
    <div className="mb-10 md:mb-24 w-full overflow-hidden py-4 md:py-8 border-y border-black/5 dark:border-white/5 relative group cursor-default bg-white/30 dark:bg-white/[0.02] backdrop-blur-sm">
      <div className="flex whitespace-nowrap animate-marquee-fast">
        {[...models, ...models, ...models].map((model, idx) => (
          <div key={`${model.key}-${idx}`} className="flex items-center mx-6 md:mx-12">
            <div className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4 bg-white dark:bg-white/10 rounded-lg p-1 md:p-1.5 border border-black/5 dark:border-white/10 flex items-center justify-center shadow-sm">
               <img src={model.logoUrl} alt={model.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">
              {model.name}
            </span>
            <div className="ml-6 md:ml-12 w-1 md:w-1.5 h-1 md:h-1.5 bg-brand-blue/20 rounded-full"></div>
          </div>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#fcfcfd] dark:from-[#030304] to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#fcfcfd] dark:from-[#030304] to-transparent z-10"></div>

      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 30s linear infinite;
        }
        .animate-marquee-fast:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default AIModelsMarquee;
