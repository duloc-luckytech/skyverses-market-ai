import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, SplitSquareHorizontal } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

// ─── Types ────────────────────────────────────────────────────
type CardSize = 'hero' | 'wide' | 'normal' | 'tall';
interface REItem {
  id: string;
  url: string;
  label: string;
  category: string;
  subcategory: string;
  desc: string;
  size?: CardSize;
  isBeforeAfter?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  'Exterior Render': '#10b981',
  'Interior Staging': '#8b5cf6',
  'Phối cảnh tổng thể': '#f59e0b',
  'Marketing BĐS': '#3b82f6',
  'Before / After': '#ef4444',
};

const ITEMS: REItem[] = [
  // ── Featured hero ──
  {
    id: 'aerial',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/12a7a681-9e53-4ec3-9cee-38003a483c00/public',
    label: 'Khu Biệt Thự Gated — Aerial View',
    category: 'Phối cảnh tổng thể',
    subcategory: 'Drone CGI · 1200×675',
    desc: 'Bird\'s-eye view toàn khu biệt thự: villa cluster, hồ trung tâm, clubhouse, tennis, rừng nhiệt đới',
    size: 'hero',
  },
  // ── Col right of hero ──
  {
    id: 'penthouse-pool',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/48a43d0f-08ba-4b71-14c1-e4603c4b2600/public',
    label: 'Penthouse Rooftop Pool',
    category: 'Interior Staging',
    subcategory: 'Infinity Pool · Blue Hour',
    desc: 'Hồ bơi vô cực skyline HCMC — blue hour dramatic, teak lounger, fire pit',
    size: 'normal',
  },
  {
    id: 'villa-new',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8842a298-f892-4b62-f94b-1ac9f469bd00/public',
    label: 'Villa Nhiệt Đới Cao Cấp',
    category: 'Exterior Render',
    subcategory: 'Colonial · Golden Hour',
    desc: 'Render ngoại thất villa hoàng hôn — colonial trắng, hồ bơi, cây xanh tropical',
    size: 'normal',
  },

  // ── Row 2 — 3 columns ──
  {
    id: 'shophouse',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/33421812-02bb-4f04-578f-5c1dcf094500/public',
    label: 'Shophouse Mặt Phố',
    category: 'Exterior Render',
    subcategory: 'Urban · Phối cảnh',
    desc: 'CGI shophouse đô thị — ánh sáng ban chiều, phản chiếu kính commercial',
  },
  {
    id: 'interior-staging',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/93377933-e63d-4a4f-c04d-4a3ddfb55100/public',
    label: 'Phòng Khách Premium',
    category: 'Interior Staging',
    subcategory: 'Multi-style · 5 phong cách',
    desc: 'AI staging 5 phong cách: Scandi, Nhật, Industrial, Modern, Classic trong cùng 1 không gian',
  },
  {
    id: 'master-bedroom',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/7699ac3d-8084-44a5-2d78-178b91a87300/public',
    label: 'Master Bedroom Suite',
    category: 'Interior Staging',
    subcategory: 'Luxury Hotel Style',
    desc: 'Walk-in wardrobe, en-suite bathtub nhìn vườn — warm luxury hotel atmosphere',
  },

  // ── Row 3 — before/after wide + normal ──
  {
    id: 'before-after',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/94d3c575-1b1a-421a-5c1a-b58838d03000/public',
    label: 'Before vs After Staging',
    category: 'Before / After',
    subcategory: 'Split Screen · Visual Proof',
    desc: 'Từ phòng ngủ trống bê tông thô → nội thất luxury hoàn chỉnh — cùng góc máy',
    size: 'wide',
    isBeforeAfter: true,
  },
  {
    id: 'project-marketing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/6a742a57-39cd-47fe-5250-ded4f00e7600/public',
    label: 'Master Plan Aerial',
    category: 'Marketing BĐS',
    subcategory: 'Developer · Brochure',
    desc: 'Phối cảnh aerial khu đô thị — bird\'s-eye tháp cao tầng, hồ, tiện ích, cây xanh',
  },

  // ── Row 4 — 3 columns ──
  {
    id: 'office',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/92cdb56a-e9a6-42ee-2c7f-50035a7f9100/public',
    label: 'Văn Phòng Tầm Nhìn',
    category: 'Exterior Render',
    subcategory: 'Commercial · Skyline view',
    desc: 'Render văn phòng thương mại — full city view, nội thất hiện đại, lighting tự nhiên',
  },
  {
    id: 'apartment-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/95958aa7-e6b3-498a-1230-1ee10c2a4200/public',
    label: 'Penthouse City View',
    category: 'Interior Staging',
    subcategory: 'Penthouse · HCMC',
    desc: 'Virtual staging penthouse cao tầng — panoramic skyline HCMC, nội thất cao cấp',
  },
  {
    id: 'office-coworking',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2f55d072-f86e-4345-5c07-511591204e00/public',
    label: 'Co-working Biophilic',
    category: 'Interior Staging',
    subcategory: 'Office · Biophilic Design',
    desc: 'Co-working HCMC — green wall, pod workstation, phòng họp kính, tầm nhìn skyline',
  },

  // ── Row 5 — 2 wide ──
  {
    id: 'villa-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/011d3f36-e9db-4c52-acfe-dce49465f900/public',
    label: 'Villa Biệt Thự Luxury',
    category: 'Exterior Render',
    subcategory: 'Tropical · Evening Light',
    desc: 'Phối cảnh biệt thự tropical — hồ bơi riêng, sân vườn manicured, chiều vàng',
  },
  {
    id: 'shophouse-new',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/e7c5a0e9-8457-4fdf-5709-27525ae7c700/public',
    label: 'Shophouse 5 Tầng Industrial',
    category: 'Exterior Render',
    subcategory: 'Industrial Modern · 5F',
    desc: 'Shophouse đô thị kết hợp brick + bê tông + thép — industrial modern, tầng trệt retail',
  },

  // ── Row 6 ──
  {
    id: 'apartment-staging',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d64f9c02-3c5a-4db0-9679-5779dc733100/public',
    label: 'Căn Hộ View Thành Phố',
    category: 'Interior Staging',
    subcategory: 'HCMC · Floor-to-ceiling',
    desc: 'Staging phòng khách căn hộ — floor-to-ceiling glass, sofa linen, marble, ánh hoàng hôn',
  },
  {
    id: 'penthouse-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/a5409ee6-054b-4423-a5a6-7aa3e0a84200/public',
    label: 'Sky Deck & Infinity Pool',
    category: 'Exterior Render',
    subcategory: 'Penthouse · River View',
    desc: 'Rooftop infinity pool nhìn sông — tịnh chiều xanh, deck teak, ánh đèn thành phố',
  },
];

