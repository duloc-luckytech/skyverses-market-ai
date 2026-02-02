
import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Copy, Loader2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { CaptchaAccount, TOKEN_STORAGE_KEY } from '../../hooks/useCaptchaToken';

interface AccountTabProps {
  accountData: CaptchaAccount | null;
  setAccountData: (data: CaptchaAccount | null) => void;
  isLinking: boolean;
  handleLinkAccount: () => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({ 
  accountData, setAccountData, isLinking, handleLinkAccount 
}) => {
  const { showToast } = useToast();

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Đã sao chép vào bộ nhớ tạm", "info");
  };

  return (
    <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      {!accountData ? (
        <div className="p-20 text-center bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8">
           <div className="w-24 h-24 bg-slate-50 dark:bg-black/40 rounded-full flex items-center justify-center text-slate-300 dark:text-gray-700">
              <User size={48} />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">No Account Linked</h3>
              <p className="text-sm text-gray-500 font-medium">Please link your Captcha account to view node identifiers and access tokens.</p>
           </div>
           <button onClick={handleLinkAccount} disabled={isLinking} className="bg-brand-blue text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-0.95 transition-all">
              {isLinking ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />} 
              Link Captcha Account
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-700">
           <div className="p-10 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[3rem] shadow-2xl space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                 <ShieldCheck size={160} />
              </div>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner transition-transform group-hover:scale-110">
                       <User size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase italic tracking-tighter">Captcha Node Info.</h3>
                       <div className="flex items-center gap-2 text-emerald-500">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[9px] font-black uppercase tracking-widest">Authenticated</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl space-y-1">
                       <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest italic">Node Identifier (ID)</p>
                       <p className="text-xs font-mono font-bold text-slate-700 dark:text-gray-300 select-all">{accountData.id}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl space-y-1">
                       <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest italic">Registered Email</p>
                       <p className="text-xs font-mono font-bold text-slate-700 dark:text-gray-300">{accountData.email}</p>
                    </div>
                    {accountData.accessTokenCaptcha && (
                       <div className="p-6 bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl space-y-1 md:col-span-2">
                          <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest italic">Skyverses Link Token</p>
                          <div className="flex items-center justify-between">
                             <p className="text-xs font-mono font-bold text-brand-blue truncate pr-6">{accountData.accessTokenCaptcha}</p>
                             <button onClick={() => handleCopy(accountData.accessTokenCaptcha!)} className="text-slate-400 hover:text-brand-blue transition-colors"><Copy size={14}/></button>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="pt-6 flex justify-end">
                    <button onClick={() => { localStorage.removeItem(TOKEN_STORAGE_KEY); setAccountData(null); }} className="text-[10px] font-black uppercase text-red-500 hover:underline transition-all">Vô hiệu hóa liên kết</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
};
