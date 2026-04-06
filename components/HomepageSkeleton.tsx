
import React from 'react';

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent`;

const HomepageSkeleton: React.FC = () => (
  <div className="relative min-h-screen bg-[#fcfcfd] dark:bg-[#030304] font-sans transition-colors duration-500">
    {/* Background */}
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[40%] w-[600px] h-[400px] bg-brand-blue/[0.04] dark:bg-brand-blue/[0.06] rounded-full blur-[80px]" />
      <div className="absolute top-[65%] left-[-5%] w-[350px] h-[350px] bg-purple-500/[0.03] dark:bg-purple-500/[0.04] rounded-full blur-[60px]" />
    </div>

    <div className="relative z-10">
      {/* ═══ HERO SKELETON ═══ */}
      <section className="pt-16 md:pt-32 pb-0 max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-0 items-center min-h-0 md:min-h-[60vh] lg:min-h-[70vh]">
          {/* Left content */}
          <div className="space-y-4 md:space-y-8 lg:pr-16 animate-pulse">
            {/* Badge */}
            <div className="hidden md:block">
              <div className="h-8 w-52 bg-brand-blue/8 dark:bg-brand-blue/15 rounded-full" />
            </div>
            {/* Headline */}
            <div className="space-y-3">
              <div className={`h-10 md:h-16 bg-slate-200/60 dark:bg-white/[0.04] rounded-2xl w-full ${shimmer}`} />
              <div className={`h-10 md:h-16 bg-slate-200/60 dark:bg-white/[0.04] rounded-2xl w-4/5 ${shimmer}`} />
            </div>
            {/* Subtitle */}
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded-lg w-full" />
              <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded-lg w-3/4 hidden md:block" />
            </div>
            {/* CTAs */}
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-40 bg-slate-900/80 dark:bg-white/10 rounded-xl" />
              <div className="h-12 w-32 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl" />
            </div>
            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center space-y-1.5">
                  <div className="h-8 w-14 bg-slate-200/60 dark:bg-white/[0.04] rounded-lg mx-auto" />
                  <div className="h-2.5 w-16 bg-slate-100 dark:bg-white/[0.03] rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Gallery skeleton */}
          <div className="md:hidden mt-3 -mx-4 px-4 animate-pulse">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-orange-500/30" />
              <div className="h-2 w-16 bg-orange-500/20 rounded" />
            </div>
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-shrink-0 w-[280px] h-[200px] rounded-2xl bg-slate-100 dark:bg-white/[0.03] ${shimmer}`} />
              ))}
            </div>
          </div>

          <div className="hidden md:block animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-orange-500/30" />
              <div className="h-2.5 w-28 bg-orange-500/20 rounded" />
              <div className="flex-1 h-px bg-orange-500/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`rounded-2xl bg-slate-100 dark:bg-white/[0.03] overflow-hidden ${shimmer}`}>
                  <div className="aspect-[16/10] bg-slate-200/60 dark:bg-white/[0.03]" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-slate-200/50 dark:bg-white/[0.04] rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-white/[0.02] rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AI MODELS MARQUEE SKELETON ═══ */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 mt-4 animate-pulse">
        <div className="h-12 bg-slate-100/50 dark:bg-white/[0.02] rounded-2xl" />
      </div>

      {/* ═══ TRUST PILLARS SKELETON ═══ */}
      <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 py-4 md:py-12 animate-pulse">
        {/* Mobile chips */}
        <div className="md:hidden flex gap-2.5 overflow-hidden pb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 h-10 w-28 bg-slate-100 dark:bg-white/[0.03] rounded-xl" />
          ))}
        </div>
        {/* Desktop */}
        <div className={`hidden md:block rounded-[2.5rem] bg-slate-50 dark:bg-[#0a0c12] border border-black/[0.04] dark:border-white/[0.04] p-12 lg:p-14 ${shimmer}`}>
          <div className="grid grid-cols-5 gap-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 space-y-4">
                <div className="w-14 h-14 bg-slate-200/50 dark:bg-white/[0.04] rounded-2xl" />
                <div className="h-10 w-20 bg-slate-200/50 dark:bg-white/[0.04] rounded-lg" />
                <div className="h-3 w-24 bg-slate-100 dark:bg-white/[0.03] rounded" />
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-slate-100 dark:bg-white/[0.02] rounded w-full" />
                  <div className="h-2.5 bg-slate-100 dark:bg-white/[0.02] rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS SKELETON ═══ */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20">
        <div className="py-10 md:py-28 animate-pulse">
          <div className="text-center mb-6 md:mb-20 space-y-3">
            <div className="h-7 w-28 bg-brand-blue/8 rounded-full mx-auto" />
            <div className="h-10 w-72 bg-slate-200/60 dark:bg-white/[0.04] rounded-xl mx-auto" />
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-8 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex-shrink-0 w-[260px] md:w-auto rounded-2xl md:rounded-3xl bg-slate-100/50 dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden ${shimmer}`}>
                <div className="aspect-[16/9] bg-slate-200/50 dark:bg-white/[0.03]" />
                <div className="p-4 md:p-6 space-y-3">
                  <div className="h-5 bg-slate-200/50 dark:bg-white/[0.04] rounded w-2/3" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.02] rounded w-full" />
                  <div className="h-3 bg-slate-100 dark:bg-white/[0.02] rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ PRODUCT GRID SKELETON ═══ */}
        <div className="space-y-16 md:space-y-24 pt-8 animate-pulse">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-5 w-40 bg-slate-200/60 dark:bg-white/[0.04] rounded-lg" />
                  <div className="h-3 w-56 bg-slate-100 dark:bg-white/[0.03] rounded" />
                </div>
              </div>
              <div className="hidden md:flex gap-2">
                <div className="w-8 h-8 bg-slate-100 dark:bg-white/[0.03] rounded-lg" />
                <div className="w-8 h-8 bg-slate-100 dark:bg-white/[0.03] rounded-lg" />
              </div>
            </div>
            <div className="flex gap-4 md:gap-8 overflow-hidden">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-shrink-0 w-[280px] md:w-[320px] xl:w-[360px] flex flex-col bg-white dark:bg-[#08080a] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden ${shimmer}`}>
                  <div className="aspect-[16/10] bg-slate-200/60 dark:bg-white/[0.03]" />
                  <div className="p-4 md:p-6 space-y-4">
                    <div className="h-6 bg-slate-200/60 dark:bg-white/[0.04] rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                      <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ USE CASES SKELETON ═══ */}
        <div className={`mt-16 rounded-2xl md:rounded-3xl h-48 md:h-72 bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-pink-500/5 border border-brand-blue/10 dark:border-white/[0.06] animate-pulse ${shimmer}`} />
      </div>
    </div>

    {/* Shimmer keyframe */}
    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

export default HomepageSkeleton;
