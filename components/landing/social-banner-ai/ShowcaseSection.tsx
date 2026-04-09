import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Sparkles, ExternalLink, Monitor, Smartphone } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

// ─── Types ────────────────────────────────────────────────────
interface BannerItem {
  id: string;
  url: string;
  label: string;
  platform: string;
  desc: string;
  width: number;
  height: number;
  tags?: string[];
}

// ─── Static showcase data (CDN URLs will be updated after gen) ──
const SHOWCASE_ITEMS: BannerItem[] = [
  {
    id: 'flash-sale-1111',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad-d3fc-4708-7a4e-6a04c59fa900/public',
    label: 'Flash Sale 11.11',
    platform: 'Facebook Post · 1200×630',
    desc: 'Chiến dịch sale lớn nhất năm — AI tạo banner Flash 11.11 nền đỏ rực, số nổi bật, năng lượng cao trong 30 giây',
    width: 1200, height: 630,
    tags: ['Sale', 'E-commerce', 'Facebook'],
  },
  {
    id: 'grand-opening',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/53366c5d-e1d3-4a4e-c7ea-25519c88ea00/public',
    label: 'Khai Trương Chi Nhánh Mới',
    platform: 'Facebook Cover · 820×312',
    desc: 'Banner khai trương cửa hàng mới — AI tự phối màu thương hiệu và layout phù hợp Facebook Cover',
    width: 820, height: 312,
    tags: ['Sự kiện', 'Khai trương', 'Facebook'],
  },
  {
    id: 'tuyen-dung',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b2a1b759-4b62-4d6c-a4a7-db43b9a8bf00/public',
    label: 'Tuyển Dụng Tech Startup',
    platform: 'X/Twitter Header · 1500×500',
    desc: 'Banner tuyển dụng tech startup — AI gen header X chuẩn 1500×500 với brand identity hiện đại',
    width: 1500, height: 500,
    tags: ['Tuyển dụng', 'Tech', 'X/Twitter'],
  },
  {
    id: 'product-launch-ig',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/3aebbfd3-4095-4cc8-770f-a4efcb998e00/public',
    label: 'Ra Mắt Sản Phẩm Mới',
    platform: 'Instagram Post · 1080×1080',
    desc: 'Banner launch sản phẩm cho Instagram — spotlight trung tâm, nền tối premium, chuẩn brand cao cấp',
    width: 1080, height: 1080,
    tags: ['Sản phẩm', 'Luxury', 'Instagram'],
  },
  {
    id: 'webinar-linkedin',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/52735b7f-a10b-4d4d-37a9-4a5d4db9a100/public',
    label: 'Hội Thảo Trực Tuyến',
    platform: 'LinkedIn Banner · 1584×396',
    desc: 'Banner hội thảo online — AI cân bằng layout thông tin + hình ảnh theo chuẩn LinkedIn professional',
    width: 1584, height: 396,
    tags: ['Sự kiện', 'B2B', 'LinkedIn'],
  },
  {
    id: 'new-collection-story',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/76082522-f991-4176-f321-1d4d09339d00/public',
    label: 'BST Thu Đông Mới',
    platform: 'Instagram Story · 1080×1920',
    desc: 'Banner story ra mắt BST thời trang — AI tạo layout dọc chuẩn 9:16 cho Instagram Story với phong cách editorial',
    width: 1080, height: 1920,
    tags: ['Thời trang', 'Story', 'Instagram'],
  },
  {
    id: 'tet-sale',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/c9a676ed-fc4b-4404-9833-275e90dbc300/public',
    label: 'Sale Tết Nguyên Đán',
    platform: 'Facebook Post · 1200×630',
    desc: 'Banner sale Tết Nguyên Đán — AI hiểu văn hóa Việt và tạo visual festive đúng tone ngày Tết',
    width: 1200, height: 630,
    tags: ['Tết', 'Sale', 'Lễ hội'],
  },
  {
    id: 'coffee-promo',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2b41a1fc-4ab5-48ef-edf2-40300c3ecb00/public',
    label: 'Khuyến Mãi Cà Phê',
    platform: 'Facebook Post · 1200×630',
    desc: 'Banner khuyến mãi quán cà phê — màu nâu ấm, hình ảnh latte art, phong cách cozy lifestyle',
    width: 1200, height: 630,
    tags: ['F&B', 'Khuyến mãi', 'Facebook'],
  },
  {
    id: 'gym-fitness',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/fa52e689-1ff4-4810-2927-6d7dd9424100/public',
    label: 'Thách Thức 30 Ngày Gym',
    platform: 'X/Twitter Post · 1200×675',
    desc: 'Banner thách thức tập luyện — AI tạo visual động lực cao với năng lượng thể thao',
    width: 1200, height: 675,
    tags: ['Fitness', 'Challenge', 'X/Twitter'],
  },
  {
    id: 'realestate-linkedin',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2bf39eed-6a95-44a5-fcea-380501b54700/public',
    label: 'Dự Án Chung Cư Luxury',
    platform: 'Facebook Post · 1200×630',
    desc: 'Banner dự án BĐS cao cấp — AI render building CGI + overlay thông tin marketing theo chuẩn developer',
    width: 1200, height: 630,
    tags: ['Bất động sản', 'Luxury', 'Facebook'],
  },
  {
    id: 'food-delivery',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2fd23fdf-d600-4a0a-8ef1-6aebed612100/public',
    label: 'Ưu Đãi Giao Đồ Ăn',
    platform: 'Instagram Post · 1080×1080',
    desc: 'Banner ưu đãi app giao đồ ăn — AI sắp xếp food photography stack đẹp mắt, màu sắc thèm ăn',
    width: 1080, height: 1080,
    tags: ['F&B', 'App', 'Instagram'],
  },
  {
    id: 'beauty-brand-story',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/87f819af-339e-4144-e17a-5ecdc1282900/public',
    label: 'BST Trang Điểm Mùa Hè',
    platform: 'Instagram Story · 1080×1920',
    desc: 'Banner story beauty brand — AI tạo mood board makeup luxury với màu pastel premium, chuẩn editorial',
    width: 1080, height: 1920,
    tags: ['Beauty', 'Luxury', 'Instagram'],
  },
  {
    id: 'tech-gadget',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/3940688f-5827-4f42-f9a4-b82dba06ef00/public',
    label: 'Ra Mắt Tai Nghe Wireless',
    platform: 'Facebook Cover · 820×312',
    desc: 'Banner cover Facebook launch gadget — AI tạo product visualization 3D với lighting studio premium',
    width: 820, height: 312,
    tags: ['Tech', 'Gadget', 'Facebook'],
  },
  {
    id: 'travel-agency',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/39c7bbea-121b-4f0e-4c30-c42b0cde4100/public',
    label: 'Tour Du Lịch Đà Nẵng',
    platform: 'Facebook Post · 1200×630',
    desc: 'Banner tour du lịch — AI phối ảnh destination đẹp + layout thông tin tour theo chuẩn travel agency',
    width: 1200, height: 630,
    tags: ['Du lịch', 'Tour', 'Facebook'],
  },
  {
    id: 'elearning',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/0c531e63-958f-4157-764c-de57228d9400/public',
    label: 'Khoá Học Data Science',
    platform: 'Facebook Post · 1200×630',
    desc: 'Banner khoá học online — AI thiết kế layout giáo dục chuyên nghiệp, tạo trust với brand corporate',
    width: 1200, height: 630,
    tags: ['Giáo dục', 'Tech', 'Facebook'],
  },
];

