import React from 'react';
import { Cpu, Zap, Maximize2, Calendar } from 'lucide-react';
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
    { label: 'Model', val: (modelKey || 'Gemini 3 Pro').replace(/_/g, ' '), icon: <Cpu size={13} /> },
    { label: 'Engine', val: engine || 'Skyverses Cluster', icon: <Zap size={13} /> },
    { label: 'Resolution', val: resolution || '1080p', icon: <Maximize2 size={13} /> },
    { label: 'Created', val: createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'Mới đây', icon: <Calendar size={13} /> }
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-slate-400 dark:text-gray-500 px-1">{t('explorer.modal.specs')}</h4>
      <div className="grid grid-cols-2 gap-2">
        {specs.map(spec => (
          <div key={spec.label} className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-500 mb-1">
              {spec.icon}
              <span className="text-[11px] font-medium">{spec.label}</span>
            </div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-white truncate">{spec.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalSpecs;