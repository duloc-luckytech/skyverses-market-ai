import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Download, Share2, Loader2, Play, 
  Film, Newspaper, Globe, Music, Volume2, 
  ChevronDown, HelpCircle, CheckCircle2, 
  Plus, Upload, Search, RefreshCw, Sparkles,
  MoreVertical, Info, AlertTriangle, MonitorPlay
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

// Move components outside to avoid re-creation on every render and fix TS children errors
// Added React.FC to ensure children are correctly handled by TypeScript
const Toggle: React.FC<{ active: boolean, onChange: () => void }> = ({ active, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${active ? 'left-5.5' : 'left-0.5'}`} />
  </button>
);

// Explicitly typed as React.FC to resolve "children is missing" errors in JSX usage
// Each fix below addresses the error where JSX children were not correctly identified as the 'children' prop.
const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const ArticleToVideoWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  
  // States
  const [url, setUrl] = useState('');
  const [mediaType, setMediaType] = useState('Scraped + Stock');
  const [contentHandling, setContentHandling] = useState('Summarize');
  const [duration, setDuration] = useState(30);
  const [instructions, setInstructions] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [onlyProvidedMedia, setOnlyProvidedMedia] = useState(false);
  const [smartCrop, setSmartCrop] = useState(false);
  const [imagesToVideos, setImagesToVideos] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState('All');
  const [voice, setVoice] = useState('Brian - Deep, Resonant and Comforting');
  const [music, setMusic] = useState('Observer');

  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!url.trim() && !instructions.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Article to Video. URL: ${url}. Handling: ${contentHandling}. Duration: ${duration}s. Instructions: ${instructions}. Voice: ${voice}. Music: ${music}.`;
      const video = await generateDemoVideo({ prompt, isUltra: true });
      if (video) setResultVideo(video);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] dark:bg-[#030304] overflow-hidden text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Header Overlay */}
      <div className="bg-white dark:bg-[#08080a] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Newspaper size={18} />
          </div>
          <h2 className="font-bold text-lg">{t('av.title')}</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pb-20">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          
          {/* Section 1: Intro */}
          <Card>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 size={18} />
              <h3 className="font-bold">{t('av.title')}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('av.desc')}
            </p>
          </Card>

          {/* Section 2: URL Input */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('av.url_label')}</h3>
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{t('av.url_link')}</button>
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.skyverses.com/#how-it-works"
                className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
              />
              <div className="absolute left-3 -top-2 bg-[#F9FAFB] dark:bg-[#0a0a0c] px-1">
                 <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">💡 {t('av.url_hint')}</span>
              </div>
            </div>
          </Card>

          {/* Section 3: Customize Options */}
          <Card className="space-y-8">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 border-b border-gray-100 dark:border-white/5 pb-4">{t('av.customize')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t('av.media_type')}</label>
                   <HelpCircle size={14} className="text-gray-400" />
                </div>
                <div className="relative">
                  <select 
                    value={mediaType} 
                    onChange={e => setMediaType(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Scraped + Stock</option>
                    <option>AI Generated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600">{t('av.media_desc')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t('av.handle_content')}</label>
                <div className="relative">
                  <select 
                    value={contentHandling} 
                    onChange={e => setContentHandling(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Summarize</option>
                    <option>Keep as is</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600">{t('av.handle_desc')}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t('av.duration')}</label>
                 <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-3 py-1 rounded text-xs font-bold">{duration}s</div>
              </div>
              <div className="space-y-2">
                <input 
                  type="range" min="10" max="600" value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                   <span>10s</span>
                   <span>10m</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600">~{Math.round(duration * 2.3)} words</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t('av.instructions')}</label>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="explain this article like I'm a child..."
                className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-600">{t('av.instructions_desc')}</p>
            </div>
          </Card>

          {/* Section 4: Import Media */}
          <Card className="space-y-6">
            <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('av.import_media')}</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                placeholder="https://www.revid.ai"
                className="flex-grow bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button className="bg-slate-900 dark:bg-white dark:text-black text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors whitespace-nowrap">
                {t('av.get_media_btn')}
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl p-10 text-center flex flex-col items-center gap-3 bg-gray-50/50 dark:bg-black/20 transition-all hover:border-blue-500/30">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                <Upload size={24} />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                {t('av.dropzone')}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('av.toggle_only_provided')}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-600 max-w-md">{t('av.toggle_only_provided_desc')}</p>
                </div>
                <Toggle active={onlyProvidedMedia} onChange={() => setOnlyProvidedMedia(!onlyProvidedMedia)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('av.toggle_crop')}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-600 max-w-md">{t('av.toggle_crop_desc')}</p>
                </div>
                <Toggle active={smartCrop} onChange={() => setSmartCrop(!smartCrop)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('av.toggle_vid')}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-600 max-w-md">{t('av.toggle_vid_desc')}</p>
                </div>
                <Toggle active={imagesToVideos} onChange={() => setImagesToVideos(!imagesToVideos)} />
              </div>
            </div>

            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                 <button className="text-xs font-bold flex items-center gap-1 text-slate-600 dark:text-slate-400">See media library <ChevronDown size={14}/></button>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                 <span className="text-sm font-bold text-slate-500">{t('av.library')}</span>
                 <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                    {['All', 'Videos', 'Images', 'Audio'].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveMediaTab(tab)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeMediaTab === tab ? 'bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white' : 'text-gray-500'}`}
                      >
                        {tab}
                      </button>
                    ))}
                 </div>
                 <button className="ml-auto text-[10px] font-bold flex items-center gap-1 text-gray-400 hover:text-slate-600 dark:hover:text-slate-200"><RefreshCw size={12}/> refresh</button>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700" size={14} />
                   <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-48" />
                 </div>
              </div>
            </div>
          </Card>

          {/* Section 5: Audio & Advanced */}
          <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
             <div className="p-5 border-b border-gray-50 dark:border-white/5 flex items-center justify-between gap-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 shrink-0">{t('av.voice')}</h3>
                <div className="flex items-center gap-3 border border-gray-200 dark:border-white/10 rounded-lg p-2 flex-grow max-w-sm bg-white dark:bg-black">
                   <button className="p-1 text-slate-900 dark:text-white"><Play size={14} fill="currentColor"/></button>
                   <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-yellow-400 via-emerald-400 to-indigo-500 shadow-sm" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex-grow truncate">{voice}</span>
                   <ChevronDown size={14} className="text-gray-400 shrink-0" />
                </div>
             </div>
             <div className="p-5 border-b border-gray-50 dark:border-white/5 flex items-center justify-between gap-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 shrink-0">{t('av.music')}</h3>
                <div className="flex items-center gap-3 border border-gray-200 dark:border-white/10 rounded-lg p-2 flex-grow max-w-sm bg-white dark:bg-black">
                   <button className="p-1 text-slate-900 dark:text-white"><Play size={14} fill="currentColor"/></button>
                   <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-sm" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex-grow truncate">{music}</span>
                   <ChevronDown size={14} className="text-gray-400 shrink-0" />
                </div>
             </div>
             <div className="p-5 flex items-center justify-between text-slate-400 dark:text-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <h3 className="font-bold">{t('av.advanced')}</h3>
                <ChevronDown size={16} />
             </div>
          </div>

          {/* Action Footer */}
          <div className="space-y-4 pt-4">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-slate-900 dark:bg-white dark:text-black text-white py-5 rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-[1.005] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {t('av.generate_btn')}
            </button>
            <div className="flex justify-end">
               <span className="text-[11px] text-gray-400 dark:text-gray-600 font-bold flex items-center gap-1">
                 {t('av.cost_est')} <AlertTriangle size={12} className="text-yellow-500" /> {t('av.cost_not_avail')}
               </span>
            </div>
          </div>

        </div>
      </div>

      {/* Video Preview Overlay */}
      <AnimatePresence>
        {resultVideo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <button onClick={() => setResultVideo(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32}/>
            </button>
            <div className="max-w-4xl w-full aspect-video bg-black rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10">
              <video src={resultVideo} controls autoPlay className="w-full h-full" />
            </div>
            <div className="mt-12 flex gap-4">
              <a href={resultVideo} download className="bg-white text-black px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                <Download size={20}/> Download MP4
              </a>
              <button className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all">
                <Share2 size={20}/> Share Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.2);
          margin-top: -8px;
          border: 2px solid white;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #e5e7eb;
          border-radius: 2px;
        }
        .dark input[type=range]::-webkit-slider-runnable-track {
          background: #1f1f23;
        }
      `}</style>
    </div>
  );
};

export default ArticleToVideoWorkspace;
