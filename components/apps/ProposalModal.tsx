
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Info, ArrowRight } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col transition-colors"
      >
        <div className="p-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg"><Plus size={20} strokeWidth={3} /></div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Developer Proposal</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-10 space-y-8 no-scrollbar">
          <div className="p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex gap-6 items-start">
            <Info className="text-brand-blue shrink-0 mt-1" size={20} />
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase leading-relaxed italic">
              Chia sẻ giải pháp hoặc ý tưởng tích hợp của bạn. Node_Admin sẽ phản hồi trong 48 giờ.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Đã gửi thông tin đăng ký thành công."); onClose(); }}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Identity (Name/Studio)</label>
              <input required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white shadow-inner" placeholder="VD: Skyverses Team" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Communication Link (Email)</label>
              <input required type="email" className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white shadow-inner" placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Node Project Title</label>
              <input required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white shadow-inner" placeholder="VD: Cinematic AI Script Engine" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Architecture Details</label>
              <textarea required className="w-full h-32 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-medium outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white resize-none shadow-inner" placeholder="Mô tả giá trị cốt lõi và kịch bản sử dụng..." />
            </div>
            
            <div className="pt-4">
              <button type="submit" className="w-full py-5 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span>Submit Architecture</span> <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
