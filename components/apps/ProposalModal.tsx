
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mail, FileText, MessageSquare, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.96, opacity: 0, y: 10 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#0c0c10] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Success State */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white dark:bg-[#0c0c10] flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">Gửi thành công!</p>
                <p className="text-sm text-slate-400 mt-1">Chúng tôi sẽ phản hồi trong 48 giờ</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Đăng ký Developer</h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-500">Deploy ứng dụng AI vào hệ sinh thái Skyverses</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/10 dark:border-brand-blue/15 rounded-xl">
            <MessageSquare size={16} className="text-brand-blue shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
              Mô tả dự án AI của bạn. Đội ngũ Skyverses sẽ review và phản hồi trong <strong className="text-brand-blue">48 giờ</strong>.
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
              <User size={12} /> Tên / Studio
            </label>
            <input 
              required 
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600" 
              placeholder="VD: Skyverses Team" 
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
              <Mail size={12} /> Email liên hệ
            </label>
            <input 
              required 
              type="email" 
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600" 
              placeholder="name@company.com" 
            />
          </div>

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
              <FileText size={12} /> Tên dự án
            </label>
            <input 
              required 
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600" 
              placeholder="VD: AI Script Engine" 
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
              <MessageSquare size={12} /> Mô tả dự án
            </label>
            <textarea 
              required 
              rows={4}
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white resize-none placeholder:text-slate-300 dark:placeholder:text-gray-600" 
              placeholder="Mô tả giá trị cốt lõi, công nghệ sử dụng, và kịch bản ứng dụng..." 
            />
          </div>
          
          {/* Submit */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-brand-blue/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang gửi...
              </>
            ) : (
              <>
                <Send size={16} /> Gửi đề xuất
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-300 dark:text-gray-600">
            Bằng cách gửi, bạn đồng ý với điều khoản sử dụng của Skyverses
          </p>
        </form>
      </motion.div>
    </div>
  );
};
