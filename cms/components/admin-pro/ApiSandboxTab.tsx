
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Globe, Database, Terminal, Shield, 
  Clock, Trash2, Copy, Check, Loader2, 
  Zap, AlertCircle, ChevronRight, Hash,
  Code, Info, ToggleLeft, ToggleRight,
  Activity, Sparkles, FileCode, Layers
} from 'lucide-react';
import { getHeaders, API_BASE_URL } from '../../apis/config';
import { useToast } from '../../context/ToastContext';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ContentType = 'application/json' | 'application/x-www-form-urlencoded';

interface SandboxResponse {
  status: number;
  statusText: string;
  data: any;
  time: number;
  headers: Record<string, string>;
  isError: boolean;
}

interface RequestPreset {
  id: string;
  name: string;
  method: HTTPMethod;
  url: string;
  body: string;
  contentType: ContentType;
  useAuth: boolean;
  description: string;
}

const PRESETS: RequestPreset[] = [
  {
    id: 'market-list',
    name: 'Market Solutions',
    method: 'GET',
    url: `${API_BASE_URL}/market`,
    body: '',
    contentType: 'application/json',
    useAuth: true,
    description: 'Lấy danh sách các giải pháp đang có trên thị trường.'
  },
  {
    id: 'gommo-upload',
    name: 'Gommo Video Upload',
    method: 'POST',
    url: 'https://api.gommo.net/ai/video-upload',
    body: 'access_token=YOUR_TOKEN_HERE&domain=aivideoauto.com&data=base64_string_here&project_id=123&file_name=video.mp4',
    contentType: 'application/x-www-form-urlencoded',
    useAuth: false,
    description: 'Ví dụ upload video lên Gommo API sử dụng urlencoded protocol.'
  }
];

export const ApiSandboxTab: React.FC = () => {
  const { showToast } = useToast();
  const [method, setMethod] = useState<HTTPMethod>('GET');
  const [url, setUrl] = useState<string>(API_BASE_URL + '/market');
  const [contentType, setContentType] = useState<ContentType>('application/json');
  const [requestBody, setRequestBody] = useState<string>('{\n  "example": "data"\n}');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SandboxResponse | null>(null);
  const [useAuth, setUseAuth] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const applyPreset = (preset: RequestPreset) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setRequestBody(preset.body);
    setContentType(preset.contentType);
    setUseAuth(preset.useAuth);
    showToast(`Đã áp dụng mẫu: ${preset.name}`, "success");
  };

  const handleSend = async () => {
    if (!url.trim()) {
      showToast("Vui lòng nhập URL đích", "warning");
      return;
    }

    setLoading(true);
    const start = performance.now();
    
    try {
      const authHeaders = useAuth ? getHeaders() : {};
      const headers: any = { 
        ...authHeaders,
        'Content-Type': contentType,
        'Accept': '*/*'
      };
      
      const options: RequestInit = {
        method,
        headers,
      };

      if (method !== 'GET' && requestBody.trim()) {
        if (contentType === 'application/json') {
          try {
            options.body = JSON.stringify(JSON.parse(requestBody));
          } catch (e) {
            showToast("JSON Input không hợp lệ", "error");
            setLoading(false);
            return;
          }
        } else {
          options.body = requestBody;
        }
      }

      const res = await fetch(url, options);
      let data;
      const contentTypeHeader = res.headers.get('content-type');
      if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
        data = await res.json();
      } else {
        data = { message: await res.text() };
      }
      
      const end = performance.now();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        time: Math.round(end - start),
        headers: Object.fromEntries(res.headers.entries()),
        isError: !res.ok
      });

      if (res.ok) showToast("Uplink successful", "success");
      else showToast(`Uplink Error: ${res.status}`, "error");

    } catch (err: any) {
      const end = performance.now();
      setResponse({
        status: 0,
        statusText: 'Network Error',
        data: { 
          message: err.message || 'Hệ thống không thể kết nối tới endpoint này.',
          hint: 'Vui lòng kiểm tra CORS Policy hoặc địa chỉ Endpoint.'
        },
        time: Math.round(end - start),
        headers: {},
        isError: true
      });
      showToast("Network Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast("Đã sao chép nội dung phản hồi", "success");
  };

  const clearSandbox = () => {
    setResponse(null);
    setRequestBody('{\n  "example": "data"\n}');
    showToast("Đã dọn dẹp sandbox", "info");
  };

  const methods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-700 h-full flex flex-col bg-[#fcfcfd] dark:bg-[#020203]">
      
      {/* QUICK PRESETS SECTION */}
      <div className="space-y-4">
         <div className="flex items-center gap-3 px-2">
            <Sparkles size={16} className="text-brand-blue" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Quick_Templates</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESETS.map(p => (
               <button 
                key={p.id}
                onClick={() => applyPreset(p)}
                className="group p-5 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-2xl text-left hover:border-brand-blue/40 transition-all shadow-sm flex flex-col gap-2"
               >
                  <div className="flex items-center justify-between">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.method === 'GET' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-blue/10 text-brand-blue'}`}>{p.method}</span>
                     <Layers size={14} className="text-gray-300 dark:text-gray-700 group-hover:text-brand-blue transition-colors" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase italic text-slate-800 dark:text-white leading-tight">{p.name}</h4>
                  <p className="text-[9px] text-gray-400 font-medium line-clamp-1">{p.description}</p>
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 flex-grow">
        
        {/* REQUEST PANE */}
        <div className="xl:col-span-5 space-y-8 flex flex-col">
           <div className="space-y-6 bg-white dark:bg-[#08080a] p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-xl shadow-brand-blue/5">
              <div className="flex items-center gap-3 border-l-4 border-brand-blue pl-4 mb-6">
                <Terminal size={18} className="text-brand-blue" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">Request Config</h3>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Endpoint Uplink</label>
                 <div className="flex gap-2">
                    <select 
                      value={method} 
                      onChange={e => setMethod(e.target.value as any)}
                      className={`px-4 py-3 rounded-xl text-[11px] font-black border transition-all outline-none ${
                        method === 'GET' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        method === 'POST' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}
                    >
                      {methods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input 
                      value={url} 
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://api.skyverses.com/v1/..."
                      className="flex-grow bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 p-4 rounded-xl text-[11px] font-mono outline-none focus:ring-1 focus:ring-brand-blue text-slate-800 dark:text-white"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Content Type</label>
                   <select 
                    value={contentType}
                    onChange={e => setContentType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-brand-blue"
                   >
                      <option value="application/json">JSON</option>
                      <option value="application/x-www-form-urlencoded">Form URL Encoded</option>
                   </select>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Authorization</label>
                   <button 
                    onClick={() => setUseAuth(!useAuth)} 
                    className={`flex items-center justify-between p-3 border rounded-xl transition-all ${useAuth ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-slate-50 dark:bg-black/40 border-black/5 dark:border-white/5 text-gray-400'}`}
                   >
                      <div className="flex items-center gap-2">
                        <Shield size={14} />
                        <span className="text-[9px] font-black uppercase">Inject Auth</span>
                      </div>
                      {useAuth ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                   </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Payload (Request Body)</label>
                    <button onClick={() => setRequestBody('')} className="text-[8px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest">Clear Body</button>
                 </div>
                 <textarea 
                   value={requestBody}
                   onChange={e => setRequestBody(e.target.value)}
                   disabled={method === 'GET'}
                   className={`w-full bg-[#0c0c0e] border border-white/5 p-6 rounded-2xl text-[12px] font-mono text-indigo-400 resize-none h-[280px] outline-none focus:border-brand-blue/30 transition-all ${method === 'GET' ? 'opacity-30 grayscale cursor-not-allowed' : 'shadow-inner'}`}
                   placeholder={contentType === 'application/json' ? '{ ... }' : 'key1=value1&key2=value2...'}
                 />
                 {contentType === 'application/x-www-form-urlencoded' && method !== 'GET' && (
                   <p className="text-[8px] text-amber-500 font-bold uppercase italic px-2">Body will be sent as raw string without JSON conversion.</p>
                 )}
              </div>

              <div className="pt-4 flex gap-4">
                 <button onClick={clearSandbox} className="px-6 py-4 border border-black/5 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all">Reset</button>
                 <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="flex-grow bg-brand-blue text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-brand-blue/30 flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                   {loading ? 'INITIALIZING...' : 'UPLINK REQUEST'}
                 </button>
              </div>
           </div>
        </div>

        {/* RESPONSE PANE */}
        <div className="xl:col-span-7 flex flex-col">
           <div className="flex-grow bg-white dark:bg-[#0c0c0e] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative">
              
              {/* Terminal Header */}
              <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-black/40">
                 <div className="flex items-center gap-6">
                    <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></div>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] italic">UPLINK_TERMINAL_OUTPUT</span>
                 </div>

                 {response && (
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2">
                          <Clock size={12} className="text-brand-blue" />
                          <span className="text-[10px] font-black text-gray-400">{response.time}ms</span>
                       </div>
                       <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase border ${response.isError ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {response.status} {response.statusText}
                       </div>
                    </div>
                 )}
              </div>

              {/* Terminal Content */}
              <div className="flex-grow overflow-y-auto p-10 font-mono no-scrollbar bg-black min-h-[500px]">
                 {response ? (
                   <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[10px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2">
                               <ChevronRight size={14} className="text-brand-blue" /> Response_Payload
                            </h4>
                            <button onClick={handleCopyResponse} className="p-2 text-gray-500 hover:text-white transition-all">
                               {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                         </div>
                         <pre className="text-[13px] leading-relaxed text-zinc-400 whitespace-pre-wrap select-all selection:bg-brand-blue/30 selection:text-white">
                            {JSON.stringify(response.data, null, 2)}
                         </pre>
                      </div>

                      <div className="pt-8 border-t border-white/5 space-y-4 opacity-50 hover:opacity-100 transition-opacity">
                         <h4 className="text-[9px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2">
                            <Info size={12} /> Response_Headers
                         </h4>
                         <div className="grid grid-cols-1 gap-1">
                            {Object.entries(response.headers).map(([k, v]) => (
                               <div key={k} className="text-[10px] flex gap-4">
                                  <span className="text-brand-blue shrink-0 min-w-[140px] uppercase font-black">{k}:</span>
                                  <span className="text-zinc-500 break-all">{v}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-20">
                      <Terminal size={120} strokeWidth={0.5} />
                      <p className="text-xl font-black uppercase tracking-[0.5em] italic">Await_Signal...</p>
                   </div>
                 )}
              </div>

              {/* Status Bar */}
              <div className="p-4 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex justify-between items-center text-[9px] font-black uppercase text-gray-500 italic">
                 <div className="flex items-center gap-3">
                    <Activity size={12} className="text-emerald-500" />
                    <span>Registry Uplink Stable</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                       <FileCode size={10} />
                       <span>{contentType === 'application/json' ? 'JSON_MODE' : 'URLENCODED_MODE'}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue shadow-[0_0_8px_#0090ff] animate-pulse"></div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
