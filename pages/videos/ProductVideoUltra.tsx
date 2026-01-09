
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Activity, Video, Target, Sparkles, Upload,
  RefreshCw, Download, Loader2, Lock, ExternalLink,
  Crown, Film, Clapperboard, Terminal, ShieldCheck,
  FastForward, History, Fingerprint, Layers, Cpu,
  Settings2, Sliders, Eye, Maximize2, Trash2, Camera
} from 'lucide-react';
import MotionSynthUltraWorkspace from '../../components/MotionSynthUltraWorkspace';

const ProductVideoUltra = () => {
  const solution = SOLUTIONS.find(s => s.id === 'MOTION-SYNTH-ULTRA');
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-[#050505] animate-in fade-in zoom-in-95 duration-500">
        <MotionSynthUltraWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-black min-h-screen text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden transition-colors duration-500 pb-32">
      
      {/* Background Deep-Tech Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#eab30811_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Cinematic Ultra Hero */}
        <section className="min-h-[90vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            
            <div className="lg:col-span-6 space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-white/10 text-gray-500 hover:text-yellow-500 transition-all group rounded-full bg-white/5 backdrop-blur-md">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Hub</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-yellow-500">
                      <div className="p-3 bg-yellow-500/10 rounded-sm border border-yellow-500/20">
                        <Crown size={32} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[14px] font-black uppercase tracking-[0.8em] text-yellow-500/60 block">PRODUCTION_GRADE</span>
                        <div className="h-1 w-24 bg-yellow-500"></div>
                      </div>
                   </div>
                   <h1 className="text-8xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Ultra <br /> <span className="text-yellow-500">Synth.</span>
                   </h1>
                </div>
                
                <p className="text-2xl lg:text-3xl text-gray-400 font-medium leading-tight border-l-4 border-yellow-500 pl-12 max-w-2xl italic">
                  “Hệ thống sản xuất Video AI tối tân nhất thế giới. Kiểm soát tuyệt đối mọi pixel, chuyển động và danh tính nhân vật.”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 pt-6">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-yellow-500 text-black px-20 py-10 text-sm font-black uppercase tracking-[0.6em] shadow-[0_20px_100px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-8 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    KHỞI CHẠY STUDIO <Play size={24} fill="currentColor" />
                 </button>
                 <button className="px-16 py-10 border border-white/10 text-xs font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all rounded-sm flex items-center gap-4">
                    XEM SPECS KỸ THUẬT <Terminal size={18} />
                 </button>
              </div>
            </div>

            <div className="lg:col-span-6 w-full animate-in fade-in slide-in-from-right-12 duration-1000">
               <div className="aspect-[2.39/1] lg:aspect-[16/11] bg-black border border-white/10 relative overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.8)] group rounded-sm ring-1 ring-white/5">
                  <img src={solution.imageUrl} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-all duration-[5000ms]" alt="Ultra Studio" />
                  
                  {/* Digital HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute top-10 left-10 right-10 flex justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></div>
                           <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/80">ULTRA_NODE_A100_STABLE</span>
                        </div>
                        <div className="text-right text-[9px] font-black text-white/30 space-y-1 uppercase tracking-widest">
                           <p>LATENCY: 12.4ms</p>
                           <p>FRAME_BUFF: 8GB</p>
                        </div>
                     </div>
                     
                     <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">TAKE_ARCHIVE // 042</p>
                           <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Cinematic_Consistency</h3>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                           <ShieldCheck size={32} className="text-yellow-500 opacity-60" />
                           <div className="flex gap-1.5">
                              {[1,2,3,4,5,6].map(i => <div key={i} className={`w-1.5 h-1.5 ${i <= 5 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>)}
                           </div>
                        </div>
                     </div>
                     
                     {/* Scanning Line Effect */}
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-[scan_4s_infinite_linear]"></div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Feature Grid with Deep Specs */}
        <section className="py-40 border-t border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
              {[
                { title: 'MULTI-IMAGE LOCK', icon: <Fingerprint />, desc: 'Khóa 3 lớp: Nhân vật, Bối cảnh & Thẩm mỹ đồng nhất 100%.', spec: 'DNA_ANCHOR_V3' },
                { title: 'TEMPORAL EXTEND', icon: <FastForward />, desc: 'Mở rộng video thêm +7s không giới hạn, giữ nguyên logic chuyển động.', spec: 'RECURSIVE_SYNTH' },
                { title: 'TRAJECTORY CONTROL', icon: <Target />, desc: 'Điều khiển máy quay ảo chính xác đến từng Degree/Pixel.', spec: 'VIRTUAL_GIMBAL' },
                { title: '1080P MASTERING', icon: <Sparkles />, desc: 'Độ phân giải Full HD Native với Bitrate Cinematic cao nhất.', spec: 'HIGH_FIDELITY' }
              ].map(f => (
                <div key={f.title} className="p-16 bg-[#080808] space-y-10 hover:bg-yellow-500/[0.02] transition-all duration-700 group border-r border-white/5 last:border-r-0">
                   <div className="w-16 h-16 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-yellow-500 group-hover:border-yellow-500 transition-all rounded-sm">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 28 })}
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black text-yellow-500/50 uppercase tracking-widest">{f.spec}</span>
                      </div>
                      <h4 className="text-3xl font-black uppercase tracking-tighter italic">{f.title}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed opacity-70 uppercase tracking-widest leading-loose">"{f.desc}"</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Studio Command Demo Preview */}
        <section className="py-60 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-yellow-500/[0.04] rounded-full blur-[250px] pointer-events-none"></div>
           
           <div className="space-y-12 relative z-10 max-w-4xl mx-auto">
              <h2 className="text-9xl lg:text-[180px] font-black uppercase tracking-tighter leading-[0.8] italic text-white group cursor-default">
                Total <br /> <span className="text-yellow-500 group-hover:text-white transition-colors duration-1000">Control.</span>
              </h2>
              <p className="text-gray-500 uppercase text-[18px] font-black tracking-[1.5em] italic">INDUSTRIAL_VEO_LAB</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10">
                 {[
                   { label: 'Uptime', val: '99.9%' },
                   { label: 'Throughput', val: '8X' },
                   { label: 'Security', val: 'VPC' },
                   { label: 'Output', val: '1080P' }
                 ].map(stat => (
                   <div key={stat.label} className="border-l border-yellow-500/30 pl-6 text-left">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-3xl font-black italic">{stat.val}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-32 relative z-10">
              <Link to="/booking" className="bg-yellow-500 text-black px-24 py-8 text-sm font-black uppercase tracking-[0.5em] shadow-[0_30px_80px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-all rounded-sm">
                 GIAO TIẾP KIẾN TRÚC SƯ
              </Link>
              <button onClick={() => setIsStudioOpen(true)} className="px-24 py-8 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black text-sm font-black uppercase tracking-[0.5em] transition-all bg-transparent rounded-sm italic">
                 TRUY CẬP VIRTUAL LAB
              </button>
           </div>
        </section>

      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
      `}</style>
    </div>
  );
};

export default ProductVideoUltra;
