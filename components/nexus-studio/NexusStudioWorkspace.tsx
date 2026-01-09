
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Palette, Sparkles, RefreshCw, 
  History as HistoryIcon, Download, X, Check, Trash2, Zap, Share2, Wand2,
  Plus, Scan, Upload, Loader2
} from 'lucide-react';
import { SUBJECTS as INITIAL_SUBJECTS, SCENES as INITIAL_SCENES, STYLES, Subject, Scene, Style } from './mock-data';
import { generateDemoImage } from '../../services/gemini';
import { useLanguage } from '../../context/LanguageContext';

interface GenerationRecord {
  id: string;
  img: string;
  subject: string;
  scene: string;
  style: string;
  timestamp: string;
}

const NexusStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  
  const [subjectsList, setSubjectsList] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [scenesList, setScenesList] = useState<Scene[]>(INITIAL_SCENES);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [sceneText, setSceneText] = useState('');
  const [strength, setStrength] = useState(85);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [statusMsg, setStatusMsg] = useState('READY');

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const sceneInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = subject && scene && style;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'SUBJECT' | 'SCENE') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'SUBJECT') {
          const newSubject: Subject = { id: `u-s-${Date.now()}`, name: 'Character DNA', img: base64 };
          setSubjectsList(prev => [newSubject, ...prev]);
          setSubject(newSubject);
          setStatusMsg('IDENTITY LOCKED');
        } else {
          const newScene: Scene = { id: `u-sc-${Date.now()}`, name: 'Custom Scene', img: base64 };
          setScenesList(prev => [newScene, ...prev]);
          setScene(newScene);
          setStatusMsg('SCENE MAPPED');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMagic = async () => {
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    setStatusMsg('COMPOSING...');

    try {
      const referralImages: string[] = [];
      if (subject?.id.startsWith('u-s-')) referralImages.push(subject.img);
      if (scene?.id.startsWith('u-sc-')) referralImages.push(scene.img);

      const directive = `Character: ${subject?.name}. Scene: ${scene?.name}, ${sceneText}. Style: ${style?.name}. High quality composition.`;
      const imageUrl = await generateDemoImage(directive, referralImages);

      if (imageUrl) {
        const newRecord: GenerationRecord = {
          id: Date.now().toString(),
          img: imageUrl,
          subject: subject?.name || '',
          scene: scene?.name || '',
          style: style?.name || '',
          timestamp: new Date().toLocaleTimeString()
        };
        setResult(imageUrl);
        setHistory(prev => [newRecord, ...prev].slice(0, 10));
        setStatusMsg('OPERATIONAL');
      }
    } catch (err) {
      setStatusMsg('SYSTEM_ERROR');
    } finally {
      setIsGenerating(false);
    }
  };

  const labels: Record<string, any> = {
    identity: { en: 'Character', vi: 'Nhân vật' },
    world: { en: 'Scene', vi: 'Bối cảnh' },
    aesthetic: { en: 'Style', vi: 'Thẩm mỹ' },
    slogan: { en: 'Compose characters, scenes, and styles into one image', vi: 'Hợp nhất nhân vật, bối cảnh và thẩm mỹ vào một khung hình duy nhất' }
  };

  const l = (key: string) => labels[key]?.[lang] || labels[key]?.['en'] || key;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050505] text-black dark:text-white font-sans overflow-hidden relative">
      
      {/* 1. CONTROLS SIDEBAR */}
      <aside className="w-full lg:w-[400px] h-full flex flex-col border-r border-black/5 dark:border-white/5 bg-[#fcfcfd] dark:bg-[#080808] z-[60] overflow-y-auto no-scrollbar shadow-xl">
        <div className="p-8 lg:p-10 space-y-12 pb-40">
          
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <User size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest">{l('identity')}</h3>
              </div>
              <button onClick={() => subjectInputRef.current?.click()} className="p-2 text-gray-400 hover:text-brand-blue transition-all">
                <Upload size={14} />
              </button>
              <input type="file" ref={subjectInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'SUBJECT')} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {subjectsList.map((s) => (
                <button key={s.id} onClick={() => setSubject(s)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${subject?.id === s.id ? 'border-brand-blue' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={s.img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <MapPin size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest">{l('world')}</h3>
              </div>
              <button onClick={() => sceneInputRef.current?.click()} className="p-2 text-gray-400 hover:text-brand-blue transition-all">
                <Upload size={14} />
              </button>
              <input type="file" ref={sceneInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'SCENE')} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {scenesList.map((sc) => (
                <button key={sc.id} onClick={() => setScene(sc)} className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${scene?.id === sc.id ? 'border-brand-blue' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                  <img src={sc.img} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[7px] font-black uppercase text-white tracking-widest text-center px-1">{sc.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <input 
              type="text" value={sceneText} onChange={(e) => setSceneText(e.target.value)}
              placeholder="Refinement directive (rain, sunset, etc)"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-brand-blue"
            />
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Palette size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">{l('aesthetic')}</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {STYLES.map((st) => (
                <button key={st.id} onClick={() => setStyle(st)} className={`shrink-0 w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all ${style?.id === st.id ? 'border-brand-blue' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                  <img src={st.img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="space-y-2 px-1">
               <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                  <span>Intensity</span>
                  <span className="text-brand-blue">{strength}%</span>
               </div>
               <input type="range" min="0" max="100" value={strength} onChange={(e) => setStrength(parseInt(e.target.value))} className="w-full h-1 bg-black/10 dark:bg-white/10 appearance-none rounded-full accent-brand-blue" />
            </div>
          </section>
        </div>
      </aside>

      {/* 2. VIEWPORT */}
      <main className="flex-grow flex flex-col bg-gray-50 dark:bg-[#020202] relative overflow-hidden">
        <div className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue mono">IMAGE COMPOSER</span>
            <div className="h-4 w-px bg-black/10 dark:border-white/10"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mono italic">{statusMsg}</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-brand-blue transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow flex items-center justify-center p-8 relative">
          <AnimatePresence mode="wait">
            {!result && !isGenerating ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 opacity-20">
                <Sparkles size={48} className="mx-auto text-brand-blue" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">{l('slogan')}</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                <RefreshCw className="w-12 h-12 text-brand-blue animate-spin" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">Synthesizing...</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-4xl w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <img src={result!} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 space-y-1">
                  <p className="text-[9px] font-black uppercase text-brand-blue tracking-widest">Unified Composition</p>
                  <p className="text-[7px] text-white/50 uppercase font-bold tracking-[0.3em]">{subject?.name} · {scene?.name} · {style?.name}</p>
                </div>
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <a href={result!} download className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all"><Download size={18} /></a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM BAR */}
        <div className="h-32 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#080808] p-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-8">
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <HistoryIcon size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
                </div>
                <div className="flex gap-2">
                   {history.map(h => (
                     <button key={h.id} onClick={() => setResult(h.img)} className={`w-12 h-12 rounded-md overflow-hidden border transition-all ${result === h.img ? 'border-brand-blue' : 'border-white/10 opacity-40 hover:opacity-100'}`}>
                        <img src={h.img} className="w-full h-full object-cover" alt="" />
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <button 
            onClick={handleCreateMagic}
            disabled={!canGenerate || isGenerating}
            className={`h-20 px-16 lg:px-24 flex items-center justify-center gap-4 transition-all rounded-sm shadow-2xl ${canGenerate ? 'bg-brand-blue text-white hover:scale-105' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">{isGenerating ? 'Synthesizing' : 'Compose'}</span>
          </button>
        </div>
      </main>

    </div>
  );
};

export default NexusStudioWorkspace;
