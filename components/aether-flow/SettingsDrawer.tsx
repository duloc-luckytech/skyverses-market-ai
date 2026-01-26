
import React from 'react';
import { Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsDrawerProps {
  isOpen: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  showApiKey: boolean;
  setShowApiKey: (val: boolean) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen, apiKey, setApiKey, showApiKey, setShowApiKey
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: 'auto', opacity: 1 }} 
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-slate-50 dark:bg-[#1c1c24] border border-black/5 dark:border-indigo-500/20 rounded-xl p-6 space-y-4 shadow-sm"
        >
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest flex items-center gap-2">
              <Key size={12} className="text-indigo-500 dark:text-indigo-400" /> RunningHub API Key
            </label>
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-indigo-600 dark:text-indigo-300 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                placeholder="Nhập API Key để kích hoạt Node..."
              />
              <button 
                onClick={() => setShowApiKey(!showApiKey)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 dark:hover:text-white"
              >
                {showApiKey ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 dark:text-gray-500 uppercase italic">
             <ShieldCheck size={10} className="text-emerald-500" /> Dữ liệu được lưu trữ cục bộ (LocalOnly)
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
