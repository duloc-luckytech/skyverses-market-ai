
import React from 'react';
import { Bookmark, Users, Heart, Zap, Eye, ArrowRight } from 'lucide-react';
import { Solution, Language } from '../../types';

interface SolutionCardProps {
  sol: Solution;
  idx: number;
  lang: string;
  isLiked: boolean;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onClick: (slug: string) => void;
  onHover?: (slug: string) => void;
  onQuickView?: (e: React.MouseEvent, sol: Solution) => void;
  stats: { users: string; likes: string };
  isGrid?: boolean;
}

const SolutionCardComponent: React.FC<SolutionCardProps> = ({ 
  sol, idx, lang, isLiked, isFavorited, onToggleFavorite, onToggleLike, onClick, onHover, onQuickView, stats, isGrid = false 
}) => {
  const targetId = sol._id || sol.id;
  const currentLang = lang as Language;

  return (
    <div 
      onClick={() => onClick(sol.slug)}
      onMouseEnter={() => onHover?.(sol.slug)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(sol.slug); } }}
      role="article"
      aria-label={sol.name?.[currentLang] || sol.name?.en || 'Product'}
      tabIndex={0}
      className={`flex-shrink-0 snap-start group relative flex flex-col bg-[var(--atlas-bg-panel)] border border-[var(--atlas-border)] hover:border-atlas-purple/40 transition-all duration-300 ease-atlas hover:shadow-atlas-glow-soft hover:-translate-y-1 rounded-atlas-card overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-atlas-purple/50 ${
        isGrid ? 'w-full' : 'w-[280px] md:w-[320px] xl:w-[360px]'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <img 
          src={sol.imageUrl} 
          alt={sol.name[currentLang]} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" 
        />

        {/* ── Hover Action Buttons Overlay ── */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-400 z-40">
          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(e, sol); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.15] hover:bg-white/25 backdrop-blur-lg border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 shadow-atlas-lg scale-90 group-hover:scale-100 translate-y-2 group-hover:translate-y-0"
              style={{ transitionDelay: '50ms' }}
              aria-label="Quick view"
            >
              <Eye size={13} className="text-white" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">Quick View</span>
            </button>
          )}

          {/* Detail Button — Atlas gradient */}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(sol.slug); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-atlas-cta backdrop-blur-lg rounded-full transition-all duration-300 shadow-atlas-glow scale-90 group-hover:scale-100 translate-y-2 group-hover:translate-y-0"
            style={{ transitionDelay: '100ms' }}
            aria-label="View detail"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">Detail</span>
            <ArrowRight size={12} className="text-white" />
          </button>
        </div>

        {/* Favorite bookmark */}
        <button
          onClick={(e) => onToggleFavorite(e, sol.id)}
          className={`absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2.5 bg-black/40 backdrop-blur-md rounded-full border transition-all z-30 ${isFavorited ? 'text-white border-atlas-purple/60 bg-atlas-purple/80' : 'text-white/60 border-white/[0.15] hover:text-white hover:border-white/30'}`}
        >
          <Bookmark fill="currentColor" className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
        </button>

        {/* Category badge */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4">
          <span className="bg-black/70 backdrop-blur-md text-white border border-white/[0.15] px-1.5 md:px-3 py-0.5 md:py-1 text-[7px] md:text-[10px] font-semibold uppercase tracking-widest rounded">{sol.category[currentLang]}</span>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-grow flex flex-col gap-3 md:gap-5 bg-[var(--atlas-bg-panel)]">
        <div className="space-y-2">
          <h3 className="text-sm md:text-lg font-bold tracking-tight text-[var(--atlas-text-primary)] flex-grow pr-2 truncate">{sol.name[currentLang]}</h3>
          <p className="text-[var(--atlas-text-secondary)] text-[11px] md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3">{sol.description[currentLang]}</p>
        </div>
        <div className="mt-auto pt-3 flex justify-between items-center border-t border-[var(--atlas-border)]">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-1 md:gap-1.5 text-[var(--atlas-text-muted)]"><Users size={12} /><span className="text-[10px] font-semibold">{stats.users}</span></div>
            <button onClick={(e) => onToggleLike(e, targetId)} className={`flex items-center gap-1 md:gap-1.5 transition-all ${isLiked ? 'text-red-500' : 'text-[var(--atlas-text-muted)] hover:text-red-500'}`}><Heart size={12} fill="currentColor" /><span className="text-[10px] font-semibold">{stats.likes}</span></button>
          </div>
          <div>
            {sol.isFree ? (
              <span className="px-2 py-0.5 bg-atlas-success/10 border border-atlas-success/30 text-atlas-success text-[10px] font-bold uppercase tracking-wider rounded">FREE</span>
            ) : (
              <div className="flex items-center gap-1.5 pl-1 pr-2 py-1 bg-atlas-purple/8 border border-atlas-purple/20 rounded-full">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-atlas-cta flex items-center justify-center text-white">
                  <Zap fill="currentColor" className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-atlas-purple leading-none">{sol.priceCredits}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SolutionCard = React.memo(SolutionCardComponent);
