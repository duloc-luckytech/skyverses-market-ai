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
    <div className="space-y-4">
       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2 italic flex items-center gap-2">
         {icon} {label}
       </label>
       <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-white/[0.01] border border-black/5 rounded-2xl shadow-inner min-h-[50px]">
          {items.map((item: string, i: number) => (
             <span key={i} className="px-2 py-1 bg-white dark:bg-white/5 border border-black/5 rounded text-[8px] font-black uppercase text-slate-600 dark:text-gray-400 flex items-center gap-2 group/tag">
                {item}
                <X 
                  size={10} 
                  className="cursor-pointer hover:text-red-500 opacity-40 group-hover/tag:opacity-100 transition-opacity" 
                  onClick={() => onRemove(listKey, i)} 
                />
             </span>
          ))}
          <div className="flex items-center gap-2 flex-grow">
             <input 
               value={val} 
               onChange={e => setVal(e.target.value)} 
               onKeyDown={e => e.key === 'Enter' && (onAdd(listKey, val), setVal(''))} 
               className="bg-transparent border-none outline-none text-[10px] font-bold w-full italic" 
               placeholder="Thêm thông tin..." 
             />
          </div>
       </div>
    </div>
  );
};
