
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
    { id: 'INFRA', label: 'Hạ tầng', icon: <Cpu size={14}/> }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 p-1 bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-xl mx-auto w-fit mb-12">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as AppCategory)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
            active === tab.id 
            ? 'bg-brand-blue text-white shadow-md' 
            : 'text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
