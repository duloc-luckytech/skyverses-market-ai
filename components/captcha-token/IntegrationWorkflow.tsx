
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, ArrowRight, Database, 
  Info, Copy, Check, Terminal, Cpu, Network,
  ShieldCheck, Code2, Loader2, Play, RefreshCw,
  Braces, Globe, Activity, Sliders, Video, ImageIcon
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const IntegrationWorkflow: React.FC = () => {
  const { showToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  // Input States
  const [jwtToken, setJwtToken] = useState('ACCESS_TOKEN_JWT');
  const [captchaToken, setCaptchaToken] = useState('CAPTCHA_TOKEN_FROM_SKYVERSES_API');

  const mockResponseImage = {
    "media": [
      {
        "name": "CAMSJGY3MjQzYjcwLTRiMjItNDIyMi05YWM1LThjZjlmNjY2MGUxMhokNjJlMjgzNDktNzM5NS00NmM3LThlM2UtOTUyZjhkY2QxY2ViIgNDQUUqJGE1MmZjM2EzLTQyMjQtNGY0ZS1iODBmLTUyNGIzM2E3NjM4Mw",
        "workflowId": "62e28349-7395-46c7-8e3e-952f8dcd1ceb",
        "image": {
          "generatedImage": {
            "seed": 388850,
            "mediaGenerationId": "CAMSJGY3MjQzYjcwLTRiMjItNDIyMi05YWM1LThjZjlmNjY2MGUxMhokNjJlMjgzNDktNzM5NS00NmM3LThlM2UtOTUyZjhkY2QxY2ViIgNDQUUqJGE1MmZjM2EzLTQyMjQtNGY0ZS1iODBmLTUyNGIzM2E3NjM4Mw",
            "mediaVisibility": "PRIVATE",
            "prompt": "futuristic jade citadel",
            "modelNameType": "GEM_PIX_2",
            "workflowId": "62e28349-7395-46c7-8e3e-952f8dcd1ceb",
            "fifeUrl": "https://storage.googleapis.com/ai-sandbox-videofx/image/a52fc3a3-4224-4f4e-b80f-524b33a76383",
            "aspectRatio": "IMAGE_ASPECT_RATIO_LANDSCAPE"
          }
        }
      }
    ]
  };

  const mockResponseVideo = {
    "video": {
      "uri": "https://storage.googleapis.com/veo-output/render_4920138.mp4",
      "generationId": "VEO_JOB_8829103",
      "status": "COMPLETED",
      "duration": "8s",
      "resolution": "1080p"
    }
  };

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
  const activeResponse = activeWorkflowTab === 'IMAGE' ? mockResponseImage : mockResponseVideo;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCurl);
    setIsCopied(true);
    showToast(`Đã sao chép kịch bản ${activeWorkflowTab}`, "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunRequest = async () => {
    setIsRunning(true);
    setShowResponse(false);
    showToast(`Đang gửi yêu cầu khởi tạo ${activeWorkflowTab}...`, "info");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRunning(false);
    setShowResponse(true);
    showToast("Uplink thành công. Dữ liệu Media đã sẵn sàng.", "success");
  };

  return (
    <div className="mt-20 pt-20 border-t border-black/5 dark:border-white/5 relative z-10 space-y-16">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
            <Network size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Giao thức Tích hợp Hệ thống</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">Integration Workflow Architecture</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-gray-400 font-medium max-w-3xl italic pl-1 leading-relaxed">
          Nhúng kịch bản giải mã vào quy trình sản xuất thực tế. Thử nghiệm trực tiếp các tham số Schema ngay bên dưới.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16">
        <div className="space-y-10">
          {/* TAB SELECTION - UPDATED FROM STATIC HEADER */}
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex items-center bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl border border-black/5 dark:border-white/10 shadow-inner shrink-0">
               <button 
                 onClick={() => { setActiveWorkflowTab('IMAGE'); setShowResponse(false); }}
                 className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeWorkflowTab === 'IMAGE' ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}
               >
                 <ImageIcon size={14} /> Tạo Image
               </button>
               <button 
                 onClick={() => { setActiveWorkflowTab('VIDEO'); setShowResponse(false); }}
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
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">ACCESS_TOKEN_JWT</label>
                    <input 
                      value={jwtToken}
                      onChange={(e) => setJwtToken(e.target.value)}
                      className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[12px] font-mono text-indigo-600 dark:text-indigo-400 outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">CAPTCHA_TOKEN_FROM_SKYVERSES_API</label>
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
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isRunning ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                    {isRunning ? 'ĐANG KHỞI CHẠY...' : `RUN ${activeWorkflowTab} REQUEST`}
                  </button>
                </div>
              </div>
              
              <div className="pt-8 border-t border-black/5 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-3 text-brand-blue mb-3">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Sandbox Logic</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 italic leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                  Môi trường Sandbox yêu cầu Token hợp lệ để vượt qua <code className="text-indigo-600 dark:text-indigo-400 font-black">recaptchaContext</code>.
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
                          {JSON.stringify(activeResponse, null, 4)}
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

      {/* COMPLIANCE FOOTER */}
      <div className="p-10 bg-slate-900 dark:bg-black rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl">
         <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <ShieldCheck size={24} className="text-emerald-500" />
               <h4 className="text-xl font-black uppercase tracking-tighter text-white italic leading-none">B2B Compliance & Scalability</h4>
            </div>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Hệ thống Token Captcha của Skyverses được thiết kế để xử lý hàng triệu request mỗi ngày với tỷ lệ uptime 99.99%. Toàn bộ dữ liệu được mã hóa đầu-cuối và tuân thủ các tiêu chuẩn bảo mật khắt khe nhất.
            </p>
         </div>
         <button className="px-12 py-5 bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap">
            Liên hệ đội ngũ kỹ sư
         </button>
      </div>
    </div>
  );
};
