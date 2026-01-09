
import React from 'react';
import { Settings2, Coins, Zap, Key } from 'lucide-react';

interface ResourceControlProps {
  usagePreference: 'credits' | 'key';
  credits: number;
  actionCost: number;
  onSettingsClick: () => void;
}

export const ResourceControl: React.FC<ResourceControlProps> = ({
  usagePreference,
  credits,
  actionCost,
  onSettingsClick
}) => {
  return (
    <div className="flex items-center gap-6 pr-6 border-r border-black/5 dark:border-white/5 shrink-0">
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[7px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-[0.2em] leading-none">
            Node Resource
          </span>
          <div className="flex items-center gap-0.5 text-[7px] font-black text-orange-500 italic">
            <Zap size={7} fill="currentColor" />
            <span>{actionCost} CR</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-xs font-black italic leading-none tracking-tight ${usagePreference === 'key' ? 'text-purple-500' : 'text-pink-600 dark:text-pink-500'}`}>
              {usagePreference === 'key' ? 'PERSONAL KEY' : `${credits.toLocaleString()} CR`}
            </p>
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {usagePreference === 'key' ? 'Unlimited Access' : 'System Balance'}
            </p>
          </div>
          <button 
            onClick={onSettingsClick}
            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md hover:text-brand-blue transition-all shadow-sm active:scale-95"
            title="Configure Resource Node"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
