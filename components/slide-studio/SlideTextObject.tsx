
/**
 * SlideTextObject — a freely-positioned, draggable, resizable rich-text block.
 *
 * States:
 *   idle      → hover shows dashed border
 *   selected  → solid blue border, move/resize/delete handles visible
 *   editing   → contentEditable ON, format bar activates
 *
 * The canvasRef is used to convert px deltas → % for position/size updates.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Trash2, GripHorizontal, Layers } from 'lucide-react';
import { FreeTextBlock } from '../../hooks/useSlideStudio';

type ObjState = 'idle' | 'selected' | 'editing';

interface Props {
  block: FreeTextBlock;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isOnlyBlock: boolean;
  onUpdate: (patch: Partial<FreeTextBlock>) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onActivate: (editEl: HTMLDivElement) => void;
  onDeactivate: () => void;
  forceIdle?: boolean;
}

const SlideTextObject: React.FC<Props> = ({
  block, canvasRef, isOnlyBlock,
  onUpdate, onDelete, onBringForward,
  onActivate, onDeactivate, forceIdle,
}) => {
  const [state, setState] = useState<ObjState>('idle');
  const editRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // ── HTML initialisation (per slide/block) ────────────────────────────────
  const initKey = block.id + '|' + block.html.slice(0, 20);
  useEffect(() => {
    if (!editRef.current) return;
    if (editRef.current.innerHTML !== block.html) {
      editRef.current.innerHTML = block.html;
    }
  // Only re-init on block id change, not on every html update (avoids cursor jump)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]);

  // ── Force idle from parent ───────────────────────────────────────────────
  useEffect(() => {
    if (forceIdle && state !== 'idle') {
      setState('idle');
      editRef.current?.blur();
    }
  }, [forceIdle]); // eslint-disable-line

  // ── Click outside → idle ─────────────────────────────────────────────────
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

  // ── Escape key ───────────────────────────────────────────────────────────
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

  // ── Drag MOVE ────────────────────────────────────────────────────────────
  const handleMoveMouseDown = useCallback((e: React.MouseEvent) => {
    if (state !== 'selected') return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const startCX = e.clientX, startCY = e.clientY;
    const startX = block.x, startY = block.y;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startCX) / cr.width  * 100;
      const dy = (ev.clientY - startCY) / cr.height * 100;
      onUpdate({
        x: Math.max(0, Math.min(100 - block.w, startX + dx)),
        y: Math.max(0, Math.min(92,            startY + dy)),
      });
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, [state, canvasRef, block.x, block.y, block.w, onUpdate]);

  // ── Drag RESIZE (right edge) ──────────────────────────────────────────────
  const handleResizeRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const canvas = canvasRef.current; if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const startCX = e.clientX, startW = block.w;
    const onMove = (ev: MouseEvent) => {
      const dw = (ev.clientX - startCX) / cr.width * 100;
      onUpdate({ w: Math.max(10, Math.min(100 - block.x, startW + dw)) });
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, [canvasRef, block.w, block.x, onUpdate]);

  // ── Block click / double-click ────────────────────────────────────────────
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state === 'idle') setState('selected');
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState('editing');
    if (editRef.current) {
      onActivate(editRef.current);
      setTimeout(() => { editRef.current?.focus(); }, 10);
    }
  };

  // ── Keyboard delete when selected ─────────────────────────────────────────
  useEffect(() => {
    if (state !== 'selected') return;
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isOnlyBlock) {
        e.preventDefault();
        onDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, isOnlyBlock, onDelete]);

  const isSelected = state === 'selected';
  const isEditing  = state === 'editing';
  const isActive   = state !== 'idle';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left:   `${block.x}%`,
        top:    `${block.y}%`,
        width:  `${block.w}%`,
        zIndex: block.zIndex + (isActive ? 1000 : 0),
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="group/obj"
    >
      {/* ── Border ── */}
      <div className={`absolute inset-0 pointer-events-none rounded-md transition-all duration-150 ${
        isEditing  ? 'ring-2 ring-brand-blue shadow-[0_0_0_3px_rgba(0,144,255,0.15)]' :
        isSelected ? 'ring-2 ring-brand-blue/80 ring-dashed' :
        'ring-1 ring-transparent group-hover/obj:ring-white/30 group-hover/obj:ring-dashed'
      }`} />

      {/* ── SELECTED toolbar (top) ── */}
      {isSelected && (
        <div
          className="absolute -top-7 left-0 right-0 flex items-center gap-1 pointer-events-auto"
          onMouseDown={e => e.preventDefault()}
        >
          {/* Move grip */}
          <div
            onMouseDown={handleMoveMouseDown}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-blue text-white text-[9px] font-bold cursor-grab active:cursor-grabbing select-none"
            title="Kéo để di chuyển"
          >
            <GripHorizontal size={10} />
            <span>Di chuyển</span>
          </div>

          <button
            onMouseDown={e => e.preventDefault()}
            onClick={e => { e.stopPropagation(); onBringForward(); }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur text-white text-[9px] font-medium hover:bg-white/20 transition-colors"
            title="Đưa lên trước"
          >
            <Layers size={9} />
          </button>

          {!isOnlyBlock && (
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/80 text-white text-[9px] font-medium hover:bg-red-500 transition-colors"
              title="Xoá block này"
            >
              <Trash2 size={9} />
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
            if (editRef.current) onActivate(editRef.current);
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
          if (!editRef.current) return;
          // Save html update (don't overwrite selection state)
          onUpdate({ html: editRef.current.innerHTML });
        }}
        className={`
          outline-none min-h-[1.5em] w-full
          leading-snug
          ${isEditing ? 'cursor-text' : isSelected ? 'cursor-default' : 'cursor-default'}
        `}
        style={{ wordBreak: 'break-word', userSelect: isEditing ? 'text' : 'none' }}
      />

      {/* ── Resize handle (right) ── */}
      {isSelected && (
        <div
          onMouseDown={handleResizeRight}
          className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-8 rounded-full bg-brand-blue cursor-ew-resize hover:scale-110 transition-transform z-10 flex items-center justify-center"
          title="Kéo để thay đổi chiều rộng"
        >
          <div className="w-0.5 h-4 bg-white/60 rounded-full" />
        </div>
      )}

      {/* ── Edit hint ── */}
      {isSelected && (
        <div className="absolute -bottom-5 left-0 right-0 text-center pointer-events-none">
          <span className="text-[8px] text-white/30">Double-click để chỉnh sửa · Delete để xoá</span>
        </div>
      )}
    </div>
  );
};

export default SlideTextObject;
