
import React from 'react';
import { ShieldCheck, Download, Edit3, Maximize2, Share2 } from 'lucide-react';
import { RESTORATION_PRESETS, RestoreJob } from '../../hooks/useRestoration';

interface Props {
  selectedPresetId: string;
  onPresetChange: (id: string) => void;
  activeJob: RestoreJob | undefined;
  onDownload: (url: string) => void;
  onEdit: (url: string) => void;
}

export const RestorationControls: React.FC<Props> = ({ 
  selectedPresetId, onPresetChange, activeJob, onDownload, onEdit 
}) => {
  return (
    <aside className="w-[340px] border-l border-slate-100 dark:border-white/5 flex flex-col shrink-0 bg-white dark:bg-[#0c0c0e] transition-colors p-8 space-y-8">
      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Kịch bản phục chế</label>
        <div className="space-y-3">
          {RESTORATION_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${selectedPresetId === preset.id ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600' : 'border-black/5 dark:border-white/5 hover:border-black/10 text-gray-500'}`}
            >
              <p className="text-[11px] font-black uppercase tracking-tight">{preset.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Removed Safe_Uplink and other action buttons per request */}
    </aside>
  );
};
