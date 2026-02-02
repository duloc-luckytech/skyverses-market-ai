
import React from 'react';
import { LayoutGrid, Sparkles, Workflow, Cpu } from 'lucide-react';
import { AppCategory } from '../../hooks/useAppsPage';

interface CategoryTabsProps {
  active: AppCategory;
  onChange: (val: AppCategory) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ active, onChange }) => {
  const tabs = [
    { id: 'ALL', label: 'Tất cả', icon: <LayoutGrid size={14}/> },
    { id: 'CREATIVE', label: 'AI Sáng tạo', icon: <Sparkles size={14}/> },
    { id: 'AUTOMATION', label: 'Tự động hóa', icon: <Workflow size={14}/> },
    { id: 'INFRA', label: 'Hạ tầng / Dev', icon: <Cpu size={14}/> }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2.5rem] md:rounded-full shadow-inner mx-auto w-fit mb-20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as AppCategory)}
          className={`flex items-center gap-3 px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
            active === tab.id 
            ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl scale-[1.05] border border-black/5 dark:border-white/10' 
            : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
