
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Play, Zap, Sparkles, ArrowRight, Layers, 
  Settings2, Activity, MonitorPlay, Video, 
  Smartphone, Share2, Download, Info, CheckCircle2,
  Rocket, History, Box, Globe, Cpu, RefreshCw,
  Film, LayoutGrid, Maximize2, Trash2, Terminal,
  Link2, Clapperboard, Database, ShieldCheck,
  MousePointer2, Sliders, ChevronRight, BarChart3,
  Plus, Upload, Image as LucideImage, Scissors,
  Split, Code2, Gauge
} from 'lucide-react';
import AIVideoGeneratorWorkspace from '../../components/AIVideoGeneratorWorkspace';

const AIVideoGenerator = () => {
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <AIVideoGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION (VIDEO STUDIO) */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[250px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[200px] pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] italic"
            >
              <Sparkles size={14} /> Neural Production Studio
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Generate AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-500">Videos at Scale.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-indigo-500 pl-8 max-w-xl">
                Create videos from prompts, images, or scenes — all powered by advanced AI models like VEO 3.1.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-indigo-600 text-white px-12 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Create Video <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all bg-white/50 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                View Examples <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2">
             <div className="aspect-[16/10] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-4 shadow-3xl overflow-hidden group ring-1 ring-black/5 dark:ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent"></div>
                <div className="h-full w-full bg-slate-100 dark:bg-black rounded-lg border border-slate-200 dark:border-white/5 flex overflow-hidden">
                   <div className="w-1/3 border-r border-slate-200 dark:border-white/5 p-6 space-y-6 bg-slate-50 dark:bg-[#08080a] hidden md:block">
                      <div className="space-y-2">
                        <div className="h-1 w-8 bg-indigo-500"></div>
                        <div className="h-3 w-full bg-slate-200 dark:bg-white/5 rounded-sm"></div>
                      </div>
                      <div className="space-y-4 pt-4">
                         <div className="h-16 w-full bg-slate-100 dark:bg-white/5 rounded-sm border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 dark:text-gray-700">
                            <Plus size={16} />
                         </div>
                         <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-slate-200 dark:bg-white/5"></div>
                            <div className="h-8 w-full bg-indigo-600/10 dark:bg-indigo-600/20 rounded-sm border border-indigo-500/30"></div>
                         </div>
                      </div>
                   </div>
                   <div className="flex-grow bg-slate-100 dark:bg-[#0c0c0e] relative p-8 flex items-center justify-center">
                      <div className="aspect-video w-full bg-black rounded border border-slate-200 dark:border-white/5 overflow-hidden relative shadow-inner">
                         <video 
                           src="https://framerusercontent.com/assets/U4v4W7xT3tL0N8I.mp4" 
                           autoPlay loop muted 
                           className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[5s]" 
                         />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xl">
                               <Play size={20} fill="currentColor" />
                            </div>
                         </div>
                         <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[7px] font-black uppercase text-white tracking-widest">Rendering_VEO_3.1</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. VIDEO CREATION MODES */}
      <section className="py-40 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#08080a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Production Modes</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Optimized Workflows for Every Creator</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Single Mode', desc: 'Fast and simple. One prompt, one cinematic video instantly.', icon: <Zap />, cost: '25 CR' },
              { title: 'Multi Mode', desc: 'Storytelling powerhouse. Multiple prompts synced across multiple scenes.', icon: <Layers />, cost: '100 CR' },
              { title: 'Auto Mode', desc: 'Scale in bulk. Automated generation from a comprehensive prompt list.', icon: <RefreshCw />, cost: 'Variable' }
            ].map((mode, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-sm relative group hover:border-indigo-500/40 transition-all shadow-sm">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-10 rounded-sm group-hover:bg-indigo-500 group-hover:text-white transition-all">
                   {React.cloneElement(mode.icon as React.ReactElement<any>, { size: 28 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{mode.title}</h4>
                <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose mb-8">"{mode.desc}"</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                   <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-500 tracking-widest">Pricing: {mode.cost}</span>
                   <ChevronRight size={16} className="text-slate-300 dark:text-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ADVANCED WORKFLOWS (VISUAL EXPLAINER) */}
      <section className="py-40 bg-white dark:bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-48">
           
           {/* 3.1 Start Frame Explain */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-8">
                 <div className="inline-block p-4 bg-indigo-500/10 rounded-sm"><MonitorPlay size={32} className="text-indigo-600 dark:text-indigo-400"/></div>
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Start Frame <br /><span className="text-indigo-600 dark:text-indigo-500">Extension.</span></h2>
                 <p className="text-xl text-slate-600 dark:text-gray-400 font-medium">Upload bất kỳ hình ảnh nào làm mỏ neo hình ảnh. AI phân tích bản sắc, ánh sáng và kết cấu để mở rộng nó thành một chuỗi chuyển động 4 giây nhất quán.</p>
                 <div className="grid grid-cols-2 gap-4">
                    {['Pixel-Perfect Sync', 'Identity Locking', 'Texture Mapping', 'Spatial Depth'].map(f => (
                       <div key={f} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 dark:text-gray-500 tracking-widest">
                          <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-500" /> {f}
                       </div>
                    ))}
                 </div>
              </div>
              <div className="aspect-square bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-10 flex flex-col justify-center items-center gap-10 relative group shadow-sm dark:shadow-none transition-colors">
                 <div className="w-full aspect-video bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-lg flex flex-col items-center justify-center text-slate-400 dark:text-gray-600 transition-colors group-hover:border-indigo-500/40">
                    <Upload size={32} className="mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Initial_Blueprint.png</span>
                 </div>
                 <ArrowRight className="text-indigo-600 dark:text-indigo-500 rotate-90 scale-150 animate-bounce" />
                 <div className="w-full aspect-video bg-white dark:bg-black rounded-lg border border-indigo-500/20 shadow-2xl relative overflow-hidden transition-colors">
                    <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
                    <Activity className="absolute bottom-4 left-4 text-indigo-600 dark:text-indigo-500 w-4 h-4" />
                 </div>
              </div>
           </div>

           {/* 3.2 Scene Based Explain */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="grid grid-cols-2 grid-rows-2 gap-4 aspect-square bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-8 order-2 lg:order-1 relative transition-colors shadow-sm dark:shadow-none">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-40"></div>
                 {[1,2,3,4].map(i => (
                    <div key={i} className="bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-sm flex items-center justify-center relative overflow-hidden group/s transition-colors">
                       <Film className="text-slate-200 dark:text-white/10 group-hover/s:text-indigo-600 dark:group-hover/s:text-indigo-500 transition-colors" size={24}/>
                       <div className="absolute top-2 left-2 text-[8px] font-black text-slate-300 dark:text-white/20 uppercase">SCENE_0{i}</div>
                    </div>
                 ))}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-indigo-600/10 blur-xl animate-pulse"></div>
                 </div>
              </div>
              <div className="space-y-8 order-1 lg:order-2">
                 <div className="inline-block p-4 bg-violet-500/10 rounded-sm"><LayoutGrid size={32} className="text-violet-600 dark:text-violet-400"/></div>
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-right text-slate-900 dark:text-white">Scene-Based <br /><span className="text-violet-600 dark:text-violet-500">Creation.</span></h2>
                 <p className="text-xl text-slate-600 dark:text-gray-400 font-medium text-right">Xác định các cảnh riêng lẻ với trọng số lệnh cụ thể và các điểm neo hình ảnh. Điều phối các câu chuyện phức tạp với trình tự hoàn hảo theo từng khung hình.</p>
                 <div className="flex justify-end gap-6">
                    <button className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-white hover:text-black dark:hover:bg-white transition-all">Configure Timeline</button>
                 </div>
              </div>
           </div>

           {/* 3.3 Multi-Prompt Block */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
              <div className="lg:col-span-7 space-y-8">
                 <div className="inline-block p-4 bg-blue-500/10 rounded-sm"><Split size={32} className="text-blue-600 dark:text-blue-400"/></div>
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Multi-Prompt <br /><span className="text-blue-600 dark:text-blue-500">Block Parsing.</span></h2>
                 <p className="text-xl text-slate-600 dark:text-gray-400 font-medium italic leading-relaxed">
                   "One massive script. Intelligent split. Parallel execution."
                 </p>
                 <p className="text-slate-500 dark:text-gray-500 text-base leading-relaxed">Nhập kịch bản đầy đủ của bạn vào một khối văn bản duy nhất. Công cụ phân tích cú pháp thông minh của chúng tôi tự động chia tách nội dung dựa trên các từ khóa bối cảnh và tạo ra các nhiệm vụ xử lý song song trên nhiều Node H100.</p>
                 <div className="flex gap-4">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase">Auto-Splitting</span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase">Parallel Processing</span>
                 </div>
              </div>
              <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 p-8 rounded-xl space-y-4 shadow-sm dark:shadow-none transition-colors">
                 <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase mb-4">
                    <Code2 size={14} /> Logic_Parser_Terminal
                 </div>
                 <div className="p-4 bg-slate-900 dark:bg-black border border-blue-500/20 text-blue-400/70 font-mono text-[10px] space-y-2 rounded">
                    <p className="animate-pulse">SCENE_01: Character enters... [SPLIT]</p>
                    <p className="opacity-40">SCENE_02: Close up on face... [SPLIT]</p>
                    <p className="opacity-20">SCENE_03: Wide landscape... [SPLIT]</p>
                 </div>
                 <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden transition-colors">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, repeat: Infinity }} className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></motion.div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. SMART AUTO MODE */}
      <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-200 dark:border-white/5 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
             <div className="lg:col-span-5 space-y-12">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-500">
                      <RefreshCw size={24} className="animate-spin-slow" />
                      <span className="text-[10px] font-black uppercase tracking-[0.6em]">Smart_Auto_Node</span>
                   </div>
                   <h2 className="text-6xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Bulk <br /> Machine.</h2>
                </div>
                <p className="text-slate-600 dark:text-gray-500 text-lg leading-relaxed font-medium uppercase tracking-widest">Sản xuất hàng loạt với tốc độ chưa từng có. Chế độ tự động quản lý thư viện hình ảnh của bạn để bạn có thể tập trung vào cốt truyện.</p>
                
                <div className="space-y-4">
                   {[
                     'Tự động chọn ảnh từ kho lưu trữ riêng tư',
                     'Trình tự tài sản dựa trên đơn đặt hàng hoặc ngẫu nhiên',
                     'Logic chống trùng lặp tự động',
                     'Tự động loại bỏ các khung hình đã sử dụng'
                   ].map(item => (
                     <div key={item} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400/80">
                        <Check size={16} /> {item}
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="lg:col-span-7">
                <div className="p-1 bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 rounded-sm">
                   <div className="bg-white dark:bg-[#0c0c0e] p-10 border border-slate-200 dark:border-white/5 space-y-8 relative overflow-hidden shadow-xl transition-colors">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-5 text-slate-900 dark:text-white"><RefreshCw size={200} /></div>
                      
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-6">
                         <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                            <Database size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Library_Sync_Protocol</span>
                         </div>
                         <div className="px-3 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Active</div>
                      </div>

                      <div className="space-y-4">
                         {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-sm border border-slate-100 dark:border-white/5 group hover:border-indigo-500/40 transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-200 dark:bg-black rounded-sm border border-slate-200 dark:border-white/10"></div>
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black uppercase tracking-tight text-slate-800 dark:text-white">Directive_Asset_0{i}</p>
                                     <p className="text-[8px] text-slate-400 dark:text-gray-500 uppercase font-bold tracking-widest">Status: Ready_for_Inference</p>
                                  </div>
                               </div>
                               <Zap size={14} className="text-slate-200 dark:text-gray-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. LINK REMIX */}
      <section className="py-40 bg-white dark:bg-black relative overflow-hidden transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-violet-600/5 rounded-full blur-[250px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center space-y-16 relative z-10">
           <div className="space-y-6">
              <h2 className="text-6xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Remix <br /><span className="text-violet-600 dark:text-violet-500">The Feed.</span></h2>
              <p className="text-xl text-slate-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">Dán liên kết từ YouTube, TikTok hoặc Instagram. AI phân tích thẩm mỹ cốt lõi và chuyển động để tạo ra một bản tái hiện trung thực nhất.</p>
           </div>
           
           <div className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full blur opacity-10 dark:opacity-25 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center bg-slate-50 dark:bg-[#08080a] border border-slate-200 dark:border-white/10 rounded-full px-8 py-5 shadow-sm dark:shadow-none transition-colors">
                 <Link2 className="text-slate-300 dark:text-gray-600 mr-4" size={20} />
                 <input 
                   placeholder="Paste Social URL (YouTube / TikTok)..." 
                   className="bg-transparent border-none text-slate-900 dark:text-white focus:outline-none flex-grow text-sm font-bold tracking-tight placeholder:text-slate-300 dark:placeholder:text-gray-800"
                 />
                 <button className="bg-indigo-600 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Analyze</button>
              </div>
           </div>

           <div className="flex justify-center gap-16 opacity-10 dark:opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 text-slate-900 dark:text-white">
              <span className="text-2xl font-black italic tracking-tighter">YOUTUBE</span>
              <span className="text-2xl font-black italic tracking-tighter">TIKTOK</span>
              <span className="text-2xl font-black italic tracking-tighter">INSTAGRAM</span>
           </div>
        </div>
      </section>

      {/* 6. CORE FEATURES */}
      <section className="py-40 border-y border-slate-100 dark:border-white/5 bg-white dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl">
              {[
                { t: 'Text-to-Video', i: <Video />, d: 'Tổng hợp chuyển động ngữ nghĩa từ văn bản thuần túy.' },
                { t: 'Image-to-Video', i: <LucideImage />, d: 'Mở rộng khung hình tĩnh thành các cảnh phim điện ảnh.' },
                { t: 'Scene Control', i: <Clapperboard />, d: 'Điều phối các câu chuyện theo từng cảnh quay.' },
                { t: 'Multi-Prompting', i: <Terminal />, d: 'Chia nhỏ kịch bản dài thành các nhiệm vụ song song.' },
                { t: 'Auto-Assignment', i: <Box />, d: 'Liên kết tài sản tự động từ thư viện riêng.' },
                { t: 'VEO 3.1 Pro', i: <Cpu />, d: 'Hạ tầng hình ảnh flagship cấp doanh nghiệp.' },
                { t: 'Credit System', i: <Zap />, d: 'Sử dụng mô-đun dựa trên độ phức tạp tổng hợp.' },
                { t: 'Processing Vault', i: <History />, d: 'Lịch sử render an toàn và lưu trữ tài sản riêng tư.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-indigo-500/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                   <div className="w-12 h-12 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-300 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 transition-colors rounded-sm shadow-sm dark:shadow-none">
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

      {/* 7. UI & WORKFLOW SHOWCASE */}
      <section className="py-40 bg-slate-50 dark:bg-[#08080a] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Engineered UX</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Studio Architecture Breakdown</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="p-12 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.01] rounded-sm space-y-10 group hover:border-indigo-500/40 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Sliders className="text-indigo-600 dark:text-indigo-500" size={24} />
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Control Panel (Left)</h4>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                   {[
                     { l: 'Mode Selection', d: 'Toggle between Single, Multi, and Auto production tracks.' },
                     { l: 'Prompt Console', d: 'Natural language input with semantic parsing.' },
                     { l: 'Asset Manager', d: 'Manage reference images and identity anchors.' },
                     { l: 'Compute Spec', d: 'Select model (Veo 3.1) and target resolution (1080p).' }
                   ].map(item => (
                      <div key={item.l} className="flex gap-6 items-start pb-6 border-b border-slate-100 dark:border-white/5 last:border-0 group/i">
                         <span className="text-[9px] font-black text-indigo-500/40 group-hover/i:text-indigo-600 dark:group-hover/i:text-indigo-500 transition-colors uppercase shrink-0">Module</span>
                         <div className="space-y-1">
                            <p className="text-[12px] font-black uppercase text-slate-800 dark:text-white">{item.l}</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">"{item.d}"</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="p-12 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.01] rounded-sm space-y-10 group hover:border-violet-500/40 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <MonitorPlay className="text-violet-600 dark:text-violet-500" size={24} />
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Rendering Hub (Right)</h4>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                   {[
                     { l: 'Production Queue', d: 'Live telemetry for currently rendering takes.' },
                     { l: 'Asset Vault', d: 'Historical archive of all generated cinematic assets.' },
                     { l: 'Master Preview', d: '1080p viewport with industrial playback controls.' },
                     { l: 'Export Node', d: 'Direct download or social uplink for final masters.' }
                   ].map(item => (
                      <div key={item.l} className="flex gap-6 items-start pb-6 border-b border-slate-100 dark:border-white/5 last:border-0 group/i">
                         <span className="text-[9px] font-black text-violet-500/40 group-hover/i:text-violet-600 dark:group-hover/i:text-violet-500 transition-colors uppercase shrink-0">Stage</span>
                         <div className="space-y-1">
                            <p className="text-[12px] font-black uppercase text-slate-800 dark:text-white">{item.l}</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">"{item.d}"</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 8. USE CASES */}
      <section className="py-40 bg-white dark:bg-black transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
           <div className="text-center space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Built for Verticals</h2>
              <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Global Solutions // Local Speed</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: 'Social Ads', d: 'High-frequency creative for TikTok & Reels.', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800' },
                { t: 'Marketing', d: 'Cinematic brand stories in minutes.', img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800' },
                { t: 'Education', d: 'Animated sequences for high-impact learning.', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
                { t: 'Film Prefiz', d: 'Rapid storyboarding for indie studios.', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800' },
                { t: 'Narratives', d: 'AI storytelling for modern content creators.', img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800' },
                { t: 'Bulk Media', d: 'Automated content pipelines for scale.', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-[4/5] border border-slate-100 dark:border-white/5 rounded-sm bg-slate-200 dark:bg-black shadow-xl transition-all hover:border-indigo-500/40">
                    <img src={item.img} className="w-full h-full object-cover grayscale opacity-60 dark:opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" alt={item.t} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                       <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                          <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white">{item.t}</h4>
                          <p className="text-xs text-indigo-400 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">"{item.d}"</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* 9. PRICING / CREDITS */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#08080a] transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
           <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Unified Quota</h2>
           <div className="p-10 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-sm space-y-8 shadow-sm dark:shadow-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-500 tracking-widest flex items-center gap-2"><Zap size={10} fill="currentColor"/> Credits Per Take</p>
                    <p className="text-sm text-slate-500 dark:text-gray-500 font-medium uppercase tracking-tight">Standard generation requires 25 Credits. Ultra Pro requires 50 Credits per render.</p>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-500 tracking-widest flex items-center gap-2"><BarChart3 size={10}/> Shared Ecosystem</p>
                    <p className="text-sm text-slate-500 dark:text-gray-500 font-medium uppercase tracking-tight">Your credits are unified across Skyverses. Use them for Video, Image, or Voice.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black border-t border-slate-100 dark:border-white/5 transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-slate-900 dark:text-indigo-600 leading-none tracking-tighter select-none italic">
          VIDEO VIDEO VIDEO VIDEO
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white transition-colors">Turn Ideas <br /> Into <span className="text-indigo-600 dark:text-indigo-500">Videos.</span></h2>
           <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-indigo-600 text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(79,70,229,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Start Creating Videos <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • 1080p Native</p>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-black transition-colors duration-500">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black uppercase">AI VIDEO GENERATOR</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">
                Industrial-grade video synthesis for creative studios. Powered by Skyverses neural network.
              </p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Support Hub</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Registry</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

const Check = ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;

export default AIVideoGenerator;
