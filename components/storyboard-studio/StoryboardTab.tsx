import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Settings, Sparkles, LayoutGrid, Layers, Plus, 
  User, RefreshCw, AlertCircle, Clock, Mic, 
  ImageIcon, Trash2, Check, Video, Database, 
  FileAudio, Image as LucideImage, X, MapPin, 
  Loader2, Square as SquareIcon, MonitorPlay, Users,
  Maximize2, Download, Grid2X2, Grid3X3, Edit3, Film, Cpu,
  Music, Camera, Globe
} from 'lucide-react';
import { ReferenceAsset, Scene } from '../../hooks/useStoryboardStudio';

interface StoryboardTabProps {
  script: string;
  setScript: (v: string) => void;
  scriptRefImage: string | null;
  setScriptRefImage: (v: string | null) => void;
  scriptRefAudio: string | null;
  setScriptRefAudio: (v: string | null) => void;
  totalDuration: number;
  setTotalDuration: (v: number) => void;
  sceneDuration: number;
  voiceOverEnabled: boolean;
  setVoiceOverEnabled: (v: boolean) => void;
  assets: ReferenceAsset[];
  addAsset: (type: any) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: any) => void;
  updateScene: (id: string, updates: any) => void;
  handleReGenerateAsset: (id: string) => void;
  openAssetModal: (asset?: ReferenceAsset) => void;
  onViewAsset: (asset: ReferenceAsset) => void;
  onViewScene: (scene: Scene) => void;
  scenes: Scene[];
  selectedSceneIds: string[];
  toggleSceneSelection: (id: string) => void;
  selectAllScenes: () => void;
  isProcessing: boolean;
  isEnhancing?: boolean;
  assetUploadRef: React.RefObject<HTMLInputElement | null>;
  setActiveUploadAssetId: (id: string) => void;
  onOpenSettings: () => void;
  onLoadSample: () => void;
  onLoadSuggestion: () => void;
  settings: any; 
}

