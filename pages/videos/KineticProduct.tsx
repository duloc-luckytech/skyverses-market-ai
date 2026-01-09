
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Film, Sparkles, Move, Camera, 
  Settings2, Sliders, Activity, Download,
  Fingerprint, ShieldCheck, ArrowRight, Box,
  Crown, FastForward, Repeat, Layers,
  Palette
} from 'lucide-react';
import KineticWorkspace from '../../components/KineticWorkspace';

const KineticProduct = () => {
  const solution = SOLUTIONS.find(s => s.id === 'KINETIC-CORE-I2V');
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderImages = [
    solution?.imageUrl || '',
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1635236066249-724441e62102?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] animate-in fade-in duration-500">
        <KineticWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  const features = [
    { title: { en: 'First & Last Frame', vi: 'Khung đầu & cuối', ko: '시작 및 끝 프레임', ja: '最初と最後のフレーム' }, icon: <Repeat />, desc: { en: 'Lock 2 points to interpolate logical motion.', vi: 'Khóa 2 điểm để AI tự bù đắp chuyển động logic.', ko: '논리적인 동작을 보간하기 위해 2개 지점을 고정합니다.', ja: '論理的な動きを補完するために2点をロックします。' } },
    { title: { en: 'Temporal Extension', vi: 'Mở rộng thời gian', ko: '시간적 확장', ja: '時間的延長' }, icon: <FastForward />, desc: { en: 'Extend videos by +7s seamlessly.', vi: 'Mở rộng video thêm +7s mượt mà.', ko: '끊김 없이 영상을 7초 연장합니다.', ja: 'ビデオをシームレスに7秒延長します。' } },
    { title: { en: 'Style Reference', vi: 'Tham chiếu phong cách', ko: '스타일 참조', ja: 'スタイル参照' }, icon: <Palette />, desc: { en: 'Inject aesthetics from reference images.', vi: 'Tiêm thẩm mỹ từ ảnh tham chiếu.', ko: '참조 이미지의 미학을 주입합니다.', ja: '参照画像から美学を注入します。' } },
    { title: { en: 'Virtual Gimbal', vi: 'Gimbal ảo', ko: '가상 짐벌', ja: 'バーチャルジンバル' }, icon: <Camera />, desc: { en: 'Precise virtual camera trajectory control.', vi: 'Điều khiển quỹ đạo máy quay ảo chính xác.', ko: '정밀한 가상 카메라 궤적 제어.', ja: '精密な仮想カメラ軌道制御。' } },
    { title: { en: 'DNA Stabilization', vi: 'Ổn định DNA', ko: 'DNA 안정화', ja: 'DNA安定化' }, icon: <Fingerprint />, desc: { en: 'Lock pixels to prevent warping.', vi: 'Khóa pixel để ngăn chặn biến dạng.', ko: '왜곡을 방지하기 위해 픽셀을 고정합니다.', ja: 'ゆがみを防ぐためにピクセルをロックします。' } },
    { title: { en: '8K Master Output', vi: 'Kết xuất 8K Master', ko: '8K 마스터 출력', ja: '8Kマスター出力' }, icon: <Sparkles />, desc: { en: 'Highest quality for cinema & print.', vi: 'Chất lượng cao nhất cho rạp phim & in ấn.', ko: '영화 및 인쇄를 위한 최고 품질.', ja: 'シネマおよび印刷向けの最高品質。' } }
  ];

  return (
    <div className="pt-24 bg-white dark:bg-black min-h-screen text-black dark:text-white font-sans overflow-x-hidden selection:bg-yellow-500/30 pb-32 transition-colors duration-500">
      
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#eab30808_0%,_transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#eab30810_0%,_transparent_40%)]"></div>
         <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        <section className="min-h-[85vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-yellow-500 transition-all group rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-md">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('kinetic.back')}</span>
                </Link>

                <div className="space-y-6">
                   <h1 className="text-7xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Kinetic <br /> <span className="text-yellow-500">Core.</span>
                   </h1>
                </div>
                
                <p className="text-2xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-yellow-500 pl-10 max-w-2xl italic">
                  “{t('kinetic.slogan')}”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-yellow-500 text-black px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(234,179,8,0.2)] dark:shadow-[0_20px_80px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {t('kinetic.launch')} <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-yellow-600 dark:text-yellow-500/60 tracking-widest italic">VEO 3.1 NATIVE</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">1080p Master Class</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-sm group">
                  {sliderImages.map((img, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-sm'}`}
                    >
                      <img src={img} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="Kinetic Absolute" />
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 space-y-2">
                     <p className="text-[10px] font-black uppercase text-yellow-600 dark:text-yellow-500 tracking-[0.5em]">Liquid_Motion_v4.2</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Deterministic Control.</h3>
                  </div>
                  
                  {/* Indicators */}
                  <div className="absolute top-10 right-10 flex gap-2">
                    {sliderImages.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-8 bg-yellow-500' : 'w-2 bg-black/20 dark:bg-white/20'}`} 
                      />
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t border-black/5 dark:border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
              {features.map((f, i) => (
                <div key={i} className="p-16 bg-white dark:bg-[#08080a] space-y-8 group hover:bg-yellow-500/[0.01] transition-all duration-500 border-r border-black/5 dark:border-white/5 last:border-r-0">
                   <div className="w-14 h-14 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 group-hover:border-yellow-600 dark:group-hover:border-yellow-500 transition-all rounded-sm shadow-xl">
                      {/* Fix: cast f.icon to React.ReactElement<any> to allow the size prop */}
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.title[lang as keyof typeof f.title] || f.title.en}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.desc[lang as keyof typeof f.desc] || f.desc.en}"</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <section className="py-60 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-yellow-500/[0.03] rounded-full blur-[200px] pointer-events-none"></div>
           <div className="max-w-4xl mx-auto space-y-12 relative z-10">
              <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-black dark:text-white">
                {t('kinetic.features.title')}
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-yellow-500 text-black px-24 py-8 text-xs font-black uppercase tracking-[0.6em] shadow-[0_20px_60px_rgba(234,179,8,0.2)] dark:shadow-[0_20px_60px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-all rounded-sm italic">
                    {t('kinetic.launch')}
                 </button>
                 <Link to="/booking" className="px-24 py-8 border-2 border-yellow-500 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500 hover:text-black text-xs font-black uppercase tracking-[0.6em] transition-all rounded-sm italic">
                    {t('kinetic.consult')}
                 </Link>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default KineticProduct;
