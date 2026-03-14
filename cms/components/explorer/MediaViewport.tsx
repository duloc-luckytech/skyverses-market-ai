import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Eye, Heart, Share2, MousePointer2, Box } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ThreeDPreview from './ThreeDPreview';

interface MediaViewportProps {
  mediaUrl: string;
  thumbnailUrl: string;
  type: string;
  title: string;
  views: number;
}

const MediaViewport: React.FC<MediaViewportProps> = ({ mediaUrl, thumbnailUrl, type, title, views }) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  
  const mainUrl = mediaUrl || thumbnailUrl;
  const isVideo = type === 'video' || mainUrl.toLowerCase().endsWith('.mp4');
  const is3D = type === 'game_asset_3d';

  return (
    <div className="flex-grow w-full h-full flex flex-col relative bg-slate-50 dark:bg-[#050505] overflow-hidden group transition-colors duration-500">
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex-grow flex items-center justify-center p-0 md:p-12 lg:p-20 h-full">
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center"
        >
          {is3D ? (
            <div className="w-full h-full md:rounded-2xl overflow-hidden shadow-2xl border-y md:border border-black/5 dark:border-white/5 bg-slate-50 dark:bg-[#08080a] transition-colors">
              <ThreeDPreview modelUrl={mainUrl} />
            </div>
          ) : isVideo ? (
            <div className="relative w-full h-full md:rounded-2xl overflow-hidden shadow-2xl border-y md:border border-black/5 dark:border-white/5 bg-black group/vid">
               <video 
                 src={mainUrl} 
                 autoPlay={isPlaying}
                 loop 
                 muted={isMuted}
                 playsInline
                 className="w-full h-full object-contain"
               />
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-0 group-hover/vid:opacity-100 transition-opacity bg-white/90 dark:bg-black/40 backdrop-blur-xl px-8 py-3 rounded-full border border-black/5 dark:border-white/10 shadow-2xl">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="text-slate-900 dark:text-white hover:text-brand-blue transition-colors">
                     {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                  </button>
                  <button onClick={() => setIsMuted(!isMuted)} className="text-slate-900 dark:text-white hover:text-brand-blue transition-colors">
                     {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                  </button>
               </div>
            </div>
          ) : (
            <img 
              src={mainUrl} 
              className="w-full h-full md:w-auto md:h-auto max-w-full max-h-full object-contain md:shadow-2xl md:rounded-2xl border-y md:border border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]" 
              alt={title} 
            />
          )}
        </motion.div>
      </div>

      {/* 3D Interactive Guides */}
      {is3D && (
        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 pointer-events-none transition-all z-30">
          <div className="flex items-center gap-2">
            <MousePointer2 size={10} className="text-brand-blue" />
            <span className="text-[7px] md:text-[8px] font-black uppercase text-white/60 tracking-widest">{t('explorer.modal.3d_drag')}</span>
          </div>
          <div className="w-px h-2 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <Box size={10} className="text-brand-blue" />
            <span className="text-[7px] md:text-[8px] font-black uppercase text-white/60 tracking-widest">{t('explorer.modal.3d_interactive')}</span>
          </div>
        </div>
      )}

      {/* Viewport HUD Stats - Hide on mobile to avoid clutter */}
      <div className="absolute bottom-4 left-4 right-4 hidden md:flex items-center justify-between text-slate-400 dark:text-white/20 uppercase mono pointer-events-none font-bold z-20">
         <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-[10px] tracking-widest text-brand-blue uppercase">{t(`explorer.type.${type}`)}</span>
           </div>
           <div className="h-6 w-px bg-black/10 dark:bg-white/10"></div>
           <div className="flex items-center gap-3">
              <Eye size={14} className="text-brand-blue" />
              <span className="text-[10px] tracking-widest uppercase">{views} {t('explorer.modal.views')}</span>
           </div>
         </div>

         <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-full border transition-all ${isLiked ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-black/20 border-white/10 text-white hover:bg-white/10'}`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button className="p-2.5 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white/10 transition-all">
              <Share2 size={16} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default MediaViewport;