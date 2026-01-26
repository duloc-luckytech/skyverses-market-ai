
import React from 'react';
import { Settings2, Terminal } from 'lucide-react';

export const EditorHUD: React.FC = () => (
  <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-40">
    <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-8 py-3 rounded-full flex items-center gap-10 shadow-3xl pointer-events-auto">
      <div className="flex items-center gap-3">
         <Settings2 size={16} className="text-gray-500" />
         <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">Optimizer: Active</span>
      </div>
      <div className="w-px h-4 bg-white/10"></div>
      <div className="flex items-center gap-3">
         <Terminal size={16} className="text-gray-500" />
         <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">H100 Node Group</span>
      </div>
    </div>
  </div>
);
