
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, GalleryHorizontalEnd, ImageIcon, Sparkles, Camera, Layers } from 'lucide-react';
import MediaViewport from './explorer/MediaViewport';
import SidebarHeader from './explorer/SidebarHeader';
import ContentInfo from './explorer/ContentInfo';
import TechnicalSpecs from './explorer/TechnicalSpecs';
import TagSection from './explorer/TagSection';
import ActionFooter from './explorer/ActionFooter';
import UpscaleWorkspace from './UpscaleWorkspace';
import Art3DWorkspace from './Art3DWorkspace';
import { useArt3DGenerator } from '../hooks/useArt3DGenerator';

export interface ExplorerItem {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'prompt' | 'game_asset' | 'game_asset_3d' | 'text_video' | 'image_video' | 'character' | 'cinematic' | 'gameplay';
  thumbnailUrl: string;
  mediaUrl: string;
  url?: string;
  tags?: string[];
  categories?: string[];
  authorName?: string;
  author?: string;
  authorHandle?: string;
  prompt?: string;
  engine?: string;
  model?: string;
  modelKey?: string;
  resolution?: string;
  seed?: number;
  views?: number;
  likes?: number;
  meta?: Record<string, any>;
  createdAt?: string;
  status?: string;
}

interface ExplorerDetailModalProps {
  item: ExplorerItem | null;
  onClose: () => void;
  albumItems?: ExplorerItem[];
}

