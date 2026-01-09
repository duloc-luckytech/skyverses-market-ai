
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Download, RefreshCw, Zap, Share2, 
  Loader2, Play, Film, CheckCircle2,
  Plus, Users, MapPin, Move, Camera, Clapperboard, Upload,
  History as HistoryIcon, Maximize2
} from 'lucide-react';
import { generateDemoImage, generateDemoVideo } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

interface Actor {
  id: string;
  name: string;
  img: string;
  role: 'Lead' | 'Support' | 'Background';
  presence: number;
  isUserUploaded?: boolean;
}

interface Location {
  id: string;
  name: string;
  img: string;
  isUserUploaded?: boolean;
}

const INITIAL_CAST: Actor[] = [
  { id: 'act1', name: 'The Ronin', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400', role: 'Lead', presence: 90 },
  { id: 'act2', name: 'The Pilot', img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400', role: 'Support', presence: 70 },
  { id: 'act3', name: 'The Geisha', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400', role: 'Lead', presence: 85 }
];

const LOCATIONS: Location[] = [
  { id: 'loc1', name: 'Rainy Rooftop', img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=400' },
  { id: 'loc2', name: 'Desert Ruins', img: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=400' },
  { id: 'loc3', name: 'Neon Alley', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=400' }
];

const BLOCKING = [
  { id: 'b1', name: 'Dialogue / Facing' },
  { id: 'b2', name: 'Encounter / Walking' },
  { id: 'b3', name: 'Tense Standoff' },
  { id: 'b4', name: 'Parallel Gaze' }
];

const CastAndDirectWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  
  const [cast, setCast] = useState<Actor[]>(INITIAL_CAST);
  const [selectedActors, setSelectedActors] = useState<string[]>([]);
  const [selectedLocId, setSelectedLocId] = useState<string>(LOCATIONS[0].id);
  const [selectedBlocking, setSelectedBlocking] = useState(BLOCKING[0]);
  
  const [isRehearsing, setIsRehearsing] = useState(false);
  const [isUnfolding, setIsUnfolding] = useState(false);
  const [resultStill, setResultStill] = useState<string | null>(null);
  const [resultScene, setResultScene] = useState<string | null>(null);
  const [status, setStatus] = useState('Awaiting Signal');
  
  const castInputRef = useRef<HTMLInputElement>(null);
  const locInputRef = useRef<HTMLInputElement>(null);

  const toggleActor = (id: string) => {
    if (selectedActors.includes(id)) {
      setSelectedActors(prev => prev.filter(aid => aid !== id));
    } else if (selectedActors.length < 2) {
      setSelectedActors(prev => [...prev, id]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ACTOR' | 'LOCATION') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'ACTOR') {
          const newActor: Actor = { id: `u-act-${Date.now()}`, name: 'External Talent', img: base64, role: 'Lead', presence: 80, isUserUploaded: true };
          setCast(prev => [newActor, ...prev]);
          setSelectedActors(prev => [...prev, newActor.id].slice(0, 2));
        } else {
          const newLoc: Location = { id: `u-loc-${Date.now()}`, name: 'External Set', img: base64, isUserUploaded: true };
          setSelectedLocId(newLoc.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStageScene = async () => {
    if (isRehearsing || selectedActors.length < 1) return;
    setIsRehearsing(true);
    setResultScene(null);
    setStatus('STAGING...');

    try {
      const activeActors = cast.filter(a => selectedActors.includes(a.id));
      const activeLoc = LOCATIONS.find(l => l.id === selectedLocId);
      const directive = `Directing a cinematic shot. Actors: ${activeActors.map(a => a.name).join(' and ')}. Staging: ${selectedBlocking.name}. Location: ${activeLoc?.name}. Masterpiece cinematography.`;
      
      const res = await generateDemoImage(directive);
      if (res) {
        setResultStill(res);
        setStatus('READY');
      }
    } catch (err) {
      setStatus('ERROR');
    } finally {
      setIsRehearsing(false);
    }
  };

  const handleUnfoldScene = async () => {
    if (!resultStill || isUnfolding) return;
    setIsUnfolding(true);
    setStatus('UNFOLDING...');

    try {
      const vid = await generateDemoVideo({
        prompt: `The scene unfolds. Suble head turns, breathing, and camera drift. ${selectedBlocking.name}.`,
        references: resultStill ? [resultStill] : undefined
      });
      if (vid) {
        setResultScene(vid);
        setStatus('DONE');
      }
    } catch (err) {
      setStatus('ERROR');
    } finally {
      setIsUnfolding(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050505] text-black dark:text-white font-sans overflow-hidden relative">
      
      {/* 1. SIDEBAR */}
      <aside className="w-full lg:w-[400px] shrink-0 h-full flex flex-col border-r border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#080808] z-[60] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="p-8 lg:p-10 space-y-12 pb-40">
          
          {/* CASTING */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <Users size={18} />
                </div>
                <h3 className="text-xs font-black tracking-widest uppercase italic">The Cast</h3>
              </div>
              <button onClick={() => castInputRef.current?.click()} className="p-2 border border-black/10 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all">
                <Plus size={14} />
              </button>
              <input type="file" ref={castInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ACTOR')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {cast.map((actor) => (
                <button 
                  key={actor.id} 
                  onClick={() => toggleActor(actor.id)}
                  className={`relative aspect-[3/4] rounded-sm overflow-hidden border-2 transition-all ${selectedActors.includes(actor.id) ? 'border-brand-blue scale-95' : 'border-transparent opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`}
                >
                  <img src={actor.img} className="w-full h-full object-cover" alt="" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1">
                    <span className="text-[7px] font-black uppercase text-white">{actor.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* STAGING */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <MapPin size={18} />
                </div>
                <h3 className="text-xs font-black tracking-widest uppercase italic">Staging</h3>
              </div>
              <button onClick={() => locInputRef.current?.click()} className="p-2 border border-black/10 dark:border-white/10 rounded-full hover:bg-emerald-500 hover:text-white transition-all">
                <Upload size={14} />
              </button>
              <input type="file" ref={locInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'LOCATION')} />
            </div>
          </section>
        </div>
      </aside>

      {/* 2. VIEWPORT */}
      <main className="flex-grow flex flex-col bg-gray-50 dark:bg-[#020202] relative overflow-hidden">
        <div className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue mono italic">CAST BUILDER STUDIO</span>
            <div className="h-4 w-px bg-black/10 dark:border-white/10"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mono animate-pulse">{status}</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-brand-blue transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow flex items-center justify-center p-8 lg:p-12 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!resultStill && !isRehearsing ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 max-w-sm">
                <div className="w-24 h-24 border-2 border-dashed border-brand-blue/30 rounded-full flex items-center justify-center mx-auto text-brand-blue/20">
                  <Clapperboard size={48} />
                </div>
              </motion.div>
            ) : isRehearsing ? (
              <motion.div key="rehearsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-10">
                <Loader2 size={80} className="text-brand-blue animate-spin" />
                <p className="text-[14px] font-black uppercase tracking-[0.8em] animate-pulse">Staging Scene</p>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-5xl w-full aspect-video lg:aspect-[16/10] bg-black rounded-sm overflow-hidden shadow-2xl border border-white/5">
                {resultScene ? (
                  <video key={resultScene} src={resultScene} autoPlay loop muted className="w-full h-full object-cover" />
                ) : (
                  <img src={resultStill!} className={`w-full h-full object-cover transition-all duration-[2s] ${isUnfolding ? 'opacity-20 blur-3xl scale-105' : 'opacity-100'}`} alt="" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIONS */}
        <div className="h-36 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#080808] p-8 lg:px-12 flex items-center justify-between z-40">
           <div className="flex items-center gap-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <HistoryIcon size={14} className="text-gray-400" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mono">Archives</p>
                </div>
              </div>
           </div>

           <div className="flex gap-4">
              {resultStill && (
                 <button 
                   onClick={handleUnfoldScene} 
                   disabled={isUnfolding || isRehearsing}
                   className={`h-20 px-12 lg:px-20 flex flex-col items-center justify-center gap-2 transition-all rounded-sm border ${resultScene ? 'border-brand-blue text-brand-blue bg-brand-blue/5' : 'border-black/10 dark:border-white/10 text-gray-400 hover:text-brand-blue'}`}
                 >
                    <Play size={24} className={isUnfolding ? 'animate-pulse' : 'fill-current'} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Unfold Scene</span>
                 </button>
              )}
              <button 
                onClick={handleStageScene}
                disabled={isRehearsing || isUnfolding || selectedActors.length < 1}
                className={`h-20 px-16 lg:px-32 flex flex-col items-center justify-center gap-2 transition-all rounded-sm shadow-2xl ${selectedActors.length > 0 ? 'bg-brand-blue text-white hover:scale-105' : 'bg-gray-100 dark:bg-white/5 text-gray-300'}`}
              >
                 <Camera size={24} className={isRehearsing ? 'animate-spin' : ''} />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isRehearsing ? 'Rendering' : 'Stage Scene'}</span>
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default CastAndDirectWorkspace;
