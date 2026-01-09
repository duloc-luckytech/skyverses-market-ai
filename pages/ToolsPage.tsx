
import React, { useState, useEffect } from 'react';
import { generateDemoText, generateDemoImage, generateDemoVideo } from '../services/gemini';
import { 
  Zap, 
  Image as ImageIcon, 
  Video, 
  Terminal, 
  Loader2, 
  ShieldAlert, 
  Download, 
  Cpu,
  ArrowRight
} from 'lucide-react';

const ToolsPage = () => {
  const [credits, setCredits] = useState<number>(3);
  const [activeTool, setActiveTool] = useState<'text' | 'image' | 'video'>('image');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState('IDLE');

  useEffect(() => {
    const savedCredits = localStorage.getItem('nexus_credits');
    if (savedCredits !== null) {
      setCredits(parseInt(savedCredits));
    } else {
      localStorage.setItem('nexus_credits', '3');
    }
  }, []);

  const handleExecute = async () => {
    if (credits <= 0) return;
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);
    setStatus('INITIALIZING_NEURAL_LINK...');

    try {
      let output = null;
      if (activeTool === 'image') {
        setStatus('SYNTHESIZING_BLUEPRINT...');
        output = await generateDemoImage(input);
      } else if (activeTool === 'video') {
        setStatus('ORCHESTRATING_MOTION (This may take a minute)...');
        // Fix: generateDemoVideo expects an object of type VideoProductionParams
        output = await generateDemoVideo({ prompt: input });
      } else {
        setStatus('ANALYZING_LOGIC...');
        output = await generateDemoText(input);
      }

      if (output) {
        setResult(output);
        const newCredits = credits - 1;
        setCredits(newCredits);
        localStorage.setItem('nexus_credits', newCredits.toString());
        setStatus('EXECUTION_SUCCESSFUL');
      } else {
        setStatus('SYSTEM_REJECTION: FAILED');
      }
    } catch (err: any) {
      console.error("Tools Hub Error:", err);
      setStatus('CRITICAL_SYSTEM_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: 'image', name: 'Img_Synth', icon: <ImageIcon className="w-5 h-5" />, desc: 'Blueprint Generation' },
    { id: 'video', name: 'Vid_Motion', icon: <Video className="w-5 h-5" />, desc: 'Architectural Animation' },
    { id: 'text', name: 'Logic_Core', icon: <Terminal className="w-5 h-5" />, desc: 'Logic Synthesis' },
  ];

  return (
    <div className="pt-32 pb-24 bg-black min-h-screen text-white relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
          <div className="space-y-6">
            <h1 className="text-6xl font-black uppercase tracking-tighter">Tools Hub.</h1>
            <p className="text-gray-500 max-w-xl mono text-xs uppercase">Direct access to Nexus modalities. Validated for rapid prototyping.</p>
          </div>
          <div className="border border-white/20 p-8 space-y-4 bg-white/5 min-w-[280px]">
            <div className="flex justify-between items-center text-[10px] mono">
              <span className="text-gray-500">QUOTA</span>
              <span className={credits > 0 ? 'text-green-500' : 'text-red-500'}>{credits > 0 ? 'ACTIVE' : 'DEPLETED'}</span>
            </div>
            <div className="text-4xl font-black tracking-tighter">0{credits} / 03</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => { setActiveTool(tool.id as any); setResult(null); }}
                className={`w-full text-left p-8 border transition-all flex items-center gap-6 relative ${activeTool === tool.id ? 'bg-white text-black border-white' : 'border-white/10 text-white'}`}
              >
                {tool.icon}
                <div>
                  <div className="font-black uppercase text-sm mb-1">{tool.name}</div>
                  <div className="text-[9px] mono uppercase opacity-50">{tool.desc}</div>
                </div>
                {activeTool === tool.id && <ArrowRight className="absolute right-6 w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="lg:col-span-8">
            <div className="border border-white/20 bg-black/40 p-10 space-y-10 min-h-[600px] flex flex-col">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input 
                    type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder={`Describe ${activeTool} requirements...`}
                    disabled={loading || credits <= 0}
                    className="flex-grow bg-transparent border-b border-white/20 py-4 mono text-sm focus:outline-none"
                  />
                  <button onClick={handleExecute} disabled={loading || credits <= 0 || !input.trim()} className="bg-white text-black px-8 py-4 text-[10px] font-black uppercase">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'EXECUTE'}
                  </button>
                </div>
                <div className="text-[9px] mono text-gray-600">STATUS: {status}</div>
              </div>

              <div className="flex-grow border border-white/10 bg-white/5 flex items-center justify-center relative overflow-hidden">
                 {loading ? (
                   <div className="text-center space-y-6">
                      <div className="w-16 h-16 border-t-2 border-white rounded-full animate-spin mx-auto"></div>
                      <div className="mono text-[10px] text-white animate-pulse">{status}</div>
                   </div>
                 ) : result ? (
                   <div className="w-full h-full p-4">
                     {activeTool === 'image' && <img src={result} className="w-full h-full object-contain" alt="Generated" />}
                     {activeTool === 'video' && <video src={result} controls className="max-w-full max-h-[400px]" />}
                     {activeTool === 'text' && <div className="p-8 mono text-xs leading-relaxed text-gray-300">{result}</div>}
                   </div>
                 ) : (
                   <div className="text-center opacity-20"><Cpu className="w-12 h-12 mx-auto mb-4" /><span className="mono text-[10px] uppercase">Awaiting_Instructions</span></div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
