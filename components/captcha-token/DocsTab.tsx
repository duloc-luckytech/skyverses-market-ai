
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Copy, Check, ExternalLink, 
  Code2, ChevronRight, Globe,
  Activity,
  Server,
  Cpu,
  Key as KeyIcon,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

type CodeLang = 'CURL' | 'PYTHON' | 'NODEJS';
type CaptchaAction = 'IMAGE_GENERATION' | 'VIDEO_GENERATION' | 'VOICE_GENERATION';

export const DocsTab: React.FC = () => {
  const { showToast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<CodeLang>('CURL');
  
  // Interactive States
  const [action, setAction] = useState<CaptchaAction>('IMAGE_GENERATION');
  const [apiKey, setApiKey] = useState('cap_87dd7a9edb5c2...');

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    showToast(`Copied ${section} to clipboard`, 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getCodeContent = (lang: CodeLang) => {
    switch (lang) {
      case 'CURL':
        return `curl --location 'https://captcha.skyverses.com/captcha/request' \\
--header 'Content-Type: application/json' \\
--data '{
    "action": "${action}",
    "apiKey": "${apiKey}"
}'`;
      case 'PYTHON':
        return `import requests
import json

url = "https://captcha.skyverses.com/captcha/request"
payload = {
    "action": "${action}",
    "apiKey": "${apiKey}"
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
  apiKey: '${apiKey}'
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

  const responseExample = `{
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
                  <div className="w-2 h-6 bg-brand-blue rounded-full"></div>
                  <h3 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">API Reference</h3>
               </div>
               <p className="text-sm text-gray-500 font-medium max-w-xl italic">
                 Technical specifications for integrating Neural Captcha Resolution into your automated production workflows.
               </p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl">
                  <Globe size={14} className="text-brand-blue" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Endpoint: captcha.skyverses.com</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">System Status: Optimal</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start relative z-10">
            
            {/* SCHEMA & PARAMS (LEFT) */}
            <div className="lg:col-span-5 space-y-12">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-brand-blue" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500">Request Body Schema</h4>
                  </div>
                  
                  <div className="space-y-10">
                     {/* Action Selector */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex items-center gap-2">
                             action <span className="text-red-500">*</span>
                           </label>
                           <span className="text-[8px] font-bold text-brand-blue uppercase bg-brand-blue/10 px-1.5 py-0.5 rounded">Enum[String]</span>
                        </div>
                        <div className="relative group">
                           <select 
                             value={action}
                             onChange={(e) => setAction(e.target.value as CaptchaAction)}
                             className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-xs font-black uppercase italic outline-none focus:border-brand-blue/40 appearance-none cursor-pointer text-slate-800 dark:text-white shadow-inner transition-all"
                           >
                              <option value="IMAGE_GENERATION">IMAGE_GENERATION</option>
                              <option value="VIDEO_GENERATION">VIDEO_GENERATION</option>
                              <option value="VOICE_GENERATION">VOICE_GENERATION</option>
                           </select>
                           <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-brand-blue transition-colors" />
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed italic px-1 opacity-70">Specifies the captcha challenge type based on the active model node.</p>
                     </div>

                     {/* API Key Input (Auth) */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex items-center gap-2">
                             apiKey <span className="text-red-500">*</span>
                           </label>
                           <span className="text-[8px] font-bold text-purple-500 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded">Body Parameter</span>
                        </div>
                        <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <KeyIcon size={16} />
                           </div>
                           <input 
                             type="text"
                             value={apiKey}
                             onChange={(e) => setApiKey(e.target.value)}
                             className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 py-4 pl-12 pr-4 rounded-2xl text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 outline-none focus:border-brand-blue/40 shadow-inner transition-all"
                             placeholder="Your Secret API Key..."
                           />
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed italic px-1 opacity-70">Uplink authentication key required for identity verification and quota management.</p>
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-3xl flex gap-5 items-start shadow-sm transition-all hover:bg-brand-blue/10">
                  <Cpu size={24} className="text-brand-blue shrink-0 animate-pulse" />
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue italic">Real-time Implementation</p>
                     <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic">
                        Select a language and change parameters to see immediate integration examples on the right.
                     </p>
                  </div>
               </div>
            </div>

            {/* LIVE CODE PREVIEW (RIGHT) */}
            <div className="lg:col-span-7 space-y-8">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                     <Code2 size={16} className="text-indigo-500" />
                     <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 italic">Request Implementation</h4>
                  </div>
                  
                  <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-inner">
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
                  <pre className="p-8 bg-[#0a0a0c] rounded-[2rem] border border-white/5 text-[12px] font-mono text-indigo-400/90 overflow-x-auto shadow-2xl leading-relaxed min-h-[220px] scrollbar-hide">
                     <AnimatePresence mode="wait">
                       <motion.code
                         key={activeLang + action + apiKey}
                         initial={{ opacity: 0, y: 5 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -5 }}
                         className="block whitespace-pre"
                       >
                         {getCodeContent(activeLang)}
                       </motion.code>
                     </AnimatePresence>
                  </pre>
                  <button 
                    onClick={() => handleCopy(getCodeContent(activeLang), activeLang)}
                    className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/5 backdrop-blur-md"
                  >
                     {copiedSection === activeLang ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
               </div>

               {/* RESPONSE MANIFEST */}
               <div className="pt-10 space-y-8">
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-5">
                    <div className="flex items-center gap-3">
                       <Server size={16} className="text-emerald-500" />
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 italic">Response Schema</h4>
                    </div>
                    <button onClick={() => handleCopy(responseExample, 'JSON Response')} className="text-[9px] font-black uppercase text-emerald-500 hover:underline tracking-widest italic flex items-center gap-2">
                       <Copy size={12} /> COPY_JSON
                    </button>
                  </div>
                  <div className="relative group">
                    <pre className="p-8 bg-[#08080a] rounded-[2rem] border border-white/5 text-[12px] font-mono text-emerald-500/80 overflow-x-auto shadow-inner leading-relaxed">
                       {responseExample}
                    </pre>
                    <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none"></div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     <StatusBadge code="200" label="Success" color="text-emerald-500" />
                     <StatusBadge code="401" label="Invalid Key" color="text-rose-500" />
                     <StatusBadge code="402" label="No Quota" color="text-amber-500" />
                     <StatusBadge code="500" label="Node Busy" color="text-slate-500" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ code, label, color }: { code: string, label: string, color: string }) => (
  <div className="px-4 py-3 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:border-white/10">
    <span className={`text-xs font-black ${color}`}>{code}</span>
    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
  </div>
);
