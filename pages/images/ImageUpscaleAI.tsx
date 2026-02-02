
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Upload, Maximize2, Sparkles, 
  Download, Zap, ShieldCheck, CheckCircle2, 
  ArrowRight, Play, Info, Layers, 
  ImageIcon, Search, Activity, MousePointer2,
  Image as LucideImage, Zap as ZapIcon,
  Check, AlertCircle, Monitor, FileImage, 
  Target, Cpu, Palette, Smartphone, Clock,
  // Added missing imports
  Settings2, Coins
} from 'lucide-react';
import UpscaleWorkspace from '../../components/UpscaleWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const ImageUpscaleAI = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <UpscaleWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  const useCases = [
    { title: 'Sản phẩm & Thương mại', desc: 'Banner, landing page, ảnh catalog chuyên nghiệp.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
    { title: 'Chân dung & Thời trang', desc: 'Tái tạo chi tiết da, tóc và biểu cảm chân thực.', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800' },
    { title: 'In ấn khổ lớn', desc: 'Poster, backdrop, billboard chất lượng 8K - 12K.', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800' },
    { title: 'Xử lý hàng loạt', desc: 'Tối ưu chi phí cho các dự án quy mô lớn.', img: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600' }
  ];

  const modes = [
    { 
      id: 'standard', 
      title: 'Tiêu chuẩn (Standard)', 
      desc: 'Chi phí thấp, xử lý nhanh.',
      features: ['Nâng độ nét cơ bản', 'Giảm vỡ hình nén', 'Lý tưởng cho SEO & Social'],
      icon: <ZapIcon className="text-blue-500" />
    },
    { 
      id: 'pro', 
      title: 'Chuyên nghiệp (Professional)', 
      desc: 'Tái tạo chi tiết, hình ảnh mượt mà.',
      features: ['Cơ chế Nano Pro', 'Cân bằng chất lượng & chi phí', 'Phù hợp Marketing & Thiết kế'],
      icon: <Cpu className="text-purple-500" />
    },
    { 
      id: 'real', 
      title: 'Generative Real (Human-like)', 
      desc: 'Tái tạo chi tiết thật tuyệt đối.',
      features: ['Da, tóc, lỗ chân lông chân thực', 'Xóa bỏ cảm giác "AI giả"', 'Dành cho chân dung & in ấn cao cấp'],
      icon: <Sparkles className="text-emerald-500" />
    }
  ];

  return (
    <div className="bg-white dark:bg-[#050505] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-[#4ade80]/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4ade80]/5 dark:bg-[#4ade80]/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#00a870] dark:text-[#4ade80] text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} /> 🚀 Generative Upscale - Nâng Cấp Ảnh AI
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[90px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Upscale <br />
                <span className="text-[#00a870] dark:text-[#4ade80]">hình ảnh.</span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-[#00a870] dark:border-[#4ade80] pl-8 max-w-xl italic transition-colors">
                “Giải pháp upscale ảnh cao cấp, nhanh và tự nhiên. Không chỉ phóng to, chúng tôi tái tạo lại từng pixel bằng trí tuệ nhân tạo.”
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-[#00a870] dark:bg-[#4ade80] text-white dark:text-black px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(74,222,128,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                VÀO STUDIO NGAY <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md flex items-center justify-center gap-4 shadow-sm">
                XEM KẾT QUẢ MẪU <Play size={16} fill="currentColor" />
              </button>
            </div>

            <div className="flex items-center gap-8 opacity-40">
               <div className="flex flex-col">
                  <span className="text-2xl font-black italic">12K</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Max Resolution</span>
               </div>
               <div className="h-8 w-px bg-slate-300 dark:bg-white/10"></div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black italic">0.4s</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Processing Time</span>
               </div>
               <div className="h-8 w-px bg-slate-300 dark:bg-white/10"></div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black italic">AI</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Generative Detail</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
             <div className="aspect-[16/10] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-4 shadow-3xl overflow-hidden group transition-colors">
                <div className="relative w-full h-full bg-white dark:bg-black rounded-sm border border-[#4ade80]/10 overflow-hidden flex items-center justify-center transition-colors">
                   <div className="absolute inset-0 grid grid-cols-2">
                      <img 
                        src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600" 
                        className="w-full h-full object-cover grayscale opacity-40 blur-md scale-110" 
                        alt="Low Res" 
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=100&w=1600" 
                        className="w-full h-full object-cover" 
                        alt="High Res" 
                      />
                   </div>
                   <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#4ade80] shadow-[0_0_20px_#4ade80] z-20"></div>
                   
                   <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-[0.2em] border border-white/10 z-30">ORIGINAL_SD</div>
                   <div className="absolute top-6 right-6 px-3 py-1 bg-[#4ade80] rounded text-[8px] font-black text-black uppercase tracking-[0.2em] shadow-xl z-30">GENERATIVE_UHD_12K</div>
                   
                   <div className="absolute bottom-8 left-8 space-y-1 z-30">
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-lg">Crystal Clarity.</h3>
                      <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest italic">Detail_Reconstruction_Active</p>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. INTRO SECTION */}
      <section className="py-40 bg-slate-50 dark:bg-[#070709] border-y border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center space-y-10">
          <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
            Công nghệ tái tạo <br /><span className="text-[#00a870] dark:text-[#4ade80]">thế hệ mới.</span>
          </h2>
          <p className="text-lg lg:text-2xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">
            Generative Upscale không chỉ phóng to độ phân giải mà còn tái tạo chi tiết thông minh bằng AI. Ảnh sau upscale sắc nét hơn, rõ kết cấu hơn, màu sắc hài hòa và giữ được tính tự nhiên – kể cả ở độ phân giải rất cao.
          </p>
        </div>
      </section>

      {/* 3. MODES SECTION */}
      <section className="py-40 bg-white dark:bg-[#030305] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <span className="text-[#00a870] font-black uppercase tracking-[0.6em] text-[11px]">System Protocols</span>
             <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Các chế độ Upscale</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modes.map((m, i) => (
              <div key={m.id} className="p-10 bg-slate-50 dark:bg-[#111] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] space-y-10 group hover:border-[#4ade80]/40 transition-all shadow-sm">
                 <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      {m.icon}
                    </div>
                    <span className="text-[40px] font-black italic opacity-5 text-slate-900 dark:text-white">0{i+1}</span>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">{m.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase italic tracking-widest leading-relaxed">"{m.desc}"</p>
                 </div>
                 <ul className="space-y-3 pt-6 border-t border-slate-100 dark:border-white/5">
                    {m.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 dark:text-gray-500 tracking-widest">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></div> {f}
                      </li>
                    ))}
                 </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SPECS SECTION */}
      <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Độ phân giải <br /><span className="text-[#4ade80]">Hỗ trợ.</span></h2>
                <p className="text-xl text-slate-500 dark:text-gray-400 font-medium italic border-l-4 border-[#4ade80] pl-8">2K – 4K – 8K – 10K – 12K</p>
              </div>
              <div className="space-y-8">
                 {[
                   'Tự động tối ưu chi tiết theo từng mức độ phân giải',
                   'Giữ nguyên bố cục gốc, cam kết không méo hình',
                   'Xử lý mượt mà ngay cả với các tệp tin kích thước lớn',
                   'Phù hợp cho cả màn hình LED và in ấn billboard'
                 ].map(item => (
                   <div key={item} className="flex gap-6 items-start group">
                      <div className="w-6 h-6 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-[#00a870] dark:text-[#4ade80] shrink-0 mt-1">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      <p className="text-lg text-slate-600 dark:text-gray-400 font-bold uppercase tracking-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-snug">"{item}"</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative">
              <div className="absolute inset-0 bg-[#4ade80]/5 blur-[120px] rounded-full animate-pulse"></div>
              <div className="relative bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 p-12 rounded-[3rem] shadow-3xl space-y-10 group overflow-hidden">
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-6">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.4em]">RES_INSPECTOR_v3</span>
                    {/* Fixed: Settings2 import added above */}
                    <Settings2 size={16} className="text-[#4ade80]" />
                 </div>
                 <div className="space-y-10">
                    {['Pixel Density', 'Texture Reconstruction', 'Color Accuracy'].map(l => (
                      <div key={l} className="space-y-4">
                         <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest"><span>{l}</span><span>99%</span></div>
                         <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '99%' }} transition={{ duration: 1.5 }} className="h-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]"></motion.div>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="pt-8 flex justify-between items-end">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80]"><Monitor size={24}/></div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">READY_FOR_MASTERING</p>
                    </div>
                    <Activity size={32} className="text-[#4ade80]/20 animate-pulse" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. USE CASES SECTION */}
      <section className="py-40 bg-white dark:bg-[#020205] transition-colors">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12 space-y-24">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4 text-left">
                 <span className="text-[#00a870] font-black uppercase tracking-[0.4em] text-[11px]">Industrial Vertical</span>
                 <h2 className="text-5xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white transition-colors">Phù hợp <br /><span className="text-[#00a870] dark:text-[#4ade80]">mọi nhu cầu.</span></h2>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {useCases.map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-[3/4] bg-slate-100 dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-all duration-500 cursor-pointer">
                   <img src={item.img} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" alt={item.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                      <div className="space-y-4 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                         <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight">{item.title}</h4>
                         <p className="text-[11px] text-white/60 font-bold uppercase tracking-widest leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">"{item.desc}"</p>
                         <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="flex items-center gap-2 text-[#4ade80] text-[10px] font-black uppercase tracking-[0.2em]">Khám phá node <ArrowRight size={14}/></span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* 6. HIGHLIGHTS & SUMMARY */}
      <section className="py-40 bg-slate-50 dark:bg-[#070709] border-y border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-24">
           <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Ưu điểm nổi bật.</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { t: 'Xử lý nhanh – ổn định', i: <Zap />, d: 'Tận dụng cụm GPU H100 cho tốc độ render vượt trội.' },
                // Fixed: Added size prop to Brain
                { t: 'AI tái tạo chi tiết', i: <Brain size={24} />, d: 'Không chỉ là phóng to, AI thực sự hiểu và "vẽ lại" các chi tiết bị mất.' },
                { t: 'Hình ảnh tự nhiên', i: <Palette />, d: 'Đảm bảo sự hài hòa về màu sắc và ánh sáng sau khi nâng cấp.' },
                // Fixed: Added Coins to imports
                { t: 'Giá hợp lý', i: <Coins />, d: 'Tối ưu hóa chi phí cho cả nhu cầu cá nhân lẫn sản xuất số lượng lớn.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-8 items-start text-left group">
                   <div className="w-16 h-16 rounded-2xl bg-[#4ade80]/10 flex items-center justify-center text-[#00a870] dark:text-[#4ade80] shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      {item.i}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-2xl font-black uppercase italic tracking-tight text-slate-800 dark:text-white">{item.t}</h4>
                      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">"{item.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black border-t border-slate-200 dark:border-white/5 transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-[#4ade80] leading-none tracking-tighter select-none italic">
          UPSCALE UPSCALE UPSCALE
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Upgrade Your <br /> <span className="text-[#00a870] dark:text-[#4ade80]">Visuals.</span></h2>
           <div className="space-y-10 pt-10 px-6">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="w-full sm:w-auto bg-[#00a870] dark:bg-[#4ade80] text-white dark:text-black px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(74,222,128,0.2)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              NÂNG CẤP NGAY <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic leading-relaxed">Universal Credit Ready • Enterprise Privacy • 12K Resolution Support</p>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#030304] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black uppercase transition-colors">Generative Upscale AI</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Hệ thống nâng cấp hình ảnh 12K dựa trên thuật toán Generative. Tối ưu cho in ấn và thiết kế chuyên nghiệp.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-[#00a870] dark:hover:text-[#4ade80] transition-colors">Tech Docs</a>
              <a href="#" className="hover:text-[#00a870] dark:hover:text-[#4ade80] transition-colors">Privacy Registry</a>
              <a href="#" className="hover:text-[#00a870] dark:hover:text-[#4ade80] transition-colors">Support Node</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

const Brain = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.48z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.48z"/></svg>;

export default ImageUpscaleAI;
