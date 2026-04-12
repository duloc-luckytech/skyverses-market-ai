import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { ShotTypeBadge } from './ShotTypeBadge';
import { DurationControl } from './DurationControl';
import type { ShotType, DurationPreset } from '../../../hooks/useStoryboardStudio';

const STATUS_CONFIG: Record<string, { dot: string; label: string; badge: string }> = {
  idle:       { dot: 'bg-white/20',                label: 'Idle',       badge: 'bg-white/10 text-white/30 border-white/10' },
  analyzing:  { dot: 'bg-amber-400 animate-pulse', label: 'Phân tích',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  generating: { dot: 'bg-brand-blue animate-pulse',label: 'Rendering',  badge: 'bg-brand-blue/15 text-brand-blue border-brand-blue/25' },
  done:       { dot: 'bg-emerald-500',             label: 'Done ✓',     badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  error:      { dot: 'bg-rose-500',                label: 'Lỗi',        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
};

interface SceneCardHeaderProps {
  sceneIndex: number;
  title?: string;
  shotType: ShotType;
  duration: number;
  status: string;
  errorMessage?: string;
  onShotTypeChange: (st: ShotType) => void;
  onDurationChange: (d: DurationPreset) => void;
  onRename?: (title: string) => void;
  isProcessing: boolean;
}

export const SceneCardHeader: React.FC<SceneCardHeaderProps> = ({
  sceneIndex,
  title,
  shotType,
  duration,
  status,
  errorMessage,
  onShotTypeChange,
  onDurationChange,
  onRename,
  isProcessing,
}) => {
  const { dot, label, badge } = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  const [showErrorTooltip, setShowErrorTooltip] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const isError = status === 'error';
  const errorText = errorMessage?.trim() || 'Lỗi không xác định';

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renaming]);

  const startRename = useCallback(() => {
    if (!onRename) return;
    setRenameValue(title || '');
    setRenaming(true);
  }, [title, onRename]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (onRename) onRename(trimmed);
    setRenaming(false);
  }, [renameValue, onRename]);

  const handleRenameKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') { setRenaming(false); }
  }, [commitRename]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02]"
      onClick={e => e.stopPropagation()}
    >
      {/* Scene number / title — double-click to rename */}
      {renaming ? (
        <input
          ref={renameInputRef}
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKey}
          onClick={e => e.stopPropagation()}
          placeholder={`#${sceneIndex + 1}`}
          className="shrink-0 w-20 h-5 px-1.5 rounded-full bg-brand-blue/20 border border-brand-blue/50 text-brand-blue text-[8px] font-black leading-none outline-none text-center"
        />
      ) : (
        <span
          className={`shrink-0 inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full bg-brand-blue/90 text-white text-[8px] font-black tabular-nums leading-none shadow-sm ${onRename ? 'cursor-pointer hover:bg-brand-blue transition-colors' : ''}`}
          onDoubleClick={onRename ? startRename : undefined}
          title={onRename ? (title || `Cảnh ${sceneIndex + 1}`) + ' — click đúp để đổi tên' : undefined}
        >
          {title ? (
            <span className="max-w-[64px] truncate">{title}</span>
          ) : (
            `#${sceneIndex + 1}`
          )}
        </span>
      )}

      {/* Shot type badge */}
      <ShotTypeBadge
        shotType={shotType}
        onChange={onShotTypeChange}
        disabled={isProcessing}
      />

      {/* Duration control */}
      <div className="flex-1 min-w-0">
        <DurationControl
          duration={duration}
          onChange={onDurationChange}
          disabled={isProcessing}
        />
      </div>

      {/* Status badge — màu theo trạng thái */}
      <div className="relative shrink-0">
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest leading-none cursor-default ${badge} ${isError ? 'cursor-help' : ''}`}
          title={isError ? errorText : label}
          onMouseEnter={() => isError && setShowErrorTooltip(true)}
          onMouseLeave={() => setShowErrorTooltip(false)}
        >
          {isError
            ? <AlertCircle size={10} className="text-rose-400 shrink-0" />
            : <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
          }
          <span className="hidden sm:inline">{label}</span>
        </div>

        {/* Error tooltip popover */}
        <AnimatePresence>
          {isError && showErrorTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-1.5 z-50 w-56 max-w-xs"
              onClick={e => e.stopPropagation()}
            >
              {/* Arrow */}
              <div className="absolute -top-1 right-3 w-2 h-2 rotate-45 bg-[#1e0a0a] border-l border-t border-rose-500/30" />
              {/* Content */}
              <div className="bg-[#1e0a0a] border border-rose-500/30 rounded-xl px-3 py-2.5 shadow-2xl shadow-rose-900/30">
                <div className="flex items-start gap-2">
                  <AlertCircle size={11} className="text-rose-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-widest text-rose-400 mb-1 leading-none">Chi tiết lỗi</p>
                    <p className="text-[10px] text-rose-200/80 leading-snug break-words">{errorText}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
