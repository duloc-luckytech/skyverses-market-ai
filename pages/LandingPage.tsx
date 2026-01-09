
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ChevronRight, Activity, Cpu, ShieldCheck } from 'lucide-react';
import { SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { lang } = useLanguage();

  const aiModels = [
    'GPT-4o', 'GEMINI 2.5', 'MIDJOURNEY V6', 'KLING AI', 'CLAUDE 3.5', 
    'LLAMA 3.1', 'SORA', 'VEO 3.1', 'STABLE DIFFUSION 3', 'FLUX.1', 'RUNWAY GEN-3'
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-24 bg-black relative overflow-hidden">
        
        <div className="max-w-[1500px] mx-auto w-full relative z-10 pt-20">
          <div className="max-w-5xl space-y-12">
            <h1 className="text-[64px] md:text-[110px] lg:text-[130px] heading-massive text-white uppercase leading-[0.9]">
              We Build <br />
              <span className="text-[#333333] tracking-tighter">AI Software</span> <br />
              That Fast Ship
            </h1>
            
            <p className="text-sm md:text-base font-medium text-gray-500 max-w-lg leading-relaxed uppercase tracking-tight">
              A multi-disciplinary architectural studio. We help enterprise teams build fast, ship confidently, and scale neural infrastructure sustainably.
            </p>
            
            {/* NEW: Horizontal Running List of AI Models */}
            <div className="w-full overflow-hidden py-4 border-y border-white/5 relative group cursor-default">
              <div className="flex whitespace-nowrap animate-marquee">
                {[...aiModels, ...aiModels].map((model, idx) => (
                  <div key={idx} className="flex items-center mx-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 group-hover:text-brand-blue transition-colors">
                      {model}
                    </span>
                    <div className="ml-8 w-1 h-1 bg-brand-blue/30 rounded-full"></div>
                  </div>
                ))}
              </div>
              {/* Fade edges */}
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/about" className="btn-sky-secondary px-10 py-4 text-[13px] tracking-wider flex items-center justify-center min-w-[160px]">
                About Us
              </Link>
              <Link to="/booking" className="btn-sky-primary px-10 py-4 text-[13px] tracking-wider flex items-center justify-center gap-6 min-w-[200px]">
                Get in Touch <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Vertical Decoration */}
        <div className="absolute right-24 top-0 bottom-0 w-[1px] bg-white/5 hidden lg:block"></div>
      </section>

      {/* Featured Services Grid */}
      <section className="py-40 bg-black border-y border-white/5 relative">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-32">
            <div className="space-y-6">
              <span className="text-brand-blue font-black uppercase text-xs tracking-[0.4em] flex items-center gap-3">
                <div className="w-8 h-[1px] bg-brand-blue"></div> Market Inventory
              </span>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">Core <br /> Services.</h2>
            </div>
            <p className="text-gray-500 text-lg max-w-md font-medium leading-relaxed pt-8 border-l border-white/10 pl-8">
              Enterprise-grade AI assets validated for production. Scalable, secure, and ready for deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {SOLUTIONS.slice(0, 3).map((sol, i) => (
              <Link 
                key={sol.id} 
                to={`/product/${sol.slug}`} 
                className="group bg-black p-12 lg:p-16 space-y-12 hover:bg-brand-gray transition-all duration-700 border border-transparent hover:border-white/10"
              >
                <div className="flex justify-between items-start">
                  <span className="mono text-[11px] text-gray-700 font-bold tracking-widest group-hover:text-brand-blue transition-colors">NODE_0{i+1}</span>
                  <div className="w-14 h-14 border border-white/10 group-hover:border-brand-blue/50 flex items-center justify-center transition-all">
                    <Zap className="w-6 h-6 text-white group-hover:text-brand-blue group-hover:scale-110 transition-all" />
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl lg:text-4xl font-black uppercase leading-none group-hover:text-brand-blue transition-all">{sol.name[lang]}</h3>
                  <p className="text-gray-500 text-base leading-relaxed line-clamp-2 font-medium">
                    {sol.description[lang]}
                  </p>
                </div>
                <div className="pt-12 flex items-center gap-4 group-hover:gap-6 transition-all border-t border-white/5">
                   <span className="text-[11px] font-black uppercase tracking-widest text-white/50 group-hover:text-white">Initialize Specs</span>
                   <ArrowRight className="w-4 h-4 text-brand-blue" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Metrics Section */}
      <section className="py-40 bg-black overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="relative">
                 <div className="absolute inset-0 bg-brand-blue/5 blur-[120px] rounded-full animate-pulse"></div>
                 <div className="relative border border-white/10 p-16 aspect-square flex flex-col justify-between group overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-1000"></div>
                    <div className="relative z-10 flex justify-between items-start">
                       <ShieldCheck className="w-12 h-12 text-brand-blue" />
                       <span className="mono text-[10px] text-gray-500 uppercase font-black">Audit_Report_2025</span>
                    </div>
                    <div className="relative z-10 space-y-4">
                       <div className="text-[140px] font-black leading-none tracking-tighter text-white">99%</div>
                       <p className="text-xl font-black uppercase tracking-widest text-brand-blue">Reliability Factor</p>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-20">
                <div className="space-y-6">
                  <h2 className="text-6xl font-black uppercase tracking-tighter leading-[0.9]">Architecting <br /> the <span className="text-brand-blue italic">Future.</span></h2>
                  <p className="text-gray-500 text-xl font-medium">Bespoke AI solutions for organizations that demand deterministic outcomes.</p>
                </div>

                <div className="space-y-12">
                   {[
                     { title: 'Neural Infrastructure', desc: 'Secure local or cloud-native environments built for scale.', icon: <Cpu /> },
                     { title: 'Semantic Workflows', desc: 'Custom RAG and LLM pipelines for precision knowledge.', icon: <Activity /> },
                     { title: 'Generative Edge', desc: 'High-fidelity visual and motion synthesis at frequency.', icon: <Zap /> },
                   ].map((item, i) => (
                     <div key={i} className="group flex gap-8 items-start">
                        <div className="w-12 h-12 shrink-0 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                           {item.icon}
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-2xl font-black uppercase tracking-tight">{item.title}</h4>
                           <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Global CTA */}
      <section className="py-60 bg-brand-blue relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[180px] font-black text-white leading-none tracking-tighter select-none">
          SKY SKY SKY SKY SKY SKY
        </div>
        <div className="max-w-4xl mx-auto space-y-12 relative z-10 text-center">
          <h2 className="text-7xl md:text-[130px] font-black uppercase tracking-tighter leading-[0.85] text-white">Let's <br /> Build.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
            <Link to="/booking" className="bg-black text-white px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
              Initiate Project
            </Link>
            <Link to="/market" className="bg-white/10 text-white border border-white/20 px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Explore Market
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
