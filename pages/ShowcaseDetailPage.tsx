import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bookmark,
  Box,
  Check,
  CreditCard,
  Facebook,
  Globe2,
  Grid2X2,
  LayoutDashboard,
  Link2,
  MonitorSmartphone,
  PackageCheck,
  PieChart,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type ShowcaseProduct = {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  heroImage: string;
  mobileImages: string[];
  tags: string[];
  buildTime: string;
  platforms: string;
  savings: string;
  audience: string;
};

type Feature = {
  title: string;
  body: string;
  icon: React.ElementType;
};

type Delivery = {
  title: string;
  body: string;
  icon: React.ElementType;
};

const PRODUCTS: ShowcaseProduct[] = [
  {
    id: 'shopverse',
    title: 'ShopVerse Commerce',
    category: 'E-commerce App',
    subtitle: 'Giải pháp e-commerce hiện đại với AI gợi ý thông minh và quản trị tập trung.',
    description:
      'Trải nghiệm mua sắm mượt mà, catalogue sản phẩm rõ ràng, checkout nhanh và dashboard vận hành cho đội ngũ bán hàng.',
    heroImage: '/assets/showcase/album-voss-campaign.webp',
    mobileImages: [
      '/assets/showcase/album-voss-gear.webp',
      '/assets/showcase/album-voss-campaign.webp',
      '/assets/showcase/album-terra-packaging.webp',
    ],
    tags: ['E-commerce', 'Web', 'Mobile', 'AI Recommend'],
    buildTime: '2-6 tuần',
    platforms: 'iOS · Android · Web',
    savings: '-40% so với cách truyền thống',
    audience: 'Bán lẻ, Thời trang, Điện tử, Mỹ phẩm ...',
  },
  {
    id: 'dragon-realms',
    title: 'Dragon Realms RPG',
    category: 'Mobile Game',
    subtitle: 'Game MVP fantasy RPG với gameplay loop, inventory và AI NPC companion.',
    description:
      'Một bản mẫu game giàu hình ảnh để kiểm chứng gameplay, art direction và lộ trình phát hành nhanh.',
    heroImage: '/assets/showcase/bp-malachar-arena.webp',
    mobileImages: [
      '/assets/showcase/bp-malachar-arena.webp',
      '/assets/showcase/bp-malachar-hero.webp',
      '/assets/showcase/bp-malachar-3d.webp',
    ],
    tags: ['RPG', 'iOS', 'Android', 'AI NPC'],
    buildTime: '2-6 tuần',
    platforms: 'iOS · Android',
    savings: '-40% chi phí MVP',
    audience: 'Studio game, IP fantasy, cộng đồng creator ...',
  },
  {
    id: 'fitpulse',
    title: 'FitPulse Tracker',
    category: 'Health App',
    subtitle: 'Ứng dụng tracking sức khỏe, hành trình tập luyện và AI coach cá nhân.',
    description:
      'Mobile app gọn, đẹp, có dashboard theo dõi tiến độ và module AI hỗ trợ gợi ý thói quen.',
    heroImage: '/assets/showcase/album-voss-run.webp',
    mobileImages: [
      '/assets/showcase/album-voss-run.webp',
      '/assets/showcase/album-voss-yoga.webp',
      '/assets/showcase/album-voss-gear.webp',
    ],
    tags: ['Health', 'iOS', 'Android', 'AI Coach'],
    buildTime: '2-4 tuần',
    platforms: 'iOS · Android',
    savings: '-35% chi phí thiết kế',
    audience: 'Fitness brand, coach, cộng đồng wellness ...',
  },
  {
    id: 'travel-booking',
    title: 'TravelGo Booking',
    category: 'Mobile App',
    subtitle: 'Ứng dụng booking tour, khách sạn và trải nghiệm địa phương.',
    description:
      'Giao diện đặt dịch vụ nhanh, tìm kiếm thông minh và quản lý booking cho đội vận hành.',
    heroImage: '/assets/showcase/album-verano-villa.webp',
    mobileImages: [
      '/assets/showcase/album-verano-villa.webp',
      '/assets/showcase/album-verano-pool.webp',
      '/assets/showcase/album-verano-market.webp',
    ],
    tags: ['Travel', 'Booking', 'Mobile', 'AI Search'],
    buildTime: '2-5 tuần',
    platforms: 'iOS · Android · Web',
    savings: '-40% chi phí MVP',
    audience: 'Travel agency, resort, tour operator ...',
  },
  {
    id: 'ai-npc-companion',
    title: 'AI Companion',
    category: 'AI Feature',
    subtitle: 'AI companion cho game/app với hội thoại tự nhiên và voice/TTS.',
    description:
      'Module AI có thể nhúng vào sản phẩm hiện có để tăng tương tác, hướng dẫn và cá nhân hóa.',
    heroImage: '/assets/showcase/bp-kora-3d.webp',
    mobileImages: [
      '/assets/showcase/bp-kora-3d.webp',
      '/assets/showcase/bp-kora-environment.webp',
      '/assets/showcase/bp-kora-details.webp',
    ],
    tags: ['AI Feature', 'NLP', 'Voice', 'TTS'],
    buildTime: '1-2 tuần',
    platforms: 'Web · Mobile · API',
    savings: '-30% thời gian tích hợp',
    audience: 'Game, education app, support assistant ...',
  },
  {
    id: 'admin-analytics',
    title: 'Admin Analytics',
    category: 'Dashboard',
    subtitle: 'Dashboard quản trị dữ liệu, doanh thu, người dùng và hiệu suất vận hành.',
    description:
      'Tổng hợp số liệu realtime, báo cáo trực quan và AI insight giúp đội ngũ ra quyết định nhanh hơn.',
    heroImage: '/assets/showcase/album-terra-packaging.webp',
    mobileImages: [
      '/assets/showcase/album-terra-packaging.webp',
      '/assets/showcase/album-terra-collection.webp',
      '/assets/showcase/album-terra-material.webp',
    ],
    tags: ['Dashboard', 'Web', 'Analytics', 'AI Insight'],
    buildTime: '1-3 tuần',
    platforms: 'Web · Responsive',
    savings: '-40% chi phí BI',
    audience: 'SME, vận hành, sales, marketing ...',
  },
];

