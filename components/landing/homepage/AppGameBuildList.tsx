import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Boxes, Gamepad2, Globe, ShoppingCart, Smartphone, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { EASE } from './shared';

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

const BUILT_APPS: BuiltApp[] = [
  { id: 'erp', name: 'landing.appgame.app_erp_name', category: 'business', desc: 'landing.appgame.app_erp_desc', platforms: ['web'], buildTime: 'landing.appgame.app_erp_build' },
  { id: 'ecom', name: 'landing.appgame.app_ecom_name', category: 'commerce', desc: 'landing.appgame.app_ecom_desc', platforms: ['web', 'mobile'], buildTime: 'landing.appgame.app_ecom_build' },
  { id: 'crm', name: 'landing.appgame.app_crm_name', category: 'business', desc: 'landing.appgame.app_crm_desc', platforms: ['web', 'mobile'], buildTime: 'landing.appgame.app_crm_build' },
  { id: 'game-casual', name: 'landing.appgame.app_game-casual_name', category: 'game', desc: 'landing.appgame.app_game-casual_desc', platforms: ['mobile'], buildTime: 'landing.appgame.app_game-casual_build' },
  { id: 'booking', name: 'landing.appgame.app_booking_name', category: 'service', desc: 'landing.appgame.app_booking_desc', platforms: ['web', 'mobile'], buildTime: 'landing.appgame.app_booking_build' },
  { id: 'game-ai', name: 'landing.appgame.app_game-ai_name', category: 'game', desc: 'landing.appgame.app_game-ai_desc', platforms: ['mobile', 'web'], buildTime: 'landing.appgame.app_game-ai_build' },
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

const AppGameBuildList: React.FC = () => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<'all' | AppCategory>('all');

  const filters = useMemo(() => ([
    { key: 'all' as const, label: t('landing.appgame.filter_all') },
    { key: 'business' as const, label: t('landing.appgame.filter_business') },
    { key: 'commerce' as const, label: t('landing.appgame.filter_commerce') },
    { key: 'service' as const, label: t('landing.appgame.filter_service') },
    { key: 'game' as const, label: t('landing.appgame.filter_game') },
  ]), [t]);

  const visible = active === 'all' ? BUILT_APPS : BUILT_APPS.filter((app) => app.category === active);

  return (
    <div className="mt-12">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-brand-blue">
            {t('landing.appgame.showcase_label')}
          </span>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            {t('landing.appgame.showcase_title')}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActive(filter.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                active === filter.key
                  ? 'bg-brand-blue text-[#07090d] shadow-[0_0_22px_rgba(201,168,76,0.28)]'
                  : 'border border-white/15 text-white/68 hover:border-brand-blue/40 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((app, index) => {
          const CatIcon = CATEGORY_ICON[app.category];
          return (
            <motion.article
              key={app.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: EASE }}
              whileHover={reduceMotion ? undefined : { y: -5 }}
              className="group relative flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.045] p-6 shadow-[0_16px_55px_rgba(0,0,0,0.22)] transition-colors duration-300 hover:border-brand-blue/40"
            >
              <span className="absolute right-5 top-5 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                {t('landing.appgame.demo_tag')}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/12 text-brand-blue">
                <CatIcon size={20} />
              </span>
              <h4 className="mt-5 text-lg font-bold leading-snug tracking-tight text-white">{t(app.name)}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/80">{t(app.desc)}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {app.platforms.map((platform) => {
                  const Meta = PLATFORM_META[platform];
                  const PlatformIcon = Meta.icon;
                  return (
                    <span key={platform} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/65">
                      <PlatformIcon size={12} /> {Meta.label}
                    </span>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">{t('landing.appgame.timeline')}</span>
                <span className="text-sm font-bold text-brand-blue">{t(app.buildTime)}</span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};

export default AppGameBuildList;
