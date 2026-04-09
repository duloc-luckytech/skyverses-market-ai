import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Sparkles, ExternalLink, Building, Eye } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

// ─── Types ────────────────────────────────────────────────────
interface RealEstateItem {
  id: string;
  url: string;
  label: string;
  category: string;
  desc: string;
  width: number;
  height: number;
  tags?: string[];
}

// ─── Category color map ───────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  'Render Exterior': '#10b981',
  'Interior Staging': '#8b5cf6',
  'Marketing': '#f59e0b',
  'Phối cảnh': '#0ea5e9',
  'Before/After': '#ef4444',
  'Thiết kế': '#ec4899',
};

function getCatColor(cat: string): string {
  return CAT_COLOR[cat] ?? '#10b981';
}

// ─── Static showcase data — 15 items ─────────────────────────
// 6 hero samples từ CDN cũ + 9 showcase mới
const SHOWCASE_ITEMS: RealEstateItem[] = [
  // ── Hero samples (từ gen_realestate_landing_images.sh) ──
  {
    id: 'villa-exterior-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/011d3f36-e9db-4c52-acfe-dce49465f900/public',
    label: 'Villa Biệt Thự Cao Cấp',
    category: 'Render Exterior',
    desc: 'Render phối cảnh ngoại thất biệt thự tropical — AI tạo từ bản vẽ 2D thành hình photorealistic 4K trong 30 giây',
    width: 1200, height: 675,
    tags: ['Biệt thự', 'Exterior', '4K'],
  },
  {
    id: 'luxury-apartment-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/95958aa7-e6b3-498a-1230-1ee10c2a4200/public',
    label: 'Căn Hộ Luxury Cao Tầng',
    category: 'Interior Staging',
    desc: 'Virtual staging nội thất căn hộ penthouse — từ không gian trống đến interior hoàn chỉnh theo phong cách khách hàng',
    width: 1200, height: 675,
    tags: ['Căn hộ', 'Penthouse', 'Staging'],
  },
  {
    id: 'shophouse-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/33421812-02bb-4f04-578f-5c1dcf094500/public',
    label: 'Shophouse Đô Thị',
    category: 'Render Exterior',
    desc: 'CGI shophouse mặt phố — render đúng ánh sáng ban ngày, bóng đổ, phản chiếu kính cho hồ sơ dự án',
    width: 1200, height: 675,
    tags: ['Shophouse', 'Phố thương mại'],
  },
  {
    id: 'interior-staging-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/93377933-e63d-4a4f-c04d-4a3ddfb55100/public',
    label: 'Staging Phòng Khách',
    category: 'Interior Staging',
    desc: 'AI staging phòng khách theo 5 phong cách: Scandinavian, Japanese, Industrial, Modern, Classic — khách hàng chọn style yêu thích',
    width: 1200, height: 675,
    tags: ['Living room', 'Multi-style'],
  },
  {
    id: 'office-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/92cdb56a-e9a6-42ee-2c7f-50035a7f9100/public',
    label: 'Văn Phòng Co-working',
    category: 'Render Exterior',
    desc: 'Render không gian văn phòng thương mại — tầm nhìn toàn thành phố, nội thất hiện đại, lighting tự nhiên chuẩn kiến trúc',
    width: 1200, height: 675,
    tags: ['Văn phòng', 'Commercial'],
  },
  {
    id: 'penthouse-existing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/a5409ee6-054b-4423-a5a6-7aa3e0a84200/public',
    label: 'Penthouse View Sông',
    category: 'Interior Staging',
    desc: 'Penthouse sky deck với hồ bơi vô cực — AI render ánh sáng hoàng hôn phản chiếu mặt nước chuẩn CGI studio',
    width: 1200, height: 675,
    tags: ['Penthouse', 'Pool', 'Sông'],
  },
  // ── New showcase items (CDN filled after gen) ──
  {
    id: 're-villa-exterior-new',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8842a298-f892-4b62-f94b-1ac9f469bd00/public',
    label: 'Villa Nội Khu Cao Cấp',
    category: 'Render Exterior',
    desc: 'Render ngoại thất villa nhiệt đới lúc hoàng hôn — kiến trúc colonial trắng, hồ bơi, cây xanh nhiệt đới, ánh sáng vàng cinematic',
    width: 1200, height: 675,
    tags: ['Villa', 'Tropical', 'Golden hour'],
  },
  {
    id: 're-apartment-staging-new',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d64f9c02-3c5a-4db0-9679-5779dc733100/public',
    label: 'Căn Hộ View Thành Phố',
    category: 'Interior Staging',
    desc: 'Staging phòng khách căn hộ cao tầng HCMC — floor-to-ceiling glass, sofa linen, coffee table marble, ánh đèn hoàng hôn TP',
    width: 1200, height: 675,
    tags: ['Căn hộ', 'TP.HCM', 'City view'],
  },
  {
    id: 're-shophouse-new',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/e7c5a0e9-8457-4fdf-5709-27525ae7c700/public',
    label: 'Shophouse Phố Thị 5 Tầng',
    category: 'Render Exterior',
    desc: 'CGI shophouse đô thị 5 tầng kết hợp brick, bê tông và thép — phong cách industrial modern, ánh chiều dài tầng trệt',
    width: 1200, height: 675,
    tags: ['Shophouse', 'Industrial', '5 tầng'],
  },
  {
    id: 're-office-new',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2f55d072-f86e-4345-5c07-511591204e00/public',
    label: 'Văn Phòng Premium Co-working',
    category: 'Phối cảnh',
    desc: 'Render co-working HCMC — open-plan, tường xanh biophilic, pod workstation, phòng họp kính, tầm nhìn skyline',
    width: 1200, height: 675,
    tags: ['Văn phòng', 'Co-working', 'Biophilic'],
  },
  {
    id: 're-penthouse-pool-new',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/48a43d0f-08ba-4b71-14c1-e4603c4b2600/public',
    label: 'Penthouse Rooftop Pool',
    category: 'Interior Staging',
    desc: 'Infinity pool penthouse với skyline HCMC lúc blue hour — teak lounger, fire pit, glass balustrade, ánh đèn thành phố',
    width: 1200, height: 675,
    tags: ['Penthouse', 'Rooftop', 'Blue hour'],
  },
  {
    id: 're-before-after',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/94d3c575-1b1a-421a-5c1a-b58838d03000/public',
    label: 'Before vs After Staging',
    category: 'Before/After',
    desc: 'Split-screen trước/sau AI staging — trái: phòng ngủ trống bê tông thô; phải: cùng góc máy với nội thất luxury hoàn chỉnh',
    width: 1200, height: 675,
    tags: ['Before/After', 'Staging', 'So sánh'],
  },
  {
    id: 're-project-marketing',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/6a742a57-39cd-47fe-5250-ded4f00e7600/public',
    label: 'Master Plan Marketing',
    category: 'Marketing',
    desc: 'Phối cảnh aerial khu đô thị tổng thể — bird\u2019s-eye view tháp cao tầng, khuôn viên hồ, tiện ích, cây xanh, chuẩn marketing developer',
    width: 1200, height: 630,
    tags: ['Master plan', 'Aerial', 'Developer'],
  },
  {
    id: 're-virtual-tour',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/7699ac3d-8084-44a5-2d78-178b91a87300/public',
    label: 'Master Bedroom Suite',
    category: 'Interior Staging',
    desc: 'Staging phòng ngủ master suite — walk-in wardrobe hé cửa, en-suite bathtub nhìn vườn, ánh đèn warm luxury hotel style',
    width: 1200, height: 675,
    tags: ['Master bedroom', 'Suite', 'Luxury'],
  },
  {
    id: 're-aerial',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/12a7a681-9e53-4ec3-9cee-38003a483c00/public',
    label: 'Khu Biệt Thự Aerial View',
    category: 'Phối cảnh',
    desc: 'Drone view CGI khu biệt thự gated premium — villa cluster, hồ trung tâm, clubhouse, tennis, rừng nhiệt đới bao quanh',
    width: 1200, height: 675,
    tags: ['Aerial', 'Khu dân cư', 'Gated'],
  },
];

