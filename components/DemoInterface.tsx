
import React, { useState, useEffect, useRef } from 'react';
import { generateDemoText, generateDemoImage, generateDemoVideo } from '../services/gemini';
import { Loader2, Terminal, Send, Lock, Activity, Image as ImageIcon, Upload, Download, Zap, AlertTriangle, ExternalLink } from 'lucide-react';

interface DemoInterfaceProps {
  type: 'text' | 'image' | 'video' | 'automation'; 
}

const DemoInterface: React.FC<DemoInterfaceProps> = ({ type }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{type: 'in' | 'out', content: any, contentType?: 'text' | 'image' | 'video'}[]>([]);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number>(3);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideoTool = type === 'video' || type === 'automation';

  useEffect(() => {
    const saved = localStorage.getItem('nexus_credits');
    if (saved) setCredits(parseInt(saved));
    else localStorage.setItem('nexus_credits', '3');

    if (isVideoTool) {
      checkKeyStatus();
    }
  }, [type]);

  const checkKeyStatus = async () => {
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setNeedsKey(!hasKey);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false); 
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading || credits <= 0) return;

    if (isVideoTool && needsKey) {
      await handleSelectKey();
      return;
    }

    const userIn = input || (selectedImage ? "[SOURCE_IMAGE_LOADED_FOR_SYNTHESIS]" : "");
    setHistory(prev => [...prev, { type: 'in', content: userIn }]);
    setInput('');
    setLoading(true);

    try {
      let response;
      let contentType: 'text' | 'image' | 'video' = 'text';

      if (type === 'text') {
        response = await generateDemoText(userIn);
      } else if (type === 'image') {
        response = await generateDemoImage(userIn);
        contentType = 'image';
      } else if (isVideoTool) {
        // Fix: generateDemoVideo expects a single object of type VideoProductionParams
        // Fix: Changed firstFrame to references
        response = await generateDemoVideo({ prompt: input, references: selectedImage ? [selectedImage] : undefined });
        contentType = 'video';
      }

      if (response) {
        setHistory(prev => [...prev, { type: 'out', content: response, contentType }]);
        const newCredits = credits - 1;
        setCredits(newCredits);
        localStorage.setItem('nexus_credits', newCredits.toString());
        setSelectedImage(null); 
      } else {
        setHistory(prev => [...prev, { type: 'out', content: 'SYSTEM_REJECTION: GENERATION_FAILED' }]);
      }
    } catch (err: any) {
      console.error(err);
      const errorStr = typeof err === 'string' ? err : JSON.stringify(err);
      const errorMessage = err?.message || "";
      
      const isNotFoundError = errorStr.includes("Requested entity was not found") || 
                           err?.status === 404 || 
                           err?.status === 'NOT_FOUND' ||
                           errorMessage.includes("Requested entity was not found");

      if (isVideoTool && isNotFoundError) {
        setHistory(prev => [...prev, { 
          type: 'out', 
          content: 'ERROR 404: Veo model requires a paid API key. Please select a valid key from a paid GCP project.' 
        }]);
        setNeedsKey(true);
        handleSelectKey();
      } else {
        setHistory(prev => [...prev, { type: 'out', content: `CRITICAL_ERROR: ${errorMessage || 'CONNECTION_TIMEOUT'}` }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-white/10 bg-black rounded-sm overflow-hidden flex flex-col h-[700px] mono relative shadow-[0_0_60px_rgba(0,144,255,0.05)]">
      {/* Key Selection Overlay for Veo */}
      {isVideoTool && needsKey && !loading && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 border border-brand-blue mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(0,144,255,0.2)]">
              <Lock className="w-10 h-10 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Auth Required</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-wider font-bold">
                Veo video synthesis requires high-frequency compute authorized via a paid project key.
              </p>
              <div className="pt-8 flex flex-col gap-4">
                <button 
                  onClick={handleSelectKey}
                  className="btn-sky-primary py-5 px-10 text-[11px] tracking-widest"
                >
                  Link Paid Project API
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-gray-600 hover:text-brand-blue flex items-center justify-center gap-2 font-black uppercase"
                >
                  Billing Architecture <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Console Header */}
      <div className="bg-white text-black px-8 py-5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em]">
          <Terminal className="w-4 h-4" /> Nexus_Protocol_v4.2
        </div>
        <div className="flex gap-10 text-[10px] font-black uppercase items-center">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">CREDIT_SYNC:</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-3.5 h-3.5 border-2 border-black ${i <= credits ? 'bg-brand-blue' : 'bg-transparent'}`}></div>
              ))}
            </div>
            <span className={credits > 0 ? 'text-brand-blue' : 'text-red-600'}>0{credits}/03</span>
          </div>
          <span className="flex items-center gap-2 text-green-600"><Activity className="w-4 h-4" /> UPLINK_ENCRYPTED</span>
        </div>
      </div>

      {/* Console Body */}
      <div 
        ref={scrollRef}
        className="flex-grow p-10 overflow-y-auto space-y-10 scrollbar-hide text-[12px] leading-relaxed bg-[#020202]"
      >
        <div className="text-gray-600 border-b border-white/5 pb-8 font-bold">
          [SYSTEM] BOOTING ARCHITECTURAL CORE...<br />
          [SYSTEM] MODALITY: {type === 'automation' ? 'IMAGE_TO_MOTION_WEAVER' : type.toUpperCase()}<br />
          {isVideoTool && <span className="text-brand-blue">[ENGINE] VEO_LINK_ESTABLISHED</span>} <br />
          [SYSTEM] STANDBY_FOR_INPUT...
        </div>

        {history.map((entry, i) => (
          <div key={i} className={`flex gap-6 animate-in fade-in slide-in-from-left-4 duration-500 ${entry.type === 'in' ? 'text-white' : 'text-gray-400'}`}>
            <span className="shrink-0 opacity-20 font-black text-lg">{entry.type === 'in' ? '>' : '#'}</span>
            <div className="flex-grow pt-1">
              {entry.type === 'out' && entry.contentType === 'image' ? (
                <div className="border border-white/10 p-3 inline-block bg-white/5 group relative mt-4 shadow-2xl">
                  <img src={entry.content} alt="Output" className="max-w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={entry.content} download="nexus_output.png" className="bg-brand-blue p-4 text-white block rounded-full shadow-2xl">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ) : entry.type === 'out' && entry.contentType === 'video' ? (
                <div className="border border-white/10 p-6 inline-block bg-white/5 mt-4">
                  <video src={entry.content} controls className="max-w-full max-h-[400px] shadow-[0_0_50px_rgba(0,144,255,0.1)]" />
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-[9px] mono uppercase opacity-40 font-black tracking-widest italic">NEURAL_RENDER // COMPLETED</div>
                    <a href={entry.content} download="nexus_motion.mp4" className="text-[10px] font-black uppercase border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">Export .mp4</a>
                  </div>
                </div>
              ) : (
                <p className={`whitespace-pre-wrap ${entry.type === 'in' ? 'font-black text-sm tracking-tight' : entry.content.includes('ERROR') ? 'text-red-500 font-black' : 'opacity-80 font-medium'}`}>{entry.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-6 text-brand-blue animate-pulse">
            <span className="shrink-0 font-black text-lg">#</span>
            <div className="flex items-center gap-4 pt-1">
              <Loader2 className="w-4 h-4 animate-spin" /> 
              <span className="uppercase tracking-[0.3em] font-black text-[11px]">Synthesizing_Architectural_Object...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input / Tool Bar */}
      <div className="border-t border-white/10 p-8 space-y-6 bg-black shrink-0">
        {type === 'automation' && (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-4 text-[11px] px-8 py-3 border font-black tracking-widest transition-all ${selectedImage ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500 hover:text-white hover:border-white'}`}
            >
              <Upload className="w-4 h-4" /> {selectedImage ? "SOURCE_LOADED" : "UPLOAD_BLUEPRINT"}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            {selectedImage && (
              <div className="h-12 w-20 border border-brand-blue/30 overflow-hidden relative group">
                <img src={selectedImage} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedImage(null)} className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-black">REMOVE</button>
              </div>
            )}
            <div className="text-[9px] mono text-gray-700 uppercase font-black tracking-widest hidden lg:block">Context image required for Weaver sequence</div>
          </div>
        )}

        <form onSubmit={handleDemo} className="flex gap-6 items-center">
          <div className="shrink-0 flex items-center px-2">
            <span className="text-brand-blue font-black text-xl">{'>'}</span>
          </div>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={credits <= 0 || loading}
            placeholder={credits > 0 ? `Describe parameters for neural ${type} synthesis...` : "QUOTA_LIMIT_REACHED. CONTACT_ADMIN."}
            className="flex-grow bg-transparent border-none text-white focus:outline-none mono text-base disabled:opacity-20 placeholder:text-gray-800 font-bold"
          />
          <button 
            type="submit" 
            disabled={loading || credits <= 0 || (!input.trim() && !selectedImage)} 
            className="bg-brand-blue text-white p-4 hover:scale-105 transition-all disabled:opacity-10 shadow-[0_0_30px_rgba(0,144,255,0.3)]"
          >
            <Zap className="w-6 h-6 fill-white" />
          </button>
        </form>
      </div>
      
      {/* Top Scanning Line */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue/20 z-50 overflow-hidden">
          <div className="h-full bg-brand-blue w-1/3 animate-progress shadow-[0_0_15px_rgba(0,144,255,1)]"></div>
        </div>
      )}
    </div>
  );
};

export default DemoInterface;
