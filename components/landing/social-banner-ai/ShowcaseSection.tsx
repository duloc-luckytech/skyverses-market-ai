import React from 'react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';
import { ShowcaseImageStrip } from '../_shared/ProHeroVisuals';

interface ShowcaseSectionProps { productSlug?: string; }

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ productSlug }) => (
  <section className="py-20 bg-black/[0.02] dark:bg-white/[0.015] overflow-hidden border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-10">
      <FadeInUp>
        <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Được tạo bởi AI Skyverses</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-1">
          Hàng nghìn banner từ cộng đồng người dùng — Facebook, X, Instagram & LinkedIn
        </p>
      </FadeInUp>
    </div>
    <ShowcaseImageStrip type="image" limit={20} />
  </section>
);
