import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FolderOpen, Plus, Trash2, Check, Pencil } from 'lucide-react';
import { ProjectMeta } from '../../hooks/useProjectManager';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  projects: ProjectMeta[];
  activeProjectId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmtDate = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

// ─── Component ────────────────────────────────────────────────────────────────
export const ProjectSwitcher: React.FC<Props> = ({
  projects,
  activeProjectId,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const newNameInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setRenamingId(null);
        setConfirmDeleteId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Focus rename input ────────────────────────────────────────────────────
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // ── Focus new-name input ──────────────────────────────────────────────────
  useEffect(() => {
    if (creating && newNameInputRef.current) {
      newNameInputRef.current.focus();
    }
  }, [creating]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const startRename = useCallback((id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentName);
    setConfirmDeleteId(null);
  }, []);

  const commitRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }, [renamingId, renameValue, onRename]);

  const handleRenameKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') setRenamingId(null);
    },
    [commitRename],
  );

  const startCreate = useCallback(() => {
    setCreating(true);
    setNewName('Kịch bản mới');
    setRenamingId(null);
    setConfirmDeleteId(null);
  }, []);

  const commitCreate = useCallback(() => {
    const name = newName.trim() || 'Kịch bản mới';
    onCreate(name);
    setCreating(false);
    setNewName('');
    setOpen(false);
  }, [newName, onCreate]);

  const handleCreateKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitCreate();
      if (e.key === 'Escape') { setCreating(false); setNewName(''); }
    },
    [commitCreate],
  );

  const handleSwitch = useCallback(
    (id: string) => {
      if (id === activeProjectId) { setOpen(false); return; }
      onSwitch(id);
      setOpen(false);
    },
    [activeProjectId, onSwitch],
  );

  const requestDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  }, []);

  const confirmDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(id);
      setConfirmDeleteId(null);
    },
    [onDelete],
  );

  const cancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors group"
      >
        <FolderOpen size={11} className="shrink-0 text-brand-blue opacity-80" />
        <span className="flex-1 text-left text-[10px] font-semibold text-slate-700 dark:text-white/80 truncate">
          {activeProject?.name ?? 'Chọn kịch bản...'}
        </span>
        <ChevronDown
          size={11}
          className={`shrink-0 text-slate-400 dark:text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1 z-[200] rounded-xl bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.08] shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-black/[0.05] dark:border-white/[0.06]">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">
                Kịch bản
              </span>
            </div>

            {/* Project list */}
            <div className="max-h-[240px] overflow-y-auto no-scrollbar">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => !renamingId && handleSwitch(p.id)}
                  className={`group relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                    p.id === activeProjectId
                      ? 'bg-brand-blue/[0.08] dark:bg-brand-blue/[0.12]'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Active check */}
                  <span className="w-3 shrink-0">
                    {p.id === activeProjectId && (
                      <Check size={10} className="text-brand-blue" />
                    )}
                  </span>

                  {/* Name / rename input */}
                  {renamingId === p.id ? (
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={handleRenameKey}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-[11px] font-medium bg-white dark:bg-white/[0.08] border border-brand-blue/50 rounded px-1.5 py-0.5 outline-none text-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-white truncate leading-tight">
                        {p.name}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-white/30 mt-0.5">
                        {p.sceneCount} cảnh · {fmtDate(p.updatedAt)}
                      </p>
                    </div>
                  )}

                  {/* Action buttons (visible on hover or during confirm) */}
                  {renamingId !== p.id && (
                    <div
                      className={`flex items-center gap-1 transition-opacity ${
                        confirmDeleteId === p.id
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {confirmDeleteId === p.id ? (
                        <>
                          <button
                            onClick={(e) => confirmDelete(p.id, e)}
                            title="Xác nhận xóa"
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            Xóa
                          </button>
                          <button
                            onClick={cancelDelete}
                            title="Hủy"
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/[0.04] dark:bg-white/[0.06] text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => startRename(p.id, p.name, e)}
                            title="Đổi tên"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                          >
                            <Pencil size={9} />
                          </button>
                          {projects.length > 1 && (
                            <button
                              onClick={(e) => requestDelete(p.id, e)}
                              title="Xóa project"
                              className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors hover:bg-red-500/[0.08]"
                            >
                              <Trash2 size={9} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Create new */}
            <div className="border-t border-black/[0.05] dark:border-white/[0.06] p-2">
              {creating ? (
                <div className="flex items-center gap-1.5 px-1">
                  <input
                    ref={newNameInputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleCreateKey}
                    placeholder="Tên kịch bản..."
                    className="flex-1 text-[11px] font-medium bg-white dark:bg-white/[0.08] border border-brand-blue/50 rounded-lg px-2 py-1 outline-none text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20"
                  />
                  <button
                    onClick={commitCreate}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors"
                  >
                    Tạo
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewName(''); }}
                    className="px-1.5 py-1 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={startCreate}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-brand-blue hover:bg-brand-blue/[0.06] dark:hover:bg-brand-blue/[0.1] transition-colors"
                >
                  <Plus size={11} />
                  Tạo kịch bản mới
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
