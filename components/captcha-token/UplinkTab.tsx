
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Copy, Loader2, Zap, Link as LinkIcon, ShieldCheck, Layers, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { CaptchaAccount } from '../../hooks/useCaptchaToken';

interface UplinkTabProps {
  accountData: CaptchaAccount | null;
  isGeneratingKey: boolean;
  isLinking: boolean;
  handleGenerateKey: () => void;
  handleLinkAccount: () => void;
  isAuthenticated: boolean;
}

export const UplinkTab: React.FC<UplinkTabProps> = ({ 
  accountData, isGeneratingKey, isLinking, handleGenerateKey, handleLinkAccount, isAuthenticated 
}) => {
  const [showKey, setShowKey] = useState(false);
  const { showToast } = useToast();

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Đã sao chép Secret Key", "info");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-10"
    >
      <div className="p-8 lg:p-12 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl space-y-10 relative overflow-hidden">
         {/* Subtle pattern for tech feel */}
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
         
         <div className="space-y-3 relative z-10">
            <h3 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Giao diện lập trình (API).</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium max-w-xl">Sử dụng Secret Key để xác thực các yêu cầu giải mã từ ứng dụng của bạn qua API.</p>
         </div>
         
         <div className="space-y-8 relative z-10">
            {accountData ? (
              <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">YOUR_API_SECRET_KEY</label>
                      {accountData.apiKey?.lastUsedAt && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Hoạt động: {new Date(accountData.apiKey.lastUsedAt).toLocaleTimeString()}</span>
                      )}
                   </div>
                   <div className="relative group">
                      <input 
                        readOnly 
                        type={showKey ? "text" : "password"} 
                        value={accountData.apiKey?.apiKey || ''} // Updated from .key to .apiKey
                        placeholder={accountData.apiKey ? '' : 'Chưa có Key được tạo'}
                        className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 p-5 rounded-2xl font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-widest outline-none shadow-inner transition-all focus:border-indigo-500/30"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                         <button 
                           onClick={() => setShowKey(!showKey)} 
                           disabled={!accountData.apiKey}
                           className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-20"
                         >
                           {showKey ? <EyeOff size={18}/> : <Eye size={18}/>}
                         </button>
                         <button 
                           onClick={() => handleCopy(accountData.apiKey?.apiKey || '')} // Updated from .key to .apiKey
                           disabled={!accountData.apiKey}
                           className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-20"
                         >
                           <Copy size={18}/>
                         </button>
                      </div>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2">
                   <button 
                     onClick={handleGenerateKey} 
                     disabled={isGeneratingKey}
                     className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                   >
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {isGeneratingKey ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />} 
                      {accountData.apiKey ? 'Làm mới Secret Key' : 'Khởi tạo API Key'}
                   </button>
                </div>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 bg-slate-50/50 dark:bg-white/[0.01]">
                 <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-gray-700 shadow-sm">
                    <LinkIcon size={32} />
                 </div>
                 <div className="space-y-2 px-8">
                    <h4 className="text-xl font-black uppercase italic tracking-tight">Kích hoạt Uplink</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm uppercase font-bold leading-relaxed">
                       Để bắt đầu sử dụng API giải mã Captcha, bạn cần liên kết tài khoản Skyverses với dịch vụ Token.
                    </p>
                 </div>
                 <button 
                   onClick={handleLinkAccount}
                   disabled={isLinking || !isAuthenticated}
                   className="px-12 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {isLinking ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                    Xác thực & Kết nối Node
                 </button>
                 {!isAuthenticated && (
                   <p className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2">
                     <AlertCircle size={12} /> Vui lòng đăng nhập trước
                   </p>
                 )}
              </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-10 bg-white dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-[3rem] space-y-6 shadow-sm group hover:border-indigo-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
               <ShieldCheck size={28}/>
            </div>
            <div className="space-y-3">
               <h4 className="text-2xl font-black uppercase italic tracking-tighter">Bảo mật đa tầng</h4>
               <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-indigo-600 pl-4">
                  "Mọi request được bảo vệ bởi giao thức mã hóa quân sự. Tự động thu hồi Key nếu phát hiện hành vi truy cập bất thường."
               </p>
            </div>
         </div>
         <div className="p-10 bg-white dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-[3rem] space-y-6 shadow-sm group hover:border-brand-blue/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner group-hover:scale-110 transition-transform">
               <Layers size={28}/>
            </div>
            <div className="space-y-3">
               <h4 className="text-2xl font-black uppercase italic tracking-tighter">Đa nền tảng</h4>
               <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-brand-blue pl-4">
                  "Hỗ trợ đồng thời 12 loại Captcha hiện đại nhất, bao gồm cả những biến thể AI phức tạp từ Google và Cloudflare."
               </p>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
