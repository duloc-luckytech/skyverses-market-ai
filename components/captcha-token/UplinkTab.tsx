import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Copy, Loader2, Zap, Link as LinkIcon, ShieldCheck, Layers, AlertCircle, Play, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { CaptchaAccount } from '../../hooks/useCaptchaToken';

interface UplinkTabProps {
  accountData: CaptchaAccount | null;
  isGeneratingKey: boolean;
  isLinking: boolean;
  handleGenerateKey: () => void;
  handleLinkAccount: () => void;
  isAuthenticated: boolean;
  login?: () => void;
  onTryIt: () => void;
}

export const UplinkTab: React.FC<UplinkTabProps> = ({ 
  accountData, isGeneratingKey, isLinking, handleGenerateKey, handleLinkAccount, isAuthenticated, login, onTryIt 
}) => {
  const [showKey, setShowKey] = useState(false);
  const { showToast } = useToast();

  const handleCopy = (text: string, section: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Đã sao chép Api Key", "info");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-10"
    >
      <div className="p-8 lg:p-12 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl space-y-10 relative overflow-hidden transition-colors">
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
         
         <div className="space-y-3 relative z-10">
            <h3 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Giao thức Captcha Veo3.</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium max-w-xl">Sử dụng Api Key để xác thực các yêu cầu giải mã từ ứng dụng của bạn qua API.</p>
         </div>
         
         <div className="space-y-8 relative z-10">
            {accountData ? (
              <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">YOUR_API_KEY</label>
                      {accountData.apiKey?.lastUsedAt && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Hoạt động: {new Date(accountData.apiKey.lastUsedAt).toLocaleTimeString()}</span>
                      )}
                   </div>
                   <div className="relative group">
                      <input 
                        readOnly 
                        type={showKey ? "text" : "password"} 
                        value={accountData.apiKey?.key || ''}
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
                           onClick={() => handleCopy(accountData.apiKey?.key || '', 'Api Key')}
                           disabled={!accountData.apiKey}
                           className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-20"
                         >
                           <Copy size={18}/>
                         </button>
                      </div>
                   </div>
                </div>

                {/* SECURITY WARNING NOTE - UPDATED WORDING */}
                {accountData.apiKey && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-5 items-start animate-in fade-in duration-700"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0 shadow-inner">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-500 italic">Security Protocol</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic">
                        "API Key này là định danh bảo mật duy nhất. Việc để lộ Key sẽ khiến người khác có quyền truy cập và sử dụng toàn bộ số dư Token trong tài khoản của bạn."
                      </p>
                    </div>
                  </motion.div>
                )}
                
                <div className="flex flex-row items-center gap-4 pt-2">
                   {!accountData.apiKey && (
                     <button 
                       onClick={handleGenerateKey} 
                       disabled={isGeneratingKey}
                       className="flex-grow py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 hover:scale-102 active:scale-95 transition-all group relative overflow-hidden h-14"
                     >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        {isGeneratingKey ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />} 
                        Khởi tạo API Key
                     </button>
                   )}

                   <button 
                     onClick={onTryIt}
                     className="flex-grow py-5 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 h-14"
                   >
                      <Play size={16} fill="currentColor" /> Try it
                   </button>
                </div>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 bg-slate-50/50 dark:bg-white/[0.01]">
                 <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-gray-700 shadow-sm">
                    <LinkIcon size={32} />
                 </div>
                 <div className="space-y-2 px-8">
                    <h4 className="text-xl font-black uppercase italic tracking-tight text-slate-800 dark:text-white">Kích hoạt tài khoản</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm uppercase font-bold leading-relaxed">
                       Để bắt đầu sử dụng API giải mã Captcha, bạn cần liên kết tài khoản Skyverses với dịch vụ Token.
                    </p>
                 </div>
                 <button 
                   onClick={isAuthenticated ? handleLinkAccount : login}
                   disabled={isLinking}
                   className="px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {isLinking && <Loader2 className="animate-spin mr-2" size={16} />}
                    {!isAuthenticated ? 'Cần đăng nhập' : 'Xác thực tài khoản'}
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
                  "Hỗ trợ tạo captcha video hoặc hình ảnh trên hệ thống Veo3 Fx Lab flow, tối ưu hóa cho các tác vụ tự động hóa phức tạp."
               </p>
            </div>
         </div>
      </div>
    </motion.div>
  );
};