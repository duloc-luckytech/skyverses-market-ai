import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface EditArrayProps {
  label: string;
  items: string[];
  listKey: string;
  onAdd: (listKey: string, value: string) => void;
  onRemove: (listKey: string, index: number) => void;
  icon: React.ReactNode;
}

export const EditArray: React.FC<EditArrayProps> = ({ label, items, onAdd, onRemove, icon, listKey }) => {
  const [val, setVal] = useState('');

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-semibold text-slate-400 dark:text-gray-500 tracking-wide flex items-center gap-1.5">
        {icon} {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-50 dark:bg-white/[0.01] border border-black/[0.05] dark:border-white/[0.05] rounded-lg min-h-[42px]">
        {items.map((item: string, i: number) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] rounded-md text-[10px] font-medium text-slate-600 dark:text-gray-400 group/tag hover:border-red-500/20 transition-colors">
            {item}
            <X
              size={10}
              className="cursor-pointer text-slate-300 hover:text-red-500 opacity-60 group-hover/tag:opacity-100 transition-all"
              onClick={() => onRemove(listKey, i)}
            />
          </span>
        ))}
        <div className="flex items-center gap-1.5 flex-grow min-w-[100px]">
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { onAdd(listKey, val); setVal(''); }
            }}
            className="bg-transparent border-none outline-none text-[11px] font-medium w-full text-slate-600 dark:text-gray-400 placeholder:text-slate-300 dark:placeholder:text-gray-700"
            placeholder="Nhập và Enter..."
          />
        </div>
      </div>
    </div>
  );
};
