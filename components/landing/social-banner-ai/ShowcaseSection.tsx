import React from 'react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';
import { ShowcaseImageStrip } from '../_shared/ProHeroVisuals';

export const ShowcaseSection: React.FC = () => (
  <section className="py-20 bg-black/[0.02] dark:bg-white/[0.015] overflow-hidden">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-10">
      <FadeInUp>
        <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
        <h2 className="text-3xl font-bold">Được tạo bởi AI Skyverses</h2>
        <p className="text-slate-500 dark:text-[#666] text-sm mt-2">
          Hàng nghìn banner từ cộng đồng người dùng — X, Facebook, Instagram, LinkedIn
        </p>
      </FadeInUp>
    </div>
    <ShowcaseImageStrip type="image" limit={20} />
  </section>
);
