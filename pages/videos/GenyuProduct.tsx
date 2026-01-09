
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Film, Clapperboard, Sparkles, 
  Layers, ArrowRight, ShieldCheck, 
  Terminal, Activity, Workflow, 
  LayoutGrid, Plus, Maximize2, Crown,
  Cpu, Move, Eye, Settings2, BarChart3,
  Box, Smartphone, MousePointer2,
  Fingerprint, Lock, ShieldAlert,
  Server, Shield
} from 'lucide-react';
import GenyuWorkspace from '../../components/GenyuWorkspace';
import { motion } from 'framer-motion';

const GenyuProduct = () => {
  const solution = SOLUTIONS.find(s => s.id === 'STUDIO-ARCHITECT-V1');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  if (!solution) return null;

  // Localized Content
  const content = {
    hero: {
      en: 'The definitive narrative workstation for enterprise. Built for high-frequency agency workflows and cinematic mastery.',
      vi: 'Workstation kể chuyện tối thượng cho doanh nghiệp. Xây dựng cho quy trình Agency hiệu suất cao và điện ảnh đỉnh cao.',
      ko: '기업을 위한 최고의 내러티브 워크스테이션. 고주파 에이전시 워크플로우와 영화적 숙달을 위해 제작되었습니다.',
      ja: '企業のための究極のナラティブワークステーション。高頻度のエージェンシーワークフローと映画的な習熟のために構築されています。'
    },
    cta: {
      en: 'Initialize Architect Studio',
      vi: 'Khởi tạo Studio Architect',
      ko: '아키텍트 스튜디오 초기화',
      ja: 'アーキテクトスタジオを初期化'
    },
    specs_title: {
      en: 'Industrial Specifications',
      vi: 'Thông số kỹ thuật công nghiệp',
      ko: '산업 사양',
      ja: '産業仕様'
    },
    workflow_title: {
      en: 'Production Architecture',
      vi: 'Kiến trúc sản xuất',
      ko: '프로덕션 아키텍처',
      ja: 'プロダクションアーキテクチャ'
    }
  };

  const getTranslation = (obj: any) => obj[lang] || obj['en'];

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden selection:bg-brand-blue/30 transition-colors duration-500 pb-32">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#0090ff08_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#0090ff12_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-brand-blue transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('nav.browse')} Repository</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-brand-blue">
                      <Clapperboard size={32} />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">ARCHITECT SUITE V1.4</span>
                   </div>
                   <h1 className="text-6xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Studio <br /> <span className="text-brand-blue">Architect.</span>
                   </h1>
                </div>
                
                <p className="text-xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-10 max-w-2xl italic">
                  “{getTranslation(content.hero)}”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {getTranslation(content.cta)} <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-brand-blue/60 tracking-widest italic">H100 CLUSTER SYNC</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Professional Inference Node</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group">
                  <img src={solution.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="Architect Hub" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 space-y-2">
                     <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.5em]">Scene System v1.0</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Deterministic Control.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- WORKFLOW SECTION --- */}
        <section className="py-32 border-t border-black/5 dark:border-white/5">
           <div className="max-w-4xl mb-24">
              <span className="text-brand-blue font-black uppercase tracking-[0.4em] text-[10px] block mb-4">{getTranslation(content.workflow_title)}</span>
              <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic">From Intent to <br /><span className="text-brand-blue">Industrial Master.</span></h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Uplink', icon: <Terminal />, desc: 'Semantic intake of raw narratives. Direct AI script analysis.' },
                { step: '02', title: 'Orchestrate', icon: <Workflow />, desc: 'Decompose story into logical scene nodes with identity lock.' },
                { step: '03', title: 'Synthesize', icon: <Cpu />, desc: 'Parallel H100 GPU nodes render high-bitrate cinematic takes.' },
                { step: '04', title: 'Master', icon: <Crown />, desc: 'Upscale, assemble, and export studio-ready 4K sequences.' }
              ].map((item) => (
                 <div key={item.step} className="p-10 bg-black/[0.02] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm space-y-6 group hover:border-brand-blue/30 transition-all">
                    <div className="flex justify-between items-start">
                       <span className="text-3xl font-black text-brand-blue italic">{item.step}</span>
                       <div className="text-gray-300 dark:text-gray-700 group-hover:text-brand-blue transition-colors">
                          {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-lg font-black uppercase tracking-tight italic">{item.title}</h4>
                       <p className="text-[12px] text-gray-500 font-medium leading-relaxed uppercase tracking-tight opacity-70">"{item.desc}"</p>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="py-32">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
              {solution.features.map((f: any, i: number) => {
                const text = typeof f === 'string' ? f : (f[lang] || f.en || '');
                const [title, desc] = text.split(':');
                return (
                  <div key={i} className="p-16 bg-white dark:bg-[#08080a] space-y-8 group hover:bg-brand-blue/[0.01] transition-all duration-500 border-r border-black/5 dark:border-white/5 last:border-r-0">
                    <div className="w-14 h-14 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all rounded-sm shadow-xl">
                        <Zap size={24} />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-2xl font-black uppercase tracking-tighter italic">{title}</h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{desc || ''}"</p>
                    </div>
                  </div>
                );
              })}
           </div>
        </section>

        {/* --- B2B TECHNICAL SPECS --- */}
        <section className="py-32 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center border-t border-black/5 dark:border-white/5">
           <div className="space-y-12">
              <div className="space-y-6">
                 <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">{getTranslation(content.specs_title)}.</h2>
                 <p className="text-gray-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">SYSTEM VERSION 1.4.0 STABLE</p>
              </div>
              <div className="space-y-4">
                 {[
                   { l: 'Base Model', v: 'Google Veo 3.1 Pro', icon: <Cpu size={14}/> },
                   { l: 'Compute Cluster', v: 'H100 NVLink 80GB Nodes', icon: <Server size={14}/> },
                   { l: 'Encryption', v: 'AES-256 VPC Tunnel', icon: <Lock size={14}/> },
                   { l: 'Data Retention', v: 'Zero-Trace (Non-Training)', icon: <Shield size={14}/> }
                 ].map(stat => (
                    <div key={stat.l} className="flex justify-between items-center border-b border-black/5 dark:border-white/10 pb-4 group">
                       <div className="flex items-center gap-3">
                          <span className="text-brand-blue group-hover:scale-110 transition-transform">{stat.icon}</span>
                          <span className="text-[11px] font-black uppercase text-gray-500 group-hover:text-brand-blue transition-colors tracking-widest">{stat.l}</span>
                       </div>
                       <span className="text-sm font-black uppercase italic">{stat.v}</span>
                    </div>
                 ))}
              </div>
           </div>
           <div className="p-16 border border-black/10 dark:border-white/10 bg-black shadow-2xl relative overflow-hidden group rounded-sm">
              <div className="absolute inset-0 bg-brand-blue/5 animate-pulse"></div>
              <Activity className="w-16 h-16 text-brand-blue mb-10 relative z-10" />
              <div className="space-y-4 relative z-10">
                 <h3 className="text-4xl font-black uppercase italic tracking-tighter">B2B Compliance.</h3>
                 <p className="text-gray-500 text-sm font-medium leading-relaxed uppercase tracking-widest leading-loose">
                    Studio ARCHITECT is optimized for large-scale team production. Each node is sandbox-isolated for complete Intellectual Property protection. Every frame generated belongs to your organization, with a strict policy against model training on user data.
                 </p>
              </div>
           </div>
        </section>

        {/* --- CONVERSION CTA --- */}
        <section className="py-60 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-blue/[0.05] rounded-full blur-[200px] pointer-events-none"></div>
           
           <div className="space-y-12 relative z-10 max-w-4xl mx-auto">
              <h2 className="text-8xl lg:text-[180px] font-black uppercase tracking-tighter leading-[0.8] italic text-black dark:text-white">
                Enter the <br /> <span className="text-brand-blue">Studio.</span>
              </h2>
              <p className="text-gray-400 dark:text-gray-600 uppercase text-[16px] font-black tracking-[1.5em] italic">INDUSTRIAL PRODUCTION INTERFACE</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-16">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-24 py-8 text-sm font-black uppercase tracking-[0.5em] shadow-[0_20px_60px_rgba(0,144,255,0.4)] hover:scale-105 active:scale-95 transition-all rounded-sm">
                    Open Station Alpha
                 </button>
                 <Link to="/booking" className="px-24 py-8 border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-sm font-black uppercase tracking-[0.5em] transition-all rounded-sm italic">
                    Contact Enterprise Sales
                 </Link>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default GenyuProduct;
