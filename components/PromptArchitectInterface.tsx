
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Loader2, Code2, Terminal, ShieldCheck, 
  Plus, Save, Layers, Box, 
  Settings2, Sliders, Palette, CheckCircle2, 
  Info, Lock, ExternalLink, Activity, 
  Braces, Copy, Share2, Eye, Cpu, Command,
  Maximize2, Search, Book, Bookmark, Filter,
  Database, Image as ImageIcon, Video, Music,
  CornerDownLeft, X, Tag, Layout, MonitorPlay,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoText } from '../services/gemini';

interface PromptField {
  id: string;
  label: string;
  value: string;
  active: boolean;
}

interface PromptAsset {
  id: string;
  name: string;
  type: 'IMG' | 'VID' | 'AUDIO' | 'LOGIC';
  logic: PromptField[];
  tags: string[];
  timestamp?: string;
}

const PromptArchitectInterface = () => {
  const [targetModel, setTargetModel] = useState('Gemini_3_Pro');
  const [isCompiling, setIsCompiling] = useState(false);
  const [strength, setStrength] = useState(78);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IMG' | 'VID' | 'AUDIO' | 'PROMPT'>('ALL');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Mobile UI State
  const [mobileTab, setMobileTab] = useState<'REPOSITORY' | 'ARCHITECT' | 'AUDIT'>('ARCHITECT');

  // Production Templates
  const GLOBAL_TEMPLATES: PromptAsset[] = [
    {
      id: 'tmpl-1',
      name: 'Cinematic_Architecture_8K',
      type: 'IMG',
      tags: ['ENTERPRISE', 'FAST-SHIP'],
      logic: [
        { id: 'subj', label: 'Subject', value: 'Brutalist concrete monument in a desert storm', active: true },
        { id: 'style', label: 'Style', value: 'Cinematic, high contrast, anamorphic lens', active: true },
        { id: 'env', label: 'Environment', value: 'Swirling sand, harsh midday sun, deep shadows', active: true }
      ]
    },
    {
      id: 'tmpl-4',
      name: 'Logic_Flow_Optimizer',
      type: 'LOGIC',
      tags: ['GEMINI', 'ENTERPRISE'],
      logic: [
        { id: 'subj', label: 'Objective', value: 'Analyze legal document for compliance breaches', active: true },
        { id: 'style', label: 'Tone', value: 'Technical, strict, structured JSON output', active: true },
        { id: 'env', label: 'Context', value: 'EU GDPR Regulation 2024 updates', active: true }
      ]
    }
  ];

  const [history, setHistory] = useState<PromptAsset[]>([]);
  const [fields, setFields] = useState<PromptField[]>([
    { id: 'subj', label: 'Subject', value: 'Cyberpunk architect overlooking a crystalline city', active: true },
    { id: 'style', label: 'Style', value: 'Cinematic, volumetric lighting, hyper-realistic 8K', active: true },
    { id: 'env', label: 'Environment', value: 'High-altitude skywalk, rain-slicked glass, neon aura', active: true }
  ]);

  const [variables, setVariables] = useState([
    { key: 'city_type', value: 'Crystalline' },
    { key: 'lighting', value: 'Volumetric' }
  ]);

  const [testResult, setTestResult] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    const all = [...GLOBAL_TEMPLATES, ...history];
    return all.filter(a => {
      const matchesSearch = !searchTerm || 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.logic.some(f => f.value.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === 'ALL' || (activeCategory === 'PROMPT' ? a.type === 'LOGIC' : a.type === activeCategory);
      const matchesTag = !activeTag || a.tags.includes(activeTag);
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchTerm, history, activeCategory, activeTag]);

  const loadAsset = (asset: PromptAsset) => {
    setFields(asset.logic);
    setSearchTerm('');
    setActiveTag(null);
    setMobileTab('ARCHITECT');
  };

  const updateField = (id: string, value: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleCompile = async () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setTestResult(null);
    
    // Tự động chuyển tab Audit trên mobile khi bắt đầu compile
    if (window.innerWidth < 1024) {
      setTimeout(() => setMobileTab('AUDIT'), 500);
    }

    try {
      const compiledPrompt = fields.filter(f => f.active).map(f => `${f.label}: ${f.value}`).join('\n');
      const result = await generateDemoText(`ACT: Architect. EVAL: \n${compiledPrompt}`);
      setTestResult(result);
      setHistory(prev => [{
        id: `hist-${Date.now()}`,
        name: fields[0].value.slice(0, 20).toUpperCase() || 'UNTITLED_NODE',
        type: 'LOGIC',
        tags: ['HISTORY'],
        timestamp: new Date().toLocaleTimeString(),
        logic: [...fields]
      }, ...prev]);
      setStrength(Math.floor(Math.random() * 20) + 80);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompiling(false);
    }
  };

  const repositoryTags = ['ENTERPRISE', 'FAST-SHIP', 'BRAND-LOCK', 'VEO', 'GEMINI'];

  // REPOSITORY COMPONENT
  const RepositoryPanel = () => (
    <div className="flex flex-col h-full bg-[#fdfdfd] dark:bg-[#050506]">
      <div className="p-4 lg:p-8 space-y-6">
        <div className="relative flex items-center bg-white dark:bg-[#0a0a0b] border border-black/[0.08] dark:border-white/5 rounded-md shadow-sm overflow-hidden h-14">
          <div className="pl-5 pr-2"><Search size={16} className="text-gray-300" /></div>
          <input 
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH REPOSITORY..."
            className="flex-grow bg-transparent border-none py-2 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {['ALL', 'IMG', 'VID', 'PROMPT'].map(cat => (
            <button 
              key={cat} onClick={() => setActiveCategory(cat as any)}
              className={`px-6 py-2 border text-[9px] font-black uppercase tracking-widest rounded-sm transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-gray-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {repositoryTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={`px-3 py-1 border rounded-full text-[8px] font-black uppercase transition-all ${activeTag === tag ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' : 'border-black/5 text-gray-400'}`}>
              #{tag}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto px-4 lg:px-8 pb-20 no-scrollbar space-y-3">
        {filteredAssets.map(asset => (
          <div key={asset.id} onClick={() => loadAsset(asset)} className="p-4 bg-white dark:bg-white/[0.01] border border-black/[0.05] dark:border-white/5 hover:border-brand-blue/30 cursor-pointer rounded-sm group transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase group-hover:text-brand-blue transition-colors">{asset.name}</span>
              <span className="text-[7px] font-black bg-brand-blue/10 text-brand-blue px-2 py-0.5">{asset.type}</span>
            </div>
            <div className="flex gap-2">{asset.tags.map(t => <span key={t} className="text-[6px] font-black text-gray-400">#{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white font-mono transition-all duration-500">
      
      {/* DESKTOP SIDEBAR / MOBILE REPOSITORY TAB */}
      <aside className={`${mobileTab === 'REPOSITORY' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[450px] shrink-0 border-r border-black/10 dark:border-white/5 z-20`}>
        <RepositoryPanel />
      </aside>

      {/* MAIN CONSTRUCTION AREA */}
      <main className={`${mobileTab === 'ARCHITECT' ? 'flex' : 'hidden'} lg:flex flex-grow flex-col bg-white dark:bg-[#020202] relative overflow-hidden`}>
        <div className="flex-grow flex flex-col p-6 lg:p-12 overflow-y-auto no-scrollbar">
           <div className="max-w-4xl mx-auto w-full space-y-10 pb-48 lg:pb-32">
              <header className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <Terminal className="w-5 h-5 text-brand-blue" />
                    <div>
                       <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Constructor_v1.2</span>
                       <p className="hidden sm:block text-[8px] font-bold text-gray-800 uppercase tracking-widest">Semantic Grid Architecture</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><Share2 size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><Save size={16} /></button>
                 </div>
              </header>
              
              <div className="space-y-6">
                 {fields.map((field) => (
                    <div key={field.id} className={`p-5 border transition-all ${field.active ? 'border-black/[0.08] dark:border-white/5' : 'border-dashed opacity-30'}`}>
                       <div className="flex justify-between items-center mb-4">
                          <label className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-blue">{field.label}</label>
                          <button onClick={() => setFields(fields.map(f => f.id === field.id ? {...f, active: !f.active} : f))}>
                             <Eye className={`w-3.5 h-3.5 ${field.active ? 'text-gray-300' : 'text-red-500'}`} />
                          </button>
                       </div>
                       <textarea 
                         value={field.value} onChange={(e) => updateField(field.id, e.target.value)}
                         className="w-full bg-transparent border-none text-xl lg:text-3xl font-black text-black dark:text-white/90 focus:outline-none resize-none min-h-[40px] tracking-tight leading-tight uppercase"
                         rows={1}
                       />
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* COMPILE HUD - REPOSITIONED FOR MOBILE VISIBILITY */}
        <div className={`fixed lg:absolute bottom-20 lg:bottom-0 left-0 right-0 lg:h-36 bg-white dark:bg-black border-t border-black/10 dark:border-white/5 p-6 flex items-center justify-between z-[50] lg:z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${mobileTab === 'ARCHITECT' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="hidden sm:flex items-center gap-12">
              <div className="space-y-2">
                 <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                    <span>SYNTAX STRENGTH</span>
                    <span className="text-brand-blue">{strength}%</span>
                 </div>
                 <div className="h-1 w-40 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: `${strength}%` }}></div>
                 </div>
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase text-gray-400">ADAPTER</span>
                 <select value={targetModel} onChange={(e) => setTargetModel(e.target.value)} className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none">
                    <option value="Gemini_3_Pro">GEMINI 3 PRO</option>
                    <option value="SDXL">SDXL TURBO</option>
                 </select>
              </div>
           </div>

           <button 
             onClick={handleCompile} disabled={isCompiling}
             className="w-full sm:w-auto bg-brand-blue text-white px-10 py-5 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-20"
           >
             {isCompiling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
             COMPILE_LOGIC
           </button>
        </div>
      </main>

      {/* PRODUCTION AUDIT PANEL (RIGHT/MODAL) */}
      <aside className={`${mobileTab === 'AUDIT' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[400px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden z-20`}>
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <Eye className="w-4 h-4 text-brand-blue" /> Production_Audit
            </h3>
         </div>
         <div className="flex-grow overflow-y-auto p-6 lg:p-8 space-y-10 no-scrollbar pb-32">
            {isCompiling ? (
               <div className="py-20 text-center space-y-8 animate-pulse">
                  <Cpu className="w-12 h-12 text-brand-blue mx-auto animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">ANALYZING_TOKENS...</p>
               </div>
            ) : testResult ? (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-green-500">
                        <CheckCircle2 size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Logic_Verified</span>
                     </div>
                     <div className="p-6 bg-black text-[#00ff41] font-mono text-[10px] leading-relaxed border border-[#00ff41]/20 shadow-[0_0_20px_rgba(0,255,65,0.05)]">
                        {testResult}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">SYNTHESIS PREVIEW</h4>
                     <div className="aspect-square bg-black border border-white/10 relative group overflow-hidden rounded-sm">
                        <img src={`https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=600`} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                           <span className="text-[8px] font-black uppercase tracking-widest text-white/40 italic">Watermarked Preview</span>
                           <button className="p-2.5 bg-white/10 backdrop-blur-md rounded-sm border border-white/10 text-white hover:bg-brand-blue transition-all"><Maximize2 size={14} /></button>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 border border-brand-blue/20 bg-brand-blue/5 rounded-sm space-y-4">
                     <div className="flex items-center gap-3 text-brand-blue">
                        <Lock size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">VPC_LOCK</span>
                     </div>
                     <p className="text-[8px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">Logic node is pinned to private studio instance. Authorized for export.</p>
                  </div>
               </div>
            ) : (
               <div className="py-24 text-center opacity-10">
                  <div className="flex flex-col items-center gap-4">
                    <Command className="w-10 h-10 mx-auto" />
                    <HistoryIcon className="w-6 h-6 text-brand-blue/30" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Awaiting Synthesis Sequence</p>
               </div>
            )}
         </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-black/10 dark:border-white/10 grid grid-cols-3 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        {[
          { id: 'REPOSITORY', icon: <Database size={20} />, label: 'Library' },
          { id: 'ARCHITECT', icon: <Code2 size={20} />, label: 'Constructor' },
          { id: 'AUDIT', icon: <Eye size={20} />, label: 'Audit' }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setMobileTab(tab.id as any)}
            className={`flex flex-col items-center justify-center gap-1.5 transition-all ${mobileTab === tab.id ? 'text-brand-blue' : 'text-gray-400'}`}
          >
            <div className={`p-1.5 rounded-full transition-all ${mobileTab === tab.id ? 'bg-brand-blue/10' : ''}`}>
               {tab.icon}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0090ff; }
      `}</style>
    </div>
  );
};

export default PromptArchitectInterface;