// ─── Platform color map ───────────────────────────────────────
const PLATFORM_COLOR: Record<string, string> = {
  Facebook: '#1877F2',
  Instagram: '#E1306C',
  'X/Twitter': '#000000',
  LinkedIn: '#0A66C2',
};

function getPlatformColor(platform: string): string {
  for (const [key, val] of Object.entries(PLATFORM_COLOR)) {
    if (platform.includes(key)) return val;
  }
  return '#0090ff';
}

// ─── BannerCard ───────────────────────────────────────────────
interface BannerCardProps { item: BannerItem; index: number; onClick: () => void; }

const BannerCard: React.FC<BannerCardProps> = ({ item, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const pColor = getPlatformColor(item.platform);
  const isPortrait = item.height > item.width;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 5) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${isPortrait ? 'row-span-2' : ''}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      style={{ transition: 'box-shadow 0.3s ease' }}
    >
      {/* Glow border on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-20"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ boxShadow: `inset 0 0 0 1.5px ${pColor}60, 0 0 24px 0 ${pColor}30` }}
      />

      {/* Image */}
      <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-white/[0.04]"
        style={{ paddingBottom: `${(item.height / item.width) * 100}%` }}>
        <img
          src={item.url}
          alt={item.label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Shimmer skeleton while loading */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-pulse" />
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 flex flex-col justify-end"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}
          >
            {/* Top-right: expand icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
            >
              <ExternalLink size={13} className="text-white/80" />
            </motion.div>

            {/* Bottom info */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.04, duration: 0.25 }}
              className="p-4 space-y-2"
            >
              {/* Platform badge */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: pColor }}
                />
                <span className="text-[9px] font-semibold uppercase tracking-widest text-white/60">
                  {item.platform}
                </span>
              </div>

              {/* Label */}
              <h3 className="text-sm font-bold text-white leading-snug">{item.label}</h3>

              {/* Description */}
              <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">{item.desc}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {item.tags?.map(tag => (
                  <span
                    key={tag}
                    className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${pColor}25`, color: pColor, border: `1px solid ${pColor}40` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible platform dot + label (non-hover) */}
      {!hovered && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-[9px] font-semibold text-white/70 truncate">{item.label}</p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Lightbox ────────────────────────────────────────────────
const Lightbox: React.FC<{ item: BannerItem; onClose: () => void }> = ({ item, onClose }) => {
  const pColor = getPlatformColor(item.platform);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img src={item.url} alt={item.label} className="w-full h-auto max-h-[70vh] object-contain bg-black" />
        </div>

        {/* Info card below image */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mt-3 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] p-4 flex items-start gap-4"
        >
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pColor}20`, color: pColor }}
          >
            <Monitor size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-white">{item.label}</h3>
              <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${pColor}20`, color: pColor, border: `1px solid ${pColor}40` }}
              >
                {item.platform}
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
            className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/60 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main section ─────────────────────────────────────────────
export const ShowcaseSection: React.FC = () => {
  const [activeItem, setActiveItem] = useState<BannerItem | null>(null);
  const [filter, setFilter] = useState<string>('Tất cả');

  const FILTERS = ['Tất cả', 'Facebook', 'Instagram', 'X/Twitter', 'LinkedIn'];

  const filtered = filter === 'Tất cả'
    ? SHOWCASE_ITEMS
    : SHOWCASE_ITEMS.filter(it => it.platform.includes(filter));

  return (
    <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <FadeInUp className="mb-8">
          <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-3xl font-bold">15 ví dụ banner thực tế</h2>
              <p className="text-sm text-slate-500 dark:text-[#666] mt-1 max-w-lg">
                Mỗi banner được AI tạo từ prompt chi tiết — đúng kích thước, đúng nền tảng, sẵn sàng đăng ngay
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-brand-blue bg-brand-blue/[0.08] border border-brand-blue/15 px-3 py-1.5 rounded-full whitespace-nowrap">
              <Sparkles size={11} />
              Tất cả do AI tạo ra
            </div>
          </div>
        </FadeInUp>

        {/* Platform filters */}
        <FadeInUp delay={0.08} className="mb-8">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  filter === f
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                    : 'bg-black/[0.03] dark:bg-white/[0.04] text-slate-500 dark:text-[#666] hover:bg-brand-blue/10 hover:text-brand-blue border border-black/[0.06] dark:border-white/[0.06]'
                }`}
              >
                {f}
              </motion.button>
            ))}
            <motion.div
              className="ml-auto text-[10px] text-slate-400 dark:text-[#555] self-center"
              animate={{ opacity: 1 }}
            >
              {filtered.length} banner{filtered.length !== 1 ? 's' : ''}
            </motion.div>
          </div>
        </FadeInUp>

        {/* Masonry grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-auto"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className={item.height > item.width ? 'row-span-2' : ''}
              >
                <BannerCard item={item} index={idx} onClick={() => setActiveItem(item)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA */}
        <FadeInUp delay={0.1} className="mt-12 text-center">
          <p className="text-sm text-slate-400 dark:text-[#555] mb-2">
            Bạn muốn tạo banner tương tự trong{' '}
            <strong className="text-slate-700 dark:text-white/80">30 giây</strong>?
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-[11px] font-bold rounded-full shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all"
          >
            <Smartphone size={13} />
            Thử Tạo Banner Miễn Phí
          </motion.button>
        </FadeInUp>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeItem && (
          <Lightbox item={activeItem} onClose={() => setActiveItem(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};