const CATEGORIES = ['Tất cả', 'Exterior Render', 'Interior Staging', 'Phối cảnh tổng thể', 'Marketing BĐS', 'Before / After'];

// ─── Helpers ──────────────────────────────────────────────────
const catColor = (cat: string) => CAT_COLORS[cat] ?? '#10b981';

// ─── Card ─────────────────────────────────────────────────────
const RECard: React.FC<{
  item: REItem;
  index: number;
  colSpan?: string;
  rowSpan?: string;
  onOpen: () => void;
}> = ({ item, index, colSpan = '', rowSpan = '', onOpen }) => {
  const [hov, setHov] = useState(false);
  const color = catColor(item.category);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${colSpan} ${rowSpan}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      onClick={onOpen}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-20"
        animate={{
          boxShadow: hov
            ? `inset 0 0 0 1.5px ${color}80, 0 16px 48px ${color}20`
            : 'inset 0 0 0 0px transparent',
        }}
        transition={{ duration: 0.22 }}
      />

      {/* Image */}
      <div className="relative w-full h-full overflow-hidden bg-slate-900">
        <img
          src={item.url}
          alt={item.label}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        {/* Subtle permanent dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      </div>

      {/* Category chip — always visible top-left */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/55 backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[8.5px] font-bold tracking-wider uppercase text-white/80 whitespace-nowrap">
          {item.category}
        </span>
      </div>

      {/* Before/After badge */}
      {item.isBeforeAfter && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/50 backdrop-blur-md">
          <SplitSquareHorizontal size={9} className="text-red-400" />
          <span className="text-[8px] font-bold text-red-400 uppercase tracking-wide">Split View</span>
        </div>
      )}

      {/* Bottom info — always visible */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        {/* Subcategory */}
        <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: `${color}cc` }}>
          {item.subcategory}
        </p>
        <h3 className="text-sm font-bold text-white leading-tight drop-shadow-md">
          {item.label}
        </h3>
      </div>

      {/* Hover overlay — extra info */}
      <AnimatePresence>
        {hov && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-15 flex flex-col justify-end"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.15) 100%)' }}
          >
            {/* Top-right expand */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04, type: 'spring', stiffness: 400, damping: 22 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center"
            >
              <Maximize2 size={12} className="text-white" />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="p-4 pt-8"
            >
              <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: `${color}cc` }}>
                {item.subcategory}
              </p>
              <h3 className="text-[14px] font-bold text-white leading-snug mb-1.5">{item.label}</h3>
              <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">{item.desc}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────
