import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
 * SEED DATA — 10 models, each with hero + 4 sub-models
 * ═══════════════════════════════════════════════════════════ */
interface SubModel {
  name: string;
  price: string;
  thumb: string;
}
interface ModelData {
  id: string;
  name: string;
  category: string;
  description: string;
  hero: string;
  slug: string;
  subs: SubModel[];
}

const MODELS: ModelData[] = [
  {
    id: 'veo2', name: 'Veo 2.0', category: 'Video Generation',
    description: 'Mô hình tạo video AI thế hệ mới từ Google DeepMind — chất lượng 4K, chuyển động tự nhiên, hiểu ngữ cảnh sâu.',
    hero: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-hero/public',
    slug: '/product/ai-video-generator',
    subs: [
      { name: 'Veo 2.0 Standard', price: '$0.040/SEC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-cockpit/public' },
      { name: 'Veo 2.0 Fast', price: '$0.025/SEC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-weapons/public' },
      { name: 'Veo 2.0 4K', price: '$0.060/SEC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-pilot/public' },
      { name: 'Veo 2.0 Turbo', price: '$0.018/SEC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-turnaround/public' },
    ],
  },
  {
    id: 'gptimg2', name: 'GPT Image 2', category: 'Image Generation',
    description: 'Engine tạo ảnh mạnh mẽ nhất từ OpenAI — photorealistic, text rendering chính xác, đa phong cách.',
    hero: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-hero/public',
    slug: '/product/ai-image-generator',
    subs: [
      { name: 'GPT Image 2 HD', price: '$0.008/PIC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-3d/public' },
      { name: 'GPT Image 2 Fast', price: '$0.004/PIC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-turnaround/public' },
      { name: 'GPT Image 2 4K', price: '$0.012/PIC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-details/public' },
      { name: 'GPT Image 2 Batch', price: '$0.003/PIC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-environment/public' },
    ],
  },
  {
    id: 'wan27', name: 'Wan 2.7', category: 'Video Generation',
    description: 'Mô hình video mã nguồn mở hàng đầu từ Alibaba — hỗ trợ image-to-video, text-to-video với chất lượng cao.',
    hero: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-hero/public',
    slug: '/product/ai-video-generator',
    subs: [
      { name: 'Wan 2.7 1080p', price: '$0.030/SEC', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-turnaround/public' },
      { name: 'Wan 2.7 720p', price: '$0.015/SEC', thumb: '/assets/showcase/album-kuro-decon.webp' },
      { name: 'Wan 2.7 I2V', price: '$0.035/SEC', thumb: '/assets/showcase/album-kuro-movement.webp' },
      { name: 'Wan 2.7 Fast', price: '$0.012/SEC', thumb: '/assets/showcase/album-kuro-exhibition.webp' },
    ],
  },
  {
    id: 'veo31', name: 'Veo 3.1', category: 'Video Generation',
    description: 'Phiên bản mới nhất của Google Veo — tốc độ nhanh gấp 3x, hỗ trợ audio sync và chuyển động phức tạp.',
    hero: '/assets/homepage/gold-build-video-gen.webp',
    slug: '/product/ai-video-generator',
    subs: [
      { name: 'Veo 3.1 Pro', price: '$0.050/SEC', thumb: '/assets/homepage/gold-tools-video.webp' },
      { name: 'Veo 3.1 Standard', price: '$0.035/SEC', thumb: '/assets/showcase/album-blanc-bride.webp' },
      { name: 'Veo 3.1 Audio', price: '$0.060/SEC', thumb: '/assets/showcase/album-blanc-evening.webp' },
      { name: 'Veo 3.1 Fast', price: '$0.020/SEC', thumb: '/assets/showcase/album-blanc-fitting.webp' },
    ],
  },
  {
    id: 'ernie', name: 'ERNIE Image', category: 'Image Generation',
    description: 'Mô hình AI tạo ảnh từ Baidu — vượt trội về phong cách Á Đông, nhân vật anime và minh hoạ.',
    hero: '/assets/homepage/gold-build-image-gen.webp',
    slug: '/product/ai-image-generator',
    subs: [
      { name: 'ERNIE 4.0 Turbo', price: '$0.006/PIC', thumb: '/assets/homepage/gold-tools-image.webp' },
      { name: 'ERNIE Anime', price: '$0.005/PIC', thumb: '/assets/showcase/album-cote-campaign.webp' },
      { name: 'ERNIE Photo', price: '$0.008/PIC', thumb: '/assets/showcase/album-cote-collection.webp' },
      { name: 'ERNIE Sketch', price: '$0.004/PIC', thumb: '/assets/showcase/album-cote-handbag.webp' },
    ],
  },
  {
    id: 'gptimg', name: 'GPT Image', category: 'Image Generation',
    description: 'Engine tạo ảnh thế hệ đầu từ OpenAI — DALL-E 3 chất lượng cao, hỗ trợ inpainting và editing.',
    hero: '/assets/homepage/gold-tools-hero.webp',
    slug: '/product/ai-image-generator',
    subs: [
      { name: 'DALL-E 3 HD', price: '$0.008/PIC', thumb: '/assets/showcase/album-elara-campaign.webp' },
      { name: 'DALL-E 3 Standard', price: '$0.004/PIC', thumb: '/assets/showcase/album-elara-atelier.webp' },
      { name: 'DALL-E 3 Edit', price: '$0.010/PIC', thumb: '/assets/showcase/album-elara-detail.webp' },
      { name: 'DALL-E 3 Variation', price: '$0.006/PIC', thumb: '/assets/showcase/album-elara-gown.webp' },
    ],
  },
  {
    id: 'nanobanana2', name: 'Nano Banana 2', category: 'Image Generation',
    description: 'Mô hình sáng tạo độc quyền Skyverses — character design, game art, concept art chất lượng studio.',
    hero: '/assets/homepage/gold-create-creators.webp',
    slug: '/product/ai-image-generator',
    subs: [
      { name: 'Banana Pro HD', price: '$0.010/PIC', thumb: '/assets/showcase/album-heritage-suit.webp' },
      { name: 'Banana Pro Fast', price: '$0.005/PIC', thumb: '/assets/showcase/album-heritage-casual.webp' },
      { name: 'Banana Character', price: '$0.012/PIC', thumb: '/assets/showcase/album-heritage-detail.webp' },
      { name: 'Banana Concept', price: '$0.008/PIC', thumb: '/assets/showcase/album-heritage-accessories.webp' },
    ],
  },
  {
    id: 'seedream5', name: 'Seedream 5.0', category: 'Image Generation',
    description: 'Mô hình tạo ảnh thế hệ mới từ ByteDance — chuyên biệt cho commercial và product photography.',
    hero: '/assets/homepage/gold-create-professionals.webp',
    slug: '/product/ai-image-generator',
    subs: [
      { name: 'Seedream 5.0 Pro', price: '$0.009/PIC', thumb: '/assets/showcase/album-cote-necklace.webp' },
      { name: 'Seedream 5.0 Fast', price: '$0.005/PIC', thumb: '/assets/showcase/album-cote-watch.webp' },
      { name: 'Seedream Commercial', price: '$0.012/PIC', thumb: '/assets/showcase/album-blanc-veil.webp' },
      { name: 'Seedream Portrait', price: '$0.007/PIC', thumb: '/assets/homepage/gold-tools-marketing.webp' },
    ],
  },
  {
    id: 'kling3', name: 'Kling 3.0', category: 'Video Generation',
    description: 'Engine video AI hàng đầu từ Kuaishou — lip sync, motion transfer, và cinematic quality vượt trội.',
    hero: '/assets/homepage/gold-build-video-gen.webp',
    slug: '/product/ai-video-generator',
    subs: [
      { name: 'Kling 3.0 Pro', price: '$0.045/SEC', thumb: '/assets/homepage/gold-tools-video.webp' },
      { name: 'Kling 3.0 Standard', price: '$0.025/SEC', thumb: '/assets/homepage/gold-tools-3d.webp' },
      { name: 'Kling Lip Sync', price: '$0.050/SEC', thumb: '/assets/homepage/gold-tools-script.webp' },
      { name: 'Kling Fast', price: '$0.015/SEC', thumb: '/assets/homepage/gold-tools-upscale.webp' },
    ],
  },
  {
    id: 'seedream45', name: 'Seedream 4.5', category: 'Image Generation',
    description: 'Phiên bản ổn định của Seedream — tối ưu tốc độ, phù hợp batch processing và production workflow.',
    hero: '/assets/homepage/gold-feature-latest-models.webp',
    slug: '/product/ai-image-generator',
    subs: [
      { name: 'Seedream 4.5 HD', price: '$0.006/PIC', thumb: '/assets/homepage/gold-feature-all-in-one.webp' },
      { name: 'Seedream 4.5 Fast', price: '$0.003/PIC', thumb: '/assets/homepage/gold-feature-lightning-fast.webp' },
      { name: 'Seedream 4.5 Batch', price: '$0.002/PIC', thumb: '/assets/homepage/gold-feature-pay-per-use.webp' },
      { name: 'Seedream 4.5 Edit', price: '$0.005/PIC', thumb: '/assets/homepage/uc-creator.webp' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════ */
interface Props {
  activeTab: number;
  setActiveTab: (i: number) => void;
  navigate: NavigateFunction;
}

const LatestModelsSection: React.FC<Props> = ({ activeTab, setActiveTab, navigate }) => {
  const model = MODELS[activeTab] ?? MODELS[0];

  const prevIdx = (activeTab - 1 + MODELS.length) % MODELS.length;
  const nextIdx = (activeTab + 1) % MODELS.length;
  const prevModel = MODELS[prevIdx];
  const nextModel = MODELS[nextIdx];

  const goNext = useCallback(() => setActiveTab(nextIdx), [nextIdx, setActiveTab]);
  const goPrev = useCallback(() => setActiveTab(prevIdx), [prevIdx, setActiveTab]);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: '#0c1117', marginTop: 80 }}>
      {/* ── Section Header ── */}
      <div className="text-center pt-24 md:pt-32 pb-8 px-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
          style={{ color: '#C9A84C' }}
        >
          Latest Models
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold"
          style={{ color: '#faf7f8' }}
        >
          Khám Phá Các Mô Hình AI Mới Nhất
        </motion.h2>
      </div>

      {/* ── Model Tabs (horizontal scroll) ── */}
      <div className="flex justify-center px-4 pb-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-2">
          {MODELS.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(i)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
              style={
                i === activeTab
                  ? { background: 'linear-gradient(135deg, #C9A84C, #E5C767)', color: '#0c1117' }
                  : { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(250,247,248,0.7)' }
              }
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Carousel: 3 columns (prev peek | hero | right panel) ── */}
      <div className="relative w-full px-4 md:px-10 lg:px-16" style={{ minHeight: 480 }}>
        {/* Nav arrows */}
        <button
          onClick={goPrev}
          className="absolute left-6 md:left-12 lg:left-[72px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-6 md:right-12 lg:right-[72px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
        >
          <ChevronRight size={20} />
        </button>

        {/* 3-col grid */}
        <div className="flex w-full items-stretch rounded-xl overflow-hidden" style={{ gap: 0, border: '1px solid rgba(201,168,76,0.12)' }}>
          {/* LEFT PEEK — previous model (hidden on mobile) */}
          <div
            className="hidden lg:block flex-shrink-0 cursor-pointer relative overflow-hidden"
            style={{ width: '12%', opacity: 0.5 }}
            onClick={goPrev}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={prevModel.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <img
                  src={prevModel.hero}
                  alt={prevModel.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(12,17,23,0.8), transparent)' }} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTER — Hero with overlay */}
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: 480 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={model.id}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img
                  src={model.hero}
                  alt={model.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(12,17,23,0.95) 0%, rgba(12,17,23,0.6) 40%, rgba(12,17,23,0.2) 100%)',
                  }}
                />
                {/* Text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3"
                    style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
                  >
                    {model.category}
                  </motion.span>
                  <motion.h3
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3"
                    style={{ color: '#faf7f8' }}
                  >
                    {model.name}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm md:text-base max-w-lg mb-5 leading-relaxed"
                    style={{ color: 'rgba(250,247,248,0.7)' }}
                  >
                    {model.description}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => navigate(model.slug)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #E5C767)', color: '#0c1117' }}
                  >
                    Khám phá
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL — sub-models grid */}
          <div
            className="hidden md:flex flex-col flex-shrink-0 p-5 lg:p-6"
            style={{ width: '340px', background: 'rgba(12,17,23,0.95)', borderLeft: '1px solid rgba(201,168,76,0.12)' }}
          >
            <h4
              className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: '#C9A84C' }}
            >
              Phân loại Mô hình
            </h4>
            <AnimatePresence mode="wait">
              <motion.div
                key={model.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 gap-3 flex-1"
              >
                {model.subs.map((sub, i) => (
                  <motion.div
                    key={sub.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="group cursor-pointer rounded-lg overflow-hidden relative"
                    style={{ border: '1px solid rgba(201,168,76,0.12)' }}
                    onClick={() => navigate(model.slug)}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={sub.thumb}
                        alt={sub.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2.5" style={{ background: 'rgba(12,17,23,0.9)' }}>
                      <p className="text-[11px] font-semibold truncate" style={{ color: 'rgba(250,247,248,0.85)' }}>
                        {sub.name}
                      </p>
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: '#C9A84C' }}>
                        {sub.price}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT PEEK — next model (hidden on mobile) */}
          <div
            className="hidden lg:block flex-shrink-0 cursor-pointer relative overflow-hidden"
            style={{ width: '12%', opacity: 0.5 }}
            onClick={goNext}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={nextModel.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <img
                  src={nextModel.hero}
                  alt={nextModel.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, rgba(12,17,23,0.8), transparent)' }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-2 pt-6 pb-16">
        {MODELS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setActiveTab(i)}
            className="rounded-full transition-all"
            style={
              i === activeTab
                ? { width: 24, height: 6, background: '#C9A84C' }
                : { width: 6, height: 6, background: 'rgba(201,168,76,0.3)' }
            }
          />
        ))}
      </div>

      {/* Gradient bridge to next section */}
      <div className="w-full h-20" style={{ background: 'linear-gradient(to bottom, #0c1117, #0d0b08)' }} />

      {/* Hide scrollbar utility */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default LatestModelsSection;
