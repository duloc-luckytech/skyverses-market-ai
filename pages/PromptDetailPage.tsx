import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, ChevronRight, ShoppingCart, Lock, LogIn,
  User, Tag, CalendarDays, Hash, Download, Sparkles,
  FileText, EyeOff, ArrowLeft, Check, Share2,
  Copy, ExternalLink, Flag, Star, Heart, Eye, Cpu,
  BadgeCheck, TrendingUp, ImageIcon, Video, PlayCircle,
  BookOpen, Wand2, ListChecks, ShieldCheck, Workflow,
  Home, Volume2, Settings, Maximize2, Bookmark, Folder,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { promptMarketApi } from '../apis/prompt-market';
import { skytokenApi } from '../apis/skytoken';
import type { PromptSet } from '../types';
import PromptPurchaseModal from '../components/prompt-market/PromptPurchaseModal';
import PromptSetCard from '../components/prompt-market/PromptSetCard';
import PromptReviewSection from '../components/prompt-market/PromptReviewSection';
import WorkflowPreviewModal, { buildPromptWorkflowPreview } from '../components/prompt-market/WorkflowPreviewModal';

const MODEL_LABELS: Partial<Record<string, string>> = {
  'gpt-4': 'GPT-4',
  'gpt-4o': 'GPT-4o',
  'gpt-5': 'GPT-5',
  'claude-3': 'Claude 3',
  'claude-4': 'Claude 4',
  'gemini': 'Gemini',
  'gemini-2': 'Gemini 2',
  'midjourney': 'MJ',
  'dall-e-3': 'DALL·E',
  'stable-diffusion': 'SD',
  'flux': 'Flux',
  'Nano Banana Pro': 'Nano Banana Pro',
  'Nano Banana 2': 'Nano Banana 2',
  'GPT Image': 'GPT Image',
  'Imagen 4': 'Imagen 4',
  'Midjourney V7': 'Midjourney V7',
  'Niji V7': 'Niji V7',
  'FLUX.1 Kontext': 'FLUX.1 Kontext',
  'Seedream 4.0': 'Seedream 4.0',
  'Stable Diffusion 3.5': 'SD 3.5',
  'Ideogram 3.0': 'Ideogram 3.0',
  'Runway Gen-4.5': 'Runway Gen-4.5',
  'Runway Gen-4': 'Runway Gen-4',
  'Veo 3.1': 'Veo 3.1',
  'Kling 3.0': 'Kling 3.0',
  'Kling 3.0 Omni': 'Kling 3.0 Omni',
  'Seedance 2.0': 'Seedance 2.0',
  'Wan 2.2': 'Wan 2.2',
  'llama': 'Llama',
  'mistral': 'Mistral',
};

