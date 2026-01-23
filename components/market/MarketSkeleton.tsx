
import React from 'react';

export const FeaturedSkeleton = () => (
  <div className="mb-8 md:mb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center border-b border-black/5 dark:border-white/5 pb-16 md:pb-24 animate-pulse">
    <div className="lg:col-span-5 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-2 bg-slate-200 dark:bg-white/5 rounded-full"></div>
      </div>
      <div className="space-y-4">
        <div className="h-16 md:h-24 bg-slate-200 dark:bg-white/5 rounded-2xl w-full"></div>
        <div className="h-16 md:h-24 bg-slate-200 dark:bg-white/5 rounded-2xl w-3/4"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-lg w-full"></div>
        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-lg w-5/6"></div>
      </div>
      <div className="flex gap-4 pt-4">
        <div className="w-40 h-14 bg-slate-200 dark:bg-white/5 rounded-full"></div>
        <div className="w-40 h-14 bg-slate-200 dark:bg-white/5 rounded-full"></div>
      </div>
    </div>
    <div className="lg:col-span-7 flex justify-center lg:justify-end relative min-h-[300px] md:min-h-[400px]">
      <div className="relative w-full max-w-[450px] aspect-[4/3] bg-slate-200 dark:bg-white/5 rounded-[2rem] opacity-50 shadow-2xl"></div>
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="flex-shrink-0 w-[280px] md:w-[320px] xl:w-[calc(20%-1.2rem)] flex flex-col bg-white dark:bg-[#08080a] border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-slate-200 dark:bg-white/5 relative">
       <div className="absolute top-4 left-4 w-16 h-4 bg-black/10 dark:bg-white/5 rounded"></div>
    </div>
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-white/5 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-full"></div>
        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);
