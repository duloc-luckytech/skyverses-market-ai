import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  Gamepad2,
  Globe2,
  HeartPulse,
  LayoutDashboard,
  MonitorSmartphone,
  Search,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Swords,
  Zap,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  APP_GAME_SHOWCASE_LIST,
  type AppGameShowcaseCategoryKey,
  type AppGameShowcaseIndustryKey,
  type AppGameShowcaseMetricIcon,
  type AppGameShowcasePlatform,
  type AppGameShowcaseType,
} from '../src/constants/app-game-showcase';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type ShowcaseCategory = 'all' | AppGameShowcaseCategoryKey;
type Industry = 'all' | AppGameShowcaseIndustryKey;

const CATEGORIES: { key: ShowcaseCategory; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'mobile', label: 'Mobile app' },
  { key: 'game', label: 'Game' },
  { key: 'ai', label: 'AI feature' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'dashboard', label: 'Dashboard' },
];

const INDUSTRIES: { key: Industry; label: string }[] = [
  { key: 'all', label: 'Chọn ngành' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'commerce', label: 'Commerce' },
  { key: 'education', label: 'Education' },
  { key: 'food', label: 'Food' },
  { key: 'game', label: 'Game' },
  { key: 'health', label: 'Health' },
  { key: 'property', label: 'Property' },
  { key: 'travel', label: 'Travel' },
];

const platformOptions: { key: AppGameShowcasePlatform; label: string; icon: React.ElementType }[] = [
  { key: 'iOS', label: 'iOS', icon: Smartphone },
  { key: 'Android', label: 'Android', icon: MonitorSmartphone },
  { key: 'Web', label: 'Web', icon: Globe2 },
];

const tagIcons: React.ElementType[] = [Swords, Smartphone, Sparkles];

const getBadgeIcon = (type: AppGameShowcaseType) => {
  if (type === 'game') return Gamepad2;
  if (type === 'ai') return Sparkles;
  return Smartphone;
};

const metricIcons: Record<AppGameShowcaseMetricIcon, React.ElementType> = {
  chart: LayoutDashboard,
  clock: CalendarDays,
  gamepad: Gamepad2,
  map: Globe2,
  sparkles: Sparkles,
  zap: Zap,
};

const getTagIcon = (label: string, index: number) => {
  if (label.toLowerCase().includes('health')) return HeartPulse;
  if (label.toLowerCase().includes('commerce')) return ShoppingCart;
  if (label.toLowerCase().includes('dashboard')) return LayoutDashboard;
  if (label.toLowerCase().includes('web')) return Globe2;
  return tagIcons[index % tagIcons.length];
};

