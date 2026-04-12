import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ChevronDown, Trash2, GripVertical, Plus } from 'lucide-react';
import type { Act, Scene } from '../../hooks/useStoryboardStudio';

interface ActSectionProps {
  act: Act;
  scenes: Scene[];
  isOnlyAct: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
  onToggleCollapse: () => void;
  onReorderScenes: (reordered: Scene[]) => void;
  children: React.ReactNode;
}

export const ActSection: React.FC<ActSectionProps> = ({
  act,
  scenes,
  isOnlyAct,
  onRename,
  onRemove,
  onToggleCollapse,
  onReorderScenes,
  children,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const startRename = useCallback(() => {
    setRenameValue(act.name);
    setRenaming(true);
  }, [act.name]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed) onRename(trimmed);
    setRenaming(false);
  }, [renameValue, onRename]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') { setRenaming(false); }
  }, [commitRename]);

  const dotColor = act.color ?? '#6366f1';

  return (
    <div className="mb-3">
      {/* Act header bar */}
      <div className="flex items-center gap-2 px-1 py-1 group select-none">
        {/* Collapse chevron */}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-5 h-5 rounded hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all shrink-0"
          title={act.collapsed ? 'Mở rộng act' : 'Thu gọn act'}
        >
          <motion.span
            animate={{ rotate: act.collapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <ChevronDown size={13} />
          </motion.span>
        </button>

        {/* Color dot */}
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10"
          style={{ backgroundColor: dotColor }}
        />

        {/* Act name — double-click to rename */}
        {renaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKey}
            onClick={e => e.stopPropagation()}
            className="flex-1 min-w-0 h-5 px-1.5 rounded bg-white/[0.08] border border-white/20 text-white text-[11px] font-semibold outline-none"
            placeholder="Tên act..."
          />
        ) : (
          <span
            className="flex-1 min-w-0 text-[11px] font-semibold text-white/70 truncate cursor-default hover:text-white/90 transition-colors"
            onDoubleClick={startRename}
            title="Double-click để đổi tên"
          >
            {act.name}
          </span>
        )}

        {/* Scene count badge */}
        <span className="shrink-0 text-[9px] font-black text-white/25 tabular-nums">
          {scenes.length} cảnh
        </span>

        {/* Delete button */}
        {!isOnlyAct && (
          <div className="relative shrink-0">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-rose-400 font-medium whitespace-nowrap">Xóa act?</span>
                <button
                  onClick={() => { setShowDeleteConfirm(false); onRemove(); }}
                  className="px-1.5 py-0.5 text-[9px] font-black rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-1.5 py-0.5 text-[9px] font-black rounded bg-white/[0.06] text-white/40 border border-white/10 hover:text-white/70 transition-colors"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded hover:bg-rose-500/15 text-white/25 hover:text-rose-400 transition-all"
                title="Xóa act (scenes sẽ trở thành chưa phân nhóm)"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Divider line with act color */}
      <div
        className="h-px mx-1 mb-2 opacity-30"
        style={{ backgroundColor: dotColor }}
      />

      {/* Scenes — collapsible */}
      <AnimatePresence initial={false}>
        {!act.collapsed && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <Reorder.Group
              axis="y"
              values={scenes}
              onReorder={onReorderScenes}
              className="space-y-3"
            >
              {children}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!act.collapsed && scenes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-4 border border-dashed rounded-xl mx-1 mb-1"
          style={{ borderColor: `${dotColor}30` }}
        >
          <span className="text-[10px] font-medium opacity-40" style={{ color: dotColor }}>
            Chưa có cảnh nào — kéo cảnh vào đây
          </span>
        </motion.div>
      )}
    </div>
  );
};

// ── Unassigned group (scenes without actId) ──────────────────────────────────
interface UnassignedGroupProps {
  scenes: Scene[];
  onReorderScenes: (reordered: Scene[]) => void;
  children: React.ReactNode;
}

export const UnassignedGroup: React.FC<UnassignedGroupProps> = ({
  scenes,
  onReorderScenes,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (scenes.length === 0) return null;

  return (
    <div className="mb-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 py-1 select-none">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center justify-center w-5 h-5 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all shrink-0"
        >
          <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.2 }} className="flex">
            <ChevronDown size={13} />
          </motion.span>
        </button>
        <span className="w-2.5 h-2.5 rounded-full bg-white/20 shrink-0 ring-1 ring-white/10" />
        <span className="flex-1 text-[11px] font-semibold text-white/30 truncate">Chưa phân nhóm</span>
        <span className="shrink-0 text-[9px] font-black text-white/20 tabular-nums">{scenes.length} cảnh</span>
      </div>

      <div className="h-px mx-1 mb-2 bg-white/10 opacity-40" />

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="unassigned"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <Reorder.Group axis="y" values={scenes} onReorder={onReorderScenes} className="space-y-3">
              {children}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
