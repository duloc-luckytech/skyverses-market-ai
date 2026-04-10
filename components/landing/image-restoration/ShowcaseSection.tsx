import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, ZoomIn } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

// ─── Types ────────────────────────────────────────────────────
type CardSize = 'hero' | 'wide' | 'normal' | 'tall';
interface RestoreItem {
  id: string;
  before: string;
  after: string;
  label: string;
  category: string;
  subcategory: string;
  desc: string;
  size?: CardSize;
}

// ─── Data ─────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  'Portrait': '#10b981',
  'Wedding': '#8b5cf6',
  'Colorize': '#f59e0b',
  'Landscape': '#3b82f6',
  'Memorial': '#ef4444',
};

const ITEMS: RestoreItem[] = [
  {
    id: 'portrait-hero',
    before: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=20&w=800&grayscale',
    after: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=100&w=800',
    label: 'Chân Dung Gia Đình — 1950s',
    category: 'Portrait',
    subcategory: 'Face Restore · 4K Output',
    desc: 'Phục chế ảnh chân dung đen trắng — AI giữ nguyên đặc điểm khuôn mặt, nâng lên 4K sắc nét',
    size: 'hero',
  },
  {
    id: 'wedding-1',
    before: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=20&w=600&grayscale',
    after: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=100&w=600',
    label: 'Ảnh Cưới Vintage',
    category: 'Wedding',
    subcategory: 'Color Synthesis · Restored',
    desc: 'Phục chế + tô màu ảnh cưới cũ — giữ từng khoảnh khắc đặc biệt mãi mãi',
    size: 'normal',
  },
  {
    id: 'colorize-1',
    before: 'https://images.unsplash.com/photo-1547750099-5e6e95ffa01c?auto=format&fit=crop&q=20&w=600&grayscale',
    after: 'https://images.unsplash.com/photo-1547750099-5e6e95ffa01c?auto=format&fit=crop&q=100&w=600',
    label: 'Cổ Điển Được Tô Màu',
    category: 'Colorize',
    subcategory: 'B&W → Color · AI Synthesis',
    desc: 'AI tô màu thông minh cho ảnh đen trắng — màu sắc tự nhiên, chân thực như ảnh gốc',
    size: 'normal',
  },
  {
    id: 'landscape-1',
    before: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=20&w=700&grayscale',
    after: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=100&w=700',
    label: 'Phong Cảnh Thiên Nhiên',
    category: 'Landscape',
    subcategory: '8K Upscale · Noise Remove',
    desc: 'Nâng cấp ảnh phong cảnh lên 8K — xóa nhiễu, khôi phục chi tiết cây cỏ và bầu trời',
  },
  {
    id: 'memorial-1',
    before: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&q=20&w=600&grayscale',
    after: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&q=100&w=600',
    label: 'Ký Ức Gia Đình',
    category: 'Memorial',
    subcategory: 'Scratch Remove · Colorize',
    desc: 'Xóa vết xước, nếp gấp và tô màu — hồi sinh những bức ảnh kỷ niệm quý giá',
  },
  {
    id: 'portrait-2',
    before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=20&w=600&grayscale',
    after: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=100&w=600',
    label: 'Chân Dung Thế Kỷ 20',
    category: 'Portrait',
    subcategory: 'Ultra Restore · 4K',
    desc: 'Phục chế chân dung cũ với độ chính xác cao — từng sợi tóc, từng nét mặt được tái hiện',
    size: 'wide',
  },
];

