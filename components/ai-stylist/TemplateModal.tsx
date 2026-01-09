
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LayoutGrid, Check, Wand2 } from 'lucide-react';

interface StyleTemplate {
  id: string;
  name: string;
  desc: string;
  image: string;
  config: {
    selectedBg: string;
    selectedPose: string;
    selectedOutfit?: string;
    selectedOuterwear?: string;
    selectedTops?: string;
    selectedBottom?: string;
    selectedShoes?: string;
  };
}

const TEMPLATES: StyleTemplate[] = [
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    desc: 'Bối cảnh đường phố tương lai với ánh sáng neon rực rỡ.',
    image: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d1c6db21-738b-4cbd-99af-9b0c4e89c800/public',
    config: {
      selectedBg: 'bg2',
      selectedPose: 'p3',
      selectedOutfit: 'fo4'
    }
  },
  {
    id: 'minimal',
    name: 'Art Gallery Minimal',
    desc: 'Vẻ đẹp tối giản trong không gian triển lãm nghệ thuật.',
    image: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/caeb4fba-0383-4c1f-49e1-cb3d0edb0700/public',
    config: {
      selectedBg: 'bg3',
      selectedPose: 'p4',
      selectedOutfit: 'fo3'
    }
  },
  {
    id: 'urban',
    name: 'Urban Tactical',
    desc: 'Phong cách đường phố mạnh mẽ và năng động.',
    image: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d49b6831-66a8-46c0-10f0-35afc7dd9400/public',
    config: {
      selectedBg: 'bg1',
      selectedPose: 'p1',
      selectedOutfit: 'mo2'
    }
  },
  {
    id: 'luxury',
    name: 'Penthouse Luxury',
    desc: 'Sự sang trọng đỉnh cao trong không gian thượng lưu.',
    image: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/28893f3b-8115-4e32-bfd6-21a7e7f12c00/public',
    config: {
      selectedBg: 'bg5',
      selectedPose: 'p2',
      selectedOutfit: 'fo1'
    }
  }
];

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (config: any) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0c0c0e] rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col max-h-[85vh]"
      >
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue">
                <LayoutGrid size={24} />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white">Thư viện Phong cách</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gợi ý phối đồ & Bối cảnh</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 no-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TEMPLATES.map(tmpl => (
                <div 
                  key={tmpl.id}
                  className="group bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden hover:border-brand-blue transition-all shadow-sm hover:shadow-2xl"
                >
                   <div className="aspect-video relative overflow-hidden">
                      <img src={tmpl.image} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-6">
                         <span className="text-[9px] font-black uppercase text-[#dfff1a] tracking-widest mb-1 block">Style Template</span>
                         <h4 className="text-xl font-black uppercase italic tracking-tighter text-white">{tmpl.name}</h4>
                      </div>
                   </div>
                   <div className="p-6 space-y-4">
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">"{tmpl.desc}"</p>
                      <button 
                        onClick={() => onApply(tmpl.config)}
                        className="w-full py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all"
                      >
                         <Wand2 size={14} /> Sử dụng mẫu này
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-black/40 border-t border-black/5 dark:border-white/5 text-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Hệ thống sẽ tự động cấu hình các thuộc tính phù hợp với phong cách đã chọn.</p>
        </div>
      </motion.div>
    </div>
  );
};
