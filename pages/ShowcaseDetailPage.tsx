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
import {
  APP_GAME_SHOWCASE_ITEMS,
  getAppGameShowcaseById,
} from '../src/constants/app-game-showcase';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const tabs = ['Tổng quan', 'Tính năng', 'Screens', 'Công nghệ', 'Chi phí'];

const featureIcons: React.ElementType[] = [ShoppingBag, CreditCard, Sparkles, LayoutDashboard, Box, PieChart];
const deliverableIcons: React.ElementType[] = [Smartphone, MonitorSmartphone, Globe2, BarChart3];

const ShowcaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeImage, setActiveImage] = useState(0);

  const product = useMemo(() => getAppGameShowcaseById(id), [id]);
  const relatedProducts = APP_GAME_SHOWCASE_ITEMS.filter((item) => item.id !== product.id).slice(0, 4);

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

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="overflow-hidden rounded-2xl border border-[#4a3917] bg-[#070b10]/86 shadow-[0_22px_90px_rgba(0,0,0,0.3)]"
            >
              <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                <div className="relative overflow-hidden p-4 md:p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(201,168,76,0.16),transparent_34%)]" />
                  <div className="relative h-full overflow-hidden rounded-xl border border-[#2f2819] bg-black/30">
                    <img
                      src={product.heroImage}
                      alt={product.title}
                      className="h-full min-h-[360px] w-full object-cover opacity-80 transition duration-700 hover:scale-105 hover:opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#070b10]/95 via-[#070b10]/35 to-transparent" />
                    <div className="absolute left-5 top-5 hidden w-32 rounded-xl border border-[#3a2f17] bg-black/46 p-3 backdrop-blur-md md:block">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/52">{product.title}</p>
                      {['Trang chủ', 'Danh mục', 'Sản phẩm', 'Đơn hàng', 'Báo cáo', 'Cài đặt'].map((item) => (
                        <div key={item} className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white/64">
                          <Grid2X2 size={12} className="text-brand-blue" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="max-w-xl rounded-2xl border border-[#3a2f17] bg-black/48 p-5 backdrop-blur-lg">
                        <p className="text-sm font-semibold text-brand-blue">{product.category}</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{product.title}</h1>
                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/68">{product.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex min-h-[420px] items-end justify-center overflow-hidden p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(201,168,76,0.18),transparent_42%)]" />
                  <div className="relative flex items-end">
                    {product.galleryImages.slice(0, 2).map((image, index) => (
                      <button
                        key={image}
                        onClick={() => setActiveImage(index)}
                        className={`relative -mx-2 h-[340px] w-[170px] overflow-hidden rounded-[2rem] border bg-[#0c1118] p-2 shadow-2xl transition duration-500 hover:-translate-y-2 hover:rotate-1 ${
                          activeImage === index ? 'border-brand-blue/70' : 'border-[#3a2f17]'
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

              <div className="flex items-center justify-center gap-3 border-t border-[#2f2819] px-5 py-3">
                {product.galleryImages.map((image, index) => (
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
              <div className="rounded-2xl border border-[#4a3917] bg-[#090d12]/92 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
                <h2 className="text-3xl font-bold tracking-tight">{product.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-base font-semibold text-brand-blue">
                  <ShoppingCart size={18} />
                  {product.category}
                </p>
                <p className="mt-5 leading-relaxed text-white/66">{product.subtitle}</p>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />

                {[
                  { label: 'Thời gian build', value: product.buildTime, icon: Timer },
                  { label: 'Nền tảng', value: product.platforms.join(' · '), icon: MonitorSmartphone },
                  { label: 'Tiết kiệm chi phí', value: product.costSaving, icon: Zap },
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
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#5a461d] bg-brand-blue/[0.04] px-5 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-[#070707]"
                >
                  Tư vấn miễn phí
                </Link>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-sm text-white/54">Chia sẻ</span>
                  <div className="flex gap-2">
                    {[Link2, Facebook, Share2].map((Icon, index) => (
                      <button
                        key={index}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2f2819] bg-[#0c1117] text-white/72 transition hover:border-brand-blue/40 hover:text-brand-blue"
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
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#3a2f17] bg-[#090d12]/78 p-2">
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

              <section className="rounded-2xl border border-[#3a2f17] bg-[#090d12]/78 p-5">
                <h2 className="text-xl font-bold tracking-tight text-brand-blue">Tính năng nổi bật</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {product.features.map(({ title, description }, index) => {
                    const Icon = featureIcons[index % featureIcons.length];
                    return (
                    <motion.div
                      key={title}
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.42, delay: index * 0.04, ease: EASE }}
                      className="group flex gap-4 rounded-xl border border-[#2f2819] bg-[#0c1117]/80 p-4 transition hover:-translate-y-1 hover:border-brand-blue/35"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-blue/24 bg-brand-blue/[0.07] text-brand-blue">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-white/58">{description}</p>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-[#3a2f17] bg-[#090d12]/78 p-5">
                <h2 className="text-xl font-bold tracking-tight">Bạn sẽ nhận được</h2>
                <div className="mt-5 space-y-3">
                  {product.checklist.map((item) => (
                    <div key={item.label} className="flex items-start gap-3 text-sm leading-relaxed text-white/68">
                      <Check size={16} className={`mt-0.5 shrink-0 ${item.completed ? 'text-brand-blue' : 'text-white/28'}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#3a2f17] bg-[#090d12]/78 p-5">
                <h2 className="text-xl font-bold tracking-tight">Gói bàn giao</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {product.deliverables.map(({ title, detail }, index) => {
                    const Icon = deliverableIcons[index % deliverableIcons.length];
                    return (
                    <div key={title} className="flex items-center gap-4 rounded-xl border border-[#2f2819] bg-[#0c1117]/80 p-4">
                      <Icon size={24} className="text-brand-blue" />
                      <div>
                        <p className="font-bold text-white">{title}</p>
                        <p className="text-sm text-white/50">{detail}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          <section className="mt-5 rounded-2xl border border-[#3a2f17] bg-[#090d12]/78 p-5">
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
                  className="group overflow-hidden rounded-xl border border-[#3a2f17] bg-[#0c1117]/80 transition hover:-translate-y-1 hover:border-brand-blue/55"
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
