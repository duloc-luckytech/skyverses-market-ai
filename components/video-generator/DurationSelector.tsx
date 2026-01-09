
import React from 'react';

interface DurationSelectorProps {
  value: string;
  onClick: () => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({ value, onClick }) => {
  return (
    <div className="space-y-1.5 text-center">
      <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600">
        Lượng
      </p>
      <button 
        onClick={onClick} 
        className="w-full py-2 border rounded-sm text-[8px] font-black uppercase transition-all bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-blue"
      >
        {value}
      </button>
    </div>
  );
};
