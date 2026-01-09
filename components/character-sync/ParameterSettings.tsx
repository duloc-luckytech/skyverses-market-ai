
import React from 'react';
import { Monitor, Clock, Maximize2, ChevronDown } from 'lucide-react';

interface ParameterSettingsProps {
  resolution: string;
  setResolution: (val: string) => void;
  availableResolutions: string[];
  aspectRatio: '16:9' | '9:16';
  setAspectRatio: (val: '16:9' | '9:16') => void;
  duration: string;
  setDuration: (val: string) => void;
  availableDurations: string[];
}

export const ParameterSettings: React.FC<ParameterSettingsProps> = ({
  resolution,
  setResolution,
  availableResolutions,
  aspectRatio,
  setAspectRatio,
  duration,
  setDuration,
  availableDurations
}) => {
  const selectClass = "w-full bg-white dark:bg-[#111114] border border-black/5 dark:border-white/10 p-3 rounded text-xs font-black uppercase outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="px-4 py-3 bg-slate-50/50 dark:bg-white/[0.01] border-t border-black/5 dark:border-white/5 transition-colors">
      <div className="grid grid-cols-3 gap-3">
        {/* 1. RATIO SELECTION (DISABLED) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest ml-0.5 italic flex items-center gap-1">
             Tỉ lệ
          </label>
          <div className="relative">
            <select 
              disabled
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
              className={selectClass}
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
          </div>
        </div>

        {/* 2. RESOLUTION SELECTION */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest ml-0.5 italic flex items-center gap-1">
             P.Giải
          </label>
          <div className="relative">
            <select 
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className={selectClass}
            >
              {availableResolutions.map(res => (
                <option key={res} value={res}>{res.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
          </div>
        </div>

        {/* 3. DURATION SELECTION */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest ml-0.5 italic flex items-center gap-1">
             Lượng
          </label>
          <div className="relative">
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={selectClass}
            >
              {availableDurations.map(dur => (
                <option key={dur} value={dur}>{dur.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};
