/**
 * ImageJobCard — Shared UI component for all image/video generation results.
 *
 * Handles 5 states: idle | submitting | processing | done | error
 * Two display modes: 'full' (modal/workspace) | 'compact' (landing widget)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon,
  Wand2,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobCardStatus = 'idle' | 'submitting' | 'processing' | 'done' | 'error';

export interface ImageJobCardProps {
  // ─── Core state ─────────────────────────────────────────────
  status: JobCardStatus;
  /** Result image/video URL (available when status === 'done') */
  resultUrl?: string;
  /** Progress 0–100 for animated bar; shown only in 'processing' state */
  progress?: number;
  /** Status label shown during processing/submitting */
  statusText?: string;
  /** Error description (status === 'error') */
  errorMessage?: string;
  /** Show <video> instead of <img> for video jobs */
  isVideo?: boolean;

  // ─── Display ────────────────────────────────────────────────
  /** 'full' = workspace/modal, 'compact' = landing widget. Default: 'full' */
  mode?: 'full' | 'compact';
  /** CSS aspect-ratio string, e.g. '1/1' or '16/9'. Default: '1/1' */
  aspectRatio?: string;
  /** Download filename without extension. Default: skyverses_{timestamp} */
  downloadFilename?: string;

  // ─── Callbacks ──────────────────────────────────────────────
  onDownload?: () => void;
  onRetry?: () => void;
  onReset?: () => void;

  // ─── Optional content slots ─────────────────────────────────
  /** Replaces the default idle placeholder. Pass your own mosaic/grid/placeholder. */
  idleSlot?: React.ReactNode;
  /** Injected below the image/video in ALL states (done, processing, error, idle). Use for prompt text, cost, date, etc. */
  infoSlot?: React.ReactNode;
  /** Injected below the result image in 'done' state (above infoSlot) */
  resultFooter?: React.ReactNode;
  /** Injected inside the loading overlay in 'processing' state */
  loadingExtra?: React.ReactNode;

  // ─── Style overrides ────────────────────────────────────────
  /** Extra className on the outermost wrapper div */
  cardClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ImageJobCard: React.FC<ImageJobCardProps> = ({
  status,
  resultUrl,
  progress = 0,
  statusText,
  errorMessage,
  isVideo = false,
  mode = 'full',
  aspectRatio = '1/1',
  downloadFilename,
  onDownload,
  onRetry,
  onReset,
  idleSlot,
  infoSlot,
  resultFooter,
  loadingExtra,
  cardClassName = '',
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const isCompact = mode === 'compact';

  // ─── Blob download ──────────────────────────────────────────
  const handleDownload = async () => {
    if (!resultUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const ext = isVideo ? 'mp4' : 'png';
      const filename = `${downloadFilename ?? `skyverses_${Date.now()}`}.${ext}`;
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      onDownload?.();
    } catch {
      window.open(resultUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Size tokens ────────────────────────────────────────────
  const minH = isCompact ? 'min-h-[140px]' : 'min-h-[240px]';
  const textSm = isCompact ? 'text-[10px]' : 'text-xs';
  const textXs = isCompact ? 'text-[9px]' : 'text-[10px]';
  const btnPad = isCompact ? 'px-2.5 py-1.5' : 'px-3.5 py-2';
  const iconSz = isCompact ? 12 : 14;
  const particleCount = isCompact ? 3 : 6;

  // ─── Particle positions for loading animation ────────────────
  const particles = [
    { x: '15%', y: '15%', color: '#0090ff', delay: 0 },
    { x: '85%', y: '20%', color: '#8b5cf6', delay: 0.6 },
    { x: '12%', y: '80%', color: '#ec4899', delay: 1.2 },
    { x: '82%', y: '75%', color: '#06b6d4', delay: 1.8 },
    { x: '50%', y: '8%', color: '#10b981', delay: 0.4 },
    { x: '92%', y: '50%', color: '#f59e0b', delay: 2.2 },
  ].slice(0, particleCount);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <>
      {/* Keyframe styles (injected once, scoped by unique class) */}
      <style>{`
        @keyframes ijc-grid-pan {
          0%   { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }
        @keyframes ijc-scan {
          0%   { top: -10%; opacity: 0; }
          20%  { opacity: 0.15; }
          80%  { opacity: 0.15; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes ijc-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50%       { transform: translateY(-10px) scale(1.3); opacity: 0.9; }
        }
        @keyframes ijc-orbit {
          from { transform: rotate(0deg) translateX(24px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(24px) rotate(-360deg); }
        }
        @keyframes ijc-orbit2 {
          from { transform: rotate(180deg) translateX(18px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(18px) rotate(-540deg); }
        }
        @keyframes ijc-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className={`w-full rounded-xl overflow-hidden ${isCompact ? 'rounded-lg' : ''} ${cardClassName}`}>
        <AnimatePresence mode="wait">

          {/* ══════ IDLE ══════ */}
          {status === 'idle' && (
            idleSlot ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full"
                style={{ aspectRatio }}
              >
                {idleSlot}
              </motion.div>
            ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative w-full ${minH} flex flex-col items-center justify-center gap-3
                border-2 border-dashed border-black/[0.08] dark:border-white/[0.08]
                rounded-xl bg-slate-50/50 dark:bg-white/[0.02]`}
              style={{ aspectRatio }}
            >
              <ImageIcon
                size={isCompact ? 24 : 36}
                className="text-slate-200 dark:text-gray-700"
              />
              <p className={`${textXs} font-medium text-slate-300 dark:text-gray-600`}>
                Kết quả sẽ hiển thị ở đây
              </p>
            </motion.div>
            )
          )}

          {/* ══════ SUBMITTING ══════ */}
          {status === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative w-full ${minH} flex flex-col items-center justify-center gap-3
                rounded-xl overflow-hidden bg-slate-100/60 dark:bg-white/[0.03]`}
              style={{ aspectRatio }}
            >
              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(0,144,255,0.06) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'ijc-shimmer 1.8s linear infinite',
                }}
              />
              <Loader2
                size={isCompact ? 18 : 24}
                className="text-brand-blue animate-spin relative z-10"
              />
              <p className={`${textSm} font-medium text-slate-400 dark:text-gray-500 relative z-10`}>
                {statusText ?? 'Đang gửi yêu cầu...'}
              </p>
            </motion.div>
          )}

          {/* ══════ PROCESSING ══════ */}
          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative w-full ${minH} flex flex-col items-center justify-center gap-4
                rounded-xl overflow-hidden`}
              style={{
                aspectRatio,
                background: 'linear-gradient(135deg, #0a0a1a 0%, #050512 100%)',
              }}
            >
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,144,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,144,255,0.15) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  animation: 'ijc-grid-pan 3s linear infinite',
                }}
              />

              {/* Scanline */}
              <div
                className="absolute left-0 right-0 h-[2px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(0,144,255,0.4), rgba(139,92,246,0.4), transparent)',
                  animation: 'ijc-scan 2.5s ease-in-out infinite',
                  top: '0%',
                }}
              />

              {/* Floating particles */}
              {particles.map((p, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                  style={{
                    left: p.x,
                    top: p.y,
                    backgroundColor: p.color,
                    boxShadow: `0 0 6px ${p.color}`,
                    animation: `ijc-float ${2.5 + p.delay * 0.3}s ease-in-out infinite ${p.delay * 0.3}s`,
                    opacity: 0.5,
                  }}
                />
              ))}

              {/* Center: orbit icon */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`relative ${isCompact ? 'w-10 h-10' : 'w-14 h-14'}`}>
                  {/* Orbit ring 1 */}
                  <div
                    className="absolute inset-0 rounded-full border border-brand-blue/20"
                    style={{ transform: 'scale(1.6)' }}
                  >
                    <div
                      className="absolute w-2 h-2 rounded-full bg-brand-blue shadow-lg"
                      style={{
                        top: '50%', left: '50%',
                        marginTop: '-4px', marginLeft: '-4px',
                        animation: 'ijc-orbit 2s linear infinite',
                      }}
                    />
                  </div>
                  {/* Orbit ring 2 */}
                  <div
                    className="absolute inset-0 rounded-full border border-violet-500/15"
                    style={{ transform: 'scale(1.25)' }}
                  >
                    <div
                      className="absolute w-1.5 h-1.5 rounded-full bg-violet-400 shadow-lg"
                      style={{
                        top: '50%', left: '50%',
                        marginTop: '-3px', marginLeft: '-3px',
                        animation: 'ijc-orbit2 1.5s linear infinite',
                      }}
                    />
                  </div>
                  {/* Center icon */}
                  <div
                    className={`relative z-10 w-full h-full rounded-xl flex items-center justify-center`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,144,255,0.2), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(0,144,255,0.25)',
                    }}
                  >
                    <Wand2
                      size={isCompact ? 14 : 20}
                      className="text-brand-blue"
                    />
                  </div>
                </div>

                {/* Status text */}
                <motion.p
                  key={statusText}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${textSm} font-bold text-white/70 text-center max-w-[160px]`}
                >
                  {statusText ?? 'AI đang xử lý...'}
                </motion.p>

                {/* Progress bar */}
                {progress > 0 && (
                  <div
                    className={`${isCompact ? 'w-28' : 'w-40'} h-1 rounded-full bg-white/10 overflow-hidden`}
                  >
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-blue to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                )}
                {progress > 0 && (
                  <p className={`${textXs} font-bold text-white/30 tabular-nums`}>
                    {Math.round(progress)}%
                  </p>
                )}
              </div>

              {/* Extra slot */}
              {loadingExtra && (
                <div className="relative z-10">{loadingExtra}</div>
              )}
            </motion.div>
          )}

          {/* ══════ DONE ══════ */}
          {status === 'done' && resultUrl && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-full rounded-xl overflow-hidden"
              style={{ aspectRatio }}
            >
              {isVideo ? (
                <video
                  src={resultUrl}
                  controls
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={resultUrl}
                  alt="Generated result"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Footer overlay */}
              <div
                className={`absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 ${isCompact ? 'p-2' : 'p-3'}`}
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                }}
              >
                {/* Success badge */}
                <div
                  className={`flex items-center gap-1.5 ${isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'} rounded-lg bg-emerald-500/20 border border-emerald-500/30`}
                >
                  <CheckCircle2 size={iconSz} className="text-emerald-400" />
                  <span className={`${textXs} font-bold text-emerald-400`}>
                    Hoàn tất
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  {onReset && (
                    <button
                      onClick={onReset}
                      className={`flex items-center gap-1 ${btnPad} rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all`}
                    >
                      <RefreshCw size={iconSz} />
                      {!isCompact && (
                        <span className={textXs}>Tạo lại</span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`flex items-center gap-1 ${btnPad} rounded-lg bg-brand-blue/80 hover:bg-brand-blue text-white transition-all disabled:opacity-50`}
                  >
                    {isDownloading ? (
                      <Loader2 size={iconSz} className="animate-spin" />
                    ) : (
                      <Download size={iconSz} />
                    )}
                    {!isCompact && (
                      <span className={textXs}>
                        {isDownloading ? 'Đang tải...' : 'Tải về'}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════ ERROR ══════ */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative w-full ${minH} flex flex-col items-center justify-center gap-3
                rounded-xl border border-red-500/20 bg-red-500/[0.04]`}
              style={{ aspectRatio }}
            >
              <AlertCircle
                size={isCompact ? 20 : 28}
                className="text-red-400"
              />
              <p className={`${textSm} font-bold text-red-400 text-center max-w-[200px]`}>
                {errorMessage ?? 'Có lỗi xảy ra. Vui lòng thử lại.'}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`flex items-center gap-1.5 ${btnPad} rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all ${textXs} font-bold`}
                >
                  <RefreshCw size={iconSz} />
                  Thử lại
                </button>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Result footer slot */}
        {status === 'done' && resultFooter && (
          <div className="mt-2">{resultFooter}</div>
        )}

        {/* Info slot — shown in all states */}
        {infoSlot && (
          <div>{infoSlot}</div>
        )}
      </div>
    </>
  );
};

export default ImageJobCard;
