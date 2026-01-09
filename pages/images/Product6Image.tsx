
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Users, Target, Film, Clapperboard, 
  Sparkles, CheckCircle2, Lock, 
  Layers, MessageSquare, ArrowRight,
  UserCheck, Palette, MonitorPlay,
  Share2, Heart, Download, Info,
  Fingerprint, Smartphone, Cpu,
  Activity, UserPlus as UserPlusIcon
} from 'lucide-react';
import CastAndDirectWorkspace from '../../components/CastAndDirectWorkspace';

const Product6Image = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Nếu mở Studio (Công cụ làm việc)
  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-black animate-in fade-in duration-700">
        <CastAndDirectWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#020203] min-h-screen text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={14} /> Next-Gen Character Consistency
              </div>
              
              <h1 className="text-6xl lg:text-[110px] font-black leading-[0.85] tracking-tighter italic uppercase">
                From Images to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500">
                  Perfect Video.
                </span>
              </h1>
              
              <p className="text-xl lg:text-3xl text-gray-400 font-medium max-w-2xl leading-tight border-l-2 border-purple-500 pl-8">
                Select character images, write one prompt, and generate AI videos where characters stay consistent across every frame.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <button 
                  onClick={() => setIsStudioOpen(true)}
                  className="bg-purple-600 text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(147,51,234,0.3)] hover:scale-105 active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
                >
                  Try Character Sync <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-12 py-6 border border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                  Watch Demo <Play size={16} fill="currentColor" />
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Image to Video Mockup */}
              <div className="relative aspect-[3/4] bg-[#0a0a0c] border border-white/5 rounded-sm p-4 shadow-2xl overflow-hidden group">
                 <div className="grid grid-cols-2 gap-2 h-1/3 mb-4">
                    <div className="bg-gray-900 rounded-sm overflow-hidden border border-white/10"><img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale opacity-50" alt="Ref" /></div>
                    <div className="bg-gray-900 rounded-sm overflow-hidden border border-white/10"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale opacity-50" alt="Ref" /></div>
                 </div>
                 <div className="h-2/3 bg-black rounded-sm border border-purple-500/30 overflow-hidden relative">
                    <video src="https://framerusercontent.com/assets/U4v4W7xT3tL0N8I.mp4" autoPlay loop muted className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-6 left-6 space-y-1">
                       <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Locked_Identity_v1</p>
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter">Synchronized Take</h3>
                    </div>
                    <div className="absolute top-4 right-4"><Fingerprint className="text-purple-500 animate-pulse" size={24} /></div>
                 </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. HOW IT WORKS */}
        <section className="py-40 border-t border-white/5">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">The Production Path</h2>
             <p className="text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Simple Workflow // Complex Architecture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Choose Your Characters', desc: 'Upload or select multiple character images. Assign names or roles to lock identity DNA.', icon: <Users /> },
              { step: '02', title: 'Write a Scene Prompt', desc: 'Describe actions, camera movement, emotions, and environment in natural language.', icon: <MessageSquare /> },
              { step: '03', title: 'Generate Video', desc: 'AI syncs character facial geometry and renders a perfectly consistent cinematic video.', icon: <Clapperboard /> }
            ].map((s, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 bg-white/5 border border-white/10 rounded-sm relative group overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 text-[120px] font-black text-white/[0.03] italic">{s.step}</div>
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-8 rounded-sm group-hover:bg-purple-500 group-hover:text-white transition-all">
                   {React.cloneElement(s.icon as React.ReactElement<any>, { size: 28 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4">{s.title}</h4>
                <p className="text-gray-500 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{s.desc}"</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. CHARACTER CONSISTENCY FEATURES */}
        <section className="py-40 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-12">
              <div className="space-y-6">
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">Character-First <br /><span className="text-purple-500">Video Synthesis.</span></h2>
                 <p className="text-xl text-gray-400 font-medium">Traditional AI video creates random faces. We create your actors.</p>
              </div>

              <div className="grid gap-6">
                 {[
                   { icon: <Activity />, title: 'Stable Temporal Motion', desc: 'Zero flickering or "warping" of human features during movement.' },
                   { icon: <Fingerprint />, title: 'Locked Facial Identity', desc: 'Maintains facial geometry across different angles and lighting conditions.' },
                   { icon: <Palette />, title: 'Outfit & Style Persistence', desc: 'Characters wear the same clothes and maintain art-style consistency.' },
                   { icon: <Layers />, title: 'Multi-Character Scenes', desc: 'Orchestrate interaction between multiple consistent AI entities.' }
                 ].map((f, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:border-purple-500/40 transition-all group">
                       <div className="shrink-0 text-purple-400 group-hover:scale-110 transition-transform">{f.icon}</div>
                       <div className="space-y-1">
                          <h5 className="font-black uppercase tracking-widest text-sm">{f.title}</h5>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">{f.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full"></div>
              <div className="relative aspect-square border border-white/10 p-12 lg:p-20 flex flex-col justify-between bg-black/40 backdrop-blur-3xl overflow-hidden rounded-sm group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <UserCheck size={300} strokeWidth={1} />
                 </div>
                 <div className="relative z-10 flex justify-between items-start">
                    <Cpu className="w-16 h-16 text-purple-500 animate-pulse" />
                    <span className="mono text-[10px] text-gray-600 uppercase font-black tracking-widest italic">AUP_IDENTITY_SYNC</span>
                 </div>
                 <div className="relative z-10 space-y-6">
                    <div className="text-[120px] font-black leading-none tracking-tighter italic text-white group-hover:text-purple-400 transition-colors">99.9%</div>
                    <p className="text-2xl font-black uppercase tracking-[0.2em] text-white">Parity Reliability</p>
                    <p className="text-gray-500 text-[11px] font-black uppercase tracking-[0.3em] italic leading-relaxed max-w-sm">"Characters remain identical across every node of the production pipeline."</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 4. USE CASES */}
        <section className="py-40 border-t border-white/5">
           <div className="flex justify-between items-end mb-24">
              <div className="space-y-4">
                 <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic">Engineered for Storytellers.</h2>
                 <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em]">Global Verticals // Local Mastery</p>
              </div>
              <Link to="/use-cases" className="text-xs font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors flex items-center gap-2">Explore Cases <ArrowRight size={14}/></Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Film & Cutscenes', desc: 'Generate high-end cinematic sequences with fixed protagonists for indie films or game lore.', icon: <Film />, img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800' },
                { title: 'Comics → Animation', desc: 'Turn your manga panels into living, moving scenes while preserving the art style.', icon: <Layers />, img: 'https://images.unsplash.com/photo-1607112812619-182cb1c7bb61?auto=format&fit=crop&q=80&w=800' },
                { title: 'Game Characters', desc: 'Visualize character backstories with consistent identities for players.', icon: <Gamepad />, img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800' },
                { title: 'Ads & Brand Stories', desc: 'Create consistent brand mascots for marketing campaigns without reshoots.', icon: <Target />, img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800' },
                { title: 'AI Storytelling', desc: 'Author long-form visual narratives where readers never lose track of who is who.', icon: <Sparkles />, img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800' },
                { title: 'Virtual Influencers', desc: 'Manage digital humans with absolute visual stability for social media.', icon: <UserPlusIcon />, icon2: <MonitorPlay />, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' }
              ].map((useCase, i) => (
                <div key={i} className="group relative overflow-hidden aspect-[4/5] border border-white/5 rounded-sm shadow-2xl hover:border-purple-500/40 transition-all cursor-pointer bg-black">
                   <img src={useCase.img} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700 group-hover:scale-105" alt={useCase.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                      <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                         <div className="text-purple-400 group-hover:text-white transition-colors">{useCase.icon}</div>
                         <h4 className="text-2xl font-black uppercase italic tracking-tight">{useCase.title}</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">"{useCase.desc}"</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
};

const Gamepad = ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>;

export default Product6Image;
