
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Zap, 
  Palette, 
  Layout, 
  MessageSquare, 
  Download, 
  ChevronRight, 
  Play,
  ArrowRight,
  CheckCircle2,
  PenTool,
  Layers,
  Sparkles,
  MousePointer2,
  /* Added missing icons from lucide-react */
  Clapperboard,
  Fingerprint,
  AlignLeft
} from 'lucide-react';
import BananaProWorkspace from '../../components/BananaProWorkspace';

const Product7Comic = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <BananaProWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#fafafc] dark:bg-[#080808] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-[#FFE135]/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-6 lg:px-12 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE135]/10 border border-[#FFE135]/20 rounded-full">
              <Sparkles size={14} className="text-[#d9b700] dark:text-[#FFE135]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d9b700] dark:text-[#FFE135]">Powered by Google Banana Pro</span>
            </div>
            
            <h1 className="text-6xl lg:text-[84px] font-black leading-[0.9] tracking-tighter">
              Create Comics at <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">
                Production Speed.
              </span>
            </h1>
            
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
              An AI-powered comic creation studio built on Google Banana Pro. 
              From story to panels, characters, and final pages — all in one workflow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-[#FFE135] text-black px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-yellow-500/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Start Creating Comics <ArrowRight size={18} />
              </button>
              <button 
                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                View Demo <Play size={18} fill="currentColor" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Mockup of Comic Panels */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 aspect-[4/5] bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 relative rotate-2 hover:rotate-0 transition-transform duration-700">
              <div className="col-span-2 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1578632738981-63806a624da5?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Comic Panel" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative group">
                 <img src="https://images.unsplash.com/photo-1607112812619-182cb1c7bb61?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Comic Panel" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative group">
                 <img src="https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Comic Panel" />
              </div>
              {/* Floating UI Elements */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-white/10 animate-bounce transition-all">
                <MousePointer2 className="text-[#FFE135]" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#FFE135] text-black p-4 rounded-xl shadow-2xl font-black text-xs uppercase tracking-widest">
                Identity Locked
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHO IT'S FOR */}
      <section className="px-6 lg:px-12 py-32 bg-white dark:bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Built for Visual Storytellers</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">A professional suite designed for the modern art department.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Comic & Manga Creators', icon: <BookOpen /> },
              { name: 'Indie Game Studios', icon: <Play /> },
              { name: 'Creative Agencies', icon: <Layers /> },
              { name: 'Writers & Storyboard Artists', icon: <PenTool /> },
              /* Fixed: Clapperboard is now imported from lucide-react */
              { name: 'Animation & Art Studios', icon: <Clapperboard /> }
            ].map((audience, i) => (
              <div key={i} className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center text-center gap-6 hover:bg-[#FFE135] hover:text-black transition-all group">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-black transition-colors shadow-sm">
                  {audience.icon}
                </div>
                <h4 className="font-black text-sm uppercase tracking-wider leading-tight">{audience.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES */}
      <section className="px-6 lg:px-12 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/10 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
            {[
              /* Fixed: AlignLeft is now imported from lucide-react */
              { title: 'Story-to-Panel Generation', icon: <AlignLeft />, desc: 'Turn scripts or scene descriptions into structured comic panels.' },
              /* Fixed: Fingerprint is now imported from lucide-react */
              { title: 'Character Consistency Engine', icon: <Fingerprint />, desc: 'Keep characters visually consistent across pages, scenes, and chapters.' },
              { title: 'Style Control', icon: <Palette />, desc: 'Choose manga, western comic, graphic novel, or custom art styles.' },
              { title: 'Panel & Layout Editor', icon: <Layout />, desc: 'Control panel size, flow, pacing, and composition.' },
              { title: 'Dialogue & Text Bubbles', icon: <MessageSquare />, desc: 'Automatically generate and place dialogue bubbles.' },
              { title: 'Production Export', icon: <Download />, desc: 'Export print-ready pages, layered assets, or digital formats.' }
            ].map((feature, i) => (
              <div key={i} className="p-12 bg-[#fafafc] dark:bg-[#080808] space-y-6 hover:bg-[#FFE135]/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-brand-blue dark:text-[#FFE135]">
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">"{feature.desc}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="px-6 lg:px-12 py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-10">
           <BookOpen size={400} strokeWidth={1} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl space-y-4 mb-20">
            <h2 className="text-5xl font-black tracking-tight leading-none">A Seamless <br /> Production Flow.</h2>
            <p className="text-slate-400 text-lg">Designed to keep you in the creative zone, from start to finish.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative">
            <div className="absolute top-8 left-0 w-full h-px bg-white/10 hidden md:block" />
            {[
              'Write or import your story',
              'Define characters and art style',
              'Generate panels and layouts',
              'Refine visuals and dialogue',
              'Export final comic pages'
            ].map((step, i) => (
              <div key={i} className="relative space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-[#FFE135] text-black flex items-center justify-center text-xl font-black shadow-2xl relative z-10">
                  0{i+1}
                </div>
                <p className="text-sm font-black uppercase tracking-wider leading-relaxed pr-4 opacity-80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY BANANA PRO */}
      <section className="px-6 lg:px-12 py-40 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="inline-block p-4 bg-yellow-500/10 rounded-full text-yellow-600 mb-4">
             <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter italic">Powered by Banana Pro</h2>
          <p className="text-xl lg:text-3xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Banana Pro enables high-fidelity visual generation, long-context storytelling, and consistent character rendering — 
            making it ideal for comic and narrative production.
          </p>
        </div>
      </section>

      {/* 6. USE CASES */}
      <section className="px-6 lg:px-12 py-32 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {[
            { title: 'Webtoon & Manga Creation', img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=600' },
            { title: 'Indie Comic Publishing', img: 'https://images.unsplash.com/photo-1613376023733-0d743d4499b0?q=80&w=600' },
            { title: 'Game Narrative Visualization', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600' },
            { title: 'Storyboarding for Animation', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600' },
            { title: 'Marketing Visual Stories', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600' }
          ].map((useCase, i) => (
            <div key={i} className="group cursor-pointer space-y-6">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                <img src={useCase.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={useCase.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6">
                   <h4 className="text-white font-black uppercase text-xs tracking-wider leading-tight">{useCase.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SOCIAL PROOF / TRUST */}
      <section className="px-6 lg:px-12 py-32 border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-16">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[#FFE135] font-black text-xs uppercase tracking-[0.4em]">Validation</p>
            <h3 className="text-3xl font-black uppercase tracking-tight italic">Used by creators worldwide</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 dark:opacity-20 grayscale">
            {/* Placeholder Logos */}
            <span className="text-2xl font-black italic tracking-tighter">ARTSTATION</span>
            <span className="text-2xl font-black italic tracking-tighter">WEBTOON</span>
            <span className="text-2xl font-black italic tracking-tighter">SHONEN</span>
            <span className="text-2xl font-black italic tracking-tighter">CRUNCHY</span>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="px-6 lg:px-12 py-60 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none">
           <Sparkles size={800} className="mx-auto text-yellow-500" />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <h2 className="text-7xl lg:text-[120px] font-black tracking-tighter italic leading-[0.8]">
            Bring Your <br /> Stories to Life.
          </h2>
          
          <div className="space-y-8 pt-8">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-[#FFE135] text-black px-16 py-8 rounded-2xl font-black uppercase tracking-widest text-lg shadow-[0_20px_80px_rgba(255,225,53,0.3)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-6"
            >
              Start Creating with Banana Comic Studio <ChevronRight />
            </button>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-sm">
              No setup. No pipelines. Just create.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="px-6 lg:px-12 py-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-[#FFE135]">© 2025 Banana Comic Studio</span>
          <span className="opacity-20">|</span>
          <span>Designed for Production</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#FFE135] transition-colors">Privacy Registry</a>
          <a href="#" className="hover:text-[#FFE135] transition-colors">Terms of Use</a>
        </div>
      </footer>

    </div>
  );
};

export default Product7Comic;
