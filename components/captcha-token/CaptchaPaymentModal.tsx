import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Check, Loader2, ShieldCheck, 
  Clock, Landmark, Copy, Smartphone,
  Info, Sparkles, BadgeCheck
} from 'lucide-react';
import { CaptchaPaymentData } from '../../hooks/useCaptchaToken';
import { useToast } from '../../context/ToastContext';

interface CaptchaPaymentModalProps {
  paymentData: CaptchaPaymentData | null;
  onClose: () => void;
  onPollStatus: (txId: string) => Promise<string>;
}

export const CaptchaPaymentModal: React.FC<CaptchaPaymentModalProps> = ({ 
  paymentData, onClose, onPollStatus 
}) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [timer, setTimer] = useState(900); // 15 minutes
  const [isCopied, setIsCopied] = useState(false);
  const pollingRef = useRef<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (paymentData && timer > 0 && status === 'IDLE') {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [paymentData, timer, status]);

  // Ngừng polling khi component unmount
  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  const handleCopy = (text: string, section?: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Đã sao chép ${section || "nội dung chuyển khoản"}`, "info");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmPaid = async () => {
    if (!paymentData || status === 'VERIFYING') return;
    
    setStatus('VERIFYING');
    pollingRef.current = true;
    
    const startPolling = async () => {
      if (!pollingRef.current) return;

      try {
        const result = await onPollStatus(paymentData.transactionId);
        const normalizedStatus = result?.toUpperCase();
        
        if (normalizedStatus === 'SUCCESS') {
          setStatus('SUCCESS');
          pollingRef.current = false;
          showToast("Nạp Token thành công!", "success");
          setTimeout(onClose, 2500);
        } else if (normalizedStatus === 'FAILED' || normalizedStatus === 'ERROR') {
          setStatus('FAILED');
          pollingRef.current = false;
          showToast("Giao dịch thất bại hoặc đã bị hủy.", "error");
          setTimeout(() => setStatus('IDLE'), 3000);
        } else {
          // Trạng thái là 'PENDING' hoặc chưa xác định
          // Cứ tiếp tục poll và giữ nút ở trạng thái VERIFYING (loading)
          if (pollingRef.current) {
            setTimeout(startPolling, 5000);
          }
        }
      } catch (err) {
        console.error("Polling execution error:", err);
        // Trong trường hợp lỗi mạng, vẫn tiếp tục poll sau khoảng thời gian dài hơn
        if (pollingRef.current) {
          setTimeout(startPolling, 10000);
        }
      }
    };

    startPolling();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!paymentData) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={() => {
          if (status !== 'VERIFYING') {
            pollingRef.current = false;
            onClose();
          }
        }}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0c0c0e] rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-3xl overflow-hidden flex flex-col md:flex-row transition-all duration-500"
      >
        {/* Left Column: Summary */}
        <div className="w-full md:w-[320px] bg-slate-50 dark:bg-black/40 p-10 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 flex flex-col shrink-0">
           <div className="space-y-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl">
                    <Zap size={20} fill="currentColor" />
                 </div>
                 <h2 className="text-xl font-black uppercase italic tracking-tighter">Uplink Payment</h2>
              </div>

              <div className="p-6 bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl space-y-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">Gói nâng cấp</p>
                    <h3 className="text-lg font-black text-indigo-600 uppercase italic">{paymentData.plan.name}</h3>
                 </div>
                 <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-400">Hạn ngạch</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white italic">{paymentData.plan.quota.toLocaleString()} Tokens</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-orange-500">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Thời gian còn lại: <span className="text-sm">{formatTime(timer)}</span></span>
                 </div>
                 <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed italic">
                    "Vui lòng hoàn tất chuyển khoản trước khi bộ đếm thời gian kết thúc để đảm bảo giao dịch được xử lý tự động."
                 </p>
              </div>
           </div>

           <div className="mt-auto pt-10">
              <div className="flex items-center gap-3 text-emerald-500">
                 <ShieldCheck size={20} />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Encrypted Secure Node</span>
              </div>
           </div>
        </div>

        {/* Right Column: QR & Transfer Info */}
        <div className="flex-grow p-8 lg:p-12 space-y-8 relative overflow-hidden bg-white dark:bg-[#0c0c0e]">
           <button 
             onClick={() => { 
               if (status !== 'VERIFYING') {
                 pollingRef.current = false; 
                 onClose(); 
               }
             }} 
             className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-colors z-[110]"
           >
              <X size={24} />
           </button>

           <AnimatePresence mode="wait">
              {status === 'SUCCESS' ? (
                 <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center h-full space-y-6">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl">
                       <BadgeCheck size={56} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Nạp thành công</h3>
                       <p className="text-sm text-gray-500">Tokens đã được cộng vào tài khoản của bạn.</p>
                    </div>
                 </motion.div>
              ) : (
                 <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                       {/* QR AREA */}
                       <div className="relative group p-6 bg-white border border-black/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all hover:scale-[1.02] max-w-[240px] mx-auto lg:mx-0">
                          {status === 'VERIFYING' && (
                             <div className="absolute inset-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                                <Loader2 size={32} className="text-indigo-600 animate-spin" />
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-600 animate-pulse">Đang kiểm tra...</p>
                             </div>
                          )}
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=vietqr://payment?bank=${paymentData.bank.bankName}&account=${paymentData.bank.accountNumber}&amount=${paymentData.amount}&memo=${paymentData.transferContent}`}
                            className={`w-full aspect-square transition-all duration-700 ${status === 'VERIFYING' ? 'blur-md opacity-20' : ''}`}
                            alt="Payment QR"
                          />
                          <div className="mt-4 pt-4 border-t border-black/5 text-center">
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">QUÉT MÃ ĐỂ THANH TOÁN NHANH</p>
                          </div>
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_3s_infinite_linear] pointer-events-none"></div>
                       </div>

                       {/* INFO AREA */}
                       <div className="space-y-6">
                          <div className="p-6 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-2xl space-y-4">
                             <div className="flex items-center gap-3 mb-2">
                                <Landmark size={18} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{paymentData.bank.bankName}</span>
                             </div>
                             <div className="space-y-1">
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider select-all">{paymentData.bank.accountNumber}</p>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase italic truncate">{paymentData.bank.accountName}</p>
                             </div>
                          </div>

                          <div className="p-6 border border-orange-500/20 bg-orange-500/5 rounded-2xl space-y-2 relative group hover:bg-orange-500/10 transition-all">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-orange-500 flex items-center gap-2">
                                   <Info size={14} /> Nội dung chuyển khoản
                                </span>
                                <button onClick={() => handleCopy(paymentData.transferContent, 'Memo')} className="text-orange-500 hover:scale-110 transition-transform">
                                   {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                             </div>
                             <p className="text-xl font-black italic text-orange-600 dark:text-orange-400 select-all cursor-copy">{paymentData.transferContent}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <button 
                         onClick={handleConfirmPaid}
                         disabled={status === 'VERIFYING'}
                         className="w-full py-6 bg-indigo-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
                       >
                          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          {status === 'VERIFYING' ? (
                             <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin" size={20} />
                                <span>ĐANG KIỂM TRA GIAO DỊCH...</span>
                             </div>
                          ) : (
                             <div className="flex items-center gap-3">
                                <Zap size={20} fill="currentColor" />
                                <span>XÁC NHẬN ĐÃ CHUYỂN KHOẢN</span>
                             </div>
                          )}
                       </button>
                       <p className="text-[9px] font-bold text-slate-400 dark:text-gray-600 text-center uppercase tracking-widest italic">
                          * Hệ thống sẽ tự động đối soát và kích hoạt Token trong 30s - 2 phút.
                       </p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
