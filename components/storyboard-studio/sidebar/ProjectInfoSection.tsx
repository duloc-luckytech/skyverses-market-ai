import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check, Film } from 'lucide-react';

interface ProjectInfoSectionProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  totalScenes: number;
  renderedCount: number;
  creditCostEstimate: number;
}

export const ProjectInfoSection: React.FC<ProjectInfoSectionProps> = ({
  projectName,
  onProjectNameChange,
  totalScenes,
  renderedCount,
  creditCostEstimate,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(projectName);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [editing, projectName]);

  const commit = () => {
    onProjectNameChange(draft.trim() || 'Dự án mới');
    setEditing(false);
  };

  const renderPercent = totalScenes > 0
    ? Math.round((renderedCount / totalScenes) * 100)
    : 0;

  return (
    <div className="px-5 py-4 border-b border-white/8 space-y-4">
      {/* Editable project name */}
      <div className="flex items-center gap-2.5 group">
        <Film size={14} className="text-brand-blue shrink-0" />
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 bg-white/10 text-white text-sm font-semibold rounded-lg px-2.5 py-1 outline-none border border-brand-blue/60 focus:border-brand-blue min-w-0"
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-white truncate min-w-0"
            title={projectName}
          >
            {projectName}
          </span>
        )}
        <button
          onClick={() => editing ? commit() : setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white shrink-0 p-1"
        >
          {editing ? <Check size={13} /> : <Pencil size={13} />}
        </button>
      </div>

      {/* Render progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
          <span className="text-white/40">{renderedCount}/{totalScenes} đã render</span>
          <span className="text-brand-blue">{renderPercent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-blue to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${renderPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Credit cost estimate */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Dự tính credits</span>
        <span className="text-xs font-black font-mono text-amber-400">~{creditCostEstimate.toLocaleString()} CR</span>
      </div>
    </div>
  );
};
