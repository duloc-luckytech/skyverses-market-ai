import React from 'react';

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent`;

/* ── Showcase gallery skeleton (dark bg, masonry-like grid) ── */
export const ShowcaseGallerySkeleton: React.FC = () => (
  <div className="bg-[#0d0b08] animate-pulse" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', padding: '40px max(24px, calc((100vw - 1312px) / 2))' }}>
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Left info column */}
      <div className="md:w-1/4 shrink-0 flex flex-col gap-4 md:py-8">
        <div className={`h-8 w-48 bg-amber-500/10 rounded-lg ${shimmer}`} />
        <div className="h-4 w-32 bg-white/[0.06] rounded" />
        <div className="space-y-2 mt-2">
          <div className="h-3 w-full bg-white/[0.06] rounded" />
          <div className="h-3 w-4/5 bg-white/[0.06] rounded" />
        </div>
        <div className="flex gap-4 mt-4">
          <div className="h-3 w-16 bg-white/[0.06] rounded" />
          <div className="h-3 w-16 bg-white/[0.06] rounded" />
        </div>
        {/* Thumbnail grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`aspect-square rounded-lg bg-white/[0.04] ${shimmer}`} />
          ))}
        </div>
      </div>
      {/* Right masonry */}
      <div className="flex-1 columns-2 md:columns-3 gap-3">
        {[220, 260, 200, 280, 240, 260, 220, 280, 200].map((h, i) => (
          <div key={i} className={`mb-3 rounded-xl bg-white/[0.04] ${shimmer}`} style={{ height: h, breakInside: 'avoid' }} />
        ))}
      </div>
    </div>
  </div>
);

/* ── Enterprise / Teams section skeleton (white bg, 2-col cards) ── */
export const EnterpriseSectionSkeleton: React.FC = () => (
  <section className="animate-pulse" style={{ width: '100%', background: '#fff', padding: '72px 0 96px' }}>
    <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div className="space-y-4 mb-14">
        <div className="h-6 w-32 bg-amber-500/10 rounded" />
        <div className={`h-10 w-96 bg-white/[0.08] rounded-xl ${shimmer}`} />
        <div className="h-4 w-80 bg-white/[0.06] rounded" />
      </div>
      {/* Buttons */}
      <div className="flex gap-5 mb-14">
        <div className="h-9 w-36 bg-amber-500/20 rounded" />
        <div className="h-9 w-36 bg-white/[0.06] rounded border border-white/[0.08]" />
      </div>
      {/* 2-col cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded p-8 space-y-8 border border-black/[0.04]">
            <div className={`h-10 w-3/4 bg-white/[0.08] rounded-xl ${shimmer}`} />
            <div className={`w-full aspect-[591/330] bg-white/[0.06] rounded ${shimmer}`} />
            <div className="space-y-3">
              {[1, 2, 3].map(j => (
                <div key={j} className="flex items-center gap-5">
                  <div className="w-2 h-2 bg-white/10 rounded-full shrink-0" />
                  <div className="h-5 w-3/4 bg-white/[0.06] rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── HomeBlocks (CMS) skeleton — horizontal card row ── */
export const HomeBlockSkeleton: React.FC = () => (
  <section className="py-14 md:py-20 bg-white animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div className="space-y-2">
          <div className={`h-7 w-52 bg-white/[0.08] rounded-lg ${shimmer}`} />
          <div className="h-4 w-72 bg-white/[0.06] rounded" />
        </div>
        <div className="hidden md:block h-4 w-16 bg-amber-500/20 rounded" />
      </div>
      <div className="flex gap-5 overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`flex-shrink-0 w-[280px] md:w-[320px] xl:w-[360px] bg-white border border-black/[0.06] rounded-lg overflow-hidden ${shimmer}`}>
            <div className="aspect-[16/10] bg-white/[0.08]" />
            <div className="p-4 md:p-6 space-y-4">
              <div className="h-6 bg-white/[0.08] rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-white/[0.06] rounded w-full" />
                <div className="h-3 bg-white/[0.06] rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── CTA section skeleton ── */
export const CTASkeleton: React.FC = () => (
  <section className="animate-pulse" style={{ width: '100%', background: '#1a2330', padding: '78px 0' }}>
    <div className="flex flex-col items-center gap-8">
      <div className={`h-10 w-96 bg-white/[0.06] rounded-xl ${shimmer}`} />
      <div className="h-9 w-36 bg-white/10 rounded" />
    </div>
  </section>
);

/* ── Developers section skeleton ── */
export const DevelopersSkeleton: React.FC = () => (
  <section className="animate-pulse" style={{ width: '100%', background: '#fff', padding: '88px 0 72px' }}>
    <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto' }}>
      <div className="space-y-4 mb-14">
        <div className="h-6 w-40 bg-amber-500/10 rounded" />
        <div className={`h-10 w-80 bg-white/[0.08] rounded-xl ${shimmer}`} />
        <div className="h-4 w-96 bg-white/[0.06] rounded" />
      </div>
      <div className="flex gap-12">
        <div className="flex-1 space-y-6">
          <div className={`h-10 w-3/4 bg-white/[0.08] rounded-xl ${shimmer}`} />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-white/[0.06] rounded w-full" />
            ))}
          </div>
          <div className="flex gap-5 mt-4">
            <div className="h-9 w-36 bg-amber-500/20 rounded" />
            <div className="h-9 w-36 bg-white/[0.06] rounded" />
          </div>
        </div>
        <div className={`flex-1 aspect-[789/440] bg-white/[0.06] rounded ${shimmer}`} />
      </div>
    </div>
  </section>
);
