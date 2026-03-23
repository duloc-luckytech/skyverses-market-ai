import React from 'react';
import { X } from 'lucide-react';

interface SidebarHeaderProps {
  authorName: string;
  onClose: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ authorName, onClose }) => {
  return (
    <div className="px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-blue-400 flex items-center justify-center text-white text-xs font-bold">
          {(authorName || 'S').charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white">{authorName || 'Skyverses Creator'}</h3>
          <p className="text-[11px] text-slate-400 dark:text-gray-500">Creator</p>
        </div>
      </div>
      <button onClick={onClose} className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
        <X size={18} />
      </button>
    </div>
  );
};

export default SidebarHeader;