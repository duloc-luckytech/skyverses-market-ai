
import React from 'react';
import { Layers, Users, Star } from 'lucide-react';
import { CountUp } from '../_shared/SectionAnimations';

export const LiveStatsBar: React.FC = () => (
  <div className="border-y border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01] py-6 px-6">
    <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-16">

      {/* Stat 1 — Slides created today */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-blue/[0.08] flex items-center justify-center text-brand-blue">
          <Layers size={16} />
        </div>
        <div>
          <p className="text-xl font-black leading-none text-brand-blue">
            <CountUp value={1240} suffix="+" duration={1.8} />
          </p>
          <p className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5">Slides tạo hôm nay</p>
        </div>
      </div>

      <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

      {/* Stat 2 — Users */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/[0.08] flex items-center justify-center text-violet-500">
          <Users size={16} />
        </div>
        <div>
          <p className="text-xl font-black leading-none text-violet-500">
            <CountUp value={8500} suffix="+" duration={1.8} />
          </p>
          <p className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5">Người dùng</p>
        </div>
      </div>

      <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

      {/* Stat 3 — Rating (static — CountUp doesn't support decimals) */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/[0.08] flex items-center justify-center text-amber-500">
          <Star size={16} />
        </div>
        <div>
          <p className="text-xl font-black leading-none text-amber-500">
            4.8<span className="text-[13px] font-semibold text-slate-400 dark:text-white/30">/5</span>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5">Đánh giá trung bình</p>
        </div>
      </div>

    </div>
  </div>
);
