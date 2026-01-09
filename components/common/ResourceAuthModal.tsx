import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Coins, Key, Lock, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResourceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pref: 'credits' | 'key') => void;
  hasPersonalKey: boolean;
  totalCost?: number;
}

const ResourceAuthModal: React.FC<ResourceAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  hasPersonalKey,
  totalCost = 150
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="max-w-xl w-full bg-white dark:bg-[#111114] p-10 border border-slate-200 dark:border-white/10 rounded-[2rem] space-y-8 shadow-3xl transition-colors"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto text-brand-blue shadow-[0_0_30px_rgba(0,144,255,0.2)]">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Xác thực tài nguyên</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 font-medium uppercase tracking-tight">
                Vui lòng chọn phương thức thanh toán tài nguyên cho chu trình này. Lựa chọn của bạn sẽ được ghi nhớ.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Credits */}
              <button 
                onClick={() => onConfirm('credits')}
                className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                  <Coins size={24} fill="currentColor" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Dùng Credits</p>
                  <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase mt-1">Chi phí: {totalCost} CR</p>
                </div>
              </button>

              {/* Option 2: Personal Key */}
              <button 
                onClick={() => hasPersonalKey && onConfirm('key')}
                disabled={!hasPersonalKey}
                className={`flex flex-col items-center justify-center gap-4 p-8 border rounded-2xl transition-all group ${hasPersonalKey ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-500/40 hover:bg-purple-500/[0.02] cursor-pointer' : 'bg-black/5 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 opacity-40 cursor-not-allowed'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${hasPersonalKey ? 'bg-purple-500/10 text-purple-600 group-hover:scale-110' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                  <Key size={24} />
                </div>
                <div className="text-center">
                  <p className={`text-[11px] font-black uppercase tracking-widest ${hasPersonalKey ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {hasPersonalKey ? 'Dùng API Key' : 'Key chưa thiết lập'}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase mt-1">Free (Dùng Key của bạn)</p>
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-6 text-[8px] font-black text-slate-300 dark:text-gray-700 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Lock size={10}/> Zero Knowledge</span>
                <span className="flex items-center gap-2"><Key size={10}/> BYOK Ready</span>
              </div>
              
              {!hasPersonalKey && (
                <button 
                  onClick={() => navigate('/settings')} 
                  className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase hover:underline"
                >
                  Thiết lập API Key ngay <ExternalLink size={10} />
                </button>
              )}
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResourceAuthModal;