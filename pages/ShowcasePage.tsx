import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Gamepad2, Smartphone, Sparkles } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type ShowcaseType = 'app' | 'game';

type ShowcaseItem = {
  title: string;
  type: ShowcaseType;
  tag: string;
  image: string;
};

/* Danh sách demo tĩnh — sẽ nối CMS/API sau. */
const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { title: 'Skyverses Mobile MVP', type: 'app', tag: 'iOS · Android', image: '/assets/homepage/ent-api-integration.webp' },
  { title: 'AI Companion App', type: 'app', tag: 'Cross-platform', image: '/assets/homepage/gold-create-creators.webp' },
  { title: 'Malachar Arena', type: 'game', tag: 'Mobile Game', image: '/assets/showcase/bp-malachar-arena.webp' },
  { title: 'AI Story Game', type: 'game', tag: 'Narrative', image: '/assets/homepage/gold-build-video-gen.webp' },
];

const FILTERS: { key: 'all' | ShowcaseType; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'app', label: 'Mobile App' },
  { key: 'game', label: 'Game' },
];

const ShowcasePage: React.FC = () => {
  usePageMeta({
    title: 'Showcase — App & Game | Skyverses',
    description: 'Bộ sưu tập demo app mobile & game do đội ngũ Skyverses thực hiện.',
  });

  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<'all' | ShowcaseType>('all');

  const items = filter === 'all' ? SHOWCASE_ITEMS : SHOWCASE_ITEMS.filter((i) => i.type === filter);

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-28 pb-12 md:px-8 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(201,168,76,0.12),transparent_30%),radial-gradient(circle_at_82%_26%,rgba(43,130,255,0.08),transparent_26%)]" />
        <div className="relative mx-auto max-w-[1480px]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="max-w-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <Sparkles size={17} className="text-brand-blue" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-brand-blue">
                Showcase
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">App &amp; Game</h1>
            <p className="mt-3 text-base leading-relaxed text-white/62">
              Sản phẩm mobile app &amp; game demo do đội ngũ Skyverses thực hiện.
            </p>
          </motion.div>

          {/* Filter */}
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  filter === f.key
                    ? 'border-brand-blue/60 bg-brand-blue/[0.12] text-white'
                    : 'border-white/10 bg-white/[0.035] text-white/65 hover:border-white/25 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-5 pb-20 md:px-8 lg:px-16">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.06 + index * 0.06, ease: EASE }}
              className="group overflow-hidden rounded-xl border border-[#302816] bg-[#071018]/82 transition duration-500 hover:-translate-y-1.5 hover:border-brand-blue/55 hover:shadow-[0_24px_72px_rgba(201,168,76,0.16)]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-black/8" />
                <span className="absolute left-4 top-4 rounded-full border border-brand-blue/30 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-blue backdrop-blur-md">
                  Demo
                </span>
                <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75 backdrop-blur-md">
                  {item.type === 'game' ? <Gamepad2 size={12} /> : <Smartphone size={12} />}
                  {item.type === 'game' ? 'Game' : 'App'}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold leading-tight tracking-tight text-white">{item.title}</h3>
                <p className="mt-1 text-xs font-semibold text-white/45">{item.tag}</p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <div className="mx-auto mt-14 max-w-[1480px]">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#302816] bg-white/[0.03] p-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Có ý tưởng app hoặc game?</h2>
              <p className="mt-2 text-sm text-white/60">Đội ngũ Skyverses đồng hành từ MVP tới sản phẩm hoàn chỉnh.</p>
            </div>
            <Link
              to="/booking"
              className="group inline-flex shrink-0 items-center gap-3 rounded-xl bg-[#B8963F] px-6 py-3 text-sm font-bold text-[#05070a] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Đặt Skyverses thực hiện
              <ArrowRight size={17} className="transition duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShowcasePage;
