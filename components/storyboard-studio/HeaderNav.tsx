import React from 'react';
import { X, Clapperboard, Layers, Settings, LayoutPanelLeft, LucideProps } from 'lucide-react';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onClose: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab, onClose }) => {
  const tabs = [
    { id: 'STORYBOARD', label: 'Board', icon: <Clapperboard size={18} /> },
    { id: 'ASSETS', label: 'Tài sản', icon: <Layers size={18} /> },
    { id: 'SETTINGS', label: 'Cấu hình', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Desktop Header: Giữ nguyên trên màn hình lớn */}
      <div className="hidden lg:flex h-14 border-b border-white/5 items-center justify-between px-6 shrink-0 bg-black/40 backdrop-blur-md z-[160]">
        <div className="flex items-center gap-3">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {/* Added LucideProps cast to fix 'size' property error */}
              {React.cloneElement(tab.icon as React.ReactElement<LucideProps>, { size: 14 })} {tab.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Mobile Top Header: Chỉ hiện nút đóng */}
      <div className="lg:hidden h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40 backdrop-blur-md z-[160]">
        <div className="flex items-center gap-2">
          <LayoutPanelLeft size={16} className="text-brand-blue" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Studio Pro</span>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400">
          <X size={24} />
        </button>
      </div>

      {/* Mobile Bottom Navigation: Tab bar ở dưới */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-[200] px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-brand-blue scale-110' : 'text-gray-500'}`}
          >
            {tab.icon}
            <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};