import React from 'react';
import { CountUp } from '../_shared/SectionAnimations';

export const LiveStatsBar: React.FC = () => (
  <div className="py-8 border-y border-black/[0.05] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            <CountUp value={2400} suffix="+" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">GitHub Stars</p>
        </div>

        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            <CountUp value={8} suffix=" LLMs" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Model tích hợp sẵn</p>
        </div>

        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            <CountUp value={99} suffix="%" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Uptime SLA</p>
        </div>

        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="text-center">
          <p className="text-2xl font-bold text-brand-blue">
            MIT<span className="text-emerald-500 ml-1">✓</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Open Source License</p>
        </div>

        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            <CountUp value={5} suffix=" min" prefix="~" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Setup self-hosted</p>
        </div>

      </div>
    </div>
  </div>
);