/* ─── helpers ─── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const getSellerName = (s: PromptSet['sellerId']): string =>
  typeof s === 'string' ? s : (s?.name ?? 'Unknown');

const getSellerAvatar = (s: PromptSet['sellerId']): string | undefined =>
  typeof s === 'string' ? undefined : s?.avatar;

type ShowcaseMediaItem = {
  key: string;
  type: 'image' | 'video';
  url: string;
  poster?: string;
  title: string;
  input: string;
  style?: string;
  output: string;
};

/* ─── sub-components ─── */
const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({
  icon, label, value,
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-[rgba(201,168,76,0.1)] last:border-0">
    <span className="flex items-center gap-2 text-sm text-white/40">
      <span className="text-[#C9A84C]">{icon}</span>
      {label}
    </span>
    <span className="text-sm text-white font-medium">{value}</span>
  </div>
);

const PromptUsageGuide: React.FC<{
  promptSet: PromptSet;
  canViewFullPrompt: boolean;
  onPurchase: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
}> = ({ promptSet, canViewFullPrompt, onPurchase, onLogin, isAuthenticated }) => {
  const modelLabels = (promptSet.models ?? []).slice(0, 5).map((m) => MODEL_LABELS[m] ?? m);
  const { lang } = useLanguage();
  const vi = lang === 'vi';
  const steps = canViewFullPrompt
    ? [
        {
          icon: <ListChecks className="w-4 h-4" />,
          title: vi ? 'Chọn đúng prompt cần dùng' : 'Choose a prompt module',
          body: vi
            ? 'Muốn tạo ảnh board, poster hay video thì bắt đầu bằng prompt module tương ứng.'
            : 'Start with the board, poster, or video prompt that matches the output you want.',
        },
        {
          icon: <Wand2 className="w-4 h-4" />,
          title: vi ? 'Thay thông tin dự án của bạn' : 'Replace the variables',
          body: vi
            ? 'Đổi brief, chủ thể, khách hàng mục tiêu, phong cách và format đầu ra theo dự án thật.'
            : 'Swap the project brief, hero subject, audience, style, and output format with your real campaign details.',
        },
        {
          icon: <Cpu className="w-4 h-4" />,
          title: vi ? 'Chạy bằng model được gợi ý' : 'Run on a recommended model',
          body: modelLabels.length
            ? `${vi ? 'Nên bắt đầu với' : 'Best starting models'}: ${modelLabels.join(', ')}.`
            : (vi ? 'Dùng danh sách model tương thích làm điểm bắt đầu.' : 'Use the compatible model list as your starting point.'),
        },
        {
          icon: <ImageIcon className="w-4 h-4" />,
          title: vi ? 'So sánh với media mẫu' : 'Compare with the showcase',
          body: vi
            ? 'Dùng ảnh/video mẫu làm chuẩn chất lượng, rồi chỉnh từng biến một để ra đúng ý.'
            : 'Use the example media as a quality target, then iterate one variable at a time.',
        },
      ]
    : [
        {
          icon: <ShieldCheck className="w-4 h-4" />,
          title: vi ? 'Bạn đang xem bản preview' : 'Preview is protected',
          body: vi
            ? 'Bạn xem được media mẫu, model, tag và kết quả mong đợi. Công thức prompt chi tiết đang được khóa.'
            : 'Media, models, tags, and outcome summaries are visible, but the reusable prompt blueprint is locked.',
        },
        {
          icon: <BookOpen className="w-4 h-4" />,
          title: vi ? 'Sau khi mua sẽ có gì' : 'After purchase',
          body: vi
            ? 'Bạn mở khóa prompt module đầy đủ, biến cần thay, nút copy và ghi chú cách dùng trong My Purchases.'
            : 'You unlock the full prompt modules, variables, copy buttons, and usage notes in My Purchases.',
        },
        {
          icon: <Cpu className="w-4 h-4" />,
          title: vi ? 'Model phù hợp' : 'Model fit',
          body: modelLabels.length
            ? `${vi ? 'Thiết kế cho' : 'Designed for'} ${modelLabels.join(', ')}.`
            : (vi ? 'Thiết kế cho các model tạo ảnh và video hiện đại.' : 'Designed for modern image and video generation models.'),
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.22 }}
      className="rounded-2xl border border-[rgba(201,168,76,0.12)] bg-white/[0.025] p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]/70">
            {canViewFullPrompt
              ? (vi ? 'Cách dùng bộ prompt' : 'How to use this prompt pack')
              : (vi ? 'Bộ prompt này hoạt động thế nào' : 'How this pack works')}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {canViewFullPrompt
              ? (vi ? 'Dùng như một blueprint sản xuất nội dung' : 'Use it like a production blueprint')
              : (vi ? 'Xem được giá trị nhưng không lộ công thức prompt' : 'Preview the value without exposing the blueprint')}
          </h3>
        </div>
        {!canViewFullPrompt && (
          <button
            onClick={isAuthenticated ? onPurchase : onLogin}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(201,168,76,0.3)] px-4 py-2 text-sm font-semibold text-[#C9A84C] hover:bg-[#C9A84C]/10 transition"
          >
            <Lock className="w-4 h-4" />
            {isAuthenticated ? (vi ? 'Mở khóa hướng dẫn' : 'Unlock full guide') : (vi ? 'Đăng nhập để mở khóa' : 'Login to unlock')}
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-xl border border-[rgba(201,168,76,0.12)] bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[#C9A84C]">
              {step.icon}
              <span className="text-[11px] font-bold uppercase tracking-widest">{vi ? 'Bước' : 'Step'} {index + 1}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{step.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/40">{step.body}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const PromptShowcaseStage: React.FC<{
  promptSet: PromptSet;
  title: string;
  description: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  canViewFullPrompt: boolean;
  onOpenWorkflow: () => void;
  language: string;
}> = ({ promptSet, title, description, activeIndex, onSelect, canViewFullPrompt, onOpenWorkflow, language }) => {
  const vi = language === 'vi';
  const copy = {
    outputs: vi ? 'Kết quả mẫu' : 'Sample outputs',
    showcase: vi ? 'Bộ prompt này tạo được gì' : 'What this prompt creates',
    workflowCta: vi ? 'Xem cách dùng prompt' : 'See how to use it',
    workflowSub: vi ? 'Các bước tạo ảnh/video' : 'Image/video steps',
    mainOutput: vi ? 'Kết quả demo chính' : 'Main demo output',
    mobileWorkflow: vi ? 'Cách dùng' : 'How to use',
    inputBrief: vi ? 'Thông tin cần chuẩn bị' : 'Input to prepare',
    inputLocked: vi ? 'Chi tiết đang khóa' : 'Details locked',
    safePreview: vi ? 'Xem trước an toàn' : 'Safe preview',
    safePreviewBody: vi
      ? 'Bạn vẫn xem được kết quả mẫu, model phù hợp và nội dung nhận được. Công thức prompt chi tiết sẽ mở sau khi mua.'
      : 'You can still review sample outputs, compatible models, and what is included. The exact prompt recipe unlocks after purchase.',
    protected: vi ? 'Công thức prompt được bảo vệ' : 'Prompt recipe protected',
    styleModels: vi ? 'Model & phong cách phù hợp' : 'Best models and style',
    promptInputs: vi ? 'Thông tin cần thay trong prompt' : 'Prompt fields to replace',
    outputResult: vi ? 'Kết quả mong đợi' : 'Expected result',
    includedAfterPurchase: vi ? 'Bạn sẽ nhận được sau khi mua' : 'Included after purchase',
    promptModules: vi ? 'Prompt trong bộ' : 'Prompt modules',
    imageOutputs: vi ? 'Hình ảnh mẫu' : 'Image outputs',
    videoDemos: vi ? 'Video mẫu' : 'Video demos',
  };
  const examples = promptSet.examples ?? [];
  const seenMedia = new Set<string>();
  const rawMediaItems: Array<ShowcaseMediaItem | null> = [
    promptSet.coverImage
      ? {
          key: `${promptSet._id}-cover`,
          type: 'image' as const,
          url: promptSet.coverImage,
          title: 'Cover board',
          input: title,
          output: description,
        }
      : null,
    ...examples.flatMap((ex, index) => {
      const itemTitle = ex.promptTitle || (vi ? `Kết quả ${index + 1}` : `Output ${index + 1}`);
      return [
        ex.image
          ? {
              key: `${promptSet._id}-image-${index}`,
              type: 'image' as const,
              url: ex.image,
              title: itemTitle,
              input: ex.input,
              style: ex.style,
              output: ex.output,
            }
          : null,
        ex.video
          ? {
              key: `${promptSet._id}-video-${index}`,
              type: 'video' as const,
              url: ex.video,
              poster: ex.image || promptSet.coverImage,
              title: `${itemTitle} · Video`,
              input: ex.input,
              style: ex.style,
              output: ex.output,
            }
          : null,
      ];
    }),
  ];
  const mediaItems = rawMediaItems.filter((item): item is ShowcaseMediaItem => {
    if (!item) return false;
    const mediaKey = `${item.type}:${item.url}`;
    if (seenMedia.has(mediaKey)) return false;
    seenMedia.add(mediaKey);
    return true;
  });
  const fallbackMedia: ShowcaseMediaItem = {
    key: `${promptSet._id}-fallback`,
    type: 'image',
    url: promptSet.coverImage || '',
    title,
    input: title,
    output: description,
  };
  const primaryVideo = mediaItems.find(item => item.type === 'video');
  const stageMedia = primaryVideo
    ? [primaryVideo, ...mediaItems.filter(item => item.key !== primaryVideo.key)]
    : (mediaItems.length ? mediaItems : [fallbackMedia]);
  const activeMedia = stageMedia[activeIndex] ?? stageMedia[0];
  const activePromptIndex = Math.min(activeIndex, Math.max(promptSet.prompts.length - 1, 0));
  const featuredPrompt = promptSet.prompts[activePromptIndex] ?? promptSet.prompts[0];
  const variables = featuredPrompt?.variables ?? [];
  const fallbackStyleChips = [
    ...(promptSet.models ?? []).slice(0, 4).map((m) => MODEL_LABELS[m] ?? m),
    ...promptSet.tags.slice(0, 4),
  ];
  const styleChips = (activeMedia.style ? activeMedia.style.split(' · ') : fallbackStyleChips)
    .map((chip) => chip.trim())
    .filter(Boolean)
    .slice(0, 8);
  const imageCount = stageMedia.filter(item => item.type === 'image' && item.url).length;
  const videoCount = stageMedia.filter(item => item.type === 'video').length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[28px] border border-[#d8c9a4] bg-[#f3ead8] text-[#2a241d] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_340px] xl:h-[720px]">
        <aside className="order-2 xl:order-1 border-t xl:border-t-0 xl:border-r border-[#d8c9a4] bg-[#f7f0e1] p-4 xl:h-full xl:overflow-y-auto">
          <div className="mb-4 hidden xl:flex items-center justify-between border-b border-dashed border-[#d8c9a4] pb-3">
            <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">{copy.outputs}</p>
            <div className="flex items-center gap-2 text-[11px] text-[#806b4a]">
              <span className="inline-flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />{imageCount}</span>
              <span className="inline-flex items-center gap-1"><Video className="w-3.5 h-3.5" />{videoCount}</span>
            </div>
          </div>
          <div className="flex xl:block gap-3 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0 space-y-0 xl:space-y-3">
            {stageMedia.map((item, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(index)}
                  className={`min-w-[150px] xl:min-w-0 w-full text-left overflow-hidden rounded-[18px] border transition shadow-sm ${
                    active
                      ? 'border-[#88b6cf] bg-[#dcecf1]'
                      : 'border-[#e0d3b7] bg-[#fff9ec] hover:border-[#c8b68f]'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-[#eadfc9] overflow-hidden">
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} poster={item.poster} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <PlayCircle className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      </>
                    ) : item.url ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-[#806b4a]/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#6b8fa4]">
                      {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      {item.type} {index + 1}
                    </div>
                    <p className="mt-1.5 font-serif text-sm leading-snug text-[#2a241d] line-clamp-2">
                      {item.title || title}
                    </p>
                    <p className="mt-1 text-[11px] text-[#7a6a55] line-clamp-1">
                      {canViewFullPrompt ? item.input : copy.inputLocked}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="order-1 xl:order-2 min-h-[420px] xl:min-h-0 xl:h-full bg-[#f4ead4] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_20%,rgba(255,255,255,0.75),transparent_32%),linear-gradient(135deg,rgba(244,234,212,0.92),rgba(224,211,181,0.86))]" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-start justify-between gap-4 p-6 lg:p-7">
              <div>
                <p className="font-serif italic text-sm uppercase tracking-[0.24em] text-[#806b4a]">{copy.showcase}</p>
                <h2 className="mt-2 text-3xl lg:text-5xl font-serif text-black leading-none max-w-3xl">
                  {title}
                </h2>
                {description && (
                  <p className="mt-3 max-w-xl text-sm lg:text-base text-black/60 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              <div className="hidden sm:flex shrink-0 flex-col items-end gap-2">
                <button
                  onClick={onOpenWorkflow}
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(139,111,44,0.45)] bg-[#121014] px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-[#f5d77a] shadow-[0_16px_38px_rgba(42,28,8,0.28)] transition hover:-translate-y-0.5 hover:border-[#C9A84C] hover:text-white hover:shadow-[0_20px_55px_rgba(154,116,36,0.34)]"
                >
                  <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-0 transition group-hover:opacity-100" />
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#C9A84C] text-black shadow-[0_0_24px_rgba(201,168,76,0.45)]">
                    <Workflow className="w-4 h-4" />
                  </span>
                  <span className="relative leading-none">
                    {copy.workflowCta}
                    <span className="mt-1 block text-[9px] font-bold tracking-[0.12em] text-white/40">
                      {copy.workflowSub}
                    </span>
                  </span>
                </button>
                {promptSet.featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.06] border border-black/[0.08] text-[11px] font-bold uppercase tracking-wider text-black/60">
                    <TrendingUp className="w-3.5 h-3.5 text-[#9a7424]" />
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 px-5 lg:px-7 pb-6 lg:pb-7 flex items-center justify-center">
              <div className="relative w-full max-w-4xl">
                <div className="rounded-[22px] border border-[#d1bea0] bg-[#fff7e8] shadow-[0_28px_70px_rgba(70,48,20,0.20)] overflow-hidden">
                  {activeMedia.type === 'video' ? (
                    <video
                      src={activeMedia.url}
                      poster={activeMedia.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      preload="metadata"
                      className="w-full aspect-video object-cover bg-black"
                    />
                  ) : activeMedia.url ? (
                    <img
                      src={activeMedia.url}
                      alt={activeMedia.input || title}
                      className="w-full aspect-video object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-black/[0.08]">
                      <Sparkles className="w-16 h-16 text-black/20" />
                    </div>
                  )}
                </div>
                <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-[#fff9ec]/90 backdrop-blur-md border border-[#d1bea0] px-3 py-2 text-xs text-[#5b4a35] shadow-sm">
                  {activeMedia.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  {copy.mainOutput}
                </div>
                <button
                  onClick={onOpenWorkflow}
                  className="absolute right-4 bottom-4 inline-flex sm:hidden items-center gap-2 rounded-full border border-[rgba(201,168,76,0.45)] bg-[#111015]/95 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#f5d77a] shadow-[0_0_28px_rgba(201,168,76,0.25)] backdrop-blur-md"
                >
                  <Workflow className="w-3.5 h-3.5" />
                  {copy.mobileWorkflow}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="order-3 border-t xl:border-t-0 xl:border-l border-[#d8c9a4] bg-[#f7f0e1] p-5 lg:p-6 space-y-5 xl:h-full xl:overflow-y-auto">
          {canViewFullPrompt ? (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">{copy.inputBrief}</p>
              <p className="mt-3 text-sm text-[#4b4035] leading-relaxed">
                {activeMedia.input || promptSet.previewText || title}
              </p>
            </div>
          ) : (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">{copy.safePreview}</p>
              <p className="mt-3 text-sm text-[#4b4035] leading-relaxed">
                {copy.safePreviewBody}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#d8c9a4] bg-[#fbf1dc] px-3 py-2 text-xs font-medium text-[#806b4a]">
                <Lock className="w-3.5 h-3.5" />
                {copy.protected}
              </div>
            </div>
          )}

          {styleChips.length > 0 && (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">{copy.styleModels}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {styleChips.map((chip) => (
                  <span key={chip} className="px-2.5 py-1 rounded-full border border-[#d1bea0] bg-[#f2e5c9] text-xs text-[#5b4a35]">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          )}

          {canViewFullPrompt && variables.length > 0 && (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">{copy.promptInputs}</p>
              <div className="mt-3 space-y-2.5">
                {variables.slice(0, 6).map((v) => (
                  <div key={v.name} className="rounded-xl border border-dashed border-[#d8c9a4] bg-[#fbf1dc] p-3">
                    <div className="font-mono text-[11px] text-[#8b6f2c]">{`{{${v.name}}}`}</div>
                    <div className="mt-1 text-xs text-[#7a6a55] line-clamp-2">{v.defaultValue || v.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canViewFullPrompt ? (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">{copy.outputResult}</p>
              <p className="mt-3 text-sm text-[#4b4035] leading-relaxed">
                {activeMedia.output || featuredPrompt?.description || description}
              </p>
            </div>
          ) : (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">{copy.includedAfterPurchase}</p>
              <div className="mt-3 space-y-2 text-sm text-[#4b4035]">
                <div className="flex items-center justify-between gap-3">
                  <span>{copy.promptModules}</span>
                  <span className="font-semibold">{promptSet.prompts.length}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{copy.imageOutputs}</span>
                  <span className="font-semibold">{imageCount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{copy.videoDemos}</span>
                  <span className="font-semibold">{videoCount}</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </motion.section>
  );
};

const buildShowcaseMediaItems = (
  promptSet: PromptSet,
  title: string,
  description: string,
  language: string
): ShowcaseMediaItem[] => {
  const vi = language === 'vi';
  const examples = promptSet.examples ?? [];
  const seen = new Set<string>();
  const rawItems: Array<ShowcaseMediaItem | null> = [
    promptSet.coverImage
      ? {
          key: `${promptSet._id}-cover`,
          type: 'image',
          url: promptSet.coverImage,
          title: vi ? 'Ảnh bìa bộ prompt' : 'Prompt cover',
          input: title,
          output: description,
        }
      : null,
    ...examples.flatMap((ex, index) => {
      const itemTitle = ex.promptTitle || (vi ? `Ví dụ ${index + 1}` : `Example ${index + 1}`);
      return [
        ex.video
          ? {
              key: `${promptSet._id}-video-${index}`,
              type: 'video' as const,
              url: ex.video,
              poster: ex.image || promptSet.coverImage,
              title: `${itemTitle} · Video`,
              input: ex.input,
              style: ex.style,
              output: ex.output,
            }
          : null,
        ex.image
          ? {
              key: `${promptSet._id}-image-${index}`,
              type: 'image' as const,
              url: ex.image,
              title: itemTitle,
              input: ex.input,
              style: ex.style,
              output: ex.output,
            }
          : null,
      ];
    }),
  ];

  const media = rawItems.filter((item): item is ShowcaseMediaItem => {
    if (!item) return false;
    const key = `${item.type}:${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (media.length > 0) return media;

  return [{
    key: `${promptSet._id}-fallback`,
    type: 'image',
    url: promptSet.coverImage || '',
    title,
    input: title,
    output: description,
  }];
};

const PromptDetailHero: React.FC<{
  promptSet: PromptSet;
  title: string;
  description: string;
  seller: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  onOpenWorkflow: () => void;
  language: string;
}> = ({ promptSet, title, description, seller, activeIndex, onSelect, onOpenWorkflow, language }) => {
  const vi = language === 'vi';
  const mediaItems = buildShowcaseMediaItems(promptSet, title, description, language);
  const primaryVideo = mediaItems.find(item => item.type === 'video');
  const stageMedia = primaryVideo
    ? [primaryVideo, ...mediaItems.filter(item => item.key !== primaryVideo.key)]
    : mediaItems;
  const activeMedia = stageMedia[activeIndex] ?? stageMedia[0];
  const imageCount = stageMedia.filter(item => item.type === 'image' && item.url).length;
  const videoCount = stageMedia.filter(item => item.type === 'video').length;
  const promptCount = promptSet.promptCount ?? promptSet.prompts.length;
  const modelChips = (promptSet.models ?? []).slice(0, 4).map(model => MODEL_LABELS[model] ?? model);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border border-[rgba(201,168,76,0.2)] bg-[#08090c] shadow-[0_28px_90px_rgba(0,0,0,0.38)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(201,168,76,0.08),transparent_34%,rgba(201,168,76,0.06)),radial-gradient(circle_at_78%_16%,rgba(201,168,76,0.12),transparent_30%)]" />
      <div className="relative grid min-h-[760px] grid-cols-1 xl:grid-cols-[150px_minmax(0,1fr)]">
        <aside className="order-2 border-t border-[rgba(201,168,76,0.15)] bg-black/32 p-3 xl:order-1 xl:border-r xl:border-t-0">
          <div className="mb-3 hidden items-center justify-between xl:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C9A84C]/70">
              {vi ? 'Media set' : 'Media set'}
            </span>
            <span className="inline-flex items-center gap-2 text-[10px] text-white/45">
              <ImageIcon className="h-3 w-3 text-[#C9A84C]" />{imageCount}
              <Video className="h-3 w-3 text-[#C9A84C]" />{videoCount}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto xl:block xl:max-h-[710px] xl:space-y-2 xl:overflow-y-auto xl:overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none]">
            {stageMedia.map((item, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(index)}
                  className={`group min-w-[132px] overflow-hidden border text-left transition xl:min-w-0 xl:w-full ${
                    active
                      ? 'border-[rgba(201,168,76,0.7)] bg-[#C9A84C]/[0.12] shadow-[0_0_24px_rgba(201,168,76,0.14)]'
                      : 'border-[rgba(201,168,76,0.16)] bg-white/[0.03] hover:border-[rgba(201,168,76,0.35)]'
                  }`}
                >
                  <div className="relative aspect-[5/4] bg-black">
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} poster={item.poster} className="h-full w-full object-cover opacity-85 transition group-hover:scale-105" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 grid place-items-center bg-black/20">
                          <PlayCircle className="h-6 w-6 text-white drop-shadow" />
                        </div>
                      </>
                    ) : item.url ? (
                      <img src={item.url} alt="" className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[#C9A84C]/10">
                        <ImageIcon className="h-6 w-6 text-[#C9A84C]/[0.45]" />
                      </div>
                    )}
                    <span className="absolute left-2 top-2 bg-black/70 px-1.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/70">
                      {item.type === 'video' ? 'Video' : 'Image'} {index + 1}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white/72">{item.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="order-1 min-h-[620px] xl:order-2">
          <div className="relative h-full min-h-[620px] overflow-hidden bg-black">
            {activeMedia.type === 'video' ? (
              <video
                src={activeMedia.url}
                poster={activeMedia.poster}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : activeMedia.url ? (
              <img src={activeMedia.url} alt={title} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[#101216]">
                <Sparkles className="h-16 w-16 text-[#C9A84C]/18" />
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,8,0.96)_0%,rgba(5,6,8,0.74)_33%,rgba(5,6,8,0.25)_68%,rgba(5,6,8,0.80)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#08090c] via-[#08090c]/64 to-transparent" />

            <div className="relative z-10 flex h-full min-h-[620px] flex-col justify-between p-5 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  to="/prompt-market"
                  className="inline-flex items-center gap-2 border border-[rgba(201,168,76,0.16)] bg-black/45 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45 backdrop-blur transition hover:border-[rgba(201,168,76,0.3)] hover:text-[#C9A84C]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Prompt Market
                </Link>
                <div className="flex items-center gap-2">
                  {promptSet.featured && (
                    <span className="inline-flex items-center gap-1.5 border border-[rgba(201,168,76,0.28)] bg-[#C9A84C]/[0.12] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A84C]">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Featured
                    </span>
                  )}
                  <span className="border border-[rgba(201,168,76,0.16)] bg-black/45 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45 backdrop-blur">
                    {promptSet.category}
                  </span>
                </div>
              </div>

              <div className="max-w-3xl">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-[#C9A84C]">
                  {vi ? 'Prompt showcase' : 'Prompt showcase'}
                </p>
                <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
                    {description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3 text-[12px] text-white/52">
                  <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-[#C9A84C]" />{seller}</span>
                  <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-[#C9A84C]" />{promptCount} prompts</span>
                  <span className="inline-flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5 text-[#C9A84C]" />{imageCount} images</span>
                  <span className="inline-flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-[#C9A84C]" />{videoCount} videos</span>
                  {promptSet.reviewCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[#f3c75e]">
                      <Star className="h-3.5 w-3.5 fill-current" />{promptSet.averageRating.toFixed(1)} ({promptSet.reviewCount})
                    </span>
                  )}
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={onOpenWorkflow}
                    className="group inline-flex items-center justify-center gap-3 border border-[rgba(201,168,76,0.55)] bg-[#C9A84C] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_0_36px_rgba(201,168,76,0.32)] transition hover:-translate-y-0.5 hover:bg-[#e0bf5c] hover:shadow-[0_0_54px_rgba(201,168,76,0.42)]"
                  >
                    <Workflow className="h-5 w-5" />
                    {vi ? 'Xem Workflow Nodes' : 'View Workflow Nodes'}
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </button>
                  <a
                    href="#prompt-buy"
                    className="inline-flex items-center justify-center gap-2 border border-[rgba(201,168,76,0.24)] bg-white/[0.04] px-6 py-4 text-sm font-bold text-white/82 transition hover:border-[rgba(201,168,76,0.35)] hover:text-[#C9A84C]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {promptSet.isFree ? (vi ? 'Lấy miễn phí' : 'Get free') : (vi ? 'Mua bộ prompt' : 'Buy prompt pack')}
                  </a>
                </div>

                {modelChips.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {modelChips.map(model => (
                      <span key={model} className="inline-flex items-center gap-1.5 border border-[rgba(201,168,76,0.16)] bg-black/45 px-3 py-1.5 text-[11px] text-white/58 backdrop-blur">
                        <Cpu className="h-3 w-3 text-[#C9A84C]" />
                        {model}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 border-t border-[rgba(201,168,76,0.16)] pt-4 md:grid-cols-3">
                <div className="border border-[rgba(201,168,76,0.16)] bg-black/42 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A84C]/70">{vi ? 'Đầu vào' : 'Input'}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/62">{activeMedia.input || title}</p>
                </div>
                <div className="border border-[rgba(201,168,76,0.16)] bg-black/42 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A84C]/70">{vi ? 'Phong cách' : 'Style'}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/62">{activeMedia.style || modelChips.join(', ') || (vi ? 'Theo model đề xuất' : 'Recommended model style')}</p>
                </div>
                <div className="border border-[rgba(201,168,76,0.16)] bg-black/42 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A84C]/70">{vi ? 'Đầu ra' : 'Output'}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/62">{activeMedia.output || description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const PromptValueCards: React.FC<{
  promptSet: PromptSet;
  canViewFullPrompt: boolean;
  language: string;
}> = ({ promptSet, canViewFullPrompt, language }) => {
  const vi = language === 'vi';
  const examples = promptSet.examples ?? [];
  const imageCount = examples.filter(ex => ex.image).length + (promptSet.coverImage ? 1 : 0);
  const videoCount = (promptSet.examples ?? []).filter(ex => ex.video).length;
  const previewImages = [
    promptSet.coverImage,
    ...examples.flatMap(ex => [ex.image, ex.video ? (ex.image || promptSet.coverImage) : undefined]),
  ].filter((url): url is string => Boolean(url)).slice(0, 4);
  const cards = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: vi ? 'Inputs hoàn chỉnh' : 'Complete inputs',
      body: vi ? 'Brief, moodboard, thông số kỹ thuật và danh sách assets.' : 'Brief, moodboard, technical specs, and asset list.',
      metric: `${promptSet.prompts.length} prompts`,
    },
    {
      icon: <Wand2 className="h-5 w-5" />,
      title: vi ? 'Style có định hướng' : 'Guided style',
      body: vi ? 'Hướng dẫn phong cách, ánh sáng, màu sắc và bố cục.' : 'Style guide for look, lighting, color, and layout.',
      metric: `${(promptSet.models ?? []).length || 1} models`,
    },
    {
      icon: <ImageIcon className="h-5 w-5" />,
      title: vi ? 'Output mẫu chất lượng cao' : 'High quality outputs',
      body: vi ? 'Ảnh & video demo nhiều góc máy, sẵn sàng thương mại.' : 'Image and video demos with multiple angles.',
      metric: `${imageCount} image · ${videoCount} video`,
    },
    {
      icon: <Workflow className="h-5 w-5" />,
      title: vi ? 'Workflow & Node setup' : 'Workflow & Node setup',
      body: canViewFullPrompt
        ? (vi ? 'Sơ đồ workflow chi tiết, dễ áp dụng trên mọi project.' : 'Detailed workflow map for every project.')
        : (vi ? 'Xem được sơ đồ, prompt chi tiết mở khóa sau khi mua.' : 'Workflow visible, raw prompts unlock after purchase.'),
      metric: canViewFullPrompt ? (vi ? 'Đã mở khóa' : 'Unlocked') : (vi ? 'Khóa nội dung' : 'Locked'),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
      className="rounded-xl border border-[rgba(201,168,76,0.18)] bg-[#090d12] p-4"
    >
      <h2 className="mb-3 text-sm font-black text-[#C9A84C]">
        {vi ? 'Bạn sẽ nhận được gì?' : 'What is included?'}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, cardIndex) => (
          <div key={card.title} className="rounded-lg border border-[rgba(201,168,76,0.18)] bg-[#0c1117] p-3 transition hover:border-[rgba(201,168,76,0.38)]">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[rgba(201,168,76,0.28)] bg-[#C9A84C]/10 text-[#C9A84C]">
                {card.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white/88">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/46">{card.body}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5">
              {previewImages.slice(0, 3).map((url, index) => (
                <div key={`${url}-${index}`} className="h-11 flex-1 overflow-hidden rounded-md border border-[rgba(201,168,76,0.16)] bg-black">
                  <img src={url} alt="" className="h-full w-full object-cover opacity-82" loading="lazy" />
                </div>
              ))}
              {cardIndex === 3 && (
                <div className="grid h-11 w-12 place-items-center rounded-md border border-[rgba(201,168,76,0.16)] bg-black/50 text-xs font-bold text-white/70">
                  +{Math.max(imageCount + videoCount, 1)}
                </div>
              )}
            </div>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/28">{card.metric}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

const PromptWorkflowStrip: React.FC<{
  promptSet: PromptSet;
  onOpenWorkflow: () => void;
  language: string;
}> = ({ promptSet, onOpenWorkflow, language }) => {
  const vi = language === 'vi';
  const firstImage = promptSet.coverImage || (promptSet.examples ?? []).find(ex => ex.image)?.image;
  const firstVideoPoster = (promptSet.examples ?? []).find(ex => ex.video)?.image || promptSet.coverImage;
  const nodes = [
    {
      icon: <FileText className="h-4 w-4" />,
      title: vi ? 'Brief dự án' : 'Project brief',
      body: vi ? 'Nhập mục tiêu, sản phẩm, audience.' : 'Add goal, product, and audience.',
    },
    {
      icon: <ImageIcon className="h-4 w-4" />,
      title: vi ? 'Board hình ảnh' : 'Image board',
      body: vi ? 'Tạo cover, concept, reference.' : 'Create cover, concept, references.',
      thumb: firstImage,
    },
    {
      icon: <Video className="h-4 w-4" />,
      title: vi ? 'Video demo' : 'Video demo',
      body: vi ? 'Chuyển output chính thành motion.' : 'Turn key output into motion.',
      thumb: firstVideoPoster,
    },
    {
      icon: <Workflow className="h-4 w-4" />,
      title: vi ? 'Ghép workflow' : 'Workflow nodes',
      body: vi ? 'Theo node để chạy đúng thứ tự.' : 'Follow nodes in the right order.',
    },
    {
      icon: <Download className="h-4 w-4" />,
      title: vi ? 'Gói cuối' : 'Final pack',
      body: vi ? 'Dùng ảnh/video/prompt đã mở khóa.' : 'Use unlocked media and prompts.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"
    >
      <div className="rounded-xl border border-[rgba(201,168,76,0.18)] bg-[#090d12] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/38">
            {vi ? 'Quy trình workflow' : 'Workflow process'}
          </p>
          <button onClick={onOpenWorkflow} className="text-xs font-bold text-[#C9A84C] hover:text-white">
            {vi ? 'Xem chi tiết' : 'View details'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {nodes.map((node, index) => (
            <div key={node.title} className="relative rounded-lg border border-[rgba(201,168,76,0.22)] bg-[#0c1117] p-3">
              {index < nodes.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden h-px w-6 bg-[#C9A84C]/[0.55] md:block">
                  <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#C9A84C]" />
                </div>
              )}
              {node.thumb ? (
                <div className="mb-2 aspect-video overflow-hidden rounded-md border border-[rgba(201,168,76,0.16)] bg-black">
                  <img src={node.thumb} alt="" className="h-full w-full object-cover opacity-75" loading="lazy" />
                </div>
              ) : (
                <div className="mb-2 grid aspect-video place-items-center rounded-md border border-[rgba(201,168,76,0.16)] bg-black/35">
                  <Folder className="h-7 w-7 text-[#C9A84C]/50" />
                </div>
              )}
              <div className="flex items-center gap-2 text-[#C9A84C]">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-[rgba(201,168,76,0.35)] bg-[#C9A84C]/10 text-[11px] font-black">
                  {index + 1}
                </span>
                <span className="text-xs font-semibold text-white/78">{node.title}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/42">{node.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(201,168,76,0.18)] bg-[#090d12] p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/38">
          {vi ? 'Cách dùng cho người mới' : 'Beginner guide'}
        </p>
        <ol className="mt-4 space-y-2.5">
          {[
            vi ? 'Đọc kỹ brief và mục tiêu của dự án.' : 'Read the brief and project goal.',
            vi ? 'Chuẩn bị assets, sản phẩm & thông tin thương hiệu.' : 'Prepare assets, product, and brand info.',
            vi ? 'Chạy workflow theo đúng thứ tự các node.' : 'Run workflow nodes in order.',
            vi ? 'Tùy chỉnh theo gợi ý trong style guide.' : 'Adjust using the style guide.',
            vi ? 'Xuất ảnh & video theo định dạng khuyến nghị.' : 'Export media in recommended formats.',
          ].map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-white/58">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#C9A84C] text-[11px] font-black text-black">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <button
          onClick={onOpenWorkflow}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[rgba(201,168,76,0.35)] bg-[#C9A84C]/10 px-4 py-2 text-xs font-bold text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {vi ? 'Xem hướng dẫn chi tiết' : 'Open detailed guide'}
        </button>
      </div>
    </motion.section>
  );
};

const PromptMockupStage: React.FC<{
  promptSet: PromptSet;
  title: string;
  description: string;
  seller: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  onOpenWorkflow: () => void;
  language: string;
}> = ({ promptSet, title, description, seller, activeIndex, onSelect, onOpenWorkflow, language }) => {
  const vi = language === 'vi';
  const mediaItems = buildShowcaseMediaItems(promptSet, title, description, language);
  const primaryVideo = mediaItems.find(item => item.type === 'video');
  const stageMedia = primaryVideo
    ? [primaryVideo, ...mediaItems.filter(item => item.key !== primaryVideo.key)]
    : mediaItems;
  const activeMedia = stageMedia[activeIndex] ?? stageMedia[0];
  const promptCount = promptSet.promptCount ?? promptSet.prompts.length;
  const mediaCount = stageMedia.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 gap-3 xl:grid-cols-[150px_minmax(0,1fr)]"
    >
      <aside className="rounded-xl border border-[rgba(201,168,76,0.2)] bg-[#090d12] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.28)] xl:h-[560px]">
        <div className="flex gap-2 overflow-x-auto xl:block xl:h-full xl:space-y-2 xl:overflow-y-auto xl:overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          {stageMedia.slice(0, 5).map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={item.key}
                onClick={() => onSelect(index)}
                  className={`group min-w-[132px] overflow-hidden rounded-lg border bg-[#06080b] text-left transition xl:min-w-0 xl:w-full ${
                  active
                    ? 'border-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.16)]'
                    : 'border-[rgba(201,168,76,0.16)] hover:border-[rgba(201,168,76,0.45)]'
                }`}
              >
                  <div className="relative aspect-[16/10] bg-black">
                  {item.type === 'video' ? (
                    <>
                      <video src={item.url} poster={item.poster} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-78 transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 grid place-items-center bg-black/25">
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(201,168,76,0.55)] bg-black/45">
                          <PlayCircle className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <span className="absolute right-1.5 top-1.5 bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white/72">1:24</span>
                    </>
                  ) : item.url ? (
                    <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover opacity-82 transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[#C9A84C]/10">
                      <ImageIcon className="h-5 w-5 text-[#C9A84C]/[0.45]" />
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <p className="truncate text-[11px] font-semibold text-white/76">
                    {index === 0 ? 'Cover' : item.type === 'video' ? 'Video demo' : `Output ${index}`}
                  </p>
                </div>
              </button>
            );
          })}
          {stageMedia.length > 5 && (
            <div className="grid min-w-[132px] place-items-center border border-[rgba(201,168,76,0.16)] bg-white/[0.03] px-3 py-4 text-xs font-bold text-white/45 xl:min-w-0">
              +{stageMedia.length - 5}
            </div>
          )}
        </div>
      </aside>

      <div className="relative h-[560px] overflow-hidden rounded-xl border border-[rgba(201,168,76,0.2)] bg-black shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        {activeMedia.type === 'video' ? (
          <video
            src={activeMedia.url}
            poster={activeMedia.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : activeMedia.url ? (
          <img src={activeMedia.url} alt={title} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[#0c0f14]">
            <Sparkles className="h-16 w-16 text-[#C9A84C]/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,8,0.94)_0%,rgba(4,6,8,0.76)_34%,rgba(4,6,8,0.22)_68%,rgba(4,6,8,0.35)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/92 via-black/42 to-transparent" />

        <button className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-lg border border-[rgba(201,168,76,0.28)] bg-black/28 text-white/70 backdrop-blur transition hover:border-[rgba(201,168,76,0.45)] hover:text-[#C9A84C]">
          <Maximize2 className="h-4 w-4" />
        </button>

        <div className="absolute left-7 top-[105px] max-w-[620px]">
          <span className="inline-flex rounded-md border border-[rgba(201,168,76,0.45)] bg-[#C9A84C]/[0.12] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A84C]">
            {promptSet.category} & products
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-white drop-shadow sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-[500px] text-[15px] leading-relaxed text-white/70">
              {description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-white/58">
            {promptSet.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[#f3c75e]">
                <Star className="h-4 w-4 fill-current" />
                {promptSet.averageRating.toFixed(1)}
                <span className="text-white/42">({promptSet.reviewCount > 999 ? `${(promptSet.reviewCount / 1000).toFixed(1)}K` : promptSet.reviewCount})</span>
              </span>
            )}
            <span className="text-white/25">•</span>
            <span>{promptCount} Prompts</span>
            <span className="inline-flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" />{mediaCount} Media</span>
            <span className="text-white/25">•</span>
            <span className="inline-flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#C9A84C]" />
              {seller}
              <BadgeCheck className="h-3.5 w-3.5 text-[#C9A84C]" />
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={onOpenWorkflow}
              className="inline-flex items-center gap-2 rounded-lg border border-[#C9A84C] bg-[#C9A84C] px-5 py-3 text-sm font-black text-black shadow-[0_0_30px_rgba(201,168,76,0.26)] transition hover:-translate-y-0.5 hover:bg-[#e0bf5c]"
            >
              <Workflow className="h-5 w-5" />
              {vi ? 'Xem Workflow' : 'View Workflow'}
            </button>
            <a
              href="#prompt-buy"
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(201,168,76,0.55)] bg-black/45 px-5 py-3 text-sm font-bold text-[#C9A84C] backdrop-blur transition hover:bg-[#C9A84C]/10"
            >
              <ShoppingCart className="h-4 w-4" />
              {vi ? 'Mua bộ prompt' : 'Buy prompt pack'}
            </a>
            <a
              href="#prompt-examples"
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(201,168,76,0.28)] bg-black/35 px-5 py-3 text-sm font-semibold text-white/74 backdrop-blur transition hover:border-[rgba(201,168,76,0.4)] hover:text-[#C9A84C]"
            >
              <Eye className="h-4 w-4" />
              {vi ? 'Xem ví dụ' : 'View examples'}
            </a>
            <button className="grid h-[46px] w-[46px] place-items-center rounded-lg border border-[rgba(201,168,76,0.28)] bg-black/35 text-white/64 backdrop-blur transition hover:border-[rgba(201,168,76,0.45)] hover:text-[#C9A84C]">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-8 bottom-5">
          <div className="flex items-center gap-3 text-white/70">
            <span className="h-4 w-1.5 bg-white/85" />
            <Volume2 className="h-4 w-4" />
            <span className="text-xs">0:08 / 1:24</span>
            <div className="relative h-px flex-1 bg-white/32">
              <div className="absolute left-0 top-0 h-px w-[34%] bg-[#C9A84C]" />
              <span className="absolute left-[34%] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#C9A84C]" />
            </div>
            <Settings className="h-4 w-4" />
            <span className="border border-[rgba(201,168,76,0.35)] px-1.5 py-0.5 text-[10px] font-bold">CC</span>
            <span className="text-xs">1080p</span>
            <Maximize2 className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const PromptPurchaseSidebar: React.FC<{
  promptSet: PromptSet;
  balance: number;
  alreadyPurchased: boolean;
  isAuthenticated: boolean;
  avatar?: string;
  seller: string;
  language: string;
  onPurchase: () => void;
  onLogin: () => void;
}> = ({ promptSet, balance, alreadyPurchased, isAuthenticated, avatar, seller, language, onPurchase, onLogin }) => {
  const vi = language === 'vi';
  const models = (promptSet.models ?? []).slice(0, 4);
  const visibleTags = (promptSet.tags ?? []).slice(0, 6);
  const extraTags = Math.max((promptSet.tags ?? []).length - visibleTags.length, 0);
  const mediaCount = (promptSet.examples ?? []).filter(ex => ex.image || ex.video).length + (promptSet.coverImage ? 1 : 0);

  return (
    <aside id="prompt-buy" className="space-y-3 scroll-mt-28 2xl:sticky 2xl:top-24">
      <div className="rounded-xl border border-[rgba(201,168,76,0.22)] bg-[#090d12] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/32">{vi ? 'Giá' : 'Price'}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex items-end gap-2">
            {promptSet.isFree ? (
              <span className="text-3xl font-black text-emerald-400">Free</span>
            ) : (
              <>
                <span className="text-4xl font-black leading-none text-[#C9A84C]">{promptSet.priceSKT.toLocaleString()}</span>
                <span className="mb-1 text-sm font-bold text-[#C9A84C]">SKT</span>
              </>
            )}
          </div>
          {!promptSet.isFree && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/28 line-through">{Math.round(promptSet.priceSKT * 1.33).toLocaleString()} SKT</span>
              <span className="rounded-md border border-[rgba(201,168,76,0.35)] bg-[#C9A84C]/10 px-2 py-1 text-xs font-bold text-[#C9A84C]">-25%</span>
            </div>
          )}
        </div>

        {isAuthenticated && !promptSet.isFree && (
          <p className="mt-2 text-xs text-white/35">
            {vi ? 'Số dư' : 'Balance'}: <span className="font-semibold text-white/72">{balance.toLocaleString()} SKT</span>
            {balance < promptSet.priceSKT && (
              <Link to="/skytoken" className="ml-2 text-[#C9A84C] hover:underline">
                {vi ? 'Nạp thêm' : 'Top up'}
              </Link>
            )}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {alreadyPurchased ? (
            <>
              <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400">
                <Check className="h-4 w-4" />
                {vi ? 'Đã mua' : 'Already purchased'}
              </div>
              <Link
                to="/prompt-market/my-purchases"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-3 text-sm font-black text-black transition hover:bg-[#e0bf5c]"
              >
                <ExternalLink className="h-4 w-4" />
                {vi ? 'Xem nội dung đầy đủ' : 'View full content'}
              </Link>
            </>
          ) : isAuthenticated ? (
            <button
              onClick={onPurchase}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-3 text-sm font-black text-black shadow-[0_0_24px_rgba(201,168,76,0.24)] transition hover:bg-[#e0bf5c]"
            >
              <ShoppingCart className="h-4 w-4" />
              {promptSet.isFree ? (vi ? 'Lấy miễn phí' : 'Get for free') : (vi ? 'Mua bộ prompt' : 'Purchase now')}
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-3 text-sm font-black text-black shadow-[0_0_24px_rgba(201,168,76,0.24)] transition hover:bg-[#e0bf5c]"
            >
              <Lock className="h-4 w-4" />
              {vi ? 'Đăng nhập để mua' : 'Login to purchase'}
            </button>
          )}

          <Link
            to="/prompt-market/my-purchases"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(201,168,76,0.2)] bg-white/[0.035] px-4 py-3 text-sm text-white/58 transition hover:border-[rgba(201,168,76,0.3)] hover:text-[#C9A84C]"
          >
            <FileText className="h-4 w-4" />
            {vi ? 'Xem gói & giấy phép' : 'View package and license'}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(201,168,76,0.18)] bg-[#090d12] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/32">Creator</p>
        <div className="mt-4 flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={seller} className="h-11 w-11 rounded-full border border-[rgba(201,168,76,0.3)] object-cover" />
          ) : (
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(201,168,76,0.3)] bg-[#C9A84C]/10">
              <User className="h-5 w-5 text-[#C9A84C]" />
            </div>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-bold text-white">
              {seller}
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#C9A84C]" />
            </p>
            <p className="text-xs text-white/38">Top Creator</p>
          </div>
        </div>
        {typeof promptSet.sellerId === 'object' && promptSet.sellerId?._id && (
          <Link
            to={`/prompt-market/seller/${promptSet.sellerId._id}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(201,168,76,0.25)] bg-[#C9A84C]/6 px-4 py-2.5 text-xs font-bold text-[#C9A84C] transition hover:bg-[#C9A84C]/[0.12]"
          >
            <User className="h-3.5 w-3.5" />
            {vi ? 'Xem hồ sơ creator' : 'View creator profile'}
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-[rgba(201,168,76,0.18)] bg-[#090d12] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/32">{vi ? 'Chi tiết' : 'Details'}</p>
        <div className="mt-3">
          {promptSet.reviewCount > 0 && (
            <Stat icon={<Star className="h-4 w-4" />} label={vi ? 'Đánh giá' : 'Rating'} value={`${promptSet.averageRating.toFixed(1)} (${promptSet.reviewCount})`} />
          )}
          <Stat icon={<Download className="h-4 w-4" />} label={vi ? 'Lượt mua' : 'Purchases'} value={promptSet.purchaseCount > 999 ? `${(promptSet.purchaseCount / 1000).toFixed(1)}K` : promptSet.purchaseCount} />
          <Stat icon={<Hash className="h-4 w-4" />} label="Prompts" value={promptSet.prompts.length} />
          <Stat icon={<ImageIcon className="h-4 w-4" />} label="Media" value={mediaCount} />
          <Stat icon={<CalendarDays className="h-4 w-4" />} label={vi ? 'Cập nhật' : 'Updated'} value={fmtDate(promptSet.updatedAt || promptSet.createdAt)} />
          <Stat icon={<BookOpen className="h-4 w-4" />} label={vi ? 'Ngôn ngữ' : 'Language'} value={vi ? 'Tiếng Việt' : 'Multi-language'} />
        </div>
      </div>

      {models.length > 0 && (
        <div className="rounded-xl border border-[rgba(201,168,76,0.18)] bg-[#090d12] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/32">{vi ? 'Tương thích' : 'Compatible'}</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-2">
            {models.map(model => (
              <span key={model} className="inline-flex items-center gap-2 rounded-lg border border-[rgba(201,168,76,0.18)] bg-white/[0.035] px-3 py-2 text-sm text-white/72">
                <Cpu className="h-4 w-4 text-[#C9A84C]" />
                {MODEL_LABELS[model] ?? model}
              </span>
            ))}
          </div>
        </div>
      )}

      {visibleTags.length > 0 && (
        <div className="rounded-xl border border-[rgba(201,168,76,0.18)] bg-[#090d12] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/32">Tags</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleTags.map(tag => (
              <Link key={tag} to={`/prompt-market?q=${encodeURIComponent(tag)}`} className="rounded-lg border border-[rgba(201,168,76,0.16)] bg-white/[0.035] px-3 py-2 text-xs text-white/48 transition hover:border-[rgba(201,168,76,0.35)] hover:text-[#C9A84C]">
                #{tag}
              </Link>
            ))}
            {extraTags > 0 && (
              <span className="rounded-lg border border-[rgba(201,168,76,0.16)] bg-white/[0.035] px-3 py-2 text-xs text-white/48">+{extraTags}</span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * PromptDetailPage
 * Route: /prompt-market/:slug
 * ═══════════════════════════════════════════════════════════════════ */
const PromptDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { isAuthenticated, login } = useAuth();

  const [promptSet, setPromptSet] = useState<PromptSet | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [relatedPrompts, setRelatedPrompts] = useState<PromptSet[]>([]);
  const [copied, setCopied] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);

  /* ── fetch ── */
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const [detailRes, balRes] = await Promise.all([
        promptMarketApi.getBySlug(slug),
        isAuthenticated ? skytokenApi.getBalance() : Promise.resolve({ skyTokenBalance: 0 }),
      ]);
      setPromptSet(detailRes.data);
      setActiveExampleIndex(0);
      setBalance(balRes.skyTokenBalance ?? 0);

      if (detailRes.data?._id) {
        // Track view
        promptMarketApi.trackView(detailRes.data._id);

        if (isAuthenticated) {
          // Check purchased + wishlisted in parallel
          const [purchaseCheck, wishCheck] = await Promise.all([
            promptMarketApi.checkPurchased(detailRes.data._id),
            promptMarketApi.checkWishlisted([detailRes.data._id]),
          ]);
          setAlreadyPurchased(purchaseCheck.purchased);
          setWishlisted(wishCheck.data[detailRes.data._id] ?? false);

          if (purchaseCheck.purchased && purchaseCheck.purchaseId) {
            const fullRes = await promptMarketApi.getMyPurchaseDetail(purchaseCheck.purchaseId);
            if (fullRes.data?.promptSet) {
              setPromptSet(fullRes.data.promptSet);
            }
          }
        }
      }

      // Fetch related
      const relatedRes = await promptMarketApi.getRelated(slug, 4);
      setRelatedPrompts(relatedRes.data ?? []);

      setLoading(false);
    };
    load();
  }, [slug, isAuthenticated]);

  /* ── wishlist toggle ── */
  const handleWishlistToggle = async () => {
    if (!promptSet || !isAuthenticated || wishLoading) return;
    setWishLoading(true);
    const res = await promptMarketApi.toggleWishlist(promptSet._id);
    if (res.success) setWishlisted(res.wishlisted);
    setWishLoading(false);
  };

  /* ── localized helper ── */
  const loc = (obj: { en: string; vi: string; ko: string; ja: string } | undefined) =>
    obj ? (obj[lang as keyof typeof obj] || obj.en) : '';

  /* ── share ── */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: promptSet ? loc(promptSet.title) : 'Prompt',
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-white/25 animate-pulse">
          Loading prompt set...
        </span>
      </div>
    );
  }

  /* ── not found ── */
  if (!promptSet) {
    return (
      <div className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <FileText className="w-16 h-16 text-white/10" />
        <h2 className="text-2xl font-bold text-white">Prompt Set Not Found</h2>
        <p className="text-white/35 max-w-sm">
          This prompt set may have been removed or the link is incorrect.
        </p>
        <Link
          to="/prompt-market"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-black font-medium hover:bg-[#B8963F] transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prompt Market
        </Link>
      </div>
    );
  }

  const title = loc(promptSet.title);
  const description = loc(promptSet.description);
  const avatar = getSellerAvatar(promptSet.sellerId);
  const seller = getSellerName(promptSet.sellerId);
  const canViewFullPrompt = promptSet.isFree || alreadyPurchased;
  const workflowPreview = buildPromptWorkflowPreview(promptSet, title, canViewFullPrompt, lang);

  return (
    <div className="min-h-screen bg-[#05080c] text-white font-[Manrope,sans-serif]">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-[rgba(201,168,76,0.1)] bg-[#05080c]/92 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-[1860px] mx-auto px-4 sm:px-8 py-4 flex items-center gap-2 text-sm text-white/35">
          <Home className="h-4 w-4 text-white/30" />
          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
          <Link to="/prompt-market" className="hover:text-white transition-colors">
            Bộ prompt
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
          <span className="text-white/60 truncate max-w-[260px] sm:max-w-none">{title}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="w-full px-4 py-5 sm:px-8">
        <div className="space-y-8">
          <div className="mx-auto w-full max-w-[1860px]">
            <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
              <div className="min-w-0 space-y-8">
                <div className="relative">
                  <PromptMockupStage
                    promptSet={promptSet}
                    title={title}
                    description={description}
                    seller={seller}
                    activeIndex={activeExampleIndex}
                    onSelect={setActiveExampleIndex}
                    onOpenWorkflow={() => setShowWorkflowPreview(true)}
                    language={lang}
                  />
                  {isAuthenticated && (
                    <button
                      onClick={handleWishlistToggle}
                      disabled={wishLoading}
                      className={`absolute bottom-[118px] left-[650px] z-20 hidden h-[46px] w-[46px] place-items-center border backdrop-blur-md transition-all duration-200 xl:grid ${
                        wishlisted
                          ? 'border-red-500/35 bg-red-500/18 text-red-300'
                          : 'border-[rgba(201,168,76,0.28)] bg-black/40 text-white/58 hover:border-red-500/30 hover:text-red-300'
                      }`}
                      title={wishlisted ? t('prompt_market.remove_wishlist') : t('prompt_market.add_to_wishlist')}
                    >
                      <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
          <div className="mx-auto w-full max-w-[1500px] space-y-8 px-0 sm:px-2 lg:px-4 2xl:px-0">
            <PromptValueCards
              promptSet={promptSet}
              canViewFullPrompt={canViewFullPrompt}
              language={lang}
            />

            <PromptWorkflowStrip
              promptSet={promptSet}
              onOpenWorkflow={() => setShowWorkflowPreview(true)}
              language={lang}
            />

            {/* ── Content + purchase section below showcase ── */}
            <div id="prompt-examples" className="grid grid-cols-1 gap-8 lg:gap-10 items-start">
            <div className="min-w-0 space-y-8">

            {/* Plain-language overview + Share */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C9A84C]/70">
                  {lang === 'vi' ? 'Tổng quan dễ hiểu' : 'Simple overview'}
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {lang === 'vi' ? 'Bạn dùng bộ prompt này như một quy trình sản xuất hoàn chỉnh' : 'Use this pack as a complete production workflow'}
                </h2>
              </div>
              {/* Share buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <button
                  onClick={handleCopyLink}
                  className="w-9 h-9 rounded-xl border border-[rgba(201,168,76,0.12)] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:border-[rgba(201,168,76,0.3)] transition"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-xl border border-[rgba(201,168,76,0.12)] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:border-[rgba(201,168,76,0.3)] transition"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14 }}
                className="text-white/50 leading-relaxed text-base"
              >
                {lang === 'vi'
                  ? `Bộ này cho bạn ví dụ đầu ra, model nên dùng, workflow từng bước và prompt module có thể copy sau khi mở khóa. ${description}`
                  : `This pack gives you output examples, recommended models, step-by-step workflow, and copy-ready prompt modules after unlock. ${description}`}
              </motion.p>
            )}

            {/* Preview text */}
            {promptSet.previewText && !canViewFullPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">
                  Preview
                </h3>
                <div className="relative rounded-xl bg-[#0a0a14] border border-[rgba(201,168,76,0.12)] overflow-hidden">
                  <div className="p-5 font-mono text-sm text-white/50 leading-relaxed whitespace-pre-wrap max-h-40 overflow-hidden">
                    {promptSet.previewText}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a14] to-transparent" />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="text-xs text-white/25 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04]">
                      <EyeOff className="w-3 h-3" /> Purchase to see full content
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <PromptUsageGuide
              promptSet={promptSet}
              canViewFullPrompt={canViewFullPrompt}
              onPurchase={() => setShowPurchaseModal(true)}
              onLogin={login}
              isAuthenticated={isAuthenticated}
            />

            {/* Prompt list */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                {lang === 'vi' ? `Các prompt trong bộ (${promptSet.prompts.length})` : `Included prompts (${promptSet.prompts.length})`}
              </h3>
              <div className="space-y-3">
                {promptSet.prompts.map((prompt, idx) => {
                  const promptContent = prompt.content || '';
                  return (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-[rgba(201,168,76,0.12)] bg-white/[0.02] p-4 flex items-start gap-4 hover:border-[rgba(201,168,76,0.24)] transition-colors overflow-hidden"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#C9A84C]/15 border border-[rgba(201,168,76,0.25)] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#C9A84C]">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-white truncate text-sm">
                            {typeof prompt.title === 'object'
                              ? loc(prompt.title as Parameters<typeof loc>[0])
                              : prompt.title}
                          </p>
                          {canViewFullPrompt && promptContent && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(promptContent);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(201,168,76,0.16)] px-2 py-1 text-[11px] text-white/45 hover:border-[rgba(201,168,76,0.3)] hover:text-[#C9A84C] transition"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                          )}
                        </div>
                        {prompt.description && (
                          <p className="text-xs text-white/35 mt-1 line-clamp-2">
                            {typeof prompt.description === 'object'
                              ? loc(prompt.description as Parameters<typeof loc>[0])
                              : prompt.description}
                          </p>
                        )}
                        {canViewFullPrompt && prompt.variables && prompt.variables.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {prompt.variables.map((v) => (
                              <span
                                key={v.name}
                                className="px-2 py-0.5 rounded-md bg-[#C9A84C]/[0.08] border border-[rgba(201,168,76,0.15)] text-[10px] text-[#C9A84C]/70 font-mono"
                              >
                                {`{{${v.name}}}`}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 rounded-lg border border-[rgba(201,168,76,0.1)] bg-black/20 p-3">
                          {canViewFullPrompt && promptContent ? (
                            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/65">
                              {promptContent}
                            </pre>
                          ) : canViewFullPrompt ? (
                            <div className="flex items-center gap-2 text-xs text-white/35">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                              Loading unlocked prompt content...
                            </div>
                          ) : (
                            <div className="relative min-h-24 overflow-hidden">
                              <div className="space-y-2 select-none blur-[2px]">
                                <div className="h-2.5 w-full rounded bg-white/20" />
                                <div className="h-2.5 w-10/12 rounded bg-white/15" />
                                <div className="h-2.5 w-11/12 rounded bg-white/15" />
                                <div className="h-2.5 w-8/12 rounded bg-white/10" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(201,168,76,0.25)] bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-[#C9A84C] backdrop-blur">
                                  <Lock className="w-3 h-3" />
                                  Paid prompt is hidden until purchase
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Tags */}
            {promptSet.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="flex flex-wrap gap-2"
              >
                {promptSet.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/prompt-market?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-[rgba(201,168,76,0.12)] text-xs text-white/40 flex items-center gap-1.5 hover:border-[rgba(201,168,76,0.3)] hover:text-white/60 transition-colors"
                  >
                    <Tag className="w-3 h-3 text-[#C9A84C]/60" />
                    {tag}
                  </Link>
                ))}
              </motion.div>
            )}

            {/* ── Reviews ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="pt-8 border-t border-[rgba(201,168,76,0.1)]"
            >
              <PromptReviewSection
                promptSetId={promptSet._id}
                hasPurchased={alreadyPurchased}
              />
            </motion.div>

            {/* ── Related Prompts ── */}
            {relatedPrompts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-8 border-t border-[rgba(201,168,76,0.1)]"
              >
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-5">
                  Related Prompts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPrompts.map((rp, i) => (
                    <PromptSetCard key={rp._id} promptSet={rp} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ════════════════════════
           * Purchase/info panel below showcase
           * ════════════════════════ */}
          <div className="hidden">
            <div className="space-y-4">
              {/* Price card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-lg border border-[rgba(201,168,76,0.12)] bg-[#0a0a14]/80 backdrop-blur-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-[rgba(201,168,76,0.1)]">
                  <div className="flex items-end gap-2">
                    {promptSet.isFree ? (
                      <span className="text-3xl font-bold text-emerald-400">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-white">
                          {promptSet.priceSKT.toLocaleString()}
                        </span>
                        <span className="text-base text-[#C9A84C] font-bold mb-0.5">SKT</span>
                      </>
                    )}
                  </div>
                  {isAuthenticated && !promptSet.isFree && (
                    <p className="text-xs text-white/25 mt-1.5">
                      Your balance: <span className="text-white/60 font-medium">{balance.toLocaleString()} SKT</span>
                      {balance < promptSet.priceSKT && (
                        <Link to="/skytoken" className="ml-2 text-[#C9A84C] hover:underline">
                          Top up
                        </Link>
                      )}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="p-5 space-y-3">
                  {alreadyPurchased ? (
                    <>
                      <div className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm">
                        <Check className="w-4 h-4" />
                        Already Purchased
                      </div>
                      <Link
                        to="/prompt-market/my-purchases"
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#B8963F] text-black font-semibold transition-all duration-200 active:scale-95 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Content
                      </Link>
                    </>
                  ) : isAuthenticated ? (
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#B8963F] text-black font-semibold transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(201,168,76,0.25)]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {promptSet.isFree ? 'Get for Free' : 'Purchase Now'}
                    </button>
                  ) : (
                    <button
                      onClick={() => login()}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[rgba(201,168,76,0.4)] text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/10 transition-all duration-200"
                    >
                      <LogIn className="w-4 h-4" />
                      Login to Purchase
                    </button>
                  )}

                  {!alreadyPurchased && (
                    <Link
                      to="/prompt-market/my-purchases"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(201,168,76,0.12)] text-white/35 text-sm hover:border-[rgba(201,168,76,0.24)] hover:text-white/60 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      My Purchases
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Seller info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="rounded-lg border border-[rgba(201,168,76,0.12)] bg-[#0a0a14]/80 backdrop-blur-sm p-5 space-y-4"
              >
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                  Creator
                </h4>
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={seller}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[rgba(201,168,76,0.2)]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C]/15 flex items-center justify-center ring-2 ring-[rgba(201,168,76,0.2)]">
                      <User className="w-5 h-5 text-[#C9A84C]/70" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm flex items-center gap-1.5">
                      {seller}
                      <BadgeCheck className="w-3.5 h-3.5 text-[#C9A84C]/60 flex-shrink-0" />
                    </p>
                    <p className="text-[11px] text-white/25">Prompt Creator</p>
                  </div>
                </div>
                {typeof promptSet.sellerId === 'object' && promptSet.sellerId?._id && (
                  <Link
                    to={`/prompt-market/seller/${promptSet.sellerId._id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[rgba(201,168,76,0.15)] text-[#C9A84C]/70 text-xs font-medium hover:border-[rgba(201,168,76,0.3)] hover:text-[#C9A84C] transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    {t('prompt_market.view_profile') || 'View Profile'}
                  </Link>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.26 }}
                className="rounded-lg border border-[rgba(201,168,76,0.12)] bg-[#0a0a14]/80 backdrop-blur-sm p-5"
              >
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-2">
                  Details
                </h4>
                {promptSet.reviewCount > 0 && (
                  <Stat
                    icon={<Star className="w-4 h-4" />}
                    label="Rating"
                    value={`${promptSet.averageRating.toFixed(1)} (${promptSet.reviewCount})`}
                  />
                )}
                {promptSet.viewCount != null && promptSet.viewCount > 0 && (
                  <Stat
                    icon={<Eye className="w-4 h-4" />}
                    label={t('prompt_market.views') || 'Views'}
                    value={promptSet.viewCount > 999 ? `${(promptSet.viewCount / 1000).toFixed(1)}k` : promptSet.viewCount}
                  />
                )}
                <Stat
                  icon={<Download className="w-4 h-4" />}
                  label="Purchases"
                  value={promptSet.purchaseCount.toLocaleString()}
                />
                <Stat
                  icon={<Hash className="w-4 h-4" />}
                  label="Prompts"
                  value={promptSet.prompts.length}
                />
                <Stat
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Published"
                  value={fmtDate(promptSet.createdAt)}
                />
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C9A84C]/10 border border-[rgba(201,168,76,0.15)] text-xs font-medium text-[#C9A84C]/80 capitalize">
                    {promptSet.category}
                  </span>
                </div>
              </motion.div>

              {/* Compatible Models */}
              {promptSet.models && promptSet.models.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.32 }}
                  className="rounded-lg border border-[rgba(201,168,76,0.12)] bg-[#0a0a14]/80 backdrop-blur-sm p-5"
                >
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-3">
                    {t('prompt_market.compatible_models') || 'Compatible Models'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {promptSet.models.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-[rgba(201,168,76,0.12)] text-xs text-white/50 font-medium"
                      >
                        <Cpu className="w-3 h-3 text-[#C9A84C]/50" />
                        {MODEL_LABELS[m] ?? m}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Report button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(201,168,76,0.1)] text-white/20 text-xs hover:border-red-500/20 hover:text-red-400/60 transition-colors"
              >
                <Flag className="w-3 h-3" />
                Report this prompt set
              </motion.button>
            </div>
          </div>
          </div>
              </div>
              </div>

              <PromptPurchaseSidebar
                promptSet={promptSet}
                balance={balance}
                alreadyPurchased={alreadyPurchased}
                isAuthenticated={isAuthenticated}
                avatar={avatar}
                seller={seller}
                language={lang}
                onPurchase={() => setShowPurchaseModal(true)}
                onLogin={login}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Purchase Modal ── */}
      {showPurchaseModal && (
        <PromptPurchaseModal
          promptSet={promptSet}
          userBalance={balance}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={(newBalance: number) => {
            setBalance(newBalance);
            setAlreadyPurchased(true);
            setShowPurchaseModal(false);
            navigate('/prompt-market/my-purchases');
          }}
        />
      )}

      <WorkflowPreviewModal
        open={showWorkflowPreview}
        onClose={() => setShowWorkflowPreview(false)}
        workflow={workflowPreview}
        language={lang}
      />
    </div>
  );
};

export default PromptDetailPage;
