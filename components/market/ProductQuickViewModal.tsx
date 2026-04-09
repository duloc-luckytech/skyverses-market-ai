
import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, Heart, Bookmark, ArrowRight, Sparkles, ExternalLink, Tag } from 'lucide-react';
import { Solution, Language } from '../../types';

interface ProductQuickViewModalProps {
  sol: Solution | null;
  lang: string;
  isLiked: boolean;
  isFavorited: boolean;
  fakeStats: { users: string; likes: string };
  onClose: () => void;
  onNavigate: (slug: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
}

const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  sol,
  lang,
  isLiked,
  isFavorited,
  fakeStats,
  onClose,
  onNavigate,
  onToggleFavorite,
  onToggleLike,
}) => {
  const currentLang = lang as Language;

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    if (sol) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown, sol]);

  return (
    <AnimatePresence>
      {sol && (
        <>
          {/* Backdrop */}
          <motion.div
            key="qv-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[900] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            key="qv-panel"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[901] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-[780px] bg-white dark:bg-[#0d0d0f] rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border border-black/[0.06] dark:border-white/[0.06] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 backdrop-blur-md rounded-full border border-black/[0.06] dark:border-white/[0.06] text-slate-700 dark:text-white transition-all duration-200"
                aria-label="Close quick view"
              >
                <X size={15} />
              </button>

              {/* Layout: Left image + Right info */}
              <div className="flex flex-col md:flex-row">
                {/* ── Left: Image ── */}
                <div className="relative w-full md:w-[340px] aspect-[16/10] md:aspect-auto md:min-h-[360px] flex-shrink-0 overflow-hidden bg-black">
                  <img
                    src={sol.imageUrl}
                    alt={sol.name[currentLang]}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 md:to-black/30" />

                  {/* Category tag */}
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-brand-blue/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-[0.25em] rounded-md">
                      {sol.category[currentLang]}
                    </span>
                  </div>

                  {/* Price bottom left */}
                  <div className="absolute bottom-4 left-4">
                    {sol.isFree ? (
                      <span className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                        FREE
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                        <Zap size={11} className="text-brand-blue" fill="currentColor" />
                        <span className="text-sm font-black text-white">{sol.priceCredits}</span>
                        <span className="text-[8px] text-white/50 font-bold">credits</span>
                      </div>
                    )}
                  </div>

                  {/* Bookmark bottom right */}
                  <button
                    onClick={(e) => onToggleFavorite(e, sol.id)}
                    className={`absolute bottom-4 right-4 p-2 backdrop-blur-md rounded-full border transition-all ${
                      isFavorited
                        ? 'bg-brand-blue/20 border-brand-blue/50 text-brand-blue'
                        : 'bg-black/40 border-white/10 text-white/50 hover:text-brand-blue hover:border-brand-blue/40'
                    }`}
                  >
                    <Bookmark fill="currentColor" size={14} />
                  </button>
                </div>

                {/* ── Right: Info ── */}
                <div className="flex-1 p-6 md:p-8 flex flex-col gap-5 overflow-y-auto max-h-[70vh] md:max-h-[480px] no-scrollbar">
                  {/* Quick View badge */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full">
                      <Sparkles size={10} className="text-brand-blue" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-blue">Quick View</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-brand-blue italic leading-tight mb-2">
                      {sol.name[currentLang]}
                    </h2>
                    <p className="text-[12px] md:text-[13px] text-slate-500 dark:text-white/50 leading-relaxed italic">
                      "{sol.description[currentLang]}"
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 pb-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users size={13} />
                      <span className="text-[11px] font-bold">{fakeStats.users} users</span>
                    </div>
                    <button
                      onClick={(e) => onToggleLike(e, sol._id || sol.id)}
                      className={`flex items-center gap-1.5 transition-all ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                    >
                      <Heart size={13} fill="currentColor" />
                      <span className="text-[11px] font-bold">{fakeStats.likes}</span>
                    </button>
                    {sol.complexity && (
                      <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[8px] font-black uppercase tracking-wider rounded-sm">
                        {sol.complexity}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {sol.tags && sol.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sol.tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[8px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide"
                        >
                          <Tag size={7} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Platforms */}
                  {sol.platforms && sol.platforms.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Platform:</span>
                      <div className="flex gap-1.5">
                        {sol.platforms.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-[8px] font-bold text-slate-600 dark:text-gray-300 uppercase"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {/* Primary: Go to landing */}
                    <button
                      onClick={() => { onClose(); onNavigate(sol.slug); }}
                      className="group flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[13px] shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden relative"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                        <ExternalLink size={14} />
                        Xem chi tiết
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>

                    {/* Secondary: Close */}
                    <button
                      onClick={onClose}
                      className="px-5 py-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-gray-300 font-bold text-[13px] transition-all duration-200"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickViewModal;
