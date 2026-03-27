
import React, { useState, useRef } from 'react';
import { Users, HelpCircle, Plus, X, User, Loader2, PenLine, GripVertical } from 'lucide-react';
import { CharacterSlot, MAX_CHARACTERS } from '../../hooks/useCharacterSync';

interface RegistrySectionProps {
  slots: CharacterSlot[];
  updateSlot: (idx: number, updates: Partial<CharacterSlot>) => void;
  removeCharacter: (id: string) => void;
  onAddCharacter: () => void;
  onOpenLibrary: (idx: number) => void;
  onTriggerUpload: (idx: number) => void;
  uploadingIdx: number | null;
  onOpenTutorial: () => void;
  onReorderSlots: (slots: CharacterSlot[]) => void;
}

export const RegistrySection: React.FC<RegistrySectionProps> = ({
  slots, updateSlot, removeCharacter, onAddCharacter, onOpenLibrary, onTriggerUpload, uploadingIdx, onOpenTutorial, onReorderSlots
}) => {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    setDragIdx(idx);
    dragNode.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    // Make drag ghost semi-transparent
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.3';
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIdx === null || dragIdx === idx) return;
    setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;

    const newSlots = [...slots];
    const [dragged] = newSlots.splice(dragIdx, 1);
    newSlots.splice(idx, 0, dragged);
    onReorderSlots(newSlots);
  };

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = '1';
    setDragIdx(null);
    setDragOverIdx(null);
    dragNode.current = null;
  };

  return (
    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.04] space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
          <Users size={10} className="text-purple-400" /> Nhân vật
          <span className="text-[8px] text-purple-500">{slots.length}/{MAX_CHARACTERS}</span>
        </p>
        <button onClick={onOpenTutorial}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-semibold text-purple-500 hover:bg-purple-500/10 rounded-md transition-all">
          <HelpCircle size={9} /> Hướng dẫn
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 snap-x">
        {/* Existing characters */}
        {slots.map((slot, idx) => {
          const isUploading = uploadingIdx === idx;
          const isEditing = editingIdx === idx;
          const isDragOver = dragOverIdx === idx && dragIdx !== idx;
          return (
            <div key={slot.id}
              draggable={!isUploading && !isEditing}
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnter={e => { e.preventDefault(); setDragOverIdx(idx); }}
              onDragLeave={() => { if (dragOverIdx === idx) setDragOverIdx(null); }}
              onDrop={e => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex flex-col gap-1.5 shrink-0 w-[60px] relative group/slot snap-start transition-all ${
                isDragOver ? 'scale-105 ring-2 ring-purple-500/40 rounded-xl' : ''
              } ${dragIdx === idx ? 'opacity-30' : ''}`}
            >
              {/* Drag handle */}
              <div className="absolute -left-0.5 top-1/3 -translate-y-1/2 z-20 opacity-0 group-hover/slot:opacity-60 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical size={10} className="text-purple-400" />
              </div>

              <div onClick={() => !isUploading && onOpenLibrary(idx)}
                className="aspect-[3/4] rounded-xl border-2 border-purple-500/40 shadow-sm transition-all cursor-pointer flex items-center justify-center relative overflow-hidden">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2 size={14} className="text-purple-400 animate-spin" />
                    <span className="text-[6px] font-bold text-purple-400">Syncing</span>
                  </div>
                ) : slot.url ? (
                  <>
                    <img src={slot.url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center">
                      <PenLine size={14} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <User size={12} className="text-purple-400" />
                  </div>
                )}

                {/* Remove button */}
                {!isUploading && (
                  <button onClick={e => { e.stopPropagation(); removeCharacter(slot.id); }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md shadow-lg z-10 lg:opacity-0 lg:group-hover/slot:opacity-100 transition-all active:scale-90">
                    <X size={8} strokeWidth={3} />
                  </button>
                )}
              </div>

              {/* Name input */}
              {isEditing ? (
                <input
                  autoFocus
                  value={slot.name}
                  onChange={e => updateSlot(idx, { name: e.target.value.toUpperCase() })}
                  onBlur={() => setEditingIdx(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingIdx(null); }}
                  disabled={isUploading}
                  className="bg-purple-50 dark:bg-purple-500/10 border border-purple-500/30 rounded-md py-0.5 px-1 text-[8px] font-bold text-center uppercase text-purple-600 dark:text-purple-300 outline-none w-full truncate transition-all"
                  placeholder="TÊN..." />
              ) : (
                <button onClick={() => setEditingIdx(idx)}
                  className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.04] rounded-md py-0.5 px-1 text-[8px] font-bold text-center uppercase text-slate-700 dark:text-white/80 w-full truncate hover:border-purple-500/30 transition-all cursor-text">
                  {slot.name || `NV ${idx + 1}`}
                </button>
              )}
            </div>
          );
        })}

        {/* Add button */}
        {slots.length < MAX_CHARACTERS && (
          <div className="flex flex-col gap-1.5 shrink-0 w-[60px] snap-start">
            <button onClick={onAddCharacter}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer flex items-center justify-center group/add">
              <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600 group-hover/add:text-purple-500 transition-colors">
                <Plus size={18} />
                <span className="text-[7px] font-bold uppercase tracking-wide">Thêm</span>
              </div>
            </button>
            <div className="h-[18px]" />
          </div>
        )}
      </div>

      <p className="text-[7px] text-slate-400 dark:text-slate-500 leading-relaxed px-0.5">
        Kéo thả để sắp xếp thứ tự. Tối đa {MAX_CHARACTERS} nhân vật.
      </p>
    </div>
  );
};
