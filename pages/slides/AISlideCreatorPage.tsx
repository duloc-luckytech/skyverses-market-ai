
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AISlideCreatorWorkspace from '../../components/AISlideCreatorWorkspace';
import { usePageMeta } from '../../hooks/usePageMeta';
import {
  HeroSection,
  LiveStatsBar,
  WorkflowSection,
  FeaturesSection,
  ShowcaseSection,
  UseCasesSection,
  FAQSection,
  FinalCTA,
} from '../../components/landing/ai-slide-creator';

const AISlideCreatorPage: React.FC = () => {
  usePageMeta({
    title: 'Tạo Slide AI — Trình Chiếu Chuyên Nghiệp Tự Động | Skyverses',
    description: 'Tạo bản trình chiếu AI hoàn chỉnh trong 2 phút. Mỗi slide có ảnh nền AI riêng, live editor chỉnh trực tiếp, xuất PPTX/PDF/PNG. Miễn phí thử ngay.',
    keywords: 'tạo slide AI, trình chiếu AI, AI presentation, powerpoint tự động, canva alternative AI, pitch deck AI, Skyverses slide AI',
    canonical: '/product/ai-slide-creator',
  });

  const [studioMode, setStudioMode] = useState(false);

  const handleStartStudio = () => setStudioMode(true);

  return (
    <>
      {/* ── Studio workspace (fullscreen overlay) ────────────────── */}
      <AnimatePresence mode="wait">
        {studioMode && (
          <AISlideCreatorWorkspace onClose={() => setStudioMode(false)} />
        )}
      </AnimatePresence>

      {/* ── Landing page ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!studioMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300"
          >
            {/* 1. Hero — big headline + slide preview mockup */}
            <HeroSection onStartStudio={handleStartStudio} />

            {/* 2. Live stats bar */}
            <LiveStatsBar />

            {/* 3. Workflow — 4-step timeline */}
            <WorkflowSection />

            {/* 4. Features — 6-card 3×2 grid */}
            <FeaturesSection />

            {/* 5. Showcase — 6 CSS-gradient slide previews */}
            <ShowcaseSection />

            {/* 6. Use cases — 6 industry cards with sub-lists */}
            <UseCasesSection />

            {/* 7. FAQ — animated accordion */}
            <FAQSection />

            {/* 8. Final CTA */}
            <FinalCTA onStartStudio={handleStartStudio} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AISlideCreatorPage;
