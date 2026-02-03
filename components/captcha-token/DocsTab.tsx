
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, Copy, Check, ExternalLink, 
  Code2, ChevronRight, Globe,
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DocsTab: React.FC = () => {
  const { showToast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    showToast(`Đã sao chép ${section}`, 'info');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlExample = `curl --location 'https://captcha.skyverses.com/captcha/request' \\
--header 'Content-Type: application/json' \\
--data '{
    "action": "IMAGE_GENERATION",
    "apiKey": "YOUR_API_KEY_HERE"
}'`;

  const responseExample = `{
    "success": true,
    "captchaToken": "cap_token_87dd7a9edb5c...",
    "quotaRemaining": 1420
}`;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-10 pb-20"
    >
      <div className="p-10 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl space-y-10">
         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">API Documentation</h3>
               <p className="text-sm text-gray-500 font-medium">Tích hợp giải mã Captcha vào ứng dụng của bạn qua REST API.</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase text-slate-400">
               <span className="flex items-center gap-2"><Globe size={14}/> Base URL: captcha.skyverses.com</span>
            </div>
         </div>

         {/* ENDPOINT INFO */}
         <div className="space-y-8">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 bg-indigo-600 text-white text-[11px] font-black rounded-lg shadow-lg">POST</div>
                  <div className="flex-grow p-4 bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl font-mono text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-between group">
                     <span>/captcha/request</span>
                     <button onClick={() => handleCopy('https://captcha.skyverses.com/captcha/request', 'Endpoint')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white">
                        {copiedSection === 'Endpoint' ? <Check size={14} /> : <Copy size={14} />}
                     </button>
                  </div>
               </div>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-2">Yêu cầu giải mã và lấy Token xác thực</p>
            </div>

            {/* REQUEST BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                     <Terminal size={14} /> Request Parameters
                  </h4>
                  <div className="space-y-4">
                     <ParamRow name="action" type="String" required desc="Loại kịch bản: IMAGE_GENERATION hoặc VIDEO_GENERATION" />
                     <ParamRow name="apiKey" type="String" required desc="Mã truy cập node được cấp tại tab UPLINK" />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                       <Code2 size={14} /> CURL EXAMPLE
                    </h4>
                    <button onClick={() => handleCopy(curlExample, 'CURL')} className="text-[10px] font-black uppercase text-indigo-500 hover:underline">
                       {copiedSection === 'CURL' ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                  <pre className="p-6 bg-black rounded-2xl border border-white/5 text-[11px] font-mono text-indigo-400 overflow-x-auto shadow-inner leading-relaxed">
                     {curlExample}
                  </pre>
               </div>
            </div>

            {/* RESPONSE BODY */}
            <div className="pt-10 border-t border-black/5 dark:border-white/5 space-y-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                        <ArrowRightLeft size={14} /> Response Manifest
                     </h4>
                     <div className="space-y-4">
                        <ParamRow name="success" type="Boolean" desc="Trạng thái xử lý lệnh" />
                        <ParamRow name="captchaToken" type="String" desc="Token kết quả dùng để vượt rào cản captcha" />
                        <ParamRow name="quotaRemaining" type="Integer" desc="Số lượng kịch bản còn lại trong node" />
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                          <CheckCircle2 size={14} className="text-emerald-500" /> SUCCESS JSON
                       </h4>
                       <button onClick={() => handleCopy(responseExample, 'Response')} className="text-[10px] font-black uppercase text-emerald-500 hover:underline">
                          {copiedSection === 'Response' ? 'COPIED' : 'COPY'}
                       </button>
                     </div>
                     <pre className="p-6 bg-black rounded-2xl border border-white/5 text-[11px] font-mono text-emerald-500 overflow-x-auto shadow-inner leading-relaxed">
                        {responseExample}
                     </pre>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

const ParamRow = ({ name, type, required = false, desc }: any) => (
  <div className="group border-l-2 border-black/5 dark:border-white/5 pl-4 py-2 hover:border-indigo-500 transition-colors">
     <div className="flex items-center gap-3 mb-1">
        <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase italic">{name}</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase">{type}</span>
        {required && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">REQUIRED</span>}
     </div>
     <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-tighter">{desc}</p>
  </div>
);
