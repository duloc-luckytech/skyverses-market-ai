
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Grid, LayoutGrid, 
  Columns, Calendar, CheckSquare, Maximize2, 
  Trash2, Download, Zap, Wand2, Plus, 
  Image as ImageIcon, MoreVertical, Settings, 
  Upload, ChevronDown, Monitor, Clock, 
  Filter, Square, Check, Loader2, AlertCircle,
  FileSearch, Trash, CloudUpload, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateDemoImage } from '../services/gemini';
import { uploadToGCS, dataURLtoBlob, GCSAssetMetadata } from '../services/storage';

const DB_NAME = 'Skyverses_GCS_Registry';
const STORE_NAME = 'cloud_assets';

const ImageLibraryPage: React.FC = () => {
  const { t } = useLanguage();
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  // -- State --
  const [assets, setAssets] = useState<GCSAssetMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // -- Refs & Cleanup --
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrls = useRef<Set<string>>(new Set());

  // Revoke Object URLs to prevent memory leaks
  const clearObjectUrls = () => {
    activeObjectUrls.current.forEach(url => URL.revokeObjectURL(url));
    activeObjectUrls.current.clear();
  };

  // --- INITIAL LOAD FROM INDEXEDDB ---
  useEffect(() => {
    const initAndLoadDB = () => {
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) return;
        
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
          clearObjectUrls();
          const data = getAll.result.map((item: GCSAssetMetadata) => {
            // Generate dynamic blob URL from stored binary data
            const displayUrl = URL.createObjectURL(item.blob);
            activeObjectUrls.current.add(displayUrl);
            return { ...item, url: displayUrl };
          });
          setAssets(data.sort((a: GCSAssetMetadata, b: GCSAssetMetadata) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        };
      };
    };

    initAndLoadDB();
    return () => clearObjectUrls();
  }, []);

  // --- GROUPING LOGIC ---
  // Fix: Explicitly type the return of useMemo for groupedAssets to avoid 'unknown' type inference issues in the view
  const groupedAssets = useMemo<Record<string, GCSAssetMetadata[]>>(() => {
    const filtered = assets.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (a as any).prompt?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const groups: Record<string, GCSAssetMetadata[]> = {};

    filtered.forEach(asset => {
      const date = new Date(asset.timestamp);
      const today = new Date();
      let label = date.toLocaleDateString('vi-VN');

      if (date.toDateString() === today.toDateString()) label = 'Hôm nay';
      else {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) label = 'Hôm qua';
      }
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(asset);
    });

    return groups;
  }, [assets, searchQuery]);

  // --- ACTIONS ---
  const deleteAsset = (id: string) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      
      const assetToRemove = assets.find(a => a.id === id);
      if (assetToRemove) URL.revokeObjectURL(assetToRemove.url);
      
      setAssets(prev => prev.filter(a => a.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    };
  };

  // --- UPLOAD TO GCS & SAVE TO INDEXEDDB ---
  const handleGCSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Thực hiện Upload qua utility GCS
      const metadata = await uploadToGCS(file);
      
      // 2. Lưu Metadata & Blob vào IndexedDB
      const request = indexedDB.open(DB_NAME, 1);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(metadata);
        setAssets(prev => [{ ...metadata, url: metadata.url }, ...prev]);
        setIsUploading(false);
      };
    } catch (error) {
      console.error("Uplink failed:", error);
      setIsUploading(false);
    }
    e.target.value = '';
  };

  // --- AI SYNTHESIS & SAVE TO INDEXEDDB ---
  const handleSynthesize = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }

    const COST = 150;
    if (credits < COST) { alert("Không đủ hạn ngạch credits."); return; }

    setIsGenerating(true);
    try {
      const dataUrl = await generateDemoImage(prompt);
      if (dataUrl) {
        useCredits(COST);
        const blob = dataURLtoBlob(dataUrl);
        const blobUrl = URL.createObjectURL(blob);
        activeObjectUrls.current.add(blobUrl);

        const newAsset: GCSAssetMetadata = {
          id: 'gen-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          url: blobUrl,
          blob: blob,
          name: prompt.slice(0, 20) + '.png',
          size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
          type: 'image/png',
          timestamp: new Date().toISOString(),
          bucket: 'skyverses-gen-vault',
          gcsPath: `gs://skyverses-gen-vault/ai/${Date.now()}.png`,
          prompt: prompt
        };

        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = (e: any) => {
          const db = e.target.result;
          db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(newAsset);
          setAssets(prev => [newAsset, ...prev]);
        };
        setPrompt('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#030304] text-black dark:text-white pt-24 pb-48 transition-colors duration-500">
      
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0d0d0f] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-6 lg:p-8 space-y-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue shadow-sm">
                <ImageIcon size={24} />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Cloud Registry</h1>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em]">{assets.length} objects synced</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-xl">
               {[Monitor, LayoutGrid, Grid, LayoutGrid, Columns].map((Icon, idx) => (
                 <button key={idx} className={`p-2.5 rounded-lg transition-all ${idx === 3 ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-slate-400 hover:text-brand-blue'}`}>
                    <Icon size={18} />
                 </button>
               ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-grow group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm trong GCS Registry..."
                className="w-full bg-[#f4f7f9] dark:bg-black/20 border border-transparent focus:border-brand-blue/30 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold outline-none transition-all"
              />
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-lg flex items-center gap-3 ${isUploading ? 'bg-gray-200 dark:bg-white/10 text-gray-400' : 'bg-brand-blue text-white hover:brightness-110 active:scale-95 shadow-brand-blue/20'}`}
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
              <span className="hidden sm:inline">{isUploading ? 'Syncing' : 'Upload GCS'}</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleGCSUpload} />

            <button className="w-16 bg-[#f4f7f9] dark:bg-black/20 border border-transparent hover:border-brand-blue/20 rounded-2xl flex items-center justify-center text-slate-500 transition-all">
              <Filter size={22} />
            </button>
          </div>
        </motion.div>

        {/* --- GRID DISPLAY --- */}
        <div className="mt-16 space-y-20">
          {Object.keys(groupedAssets).length > 0 ? (
            /* Fix: Added explicit type cast to the mapping function parameters to ensure TS understands the structure of 'items' */
            (Object.entries(groupedAssets) as [string, GCSAssetMetadata[]][]).map(([label, items]) => (
              <div key={label} className="space-y-10">
                <div className="flex items-center gap-6">
                   <div className="bg-brand-blue/10 p-2.5 rounded-xl text-brand-blue">
                     <Calendar size={20} />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">
                     {label} <span className="ml-3 text-slate-300 dark:text-gray-700 font-bold">({items.length})</span>
                   </h3>
                   <div className="h-px flex-grow bg-slate-100 dark:bg-white/5"></div>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="break-inside-avoid relative rounded-[2.5rem] overflow-hidden border-2 border-transparent bg-white dark:bg-[#0d0d0f] shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                    >
                       <img src={item.url} className="w-full h-auto object-cover transition-all duration-[3s] group-hover:scale-110" alt="" />
                       
                       <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2.5 z-20">
                          <div className="px-3.5 py-1.5 bg-brand-blue text-white text-[9px] font-black uppercase rounded-full shadow-lg">
                            {item.id.startsWith('gen') ? 'AI_GENERATED' : 'UPLINK_OBJECT'}
                          </div>
                          <div className="px-3.5 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md text-slate-800 dark:text-white text-[9px] font-black rounded-full shadow-lg flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            {item.bucket}
                          </div>
                       </div>

                       <div className="absolute bottom-16 left-6 flex flex-wrap gap-2 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          {[item.size, item.type.split('/')[1].toUpperCase()].map(tag => (
                            <div key={tag} className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-lg border border-white/10">
                               {tag}
                            </div>
                          ))}
                          <div className="px-3 py-1 bg-emerald-600/60 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-lg border border-white/10 flex items-center gap-2">
                             <LinkIcon size={10} /> Cloud Link Verified
                          </div>
                       </div>

                       <div className="absolute top-6 right-6 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-30">
                          <button 
                            onClick={(e) => { e.stopPropagation(); window.open(item.url); }}
                            className="p-3.5 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl text-slate-600 dark:text-white hover:text-brand-blue transition-all"
                          >
                             <Download size={18}/>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteAsset(item.id); }}
                            className="p-3.5 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl text-slate-600 dark:text-white hover:text-red-500 transition-all"
                          >
                             <Trash2 size={18}/>
                          </button>
                       </div>
                       
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-48 text-center flex flex-col items-center justify-center space-y-8 opacity-20 italic">
               <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center">
                  <FileSearch size={48} />
               </div>
               <div className="space-y-2">
                 <p className="text-xl font-black uppercase tracking-[0.5em]">Registry Empty</p>
                 <p className="text-sm font-bold uppercase tracking-widest">Sử dụng thanh công cụ bên dưới hoặc nút Upload để bắt đầu.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* --- FLOATING BOTTOM PROMPT HUB --- */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-[200]">
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="bg-white dark:bg-[#1a1a1e] border border-black/5 dark:border-white/10 rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-3 flex items-center gap-4 transition-all hover:scale-[1.01]"
        >
          <div className="flex-grow relative flex items-center">
            <input 
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSynthesize()}
              placeholder="Mô tả hình ảnh bạn muốn tạo và lưu vào GCS..."
              className="w-full bg-transparent border-none py-5 pl-8 pr-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-700 outline-none"
            />
          </div>

          <div className="flex items-center gap-4 pr-3">
            <div className="bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 px-5 py-2.5 rounded-full flex items-center gap-3">
               <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-sm">
                 <Zap size={10} fill="currentColor" />
               </div>
               <span className="text-sm font-black text-yellow-600 dark:text-yellow-500">{credits.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleSynthesize}
              disabled={isGenerating || !prompt.trim()}
              className="w-14 h-14 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-2xl shadow-brand-blue/30 hover:scale-110 active:scale-95 disabled:opacity-20"
            >
               {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default ImageLibraryPage;
