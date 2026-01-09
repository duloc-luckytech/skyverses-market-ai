import React from 'react';
import { Info, Cpu, Zap, Maximize2, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TechnicalSpecsProps {
  modelKey?: string;
  engine?: string;
  resolution?: string;
  seed?: number;
  createdAt?: string;
}

const TechnicalSpecs: React.FC<TechnicalSpecsProps> = ({ modelKey, engine, resolution, seed, createdAt }) => {
  const { t } = useLanguage();
  const specs = [
    { label: 'Model AI', val: modelKey || 'Gemini 3 Pro', icon: <Cpu size={12}/> },
    { label: t('settings.compute.performance'), val: engine || 'Skyverses Cluster', icon: <Zap size={12}/> },
    { label: 'Độ phân giải', val: resolution || '1080p (Native)', icon: <Maximize2 size={12}/> },
    { label: 'Created', val: createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'Mới đây', icon: <Calendar size={12}/> }
  ];

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-3 px-1">
        <Info size={14} className="text-brand-blue" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-gray-500">{t('explorer.modal.specs')}</h4>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {specs.map(spec => (
          <div key={spec.label} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-3">
               {spec.icon} {spec.label}
            </span>
            <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight italic">{spec.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalSpecs;