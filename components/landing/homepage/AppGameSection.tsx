import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Boxes, Check, Gamepad2, Globe, Layers3, Rocket, ShoppingCart, Smartphone, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { DrawIcon, EASE, GoldButton, HoverCard, MotionChip, Reveal, SectionHeader } from './shared';

type Platform = 'web' | 'mobile';
type AppCategory = 'business' | 'commerce' | 'service' | 'game';

interface BuiltApp {
  id: string;
  name: string;
  category: AppCategory;
  desc: string;
  platforms: Platform[];
  buildTime: string;
}

// ⚠️ PLACEHOLDER DEMO DATA — thay bằng list sản phẩm thật khi có (giữ nguyên shape `BuiltApp[]`).
const BUILT_APPS: BuiltApp[] = [
  { id: 'erp', name: 'ERP · Quản lý doanh nghiệp', category: 'business', desc: 'Tài chính, kho, đơn hàng, nhân sự trong một hệ thống — báo cáo realtime, phân quyền theo phòng ban.', platforms: ['web'], buildTime: '~3-4 tuần' },
  { id: 'ecom', name: 'E-commerce · Thương mại điện tử', category: 'commerce', desc: 'Web bán hàng + app mobile, giỏ hàng, thanh toán, quản lý sản phẩm & vận đơn, tích hợp cổng nội địa.', platforms: ['web', 'mobile'], buildTime: '~2-3 tuần' },
  { id: 'crm', name: 'CRM · Quản lý khách hàng', category: 'business', desc: 'Pipeline bán hàng, chăm sóc khách, lịch sử tương tác, tự động hóa email/SMS bằng AI agent.', platforms: ['web', 'mobile'], buildTime: '~2 tuần' },
  { id: 'game-casual', name: 'Game Mobile · Casual & Hyper-casual', category: 'game', desc: 'Game giải trí với vòng lặp gameplay cuốn hút, bảng xếp hạng & monetization — phát hành lên App Store & Google Play.', platforms: ['mobile'], buildTime: '~3-4 tuần' },
  { id: 'booking', name: 'Booking · Đặt lịch & đặt chỗ', category: 'service', desc: 'Đặt lịch hẹn, phòng, bàn — nhắc lịch tự động, lịch nhân viên, thanh toán đặt cọc.', platforms: ['web', 'mobile'], buildTime: '~2 tuần' },
  { id: 'game-ai', name: 'Game tích hợp AI', category: 'game', desc: 'NPC thông minh, sinh nội dung & màn chơi bằng AI, trợ lý trong game — tùy biến theo ý tưởng của bạn.', platforms: ['mobile', 'web'], buildTime: '~4-6 tuần' },
];

const PLATFORM_META: Record<Platform, { icon: React.ComponentType<{ size?: number }>; label: string }> = {
  web: { icon: Globe, label: 'Web' },
  mobile: { icon: Smartphone, label: 'iOS · Android' },
};

const CATEGORY_ICON: Record<AppCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  business: Boxes,
  commerce: ShoppingCart,
  service: Sparkles,
  game: Gamepad2,
};

/**
 * Pillar ③ — Mobile App & Game development (service). Merges the old BuildApps +
 * BuiltAppsShowcase. App · Game chips, AI-optional, filterable demo showcase.
 * No "one codebase" / "~70%" / desktop claims.
 */
const AppGameSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [active, setActive] = useState<'all' | AppCategory>('all');

  const valueCards = useMemo(() => [
    { icon: Rocket, title: t('landing.appgame.f1_title'), desc: t('landing.appgame.f1_desc'), stat: t('landing.appgame.f1_stat') },
    { icon: Layers3, title: t('landing.appgame.f2_title'), desc: t('landing.appgame.f2_desc'), stat: t('landing.appgame.f2_stat') },
    { icon: Sparkles, title: t('landing.appgame.f3_title'), desc: t('landing.appgame.f3_desc'), stat: t('landing.appgame.f3_stat') },
  ], [t]);

  const publishItems = useMemo(() => [
    t('landing.appgame.publish1'),
    t('landing.appgame.publish2'),
    t('landing.appgame.publish3'),
    t('landing.appgame.publish4'),
  ], [t]);

  const filters = useMemo(() => ([
    { key: 'all' as const, label: t('landing.appgame.filter_all') },
    { key: 'business' as const, label: t('landing.appgame.filter_business') },
    { key: 'commerce' as const, label: t('landing.appgame.filter_commerce') },
    { key: 'service' as const, label: t('landing.appgame.filter_service') },
    { key: 'game' as const, label: t('landing.appgame.filter_game') },
  ]), [t]);

  const visible = active === 'all' ? BUILT_APPS : BUILT_APPS.filter((a) => a.category === active);

  return (
    <section className="relative overflow-hidden bg-[#0d0f16] px-5 py-20 md:px-8 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(201,168,76,0.10),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(201,168,76,0.08),transparent_45%)]" />
      <div className="relative mx-auto max-w-[1300px]">
        <SectionHeader label={t('landing.appgame.label')} title={t('landing.appgame.title')} desc={t('landing.appgame.desc')} dark />

        <div className="mb-5 flex flex-wrap gap-2">
          <MotionChip name="draw-line" />
          <MotionChip name="count-up" />
          <MotionChip name="hover-lift" />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {valueCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.08}>
              <HoverCard dark className="h-full p-6">
                <DrawIcon icon={card.icon} />
                <h3 className="mt-5 text-xl font-bold tracking-tight text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{card.desc}</p>
                <div className="mt-5 inline-flex rounded-full bg-brand-blue/[0.12] px-4 py-2 text-sm font-bold text-brand-blue">{card.stat}</div>
              </HoverCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-6">
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-blue">{t('landing.appgame.publish_label')}</span>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-white">{t('landing.appgame.publish_title')}</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {publishItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-blue/12 text-brand-blue">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-white/65">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-12">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-blue">{t('landing.appgame.showcase_label')}</span>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-white md:text-2xl">{t('landing.appgame.showcase_title')}</h3>

          <div className="mb-8 mt-5 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  active === f.key
                    ? 'bg-brand-blue text-white'
                    : 'border border-white/15 text-white/55 hover:border-white/35 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((app, index) => {
              const CatIcon = CATEGORY_ICON[app.category];
              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05, ease: EASE }}
                  className="group relative flex h-full flex-col rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-brand-blue/40"
                >
                  <span className="absolute right-5 top-5 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    {t('landing.appgame.demo_tag')}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/12 text-brand-blue">
                    <CatIcon size={20} />
                  </span>
                  <h4 className="mt-5 text-lg font-bold leading-snug tracking-tight text-white">{app.name}</h4>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{app.desc}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {app.platforms.map((p) => {
                      const Meta = PLATFORM_META[p];
                      const PIcon = Meta.icon;
                      return (
                        <span key={p} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/65">
                          <PIcon size={12} /> {Meta.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">{t('landing.appgame.timeline')}</span>
                    <span className="text-sm font-bold text-brand-blue">{app.buildTime}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Reveal className="mt-10 text-center">
          <GoldButton onClick={() => navigate('/booking')}>{t('landing.appgame.cta')} <ArrowRight size={15} /></GoldButton>
        </Reveal>
      </div>
    </section>
  );
};

export default AppGameSection;
