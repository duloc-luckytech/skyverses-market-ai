
import React, { useState } from 'react';
import DemoInterface from '../components/DemoInterface';
import { Sparkles, Terminal, Video, Image as ImageIcon, Zap, AlertCircle, Cpu, ChevronRight } from 'lucide-react';

const DemoPlayground = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video' | 'automation'>('text');

  const tabs = [
    { id: 'text', label: 'Intelligence', icon: <Terminal className="w-5 h-5" />, desc: 'Semantic reasoning & synthesis' },
    { id: 'image', label: 'Vision', icon: <ImageIcon className="w-5 h-5" />, desc: 'Creative asset generation' },
    { id: 'video', label: 'Motion', icon: <Video className="w-5 h-5" />, desc: 'Temporal & logic dynamics' },
    { id: 'automation', label: 'Agents', icon: <Cpu className="w-5 h-5" />, desc: 'Autonomous orchestration' },
  ];

  return (
    <div className="pt-32 pb-24 bg-[#020617] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
              <Sparkles className="w-4 h-4" /> Capabilities Lab
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Demo Playground</h1>
            <p className="text-gray-400 text-lg">
              Experience the core logic powering our enterprise ecosystem. 
              Switch between modalities to test the adaptive intelligence of our stack.
            </p>
          </div>
          <div className="glass-effect p-6 rounded-3xl border-yellow-500/20 bg-yellow-500/5 max-w-sm flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Sandbox Protocol</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Output restricted and watermarked. Limited to 3 requests per session.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation */}
          <div className="lg:col-span-3 space-y-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left p-6 rounded-[2rem] border transition-all relative group overflow-hidden ${activeTab === tab.id ? 'bg-blue-600/10 border-blue-500/50 shadow-2xl shadow-blue-500/10' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                {activeTab === tab.id && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-blue-600"></div>
                )}
                <div className={`mb-4 p-3 rounded-2xl w-fit ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                  {tab.icon}
                </div>
                <div className={`font-black text-sm mb-1 uppercase tracking-widest ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`}>
                  {tab.label}
                </div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight line-clamp-1">{tab.desc}</div>
                <ChevronRight className={`absolute top-1/2 -translate-y-1/2 right-6 w-4 h-4 transition-all ${activeTab === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
              </button>
            ))}
          </div>

          {/* Playground Area */}
          <div className="lg:col-span-9">
            <div className="relative">
               <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
               <DemoInterface type={activeTab} />
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="glass-effect p-10 rounded-[2.5rem] border-white/5 bg-black/20">
                <h4 className="font-black text-white text-lg mb-6 uppercase tracking-widest">Production Ready?</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400">01</span>
                    Fine-tuned on your proprietary datasets.
                  </li>
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400">02</span>
                    Seamless API orchestration with legacy tools.
                  </li>
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400">03</span>
                    Secure PII scrubbing & SOC2 compliance.
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-[2.5rem] p-10 border border-white/10 flex flex-col justify-center">
                <h4 className="font-black text-white text-xl mb-4">Launch Private Beta</h4>
                <p className="text-sm text-blue-100/60 mb-8 leading-relaxed">
                  Ready to test with your own internal data? We can spin up a dedicated sandbox environment for your team in under 48 hours.
                </p>
                <button 
                  onClick={() => window.location.hash = '#/booking'}
                  className="bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                >
                  Request Private Prototype
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPlayground;
