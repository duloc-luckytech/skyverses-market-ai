
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, CheckCircle2, Layout, 
  Maximize2, Download, ArrowRight, 
  Target, Box, Palette, Layers, 
  Type, Search, History, MousePointer2,
  Lock, ExternalLink, Activity,
  Image as LucideImage
} from 'lucide-react';
import PosterStudioWorkspace from '../../components/PosterStudioWorkspace';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const PosterMarketingAI = () => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <PosterStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#020203] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION (EDITOR-STYLE) */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[200px]"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-5 space-y-10">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 dark:text-gray-500 hover:text-brand-blue transition-colors tracking-[0.4em]">
              <ChevronLeft size={14} /> Back to Repository
            </Link>
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[90px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Create <span className="text-brand-blue">Marketing</span> <br />
                Posters in Seconds.
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-brand-blue pl-8">
                Describe your idea, choose a style, and let AI design high-quality posters for ads, events, and promotions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-brand-blue text-white px-12 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Create Poster Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all bg-white/5 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                See Examples <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
             <div className="aspect-[16/10] bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-4 shadow-3xl overflow-hidden group transition-colors">
                <div className="flex h-full gap-4">
                   <div className="w-1/4 h-full border-r border-slate-100 dark:border-white/5 pr-4 space-y-4 opacity-40 group-hover:opacity-100 transition-opacity hidden md:block">
                      <div className="h-4 w-full bg-slate-100 dark:bg-white/10 rounded-sm"></div>
                      <div className="h-20 w-full bg-slate-50 dark:bg-white/5 rounded-sm"></div>
                      <div className="space-y-2 pt-4">
                         <div className="h-2 w-1/2 bg-slate-100 dark:bg-white/10 rounded-sm"></div>
                         <div className="h-8 w-full bg-slate-50 dark:bg-white/5 rounded-sm"></div>
                         <div className="h-8 w-full bg-slate-50 dark:bg-white/5 rounded-sm"></div>
                      </div>
                   </div>
                   <div className="flex-grow bg-slate-50 dark:bg-black rounded-sm border border-brand-blue/10 dark:border-brand-blue/20 relative overflow-hidden flex items-center justify-center transition-colors">
                      <img src="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover grayscale opacity-60 transition-all duration-1000 group-hover:grayscale-0" alt="Poster Mock" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-40 dark:opacity-80"></div>
                      <div className="absolute bottom-8 left-8">
                         <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">HIGH CONVERSION</h3>
                         <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.4em] mt-2">Neural_Blueprint_v1</p>
                      </div>
                      <Sparkles className="absolute top-6 right-6 text-brand-blue animate-pulse" size={32} />
                   </div>
                </div>
             </div>
             {/* Floating UI */}
             <div className="absolute -bottom-10 -left-10 bg-white dark:bg-[#0c0c0e] p-6 rounded-sm shadow-3xl border border-slate-100 dark:border-white/10 animate-bounce transition-colors">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-brand-blue/10 rounded-full text-brand-blue"><Maximize2 size={20}/></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Enhanced to 8K Quality</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-40 bg-slate-50 dark:bg-[#070708] border-y border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Instant Production Path</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">01 → 02 → 03 Workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { s: '01', t: 'Describe Your Poster', d: 'Enter what you want to promote in simple natural language. The AI understands sales psychology.', i: <Type /> },
              { s: '02', t: 'Customize Style', d: 'Choose category, style, size, and AI model. Lock your visual DNA with reference images.', i: <Palette /> },
              { s: '03', t: 'Generate & Download', d: 'AI creates a ready-to-use marketing poster in high-resolution, optimized for your target.', i: <Download /> }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-sm relative group hover:border-brand-blue/30 transition-all shadow-sm">
                <div className="absolute top-4 right-8 text-5xl font-black italic text-brand-blue/10 dark:text-brand-blue/10 group-hover:text-brand-blue/30 transition-colors">{step.s}</div>
                <div className="w-16 h-16 bg-brand-blue/5 dark:bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-10 rounded-sm group-hover:scale-110 transition-transform">
                   {React.cloneElement(step.i as React.ReactElement<any>, { size: 28 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{step.t}</h4>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{step.d}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES */}
      <section className="py-40 bg-white dark:bg-[#020203] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl transition-colors">
              {[
                { t: 'AI Poster Gen', i: <Zap />, d: 'Instant synthesis of marketing visuals based on sales intent.' },
                { t: 'Template Matrix', i: <Layout />, d: 'Category-based logic for events, products, food, and more.' },
                { t: 'Copy Control', i: <Type />, d: 'Precise title and subtitle management for high-conversion text.' },
                { t: 'DNA Reference', i: <LucideImage />, d: 'Support for brand reference images to maintain identity.' },
                { t: 'Multi-Aspect', i: <Maximize2 />, d: 'One-click scaling for social, print, and digital billboards.' },
                { t: '8K Output', i: <Sparkles />, d: 'High-resolution renders ready for professional production.' },
                { t: 'Fast Iteration', i: <Activity />, d: 'Generate 4 variations in parallel to find the perfect look.' },
                { t: 'VPC Isolation', i: <ShieldCheck />, d: 'Enterprise security for proprietary marketing assets.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-brand-blue/[0.02] dark:hover:bg-brand-blue/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                   <div className="w-12 h-12 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors rounded-sm shadow-sm dark:shadow-none">
                      {React.cloneElement(f.i as React.ReactElement<any>, { size: 20 })}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-widest italic text-slate-900 dark:text-white">{f.t}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-gray-500 font-bold uppercase leading-relaxed tracking-tighter leading-loose">"{f.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. USE CASES */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] transition-colors">
         <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="flex justify-between items-end mb-24">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Market Every <br /><span className="text-brand-blue">Frontier.</span></h2>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: 'Event Posters', d: 'Concerts, festivals, and launch parties.', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800' },
                { t: 'Product Promotions', d: 'E-commerce hero shots and seasonal sales.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
                { t: 'Food & Beverage', d: 'Menu highlights and restaurant openings.', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800' },
                { t: 'Kids & Education', d: 'Workshop flyers and school campaigns.', img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=800' },
                { t: 'Social Campaigns', d: 'Instagram, Pinterest, and TikTok ads.', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800' },
                { t: 'Local Business', d: 'Neighborhood marketing and service ads.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-[4/5] border border-slate-100 dark:border-white/5 rounded-sm bg-slate-200 dark:bg-black transition-colors">
                   <img src={item.img} className="w-full h-full object-cover grayscale opacity-60 dark:opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" alt={item.t} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                      <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                         <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white">{item.t}</h4>
                         <p className="text-xs text-brand-blue font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">"{item.d}"</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* 5. COMPARISON */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#020203] transition-colors">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-24">
           <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic text-center text-slate-900 dark:text-white">Why Poster AI?</h2>
           <div className="grid gap-12">
              {[
                { t: 'Velocity', d: 'Go from blank canvas to print-ready in 45 seconds instead of 4 hours.' },
                { t: 'Zero Skill Barrier', d: 'Architecture-first design means you dont need to be a designer to generate results.' },
                { t: 'Consistent Branding', d: 'DNA Locking ensures your mascot and colors stay identical across all variations.' },
                { t: 'Optimized Layouts', d: 'AI understands focal points and visual hierarchy for maximum sales impact.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-8 items-start border-b border-slate-100 dark:border-white/5 pb-12 group">
                   <span className="text-4xl font-black italic text-brand-blue/20 dark:text-brand-blue/20 group-hover:text-brand-blue transition-colors leading-none">0{i+1}</span>
                   <div className="space-y-3 text-slate-800 dark:text-gray-300">
                      <h4 className="text-2xl font-black uppercase italic tracking-tight">{item.t}</h4>
                      <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">"{item.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-white/5 transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-brand-blue leading-none tracking-tighter select-none italic">
          POSTER POSTER POSTER POSTER
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
          <h2 className="text-8xl lg:text-[150px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Turn Ideas <br /> Into <span className="text-brand-blue">Growth.</span></h2>
          <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-brand-blue text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,144,255,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Start Creating with AI <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • Instant Export</p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-20 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#030304] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black">POSTER MARKETING AI</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Industrial-grade marketing asset production. High-conversion, zero-drift visual synthesis.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-brand-blue transition-colors">Technical Docs</a>
              <a href="#" className="hover:text-brand-blue transition-colors">Privacy Registry</a>
              <a href="#" className="hover:text-brand-blue transition-colors">Support Node</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default PosterMarketingAI;
