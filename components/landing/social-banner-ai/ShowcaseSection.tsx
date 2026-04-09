import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ZoomIn } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

// ─── Types ────────────────────────────────────────────────────
interface BannerItem {
  id: string;
  url: string;
  label: string;
  platform: string;
  desc: string;
  tags?: string[];
}

// ─── Platform accent colors ────────────────────────────────────
const PLATFORM_META: Record<string, { color: string; dot: string }> = {
  Facebook: { color: '#1877F2', dot: '#1877F2' },
  Instagram: { color: '#E1306C', dot: '#E1306C' },
  'X/Twitter': { color: '#ffffff', dot: '#888' },
  LinkedIn: { color: '#0A66C2', dot: '#0A66C2' },
};

function getPlatformMeta(platform: string) {
  for (const [key, val] of Object.entries(PLATFORM_META)) {
    if (platform.includes(key)) return { ...val, key };
  }
  return { color: '#0090ff', dot: '#0090ff', key: 'Other' };
}

// ─── Data ─────────────────────────────────────────────────────
const SHOWCASE_ITEMS: BannerItem[] = [
  {
    id: 'flash-sale-1111',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad-d3fc-4708-7a4e-6a04c59fa900/public',
    label: 'Flash Sale 11.11',
    platform: 'Facebook Post · 1200×630',
    desc: 'Chiến dịch sale lớn nhất năm — nền đỏ rực, số nổi bật, năng lượng cao trong 30 giây',
    tags: ['Sale', 'E-commerce', 'Facebook'],
  },
  {
    id: 'new-collection-story',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/76082522-f991-4176-f321-1d4d09339d00/public',
    label: 'BST Thu Đông Mới',
    platform: 'Instagram Story · 1080×1920',
    desc: 'Story ra mắt BST thời trang — layout dọc 9:16 editorial, phong cách magazine cao cấp',
    tags: ['Thời trang', 'Story', 'Instagram'],
  },
  {
    id: 'tuyen-dung',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b2a1b759-4b62-4d6c-a4a7-db43b9a8bf00/public',
    label: 'Tuyển Dụng Tech Startup',
    platform: 'X/Twitter Header · 1500×500',
    desc: 'Header X chuẩn 1500×500 với brand identity hiện đại, futuristic',
    tags: ['Tuyển dụng', 'Tech', 'X/Twitter'],
  },
  {
    id: 'product-launch-ig',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/3aebbfd3-4095-4cc8-770f-a4efcb998e00/public',
    label: 'Ra Mắt Sản Phẩm Mới',
    platform: 'Instagram Post · 1080×1080',
    desc: 'Spotlight trung tâm, nền tối premium — luxury brand standard',
    tags: ['Sản phẩm', 'Luxury', 'Instagram'],
  },
  {
    id: 'tet-sale',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/c9a676ed-fc4b-4404-9833-275e90dbc300/public',
    label: 'Sale Tết Nguyên Đán',
    platform: 'Facebook Post · 1200×630',
    desc: 'AI hiểu văn hóa Việt — visual festive rồng vàng, hoa đào đúng tone Tết',
    tags: ['Tết', 'Sale', 'Festive'],
  },
  {
    id: 'beauty-brand-story',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/87f819af-339e-4144-e17a-5ecdc1282900/public',
    label: 'BST Trang Điểm Mùa Hè',
    platform: 'Instagram Story · 1080×1920',
    desc: 'Mood board makeup luxury — pastel premium, chuẩn editorial K-beauty',
    tags: ['Beauty', 'Luxury', 'Instagram'],
  },
  {
    id: 'webinar-linkedin',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/52735b7f-a10b-4d4d-37a9-4a5d4db9a100/public',
    label: 'Hội Thảo Trực Tuyến',
    platform: 'LinkedIn Banner · 1584×396',
    desc: 'Layout thông tin + hình ảnh cân bằng theo chuẩn LinkedIn professional',
    tags: ['Sự kiện', 'B2B', 'LinkedIn'],
  },
  {
    id: 'coffee-promo',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2b41a1fc-4ab5-48ef-edf2-40300c3ecb00/public',
    label: 'Khuyến Mãi Cà Phê',
    platform: 'Facebook Post · 1200×630',
    desc: 'Màu nâu ấm, latte art, cozy vibe — đặt lịch khách hàng ngay từ đầu',
    tags: ['F&B', 'Khuyến mãi', 'Facebook'],
  },
  {
    id: 'gym-fitness',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/fa52e689-1ff4-4810-2927-6d7dd9424100/public',
    label: 'Thách Thức 30 Ngày Gym',
    platform: 'X/Twitter Post · 1200×675',
    desc: 'Visual động lực cao — neon lime, dumbbell dramatic, speed lines',
    tags: ['Fitness', 'Challenge'],
  },
  {
    id: 'grand-opening',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/53366c5d-e1d3-4a4e-c7ea-25519c88ea00/public',
    label: 'Khai Trương Chi Nhánh Mới',
    platform: 'Facebook Cover · 820×312',
    desc: 'Khai trương festive — đèn lồng, pháo hoa, thư pháp Việt Nam',
    tags: ['Sự kiện', 'Khai trương'],
  },
  {
    id: 'realestate-linkedin',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2bf39eed-6a95-44a5-fcea-380501b54700/public',
    label: 'Dự Án Chung Cư Luxury',
    platform: 'Facebook Post · 1200×630',
    desc: 'CGI tháp cao tầng + overlay marketing — chuẩn developer BĐS cao cấp',
    tags: ['BĐS', 'Luxury'],
  },
  {
    id: 'food-delivery',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2fd23fdf-d600-4a0a-8ef1-6aebed612100/public',
    label: 'Ưu Đãi Giao Đồ Ăn',
    platform: 'Instagram Post · 1080×1080',
    desc: 'Food photography overhead — pho, bánh mì, gỏi cuốn, màu sắc thèm ăn',
    tags: ['F&B', 'App', 'Instagram'],
  },
  {
    id: 'tech-gadget',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/3940688f-5827-4f42-f9a4-b82dba06ef00/public',
    label: 'Ra Mắt Tai Nghe Wireless',
    platform: 'Facebook Cover · 820×312',
    desc: '3D product render cinematic — lighting studio premium, Apple launch style',
    tags: ['Tech', 'Gadget'],
  },
  {
    id: 'travel-agency',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/39c7bbea-121b-4f0e-4c30-c42b0cde4100/public',
    label: 'Tour Du Lịch Đà Nẵng',
    platform: 'Facebook Post · 1200×630',
    desc: 'Destination đẹp + layout thông tin tour — Cầu Rồng, bãi biển hoàng hôn',
    tags: ['Du lịch', 'Tour'],
  },
  {
    id: 'elearning',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/0c531e63-958f-4157-764c-de57228d9400/public',
    label: 'Khoá Học Data Science',
    platform: 'Facebook Post · 1200×630',
    desc: 'Layout giáo dục corporate — data visualization neon, glassmorphism panel',
    tags: ['Giáo dục', 'Tech'],
  },
];

