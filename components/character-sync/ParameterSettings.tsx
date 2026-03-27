
import React from 'react';
import { Ratio, MonitorUp, Timer, ChevronDown } from 'lucide-react';

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
  resolution, setResolution, availableResolutions,
  aspectRatio, setAspectRatio,
  duration, setDuration, availableDurations
}) => {
  const selectClass = "w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] px-2 py-1.5 rounded-lg text-[11px] font-medium outline-none appearance-none focus:border-purple-500/40 transition-all cursor-pointer text-slate-700 dark:text-white/80 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/[0.04]">
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <p className="text-[8px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1">
            <Ratio size={9} className="text-emerald-400" /> Tỷ lệ
          </p>
          <div className="relative">
            <select disabled value={aspectRatio} onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')} className={selectClass}>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={9} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[8px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1">
            <MonitorUp size={9} className="text-blue-400" /> P.Giải
          </p>
          <div className="relative">
            <select value={resolution} onChange={e => setResolution(e.target.value)} className={selectClass}>
              {availableResolutions.map(res => <option key={res} value={res}>{res.toUpperCase()}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={9} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[8px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1">
            <Timer size={9} className="text-amber-400" /> Lượng
          </p>
          <div className="relative">
            <select value={duration} onChange={e => setDuration(e.target.value)} className={selectClass}>
              {availableDurations.map(dur => <option key={dur} value={dur}>{dur.toUpperCase()}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={9} />
          </div>
        </div>
      </div>
    </div>
  );
};
