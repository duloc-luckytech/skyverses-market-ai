
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Download, Share2, Loader2, Play, 
  Video, Image as ImageIcon, ChevronDown, Sparkles
} from 'lucide-react';
import { generateDemoVideo, generateDemoImage } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

const MediaGeneratorWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang, t } = useLanguage();
  
  // Lite States
  const [modality, setModality] = useState<'Video' | 'Image'>('Video');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ url: string; type: 'video' | 'image' } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      if (modality === 'Video') {
        const url = await generateDemoVideo({ prompt, isUltra: false });
        if (url) setResult({ url, type: 'video' });
      } else {
        const url = await generateDemoImage(prompt);
        if (url) setResult({ url, type: 'image' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] dark:bg-[#030304] overflow-hidden text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#08080a] border-b border-gray-200 dark:border-white/10 px-8 py-6 flex justify-between items-center shrink-0 z-50">
        <div className="flex flex-col">
          <h2 className="font-black text-2xl tracking-tight uppercase italic">AI Media Generator</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lite Edition // Fast Synthesis</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-[800px] mx-auto p-8 space-y-12">
          
          {/* Top Preview/Title Section */}
          <div className="text-center space-y-4">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Fast Media Synthesis</h1>
             <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">Quickly generate video and image assets with direct semantic commands.</p>
          </div>

          {/* Main Controls Card */}
          <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
             <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl p-8 text-sm font-bold text-gray-700 dark:text-gray-300 min-h-[200px] focus:ring-2 focus:ring-brand-blue outline-none transition-all leading-relaxed"
                  placeholder="Describe your creative vision..."
                />
             </div>

             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setModality(modality === 'Video' ? 'Image' : 'Video')}
                     className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold transition-all hover:border-brand-blue"
                   >
                     {modality === 'Video' ? <Video size={14} /> : <ImageIcon size={14} />}
                     <span>{modality} Mode</span>
                   </button>
                </div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Standard Tier</div>
             </div>

             <button 
               onClick={handleGenerate}
               disabled={isGenerating || !prompt.trim()}
               className="w-full bg-slate-900 dark:bg-white dark:text-black text-white py-5 rounded-2xl text-base font-black uppercase tracking-[0.2em] shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-4"
             >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={18} />}
                Generate {modality}
             </button>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-2xl"
          >
            <button onClick={() => setResult(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-2">
              <X size={32}/>
            </button>
            <div className="max-w-5xl w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_150px_rgba(0,144,255,0.3)] border border-white/10">
               {result.type === 'video' ? (
                 <video src={result.url} controls autoPlay className="w-full h-full" />
               ) : (
                 <img src={result.url} className="w-full h-full object-contain" />
               )}
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <a href={result.url} download className="bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl">
                <Download size={20}/> Download Asset
              </a>
              <button className="bg-white/10 text-white border border-white/20 px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all">
                <Share2 size={20}/> Share Creative
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MediaGeneratorWorkspace;