const Lightbox: React.FC<{ item: REItem; onClose: () => void }> = ({ item, onClose }) => {
  const color = catColor(item.category);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/92 backdrop-blur-3xl" />
      <motion.div
        initial={{ scale: 0.86, y: 28, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="relative z-10 w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-11 right-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={15} className="text-white" />
        </button>

        {/* Image */}
        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
          <img src={item.url} alt={item.label} className="w-full h-auto max-h-[65vh] object-contain bg-black/60" />
        </div>

        {/* Info */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mt-3 flex items-start gap-4 px-5 py-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl ring-1 ring-white/[0.07]"
        >
          <div
            className="mt-0.5 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, opacity: 0.8 }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-[13px] font-bold text-white">{item.label}</h3>
              <span
                className="text-[8px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}40` }}
              >
                {item.category}
              </span>
              {item.isBeforeAfter && (
                <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap border border-red-500/40 text-red-400 bg-red-500/10">
                  Split View
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/55 mb-1">{item.subcategory}</p>
            <p className="text-[11px] text-white/70 leading-relaxed">{item.desc}</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ─── Bento layout renderer ─────────────────────────────────────
const BentoGrid: React.FC<{ items: REItem[]; onOpen: (i: REItem) => void }> = ({ items, onOpen }) => {
  // Row 1: hero (col-span-2, row-span-2) + 2 stacked normals
  // Row 2: 3 normal cards
  // Row 3: wide (col-span-2) + normal
  // Row 4: 3 normal cards
  // Row 5: 2 wide cards
  // Row 6: remaining

  const hero = items[0];
  const col1row1 = items[1];
  const col1row2 = items[2];
  const row2 = items.slice(3, 6);
  const wideBA = items[6];
  const normalBA = items[7];
  const row4 = items.slice(8, 11);
  const row5 = items.slice(11, 13);
  const row6 = items.slice(13);

  return (
    <div className="space-y-3">
      {/* Row 1: Hero + 2 stacked */}
      {hero && (
        <div className="grid grid-cols-3 gap-3" style={{ gridTemplateRows: 'auto' }}>
          <div className="col-span-2 aspect-video">
            <RECard item={hero} index={0} colSpan="h-full w-full" onOpen={() => onOpen(hero)} />
          </div>
          <div className="col-span-1 flex flex-col gap-3">
            {col1row1 && (
              <div className="aspect-video flex-1">
                <RECard item={col1row1} index={1} colSpan="h-full w-full" onOpen={() => onOpen(col1row1)} />
              </div>
            )}
            {col1row2 && (
              <div className="aspect-video flex-1">
                <RECard item={col1row2} index={2} colSpan="h-full w-full" onOpen={() => onOpen(col1row2)} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 2: 3 equal */}
      {row2.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {row2.map((item, i) => (
            <div key={item.id} className="aspect-video">
              <RECard item={item} index={i + 3} colSpan="h-full w-full" onOpen={() => onOpen(item)} />
            </div>
          ))}
        </div>
      )}

      {/* Row 3: Before/After wide + 1 normal */}
      {wideBA && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 aspect-video">
            <RECard item={wideBA} index={6} colSpan="h-full w-full" onOpen={() => onOpen(wideBA)} />
          </div>
          {normalBA && (
            <div className="col-span-1 aspect-video">
              <RECard item={normalBA} index={7} colSpan="h-full w-full" onOpen={() => onOpen(normalBA)} />
            </div>
          )}
        </div>
      )}

      {/* Row 4: 3 equal */}
      {row4.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {row4.map((item, i) => (
            <div key={item.id} className="aspect-video">
              <RECard item={item} index={i + 8} colSpan="h-full w-full" onOpen={() => onOpen(item)} />
            </div>
          ))}
        </div>
      )}

      {/* Row 5: 2 wide */}
      {row5.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {row5.map((item, i) => (
            <div key={item.id} className="aspect-video">
              <RECard item={item} index={i + 11} colSpan="h-full w-full" onOpen={() => onOpen(item)} />
            </div>
          ))}
        </div>
      )}

      {/* Row 6: remaining */}
      {row6.length > 0 && (
        <div className={`grid grid-cols-${Math.min(row6.length, 3)} gap-3`}>
          {row6.map((item, i) => (
            <div key={item.id} className="aspect-video">
              <RECard item={item} index={i + 13} colSpan="h-full w-full" onOpen={() => onOpen(item)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Section ─────────────────────────────────────────────────
export const ShowcaseSection: React.FC = () => {
  const [active, setActive] = useState<REItem | null>(null);
  const [filter, setFilter] = useState('Tất cả');

  const filtered = filter === 'Tất cả'
    ? ITEMS
    : ITEMS.filter(it => it.category === filter);

  // For filtered view (not "Tất cả"), use 3-col masonry instead of bento
  const col1: REItem[] = [];
  const col2: REItem[] = [];
  const col3: REItem[] = [];
  if (filter !== 'Tất cả') {
    filtered.forEach((item, i) => {
      if (i % 3 === 0) col1.push(item);
      else if (i % 3 === 1) col2.push(item);
      else col3.push(item);
    });
  }

  return (
    <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <FadeInUp className="mb-8">
          <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-3xl font-bold">15 phối cảnh BĐS — AI render</h2>
              <p className="text-sm text-slate-500 dark:text-[#666] mt-1 max-w-lg">
                Từ bản vẽ 2D đến photorealistic 4K · Interior staging · Marketing developer
              </p>
            </div>
            {/* Stats pills */}
            <div className="flex items-center gap-2 shrink-0">
              {Object.entries(CAT_COLORS).map(([label, color]) => (
                <div key={label} className="hidden lg:flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[9px] font-medium text-slate-400 dark:text-[#555] whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* Filters */}
        <FadeInUp delay={0.07} className="mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            {CATEGORIES.map(cat => {
              const color = cat === 'Tất cả' ? '#10b981' : catColor(cat);
              return (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                    filter === cat
                      ? 'text-white border-transparent shadow-lg'
                      : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-[#666] hover:border-current'
                  }`}
                  style={
                    filter === cat
                      ? { backgroundColor: color, boxShadow: `0 4px 20px ${color}45`, color: '#fff' }
                      : { '--hover-color': color } as React.CSSProperties
                  }
                >
                  {cat}
                </motion.button>
              );
            })}
            <span className="ml-auto text-[10px] text-slate-400 dark:text-[#555]">
              {filtered.length} ảnh
            </span>
          </div>
        </FadeInUp>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {filter === 'Tất cả' ? (
              <BentoGrid items={filtered} onOpen={setActive} />
            ) : (
              /* 3-col masonry for filtered view */
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-start">
                <div className="flex flex-col gap-3">
                  {col1.map((item, idx) => (
                    <div key={item.id} className="aspect-video">
                      <RECard item={item} index={idx * 3} colSpan="h-full w-full" onOpen={() => setActive(item)} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  {col2.map((item, idx) => (
                    <div key={item.id} className="aspect-video">
                      <RECard item={item} index={idx * 3 + 1} colSpan="h-full w-full" onOpen={() => setActive(item)} />
                    </div>
                  ))}
                </div>
                <div className="hidden md:flex flex-col gap-3 mt-8">
                  {col3.map((item, idx) => (
                    <div key={item.id} className="aspect-video">
                      <RECard item={item} index={idx * 3 + 2} colSpan="h-full w-full" onOpen={() => setActive(item)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <FadeInUp delay={0.1} className="mt-16 text-center">
          <p className="text-sm text-slate-400 dark:text-[#555] mb-3">
            Render BĐS của bạn với{' '}
            <strong className="text-slate-700 dark:text-white/80">AI Skyverses</strong>{' '}
            — từ bản vẽ đến phối cảnh 4K
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
          >
            ✦ Thử Render Miễn Phí
          </motion.button>
        </FadeInUp>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && <Lightbox item={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
};
