
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, RefreshCw } from 'lucide-react';
import { ImageJobCard } from '../shared/ImageJobCard';
import type { ImageResult } from '../../hooks/useImageGenerator';

interface ContextInfo {
  mode:     string;
  roomType: string;
  style:    string;
  model:    string;
  cost:     number;
}

interface ViewportContentProps {
  results:       ImageResult[];
  isGenerating:  boolean;
  onRegenerate?: () => void;
  contextInfo?:  ContextInfo;
  aspectRatio?:  string;
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

const ASPECT_RATIO_CLASS_MAP: Record<string, string> = {
  '1/1':  'aspect-square',
  '16/9': 'aspect-video',
  '9/16': 'aspect-[9/16]',
  '4/3':  'aspect-[4/3]',
  '3/2':  'aspect-[3/2]',
};

function resolveAspectRatio(ratio: string = '4/3'): string {
  return ASPECT_RATIO_CLASS_MAP[ratio] ?? 'aspect-[4/3]';
}

export const ViewportContent: React.FC<ViewportContentProps> = ({
  results,
  isGenerating,
  onRegenerate,
  contextInfo,
  aspectRatio = '4/3',
}) => {
  const hasResults = results.length > 0;
  return (
    <div className="flex-grow flex flex-col relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Scrollable Area */}
      <div className="flex-grow overflow-y-auto no-scrollbar relative z-10">
        <div className="min-h-full w-full flex flex-col items-center justify-start p-6 md:p-10 lg:p-16">
          <AnimatePresence mode="wait">
            {(hasResults || isGenerating) ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl space-y-4"
              >
                {/* ─── Context Info Bar ───────────────────────────────── */}
                {contextInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm px-4 py-2.5"
                  >
                    {/* LEFT — Context chips */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="px-2 py-0.5 bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-[8px] font-black uppercase tracking-widest rounded-md whitespace-nowrap">
                        {contextInfo.mode}
                      </span>

                      <span className="w-px h-3 bg-slate-200 dark:bg-white/10 shrink-0" />

                      <span className="px-2 py-0.5 bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-[8px] font-black uppercase tracking-widest rounded-md whitespace-nowrap">
                        {contextInfo.roomType}
                      </span>

                      <span className="w-px h-3 bg-slate-200 dark:bg-white/10 shrink-0" />

                      <span className="px-2 py-0.5 bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-[8px] font-black uppercase tracking-widest italic rounded-md whitespace-nowrap">
                        {contextInfo.style}
                      </span>

                      {contextInfo.model && (
                        <>
                          <span className="w-px h-3 bg-slate-200 dark:bg-white/10 shrink-0" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 truncate max-w-[120px]">
                            {contextInfo.model}
                          </span>
                        </>
                      )}

                      {contextInfo.cost > 0 && (
                        <>
                          <span className="w-px h-3 bg-slate-200 dark:bg-white/10 shrink-0" />
                          <span className="text-[8px] font-black italic text-orange-500 whitespace-nowrap">
                            {contextInfo.cost} CR
                          </span>
                        </>
                      )}
                    </div>

                    {/* RIGHT — Regenerate button */}
                    {onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        className="flex items-center gap-1.5 shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 hover:brightness-125 transition-all"
                      >
                        <RefreshCw size={11} />
                        Tái tạo
                      </button>
                    )}
                  </motion.div>
                )}
                {isGenerating && results.filter(r => r.status === 'processing').length === 0 && (
                  <ImageJobCard
                    status="processing"
                    aspectRatio={aspectRatio}
                    mode="full"
                    statusText="ĐANG TỔNG HỢP KHÔNG GIAN..."
                  />
                )}
                {results.map(result => (
                  <ImageJobCard
                    key={result.id}
                    status={result.status}
                    resultUrl={result.url ?? undefined}
                    aspectRatio={aspectRatio}
                    mode="full"
                    statusText={result.status === 'processing' ? 'ĐANG TỔNG HỢP KHÔNG GIAN...' : undefined}
                  />
                ))}
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
