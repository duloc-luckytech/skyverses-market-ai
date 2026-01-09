
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { generateDemoImage } from '../../services/gemini';
import { 
  ChevronLeft, Sparkles, Download, Loader2, Wand2, 
  Share2, Check, Info, Palette, RefreshCw, Layers
} from 'lucide-react';

const Product2Image = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'lumina-creative-suite');
  
  const [activeImage, setActiveImage] = useState(solution?.imageUrl || '');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Soft');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState<string[]>(solution?.gallery || []);

  const styles = [
    { name: 'Cinematic', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400', prompt: 'cinematic lighting, soft focus' },
    { name: 'Abstract', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=400', prompt: 'abstract art, pastel palette' },
    { name: '3D Render', img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400', prompt: 'unreal engine 5, 3d render' },
    { name: 'Minimal', img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=400', prompt: 'minimal line art' }
  ];

  if (!solution) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const stylePrompt = styles.find(s => s.name === selectedStyle)?.prompt || '';
      const finalPrompt = `Lumina Aesthetic: ${prompt}. ${stylePrompt}. High quality.`;
      const result = await generateDemoImage(finalPrompt);
      if (result) {
        setActiveImage(result);
        setHistory(prev => [result, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error("Lumina Synthesis Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-black text-white font-sans overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 w-full flex-grow flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center py-6">
          <Link to="/market" className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> REPO
          </Link>
          <div className="flex items-center gap-4">
             <span className="text-[9px] font-black uppercase text-brand-blue tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></div> Lumina_v1
             </span>
             <button onClick={() => { navigator.clipboard.writeText(window.location.href); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="text-gray-500">
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
             </button>
          </div>
        </div>

        {/* Prompt Bar - Central & High Visibility */}
        <div className="w-full mb-8">
           <form onSubmit={handleGenerate} className="relative group">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-2xl group-focus-within:border-brand-blue/30 transition-all"></div>
              <div className="relative flex items-center px-4 py-3 lg:px-8 lg:py-5 gap-3 lg:gap-6">
                 <Wand2 className="w-5 h-5 text-brand-blue opacity-50 shrink-0" />
                 <input 
                   type="text"
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="Imagine..."
                   className="flex-grow bg-transparent border-none focus:outline-none text-base lg:text-lg font-medium"
                 />
                 <button type="submit" disabled={isGenerating || !prompt.trim()} className="bg-white text-black px-5 py-2 lg:px-8 lg:py-3 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-10 transition-all">
                   {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
                 </button>
              </div>
           </form>
        </div>

        {/* Image Display */}
        <div className="flex-grow flex items-center justify-center py-4">
           <div className="relative w-full max-w-2xl group aspect-[4/5] sm:aspect-video bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <img src={activeImage} className={`w-full h-full object-cover transition-all duration-[2s] ${isGenerating ? 'opacity-20 scale-110 blur-3xl' : 'opacity-100'}`} />
              
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <Sparkles className="w-10 h-10 text-brand-blue animate-pulse mb-2" />
                   <p className="text-[10px] uppercase tracking-widest opacity-50">Creating...</p>
                </div>
              )}

              <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-3 bg-black/80 backdrop-blur-md rounded-full"><RefreshCw className="w-4 h-4" /></button>
                 <a href={activeImage} download className="p-3 bg-white text-black rounded-full"><Download className="w-4 h-4" /></a>
              </div>
           </div>
        </div>

        {/* Styles Slider */}
        <div className="py-8 space-y-6">
           <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Styles</span>
              <div className="flex-grow h-px bg-white/5"></div>
           </div>
           <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {styles.map((style) => (
                 <button key={style.name} onClick={() => setSelectedStyle(style.name)} className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border transition-all ${selectedStyle === style.name ? 'border-brand-blue scale-105 shadow-lg' : 'border-white/5 opacity-40'}`}>
                    <img src={style.img} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <span className="text-[8px] font-black uppercase text-white tracking-tighter">{style.name}</span>
                    </div>
                 </button>
              ))}
           </div>
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default Product2Image;
