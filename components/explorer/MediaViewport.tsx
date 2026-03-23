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
    <div className="flex-grow w-full h-full flex flex-col relative bg-slate-50 dark:bg-[#080810] overflow-hidden transition-colors">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] rounded-full blur-[100px]" />
      </div>

      {/* Media Container */}
      <div className="flex-grow flex items-center justify-center p-0 md:p-8 lg:p-12 h-full">
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full max-w-5xl max-h-full flex items-center justify-center"
        >
          {is3D ? (
            <div className="w-full h-full md:rounded-2xl overflow-hidden shadow-lg border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#0a0a0e]">
              <ThreeDPreview modelUrl={mainUrl} />
            </div>
          ) : isVideo ? (
            <div className="relative w-full h-full md:rounded-2xl overflow-hidden shadow-lg border border-black/[0.04] dark:border-white/[0.04] bg-black group/vid">
              <video 
                src={mainUrl} autoPlay={isPlaying} loop muted={isMuted} playsInline
                className="w-full h-full object-contain"
              />
              {/* Video controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover/vid:opacity-100 transition-opacity bg-white/90 dark:bg-black/70 backdrop-blur-xl px-5 py-2 rounded-full border border-black/[0.06] dark:border-white/[0.06] shadow-lg">
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-slate-700 dark:text-white hover:text-brand-blue transition-colors">
                  {isPlaying ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
                </button>
                <div className="w-px h-4 bg-black/[0.06] dark:bg-white/10" />
                <button onClick={() => setIsMuted(!isMuted)} className="text-slate-700 dark:text-white hover:text-brand-blue transition-colors">
                  {isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                </button>
              </div>
            </div>
          ) : (
            <img 
              src={mainUrl} 
              className="w-full h-full md:w-auto md:h-auto max-w-full max-h-full object-contain md:shadow-lg md:rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#0a0a0e]" 
              alt={title} 
            />
          )}
        </motion.div>
      </div>

      {/* 3D Interactive Guides */}
      {is3D && (
        <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/[0.06] pointer-events-none z-30">
          <div className="flex items-center gap-1.5">
            <MousePointer2 size={11} className="text-brand-blue" />
            <span className="text-[10px] font-medium text-white/60">{t('explorer.modal.3d_drag')}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Box size={11} className="text-brand-blue" />
            <span className="text-[10px] font-medium text-white/60">{t('explorer.modal.3d_interactive')}</span>
          </div>
        </div>
      )}

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-3 left-3 right-3 hidden md:flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-4 px-4 py-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full border border-black/[0.04] dark:border-white/[0.04]">
          <span className="text-[11px] font-medium text-brand-blue">{t(`explorer.type.${type}`)}</span>
          <div className="w-px h-3 bg-black/[0.06] dark:bg-white/10" />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-gray-500">
            <Eye size={12} /> {views}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${isLiked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/80 dark:bg-black/50 border-black/[0.04] dark:border-white/[0.06] text-slate-400 hover:text-red-500'}`}
          >
            <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button className="p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border border-black/[0.04] dark:border-white/[0.06] text-slate-400 hover:text-brand-blue transition-all">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaViewport;