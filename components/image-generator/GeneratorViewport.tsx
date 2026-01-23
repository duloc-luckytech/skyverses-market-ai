
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Download, Wand2, 
  Terminal, Edit3, ChevronLeft, ChevronRight, 
  Sparkles, X, LayoutGrid, ArrowLeft
} from 'lucide-react';
import { ImageResult } from '../../hooks/useImageGenerator';
import { ImageResultCard } from './ImageResultCard';

interface GeneratorViewportProps {
  onClose?: () => void;
  activePreviewUrl: string | null;
  setActivePreviewUrl: (url: string | null) => void;
  zoomLevel: number;
  setZoomLevel: (val: number) => void;
  onApplyExample: (ex: any) => void;
  onEdit: (url: string) => void;
  onDownload: (url: string, filename: string) => void;
  results: ImageResult[];
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  deleteResult: (id: string) => void;
}

const FEATURES_TEMPLATES = [
  {
    id: 'angles',
    label: 'EXPLORE FEATURES',
    title: 'GENERATE MULTIPLE ANGLES',
    desc: 'Use Shots to generate the same scene from different camera angles in one go. Build a complete shot list without starting over.',
    mainImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200',
    thumbnails: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1560243563-062bff001d68?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1503387762-592dea58ef21?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=200'
    ]
  },
  {
    id: 'identity',
    label: 'IDENTITY PROTOCOL',
    title: 'LOCKED CHARACTER SYNC',
    desc: 'Lock your characters visual DNA. Generate consistent avatars across various environments and poses with zero identity drift.',
    mainImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    thumbnails: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200'
    ]
  },
  {
    id: 'cinematic',
    label: 'ATMOSPHERIC RENDERING',
    title: 'MASTER CINEMATIC LIGHTING',
    desc: 'Control the sun, shadows, and fog density. Inject specific studio aesthetics into your blueprints with precise temporal logic.',
    mainImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200',
    thumbnails: [
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1635236066249-724441e62102?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1605142859661-ee2019ee1685?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=200'
    ]
  }
];