const FILTERS = ['Tất cả', 'Facebook', 'Instagram', 'X/Twitter', 'LinkedIn'];

// ─── Single Card ───────────────────────────────────────────────
const BannerCard: React.FC<{
  item: BannerItem;
  index: number;
  onOpen: () => void;
}> = ({ item, index, onOpen }) => {
  const [hovered, setHovered] = useState(false);
  const meta = getPlatformMeta(item.platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-xl overflow-hidden cursor-pointer group mb-3 break-inside-avoid"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onOpen}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      style={{ transition: 'box-shadow 0.25s ease' }}
    >
      {/* Glow ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none z-20"
        animate={{
          boxShadow: hovered
            ? `inset 0 0 0 1.5px ${meta.color}80, 0 8px 32px ${meta.color}25`
            : 'inset 0 0 0 0px transparent, 0 0px 0px transparent',
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Image */}
      <img
        src={item.url}
        alt={item.label}
        loading="lazy"
        className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.04]"
        style={{ display: 'block' }}
      />

      {/* Platform badge — always visible top-left */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: meta.dot }}
        />
        <span className="text-[8px] font-bold text-white/80 leading-none whitespace-nowrap">
          {item.platform.split('·')[0].trim()}
        </span>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-10 flex flex-col justify-end"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.1) 70%, transparent 100%)',
            }}
          >
            {/* Zoom icon top-right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
            >
              <ZoomIn size={12} className="text-white" />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.04 }}
              className="p-3 space-y-1"
            >
              <h3 className="text-[13px] font-bold text-white leading-tight">{item.label}</h3>
              <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">{item.desc}</p>
              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {item.tags?.map(t => (
                  <span
                    key={t}
                    className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${meta.color}22`,
                      color: meta.color,
                      border: `1px solid ${meta.color}50`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Lightbox ──────────────────────────────────────────────────
const Lightbox: React.FC<{ item: BannerItem; onClose: () => void }> = ({ item, onClose }) => {
  const meta = getPlatformMeta(item.platform);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" />

      <motion.div
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="relative z-10 w-full max-w-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
        >
          <X size={14} className="text-white" />
        </motion.button>

        {/* Image */}
        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
          <img
            src={item.url}
            alt={item.label}
            className="w-full h-auto max-h-[65vh] object-contain bg-black/50"
          />
        </div>

        {/* Info bar */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.06] backdrop-blur-xl ring-1 ring-white/[0.08]"
        >
          {/* Platform dot */}
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}20` }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[12px] font-bold text-white truncate">{item.label}</p>
              <span
                className="shrink-0 text-[8px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
              >
                {item.platform}
              </span>
            </div>
            <p className="text-[10px] text-white/55">{item.desc}</p>
          </div>

          {item.tags && (
            <div className="shrink-0 hidden sm:flex gap-1">
              {item.tags.slice(0, 2).map(t => (
                <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40">
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Section ──────────────────────────────────────────────
export const ShowcaseSection: React.FC = () => {
  const [active, setActive] = useState<BannerItem | null>(null);
  const [filter, setFilter] = useState('Tất cả');

  const filtered = filter === 'Tất cả'
    ? SHOWCASE_ITEMS
    : SHOWCASE_ITEMS.filter(it => it.platform.includes(filter));

  // Split into 3 columns for masonry
  const col1: BannerItem[] = [];
  const col2: BannerItem[] = [];
  const col3: BannerItem[] = [];
  filtered.forEach((item, i) => {
    if (i % 3 === 0) col1.push(item);
    else if (i % 3 === 1) col2.push(item);
    else col3.push(item);
  });

  return (
    <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <FadeInUp className="mb-8">
          <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-3xl font-bold">
                15 banner AI — đa nền tảng, đa ngành
              </h2>
              <p className="text-sm text-slate-500 dark:text-[#666] mt-1 max-w-lg">
                Mỗi banner được tạo từ prompt chi tiết — đúng kích thước, đúng nền tảng, sẵn sàng đăng ngay
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-blue bg-brand-blue/[0.08] border border-brand-blue/15 px-3 py-1.5 rounded-full whitespace-nowrap shrink-0">
              <Sparkles size={11} />
              100% AI Generated
            </div>
          </div>
        </FadeInUp>

        {/* Filter pills */}
        <FadeInUp delay={0.07} className="mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            {FILTERS.map(f => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                  filter === f
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/25'
                    : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-[#666] hover:border-brand-blue/40 hover:text-brand-blue'
                }`}
              >
                {f}
              </motion.button>
            ))}
            <span className="ml-auto text-[10px] text-slate-400 dark:text-[#555]">
              {filtered.length} banner
            </span>
          </div>
        </FadeInUp>

        {/* 3-Column Masonry */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 items-start"
          >
            {/* Col 1 */}
            <div className="flex flex-col gap-3">
              {col1.map((item, idx) => (
                <BannerCard key={item.id} item={item} index={idx * 3} onOpen={() => setActive(item)} />
              ))}
            </div>
            {/* Col 2 */}
            <div className="flex flex-col gap-3 mt-6">
              {col2.map((item, idx) => (
                <BannerCard key={item.id} item={item} index={idx * 3 + 1} onOpen={() => setActive(item)} />
              ))}
            </div>
            {/* Col 3 — hidden on mobile */}
            <div className="hidden md:flex flex-col gap-3 mt-12">
              {col3.map((item, idx) => (
                <BannerCard key={item.id} item={item} index={idx * 3 + 2} onOpen={() => setActive(item)} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <FadeInUp delay={0.1} className="mt-14 text-center">
          <p className="text-sm text-slate-400 dark:text-[#555] mb-3">
            Tạo banner tương tự chỉ trong{' '}
            <strong className="text-slate-700 dark:text-white/80">30 giây</strong>
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,144,255,0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all"
          >
            <Sparkles size={13} />
            Dùng Thử Miễn Phí
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
