
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, Mic2, 
  Sparkles, AudioLines, ShieldCheck, 
  ChevronRight, Star, Download,
  Terminal, MonitorPlay, BrainCircuit,
  Volume2, Globe, Database, ArrowRight,
  Shield, CheckCircle2, Mic
} from 'lucide-react';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import VoiceStudioWorkspace from '../../components/VoiceStudioWorkspace';

const VoiceStudio = () => {
  // Tìm kiếm solution theo slug chính xác trong data.ts
  const solution = SOLUTIONS.find(s => s.slug === 'ai-voice-studio');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Nếu đang mở Studio (Modal Công cụ)
  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <VoiceStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  // Nếu không tìm thấy solution, hiển thị trang trống hoặc quay lại market
  if (!solution) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-black uppercase tracking-widest">Node Not Found</h2>
        <Link to="/" className="text-brand-blue underline uppercase text-xs">Back to Market</Link>
      </div>
    );
  }

  const PRICING_TIERS = [
    { name: 'Gói Cơ Bản', price: 'Miễn phí', credits: '0', features: ['10 Giọng nói AI tiêu chuẩn', 'Chất lượng 24kHz', 'Sử dụng cá nhân'] },
    { name: 'Gói Creator', price: '490,000đ', credits: '5,000', popular: true, features: ['Unlimited Voice Design', 'Chất lượng 48kHz Pro', 'Bản quyền thương mại', 'Hỗ trợ ưu tiên'] },
    { name: 'Gói Studio', price: '1,990,000đ', credits: '25,000', features: ['Toàn bộ model cao cấp nhất', 'Clone giọng nói 1:1', 'API Access', 'Node xử lý riêng'] }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#ff4b3a]/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#ff4b3a]/5 rounded-full blur-[200px]"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[200px]"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 lg:px-12 py-20 overflow-hidden">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4b3a]/10 border border-[#ff4b3a]/20 text-[#ff4b3a] text-[10px] font-black uppercase tracking-[0.3em] italic">
              <Sparkles size={14} /> The All-in-One Voice Ecosystem
            </div>
            
            <h1 className="text-6xl lg:text-[120px] font-black leading-[0.85] tracking-tighter italic uppercase">
              Voice Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4b3a] via-orange-400 to-purple-500">
                Vision.
              </span>
            </h1>
            
            <p className="text-xl lg:text-3xl text-gray-400 font-medium max-w-xl leading-tight border-l-2 border-[#ff4b3a] pl-8">
              Design unique AI voices from text description, clone your digital identity, and synthesize studio-quality narration for global content.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-[#ff4b3a] text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,75,58,0.3)] hover:scale-105 active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
              >
                Launch Voice Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                View Use Cases <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-video bg-[#0a0a0c] border border-white/5 rounded-xl p-4 shadow-3xl overflow-hidden group ring-1 ring-white/10">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#ff4b3a]/10 to-transparent"></div>
               <div className="h-full w-full bg-[#050505] rounded-lg border border-white/5 flex overflow-hidden">
                  <div className="w-1/3 border-r border-white/5 p-4 space-y-6 hidden md:block">
                    <div className="space-y-2">
                      <div className="h-1 w-8 bg-[#ff4b3a]"></div>
                      <div className="h-3 w-full bg-white/5 rounded-sm"></div>
                    </div>
                    <div className="space-y-4 pt-4 opacity-40">
                      {[1, 2, 3].map(i => <div key={i} className="h-8 w-full bg-white/5 rounded-sm border border-white/5"></div>)}
                    </div>
                  </div>
                  <div className="flex-grow p-6 flex flex-col justify-between">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <AudioLines className="text-[#ff4b3a] animate-pulse" size={20} />
                           <div className="h-2 w-32 bg-white/10 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                           <div className="h-3 w-full bg-white/5 rounded-sm"></div>
                           <div className="h-3 w-5/6 bg-white/5 rounded-sm"></div>
                           <div className="h-3 w-4/6 bg-white/5 rounded-sm"></div>
                        </div>
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black text-[#ff4b3a] uppercase tracking-widest italic leading-none mb-1">Acoustic_Engine_v4.2</p>
                           <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Identity Mastery.</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-[#ff4b3a] flex items-center justify-center shadow-2xl">
                           <Play size={20} fill="white" className="ml-1" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: PRICING --- */}
      <section className="py-40 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-24">
           <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none">Investment <br /><span className="text-[#ff4b3a]">Tiers.</span></h2>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.5em] italic">Choose your compute node capability</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {PRICING_TIERS.map((tier) => (
                <div key={tier.name} className={`p-12 bg-[#08080a] border-2 rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 group relative overflow-hidden ${tier.popular ? 'border-[#ff4b3a] shadow-[0_30px_100px_rgba(255,75,58,0.1)] scale-105 z-10' : 'border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'}`}>
                   {tier.popular && (
                      <div className="absolute top-0 right-0 bg-[#ff4b3a] text-white px-6 py-2 text-[8px] font-black uppercase tracking-widest rounded-bl-2xl shadow-xl">MOST POPULAR</div>
                   )}
                   <div className="space-y-10 text-left">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">{tier.name}</p>
                         <h4 className="text-5xl font-black italic tracking-tighter text-white">{tier.price}</h4>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                         <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Monthly Power</p>
                         <div className="flex items-center gap-2">
                            <Zap size={14} className="text-[#ff4b3a]" fill="currentColor" />
                            <span className="text-lg font-black italic">{tier.credits} <span className="text-[10px] not-italic opacity-40">CR</span></span>
                         </div>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-white/5">
                         {tier.features.map(f => (
                            <div key={f} className="flex items-center gap-4">
                               <CheckCircle2 size={16} className="text-[#ff4b3a] shrink-0" />
                               <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{f}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="mt-16">
                      <button 
                        onClick={() => setIsStudioOpen(true)}
                        className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 ${tier.popular ? 'bg-[#ff4b3a] text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white hover:text-black'}`}
                      >
                         Initialize Plan
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- SECTION 3: FINAL CTA --- */}
      <section className="py-60 text-center relative overflow-hidden bg-white text-black border-t border-white/5 transition-colors">
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-black leading-none tracking-tighter select-none italic">
          VOICE VOICE VOICE VOICE
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic">Start <br /> <span className="text-[#ff4b3a]">Building.</span></h2>
           <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-black text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Launch Studio Node <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • Instant Export</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-white/5 bg-black transition-colors duration-500">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-white text-lg tracking-tighter italic font-black uppercase">AI VOICE STUDIO</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Industrial-grade acoustic synthesis for creative studios. Powered by Skyverses neural network.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-[#ff4b3a] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#ff4b3a] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#ff4b3a] transition-colors">Privacy Policy</a>
           </div>
        </div>
      </footer>

    </div>
  );
};

const AlertCircle = ({ size, className }: { size?: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

export default VoiceStudio;
