
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Copy, Check, ExternalLink, 
  Code2, ChevronRight, Globe,
  Activity, Server, Cpu, Key as KeyIcon, 
  ChevronDown, Braces, Book, ShieldCheck,
  Zap, Command, Play, Loader2, ArrowRight,
  Database, Share2, Sparkles, Info, RefreshCw
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { IntegrationWorkflow } from './IntegrationWorkflow';

type CodeLang = 'CURL' | 'PYTHON' | 'NODEJS';
type CaptchaAction = 'IMAGE_RECOGNITION' | 'VIDEO_ANALYSIS' | 'VEO3_ORCHESTRATION';

interface DocsTabProps {
  apiKey?: string;
}

export const DocsTab: React.FC<DocsTabProps> = ({ apiKey: accountApiKey }) => {
  const { showToast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<CodeLang>('CURL');
  
  // Interactive States
  const [action, setAction] = useState<CaptchaAction>('VIDEO_ANALYSIS');
  const [displayApiKey, setDisplayApiKey] = useState(accountApiKey || 'YOUR_API_KEY');

  // Live Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [liveResponse, setLiveResponse] = useState<any>(null);

  // Sync with prop if it changes
  React.useEffect(() => {
    if (accountApiKey) setDisplayApiKey(accountApiKey);
  }, [accountApiKey]);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    showToast(`Đã sao chép ${section}`, 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getCodeContent = (lang: CodeLang) => {
    switch (lang) {
      case 'CURL':
        return `curl --location 'https://captcha.skyverses.com/captcha/request' \\
--header 'Content-Type: application/json' \\
--data '{
    "action": "${action}",
    "apiKey": "${displayApiKey}"
}'`;
      case 'PYTHON':
        return `import requests
import json

url = "https://captcha.skyverses.com/captcha/request"
payload = {
    "action": "${action}",
    "apiKey": "${displayApiKey}"
}
headers = {
    'Content-Type': 'application/json'
}

response = requests.post(url, data=json.dumps(payload), headers=headers)
print(response.json())`;
      case 'NODEJS':
        return `const url = 'https://captcha.skyverses.com/captcha/request';
const payload = {
  action: '${action}',
  apiKey: '${displayApiKey}'
};

const response = await fetch(url, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

const data = await response.json();
console.log(data);`;
    }
  };

  const handleRunRequest = async () => {
    if (displayApiKey === 'YOUR_API_KEY' || !displayApiKey) {
      showToast("Vui lòng kết nối tài khoản và tạo API Key trước", "warning");
      return;
    }

    setIsRunning(true);
    setLiveResponse(null);
    showToast("Đang gửi yêu cầu tới Node...", "info");

    try {
      const response = await fetch('https://captcha.skyverses.com/captcha/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          apiKey: displayApiKey
        })
      });

      const data = await response.json();
      setLiveResponse(data);
      
      if (data.success) {
        showToast("Yêu cầu thành công", "success");
      } else {
        showToast(data.message || "Yêu cầu bị từ chối", "error");
      }
    } catch (err) {
      setLiveResponse({ error: "FAILED_TO_CONNECT", message: "Không thể kết nối tới máy chủ Captcha." });
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setIsRunning(false);
    }
  };

  const responseSchemaExample = `{
    "success": true,
    "captchaToken": "cap_token_87dd7a9edb5c...",
    "quotaRemaining": 1420,
    "timestamp": "2025-05-14T08:32:01.420Z"
}`;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-10 pb-32"
    >
      <div className="p-8 lg:p-12 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl space-y-16 relative overflow-hidden transition-colors">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
            <Terminal size={320} />
         </div>

         {/* Header Section */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10 border-b border-black/5 dark:border-white/5 pb-10">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">API Reference</h3>
               </div>
               <p className="text-sm text-gray-500 font-medium max-w-xl italic">
                 Giao thức trích xuất và giải mã Captcha nơ-ron chuyên dụng cho các kịch bản tự động hóa quy mô lớn.
               </p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl">
                  <Globe size={14} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 italic leading-none">Endpoint: captcha.skyverses.com</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Node Status: Optimal</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start relative z-10">
            
            {/* SCHEMA & PARAMS (LEFT) */}
            <div className="lg:col-span-5 space-y-12">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-indigo-600" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500">Request Body Schema</h4>
                  </div>
                  
                  <div className="space-y-10">
                     {/* Action Selector */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest flex items-center gap-2">
                             action <span className="text-rose-500">*</span>
                           </label>
                           <span className="text-[8px] font-bold text-indigo-600 uppercase bg-indigo-600/10 px-1.5 py-0.5 rounded">Enum[String]</span>
                        </div>
                        <div className="relative group">
                           <select 
                             value={action}
                             onChange={(e) => setAction(e.target.value as CaptchaAction)}
                             className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-xs font-black uppercase italic outline-none focus:border-indigo-500/40 appearance-none cursor-pointer text-slate-800 dark:text-white shadow-inner transition-all"
                           >
                              <option value="IMAGE_RECOGNITION">IMAGE_RECOGNITION</option>
                              <option value="VIDEO_ANALYSIS">VIDEO_ANALYSIS</option>
                              <option value="VEO3_ORCHESTRATION">VEO3_ORCHESTRATION</option>
                           </select>
                           <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed italic px-1 opacity-70 leading-loose">Xác định loại captcha cần giải mã dựa trên kiến trúc nơ-ron hiện tại.</p>
                     </div>

                     {/* API Key Input (Auth) */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest flex items-center gap-2">
                             apiKey <span className="text-rose-500">*</span>
                           </label>
                           <span className="text-[8px] font-bold text-purple-500 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded">Auth Header</span>
                        </div>
                        <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <KeyIcon size={16} />
                           </div>
                           <input 
                             type="text"
                             value={displayApiKey}
                             onChange={(e) => setDisplayApiKey(e.target.value)}
                             className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 py-4 pl-12 pr-4 rounded-2xl text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500/40 shadow-inner transition-all"
                             placeholder="Your Secret API Key..."
                           />
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed italic px-1 opacity-70 leading-loose">Khóa bảo mật cá nhân dùng để định danh và trừ hạn ngạch Token.</p>
                     </div>
                  </div>
               </div>

               <div className="p-8 bg-indigo-600/5 border border-indigo-600/10 rounded-[2rem] flex gap-5 items-start shadow-sm transition-all hover:bg-indigo-600/10 group">
                  <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                    <Cpu size={24} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 italic">Real-time Node implementation</p>
                     <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic">
                        Thay đổi các tham số ở cột trái để thấy kịch bản tích hợp thay đổi trực tiếp ở cột phải.
                     </p>
                  </div>
               </div>
            </div>

            {/* LIVE CODE PREVIEW (RIGHT) */}
            <div className="lg:col-span-7 space-y-8">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                     <Code2 size={16} className="text-indigo-500" />
                     <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 italic leading-none">Request Implementation</h4>
                  </div>
                  
                  <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
                     {(['CURL', 'PYTHON', 'NODEJS'] as CodeLang[]).map(lang => (
                       <button 
                         key={lang}
                         onClick={() => setActiveLang(lang)}
                         className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg ${activeLang === lang ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
                       >
                         {lang}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="relative group">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <pre className="p-8 bg-[#0a0a0c] rounded-[2rem] border border-white/5 text-[12px] font-mono text-indigo-400/90 overflow-x-auto shadow-2xl leading-relaxed min-h-[220px] no-scrollbar">
                     <AnimatePresence mode="wait">
                       <motion.code
                         key={activeLang + action + displayApiKey}
                         initial={{ opacity: 0, y: 5 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -5 }}
                         className="block whitespace-pre"
                       >
                         {getCodeContent(activeLang)}
                       </motion.code>
                     </AnimatePresence>
                  </pre>
                  
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={handleRunRequest}
                      disabled={isRunning}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                       {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                       RUN_REQUEST
                    </button>
                    <button 
                      onClick={() => handleCopy(getCodeContent(activeLang), activeLang)}
                      className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5 backdrop-blur-md"
                    >
                       {copiedSection === activeLang ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                  </div>
               </div>

               {/* RESPONSE MANIFEST */}
               <div className="pt-10 space-y-8">
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-5">
                    <div className="flex items-center gap-3">
                       <Server size={16} className={liveResponse ? "text-indigo-500" : "text-emerald-500"} />
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 italic leading-none">
                         {liveResponse ? "Live Response Trace" : "Response Manifest (Schema)"}
                       </h4>
                    </div>
                    <div className="flex gap-4">
                      {liveResponse && (
                        <button onClick={() => setLiveResponse(null)} className="text-[9px] font-black uppercase text-gray-400 hover:text-white tracking-widest italic flex items-center gap-2">
                           <RefreshCw size={12} /> RESET_VIEW
                        </button>
                      )}
                      <button onClick={() => handleCopy(liveResponse ? JSON.stringify(liveResponse, null, 4) : responseSchemaExample, 'JSON Response')} className="text-[9px] font-black uppercase text-emerald-500 hover:underline tracking-widest italic flex items-center gap-2 transition-all">
                         <Copy size={12} /> COPY_JSON
                      </button>
                    </div>
                  </div>
                  <div className="relative group">
                    <pre className={`p-8 rounded-[2rem] border border-white/5 text-[12px] font-mono overflow-x-auto shadow-inner leading-relaxed transition-colors duration-500 ${liveResponse ? "bg-black/60 text-indigo-400" : "bg-[#08080a] text-emerald-500/80"}`}>
                       {liveResponse ? JSON.stringify(liveResponse, null, 4) : responseSchemaExample}
                    </pre>
                    <div className={`absolute inset-0 pointer-events-none rounded-[2rem] ${liveResponse ? "bg-indigo-500/[0.02]" : "bg-emerald-500/[0.01]"}`}></div>
                  </div>
               </div>
            </div>
         </div>

         {/* INTEGRATION EXAMPLES SECTION */}
         <IntegrationWorkflow />
      </div>
    </motion.div>
  );
};
