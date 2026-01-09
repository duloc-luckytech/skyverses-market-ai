
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, ArrowRight, ShieldCheck, 
  RefreshCw, User, Globe, Palette, 
  Zap, Dna, Box, Fingerprint, Maximize2, Layers,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoImage } from '../../services/gemini';
import NexusStudioWorkspace from '../../components/nexus-studio/NexusStudioWorkspace';

const Product5Image = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'nexus-ideation-engine');
  const { lang } = useLanguage();
  
  const [isStudioActive, setIsStudioActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImage, setActiveImage] = useState(solution?.imageUrl || '');
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderImages = [
    solution?.imageUrl || '',
    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  if (!solution) return null;

  const handleQuickSynth = async () => {
    setIsGenerating(true);
    const res = await generateDemoImage("Masterpiece composition, cinematic character in a breathtaking landscape, high fidelity, 8k.");
    if (res) setActiveImage(res);
    setIsGenerating(false);
  };

  const content: Record<string, any> = {
    slogan: { 
      en: 'Compose characters, scenes, and styles into one image', 
      vi: 'Hợp nhất nhân vật, bối cảnh và thẩm mỹ vào một khung hình duy nhất',
    },
    step1: { en: 'Character DNA', vi: 'Định danh nhân vật' },
    step2: { en: 'Spatial Scene', vi: 'Bối cảnh không gian' },
    step3: { en: 'Studio Style', vi: 'Thẩm mỹ Studio' }
  };

  const c = (key: string) => content[key]?.[lang] || content[key]?.['en'] || key;
  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";

  if (isStudioActive) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <NexusStudioWorkspace onClose={() => setIsStudioActive(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#030304] min-h-screen text-black dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500 pb-32">
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-16 mb-40 min-h-[70vh]">
          <div className="space-y-10 lg:w-1/2 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-8">
              <Link to="/" className="inline-flex items-center gap-3 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-all group">
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Home</span>
              </Link>
              
              <div className="space-y-4">
                <img src={logoUrl} alt="Skyverses" className="w-12 h-12 object-contain opacity-80" />
                <h1 className="text-7xl lg:text-[110px] font-black uppercase tracking-tighter leading-[0.8] italic">
                  Image <br /> <span className="text-brand-blue">Composer.</span>
                </h1>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-2xl lg:text-3xl font-medium max-w-xl leading-tight border-l-4 border-brand-blue pl-8">
                “{c('slogan')}”
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <button onClick={() => setIsStudioActive(true)} className="bg-brand-blue text-white px-12 py-6 text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 rounded-sm">
                  Mở Studio <Play size={16} fill="currentColor" />
               </button>
               <button className="px-10 py-6 border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all rounded-sm">
                  Tư liệu kỹ thuật
               </button>
            </div>
          </div>

          {/* HERO IMAGE SLIDER */}
          <div className="lg:w-1/2 w-full relative animate-in fade-in slide-in-from-right-8 duration-1000">
             <div className="aspect-[4/5] lg:aspect-square bg-gray-100 dark:bg-[#08080a] border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl rounded-sm group relative">
                <div className="absolute inset-0 z-0">
                  {sliderImages.map((img, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-all duration-[2500ms] ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-md'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${index}`} />
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-brand-blue tracking-widest">Skyverses Synthesis</p>
                         <h3 className="text-2xl font-black uppercase text-white italic tracking-tighter">Unified Composition</h3>
                      </div>
                      <button onClick={handleQuickSynth} disabled={isGenerating} className="p-4 bg-brand-blue text-white rounded-full shadow-2xl hover:rotate-180 transition-all duration-1000">
                         <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} />
                      </button>
                   </div>
                </div>

                <div className="absolute top-8 left-8 flex gap-2 z-20">
                  {sliderImages.map((_, i) => (
                    <div key={i} className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-10 bg-brand-blue' : 'w-2 bg-white/30'}`} />
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* LOGIC PROCESS SECTION */}
        <section className="mb-40 py-32 border-y border-black/5 dark:border-white/5 relative">
           <div className="max-w-5xl mx-auto text-center space-y-24">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter italic">Quy trình vận hành</h2>
                 <p className="text-gray-400 uppercase text-[11px] font-black tracking-[1em]">Logic → Composition → Output</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
                 {[
                   { icon: <User />, label: c('step1'), desc: 'Khóa DNA thực thể từ ảnh tham chiếu, đảm bảo sự nhất quán tuyệt đối.' },
                   { icon: <Globe />, label: c('step2'), desc: 'Kiến tạo môi trường, ánh sáng và bối cảnh không gian chuẩn điện ảnh.' },
                   { icon: <Palette />, label: c('step3'), desc: 'Tiêm phong cách thẩm mỹ và bộ lọc ánh sáng Studio vào khung hình cuối.' }
                 ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-8 group">
                       <div className="w-24 h-24 rounded-[2rem] bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue transition-all duration-500 group-hover:bg-brand-blue group-hover:text-white group-hover:scale-110 shadow-xl">
                          {React.cloneElement(item.icon as React.ReactElement<any>, { size: 36 })}
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-2xl font-black uppercase italic tracking-tight">{item.label}</h4>
                          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[240px] mx-auto">"{item.desc}"</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CORE FEATURES GRID */}
        <section className="mb-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
           {[
             { title: 'Nhất quán DNA', icon: <Fingerprint />, desc: 'Đối tượng luôn đồng nhất qua mọi khung hình nhờ công nghệ DNA Locking.' },
             { title: 'Bố cục Điện ảnh', icon: <Box />, desc: 'Tự động tối ưu hóa góc máy và vị trí theo ngôn ngữ hình ảnh chuyên nghiệp.' },
             { title: 'Độ phân giải 8K', icon: <Maximize2 />, desc: 'Độ phân giải cực cao, sẵn sàng cho in ấn khổ lớn và trình chiếu chuyên nghiệp.' },
             { title: 'Tốc độ Agency', icon: <Zap />, desc: 'Rút ngắn 80% thời gian tạo concept. Biến ý tưởng thành visual cuối trong tích tắc.' },
             { title: 'Bảo mật tuyệt đối', icon: <ShieldCheck />, desc: 'Dữ liệu thương hiệu được bảo vệ nghiêm ngặt trong môi trường riêng biệt.' },
             { title: 'Kiểm soát Đa tầng', icon: <Layers />, desc: 'Khả năng can thiệp sâu vào từng lớp cấu trúc của hình ảnh một cách độc lập.' }
           ].map(f => (
             <div key={f.title} className="p-16 bg-white dark:bg-black space-y-6 group hover:bg-brand-blue/[0.01] transition-all duration-700">
                <div className="w-12 h-12 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                   {React.cloneElement(f.icon as React.ReactElement<any>, { size: 20 })}
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.title}</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed opacity-70 uppercase tracking-widest leading-loose">"{f.desc}"</p>
             </div>
           ))}
        </section>

        {/* CONVERSION CTA */}
        <section className="py-40 text-center space-y-16 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/[0.03] rounded-full blur-[180px] pointer-events-none"></div>
           
           <div className="space-y-6 relative z-10">
              <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic">
                Ready to <br /> <span className="text-brand-blue">Compose?</span>
              </h2>
              <p className="text-gray-400 uppercase text-[14px] font-black tracking-[1.2em] italic">Orchestrate the visual frontier.</p>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12 relative z-10">
              <Link to="/booking" className="bg-brand-blue text-white px-20 py-8 text-sm font-black uppercase tracking-[0.5em] shadow-2xl hover:scale-105 active:scale-95 transition-all rounded-sm">
                 Bắt đầu ngay
              </Link>
              <button onClick={() => setIsStudioActive(true)} className="px-16 py-8 border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-sm font-black uppercase tracking-[0.5em] transition-all bg-white dark:bg-black rounded-sm shadow-xl">
                 Vào Lab thử nghiệm
              </button>
           </div>
        </section>

      </div>
    </div>
  );
};

export default Product5Image;
