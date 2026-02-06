import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Database, 
  Info, Copy, Check, Terminal, Cpu, Network,
  ShieldCheck, Code2, Loader2, Play, RefreshCw,
  Braces, Activity, Sliders, Video,
  ChevronDown, ExternalLink
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const IntegrationWorkflow: React.FC = () => {
  const { showToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Input States - Các tham số định danh người dùng cần nhập
  const [jwtToken, setJwtToken] = useState('YOUR_GOOGLE_JWT_TOKEN');
  const [captchaToken, setCaptchaToken] = useState('CAPTCHA_TOKEN_FROM_SKYVERSES');

  // Kịch bản cURL cập nhật theo format Google VEO3
  const integrationCurlVideo = `curl 'https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoText' \\
  -H 'accept: */*' \\
  -H 'authorization: Bearer ${jwtToken}' \\
  -H 'content-type: text/plain;charset=UTF-8' \\
  -H 'origin: https://labs.google' \\
  -H 'referer: https://labs.google/' \\
  -H 'x-browser-channel: stable' \\
  -H 'x-browser-copyright: Copyright 2026 Google LLC. All Rights reserved.' \\
  -H 'x-browser-year: 2026' \\
  --data-raw '{
    "clientContext": {
        "recaptchaContext": {
            "token": "${captchaToken}",
            "applicationType": "RECAPTCHA_APPLICATION_TYPE_WEB"
        },
        "sessionId": ";${Date.now()}",
        "projectId": "855d107c-ead0-4272-b56e-b2fbee336197",
        "tool": "PINHOLE",
        "userPaygateTier": "PAYGATE_TIER_TWO"
    },
    "requests": [
        {
            "aspectRatio": "VIDEO_ASPECT_RATIO_LANDSCAPE",
            "seed": ${Math.floor(Math.random() * 9999)},
            "textInput": {
                "prompt": "Cinematic orbit shot of a floating neon garden in a purple nebula"
            },
            "videoModelKey": "veo_3_1_t2v_fast_ultra",
            "metadata": {
                "sceneId": "${crypto.randomUUID()}"
            }
        }
    ]
}'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(integrationCurlVideo);
    setIsCopied(true);
    showToast(`Đã sao chép kịch bản cURL`, "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunRequest = async () => {
    // Validation sơ bộ
    if (!jwtToken || jwtToken === 'YOUR_GOOGLE_JWT_TOKEN') {
      showToast("Vui lòng nhập Google Access Token (JWT)", "error");
      return;
    }
    if (!captchaToken || captchaToken === 'CAPTCHA_TOKEN_FROM_SKYVERSES') {
      showToast("Vui lòng nhập Captcha Token đã giải mã", "error");
      return;
    }

    setIsRunning(true);
    setShowResponse(false);
    setLastResponse(null);
    showToast(`Đang uplink tới Google Neural Node...`, "info");
    
    // Endpoint thực tế của Google VEO3 Sandbox
    const url = 'https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoText';

    const body = {
      clientContext: {
        recaptchaContext: {
          token: captchaToken,
          applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB"
        },
        sessionId: `;${Date.now()}`,
        projectId: "855d107c-ead0-4272-b56e-b2fbee336197",
        tool: "PINHOLE",
        userPaygateTier: "PAYGATE_TIER_TWO"
      },
      requests: [
        {
          aspectRatio: "VIDEO_ASPECT_RATIO_LANDSCAPE",
          seed: Math.floor(Math.random() * 9999),
          textInput: {
            prompt: "Cinematic orbit shot of a floating neon garden in a purple nebula"
          },
          videoModelKey: "veo_3_1_t2v_fast_ultra",
          metadata: {
            sceneId: crypto.randomUUID()
          }
        }
      ]
    };

    try {
      // Thực hiện gọi API trực tiếp từ trình duyệt
      // Lưu ý: Trong môi trường thực tế cần xử lý CORS nếu Google chặn gọi trực tiếp từ domain khác
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'content-type': 'text/plain;charset=UTF-8',
          'Authorization': `Bearer ${jwtToken}`,
          'x-browser-channel': 'stable',
          'x-browser-copyright': 'Copyright 2026 Google LLC. All Rights reserved.',
          'x-browser-year': '2026'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      setLastResponse(data);
      setShowResponse(true);

      if (response.ok) {
        showToast("Tác vụ khởi tạo thành công!", "success");
      } else {
        showToast(`Google API Error: ${data.error?.message || response.statusText}`, "error");
      }
    } catch (err: any) {
      console.error("Uplink Error:", err);
      setLastResponse({ 
        error: "CONNECTION_FAILED", 
        message: err.message || "Failed to reach Google APIs. Possible CORS restriction or network issue.",
        hint: "Nếu chạy trên Browser bị chặn CORS, hãy sử dụng Proxy hoặc chạy từ Backend của bạn."
      });
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
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Integration Demo</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Xác thực API: Google JWT + Skyverses Captcha</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-2">
           <p className="hidden sm:block text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{isExpanded ? 'Nhấn để thu gọn' : 'Nhấn để xem kịch bản tích hợp'}</p>
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
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex items-center bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                       <Video size={14} className="mr-3" /> VEO3 Implementation
                    </div>
                    <div className="flex-grow h-px bg-gradient-to-r from-indigo-500/20 to-transparent hidden md:block"></div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-sm italic">Direct_Uplink_Node</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 lg:gap-16 items-start">
                    
                    {/* INPUTS PANEL */}
                    <div className="space-y-8 bg-slate-50/50 dark:bg-white/[0.01] p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-[5s]">
                         <Braces size={200} />
                      </div>

                      <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-3 text-brand-blue mb-4">
                          <Sliders size={18} />
                          <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">Injection Parameters</span>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest ml-1 italic">Google Access Token (JWT)</label>
                            <div className="relative group">
                               <input 
                                value={jwtToken}
                                onChange={(e) => setJwtToken(e.target.value)}
                                className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[12px] font-mono text-indigo-600 dark:text-indigo-400 outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest ml-1 italic">Skyverses Captcha Token</label>
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
                            {isRunning ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                            {isRunning ? 'EXECUTING...' : `RUN VEO3 API REQUEST`}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-8 border-t border-black/5 dark:border-white/5 relative z-10">
                        <div className="flex items-center gap-3 text-brand-blue mb-3">
                          <ShieldCheck size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Security Protocol</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 italic leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                          "Hệ thống thực hiện lệnh POST trực tiếp tới Endpoint của Google. Đảm bảo bạn đã whitelist IP hoặc cấu hình CORS nếu chạy từ trình duyệt."
                        </p>
                      </div>
                    </div>

                    {/* RESPONSE TERMINAL */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
                          <span className="text-[11px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">
                            {showResponse ? 'UPLINK_RESPONSE_TRACE' : 'INTEGRATION_CURL_SCRIPT'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {showResponse && (
                            <button 
                              onClick={() => setShowResponse(false)}
                              className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all border border-black/5 dark:border-white/10 flex items-center gap-2 shadow-sm"
                            >
                              <RefreshCw size={12} /> RESET
                            </button>
                          )}
                          <button 
                            onClick={handleCopy}
                            className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-black/5 dark:border-white/10 shadow-sm"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} 
                            {isCopied ? 'COPIED' : 'COPY'}
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
                                  key="code-script"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  {integrationCurlVideo.split('\n').map((line, i) => {
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
                        
                        {/* Status Overlay */}
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-xl shadow-2xl z-20 transition-all rotate-12 flex items-center gap-2 group-hover:rotate-0">
                           <Code2 size={24} />
                        </div>
                      </div>

                      <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-4 items-start">
                         <Info className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                         <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight italic leading-relaxed">
                            "Lệnh này khởi chạy tiến trình render video tại cụm Cloud của Google. Nếu thành công, bạn sẽ nhận được một jobId để poll kết quả video cuối cùng."
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTACT/SUPPORT CARD */}
      <div className="p-10 bg-slate-900 dark:bg-black rounded-[3rem] border border-white/10 flex flex-col items-center justify-center gap-6 shadow-3xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
         <button className="px-16 py-6 bg-white text-black rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap relative z-10 flex items-center gap-3">
            LIÊN HỆ TƯ VẤN KỸ THUẬT <ExternalLink size={14} />
         </button>
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic text-center relative z-10">
            Hệ thống hỗ trợ các doanh nghiệp quy mô lớn triển khai Pipeline AI tự động hóa.
         </p>
      </div>
    </div>
  );
};
