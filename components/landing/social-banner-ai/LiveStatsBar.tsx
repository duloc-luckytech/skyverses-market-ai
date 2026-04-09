import React from 'react';
import { CountUp } from '../_shared/SectionAnimations';

export const LiveStatsBar: React.FC = () => (
  <div className="py-8 border-y border-black/[0.05] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            <CountUp value={47291} suffix="+" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Ảnh tạo hôm nay</p>
        </div>

        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            <CountUp value={12400} suffix="+" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Người dùng</p>
        </div>

        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            <CountUp value={30} suffix="s" prefix="~" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Thời gian tạo TB</p>
        </div>

        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="text-center">
          <p className="text-2xl font-bold text-brand-blue">
            4.9<span className="text-amber-400">★</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5 font-medium">Đánh giá trung bình</p>
        </div>

      </div>
    </div>
  </div>
);
