
import React from 'react';
import { X, Clapperboard, Layers, Settings } from 'lucide-react';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onClose: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab, onClose }) => {
  return (
    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40 backdrop-blur-md z-[160]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('STORYBOARD')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'STORYBOARD' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Clapperboard size={14} /> Storyboard
          </button>
          <button 
            onClick={() => setActiveTab('ASSETS')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ASSETS' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Layers size={14} /> Tài nguyên
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Settings size={14} /> Thiết lập
          </button>
        </div>
      </div>
      <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
        <X size={20} />
      </button>
    </div>
  );
};
