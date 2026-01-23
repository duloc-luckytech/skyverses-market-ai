
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Zap, Sparkles, 
  ArrowRight, Maximize2, Layers, 
  RefreshCw, Activity, LayoutGrid, 
  Wand2, CheckCircle2, Download, 
  Terminal, Cpu, Sliders, ImageIcon,
  Check, Target, Box, Database, 
  Workflow as WorkflowIcon, ShoppingBag, 
  Megaphone, Palette, FileText, ChevronRight,
  MousePointer2, Clock, ShieldCheck
} from 'lucide-react';
import AIImageGeneratorWorkspace from '../../components/AIImageGeneratorWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const AIImageGenerator = () => {
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <AIImageGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION – Image Studio là gì */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative">
        {/* Background Ambience */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[250px] animate-pulse"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-6 space-y-12 order-2 lg:order-1">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-blue transition-colors tracking-[0.4em]">
              <ChevronLeft size={14} /> Trở lại Kho giải pháp
            </Link>
            
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-black uppercase tracking-[0.3em] italic"
              >
                <Sparkles size={14} /> Next-Gen Visual Synthesis
              </motion.div>

              <div className="space-y-6">
                <h1 className="text-7xl lg:text-[130px] font-black leading-[0.8] tracking-tighter italic uppercase text-slate-900 dark:text-white transition-all">
                  Image <br /> <span className="text-brand-blue">Studio.</span>
                </h1>
                <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-8 max-w-2xl italic">
                  “Tạo hình ảnh cấp độ công nghiệp từ kịch bản văn bản và dữ liệu hình ảnh tham chiếu đa tầng.”
                </p>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'PROMPT + REF', icon: <Wand2 size={16}/>, desc: '6 ảnh tham chiếu' },
                 { label: 'SINGLE / BATCH', icon: <Layers size={16}/>, desc: 'Tạo hàng loạt' },
                 { label: 'SPEC CONTROL', icon: <Sliders size={16}/>, desc: 'Tùy chỉnh Ratio/Res' },
                 { label: 'CREDIT BASED', icon: <Zap size={16}/>, desc: 'Thanh toán linh hoạt' }
               ].map(item => (
                 <div key={item.label} className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col gap-3 group hover:border-brand-blue/30 transition-all shadow-sm">
                    <div className="text-brand-blue group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-brand-blue text-white px-16 py-8 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
              >
                Khởi chạy Studio <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative order-1 lg:order-2">
             <div className="aspect-square bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-[3rem] p-4 shadow-3xl overflow-hidden group ring-1 ring-black/5 dark:ring-white/10">
                <div className="h-full w-full bg-slate-100 dark:bg-black rounded-[2.5rem] relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[5s]" alt="Cinema Visual" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                   <div className="absolute bottom-10 left-10">
                      <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.5em] mb-2 italic">Architecture_Module_v4.5</p>
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Visual Synthesis.</h3>
                   </div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl animate-pulse">
                         <Wand2 size={48} className="text-brand-blue" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. GIAO DIỆN & WORKFLOW – Explain theo UI */}
      <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-32">
             <span className="text-brand-blue font-black uppercase tracking-[0.6em] text-[11px]">Production Pipeline</span>
             <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-tight">Quy trình <span className="text-brand-blue">vận hành.</span></h2>
             <p className="text-slate-500 dark:text-gray-400 font-medium max-w-xl mx-auto italic">“Thiết kế chính xác theo từng bước của giao diện chuyên nghiệp.”</p>
          </div>

          <div className="space-y-40">
            {[
              { 
                step: '01', 
                title: 'Ảnh tham chiếu (Reference)', 
                desc: 'Khởi tạo định danh thị giác. Upload tối đa 6 ảnh để AI hiểu style, nhân vật và bố cục. Hệ thống hỗ trợ khóa Identity Lock giúp giữ vững các đặc điểm quan trọng. Có thể bỏ qua nếu chỉ dùng prompt.',
                icon: <ImageIcon size={32} />,
                img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
                tags: ['Max 6 images', 'Identity Sync', 'Optional']
              },
              { 
                step: '02', 
                title: 'Kịch bản (Prompt Script)', 
                desc: 'Mô tả hình ảnh mong muốn bằng ngôn ngữ tự nhiên. Hệ thống hỗ trợ kịch bản dài, chi tiết, phù hợp cho cả nhu cầu sáng tạo tự do (Creative) và sản xuất thương mại (Commercial).',
                icon: <Terminal size={32} />,
                img: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800',
                tags: ['Natural Language', 'High Detail', 'Logic Binding']
              },
              { 
                step: '03', 
                title: 'Lựa chọn Model Engine', 
                desc: 'Tùy chỉnh trung tâm xử lý. Chọn model AI phù hợp với mục tiêu chất lượng và ngân sách Credits. Mỗi Engine được tối ưu hóa cho các phong cách hiển thị khác nhau.',
                icon: <Cpu size={32} />,
                img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=800',
                tags: ['Gemini 3 Pro', 'Banana Pro', 'Custom Nodes']
              },
              { 
                step: '04', 
                title: 'Output Specification', 
                desc: 'Thiết lập tham số cuối cùng. Tùy chỉnh tỷ lệ khung hình (1:1, 16:9, 9:16...), độ phân giải (1K, 2K, 4K) và số lượng biến thể cần tạo trong một chu kỳ.',
                icon: <Sliders size={32} />,
                img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
                tags: ['Multi-Ratio', 'UHD Resolution', 'Quantity Control']
              },
              { 
                step: '05', 
                title: 'Generate & Credits', 
                desc: 'Thực thi kiến tạo. Hình ảnh được tổng hợp trong vài giây. Hệ thống hiển thị rõ ràng số lượng Credits tiêu thụ dựa trên cấu hình đã thiết lập.',
                icon: <Zap size={32} />,
                img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
                tags: ['Fast Inference', 'Real-time Sync', 'Credit Clear']
              }
            ].map((item, idx) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="lg:w-1/2 relative group">
                  <div className="absolute -inset-4 bg-brand-blue/5 rounded-[3rem] blur-2xl group-hover:bg-brand-blue/10 transition-all"></div>
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 bg-black">
                    <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  </div>
                </div>
                <div className="lg:w-1/2 space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                            {item.icon}
                         </div>
                         <span className="text-4xl font-black italic text-brand-blue/40">STEP_{item.step}</span>
                      </div>
                      <h3 className="text-3xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">{item.title}</h3>
                   </div>
                   <p className="text-lg lg:text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-4 border-brand-blue pl-6 transition-colors">
                     "{item.desc}"
                   </p>
                   <div className="flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/10">#{tag}</span>
                      ))}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SINGLE vs BATCH MODE */}
      <section className="py-40 bg-white dark:bg-[#050507] relative z-10 transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-32">
             <span className="text-brand-blue font-black uppercase tracking-[0.6em] text-[11px]">Operation Modes</span>
             <h2 className="text-4xl lg:text-8xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Single vs Batch <span className="text-brand-blue">Mode.</span></h2>
             <p className="text-slate-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Chọn chế độ vận hành tối ưu cho mục đích sáng tạo hoặc sản xuất quy mô.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl rounded-sm overflow-hidden">
             {/* Single Mode */}
             <div className="p-16 lg:p-24 bg-white dark:bg-[#0d0d0f] space-y-12 transition-all hover:bg-brand-blue/[0.01] border-r border-black/5 dark:border-white/5">
                <div className="flex justify-between items-start">
                   <div className="w-16 h-16 rounded-[2rem] bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner">
                      <ImageIcon size={32} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 italic">Concept Testing</span>
                </div>
                <div className="space-y-6">
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Đơn lẻ (Single)</h3>
                   <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-brand-blue pl-6">"Phù hợp để test ý tưởng, tinh chỉnh concept và hoàn thiện kịch bản chi tiết."</p>
                </div>
                <ul className="space-y-4">
                   {['Kiến tạo từng ảnh với độ tập trung cao', 'Tối ưu hóa prompt theo từng lượt render', 'Hoàn hảo cho giai đoạn lên Concept Art', 'Kiểm soát chi tiết nhân dạng chính xác'].map(f => (
                     <li key={f} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400"><CheckCircle2 size={16} className="text-emerald-500" /> {f}</li>
                   ))}
                </ul>
             </div>

             {/* Batch Mode */}
             <div className="p-16 lg:p-24 bg-white dark:bg-[#0d0d0f] space-y-12 transition-all hover:bg-purple-500/[0.01]">
                <div className="flex justify-between items-start">
                   <div className="w-16 h-16 rounded-[2rem] bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-inner">
                      <LayoutGrid size={32} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 italic">Production Scale</span>
                </div>
                <div className="space-y-6">
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Hàng loạt (Batch)</h3>
                   <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-purple-500 pl-6">"Hiệu suất quy mô lớn. Một kịch bản tạo ra hàng chục biến thể phục vụ marketing."</p>
                </div>
                <ul className="space-y-4">
                   {['Một kịch bản tạo ra nhiều biến thể cùng lúc', 'Phục vụ nhu cầu Content Scale đa nền tảng', 'Dùng cho các chiến dịch Marketing, Social', 'Tăng hiệu suất sản xuất lên 400%'].map(f => (
                     <li key={f} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400"><CheckCircle2 size={16} className="text-purple-500" /> {f}</li>
                   ))}
                </ul>
             </div>
          </div>
        </div>
      </section>

      {/* 4. USE CASES – Tool này dùng cho ai */}
      <section className="py-40 bg-slate-50 dark:bg-[#050507] transition-colors duration-500">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12 space-y-24">
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Mọi biên giới <br /><span className="text-brand-blue">thị giác.</span></h2>
              </div>
              <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-xs tracking-widest max-w-xs text-right italic border-r-4 border-brand-blue pr-6">"Giải pháp visual đầu-cuối cho cá nhân và doanh nghiệp dẫn đầu."</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  t: 'Marketing', 
                  d: 'Ads images, Banner, Social visuals.', 
                  img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800',
                  icon: <Megaphone className="text-brand-blue" />
                },
                { 
                  t: 'Design / Creative', 
                  d: 'Concept art, Key visual, Style exploration.', 
                  img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
                  icon: <Palette className="text-purple-500" />
                },
                { 
                  t: 'E-commerce', 
                  d: 'Product images, Background variations.', 
                  img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
                  icon: <ShoppingBag className="text-emerald-500" />
                },
                { 
                  t: 'Content Creator', 
                  d: 'Thumbnail, Illustration, Storytelling.', 
                  img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
                  icon: <FileText className="text-orange-500" />
                }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-[3/4] bg-black rounded-sm shadow-2xl transition-all hover:scale-[1.02]">
                   <img src={item.img} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt={item.t} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                      <div className="space-y-4 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                         <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">{item.icon}</div>
                         <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">{item.t}</h4>
                         <p className="text-xs text-white/60 font-bold uppercase tracking-widest leading-relaxed">"{item.d}"</p>
                         <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="flex items-center gap-2 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em]">Khám phá ngay <ChevronRight size={14}/></button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-60 text-center relative overflow-hidden bg-brand-blue text-white group transition-all duration-700">
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-white leading-none tracking-tighter select-none italic">
          VISUAL VISUAL VISUAL VISUAL
        </div>
        <div className="max-w-4xl mx-auto space-y-12 relative z-10 px-6">
          <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic">Start <br /> <span className="text-slate-900">Synthesizing.</span></h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-black text-white px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:scale-110 transition-all shadow-2xl w-full sm:w-auto"
            >
              VÀO STUDIO NGAY
            </button>
            <Link to="/market" className="bg-white/10 text-white border border-white/20 px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all backdrop-blur-md w-full sm:w-auto">
              XEM GIẢI PHÁP KHÁC
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AIImageGenerator;