// ─── Compact Before/After card ────────────────────────────────
const RestoreCard: React.FC<{ item: RestoreItem; onExpand: (item: RestoreItem) => void }> = ({ item, onExpand }) => {
  const [hover, setHover] = useState(false);
  const catColor = CAT_COLORS[item.category] ?? '#6366f1';

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.06]
        cursor-pointer select-none transition-all duration-300
        hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 hover:-translate-y-0.5
        ${item.size === 'hero' ? 'md:col-span-2 md:row-span-2' : ''}
        ${item.size === 'wide' ? 'md:col-span-2' : ''}
        ${item.size === 'tall' ? 'md:row-span-2' : ''}
      `}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Before/After side-by-side */}
      <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-[#111] ${item.size === 'hero' ? 'h-60 md:h-80' : 'h-44'}`}>
        <div className="absolute inset-0 grid grid-cols-2">
          {/* Before */}
          <div className="relative overflow-hidden">
            <img
              src={item.before}
              alt="before"
              className={`w-full h-full object-cover transition-all duration-500 ${hover ? 'scale-[1.03]' : ''} grayscale brightness-75`}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full">
              <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Trước</span>
            </div>
          </div>
          {/* After */}
          <div className="relative overflow-hidden">
            <img
              src={item.after}
              alt="after"
              className={`w-full h-full object-cover transition-all duration-500 ${hover ? 'scale-[1.03]' : ''}`}
            />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full" style={{ background: catColor + 'cc' }}>
              <span className="text-[8px] font-black uppercase tracking-widest text-white">Sau</span>
            </div>
          </div>
          {/* Center divider */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] z-10"
            style={{ background: `linear-gradient(to bottom, transparent, ${catColor}, transparent)` }}
          />
        </div>

        {/* Expand button */}
        <button
          onClick={() => onExpand(item)}
          className="absolute bottom-2 right-2 z-20 p-1.5 rounded-lg bg-black/50 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 bg-white dark:bg-[#0c0c0e]">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: catColor, background: catColor + '18' }}
          >
            {item.category}
          </span>
          <span className="text-[8px] text-slate-400 dark:text-[#555]">{item.subcategory}</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-800 dark:text-white truncate">{item.label}</p>
        <p className="text-[10px] text-slate-500 dark:text-[#666] mt-0.5 line-clamp-2 leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────
const Lightbox: React.FC<{ item: RestoreItem | null; onClose: () => void }> = ({ item, onClose }) => (
  <AnimatePresence>
    {item && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl w-full bg-white dark:bg-[#0c0c0e] rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="grid grid-cols-2 h-64 sm:h-96">
            <div className="relative overflow-hidden">
              <img src={item.before} alt="before" className="w-full h-full object-cover grayscale brightness-75" />
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full">
                <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Trước</span>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <img src={item.after} alt="after" className="w-full h-full object-cover" />
              <div
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full"
                style={{ background: (CAT_COLORS[item.category] ?? '#6366f1') + 'cc' }}
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Đã phục chế</span>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.06]">
            <p className="font-semibold text-slate-900 dark:text-white">{item.label}</p>
            <p className="text-sm text-slate-500 dark:text-[#666] mt-1">{item.desc}</p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Section ──────────────────────────────────────────────────
export const ShowcaseSection: React.FC = () => {
  const [expanded, setExpanded] = useState<RestoreItem | null>(null);

  return (
    <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04] bg-slate-50/50 dark:bg-[#060607]">
      <div className="max-w-[1400px] mx-auto">
        <FadeInUp className="mb-10">
          <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
          <h2 className="text-3xl font-bold mt-2">Trước & Sau — AI Phục Chế</h2>
          <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-lg">
            Hàng nghìn ảnh kỷ niệm đã được hồi sinh. Xem kết quả phục chế thực tế từ người dùng.
          </p>
        </FadeInUp>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 auto-rows-fr">
          {ITEMS.map((item) => (
            <RestoreCard key={item.id} item={item} onExpand={setExpanded} />
          ))}
        </div>

        {/* Bottom label */}
        <FadeInUp className="mt-8 text-center">
          <p className="text-[11px] text-slate-400 dark:text-[#555] flex items-center justify-center gap-2">
            <ZoomIn size={13} className="text-emerald-500" />
            Click vào ảnh để xem chi tiết · Tất cả kết quả từ AI phục chế thực tế
          </p>
        </FadeInUp>
      </div>

      <Lightbox item={expanded} onClose={() => setExpanded(null)} />
    </section>
  );
};
