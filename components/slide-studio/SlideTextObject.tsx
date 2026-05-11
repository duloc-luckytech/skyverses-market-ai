
/**
 * SlideTextObject — Canva-style freely-positioned, resizable rich-text block.
 *
 * States:
 *   idle      → hover shows dashed ring
 *   selected  → solid blue ring + 8 resize handles + floating format bar
 *   editing   → contentEditable active + format bar with full text controls
 *
 * Features:
 *   - 8 resize handles (nw / n / ne / w / e / sw / s / se)
 *   - Drag anywhere on block to move (when selected)
 *   - Floating format bar via createPortal (above or below block)
 *   - Keyboard nudge (Arrow ±1%, Shift+Arrow ±5%)
 *   - Ctrl+C → copy block, Delete/Backspace → delete
 *   - Block-level styles: bgColor, opacity, borderRadius, padding
 *   - Text-level styles: letterSpacing, lineHeight (via CSS on contentEditable)
 */
import React, {
  useRef, useState, useEffect, useCallback, useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Trash2, Layers, Copy, Lock, Unlock, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { FreeTextBlock } from '../../hooks/useSlideStudio';
import SlideFormatBar from './SlideFormatBar';

// ── Types ─────────────────────────────────────────────────────────────────────

type ObjState = 'idle' | 'selected' | 'editing';
type HandleDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const HANDLE_CURSORS: Record<HandleDir, string> = {
  nw: 'nw-resize', n: 'n-resize',  ne: 'ne-resize',
  w:  'w-resize',                   e:  'e-resize',
  sw: 'sw-resize', s: 's-resize',  se: 'se-resize',
};

const HANDLE_S = 8;   // square size px
const HANDLE_O = -4;  // offset (= -HANDLE_S/2) to center on edge

interface HandleDef {
  dir: HandleDir;
  style: React.CSSProperties;
}

const HANDLES: HandleDef[] = [
  { dir: 'nw', style: { top: HANDLE_O, left: HANDLE_O } },
  { dir: 'n',  style: { top: HANDLE_O, left: '50%', transform: 'translateX(-50%)' } },
  { dir: 'ne', style: { top: HANDLE_O, right: HANDLE_O } },
  { dir: 'w',  style: { top: '50%', left: HANDLE_O, transform: 'translateY(-50%)' } },
  { dir: 'e',  style: { top: '50%', right: HANDLE_O, transform: 'translateY(-50%)' } },
  { dir: 'sw', style: { bottom: HANDLE_O, left: HANDLE_O } },
  { dir: 's',  style: { bottom: HANDLE_O, left: '50%', transform: 'translateX(-50%)' } },
  { dir: 'se', style: { bottom: HANDLE_O, right: HANDLE_O } },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  block: FreeTextBlock;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isOnlyBlock: boolean;
  onUpdate: (patch: Partial<FreeTextBlock>) => void;
  onDelete: () => void;
  onBringForward: () => void;
  /** Called when block enters selected/editing — passes block.id */
  onActivate: (id: string) => void;
  onDeactivate: () => void;
  /** Called on Ctrl+C — parent stores copied block */
  onCopy?: (b: FreeTextBlock) => void;
  /** Called on Ctrl+D — parent duplicates block (offset position) */
  onDuplicate?: () => void;
  /** Called on Ctrl+[ — z-index decrease */
  onSendBackward?: () => void;
  forceIdle?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SlideTextObject: React.FC<Props> = ({
  block, canvasRef, isOnlyBlock,
  onUpdate, onDelete, onBringForward,
  onActivate, onDeactivate, onCopy,
  onDuplicate, onSendBackward,
  forceIdle,
}) => {
  const [state, setState] = useState<ObjState>('idle');
  const editRef      = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fbarPos, setFbarPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // ── HTML initialisation (only on block id change to avoid cursor jump) ───────
  useEffect(() => {
    if (!editRef.current) return;
    if (editRef.current.innerHTML !== block.html) {
      editRef.current.innerHTML = block.html;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]);

  // ── Force idle from parent (e.g., another block became active) ───────────────
  useEffect(() => {
    if (forceIdle && state !== 'idle') {
      setState('idle');
      editRef.current?.blur();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceIdle]);

  // ── Click outside → idle ─────────────────────────────────────────────────────
  useEffect(() => {
    if (state === 'idle') return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (containerRef.current?.contains(t)) return;
      if (t.closest('[data-slide-formatbar]')) return;
      setState('idle');
      onDeactivate();
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [state, onDeactivate]);

  // ── Escape key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state === 'idle') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (state === 'editing') {
        setState('selected');
        editRef.current?.blur();
        onDeactivate();
      } else {
        setState('idle');
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [state, onDeactivate]);

  // ── Keyboard shortcuts when selected ─────────────────────────────────────────
  useEffect(() => {
    if (state !== 'selected') return;
    const handler = (e: KeyboardEvent) => {
      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isOnlyBlock) {
        e.preventDefault();
        onDelete();
        return;
      }
      // Ctrl/Cmd+C — copy block
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        onCopy?.({ ...block });
        return;
      }
      // Ctrl/Cmd+D — duplicate block (offset +3% x +3% y)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicate?.();
        return;
      }
      // Ctrl/Cmd+] — bring forward (z-index)
      if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        onBringForward();
        return;
      }
      // Ctrl/Cmd+[ — send backward
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        onSendBackward?.();
        return;
      }
      // Ctrl/Cmd+L — toggle lock
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onUpdate({ locked: !block.locked });
        return;
      }
      // Arrow nudge — disable khi locked
      if (block.locked) return;
      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); onUpdate({ x: Math.max(0, block.x - step) }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onUpdate({ x: Math.min(100 - block.w, block.x + step) }); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); onUpdate({ y: Math.max(0, block.y - step) }); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); onUpdate({ y: Math.min(95, block.y + step) }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, isOnlyBlock, onDelete, onCopy, onDuplicate, onSendBackward, onBringForward, block, onUpdate]);

  // ── Floating format bar position ─────────────────────────────────────────────
  const updateFbarPos = useCallback(() => {
    if (state === 'idle') { setFbarPos(null); return; }
    const canvas = canvasRef.current;
    if (!canvas) { setFbarPos(null); return; }
    const cr   = canvas.getBoundingClientRect();
    const bLeft = cr.left + (block.x / 100) * cr.width;
    const bTop  = cr.top  + (block.y / 100) * cr.height;
    const bW    = (block.w / 100) * cr.width;
    const bH    = block.h
      ? (block.h / 100) * cr.height
      : (containerRef.current?.getBoundingClientRect().height ?? 60);
    const BAR_W = Math.max(360, Math.min(bW + 60, window.innerWidth - 16));
    const BAR_H = 92; // two rows ≈ 92px
    let top = bTop - BAR_H - 10;
    if (top < 60) top = bTop + bH + 10; // flip below block if near top
    const left = Math.max(4, Math.min(bLeft, window.innerWidth - BAR_W - 4));
    setFbarPos({ top, left, width: BAR_W });
  }, [state, canvasRef, block.x, block.y, block.w, block.h]);

  useLayoutEffect(() => {
    updateFbarPos();
    if (state === 'idle') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(updateFbarPos);
    ro.observe(canvas);
    window.addEventListener('resize', updateFbarPos);
    window.addEventListener('scroll', updateFbarPos, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateFbarPos);
      window.removeEventListener('scroll', updateFbarPos, true);
    };
  }, [state, updateFbarPos]);

  // Update bar pos when block is dragged/resized
  useEffect(() => {
    if (state !== 'idle') updateFbarPos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.x, block.y, block.w, block.h]);

  // ── 8-handle resize ───────────────────────────────────────────────────────────
  const handleResize = useCallback((dir: HandleDir, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();

    const startCX = e.clientX;
    const startCY = e.clientY;
    const sx = block.x, sy = block.y, sw = block.w;
    // Get or compute current height
    let sh = block.h;
    if (sh == null) {
      const elH = containerRef.current?.getBoundingClientRect().height ?? 60;
      sh = (elH / cr.height) * 100;
      onUpdate({ h: sh });
    }
    const rightEdge  = sx + sw;
    const bottomEdge = sy + sh;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startCX) / cr.width  * 100;
      const dy = (ev.clientY - startCY) / cr.height * 100;
      const p: Partial<FreeTextBlock> = {};
      // East edge
      if (dir === 'e' || dir === 'ne' || dir === 'se') {
        p.w = Math.max(8, Math.min(100 - sx, sw + dx));
      }
      // West edge (also shifts x so right edge stays fixed)
      if (dir === 'w' || dir === 'nw' || dir === 'sw') {
        const nw = Math.max(8, sw - dx);
        p.w = nw;
        p.x = Math.max(0, rightEdge - nw);
      }
      // South edge
      if (dir === 's' || dir === 'se' || dir === 'sw') {
        p.h = Math.max(4, sh! + dy);
      }
      // North edge (also shifts y so bottom edge stays fixed)
      if (dir === 'n' || dir === 'ne' || dir === 'nw') {
        const nh = Math.max(4, sh! - dy);
        p.h = nh;
        p.y = Math.max(0, bottomEdge - nh);
      }
      onUpdate(p);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [canvasRef, block.x, block.y, block.w, block.h, onUpdate]);

  // ── Drag move with smart-guides snap (Canva-style) ──────────────────────────
  // Snap targets:
  //   - Slide edges: 0, 100 (x and y)
  //   - Slide center: 50 (x and y)
  //   - Block edges/center align với canvas
  // Hold Alt/Option để bypass snap
  const SNAP_THRESHOLD = 1.5; // % canvas — Canva ~6-8px tương đương ~1.5% trên 1000px wide
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (state !== 'selected') return;
    if (block.locked) return; // Lock check
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const sx = block.x, sy = block.y, bw = block.w;
    // Get height (% of canvas) — fallback compute từ DOM
    let bh = block.h;
    if (bh == null) {
      const elH = containerRef.current?.getBoundingClientRect().height ?? 60;
      bh = (elH / cr.height) * 100;
    }
    const scX = e.clientX, scY = e.clientY;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - scX) / cr.width  * 100;
      const dy = (ev.clientY - scY) / cr.height * 100;
      let nx = sx + dx;
      let ny = sy + dy;

      const altBypass = ev.altKey;
      const guidesV: number[] = [];
      const guidesH: number[] = [];

      if (!altBypass) {
        // X-axis snap targets: left edge, center, right edge của block + canvas
        const blockCenterX = nx + bw / 2;
        const blockRightX  = nx + bw;
        // Targets to snap block.left
        const xCandidates: { target: number; type: 'left' | 'center' | 'right' }[] = [
          { target: 0,           type: 'left' },        // canvas left
          { target: 100 - bw,    type: 'right' },       // canvas right (block.right = 100)
          { target: 50 - bw / 2, type: 'center' },      // canvas center (block center = 50)
        ];
        for (const c of xCandidates) {
          if (Math.abs(nx - c.target) < SNAP_THRESHOLD) {
            nx = c.target;
            // Vertical guide line position
            const linePos = c.type === 'left' ? 0 : c.type === 'right' ? 100 : 50;
            guidesV.push(linePos);
            break;
          }
        }
        // Y-axis snap targets
        const blockCenterY = ny + bh! / 2;
        const yCandidates: { target: number; type: 'top' | 'middle' | 'bottom' }[] = [
          { target: 0,            type: 'top' },
          { target: 100 - bh!,    type: 'bottom' },
          { target: 50 - bh! / 2, type: 'middle' },
        ];
        for (const c of yCandidates) {
          if (Math.abs(ny - c.target) < SNAP_THRESHOLD) {
            ny = c.target;
            const linePos = c.type === 'top' ? 0 : c.type === 'bottom' ? 100 : 50;
            guidesH.push(linePos);
            break;
          }
        }

        // Suppress unused vars
        void blockCenterX; void blockRightX; void blockCenterY;
      }

      // Clamp + commit
      nx = Math.max(0, Math.min(100 - bw, nx));
      ny = Math.max(0, Math.min(95, ny));
      onUpdate({ x: nx, y: ny });

      // Dispatch guide lines event cho canvas overlay
      window.dispatchEvent(new CustomEvent('slide-snap-guides', {
        detail: { v: guidesV, h: guidesH },
      }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // Clear guides
      window.dispatchEvent(new CustomEvent('slide-snap-guides', { detail: { v: [], h: [] } }));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [state, canvasRef, block.x, block.y, block.w, block.h, block.locked, onUpdate]);

  // ── Click / double-click ──────────────────────────────────────────────────────
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state === 'idle') setState('selected');
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (block.locked) return; // không edit nếu locked
    setState('editing');
    onActivate(block.id);
    setTimeout(() => editRef.current?.focus(), 10);
  };

  // ── Context menu (right-click) ──
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === 'idle') setState('selected');
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };
  // Close context menu on any click outside / escape
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setCtxMenu(null); };
    setTimeout(() => {
      document.addEventListener('mousedown', close);
      document.addEventListener('keydown', esc);
    }, 0);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [ctxMenu]);

  const isSelected = state === 'selected';
  const isEditing  = state === 'editing';
  const isActive   = state !== 'idle';
  const isLocked   = !!block.locked;

  // ── Container inline styles ───────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    position:     'absolute',
    left:         `${block.x}%`,
    top:          `${block.y}%`,
    width:        `${block.w}%`,
    ...(block.h != null ? { height: `${block.h}%` } : {}),
    zIndex:       block.zIndex + (isActive ? 1000 : 0),
    opacity:      block.opacity ?? 1,
    background:   block.bgColor ?? 'transparent',
    borderRadius: block.borderRadius ? `${block.borderRadius}px` : 0,
    padding:      block.padding ? `${block.padding}px` : undefined,
    boxSizing:    'border-box',
    cursor:       isLocked ? 'not-allowed' : (isSelected ? 'move' : 'default'),
  };

  return (
    <>
      {/* ── Block container ── */}
      <motion.div
        ref={containerRef}
        style={containerStyle}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: containerStyle.opacity ?? 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={isSelected && !isLocked ? handleDragStart : undefined}
        className="group/obj"
      >
        {/* Selection ring */}
        <div
          style={{ borderRadius: 'inherit' }}
          className={`absolute inset-0 pointer-events-none transition-all duration-100 ${
            isEditing  ? 'ring-2 ring-brand-blue shadow-[0_0_0_4px_rgba(201, 168, 76,0.18)]' :
            isSelected ? 'ring-2 ring-brand-blue/90' :
                         'ring-1 ring-transparent group-hover/obj:ring-white/40 group-hover/obj:ring-dashed'
          }`}
        />

        {/* ── 8 resize handles (ẩn khi locked) ── */}
        {isSelected && !isLocked && HANDLES.map(h => (
          <div
            key={h.dir}
            onMouseDown={e => handleResize(h.dir, e)}
            style={{
              position: 'absolute',
              width:     HANDLE_S,
              height:    HANDLE_S,
              cursor:    HANDLE_CURSORS[h.dir],
              zIndex:    20,
              ...h.style,
            }}
            className="bg-white border-[1.5px] border-brand-blue rounded-[2px] shadow-md hover:scale-125 transition-transform"
          />
        ))}

        {/* ── Lock indicator ── khi locked, hiển thị padlock góc trên phải */}
        {isLocked && (
          <div className="absolute -top-2 -right-2 z-30 px-1.5 py-1 rounded-full bg-amber-500/90 text-white shadow-md flex items-center gap-1 text-[9px] font-bold pointer-events-none">
            <Lock size={9} fill="currentColor" />
          </div>
        )}

        {/* ── Quick-action pills (appear above block when selected) ── */}
        {isSelected && (
          <div
            className="absolute -top-7 left-0 flex items-center gap-1 pointer-events-auto"
            onMouseDown={e => e.preventDefault()}
          >
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={e => { e.stopPropagation(); onCopy?.({ ...block }); }}
              title="Copy block (Ctrl+C)"
              className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-white text-[9px] font-medium hover:bg-black/80 transition-colors flex items-center gap-1"
            >
              <Copy size={8} />
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={e => { e.stopPropagation(); onBringForward(); }}
              title="Đưa lên trước"
              className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-white text-[9px] font-medium hover:bg-black/80 transition-colors flex items-center gap-1"
            >
              <Layers size={8} />
            </button>
            {!isOnlyBlock && (
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={e => { e.stopPropagation(); onDelete(); }}
                title="Xóa (Delete)"
                className="px-2 py-0.5 rounded-md bg-red-500/80 backdrop-blur text-white text-[9px] font-medium hover:bg-red-500 transition-colors ml-1 flex items-center gap-1"
              >
                <Trash2 size={8} />
              </button>
            )}
          </div>
        )}

        {/* ── ContentEditable ── */}
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onFocus={() => {
            if (state !== 'editing') {
              setState('editing');
              onActivate(block.id);
            }
          }}
          onBlur={(e) => {
            const rel = e.relatedTarget as HTMLElement | null;
            if (rel?.closest('[data-slide-formatbar]')) return;
            setTimeout(() => {
              const active = document.activeElement as HTMLElement | null;
              if (active?.closest('[data-slide-formatbar]')) return;
              if (editRef.current?.contains(active)) return;
              setState(prev => prev === 'editing' ? 'selected' : prev);
              onDeactivate();
            }, 200);
          }}
          onInput={() => {
            if (editRef.current) onUpdate({ html: editRef.current.innerHTML });
          }}
          style={{
            letterSpacing: block.letterSpacing != null ? `${block.letterSpacing}px` : undefined,
            lineHeight:    block.lineHeight    != null ? block.lineHeight            : undefined,
            userSelect:    isEditing ? 'text' : 'none',
            overflow:      block.h != null ? 'hidden' : 'visible',
            wordBreak:     'break-word',
          }}
          className="outline-none min-h-[1.5em] w-full leading-snug"
        />

        {/* Hint text below block when selected */}
        {isSelected && (
          <div className="absolute -bottom-5 left-0 right-0 text-center pointer-events-none">
            <span className="text-[8px] text-white/30 select-none">
              Double-click chỉnh · Kéo để di chuyển · Delete xóa · Arrows di chuyển
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Floating format bar (portal, anchored above/below block) ── */}
      {isActive && fbarPos && typeof document !== 'undefined' && createPortal(
        <div
          data-slide-formatbar="true"
          style={{
            position: 'fixed',
            top:      fbarPos.top,
            left:     fbarPos.left,
            width:    fbarPos.width,
            zIndex:   99999,
          }}
        >
          <SlideFormatBar
            activeRef={editRef as React.RefObject<HTMLDivElement>}
            textEditing={isEditing}
            block={block}
            onBlockUpdate={onUpdate}
          />
        </div>,
        document.body,
      )}

      {/* ── Right-click context menu ── */}
      {ctxMenu && createPortal(
        <div
          className="fixed z-[99999] min-w-[180px] py-1 rounded-xl bg-white dark:bg-[var(--atlas-bg-panel)] border border-black/[0.08] dark:border-white/[0.1] shadow-atlas-lg"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
          onMouseDown={e => e.stopPropagation()}
          onContextMenu={e => e.preventDefault()}
        >
          <button
            onClick={() => { onDuplicate?.(); setCtxMenu(null); }}
            disabled={!onDuplicate}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-40"
          >
            <Copy size={11} /> Nhân bản <span className="ml-auto text-[10px] text-slate-400">⌘D</span>
          </button>
          <button
            onClick={() => { onBringForward(); setCtxMenu(null); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            <ArrowUpToLine size={11} /> Đưa lên trước <span className="ml-auto text-[10px] text-slate-400">⌘]</span>
          </button>
          <button
            onClick={() => { onSendBackward?.(); setCtxMenu(null); }}
            disabled={!onSendBackward}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-40"
          >
            <ArrowDownToLine size={11} /> Đưa xuống sau <span className="ml-auto text-[10px] text-slate-400">⌘[</span>
          </button>
          <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />
          <button
            onClick={() => { onUpdate({ locked: !isLocked }); setCtxMenu(null); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            {isLocked ? <Unlock size={11} /> : <Lock size={11} />}
            {isLocked ? 'Mở khoá' : 'Khoá'} <span className="ml-auto text-[10px] text-slate-400">⌘L</span>
          </button>
          {!isOnlyBlock && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />
              <button
                onClick={() => { onDelete(); setCtxMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 size={11} /> Xoá <span className="ml-auto text-[10px] text-rose-400/70">Del</span>
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

export default SlideTextObject;
