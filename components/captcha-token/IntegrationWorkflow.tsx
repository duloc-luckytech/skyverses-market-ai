import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, ArrowRight, Database, 
  Info, Copy, Check, Terminal, Cpu, Network,
  ShieldCheck, Code2, Loader2, Play, RefreshCw,
  Braces, Globe, Activity, Sliders, Video, ImageIcon,
  ChevronDown, AlertTriangle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const IntegrationWorkflow: React.FC = () => {
  const { showToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Input States
  const [jwtToken, setJwtToken] = useState('ACCESS_TOKEN_JWT');
  const [captchaToken, setCaptchaToken] = useState('CAPTCHA_TOKEN_FROM_SKYVERSES_API');

  const integrationCurlImage = `curl 'https://aisandbox-pa.googleapis.com/v1/projects/f7243b70-4b22-4222-9ac5-8cf9f6660e12/flowMedia:batchGenerateImages' \\
  -H 'Content-Type: text/plain;charset=UTF-8' \\
  -H 'Authorization: Bearer ${jwtToken}' \\
  --data-raw '{
    "clientContext": {
        "recaptchaContext": {
            "token": "${captchaToken}",
            "applicationType": "RECAPTCHA_APPLICATION_TYPE_WEB"
        },
        "sessionId": ";${Date.now()}",
        "projectId": "f7243b70-4b22-4222-9ac5-8cf9f6660e12",
        "tool": "PINHOLE"
    },
    "requests": [
        {
            "seed": 861454,
            "imageModelName": "GEM_PIX_2",
            "imageAspectRatio": "IMAGE_ASPECT_RATIO_LANDSCAPE",
            "prompt": "A futuristic jade citadel floating above clouds, cinematic lighting, hyper-detailed",
            "imageInputs": []
        }
    ]
}'`;

  const integrationCurlVideo = `curl 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:generateVideo' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${jwtToken}' \\
  --data-raw '{
    "prompt": "Cinematic orbit shot of the jade citadel in a storm",
    "clientContext": {
        "recaptchaContext": {
            "token": "${captchaToken}"
        }
    },
    "config": {
        "resolution": "1080p",
        "aspectRatio": "16:9"
    }
}'`;

  const activeCurl = activeWorkflowTab === 'IMAGE' ? integrationCurlImage : integrationCurlVideo;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCurl);
    setIsCopied(true);
    showToast(`Đã sao chép kịch bản ${activeWorkflowTab}`, "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunRequest = async () => {
    // 1. Validation logic
    if (jwtToken === 'ACCESS_TOKEN_JWT' || !jwtToken.trim()) {
      showToast("Vui lòng nhập ACCESS_TOKEN_JWT hợp lệ", "error");
      return;
    }
    if (captchaToken === 'CAPTCHA_TOKEN_FROM_SKYVERSES_API' || !captchaToken.trim()) {
      showToast("Vui lòng nhập CAPTCHA_TOKEN hợp lệ", "error");
      return;
    }

    setIsRunning(true);
    setShowResponse(false);
    setLastResponse(null);
    showToast(`Đang thực thi lệnh ${activeWorkflowTab} tới Google Cloud...`, "info");
    
    const url = activeWorkflowTab === 'IMAGE' 
      ? 'https://aisandbox-pa.googleapis.com/v1/projects/f7243b70-4b22-4222-9ac5-8cf9f6660e12/flowMedia:batchGenerateImages'
      : 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:generateVideo';

    const body = activeWorkflowTab === 'IMAGE' ? {
      clientContext: {
        recaptchaContext: {
          token: captchaToken,
          applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB"
        },
        sessionId: `;${Date.now()}`,
        projectId: "f7243b70-4b22-4222-9ac5-8cf9f6660e12",
        tool: "PINHOLE"
      },
      requests: [
        {
          seed: Math.floor(Math.random() * 999999),
          imageModelName: "GEM_PIX_2",
          imageAspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
          prompt: "A futuristic jade citadel floating above clouds, cinematic lighting, hyper-detailed",
          imageInputs: []
        }
      ]
    } : {
      prompt: "Cinematic orbit shot of the jade citadel in a storm",
      clientContext: {
        recaptchaContext: {
          token: captchaToken
        }
      },
      config: {
        resolution: "1080p",
        aspectRatio: "16:9"
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      setLastResponse(data);
      setShowResponse(true);

      if (response.ok) {
        showToast("Yêu cầu được thực thi thành công", "success");
      } else {
        showToast(`Lỗi Server: ${data.error?.message || response.statusText}`, "error");
      }
    } catch (err: any) {
      console.error("Uplink Error:", err);
      setLastResponse({ error: "CONNECTION_FAILED", message: err.message || "Failed to reach Google APIs" });
      setShowResponse(true);
      showToast("Lỗi kết nối tới Endpoint", "error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="mt-20 pt-10 border-t border-black/5 dark:border-white/5 relative z-10 space-y-12">
      {/* COLLAPSIBLE HEADER */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group bg-white dark:bg-black/20 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-500 shadow-sm hover:shadow-xl"
      >
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-indigo-600/10 text-indigo-600'}`}>
            <Network size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">List examples</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Kịch bản tích hợp hệ thống thực tế</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-2">
           <p className="hidden sm:block text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{isExpanded ? 'Nhấn để thu gọn' : 'Nhấn để xem các kịch bản mẫu'}</p>
           <div className={`w-10 h-10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-400 transition-all duration-500 ${isExpanded ? 'rotate-180 bg-black dark:bg-white text-white dark:text-black' : ''}`}>
              <ChevronDown size={20} />
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-16 pb-10">
              <div className="grid grid-cols-1 gap-16">
                <div className="space-y-10">
                  {/* TAB SELECTION */}
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex items-center bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl border border-black/5 dark:border-white/10 shadow-inner shrink-0">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveWorkflowTab('IMAGE'); setShowResponse(false); }}
                         className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeWorkflowTab === 'IMAGE' ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}
                       >
                         <ImageIcon size={14} /> Tạo Image
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveWorkflowTab('VIDEO'); setShowResponse(false); }}
                         className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeWorkflowTab === 'VIDEO' ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}
                       >
                         <Video size={14} /> Tạo Video
                       </button>
                    </div>
                    
                    <div className="flex-grow h-px bg-gradient-to-r from-indigo-500/20 to-transparent hidden md:block"></div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">Protocol: V3_ENTERPRISE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 lg:gap-16 items-start">
                    
                    {/* BODY PARAMS INPUTS */}
                    <div className="space-y-8 bg-slate-50/50 dark:bg-white/[0.01] p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-[5s]">
                         <Braces size={200} />
                      </div>

                      <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-3 text-brand-blue mb-4">
                          <Sliders size={18} />
                          <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">Body Params Schema</span>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                               <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">ACCESS_TOKEN_JWT</label>
                               <button 
                                 onClick={async () => {
                                    const text = await navigator.clipboard.readText();
                                    setJwtToken(text);
                                 }}
                                 className="text-[9px] font-black text-brand-blue uppercase hover:underline"
                               >
                                  Paste
                               </button>
                            </div>
                            <input 
                              value={jwtToken}
                              onChange={(e) => setJwtToken(e.target.value)}
                              className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[12px] font-mono text-indigo-600 dark:text-indigo-400 outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all shadow-inner"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                               <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">CAPTCHA_TOKEN</label>
                               <button 
                                 onClick={async () => {
                                    const text = await navigator.clipboard.readText();
                                    setCaptchaToken(text);
                                 }}
                                 className="text-[9px] font-black text-brand-blue uppercase hover:underline"
                               >
                                  Paste
                               </button>
                            </div>
                            <input 
                              value={captchaToken}
                              onChange={(e) => setCaptchaToken(e.target.value)}
                              className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[12px] font-mono text-indigo-600 dark:text-indigo-400 outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all shadow-inner"
                            />
                          </div>

                          <button 
                            onClick={handleRunRequest}
                            disabled={isRunning}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-xl shadow-indigo-600/20 hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            {isRunning ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                            {isRunning ? 'ĐANG KHỞI CHẠY...' : `RUN REAL ${activeWorkflowTab} REQUEST`}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-8 border-t border-black/5 dark:border-white/5 relative z-10">
                        <div className="flex items-center gap-3 text-brand-blue mb-3">
                          <ShieldCheck size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Real API Integration</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 italic leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                          Hệ thống sẽ thực hiện gọi API thực tế tới máy chủ Google. Vui lòng đảm bảo <code className="text-indigo-600 dark:text-indigo-400 font-black">ACCESS_TOKEN_JWT</code> còn hiệu lực.
                        </p>
                      </div>
                    </div>

                    {/* RESPONSE VIEWPORT */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
                          <span className="text-[11px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest italic">
                            {showResponse ? 'LIVE_RESPONSE_MANIFEST' : 'IMPLEMENTATION_CURL'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {showResponse && (
                            <button 
                              onClick={() => setShowResponse(false)}
                              className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all border border-black/5 dark:border-white/10 flex items-center gap-2"
                            >
                              <RefreshCw size={12} /> RESET
                            </button>
                          )}
                          <button 
                            onClick={handleCopy}
                            className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-black/5 dark:border-white/10"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} 
                            {isCopied ? 'ĐÃ CHÉP' : 'COPY'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative group shadow-2xl">
                        <div className="absolute inset-0 bg-brand-blue/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <pre className={`p-8 bg-[#0a0a0c] rounded-[2.5rem] border border-white/5 text-[12px] font-mono overflow-x-auto shadow-inner leading-relaxed no-scrollbar relative z-10 transition-all duration-700 ${showResponse ? 'text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/10' : 'text-slate-300'}`}>
                          <code className="block whitespace-pre">
                            <AnimatePresence mode="wait">
                              {showResponse ? (
                                <motion.div
                                  key="response"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-emerald-400/90"
                                >
                                  {JSON.stringify(lastResponse, null, 4)}
                                </motion.div>
                              ) : (
                                <motion.div
                                  key={`code-${activeWorkflowTab}`}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  {activeCurl.split('\n').map((line, i) => {
                                    if (line.includes(captchaToken) || line.includes(jwtToken)) {
                                      return (
                                        <span key={i} className="text-indigo-400 font-black underline decoration-indigo-500/50 italic">
                                          {line}{'\n'}
                                        </span>
                                      );
                                    }
                                    return <span key={i} className="opacity-80">{line}{'\n'}</span>;
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </code>
                        </pre>
                        
                        {/* Visual Indicator */}
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-xl shadow-2xl z-20 transition-all rotate-12 flex items-center gap-2">
                           <Code2 size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPLIANCE FOOTER - MODIFIED TO SHOW ONLY CONTACT BUTTON */}
      <div className="p-10 bg-slate-900 dark:bg-black rounded-[3rem] border border-white/10 flex flex-col items-center justify-center gap-6 shadow-3xl">
         <button className="px-16 py-6 bg-white text-black rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap">
            Liên hệ đội ngũ kỹ sư
         </button>
         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic text-center">
            Mọi yêu cầu hỗ trợ kỹ thuật và tích hợp hệ thống sẽ được phản hồi trong vòng 24h.
         </p>
      </div>
    </div>
  );
};