// ─── Card ─────────────────────────────────────────────────────
interface CardProps { item: RealEstateItem; index: number; onClick: () => void; }

const RealEstateCard: React.FC<CardProps> = ({ item, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const color = getCatColor(item.category);
  const isPlaceholder = item.url.startsWith('PLACEHOLDER');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => !isPlaceholder && onClick()}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-20"
        animate={{ opacity: hovered && !isPlaceholder ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ boxShadow: `inset 0 0 0 1.5px ${color}70, 0 0 28px 0 ${color}28` }}
      />

      {/* Image */}
      <div
        className="relative w-full overflow-hidden bg-slate-100 dark:bg-white/[0.04]"
        style={{ paddingBottom: `${(item.height / item.width) * 100}%` }}
      >
        {isPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-white/[0.03] animate-pulse">
            <Building size={24} className="text-slate-300 dark:text-white/10" />
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.label}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && !isPlaceholder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 flex flex-col justify-end"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)' }}
          >
            {/* Expand icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
            >
              <ExternalLink size={13} className="text-white/80" />
            </motion.div>

            {/* Bottom info */}
            <motion.div
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.22 }}
              className="p-4 space-y-1.5"
            >
              {/* Category */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>
                  {item.category}
                </span>
              </div>
              {/* Label */}
              <h3 className="text-sm font-bold text-white leading-snug">{item.label}</h3>
              {/* Desc */}
              <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">{item.desc}</p>
              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {item.tags?.map(tag => (
                  <span
                    key={tag}
                    className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible bottom label */}
      {!hovered && !isPlaceholder && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-[9px] font-semibold text-white/70 truncate">{item.label}</p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────
const Lightbox: React.FC<{ item: RealEstateItem; onClose: () => void }> = ({ item, onClose }) => {
  const color = getCatColor(item.category);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl" />
      <motion.div
        initial={{ scale: 0.88, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img src={item.url} alt={item.label} className="w-full h-auto max-h-[68vh] object-contain bg-black" />
        </div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-3 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] p-4 flex items-start gap-4"
        >
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Building size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-bold text-white">{item.label}</h3>
              <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
              >
                {item.category}
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">{item.desc}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags?.map(tag => (
                <span key={tag} className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/50">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white text-lg transition-colors"
          >
            ×
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Section ─────────────────────────────────────────────
const CATEGORIES = ['Tất cả', 'Render Exterior', 'Interior Staging', 'Phối cảnh', 'Marketing', 'Before/After'];

export const ShowcaseSection: React.FC = () => {
  const [active, setActive] = useState<RealEstateItem | null>(null);
  const [filter, setFilter] = useState('Tất cả');

  const filtered = filter === 'Tất cả'
    ? SHOWCASE_ITEMS.filter(it => !it.url.startsWith('PLACEHOLDER'))
    : SHOWCASE_ITEMS.filter(it => it.category === filter && !it.url.startsWith('PLACEHOLDER'));

  return (
    <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <FadeInUp className="mb-8">
          <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-3xl font-bold">15 ví dụ render BĐS thực tế</h2>
              <p className="text-sm text-slate-500 dark:text-[#666] mt-1 max-w-lg">
                Từ bản vẽ 2D đến phối cảnh photorealistic 4K — mỗi hình được AI tạo ra trong vài giây
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/15 px-3 py-1.5 rounded-full whitespace-nowrap">
              <Sparkles size={11} />
              100% AI-Generated
            </div>
          </div>
        </FadeInUp>

        {/* Category filters */}
        <FadeInUp delay={0.08} className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const color = cat === 'Tất cả' ? '#10b981' : getCatColor(cat);
              return (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                    filter === cat
                      ? 'text-white shadow-lg'
                      : 'bg-black/[0.03] dark:bg-white/[0.04] text-slate-500 dark:text-[#666] hover:text-slate-700 dark:hover:text-white border border-black/[0.06] dark:border-white/[0.06]'
                  }`}
                  style={filter === cat ? { backgroundColor: color, boxShadow: `0 4px 20px ${color}40` } : {}}
                >
                  {cat}
                </motion.button>
              );
            })}
            <div className="ml-auto text-[10px] text-slate-400 dark:text-[#555] self-center">
              {filtered.length} ảnh
            </div>
          </div>
        </FadeInUp>

        {/* Masonry grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <RealEstateCard item={item} index={idx} onClick={() => setActive(item)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <FadeInUp delay={0.1} className="mt-12 text-center">
          <p className="text-sm text-slate-400 dark:text-[#555] mb-3">
            Bạn muốn render ảnh BĐS tương tự với{' '}
            <strong className="text-slate-700 dark:text-white/80">AI của Skyverses</strong>?
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white text-[11px] font-bold rounded-full shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
          >
            <Eye size={13} />
            Thử Render Miễn Phí Ngay
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
