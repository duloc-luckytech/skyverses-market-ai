
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { marketApi } from '../apis/market';
import { Solution } from '../types';
import { SOLUTIONS as LOCAL_SOLUTIONS } from '../data';
import DemoModal from '../components/DemoModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  ChevronLeft, 
  Cpu, 
  Zap, 
  Maximize2, 
  Activity, 
  Box,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Terminal,
  Layers,
  Info,
  Lock,
  Loader2
} from 'lucide-react';

const SolutionDetail = () => {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  
  const [solution, setSolution] = useState<Solution | null>(() => 
    LOCAL_SOLUTIONS.find(s => s.slug === slug) || null
  );
  const [loading, setLoading] = useState(!solution);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const res = await marketApi.getSolutions();
        const data = res.data || (Array.isArray(res) ? res : []);
        const found = data.find((s: Solution) => s.slug === slug);
        if (found) {
          setSolution(found);
          setActiveImage(found.imageUrl);
        }
      } catch (error) {
        console.error("Fetch Solution Error:", error);
      }
      setLoading(false);
    };

    fetchSolution();
  }, [slug]);

  useEffect(() => {
    if (solution) setActiveImage(solution.imageUrl);
  }, [solution]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 animate-pulse">Syncing Node Manifest...</span>
      </div>
    );
  }

  if (!solution) return <Navigate to="/market" />;

  const handleDemoOpen = () => {
    if (isAuthenticated) {
      setIsDemoOpen(true);
    } else {
      alert("Authentication required. Please sign in with Google to access the Interactive Lab.");
      login();
    }
  };

  const specs = [
    { label: 'System ID', value: solution.id },
    { label: 'Category', value: solution.category[lang] },
    { label: 'Complexity', value: solution.complexity },
    { label: 'Latency Node', value: 'Edge-Optimized' },
    { label: 'Privacy', value: 'Zero-Knowledge' }
  ];

  return (
    <div className="pt-20 bg-black min-h-screen">
      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
        type={solution.demoType} 
        title={solution.name[lang]} 
      />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <Link to="/market" className="inline-flex items-center gap-2 text-[10px] mono text-gray-500 hover:text-white mb-12 uppercase tracking-widest group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Repository
        </Link>

        {/* Hero Section with Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32 items-start text-white">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-[16/9] border border-white/10 bg-white/5 group overflow-hidden shadow-2xl">
              <img 
                src={activeImage} 
                alt={solution.name[lang]} 
                className="w-full h-full object-cover opacity-80 transition-all duration-1000 grayscale group-hover:grayscale-0" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="bg-brand-blue w-1 h-16"></div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Vision_Cluster_v7</p>
                    <p className="text-3xl font-black uppercase text-white tracking-tighter">CORE_ENGINE_NODE</p>
                 </div>
              </div>

              <div className="absolute bottom-8 right-8">
                {isAuthenticated ? (
                  <button 
                    onClick={handleDemoOpen}
                    className="bg-brand-blue text-white px-10 py-5 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-6 hover:bg-white hover:text-black transition-all shadow-2xl"
                  >
                    INITIALIZE LAB <Sparkles className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={login}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-6 hover:bg-white hover:text-black transition-all shadow-2xl"
                  >
                    SIGN IN TO USE <Lock className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {solution.gallery && solution.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveImage(solution.imageUrl)}
                  className={`aspect-video border overflow-hidden transition-all ${activeImage === solution.imageUrl ? 'border-brand-blue' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                >
                  <img src={solution.imageUrl} className="w-full h-full object-cover" />
                </button>
                {solution.gallery.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-video border overflow-hidden transition-all ${activeImage === img ? 'border-brand-blue' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 border border-white/20 rounded-sm text-[9px] font-black mono text-gray-400 uppercase tracking-[0.2em]">{solution.category[lang]}</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[9px] font-black mono text-green-500 uppercase tracking-[0.2em]">Operational</span>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-white">{solution.name[lang]}</h1>
              <p className="text-xl font-light text-gray-400 leading-relaxed italic">
                "{solution.description[lang]}"
              </p>
            </div>

            <div className="grid grid-cols-1 gap-px bg-white/10 border border-white/10">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-black p-5 flex justify-between items-center group hover:bg-white/5 transition-colors">
                  <span className="mono text-[10px] text-gray-500 uppercase group-hover:text-gray-300 transition-colors">{spec.label}</span>
                  <span className="mono text-[11px] font-black text-white">{spec.value}</span>
                </div>
              ))}
            </div>
            
            <div className="p-8 border border-brand-blue/20 bg-brand-blue/5 space-y-4 text-white">
               <div className="flex items-center gap-3 text-brand-blue">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Enterprise_Encryption_Active</span>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                 All data generated within this node is encrypted via AES-256. Authentication is managed via secure Google SSO protocol.
               </p>
            </div>
          </div>
        </div>

        {/* Feature Deep Dive */}
        <section className="py-32 border-t border-white/10 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4 space-y-10">
              <div className="space-y-4">
                 <Terminal className="w-12 h-12 text-brand-blue" />
                 <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">System <br /> Logic Gate.</h2>
              </div>
              <p className="text-gray-500 mono text-xs leading-loose uppercase tracking-widest">
                Comprehensive technical overview of {solution.id}. 
                High-performance compute requirements applicable.
              </p>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {solution.features && solution.features.map((feat: any, i: number) => {
                const featText = typeof feat === 'string' ? feat : (feat[lang] || feat.en || '');
                const [title, desc] = featText.split(':');
                return (
                  <div key={i} className="bg-black p-12 space-y-6 hover:bg-brand-blue group transition-all duration-700">
                    <div className="w-12 h-12 border border-white group-hover:border-black flex items-center justify-center transition-colors">
                      <Cpu className="w-6 h-6 text-white group-hover:text-black" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-black uppercase group-hover:text-black">{title}</h4>
                      <p className="text-gray-500 group-hover:text-black/80 text-sm mono leading-relaxed">
                        {desc || ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final Professional CTA */}
        <section className="py-40 text-center space-y-12 border-t border-white/10 text-white">
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">
            Ready to <br /> <span className="text-brand-blue italic">Synchronize?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <Link to="/booking" className="btn-sky-primary px-20 py-8 w-full sm:w-auto text-xs tracking-[0.3em]">
              DEPLOY TO CLOUD
            </Link>
            {!isAuthenticated ? (
               <button 
                 onClick={login}
                 className="btn-sky-secondary px-20 py-8 w-full sm:w-auto text-xs tracking-[0.3em] flex items-center justify-center gap-4"
               >
                 <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="" />
                 LOGIN TO START
               </button>
            ) : (
               <button 
                 onClick={handleDemoOpen}
                 className="btn-sky-secondary px-20 py-8 w-full sm:w-auto text-xs tracking-[0.3em]"
               >
                 RUN DIAGNOSTICS
               </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SolutionDetail;
