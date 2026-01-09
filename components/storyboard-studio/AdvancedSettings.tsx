
import React from 'react';
import { Settings, Plus, Zap as ZapIcon, ShieldCheck, Play, Save, Loader2 } from 'lucide-react';

interface AdvancedSettingsProps {
  isProcessing?: boolean;
  onSaveAndGenerate?: () => void;
  settings: any;
  setSettings: (updates: any) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ isProcessing, onSaveAndGenerate, settings, setSettings }) => {
  const inputClass = "w-full bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/5 p-4 rounded-xl text-lg font-black italic outline-none focus:border-brand-blue/50 transition-all text-slate-900 dark:text-white text-center shadow-inner";
  const labelClass = "text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3 block px-1";
  const descClass = "text-[9px] text-gray-500 dark:text-gray-600 font-bold uppercase italic mt-3 px-1 leading-relaxed";

  return (
    <div className="space-y-10">
      <div className="p-10 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-sm dark:shadow-2xl transition-colors">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-slate-400 dark:text-gray-500" />
          <h3 className="text-sm font-black uppercase tracking-[0.3em] italic text-slate-500 dark:text-gray-400">CÀI ĐẶT NÂNG CAO</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Retry Field */}
          <div className="space-y-2">
            <label className={labelClass}>SỐ LẦN THỬ LẠI KHI LỖI</label>
            <div className="flex items-center gap-4 group">
              <div className="relative flex-grow max-w-[120px]">
                <input 
                  type="number" 
                  value={settings.retryCount || 2} 
                  onChange={(e) => setSettings({ ...settings, retryCount: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
                <div className="absolute inset-0 rounded-xl border border-brand-blue/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
              </div>
              <span className="text-xs font-black uppercase text-slate-300 dark:text-gray-700 italic">lần</span>
            </div>
            <p className={descClass}>Nếu tạo thất bại, hệ thống sẽ tự động thử lại tối đa số lần này.</p>
          </div>

          {/* Parallel Threads Field */}
          <div className="space-y-2">
            <label className={labelClass}>SỐ LUỒNG TỐI ĐA</label>
            <div className="flex items-center gap-4 group">
              <div className="relative flex-grow max-w-[120px]">
                <input 
                  type="number" 
                  value={settings.maxThreads || 5} 
                  onChange={(e) => setSettings({ ...settings, maxThreads: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
                <div className="absolute inset-0 rounded-xl border border-brand-blue/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
              </div>
              <span className="text-xs font-black uppercase text-slate-300 dark:text-gray-700 italic">luồng</span>
            </div>
            <p className={descClass}>Số lượng tối đa các tác vụ chạy song song.</p>
          </div>
        </div>

        {/* API Key Section */}
        <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-brand-blue rounded-full flex items-center justify-center text-white">
                  <ZapIcon size={10} fill="currentColor" />
                </div>
                <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em]">API KEY GEMINI</label>
             </div>
             <button className="text-[9px] font-black uppercase bg-orange-500/10 text-orange-600 dark:text-orange-500 px-3 py-1 rounded-full border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all">
                Dùng API miễn phí
             </button>
          </div>

          <div className="flex gap-3">
             <div className="relative flex-grow group">
                <input 
                  type="password"
                  placeholder="Nhập API key (AIza...)"
                  className="w-full bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/5 p-5 rounded-xl text-xs font-mono outline-none focus:border-brand-blue/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-800"
                />
                <div className="absolute inset-0 rounded-xl border border-brand-blue/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
             </div>
             <button className="bg-brand-blue/10 border border-brand-blue/20 text-brand-blue px-8 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2">
                <Plus size={14} strokeWidth={3} /> Thêm
             </button>
          </div>

          <div className="h-32 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-black/20 group hover:border-brand-blue/20 transition-all">
             <ZapIcon size={24} className="text-slate-300 dark:text-gray-800 group-hover:text-brand-blue transition-colors" />
             <p className="text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-widest italic">Chưa có API key nào. Hệ thống sẽ dùng API miễn phí.</p>
          </div>
        </div>
      </div>

      {/* FINAL SUBMIT ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button 
          onClick={onSaveAndGenerate}
          className="flex-grow bg-brand-blue text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <ShieldCheck size={18} />
          Lưu thiết lập cấu hình
        </button>
        <button 
          className="px-12 py-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-4 group shadow-sm"
        >
          Lưu bản nháp <Save size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};