const tabs = ['Tổng quan', 'Tính năng', 'Screens', 'Công nghệ', 'Chi phí'];

const features: Feature[] = [
  { title: 'Catalog sản phẩm', body: 'Quản lý danh mục, biến thể, bộ lọc thông minh và tìm kiếm nhanh.', icon: ShoppingBag },
  { title: 'Checkout linh hoạt', body: 'Thanh toán nhanh, nhiều phương thức và áp dụng mã giảm giá.', icon: CreditCard },
  { title: 'AI gợi ý thông minh', body: 'Đề xuất sản phẩm cá nhân hóa giúp tăng chuyển đổi và giá trị đơn hàng.', icon: Sparkles },
  { title: 'Dashboard quản trị', body: 'Theo dõi doanh thu, đơn hàng, khách hàng và hiệu suất theo thời gian thực.', icon: LayoutDashboard },
  { title: 'Quản lý tồn kho', body: 'Đồng bộ tồn kho đa kênh, cảnh báo tồn thấp và nhập/xuất đơn giản.', icon: Box },
  { title: 'Báo cáo & phân tích', body: 'Báo cáo bán hàng, hành vi khách hàng và hiệu suất marketing.', icon: PieChart },
];

const deliveries: Delivery[] = [
  { title: 'App Store', body: 'iOS', icon: Smartphone },
  { title: 'Google Play', body: 'Android', icon: MonitorSmartphone },
  { title: 'Web App', body: 'PWA / Responsive', icon: Globe2 },
  { title: 'Analytics', body: 'GA4 / Dashboard', icon: BarChart3 },
];

const checklist = [
  'Mã nguồn đầy đủ & tài liệu kỹ thuật',
  'App hoàn thiện sẵn sàng triển khai',
  'Admin web quản trị mạnh mẽ',
  'Tích hợp thanh toán & vận chuyển',
  'Hỗ trợ triển khai lên store & web',
  'Bảo hành & hỗ trợ sau bàn giao',
];

const relatedIds = ['travel-booking', 'fitpulse', 'admin-analytics', 'ai-npc-companion'];

const ShowcaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeImage, setActiveImage] = useState(0);

  const product = useMemo(() => PRODUCTS.find((item) => item.id === id) ?? PRODUCTS[0], [id]);
  const relatedProducts = PRODUCTS.filter((item) => relatedIds.includes(item.id) && item.id !== product.id);

  usePageMeta({
    title: `${product.title} | App & Game Showcase`,
    description: product.subtitle,
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#03070b] text-white">
      <section className="relative px-5 pb-16 pt-8 md:px-8 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(201,168,76,0.12),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(0,144,255,0.1),transparent_26%)]" />
        <div className="relative mx-auto max-w-[1560px]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/showcase"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/68 transition hover:text-brand-blue"
            >
              <ArrowLeft size={18} />
              Quay lại danh sách
            </Link>
            <span className="rounded-lg border border-brand-blue/25 bg-brand-blue/[0.08] px-4 py-2 text-xs font-bold text-brand-blue">
              screen carousel
            </span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="overflow-hidden rounded-2xl border border-brand-blue/35 bg-[#070b10]/86 shadow-[0_22px_90px_rgba(0,0,0,0.3)]"
            >
              <div className="grid min-h-[420px] gap-0 lg:grid-cols-[1fr_360px]">
                <div className="relative overflow-hidden p-4 md:p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(201,168,76,0.16),transparent_34%)]" />
                  <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.08] bg-black/30">
                    <img
                      src={product.heroImage}
                      alt={product.title}
                      className="h-full min-h-[360px] w-full object-cover opacity-80 transition duration-700 hover:scale-105 hover:opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#070b10]/95 via-[#070b10]/35 to-transparent" />
                    <div className="absolute left-5 top-5 hidden w-32 rounded-xl border border-white/[0.08] bg-black/46 p-3 backdrop-blur-md md:block">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/52">Shopverse</p>
                      {['Trang chủ', 'Danh mục', 'Sản phẩm', 'Đơn hàng', 'Báo cáo', 'Cài đặt'].map((item) => (
                        <div key={item} className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white/64">
                          <Grid2X2 size={12} className="text-brand-blue" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="max-w-xl rounded-2xl border border-white/[0.08] bg-black/48 p-5 backdrop-blur-lg">
                        <p className="text-sm font-semibold text-brand-blue">{product.category}</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{product.title}</h1>
                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/68">{product.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex min-h-[420px] items-end justify-center overflow-hidden p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(201,168,76,0.18),transparent_42%)]" />
                  <div className="relative flex items-end gap-[-20px]">
                    {product.mobileImages.slice(0, 2).map((image, index) => (
                      <button
                        key={image}
                        onClick={() => setActiveImage(index)}
                        className={`relative -mx-2 h-[340px] w-[170px] overflow-hidden rounded-[2rem] border bg-[#0c1118] p-2 shadow-2xl transition duration-500 hover:-translate-y-2 hover:rotate-1 ${
                          activeImage === index ? 'border-brand-blue/70' : 'border-white/16'
                        }`}
                        type="button"
                      >
                        <span className="absolute left-1/2 top-3 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
                        <img src={image} alt={`${product.title} screen ${index + 1}`} className="h-full w-full rounded-[1.55rem] object-cover" />
                        <div className="absolute inset-2 rounded-[1.55rem] bg-gradient-to-t from-black/55 via-transparent to-black/5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 border-t border-white/[0.06] px-5 py-3">
                {product.mobileImages.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeImage === index ? 'w-10 bg-brand-blue' : 'w-5 bg-white/24 hover:bg-brand-blue/60'
                    }`}
                    aria-label={`View screen ${index + 1}`}
                    type="button"
                  />
                ))}
              </div>
            </motion.div>

            <motion.aside
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
              className="xl:sticky xl:top-24"
            >
              <div className="mb-2 inline-flex rounded-lg border border-brand-blue/25 bg-brand-blue/[0.08] px-4 py-2 text-xs font-bold text-brand-blue">
                sticky summary
              </div>
              <div className="rounded-2xl border border-brand-blue/35 bg-[#090d12]/92 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
                <h2 className="text-3xl font-bold tracking-tight">{product.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-base font-semibold text-brand-blue">
                  <ShoppingCart size={18} />
                  {product.category}
                </p>
                <p className="mt-5 leading-relaxed text-white/66">{product.subtitle}</p>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />

                {[
                  { label: 'Thời gian build', value: product.buildTime, icon: Timer },
                  { label: 'Nền tảng', value: product.platforms, icon: MonitorSmartphone },
                  { label: 'Tiết kiệm chi phí', value: product.savings, icon: Zap },
                  { label: 'Phù hợp với', value: product.audience, icon: PackageCheck },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="mb-5 flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-blue/24 bg-brand-blue/[0.07] text-brand-blue">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-white/48">{label}</p>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-white/82">{value}</p>
                    </div>
                  </div>
                ))}

                <Link
                  to="/booking"
                  className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#D8B24A] to-[#E6C767] px-5 text-sm font-bold text-[#070707] transition hover:-translate-y-0.5"
                >
                  <Sparkles size={18} />
                  Build app tương tự
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/booking"
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-brand-blue/36 bg-brand-blue/[0.04] px-5 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-[#070707]"
                >
                  Tư vấn miễn phí
                </Link>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-sm text-white/54">Chia sẻ</span>
                  <div className="flex gap-2">
                    {[Link2, Facebook, Share2].map((Icon, index) => (
                      <button
                        key={index}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/72 transition hover:border-brand-blue/40 hover:text-brand-blue"
                        type="button"
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                    <button className="flex h-10 items-center gap-2 rounded-lg border border-brand-blue/25 px-3 text-sm font-semibold text-brand-blue" type="button">
                      <Bookmark size={15} />
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative rounded-xl px-5 py-3 text-sm font-semibold transition ${
                      activeTab === tab ? 'text-brand-blue' : 'text-white/64 hover:text-white'
                    }`}
                    type="button"
                  >
                    {activeTab === tab && (
                      <motion.span
                        layoutId="showcase-detail-tab"
                        className="absolute inset-0 rounded-xl border border-brand-blue/25 bg-brand-blue/[0.08]"
                      />
                    )}
                    <span className="relative">{tab}</span>
                  </button>
                ))}
                <span className="ml-auto rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-2 text-xs font-bold text-brand-blue">
                  tabs motion
                </span>
              </div>

              <section className="rounded-2xl border border-brand-blue/24 bg-[#090d12]/78 p-5">
                <h2 className="text-xl font-bold tracking-tight text-brand-blue">Tính năng nổi bật</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {features.map(({ title, body, icon: Icon }, index) => (
                    <motion.div
                      key={title}
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.42, delay: index * 0.04, ease: EASE }}
                      className="group flex gap-4 rounded-xl border border-white/[0.07] bg-white/[0.035] p-4 transition hover:-translate-y-1 hover:border-brand-blue/35"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-blue/24 bg-brand-blue/[0.07] text-brand-blue">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-white/58">{body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-brand-blue/24 bg-[#090d12]/78 p-5">
                <h2 className="text-xl font-bold tracking-tight">Bạn sẽ nhận được</h2>
                <div className="mt-5 space-y-3">
                  {checklist.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/68">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-blue" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-brand-blue/24 bg-[#090d12]/78 p-5">
                <h2 className="text-xl font-bold tracking-tight">Gói bàn giao</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {deliveries.map(({ title, body, icon: Icon }) => (
                    <div key={title} className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
                      <Icon size={24} className="text-brand-blue" />
                      <div>
                        <p className="font-bold text-white">{title}</p>
                        <p className="text-sm text-white/50">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <section className="mt-5 rounded-2xl border border-brand-blue/24 bg-[#090d12]/78 p-5">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-brand-blue">Sản phẩm liên quan</h2>
              <span className="rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-2 text-xs font-bold text-brand-blue">
                related cards
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/showcase/${item.id}`}
                  className="group overflow-hidden rounded-xl border border-brand-blue/24 bg-white/[0.035] transition hover:-translate-y-1 hover:border-brand-blue/55"
                >
                  <div className="relative">
                    <img src={item.heroImage} alt={item.title} className="aspect-[16/7] w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090d12] via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/54">{item.category}</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] px-3 py-1.5 text-xs font-bold text-brand-blue">
                      <Timer size={13} />
                      {item.buildTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default ShowcaseDetailPage;
