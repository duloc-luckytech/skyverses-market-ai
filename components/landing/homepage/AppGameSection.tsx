import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  Boxes,
  ChevronRight,
  Code2,
  Gamepad2,
  Globe2,
  ImageIcon,
  MessageCircle,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import LazySection from '../LazySection';
import LazyImage from '../LazyImage';
import AppGameBuildList from './AppGameBuildList';
import { EASE } from './shared';

type IconType = React.ComponentType<{ size?: number; className?: string }>;

type TimelineStep = {
  number: string;
  title: string;
  desc: string;
  icon: IconType;
};

type AppScreen = {
  title: string;
  image: string;
  accent: string;
};

type FeatureCard = {
  title: string;
  desc: string;
  image?: string;
  icon: IconType;
  wide?: boolean;
};

const timelineSteps: TimelineStep[] = [
  { number: '01', title: 'Concept', desc: 'Ý tưởng, thị trường và gameplay cốt lõi.', icon: Sparkles },
  { number: '02', title: 'UI', desc: 'Thiết kế UI/UX và hệ thống trải nghiệm.', icon: Smartphone },
  { number: '03', title: 'Build', desc: 'Phát triển, tích hợp AI và kiểm thử.', icon: Code2 },
  { number: '04', title: 'Launch', desc: 'Phát hành lên store và tối ưu vận hành.', icon: Rocket },
];

const appScreens: AppScreen[] = [
  { title: 'Dashboard', image: '/assets/showcase/album-terra-packaging.webp', accent: '125.8M' },
  { title: 'Khám phá', image: '/assets/showcase/bp-kora-environment.webp', accent: 'Đà Nẵng' },
  { title: 'Hôm nay', image: '/assets/showcase/album-voss-yoga.webp', accent: '7,852' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'AI NPC',
    desc: 'Hành vi thông minh',
    image: '/assets/showcase/bp-kora-3d.webp',
    icon: Bot,
  },
  {
    title: 'AI tạo hình ảnh',
    desc: 'Concept & assets',
    image: '/assets/showcase/bp-malachar-arena.webp',
    icon: ImageIcon,
  },
  {
    title: 'AI viết thoại',
    desc: 'Tự nhiên & phù hợp',
    icon: MessageCircle,
    wide: true,
  },
  {
    title: 'AI cân bằng game',
    desc: 'Dữ liệu & phân tích',
    icon: BarChart3,
  },
];

const launchItems: { title: string; desc: string; icon: IconType }[] = [
  { title: 'App Store', desc: 'iOS', icon: Smartphone },
  { title: 'Google Play', desc: 'Android', icon: PlayCircle },
  { title: 'Web', desc: 'Cross-platform', icon: Globe2 },
  { title: 'Analytics', desc: 'Theo dõi & tối ưu', icon: BarChart3 },
];

const HoverPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.98 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={`group relative [perspective:1200px] ${className}`}
    >
      <div className="h-full rounded-2xl border border-[#3a2f17] bg-[#071018]/82 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl transition duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(4deg)_rotateY(-4deg)_translateY(-8px)] group-hover:border-brand-blue/55 group-hover:shadow-[0_28px_96px_rgba(201,168,76,0.18)]">
        {children}
      </div>
    </motion.div>
  );
};

const PhoneMockup: React.FC<{ screen: AppScreen; index: number }> = ({ screen, index }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={reduceMotion ? undefined : { y: [0, index === 1 ? -7 : 7, 0] }}
      transition={{
        duration: 0.45,
        delay: 0.25 + index * 0.08,
        ease: EASE,
        y: { duration: 4.8 + index * 0.3, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="group [perspective:1000px]"
    >
      <div className="overflow-hidden rounded-[28px] border border-[#273142] bg-[#0c111a] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] transition duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(6deg)_rotateY(-7deg)_translateY(-10px)]">
        <div className={`relative overflow-hidden rounded-[22px] ${index === 2 ? 'bg-[#1d1550] text-white' : 'bg-[#f7f8fb] text-[#101828]'}`}>
          <div className="flex h-9 items-center justify-between px-3 text-[10px] font-bold">
            <span>9:{index}1</span>
            <span className={index === 2 ? 'text-white/70' : 'text-slate-500'}>●●●</span>
          </div>
          <div className="px-3 pb-3">
            <p className="text-sm font-bold">{screen.title}</p>
            <div className="relative mt-3 overflow-hidden rounded-xl">
              <LazyImage src={screen.image} alt={`${screen.title} app screen`} className="aspect-[4/5] transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/66 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-2xl font-bold text-white">{screen.accent}</p>
                <div className="mt-2 h-2 rounded-full bg-white/20">
                  <motion.span
                    className="block h-full rounded-full bg-brand-blue shadow-[0_0_14px_rgba(201,168,76,0.7)]"
                    initial={{ width: '22%' }}
                    whileInView={{ width: `${58 + index * 14}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.4 + index * 0.1, ease: EASE }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((item) => (
                <span key={item} className={`h-7 rounded-lg ${index === 2 ? 'bg-white/10' : 'bg-slate-200/70'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AppGameSection: React.FC = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  return (
    <LazySection rootMargin="300px" minHeight={980}>
      <section className="relative overflow-hidden bg-[#04080d] px-5 py-20 text-white md:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_26%_14%,rgba(201,168,76,0.12),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(43,130,255,0.10),transparent_26%),linear-gradient(180deg,#05080d_0%,#071018_48%,#05080d_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(201,168,76,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.16)_1px,transparent_1px)] [background-size:70px_70px]" />

        <div className="relative mx-auto max-w-[1540px]">
          <div className="grid gap-8 xl:grid-cols-[0.86fr_1.74fr]">
            <div className="relative z-10">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.58, ease: EASE }}
              >
                <div className="mb-7 flex items-center gap-3">
                  <Sparkles size={18} className="text-brand-blue" />
                  <span className="font-mono text-[12px] font-bold uppercase tracking-[0.32em] text-brand-blue">
                    AI Mobile & Game Builder
                  </span>
                </div>
                <h2 className="max-w-[620px] text-balance text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl xl:text-[64px]">
                  Tạo MVP app và game trong <span className="text-brand-blue">vài tuần.</span>
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-white/68 md:text-lg">
                  AI tăng tốc thiết kế, gameplay, UI và phát hành.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/booking')}
                    className="group inline-flex items-center justify-center gap-3 rounded-xl bg-brand-blue px-7 py-4 text-base font-bold text-[#05080d] shadow-[0_18px_44px_rgba(201,168,76,0.38)] transition duration-300 hover:-translate-y-1 hover:bg-[#e4c160] hover:shadow-[0_24px_58px_rgba(201,168,76,0.48)]"
                  >
                    <Rocket size={20} />
                    Bắt đầu MVP
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/booking')}
                    className="group inline-flex items-center justify-center gap-3 rounded-xl border border-brand-blue/40 bg-black/20 px-7 py-4 text-base font-bold text-white transition duration-300 hover:-translate-y-1 hover:border-brand-blue/70 hover:bg-brand-blue/[0.08]"
                  >
                    <PlayCircle size={21} />
                    Xem case study
                  </button>
                </div>
              </motion.div>

              <div className="relative mt-10 pl-14">
                <motion.div
                  className="absolute left-[25px] top-4 h-[calc(100%-32px)] w-px bg-gradient-to-b from-brand-blue/20 via-brand-blue to-brand-blue/20 shadow-[0_0_24px_rgba(201,168,76,0.6)]"
                  initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: reduceMotion ? 0 : 1, delay: 0.2, ease: EASE }}
                  style={{ transformOrigin: 'top' }}
                />
                <div className="space-y-5">
                  {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.number}
                        initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.25 + index * 0.08, ease: EASE }}
                        className="group relative rounded-xl border border-[#302816] bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/45 hover:bg-white/[0.055]"
                      >
                        <motion.span
                          className="absolute -left-[54px] top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-brand-blue/60 bg-[#1a1710] text-brand-blue shadow-[0_0_28px_rgba(201,168,76,0.35)]"
                          animate={reduceMotion ? undefined : { boxShadow: ['0 0 16px rgba(201,168,76,0.24)', '0 0 34px rgba(201,168,76,0.58)', '0 0 16px rgba(201,168,76,0.24)'] }}
                          transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.24, ease: EASE }}
                        >
                          <Icon size={23} />
                        </motion.span>
                        <div className="flex items-start gap-4">
                          <span className="font-mono text-2xl font-bold text-brand-blue">{step.number}</span>
                          <div>
                            <p className="text-lg font-bold">{step.title}</p>
                            <p className="mt-2 text-sm leading-relaxed text-white/60">{step.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.04fr]">
                <HoverPanel delay={0.08}>
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-3 text-xl font-bold">
                        <Gamepad2 size={25} className="text-brand-blue" />
                        Game MVP
                      </h3>
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-3 py-1.5 text-sm font-bold text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Playable
                      </span>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-[#4a3a18] bg-black">
                      <LazyImage src="/assets/showcase/bp-malachar-arena.webp" alt="Game MVP fantasy showcase" className="aspect-[16/10] transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-transparent to-black/10" />
                      <div className="absolute left-5 top-1/2 flex -translate-y-1/2 flex-col gap-3 rounded-xl border border-[#5a461d] bg-black/42 p-3 backdrop-blur-md">
                        {[
                          { label: 'Nhiệm vụ', icon: Rocket },
                          { label: 'Trang bị', icon: Boxes },
                          { label: 'Kỹ năng', icon: Sparkles },
                          { label: 'Bản đồ', icon: ShieldCheck },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <span key={item.label} className="flex items-center gap-2 text-xs font-bold text-brand-blue">
                              <Icon size={17} />
                              <span>{item.label}</span>
                            </span>
                          );
                        })}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-2">
                        {['bp-viper-hero', 'bp-kora-environment', 'bp-zero-cockpit', 'bp-malachar-hero'].map((id) => (
                          <div key={id} className="overflow-hidden rounded-lg border border-[#5a461d] bg-black">
                            <LazyImage src={`/assets/showcase/${id}.webp`} alt={id} className="aspect-[16/9] transition duration-500 hover:scale-110" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </HoverPanel>

                <HoverPanel delay={0.14}>
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-3 text-xl font-bold">
                        <Smartphone size={25} className="text-brand-blue" />
                        Mobile apps
                      </h3>
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-3 py-1.5 text-sm font-bold text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Live
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {appScreens.map((screen, index) => (
                        <PhoneMockup key={screen.title} screen={screen} index={index} />
                      ))}
                    </div>
                  </div>
                </HoverPanel>
              </div>

              <HoverPanel delay={0.18}>
                <div className="p-5">
                  <h3 className="mb-4 flex items-center gap-3 text-xl font-bold">
                    <Sparkles size={24} className="text-brand-blue" />
                    AI features
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {featureCards.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.title}
                          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                          whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: 0.28 + index * 0.06, ease: EASE }}
                          className="group/card relative overflow-hidden rounded-xl border border-[#3a2f17] bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/55"
                        >
                          {item.image ? (
                            <div className="absolute inset-0 opacity-50 transition duration-500 group-hover/card:scale-110">
                              <LazyImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/52 to-black/22" />
                            </div>
                          ) : null}
                          <div className="relative z-10 min-h-[108px]">
                            <Icon size={22} className="mb-3 text-brand-blue" />
                            <p className="text-base font-bold">{item.title}</p>
                            <p className="mt-1 text-sm text-white/58">{item.desc}</p>
                            {item.wide ? (
                              <div className="mt-4 flex items-center gap-3">
                                <motion.span
                                  className="h-8 flex-1 bg-[repeating-linear-gradient(90deg,rgba(201,168,76,0.95)_0_2px,transparent_2px_7px)]"
                                  animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
                                  transition={{ duration: 1.2, repeat: Infinity, ease: EASE }}
                                />
                                <span className="rounded-xl bg-white/[0.08] px-3 py-2 text-sm font-bold">Chúng ta phải bảo vệ vùng đất này!</span>
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </HoverPanel>

              <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
                <HoverPanel delay={0.22}>
                  <div className="p-5">
                    <h3 className="mb-4 flex items-center gap-3 text-xl font-bold">
                      <Rocket size={24} className="text-brand-blue" />
                      Store launch
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {launchItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.title}
                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.34, delay: 0.32 + index * 0.06, ease: EASE }}
                            className="flex items-center gap-3 rounded-xl border border-[#302816] bg-white/[0.04] p-3"
                          >
                            <Icon size={27} className="text-brand-blue" />
                            <div>
                              <p className="text-sm font-bold">{item.title}</p>
                              <p className="text-xs text-white/50">{item.desc}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </HoverPanel>

                <HoverPanel delay={0.26}>
                  <div className="grid h-full grid-cols-2 divide-x divide-brand-blue/25 p-5 text-center">
                    <div className="flex flex-col items-center justify-center px-4">
                      <Timer size={28} className="mb-3 text-brand-blue" />
                      <p className="text-5xl font-bold text-brand-blue">2-6</p>
                      <p className="mt-2 text-base font-semibold">tuần</p>
                      <p className="text-sm text-white/55">Ra mắt MVP</p>
                    </div>
                    <div className="flex flex-col items-center justify-center px-4">
                      <Zap size={28} className="mb-3 text-brand-blue" />
                      <p className="text-5xl font-bold text-brand-blue">-40%</p>
                      <p className="mt-2 text-base font-semibold">chi phí</p>
                      <p className="text-sm text-white/55">phát triển</p>
                    </div>
                  </div>
                </HoverPanel>
              </div>
            </div>
          </div>

          <AppGameBuildList />
        </div>
      </section>
    </LazySection>
  );
};

export default AppGameSection;
