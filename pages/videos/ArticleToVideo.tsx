
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, Newspaper, 
  MonitorPlay, Share2, Download, 
  ArrowRight, ShieldCheck, Video, 
  Target, Sparkles, Workflow, Activity,
  Globe, Rocket, Cpu, Layers
} from 'lucide-react';
import ArticleToVideoWorkspace from '../../components/ArticleToVideoWorkspace';

const ArticleToVideo = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'article-to-video');
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#020203] animate-in fade-in duration-500">
        <ArticleToVideoWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#10b98108_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#10b98112_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-emerald-500 transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Content Infrastructure</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-emerald-500">
                      <Rocket size={32} className="animate-pulse" />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">STORY_ORCHESTRATOR v2.4</span>
                   </div>
                   <h1 className="text-7xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.75] italic text-black dark:text-white">
                     Article <br /> <span className="text-emerald-500">to Motion.</span>
                   </h1>
                </div>
                
                <p className="text-2xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-emerald-500 pl-10 max-w-2xl italic">
                  “Biến văn bản thô thành trải nghiệm điện ảnh. Tự động hóa sản xuất nội dung mạng xã hội với trí tuệ nhân tạo cấp độ Agency.”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-emerald-500 text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    KHỞI ĐỘNG PRODUCTION STUDIO <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-emerald-500/60 tracking-widest italic">NEURAL PIPELINE</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Industrial Batch Output</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group">
                  <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="Production Engine" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 space-y-2">
                     <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.5em]">System_Logic_v2.4</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Deterministic Workflow.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ArticleToVideo;
