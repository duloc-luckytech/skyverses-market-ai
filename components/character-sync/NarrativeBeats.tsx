
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, PlusCircle, AlignLeft } from 'lucide-react';
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
    
    const sortedNames = [...activeCharacterNames].sort((a, b) => b.length - a.length);
    const escapedNames = sortedNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedNames.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      const isMatch = sortedNames.some(name => name === part.toUpperCase());
      return isMatch ? (
        <span key={i} className="bg-brand-blue/30 text-brand-blue font-black rounded-sm px-0.5">{part}</span>
      ) : <span key={i}>{part}</span>;
    });
  };

  const sharedTextStyles: React.CSSProperties = {
    lineHeight: '1.6',
    letterSpacing: '-0.025em', 
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px', 
    padding: '16px',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    fontWeight: '700',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  return (
    <div className="flex-grow overflow-y-auto p-5 md:p-6 space-y-4 no-scrollbar pb-10">
      <div className="flex items-center gap-3 px-1 mb-2">
         <div className="p-1.5 bg-brand-blue/10 rounded-lg text-brand-blue">
            <AlignLeft size={16} />
         </div>
         <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Kịch bản</h3>
      </div>

      {sequences.map((seq, idx) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={seq.id} className="bg-white dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-xl p-4 space-y-3 group transition-all shadow-sm">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-brand-blue italic">PROMPT_0{idx + 1}</span>
                <div className="h-px w-6 bg-black/5 dark:border-white/5"></div>
             </div>
             <button onClick={() => removeSequence(seq.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
          </div>
          
          <div className="relative rounded-lg overflow-hidden border border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/20 min-h-[120px]">
            <textarea 
              value={seq.text} 
              spellCheck={false}
              onChange={(e) => setSequences(prev => prev.map(s => s.id === seq.id ? { ...s, text: e.target.value } : s))}
              placeholder="Nhập diễn biến kịch bản..."
              className="w-full bg-transparent rounded-lg focus:outline-none transition-all min-h-[120px] caret-brand-blue relative z-10 placeholder:text-slate-400 dark:placeholder:text-gray-600 resize-none overflow-hidden"
              style={{ 
                ...sharedTextStyles,
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            />

            <div 
              className="absolute inset-0 pointer-events-none text-slate-900 dark:text-slate-100 z-20" 
              style={sharedTextStyles}
            >
              {renderHighlightedPrompt(seq.text)}
            </div>
          </div>
        </motion.div>
      ))}
      <button onClick={addSequence} className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 flex items-center justify-center gap-3 hover:bg-brand-blue/5 hover:text-brand-blue hover:border-brand-blue transition-all">
        <PlusCircle size={18} /> Thêm phân cảnh mới
      </button>
    </div>
  );
};
