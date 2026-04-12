import React, { useState } from 'react';
import { Network } from 'lucide-react';
import { HeroSection } from '../../components/landing/paperclip-ai-agents/HeroSection';
import { LiveStatsBar } from '../../components/landing/paperclip-ai-agents/LiveStatsBar';
import { WorkflowSection } from '../../components/landing/paperclip-ai-agents/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/paperclip-ai-agents/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/paperclip-ai-agents/FeaturesSection';
import { UseCasesSection } from '../../components/landing/paperclip-ai-agents/UseCasesSection';
import { FAQSection } from '../../components/landing/paperclip-ai-agents/FAQSection';
import { FinalCTA } from '../../components/landing/paperclip-ai-agents/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';
import PaperclipAIAgentsWorkspace from '../../components/PaperclipAIAgentsWorkspace';

const PaperclipAIAgents: React.FC = () => {
  usePageMeta({
    title: 'Paperclip — AI Org Orchestrator | Chạy Công Ty Bằng AI Agents | Skyverses',
    description: 'Paperclip là nền tảng orchestrate multi-agent AI cho doanh nghiệp. CEO Agent phân công cho Marketing AI, DevOps AI, Sales AI. Budget Guard, Governance Layer, Open Source, Self-hosted.',
    keywords: 'paperclip ai agents, multi agent orchestration, ai org chart, budget guard, ai automation, open source ai, self hosted ai, CEO agent',
    canonical: '/product/paperclip-ai-agents',
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
      <PaperclipAIAgentsWorkspace onClose={() => setIsStudioOpen(false)} />
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      {/* ── HERO ── */}
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── LIVE STATS BAR ── */}
      <LiveStatsBar />

      {/* ── WORKFLOW + SHOWCASE + FEATURES + USE CASES ── */}
      <WorkflowSection />
      <ShowcaseSection />
      <FeaturesSection />
      <UseCasesSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── FINAL CTA ── */}
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── STICKY MOBILE CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#0a0a0c] via-white/95 dark:via-[#0a0a0c]/95 to-transparent">
        <button
          onClick={() => setIsStudioOpen(true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <Network size={14} /> Thử Paperclip — Miễn Phí
        </button>
      </div>
    </div>
  );
};

export default PaperclipAIAgents;
