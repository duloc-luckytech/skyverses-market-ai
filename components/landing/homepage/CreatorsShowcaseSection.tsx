import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import LazySection from '../LazySection';
import type { ShowcaseImage, ShowcaseVideo } from '../../../src/constants/showcase-cdn';
import { EASE, MotionChip, Reveal, SectionHeader } from './shared';

const CreatorShowcasePanel: React.FC<{
  title: string;
  cta: string;
  items: Array<ShowcaseImage | ShowcaseVideo>;
  type: 'image' | 'video';
  onCta: () => void;
}> = ({ title, cta, items, type, onCta }) => (
  <Reveal>
    <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            {type === 'image' ? '4K · Nano Banana · Prompt to image' : 'Veo 3 · Cinematic · Motion'}
          </p>
        </div>
        <button onClick={onCta} className="shrink-0 rounded-full border border-brand-blue/30 px-4 py-2 text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white">
          {cta}
        </button>
      </div>
      <div className="grid max-h-[460px] grid-cols-2 gap-3 overflow-hidden sm:grid-cols-3">
        {items.map((item, index) => {
          const source = type === 'image'
            ? (item as ShowcaseImage).img
            : ((item as ShowcaseVideo).thumb || (item as ShowcaseVideo).videoUrl);
          return (
            <motion.div
              key={`${type}-${index}-${source}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: EASE }}
              className={`group relative overflow-hidden rounded-2xl bg-white/[0.05] ${index % 3 === 0 ? 'row-span-2 min-h-[210px]' : 'min-h-[130px]'}`}
            >
              {type === 'video' && (item as ShowcaseVideo).videoUrl ? (
                <video src={(item as ShowcaseVideo).videoUrl} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
              ) : (
                <img src={source} alt={`${title} — Skyverses AI ${type} #${index + 1}`} loading="lazy" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 transition group-hover:ring-brand-blue/60" />
              {type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
                    <Play size={16} fill="currentColor" />
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  </Reveal>
);

const CreatorsShowcaseSection: React.FC<{
  showcaseImages: ShowcaseImage[];
  showcaseVideos: ShowcaseVideo[];
}> = ({ showcaseImages, showcaseVideos }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <LazySection rootMargin="300px" minHeight={640} className="bg-[#0d0b08]">
      <section className="px-5 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-[1300px]">
          <SectionHeader label={t('landing.showcase.label')} title={t('landing.showcase.title')} desc={t('landing.showcase.desc')} dark />
          <div className="mb-5 flex flex-wrap gap-2">
            <MotionChip name="stagger-children" />
            <MotionChip name="hover-lift" />
            <MotionChip name="image-zoom" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CreatorShowcasePanel
              title={t('landing.showcase.image_title')}
              cta={t('landing.showcase.image_cta')}
              items={showcaseImages.slice(0, 8)}
              type="image"
              onCta={() => navigate('/product/ai-image-generator')}
            />
            <CreatorShowcasePanel
              title={t('landing.showcase.video_title')}
              cta={t('landing.showcase.video_cta')}
              items={showcaseVideos.slice(0, 8)}
              type="video"
              onCta={() => navigate('/product/ai-video-generator')}
            />
          </div>
          <button onClick={() => navigate('/explorer')} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:gap-3">
            {t('landing.showcase.full_gallery')} <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </LazySection>
  );
};

export default CreatorsShowcaseSection;
