
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, ShieldCheck, UserCheck, 
  Zap, Info, ToggleLeft, ToggleRight, 
  Terminal, ShieldAlert, Key, Globe,
  Bot, Save, RotateCcw, Loader2, CheckCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL, getHeaders } from '../../apis/config';

export const ConfigurationTab: React.FC = () => {
  const { showToast } = useToast();
  
  // State cho cấu hình Auto Login
  const [autoLoginEnabled, setAutoLoginEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('skyverses_auto_login_admin');
    return saved !== 'false'; // Mặc định là true nếu chưa có giá trị
  });

  const handleToggleAutoLogin = () => {
    const newValue = !autoLoginEnabled;
    setAutoLoginEnabled(newValue);
    localStorage.setItem('skyverses_auto_login_admin', String(newValue));
    showToast(`Đã ${newValue ? 'bật' : 'tắt'} tự động đăng nhập Admin`, 'info');
  };

  // ─── AI Support Context ───
  const [aiContext, setAiContext] = useState('');
  const [aiContextLoading, setAiContextLoading] = useState(false);
  const [aiContextSaving, setAiContextSaving] = useState(false);
  const [aiContextDirty, setAiContextDirty] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      setAiContextLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/config/ai-support-context`, { headers: getHeaders() });
        const data = await res.json();
        if (data?.success && data.data) setAiContext(data.data);
      } catch (e) { console.error('Failed to load AI context', e); }
      setAiContextLoading(false);
    };
    loadContext();
  }, []);

  const handleSaveContext = async () => {
    setAiContextSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/config/ai-support-context`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ context: aiContext }),
      });
      const data = await res.json();
      if (data?.success) {
        showToast('Đã lưu AI Support Context thành công!', 'success');
        setAiContextDirty(false);
      } else {
        showToast('Lỗi khi lưu context', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối server', 'error');
    }
    setAiContextSaving(false);
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-5xl">
      
      {/* SECTION: AUTHENTICATION */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-6">
           <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
              <ShieldAlert size={22} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Cấu hình định danh</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Authentication & Access Control</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {/* Auto Login duloc2708 */}
           <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl flex items-center justify-between group hover:border-indigo-500/20 transition-all shadow-sm">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <UserCheck size={24} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-base font-black uppercase italic text-slate-800 dark:text-white">Auto Login Admin (duloc2708)</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tự động xác thực tài khoản quản trị khi vào ứng dụng.</p>
                 </div>
              </div>
              <button 
                onClick={handleToggleAutoLogin}
                className={`p-2 transition-all ${autoLoginEnabled ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                {autoLoginEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
              </button>
           </div>

           <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-5 items-start">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                 <Info size={20} />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 italic">Security Warning</p>
                 <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic">
                   "Nếu tắt tính năng này, bạn sẽ phải đăng nhập thủ công thông qua Google SSO hoặc Email để truy cập quyền quản trị."
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION: SYSTEM NODES */}
      <section className="space-y-8 pt-10 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 border-l-4 border-brand-blue pl-6">
           <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Zap size={22} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Hệ thống & Tài nguyên</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Resource & API Orchestration</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl space-y-6 shadow-sm opacity-40 grayscale group cursor-not-allowed">
              <div className="flex items-center gap-4">
                 <Key size={20} className="text-slate-400" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Environment Variables</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Cấu hình các biến môi trường cho Node. (Yêu cầu root access)</p>
           </div>
           
           <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl space-y-6 shadow-sm opacity-40 grayscale group cursor-not-allowed">
              <div className="flex items-center gap-4">
                 <Globe size={20} className="text-slate-400" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Global Endpoint Sync</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Đồng bộ hóa địa chỉ máy chủ xử lý trung tâm.</p>
           </div>
        </div>
      </section>

      {/* SECTION: AI SUPPORT CONTEXT */}
      <section className="space-y-8 pt-10 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 border-l-4 border-purple-600 pl-6">
           <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-600">
              <Bot size={22} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">AI Support Context</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">System Prompt cho AI Chat Assistant</p>
           </div>
        </div>

        <div className="space-y-4">
           <div className="p-6 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-bold italic">Nội dung này sẽ được gửi làm System Prompt cho AI hỗ trợ khách hàng. Hỗ trợ Markdown.</p>
                 <div className="flex items-center gap-2">
                    {aiContextDirty && <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">Unsaved</span>}
                 </div>
              </div>
              
              {aiContextLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                   <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                <textarea
                  value={aiContext}
                  onChange={(e) => { setAiContext(e.target.value); setAiContextDirty(true); }}
                  placeholder="Nhập system context cho AI Support tại đây... (Markdown supported)"
                  className="w-full h-[400px] p-5 bg-slate-50 dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-2xl text-[12px] font-mono text-slate-800 dark:text-gray-200 leading-relaxed resize-y focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-400"
                />
              )}

              <div className="flex items-center justify-between pt-2">
                 <p className="text-[9px] text-gray-400 font-medium">{aiContext.length.toLocaleString()} characters</p>
                 <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setAiContext(''); setAiContextDirty(true); }}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                    <button
                      onClick={handleSaveContext}
                      disabled={!aiContextDirty || aiContextSaving}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                        aiContextDirty 
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20' 
                          : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {aiContextSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      {aiContextSaving ? 'Saving...' : 'Lưu Context'}
                    </button>
                 </div>
              </div>
           </div>

           <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex gap-4 items-start">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                 <Info size={16} />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 italic">Hướng dẫn</p>
                 <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                   Context này sẽ override nội dung mặc định. Nếu để trống, hệ thống sẽ dùng context mặc định (hardcoded). 
                   Bạn có thể cập nhật sản phẩm mới, bảng giá, policy, và các thông tin hỗ trợ tại đây mà không cần deploy lại code.
                 </p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
