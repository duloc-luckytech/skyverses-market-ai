
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Box, Cpu, Layers, Package, 
  Monitor, ArrowRight, Terminal, Palette, BrainCircuit,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useArt3DGenerator } from '../hooks/useArt3DGenerator';
import Art3DWorkspace from '../components/Art3DWorkspace';

const Art3DPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const logic = useArt3DGenerator();

  if (logic.isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[600] bg-[#141519] animate-in fade-in duration-500">
        <Art3DWorkspace onClose={() => logic.setIsStudioOpen(false)} logic={logic} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#020203] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pt-20 transition-colors duration-500 pb-40">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[250px] pointer-events-none"></div>
        
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-7 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] italic"
            >
              <Box size={14} /> AI 3D Mesh Synthesis
            </motion.div>
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-purple-500">
                <BrainCircuit size={32} />
                <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">NEURAL_WORLD_ENGINE</span>
              </div>
              <h1 className="text-6xl lg:text-[110px] font-black leading-[0.8] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Neural 3D <br /> <span className="text-purple-500">Architect.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-purple-500 pl-10 max-w-2xl">
                Kiến tạo nhân vật và vật thể 3D cho Game/Phim. Công nghệ Neural Mesh cho phép tạo topology sạch và vật liệu PBR chuẩn AAA chỉ từ kịch bản.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => logic.setIsStudioOpen(true)}
                className="bg-purple-600 text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
              >
                Khởi chạy World Node <Play size={20} fill="currentColor" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all bg-white/5 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                Tài liệu kỹ thuật <Terminal size={18} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
             <div className="aspect-[4/5] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-12 shadow-3xl relative overflow-hidden transition-colors flex flex-col justify-between">
                <div className="space-y-6">
                   <div className="h-1 w-20 bg-purple-500"></div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Current Manifest</p>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter">Cyber_Ronin_Executioner</h3>
                   </div>
                </div>
                
                <div className="flex justify-center relative">
                   <div className="absolute inset-0 bg-purple-500/10 blur-[80px] rounded-full animate-pulse"></div>
                   <img src="https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268" className="w-full h-auto relative z-10 brightness-110 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2000ms]" alt="3D Model Preview" />
                </div>

                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-purple-500">PBR Texturing: Active</p>
                      <p className="text-[9px] font-black uppercase text-gray-500">Faces: 1.5M</p>
                   </div>
                   <ShieldCheck className="text-emerald-500" size={24} />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES */}
      <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl">
            {[
              { t: 'Mesh Gen', i: <Layers size={24}/>, d: 'Tạo lưới đa giác sạch, tối ưu cho việc diễn hoạt (Rigging/Animation).' },
              { t: 'PBR Materials', i: <Palette size={24}/>, d: 'Tự động tạo bản đồ Diffuse, Roughness, Metallic và Normal chuẩn công nghiệp.' },
              { t: 'Batch Export', i: <Package size={24}/>, d: 'Xuất tệp sang OBJ, FBX, GLB hoặc STL để in 3D và đưa vào Engine.' },
              { t: 'H100 Nodes', i: <Cpu size={24}/>, d: 'Xử lý hình khối cực phức tạp bằng hạ tầng GPU chuyên dụng.' },
              { t: 'Studio Renders', i: <Monitor size={24}/>, d: 'Render ảnh sản phẩm 3D chất lượng 8K với ánh sáng vật lý chân thực.' },
              { t: 'VPC Privacy', i: <ShieldCheck size={24}/>, d: 'Dữ liệu thiết kế được bảo vệ tuyệt đối trong môi trường Sandbox riêng.' }
            ].map((f, i) => (
              <div key={i} className="p-16 bg-white dark:bg-black space-y-8 group hover:bg-purple-500/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                 <div className="w-14 h-14 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-purple-600 transition-colors rounded-sm shadow-sm">
                    {f.i}
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.t}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.d}"</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-purple-500/5 rounded-full blur-[250px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Build the <br /> <span className="text-purple-500">Unreal.</span></h2>
           <button onClick={() => logic.setIsStudioOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-black px-24 py-8 rounded-full text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group">
              Khởi chạy 3D Studio <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
      </section>

    </div>
  );
};

export default Art3DPage;
