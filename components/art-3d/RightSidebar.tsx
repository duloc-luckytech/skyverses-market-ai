import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Upload, CheckCircle2, Monitor, Plus, ChevronRight, ChevronLeft, Settings, Info, Clock, Database, BarChart3 } from 'lucide-react';

interface RightSidebarProps {
  assets: any[];
  activeAssetId: string;
  setActiveAssetId: (id: string) => void;
  onFileSelect: (file: File) => void;
  isOpen: boolean;
  onToggle: () => void;
  logic: any; // Pass logic for property access
}

type MainTab = 'Assets' | 'Property' | 'History';
type AssetFilter = 'All' | 'Textured' | 'Untextured';

export const RightSidebar: React.FC<RightSidebarProps> = ({ 
  assets, 
  activeAssetId, 
  setActiveAssetId, 
  onFileSelect,
  isOpen,
  onToggle,
  logic
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Assets');
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('All');

  const activeAsset = assets.find(a => a.id === activeAssetId) || assets[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (assetFilter === 'All') return true;
    return asset.type === assetFilter;
  });

  return (
    <aside className={`relative shrink-0 border-l border-white/5 bg-[#141519] flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'w-72' : 'w-0'}`}>
      {/* MAIN TABS */}
      <div className="flex border-b border-white/5 bg-black/40 shrink-0">
        {(['Assets', 'Property', 'History'] as MainTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMainTab(tab)}
            className={`flex-grow py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              activeMainTab === tab 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
            {activeMainTab === tab && (
              <motion.div layoutId="sidebar-active-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        {/* ASSETS TAB */}
        {activeMainTab === 'Assets' && (
          <div className="flex flex-col h-full">
            <div className="h-14 border-b border-white/5 flex items-center px-4 gap-2 shrink-0 bg-black/10">
              <div className="flex bg-white/5 p-1 rounded-xl w-full border border-white/5">
                {(['All', 'Textured', 'Untextured'] as AssetFilter[]).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setAssetFilter(tab)}
                    className={`flex-grow py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${
                      assetFilter === tab 
                      ? 'bg-[#3b3d45] text-white shadow-lg' 
                      : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar p-4">
              <div className="grid grid-cols-2 gap-3 pb-20">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".obj,.fbx,.glb,.stl" 
                  onChange={handleFileChange} 
                />
                
                {/* Upload Button */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-square border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center p-2 group cursor-pointer hover:border-brand-blue/50 transition-all overflow-hidden bg-[#1a1a1a]"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`,
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                  }}
                >
                  <div className="relative z-10 flex flex-col items-center text-center gap-1">
                    <Plus size={24} className="text-gray-300 group-hover:text-white transition-all duration-300" />
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <p className="text-[13px] font-bold text-white leading-none">Upload 3D</p>
                        <p className="text-[13px] font-bold text-white leading-tight">Model</p>
                      </div>
                      <div className="space-y-0.5 opacity-60">
                        <p className="text-[9px] font-black text-gray-300 leading-none uppercase tracking-tighter whitespace-nowrap">GLB, OBJ, FBX, STL,</p>
                        <p className="text-[9px] font-black text-gray-300 leading-none uppercase tracking-tighter whitespace-nowrap">≤100MB, ≤1.5</p>
                        <p className="text-[9px] font-black text-gray-300 leading-none uppercase tracking-tighter whitespace-nowrap">million faces</p>
                      </div>
                    </div>
                  </div>
                  {/* Subtle Glow Overlay */}
                  <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {filteredAssets.map((asset: any) => (
                  <div 
                    key={asset.id} 
                    onClick={() => setActiveAssetId(asset.id)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 relative group cursor-pointer transition-all duration-500 ${
                      activeAssetId === asset.id ? 'border-brand-blue ring-2 ring-brand-blue/20 shadow-2xl' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img 
                      src={asset.thumb} 
                      className={`w-full h-full object-cover transition-all duration-700 ${activeAssetId === asset.id ? 'opacity-100' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60'}`} 
                      alt="Asset" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[8px] font-black uppercase text-white italic truncate">{asset.name}</p>
                    </div>
                    
                    {activeAssetId === asset.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-brand-blue shadow-lg" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROPERTY TAB */}
        {activeMainTab === 'Property' && (
          <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 animate-in fade-in slide-in-from-right-2">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue italic">Geometric Intel</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Asset Name</p>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">{activeAsset.name}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Faces</p>
                    <p className="text-sm font-black text-white italic">{activeAsset.faces}</p>
                  </div>
                  <BarChart3 size={16} className="text-gray-700" />
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Vertices</p>
                    <p className="text-sm font-black text-white italic">{activeAsset.vertices}</p>
                  </div>
                  <Info size={16} className="text-gray-700" />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 italic">PBR Override</p>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-500 tracking-widest">Metallic</span>
                    <span className="text-white italic">{logic.metallic.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={logic.metallic} 
                    onChange={e => logic.setMetallic(parseFloat(e.target.value))} 
                    className="w-full h-1 bg-white/10 appearance-none rounded-full accent-brand-blue cursor-pointer" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-500 tracking-widest">Roughness</span>
                    <span className="text-white italic">{logic.roughness.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={logic.roughness} 
                    onChange={e => logic.setRoughness(parseFloat(e.target.value))} 
                    className="w-full h-1 bg-white/10 appearance-none rounded-full accent-brand-blue cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl space-y-3">
               <div className="flex items-center gap-2 text-brand-blue">
                  <Settings size={14} />
                  <span className="text-[9px] font-black uppercase">Engine Config</span>
               </div>
               <p className="text-[8px] text-gray-500 leading-relaxed uppercase italic">
                 Property changes are applied to the active viewport node in real-time.
               </p>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeMainTab === 'History' && (
          <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-6 animate-in fade-in slide-in-from-right-2">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Session Logs</p>
              <div className="space-y-2">
                {[
                  { t: '13:19', m: 'Model_Synthesis_Complete' },
                  { t: '13:15', m: 'Uplink_Identity_Locked' },
                  { t: '12:42', m: 'Registry_Sync_Active' },
                  { t: '10:05', m: 'System_Boot_Validated' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-brand-blue/30 transition-all">
                    <span className="text-[8px] font-mono text-brand-blue mt-1">{log.t}</span>
                    <p className="text-[10px] font-bold text-gray-500 uppercase group-hover:text-white transition-colors">{log.m}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 text-center">
              <button className="text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-brand-blue flex items-center justify-center gap-2 mx-auto">
                 <Clock size={12} /> View Full Logs
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
