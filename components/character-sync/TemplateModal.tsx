
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wand2, ChevronRight } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  desc: string;
  prompt: string;
  actors: { name: string; url: string }[];
}

const TEMPLATES: Template[] = [
  {
    id: 'cyber',
    name: 'Cyberpunk Ronin',
    desc: 'Bối cảnh tương lai, ánh sáng neon và nhân vật Samurai hiện đại.',
    prompt: 'LUNA đang cầm thanh kiếm ánh sáng đứng dưới mưa tại quảng trường Shibuya.',
    actors: [
      { name: 'LUNA', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400' }
    ]
  },
  {
    id: 'fantasy',
    name: 'Medieval Quest',
    desc: 'Thế giới kỳ ảo với hiệp sĩ và lâu đài cổ kính.',
    prompt: 'KAI đang cưỡi ngựa băng qua cánh rừng rậm để tới lâu đài Eldoria.',
    actors: [
      { name: 'KAI', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' }
    ]
  },
  {
    id: 'office',
    name: 'Corporate Story',
    desc: 'Môi trường văn phòng chuyên nghiệp, đàm phán kinh doanh.',
    prompt: 'ANNA đang thuyết trình về chiến lược Skyverses tại phòng họp cao cấp.',
    actors: [
      { name: 'ANNA', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400' }
    ]
  }
];

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: Template) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
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
                <Wand2 size={24} />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white">Thư viện Template</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kịch bản & Nhân vật mẫu</p>
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
                  onClick={() => onApply(tmpl)}
                  className="group bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl p-6 hover:border-brand-blue transition-all cursor-pointer shadow-sm hover:shadow-2xl"
                >
                   <div className="flex gap-4 mb-6">
                      {tmpl.actors.map((a, i) => (
                        <div key={i} className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-white/10 shadow-lg">
                           <img src={a.url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <h4 className="text-lg font-black uppercase tracking-tight italic text-slate-900 dark:text-white">{tmpl.name}</h4>
                         <p className="text-xs text-gray-500 font-medium leading-relaxed">{tmpl.desc}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/5 dark:border-white/5">
                         <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase mb-2">Prompt mẫu:</p>
                         <p className="text-[11px] font-bold italic text-slate-700 dark:text-gray-300 line-clamp-2">"{tmpl.prompt}"</p>
                      </div>
                      <div className="flex justify-end pt-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue group-hover:translate-x-2 transition-transform flex items-center gap-2">
                            Áp dụng ngay <ChevronRight size={14} />
                         </span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </motion.div>
    </div>
  );
};