export const StoryboardTab: React.FC<StoryboardTabProps> = ({ 
  script, setScript, scriptRefImage, setScriptRefImage, scriptRefAudio, setScriptRefAudio,
  totalDuration, setTotalDuration, sceneDuration, voiceOverEnabled, setVoiceOverEnabled, 
  assets, addAsset, removeAsset, updateAsset, updateScene, handleReGenerateAsset, openAssetModal,
  onViewAsset, onViewScene,
  scenes, selectedSceneIds, toggleSceneSelection, selectAllScenes,
  isProcessing, isEnhancing, assetUploadRef, setActiveUploadAssetId,
  onOpenSettings, onLoadSample, onLoadSuggestion, settings
}) => {
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const mainAudioInputRef = useRef<HTMLInputElement>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'large' | 'list' | 'compact'>('grid');

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setScriptRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMainAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScriptRefAudio(file.name); 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex-grow flex flex-col p-10 lg:p-12 overflow-y-auto no-scrollbar bg-white dark:bg-[#050506] transition-colors duration-500"
    >
      <div className="max-w-[1600px] mx-auto w-full space-y-10 pb-40">
        <div className="flex items-center gap-4 text-brand-blue border-l-4 border-brand-blue pl-6 max-w-6xl mx-auto w-full">
          <Zap size={24} />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">TẠO KỊCH BẢN</h2>
        </div>

        {/* 1. SCRIPT INPUT */}
        <div className="space-y-6 max-w-6xl mx-auto w-full">
           <label className="text-[11px] font-black uppercase text-gray-500 tracking-[0.4em] italic">Ý TƯỞNG KỊCH BẢN</label>
           <div className="relative group">
              <textarea 
                value={script}
                onChange={(e) => setScript(e.target.value)}
                disabled={isEnhancing}
                className={`w-full h-48 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-8 rounded-sm text-lg font-medium leading-relaxed outline-none focus:border-brand-blue/40 transition-all resize-none shadow-xl dark:shadow-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 ${isEnhancing ? 'opacity-50' : ''}`}
                placeholder="Nhập ý tưởng kịch bản tại đây..."
              />
              
              {isEnhancing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-sm">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-brand-blue animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white animate-pulse">AI đang phân tích ý tưởng...</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-6 right-6 flex gap-4">
                <button 
                  onClick={onLoadSuggestion} 
                  disabled={isEnhancing}
                  className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline transition-all disabled:opacity-30"
                >
                  <Sparkles size={14} /> Gợi ý chi tiết
                </button>
                <button 
                  onClick={onLoadSample} 
                  disabled={isEnhancing}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest hover:underline transition-all disabled:opacity-30"
                >
                  <LayoutGrid size={14} /> Mẫu
                </button>
              </div>
           </div>
           <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => mainImageInputRef.current?.click()} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${scriptRefImage ? 'bg-brand-blue/20 border-brand-blue text-brand-blue dark:text-white' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white'}`}><LucideImage size={14} /> {scriptRefImage ? 'Đã tải ảnh' : 'Tải ảnh tham chiếu'}</button>
              <button onClick={() => mainAudioInputRef.current?.click()} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${scriptRefAudio ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-white' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-white'}`}><FileAudio size={14} /> {scriptRefAudio ? 'Đã tải Audio' : 'Tải Audio tham chiếu'}</button>
              <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={handleMainImageUpload} />
              <input type="file" ref={mainAudioInputRef} className="hidden" accept="audio/*" onChange={handleMainAudioUpload} />
           </div>
        </div>

        {/* 1.5 CONFIGURATION SUMMARY */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Tóm tắt Render Engine */}
          <div className="p-0.5 bg-gradient-to-r from-brand-blue/20 via-purple-500/20 to-brand-blue/20 rounded-2xl xl:col-span-2">
            <div className="bg-slate-50 dark:bg-[#0a0a0c] rounded-xl p-6 flex flex-wrap items-center justify-between gap-6 transition-colors duration-500 h-full">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                    <LucideImage size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Image Engine</p>
                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase italic">{settings.imageModel.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-white/5"></div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                    <Film size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Video Engine</p>
                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase italic">{settings.model.toUpperCase()}</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-white/5"></div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Maximize2 size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Resolution</p>
                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase italic">1080P • 16:9</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 transition-all border border-slate-200 dark:border-white/5"
              >
                <Settings size={12} /> Cấu hình
              </button>
            </div>
          </div>

          {/* Tóm tắt Thông số sáng tạo (Khung nhỏ mới) */}
          <div className="p-0.5 bg-slate-200 dark:bg-white/10 rounded-2xl">
             <div className="bg-slate-50 dark:bg-[#0a0a0c] rounded-xl p-6 h-full space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                   <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-brand-blue" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Aesthetic Profile</span>
                   </div>
                   <button onClick={onOpenSettings} className="text-[8px] font-black text-brand-blue uppercase hover:underline">Thay đổi</button>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase">Format</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate">{settings.format}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase">Style</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate">{settings.style}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase">Culture</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate">{settings.culture}</p>
                   </div>
                   <div className="space-y-1 flex items-center gap-2 pt-1">
                      <Music size={10} className="text-gray-400" />
                      <div className={`w-1.5 h-1.5 rounded-full ${settings.bgm ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      <Mic size={10} className="text-gray-400" />
                      <div className={`w-1.5 h-1.5 rounded-full ${settings.voiceOver ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                   </div>
                </div>

                <div className="pt-2">
                   <div className="flex items-center gap-2 text-gray-400">
                      <Camera size={10} />
                      <p className="text-[9px] font-medium italic truncate">{settings.cinematic || 'Chưa thiết lập camera'}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* 2. DURATION HUD */}
        <div className="max-w-6xl mx-auto w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between rounded-xl shadow-lg transition-colors">
                <div className="flex items-center gap-4">
                  <Clock size={20} className="text-brand-blue" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500">TỔNG THỜI LƯỢNG DỰ KIẾN</p>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" step={8} min={8} value={totalDuration} 
                        onChange={(e) => setTotalDuration(parseInt(e.target.value) || 8)}
                        className="bg-transparent border-b border-brand-blue/20 text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white w-20 outline-none focus:border-brand-blue transition-colors"
                      />
                      <span className="text-2xl font-black italic tracking-tighter text-slate-300 dark:text-white/40">s</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-300 dark:text-gray-700 uppercase">DIVISIBLE BY 8</span>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between rounded-xl shadow-lg opacity-60 transition-colors">
                <div className="flex items-center gap-4">
                  <LayoutGrid size={20} className="text-slate-400 dark:text-gray-400" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500">THỜI LƯỢNG MỖI PHÂN CẢNH</p>
                    <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">{sceneDuration}s</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-300 dark:text-gray-700 uppercase">FIXED</span>
            </div>
          </div>
        </div>

        {/* 3. ASSET GRID - FULL WIDTH */}
        <div className="p-8 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-8 w-full shadow-xl dark:shadow-2xl transition-colors duration-500">
           <header className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Layers size={18} className="text-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-800 dark:text-white italic transition-colors">THAM CHIẾU, NHÂN VẬT</h3>
              </div>
              <button onClick={() => openAssetModal()} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 hover:border-brand-blue dark:hover:border-white/20 rounded-lg text-slate-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-sm dark:shadow-none"><Plus size={14}/> Thêm mới</button>
           </header>

           <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 snap-x px-2">
              {assets.length === 0 && (
                <div 
                  onClick={() => openAssetModal()}
                  className="w-[300px] shrink-0 snap-start bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-4 flex flex-col gap-4 group transition-all shadow-xl relative cursor-pointer hover:border-brand-blue/30"
                >
                  <div className="aspect-[3/4] bg-slate-200 dark:bg-black rounded-[1rem] overflow-hidden relative border border-slate-300 dark:border-white/10 flex items-center justify-center transition-colors">
                     <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform"><Plus size={32} /></div>
                  </div>
                  <div className="space-y-1 text-center">
                    <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">Thêm nhân vật mới</h4>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">Khởi tạo tham chiếu</p>
                  </div>
                </div>
              )}

              {assets.map((asset) => (
                <div key={asset.id} className={`w-[300px] shrink-0 snap-start bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-4 flex flex-col gap-4 group transition-all shadow-xl relative cursor-pointer hover:border-brand-blue/30`}>
                   <div onClick={() => asset.url && onViewAsset(asset)} className="aspect-[3/4] bg-slate-200 dark:bg-black rounded-[1rem] overflow-hidden relative border border-slate-300 dark:border-white/5 transition-colors">
                      {asset.url ? <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} /> : <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">{asset.type === 'CHARACTER' ? <User size={64} className="text-slate-400 dark:text-gray-700" /> : <MapPin size={64} className="text-slate-400 dark:text-gray-700" />}</div>}
                      
                      {asset.status === 'processing' && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300 z-10">
                          <Loader2 size={32} className="text-brand-blue animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Đang tạo...</p>
                        </div>
                      )}

                      {asset.status === 'error' && (
                        <div className="absolute inset-0 bg-red-100/60 dark:bg-red-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center z-10">
                           <AlertCircle size={32} className="text-red-600 dark:text-white opacity-80" />
                           <p className="text-[10px] font-black uppercase text-red-600 dark:text-white leading-tight">Lỗi khởi tạo</p>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div onClick={(e) => { e.stopPropagation(); openAssetModal(asset); }} className="p-2 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-lg text-slate-800 dark:text-white hover:bg-brand-blue hover:text-white transition-colors"><Edit3 size={12} /></div>
                        <div onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }} className="p-2 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-lg text-slate-800 dark:text-white hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={12} /></div>
                      </div>
                   </div>
                   <div onClick={() => openAssetModal(asset)} className="space-y-1 text-center">
                      <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">{asset.name}</h4>
                      <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{asset.type}</p>
                   </div>
                   <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
                      <button onClick={(e) => { e.stopPropagation(); handleReGenerateAsset(asset.id); }} disabled={asset.status === 'processing'} className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${asset.url ? 'bg-slate-200 dark:bg-black/40 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-black/60' : 'bg-brand-blue text-white shadow-lg'}`}>{asset.status === 'processing' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12}/>} Tạo lại (AI)</button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* 4. PHÂN CẢNH CHI TIẾT */}
        <div className="space-y-12 pt-12 border-t border-slate-200 dark:border-white/5">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <MonitorPlay size={20} className="text-brand-blue" />
                   <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white transition-colors">Bản thảo phân cảnh</h3>
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em]">Tổng hợp kịch bản hình ảnh</p>
             </div>
             <div className="flex flex-wrap items-center gap-4 lg:gap-6 bg-slate-50 dark:bg-[#0d0d0f] p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 transition-colors duration-500">
                <button onClick={selectAllScenes} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl border transition-all text-[11px] font-black uppercase tracking-tight ${selectedSceneIds.length === scenes.length && scenes.length > 0 ? 'bg-brand-blue dark:bg-white/10 border-brand-blue text-white' : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>
                   <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedSceneIds.length === scenes.length && scenes.length > 0 ? 'bg-brand-blue border-brand-blue dark:border-white' : 'border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/20'}`}>{selectedSceneIds.length === scenes.length && scenes.length > 0 && <Check size={12} strokeWidth={4} />}</div>
                   Chọn tất cả
                </button>
                <div className="flex gap-2">
                   <button className="flex items-center gap-3 px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-[11px] font-black uppercase tracking-tight text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none"><Download size={16} /> Ảnh</button>
                   <button className="flex items-center gap-3 px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-[11px] font-black uppercase tracking-tight text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none"><Download size={16} /> Video</button>
                </div>
                <div className="flex items-center bg-slate-200 dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-white/10 transition-colors">
                   {[{ id: 'list', icon: <SquareIcon size={16}/> }, { id: 'grid', icon: <Grid2X2 size={16}/> }, { id: 'large', icon: <Grid3X3 size={16}/> }, { id: 'compact', icon: <LayoutGrid size={16}/> }].map(l => (
                     <button key={l.id} onClick={() => setViewLayout(l.id as any)} className={`p-2.5 rounded-lg transition-all ${viewLayout === l.id ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}>{l.icon}</button>
                   ))}
                </div>
             </div>
          </header>

          <div className={`grid gap-8 ${viewLayout === 'list' ? 'grid-cols-1' : viewLayout === 'large' ? 'grid-cols-1 md:grid-cols-2' : viewLayout === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
             {isProcessing ? Array.from({length: 4}).map((_, i) => <div key={i} className="aspect-video bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl animate-pulse flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-brand-blue" /><span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Đang bóc tách phân cảnh...</span></div>) : 
               scenes.map((scene) => (
                <div key={scene.id} onClick={() => toggleSceneSelection(scene.id)} className={`group relative flex flex-col bg-slate-50 dark:bg-white/[0.02] border-2 rounded-[2rem] overflow-hidden transition-all cursor-pointer shadow-lg dark:shadow-xl ${selectedSceneIds.includes(scene.id) ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'}`}>
                   <div onClick={(e) => { if (scene.visualUrl || scene.videoUrl) { e.stopPropagation(); onViewScene(scene); } }} className="aspect-video bg-slate-200 dark:bg-black relative overflow-hidden flex items-center justify-center transition-colors">
                      {scene.videoUrl ? <video src={scene.videoUrl} autoPlay loop muted className="w-full h-full object-cover" /> : scene.visualUrl ? <img src={scene.visualUrl} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-4 opacity-20 text-slate-500 dark:text-white"><MonitorPlay size={48} /><span className="text-[10px] font-black uppercase tracking-widest">Chưa kết xuất</span></div>}
                      <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-sm border border-slate-200 dark:border-white/10 text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">Cảnh 0{scene.order}</div>
                      {scene.status === 'generating' && <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20"><Loader2 className="text-brand-blue animate-spin" size={32} /><span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.4em] animate-pulse">Đang kết xuất...</span></div>}
                      <div onClick={(e) => { e.stopPropagation(); toggleSceneSelection(scene.id); }} className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedSceneIds.includes(scene.id) ? 'bg-brand-blue border-brand-blue' : 'bg-white/40 dark:bg-black/40 border-slate-300 dark:border-white/20'}`}>{selectedSceneIds.includes(scene.id) && <Check size={14} strokeWidth={4} className="text-white" />}</div>
                   </div>
                   
                   {/* SHOW REFERENCE ASSETS IN SCENE */}
                   <div className="px-6 py-4 bg-slate-100/50 dark:bg-black/40 border-b border-slate-200 dark:border-white/5 flex items-center gap-3 transition-colors duration-500">
                      <div className="flex items-center gap-2 mr-2">
                        <User size={12} className="text-emerald-500" />
                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Mỏ neo:</span>
                      </div>
                      <div className="flex -space-x-2">
                        {(scene.characterIds || []).map((charId) => {
                          const asset = assets.find(a => a.id === charId);
                          if (!asset) return null;
                          return (
                            <div key={charId} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1c1c1f] overflow-hidden shadow-lg group/avatar relative" title={asset.name}>
                              {asset.url ? (
                                <img src={asset.url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-300 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-white/40 transition-colors">
                                  {asset.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(scene.characterIds || []).length === 0 && (
                          <span className="text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest italic">Toàn cảnh</span>
                        )}
                      </div>
                   </div>

                   <div className="p-6 space-y-4 bg-white dark:bg-transparent transition-colors duration-500 flex-grow">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest">Kịch bản chi tiết:</label>
                        <textarea value={scene.prompt} onChange={(e) => updateScene(scene.id, { prompt: e.target.value })} onClick={(e) => e.stopPropagation()} className="w-full bg-transparent border-none p-0 text-[12px] font-medium leading-relaxed text-slate-700 dark:text-gray-300 italic focus:ring-0 resize-none min-h-[60px] transition-colors" />
                      </div>
                      <div className="flex justify-between items-center pt-2 text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 border-t border-slate-100 dark:border-white/5">
                         <div className="flex items-center gap-2"><Clock size={10} /><span>{scene.duration}s</span></div>
                         <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1.5 hover:text-brand-blue transition-colors group/regen"><RefreshCw size={12} className="group-hover/regen:rotate-180 transition-transform duration-700" /> Tạo lại</button>
                            <button className="hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                         </div>
                      </div>
                   </div>
                </div>
               ))
             }
          </div>
        </div>
      </div>
    </motion.div>
  );
};
