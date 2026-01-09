
import React, { useEffect } from 'react';
import { X, Maximize2, Zap } from 'lucide-react';
import DemoInterface from './DemoInterface';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'text' | 'image' | 'video' | 'automation';
  title: string;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, type, title }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-brand-gray border border-white/10 shadow-[0_0_100px_rgba(0,144,255,0.2)] flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">
              {title} <span className="text-brand-blue ml-2">// NEURAL_LAB_v4.2</span>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-white transition-colors">
              <Maximize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden flex flex-col bg-[#050505]">
          <DemoInterface type={type} />
        </div>
        
        {/* Footer Info */}
        <div className="px-8 py-4 bg-black border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-600">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-brand-blue" /> LATENCY: 24MS</span>
            <span className="flex items-center gap-2">ENCRYPTION: AES-256</span>
          </div>
          <div className="italic">AUTHORIZED_ACCESS_ONLY</div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