const ExplorerDetailModal: React.FC<ExplorerDetailModalProps> = ({ item, onClose, albumItems }) => {
  const navigate = useNavigate();
  const [isUpscaleOpen, setIsUpscaleOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeAlbumItem, setActiveAlbumItem] = useState<ExplorerItem | null>(null);

  // Khởi tạo logic 3D để dùng trong Workspace
  const art3dLogic = useArt3DGenerator();

  // Reset active album item when modal closes/opens
  React.useEffect(() => {
    if (!item) setActiveAlbumItem(null);
  }, [item]);

  if (!item) return null;

  // Use active album item for media display, fallback to main item
  const displayItem = activeAlbumItem || item;

  const isAlbumMode = albumItems && albumItems.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-white dark:bg-[var(--atlas-bg-page)] flex flex-col md:flex-row overflow-hidden transition-colors"
      >
        {/* LEFT COLUMN */}
        <div className="flex-grow w-full h-[45vh] md:h-full flex flex-col relative overflow-hidden">
          {/* Mobile close button */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 md:hidden">
            <button onClick={onClose} className="p-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-xl text-slate-700 dark:text-white border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
              <X size={18} />
            </button>
            <button className="p-2.5 bg-brand-blue text-white rounded-xl shadow-sm">
              <Heart size={14} fill="currentColor" />
            </button>
          </div>

          {isAlbumMode ? (
            /* ── Album mode: scrollable gallery grid on left ── */
            <div className="w-full h-full flex flex-col bg-[#0a0e14] dark:bg-[#0a0e14]">
              {/* Album header */}
              <div className="shrink-0 px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <h2 className="text-[18px] font-bold text-white" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                  {item.title}
                </h2>
                <p className="text-[12px] text-white/40 mt-1">{albumItems.length} photos · Click to view details</p>
              </div>
              {/* Scrollable gallery */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {albumItems.map(albumItem => (
                    <div
                      key={albumItem.id}
                      onClick={() => setActiveAlbumItem(albumItem)}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 group/card ${
                        activeAlbumItem?.id === albumItem.id
                          ? 'border-[#C9A84C] shadow-lg shadow-[#C9A84C]/20 scale-[0.97]'
                          : 'border-transparent hover:border-[#C9A84C]/30 hover:shadow-lg'
                      }`}
                    >
                      <img
                        src={albumItem.thumbnailUrl}
                        alt={albumItem.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Overlay gradient + label */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <p className="text-[11px] font-medium text-white/90 truncate">{albumItem.description || albumItem.title}</p>
                      </div>
                      {/* Active indicator */}
                      {activeAlbumItem?.id === albumItem.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center">
                          <ImageIcon size={10} className="text-black" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Normal mode: single media viewport ── */
            <MediaViewport
              mediaUrl={displayItem.mediaUrl}
              thumbnailUrl={displayItem.thumbnailUrl}
              type={displayItem.type}
              title={displayItem.title}
              views={displayItem.views || 0}
            />
          )}
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="w-full md:w-[420px] h-[55vh] md:h-full bg-white dark:bg-[var(--atlas-bg-panel)] border-l border-black/[0.04] dark:border-white/[0.04] flex flex-col shrink-0 z-[60] transition-colors">

          <SidebarHeader
            authorName={item.authorName || 'Skyverses Creator'}
            onClose={onClose}
          />

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto no-scrollbar px-5 py-5 space-y-6">
            {isAlbumMode ? (
              /* ══════ ALBUM MODE — Luxury sidebar ══════ */
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAlbumItem?.id || 'album-cover'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  {activeAlbumItem ? (
                    /* ── Selected item detail ── */
                    <>
                      {/* Hero image with parallax-like reveal */}
                      <motion.div
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="relative rounded-lg overflow-hidden"
                        style={{ boxShadow: '0 8px 40px rgba(201,168,76,0.12), 0 0 0 1px rgba(201,168,76,0.15)' }}
                      >
                        <img
                          src={activeAlbumItem.mediaUrl}
                          alt={activeAlbumItem.title}
                          className="w-full aspect-[4/3] object-cover"
                        />
                        {/* Cinematic gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                        {/* Bottom floating label */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                          className="absolute bottom-3 left-3 right-3 flex items-end justify-between"
                        >
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]/80 font-semibold">{activeAlbumItem.tags?.[2] || 'Fashion'}</p>
                            <p className="text-[14px] font-bold text-white mt-0.5" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>{activeAlbumItem.description || activeAlbumItem.title}</p>
                          </div>
                          <div className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', backdropFilter: 'blur(8px)' }}>
                            {activeAlbumItem.resolution}
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Product title — editorial style */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-px bg-gradient-to-r from-[#C9A84C] to-transparent" />
                          <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9A84C] font-bold">Collection Piece</span>
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                          {activeAlbumItem.title}
                        </h3>
                      </motion.div>

                      {/* Prompt — luxury card */}
                      {activeAlbumItem.prompt && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25, duration: 0.4 }}
                          className="relative rounded-xl p-4 overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 100%)', border: '1px solid rgba(201,168,76,0.12)' }}
                        >
                          <div className="absolute top-3 right-3">
                            <Sparkles size={12} className="text-[#C9A84C]/30" />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]/60 font-semibold mb-2">AI Prompt</p>
                          <p className="text-[12px] text-slate-600 dark:text-white/50 leading-relaxed italic" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                            "{activeAlbumItem.prompt}"
                          </p>
                        </motion.div>
                      )}

                      {/* Specs — inline luxury pills */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="flex flex-wrap gap-2"
                      >
                        {[
                          { icon: <Camera size={10} />, label: activeAlbumItem.modelKey || 'AI' },
                          { icon: <Layers size={10} />, label: activeAlbumItem.engine || 'Engine' },
                          { icon: <Sparkles size={10} />, label: activeAlbumItem.resolution || 'HD' },
                        ].map((spec, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 + i * 0.05 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                          >
                            <span className="text-[#C9A84C]/60">{spec.icon}</span>
                            {spec.label}
                          </motion.span>
                        ))}
                      </motion.div>

                      {/* Tags */}
                      <TagSection tags={activeAlbumItem.tags} categories={activeAlbumItem.categories} />
                    </>
                  ) : (
                    /* ── Album cover — no selection yet ── */
                    <>
                      {/* Cover hero */}
                      <motion.div
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-lg overflow-hidden"
                        style={{ boxShadow: '0 8px 40px rgba(201,168,76,0.15), 0 0 0 1px rgba(201,168,76,0.1)' }}
                      >
                        <img src={item.mediaUrl} alt={item.title} className="w-full aspect-[4/3] object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A84C] font-bold mb-1">Fashion AI</p>
                          <p className="text-[15px] font-bold text-white" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>{item.title}</p>
                        </div>
                      </motion.div>

                      {/* Collection stats — animated counters */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 gap-2"
                      >
                        {[
                          { value: albumItems.length, label: 'Photos', icon: <Camera size={14} /> },
                          { value: '5', label: 'Categories', icon: <Layers size={14} /> },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.1 }}
                            className="rounded-xl p-3 text-center"
                            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)', border: '1px solid rgba(201,168,76,0.1)' }}
                          >
                            <div className="text-[#C9A84C]/50 flex justify-center mb-1.5">{stat.icon}</div>
                            <p className="text-[20px] font-bold text-white" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>{stat.value}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mt-0.5">{stat.label}</p>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Description */}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-px bg-gradient-to-r from-[#C9A84C] to-transparent" />
                          <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9A84C] font-bold">About</span>
                        </div>
                        <p className="text-[12px] text-white/40 leading-relaxed" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                          {item.description}
                        </p>
                      </motion.div>

                      {/* Category tags — staggered entrance */}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-1.5">
                        {['Haute Couture', 'Runway', 'Streetwear', 'Accessories', 'Editorial'].map((tag, i) => (
                          <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.45 + i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider"
                            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)', color: '#C9A84C' }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </motion.div>

                      {/* Hint */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-[11px] text-white/20 text-center italic"
                      >
                        Select a photo to view details
                      </motion.p>
                    </>
                  )}

                  {/* View Collection in Explorer */}
                  {displayItem.categories?.includes('fashion') && (
                    <motion.button
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => { onClose(); navigate('/explorer?search=fashion'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}
                    >
                      <GalleryHorizontalEnd size={16} />
                      <span>Xem bộ sưu tập Fashion</span>
                      <span className="ml-auto text-[11px] opacity-60">Explorer</span>
                    </motion.button>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              /* ══════ NORMAL MODE — unchanged ══════ */
              <>
                <ContentInfo
                  title={displayItem.title}
                  description={displayItem.description}
                  prompt={displayItem.prompt}
                  referenceImage={displayItem.meta?.referenceImage}
                />
                <TechnicalSpecs
                  modelKey={displayItem.modelKey}
                  engine={displayItem.engine}
                  resolution={displayItem.resolution}
                  seed={displayItem.seed}
                  createdAt={displayItem.createdAt}
                />
                <TagSection
                  tags={displayItem.tags}
                  categories={displayItem.categories}
                />
                {displayItem.categories?.includes('fashion') && (
                  <button
                    onClick={() => { onClose(); navigate('/explorer?search=fashion'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}
                  >
                    <GalleryHorizontalEnd size={16} />
                    <span>Xem bộ sưu tập Fashion</span>
                    <span className="ml-auto text-[11px] opacity-60">Explorer</span>
                  </button>
                )}
                {displayItem.categories?.includes('showcase') && !displayItem.categories?.includes('fashion') && (
                  <button
                    onClick={() => { onClose(); navigate('/explorer?search=showcase'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'rgba(112,54,240,0.08)', border: '1px solid rgba(112,54,240,0.2)', color: 'var(--atlas-purple, #7036F0)' }}
                  >
                    <GalleryHorizontalEnd size={16} />
                    <span>Xem bộ sưu tập trong Explorer</span>
                    <span className="ml-auto text-[11px] opacity-60">Explorer</span>
                  </button>
                )}
              </>
            )}
          </div>

          <ActionFooter
            mediaUrl={displayItem.mediaUrl || displayItem.thumbnailUrl}
            type={displayItem.type}
            onUpscale={() => setIsUpscaleOpen(true)}
            onOpenStudio={() => setIsStudioOpen(true)}
          />
        </aside>

        {/* OVERLAY CÔNG CỤ UPSCALE */}
        <AnimatePresence>
          {isUpscaleOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-2xl overflow-hidden"
            >
              <UpscaleWorkspace 
                onClose={() => setIsUpscaleOpen(false)} 
                initialImage={item.mediaUrl || item.thumbnailUrl}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* OVERLAY CÔNG CỤ 3D STUDIO */}
        <AnimatePresence>
          {isStudioOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="fixed inset-0 z-[1200] bg-[var(--atlas-bg-panel)] overflow-hidden"
            >
              <Art3DWorkspace 
                onClose={() => setIsStudioOpen(false)} 
                logic={{
                  ...art3dLogic,
                  // Ghi đè model mặc định bằng model hiện tại từ Explorer
                  assets: [{
                    id: 'explorer-asset',
                    name: item.title,
                    thumb: item.thumbnailUrl,
                    type: 'Textured',
                    faces: 'Calculated...',
                    vertices: 'Calculated...'
                  }, ...art3dLogic.assets]
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExplorerDetailModal;