export const GeneratorViewport: React.FC<GeneratorViewportProps> = ({ 
  onClose, activePreviewUrl, setActivePreviewUrl, zoomLevel, setZoomLevel, onApplyExample, onEdit, onDownload,
  results, selectedIds, toggleSelect, deleteResult
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % FEATURES_TEMPLATES.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + FEATURES_TEMPLATES.length) % FEATURES_TEMPLATES.length);

  useEffect(() => {
    if (activePreviewUrl || results.length > 0) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [activePreviewUrl, results.length]);

  const slide = FEATURES_TEMPLATES[currentSlide];

  return (
    <main className="flex-grow flex flex-col relative bg-[#f8f8fb] dark:bg-[#020205] transition-colors duration-500 overflow-hidden">
      {/* Viewport Header - Optimized for Mobile */}
      <div className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-40">
         <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <div className="flex items-center gap-1">
              <button 
                onClick={onClose}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="lg:hidden text-[11px] font-black uppercase tracking-tighter italic text-slate-900 dark:text-white truncate">AI Image Generator</span>
            </div>

            <Activity size={16} className="text-brand-blue shrink-0 hidden sm:inline" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 italic hidden sm:inline truncate">Dòng chảy sáng tạo Gemini</span>
         </div>
         <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {activePreviewUrl && (
              <button 
                onClick={() => setActivePreviewUrl(null)}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all whitespace-nowrap"
              >
                <ArrowLeft size={14} /> 
                <span className="hidden sm:inline">Trở lại lưới</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <input 
                type="range" min="1" max="10" 
                value={zoomLevel} onChange={e => setZoomLevel(parseInt(e.target.value))}
                className="w-16 md:w-24 h-1 bg-slate-200 dark:bg-white/10 appearance-none rounded-full accent-brand-blue cursor-pointer"
              />
            </div>
         </div>
      </div>

      <div className="flex-grow p-4 md:p-6 lg:p-8 relative flex items-center justify-center overflow-y-auto no-scrollbar">
         <AnimatePresence mode="wait">
            {activePreviewUrl ? (
              <motion.div 
                key="preview-view"
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex items-center justify-center w-full h-full"
              >
                 <div className="relative group max-w-full max-h-full rounded-sm overflow-hidden flex items-center justify-center" style={{ transform: `scale(${zoomLevel / 5})`, transition: 'transform 0.2s ease-out' }}>
                    <img src={activePreviewUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button 
                         onClick={() => onEdit(activePreviewUrl)}
                         className="p-3 bg-brand-blue text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                       >
                         <Edit3 size={18} />
                       </button>
                       <button 
                         onClick={() => onDownload(activePreviewUrl, `image_preview_${Date.now()}.png`)}
                         className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                       >
                         <Download size={18} />
                    </button>
                    </div>
                 </div>
              </motion.div>
            ) : results.length > 0 ? (
              <motion.div 
                key="grid-view"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full p-4 lg:p-10 pb-32 lg:pb-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((res) => (
                    <ImageResultCard 
                      key={res.id} 
                      res={res} 
                      isSelected={selectedIds.includes(res.id)} 
                      onToggleSelect={() => toggleSelect(res.id)} 
                      onFullscreen={(url) => setActivePreviewUrl(url)}
                      onEdit={onEdit}
                      onDelete={deleteResult}
                      onDownload={onDownload}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="welcome-slider"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full max-w-4xl max-h-full p-6 lg:p-10 flex flex-col items-center justify-center gap-4 lg:gap-6 transition-all relative overflow-hidden"
              >
                {/* Background Ambience */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 pointer-events-none">
                  <Sparkles size={200} className="text-brand-blue" />
                </div>

                {/* Main Feature Image */}
                <motion.div 
                  key={slide.id + "-image"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex-grow max-h-[50%] aspect-video rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-black"
                >
                  <img src={slide.mainImage} className="w-full h-full object-cover grayscale opacity-60 dark:opacity-80 hover:grayscale-0 transition-all duration-1000" alt={slide.title} />
                </motion.div>

                {/* Feature Content */}
                <div className="text-center space-y-2 lg:space-y-4 max-w-2xl shrink-0">
                   <motion.p 
                     key={slide.id + "-label"}
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-blue dark:text-[#dfff1a]"
                   >
                     {slide.label}
                   </motion.p>
                   <motion.h2 
                     key={slide.id + "-title"}
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                     className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic"
                   >
                     {slide.title}
                   </motion.h2>
                   <motion.p 
                     key={slide.id + "-desc"}
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="text-xs lg:text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2"
                   >
                     {slide.desc}
                   </motion.p>
                </div>

                {/* Thumbnail Selector with Arrows */}
                <div className="flex items-center gap-4 lg:gap-8 shrink-0">
                   <button 
                     onClick={handlePrev}
                     className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
                   >
                      <ChevronLeft size={18} />
                   </button>
                   
                   <div className="flex gap-2 lg:gap-3">
                      {slide.thumbnails.map((url, i) => (
                        <div 
                          key={i} 
                          className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg overflow-hidden border-2 transition-all cursor-default ${i === 5 ? 'border-brand-blue ring-2 ring-brand-blue/20 scale-105' : 'border-black/5 dark:border-white/5 opacity-30 grayscale'}`}
                        >
                          <img src={url} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                   </div>

                   <button 
                     onClick={handleNext}
                     className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
                   >
                      <ChevronRight size={18} />
                   </button>
                </div>

                {/* Bottom Action */}
                <button className="bg-slate-900 dark:bg-white/5 border border-slate-900 dark:border-white/10 text-white px-8 lg:px-10 py-2.5 lg:py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-3 active:scale-95 group shrink-0">
                   Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </main>
  );
};

const ArrowRight = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
