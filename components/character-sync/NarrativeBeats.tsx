
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trash2, PlusCircle, PenLine, Scissors } from 'lucide-react';
import { PromptSequence } from '../../hooks/useCharacterSync';

interface NarrativeBeatsProps {
  sequences: PromptSequence[];
  setSequences: React.Dispatch<React.SetStateAction<PromptSequence[]>>;
  addSequence: () => void;
  removeSequence: (id: string) => void;
  activeCharacterNames: string[];
}

export const NarrativeBeats: React.FC<NarrativeBeatsProps> = ({
  sequences, setSequences, addSequence, removeSequence, activeCharacterNames
}) => {
  const renderHighlightedPrompt = (text: string) => {
    if (!activeCharacterNames.length || !text) return text;
    // Filter out empty/too-short names
    const validNames = activeCharacterNames.filter(n => n.trim().length >= 1);
    if (validNames.length === 0) return text;

    const sortedNames = [...validNames].sort((a, b) => b.length - a.length);
    const escapedNames = sortedNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    // Use word boundary (\b) to match exact names only
    const regex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const isMatch = sortedNames.some(name => name === part.toUpperCase());
      return isMatch
        ? <span key={i} className="bg-purple-500/20 text-purple-500 dark:text-purple-400 font-bold rounded px-0.5">{part}</span>
        : <span key={i}>{part}</span>;
    });
  };

  const sharedTextStyles: React.CSSProperties = {
    lineHeight: '1.6',
    fontSize: '11px',
    padding: '8px 10px',
    fontWeight: '500',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  // Auto-split: when text contains blank line separators, split into multiple sequences
  const handleTextChange = useCallback((seqId: string, newText: string) => {
    // Check if pasted text contains double newlines (blank line separator)
    const parts = newText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    if (parts.length > 1) {
      // Auto-split into multiple sequences
      setSequences(prev => {
        const idx = prev.findIndex(s => s.id === seqId);
        if (idx === -1) return prev;

        // Keep sequences before current one
        const before = prev.slice(0, idx);
        // Keep sequences after current one
        const after = prev.slice(idx + 1);

        // Create new sequences from split parts
        const newSeqs: PromptSequence[] = parts.map((text, i) => ({
          id: i === 0 ? seqId : `seq-${Date.now()}-${i}`,
          text,
          duration: prev[idx].duration,
          boundCharacterIds: [],
        }));

        return [...before, ...newSeqs, ...after];
      });
    } else {
      // Normal single-line edit
      setSequences(prev => prev.map(s => s.id === seqId ? { ...s, text: newText } : s));
    }
  }, [setSequences]);

  return (
    <div className="flex-grow overflow-y-auto px-4 py-3 space-y-1.5 no-scrollbar">
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
          <PenLine size={10} className="text-purple-400" /> Kịch bản
          {sequences.length > 1 && <span className="text-[8px] text-purple-500">({sequences.length} cảnh)</span>}
        </p>
        <div className="flex items-center gap-1 text-[7px] text-slate-400 dark:text-slate-500">
          <Scissors size={8} /> Auto-split khi cách dòng trống
        </div>
      </div>

      {sequences.map((seq, idx) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={seq.id}
          className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-xl p-2 space-y-1 group transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-bold text-purple-500">Cảnh {idx + 1}</span>
            <button onClick={() => removeSequence(seq.id)} className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
              <Trash2 size={10} />
            </button>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-slate-200/60 dark:border-white/[0.04] bg-slate-50 dark:bg-black/20 min-h-[48px]">
            <textarea value={seq.text} spellCheck={false}
              onChange={e => handleTextChange(seq.id, e.target.value)}
              placeholder="Nhập diễn biến kịch bản..."
              className="w-full bg-transparent rounded-lg focus:outline-none transition-all min-h-[48px] caret-purple-500 relative z-10 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none overflow-hidden text-slate-800 dark:text-white/80"
              style={{
                ...sharedTextStyles,
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            />
            <div className="absolute inset-0 pointer-events-none text-slate-700 dark:text-slate-200 z-20"
              style={sharedTextStyles}>
              {renderHighlightedPrompt(seq.text)}
            </div>
          </div>
        </motion.div>
      ))}

      <button onClick={addSequence}
        className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-white/[0.04] rounded-xl text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 hover:bg-purple-500/5 hover:text-purple-500 hover:border-purple-500/20 transition-all">
        <PlusCircle size={12} /> Thêm phân cảnh
      </button>
    </div>
  );
};
