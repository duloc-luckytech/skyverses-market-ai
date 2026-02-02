
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Loader2, Zap, Link as LinkIcon, ShieldCheck, Layers } from 'lucide-react';
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
    showToast("Đã sao chép vào bộ nhớ tạm", "info");
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div className="p-10 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl space-y-8">
         <div className="space-y-2">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">API Infrastructure.</h3>
            <p className="text-sm text-gray-500 font-medium">Cấp phát và quản lý định danh node riêng biệt cho các tác vụ giải mã kịch bản từ xa.</p>
         </div>
         
         <div className="space-y-6">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest ml-2 italic">YOUR_NODE_ACCESS_KEY</label>
               <div className="relative group">
                  <input 
                    readOnly type={showKey ? "text" : "password"} value={accountData?.apiKey?.key || ''}
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 p-5 rounded-2xl font-mono text-sm font-black text-brand-blue tracking-widest outline-none shadow-inner transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     <button onClick={() => setShowKey(!showKey)} className="p-2.5 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">{showKey ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                     <button onClick={() => handleCopy(accountData?.apiKey?.key || '')} className="p-2.5 text-gray-400 hover:text-indigo-600 transition-colors"><Copy size={18}/></button>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <button 
                 onClick={handleGenerateKey} disabled={isGeneratingKey || !accountData}
                 className="px-8 py-3.5 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 hover:brightness-110 active:scale-[0.95] transition-all group relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isGeneratingKey ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
                  {accountData?.apiKey ? 'Tái tạo API Key' : 'Tạo API Key mới'}
               </button>
               {!accountData && (
                 <button 
                   onClick={handleLinkAccount}
                   disabled={isLinking || !isAuthenticated}
                   className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 hover:brightness-110 active:scale-[0.95] transition-all group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {isLinking ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                    Liên kết Tài khoản
                 </button>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 bg-slate-100 dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-[2rem] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner"><ShieldCheck size={20}/></div>
            <h4 className="text-lg font-black uppercase italic tracking-tighter">B2B Compliance</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-tight italic">
               "Tuân thủ nghiêm ngặt giao thức bảo mật VPC. Dữ liệu Captcha được xử lý in-memory và tự hủy ngay sau khi trả kết quả."
            </p>
         </div>
         <div className="p-8 bg-slate-100 dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-[2rem] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner"><Layers size={20}/></div>
            <h4 className="text-lg font-black uppercase italic tracking-tighter">Universal Engine</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-tight italic">
               Hỗ trợ giải mã 100% các loại kịch bản: ReCaptcha v2/v3, hCaptcha, FunCaptcha và hệ thống xác thực Cloudflare Turnstile.
            </p>
         </div>
      </div>
    </motion.div>
  );
};