const ShowcasePage: React.FC = () => {
  usePageMeta({
    title: 'App & Game Showcase | Skyverses',
    description: 'Sản phẩm app, game và AI feature có thể triển khai nhanh bằng Skyverses.',
  });

  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<ShowcaseCategory>('all');
  const [activePlatforms, setActivePlatforms] = useState<AppGameShowcasePlatform[]>([]);
  const [activeIndustry, setActiveIndustry] = useState<Industry>('all');
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return APP_GAME_SHOWCASE_LIST.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.categoryKey === activeCategory;
      const matchesIndustry = activeIndustry === 'all' || item.industryKey === activeIndustry;
      const matchesPlatform =
        activePlatforms.length === 0 || activePlatforms.some((platform) => item.platforms.includes(platform));
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.subtitle.toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesIndustry && matchesPlatform && matchesQuery;
    });
  }, [activeCategory, activeIndustry, activePlatforms, query]);

  const togglePlatform = (platform: AppGameShowcasePlatform) => {
    setActivePlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#03070b] text-white">
      <section className="relative px-5 pb-16 pt-24 md:px-8 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(201,168,76,0.14),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(0,144,255,0.1),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent" />

        <div className="relative mx-auto max-w-[1560px]">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="max-w-[960px] xl:min-w-[760px]"
            >
              <div className="mb-5 flex items-center gap-3">
                <Sparkles size={18} className="text-brand-blue" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.34em] text-brand-blue">
                  App &amp; Game Showcase
                </span>
              </div>
              <h1 className="text-[40px] font-bold leading-[0.98] tracking-tight text-white md:text-[64px] lg:text-[72px]">
                <span className="md:whitespace-nowrap">Sản phẩm app &amp; game</span>
                <br />
                <span className="md:whitespace-nowrap">
                  đã build <span className="text-brand-blue">bằng AI</span>
                </span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/64 md:text-lg">
                Xem các mẫu app, game, AI feature có thể triển khai nhanh trong vài tuần.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
              className="flex shrink-0 flex-wrap gap-4 xl:justify-end"
            >
              <Link
                to="/booking"
                className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-[#D8B24A] to-[#E6C767] px-7 text-base font-bold text-[#070707] shadow-[0_18px_50px_rgba(201,168,76,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(201,168,76,0.3)]"
              >
                <CalendarDays size={20} />
                Tư vấn MVP
                <ArrowRight size={21} className="transition duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/#app-game"
                className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-xl border border-brand-blue/40 bg-black/20 px-7 text-base font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-brand-blue/70 hover:bg-brand-blue/[0.08]"
              >
                Xem quy trình
                <ArrowRight size={21} className="transition duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="mt-10 flex flex-wrap justify-start gap-3 lg:justify-end"
          >
            {['filter-motion', 'card-hover-3D', 'stagger-grid'].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-brand-blue/35 bg-brand-blue/[0.06] px-4 py-2 text-sm font-bold text-brand-blue"
              >
                <Sparkles size={14} />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
            className="mt-4 rounded-2xl border border-brand-blue/35 bg-[#070b10]/86 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-3"
          >
            <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center">
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto 2xl:min-w-[600px]">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`relative shrink-0 rounded-xl px-5 py-4 text-sm font-semibold transition duration-300 ${
                      activeCategory === category.key
                        ? 'bg-brand-blue/[0.12] text-brand-blue'
                        : 'text-white/76 hover:bg-white/[0.045] hover:text-white'
                    }`}
                    type="button"
                  >
                    {category.label}
                    {activeCategory === category.key && (
                      <motion.span
                        layoutId="showcase-filter-active"
                        className="absolute inset-x-5 bottom-2 h-0.5 rounded-full bg-brand-blue"
                      />
                    )}
                  </button>
                ))}
              </div>

              <label className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-black/24 px-4 py-3 text-white/58 transition focus-within:border-brand-blue/50 md:w-[300px]">
                <Search size={19} />
                <input
                  value={query ?? ''}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/38"
                  type="search"
                />
              </label>

              <div className="flex min-h-12 flex-wrap items-center gap-2 border-white/[0.08] 2xl:border-l 2xl:pl-5">
                <span className="mr-1 text-xs font-medium leading-tight text-white/54">Nền tảng</span>
                {platformOptions.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => togglePlatform(key)}
                    className={`inline-flex h-11 min-w-[84px] items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition duration-300 ${
                      activePlatforms.includes(key)
                        ? 'border-brand-blue/55 bg-brand-blue/[0.12] text-brand-blue'
                        : 'border-white/[0.08] bg-white/[0.035] text-white/72 hover:border-brand-blue/35 hover:text-white'
                    }`}
                    type="button"
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              <label className="flex min-h-12 items-center gap-3 border-white/[0.08] 2xl:border-l 2xl:pl-5">
                <span className="shrink-0 text-xs font-medium text-white/54">Ngành</span>
                <select
                  value={activeIndustry}
                  onChange={(event) => setActiveIndustry(event.target.value as Industry)}
                  className="h-11 min-w-[150px] rounded-lg border border-white/[0.08] bg-[#0a0d12] px-4 text-sm font-semibold text-white/72 outline-none transition focus:border-brand-blue/50"
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.key} value={industry.key}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </motion.div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredItems.map((item, index) => {
              const BadgeIcon = getBadgeIcon(item.type);
              const MetricIcon = metricIcons[item.metricIcon];

              return (
                <motion.article
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.48, delay: 0.04 + index * 0.05, ease: EASE }}
                  whileHover={reduceMotion ? undefined : { y: -6 }}
                  className="group relative overflow-hidden rounded-2xl border border-brand-blue/35 bg-[#070b10]/86 shadow-[0_18px_60px_rgba(0,0,0,0.24)] transition duration-500 hover:border-brand-blue/65 hover:shadow-[0_26px_86px_rgba(201,168,76,0.16)]"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.heroImage}
                      alt={item.title}
                      loading="lazy"
                      className="aspect-[16/7] w-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b10] via-[#070b10]/18 to-transparent" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-brand-blue/45 bg-black/48 px-3 py-2 text-sm font-bold text-brand-blue backdrop-blur-md">
                      <BadgeIcon size={17} />
                      {item.badge}
                    </span>
                  </div>

                  <div className="relative -mt-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-bold tracking-tight text-white">{item.title}</h2>
                      <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-brand-blue/25 bg-brand-blue/[0.08] px-3 py-1.5 text-sm font-bold text-brand-blue">
                        <MetricIcon size={15} />
                        {item.metric}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag, tagIndex) => {
                        const TagIcon = getTagIcon(tag, tagIndex);
                        return (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70"
                          >
                            <TagIcon size={13} className="text-brand-blue" />
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Link
                        to={`/showcase/${item.id}`}
                        className="group/cta inline-flex min-w-[132px] items-center justify-center gap-3 rounded-lg border border-brand-blue/40 bg-brand-blue/[0.08] px-4 py-2.5 text-sm font-bold text-brand-blue transition duration-300 hover:bg-brand-blue hover:text-[#070707]"
                      >
                        Xem nhanh
                        <ArrowRight size={16} className="transition duration-300 group-hover/cta:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="mt-8 rounded-2xl border border-brand-blue/20 bg-white/[0.035] p-10 text-center">
              <p className="text-lg font-bold text-white">Chưa có sản phẩm phù hợp filter này.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveIndustry('all');
                  setActivePlatforms([]);
                  setQuery('');
                }}
                className="mt-4 rounded-xl border border-brand-blue/35 px-5 py-3 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-[#070707]"
                type="button"
              >
                Reset filter
              </button>
            </div>
          )}

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto mt-5 flex max-w-[1060px] flex-col items-start justify-between gap-5 rounded-2xl border border-brand-blue/30 bg-[#070b10]/84 px-6 py-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl md:flex-row md:items-center"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/[0.08] text-brand-blue">
                <Sparkles size={24} />
              </div>
              <p className="text-base font-medium text-white/78">
                Bạn có ý tưởng riêng? Skyverses giúp bạn biến ý tưởng thành sản phẩm thực tế chỉ trong vài tuần.
              </p>
            </div>
            <Link
              to="/booking"
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#D8B24A] to-[#E6C767] px-7 py-3 text-sm font-bold text-[#070707] shadow-[0_16px_42px_rgba(201,168,76,0.22)] transition duration-300 hover:-translate-y-0.5"
            >
              Tư vấn miễn phí
              <ArrowRight size={18} className="transition duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ShowcasePage;
