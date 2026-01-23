
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Armchair, Share2, Download, Eye } from 'lucide-react';

interface ViewportContentProps {
  resultImage: string | null;
  isGenerating: boolean;
}

const REAL_ESTATE_EXAMPLES = [
  {
    id: 'ex1',
    title: 'Modern Luxury Living',
    style: 'Luxury',
    url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ex2',
    title: 'Indochine Bedroom',
    style: 'Indochine',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ex3',
    title: 'Scandinavian Workspace',
    style: 'Scandinavian',
    url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ex4',
    title: 'Brutalist Penthouse',
    style: 'Industrial',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ex5',
    title: 'Minimalist Kitchen',
    style: 'Minimalism',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ex6',
    title: 'Neo-Classical Facade',
    style: 'Classic',
    url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800'
  }
];

export const ViewportContent: React.FC<ViewportContentProps> = ({ resultImage, isGenerating }) => {
  return (
    <div className="flex-grow flex flex-col relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Scrollable Area */}
      <div className="flex-grow overflow-y-auto no-scrollbar relative z-10">
        <div className="min-h-full w-full flex flex-col items-center justify-start p-6 md:p-10 lg:p-16">
          <AnimatePresence mode="wait">
            {resultImage ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="relative group max-w-5xl w-full aspect-video bg-white dark:bg-black rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_150px_rgba(168,85,247,0.15)] border border-slate-200 dark:border-white/10"
              >
                <img src={resultImage} className="w-full h-full object-cover" alt="Render result" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                  <button className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:bg-brand-blue hover:text-white transition-all"><Share2 size={20}/></button>
                  <a href={resultImage} download={`skyverses_real_estate_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                </div>
                <div className="absolute bottom-6 left-6 z-30 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm shadow-xl italic">NEURAL RENDER v2.5</span>
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-sm border border-white/10">8K ULTRA HD</span>
                  </div>
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-12 text-center my-auto"
              >
                <div className="relative">
                  <Loader2 size={120} className="text-purple-500 animate-spin" strokeWidth={1} />
                  <Sparkles size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-800 dark:text-white">ĐANG TỔNG HỢP KHÔNG GIAN...</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">Architect Node #042 // Neural Lattice</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="examples"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-6xl space-y-12"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 pt-4">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-purple-500">
                        <Sparkles size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Showcase</span>
                     </div>
                     <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Dự án <span className="text-purple-600">Tiêu biểu.</span></h2>
                     <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest italic leading-relaxed max-w-2xl">Khám phá sức mạnh của trí tuệ nhân tạo trong việc tái thiết kế và dàn dựng không gian sống chuyên nghiệp.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {REAL_ESTATE_EXAMPLES.map((ex, idx) => (
                    <motion.div 
                      key={ex.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-zinc-900 group shadow-lg hover:shadow-2xl transition-all duration-500 border border-black/5 dark:border-white/5"
                    >
                      <img 
                        src={ex.url} 
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
                        alt={ex.title} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                      
                      <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                        <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm">{ex.style}</span>
                          </div>
                          <h4 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">"{ex.title}"</h4>
                          <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="flex items-center gap-2 text-purple-400 text-[9px] font-black uppercase tracking-[0.2em]">
                               Xem chi tiết <Eye size={14} />
                             </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-8 opacity-20 hover:opacity-100 transition-opacity pb-12">
                   <p className="text-[10px] font-black uppercase tracking-[0.8em] italic text-slate-900 dark:text-white">SKYVERSES REAL ESTATE AI // READY TO SYNC</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
