
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, User, MapPin, Loader2, AlertCircle, Edit3, Trash2, RefreshCw } from 'lucide-react';
import { ReferenceAsset } from '../../hooks/useStoryboardStudio';

interface IdentityAnchorsProps {
  assets: ReferenceAsset[];
  openAssetModal: (asset?: ReferenceAsset) => void;
  onViewAsset: (asset: ReferenceAsset) => void;
  removeAsset: (id: string) => void;
  handleReGenerateAsset: (id: string) => void;
}

export const IdentityAnchors: React.FC<IdentityAnchorsProps> = ({ 
  assets, openAssetModal, onViewAsset, removeAsset, handleReGenerateAsset 
}) => {
  return (
    <div className="p-8 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-8 w-full shadow-xl dark:shadow-2xl transition-colors duration-500">
       <header className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Layers size={18} className="text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-800 dark:text-white italic transition-colors">THAM CHIẾU, NHÂN VẬT</h3>
          </div>
          <button 
            onClick={() => openAssetModal()} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 hover:border-brand-blue dark:hover:border-white/20 rounded-lg text-slate-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-sm dark:shadow-none"
          >
            <Plus size={14}/> Thêm mới
          </button>
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleReGenerateAsset(asset.id); }} 
                    disabled={asset.status === 'processing'} 
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${asset.url ? 'bg-slate-200 dark:bg-black/40 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-black/60' : 'bg-brand-blue text-white shadow-lg'}`}
                  >
                    {asset.status === 'processing' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12}/>} Tạo lại (AI)
                  </button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};
