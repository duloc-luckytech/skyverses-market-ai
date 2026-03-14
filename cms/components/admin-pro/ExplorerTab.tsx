
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added CheckCircle2 to the imports
import { 
  Search, Plus, Trash2, Edit3, 
  Loader2, RefreshCw,
  X, Save, Database, Check,
  Ban, Activity, Cloud, HardDrive, CloudUpload,
  CheckCircle2
} from 'lucide-react';
import { useExplorerLogic } from '../../hooks/admin-pro/useExplorerLogic';

export const ExplorerTab: React.FC = () => {
  const {
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    showLocal,
    setShowLocal,
    editingItem,
    setEditingItem,
    isSaving,
    isActioning,
    filteredItems,
    fetchItems,
    handleDelete,
    handleApprove,
    handleReject,
    handleSave,
    handleSyncLocal,
    initNewItem,
    isSynced
  } = useExplorerLogic();

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-700">
      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white dark:bg-[#08080a] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-6 flex-grow">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề, tác giả..." 
              className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:border-brand-blue outline-none transition-all"
            />
          </div>
          
          {/* REGISTRY SWITCHER */}
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 shrink-0">
             <button 
               onClick={() => setShowLocal(false)}
               className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${!showLocal ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
             >
               <Cloud size={14} /> Cloud Registry
             </button>
             <button 
               onClick={() => setShowLocal(true)}
               className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showLocal ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
             >
               <HardDrive size={14} /> Local Samples
             </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10">
              {['all', 'image', 'video', 'prompt', 'game_asset'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                  {f === 'all' ? 'Tất cả' : f.replace('_', ' ')}
                </button>
              ))}
           </div>
           <button 
            onClick={fetchItems} 
            className="p-3 text-gray-400 hover:text-brand-blue transition-colors"
           >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <button 
            onClick={initNewItem}
            className="p-3 bg-brand-blue text-white rounded-lg hover:scale-105 transition-all shadow-lg"
           >
             <Plus size={18} />
           </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {loading && !showLocal ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing_Explorer_Grid...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           <AnimatePresence mode="popLayout">
             {filteredItems.map((item) => {
               const itemId = item._id || item.id || item.title;
               const isProcessing = isActioning === itemId || isActioning === item.title;
               const alreadyInCloud = isSynced(item.title);
               
               return (
               <motion.div 
                 key={itemId}
                 layout
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className={`group relative bg-white dark:bg-[#111114] border rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all ${
                   showLocal ? 'border-black/5 dark:border-white/5' : 'hover:border-brand-blue/30 border-black/5 dark:border-white/10'
                 }`}
               >
                  <div className="aspect-[4/3] bg-black relative overflow-hidden">
                     <img src={item.thumbnailUrl || item.url || item.mediaUrl} className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isProcessing ? 'blur-sm opacity-50' : 'grayscale group-hover:grayscale-0'}`} alt="" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                     
                     <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase border border-white/10 w-fit">{item.type}</span>
                        {!showLocal ? (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase italic w-fit ${
                            item.status === 'approved' ? 'bg-emerald-500 text-white' : 
                            item.status === 'rejected' ? 'bg-amber-600 text-white' : 
                            'bg-slate-400 text-white'
                          }`}>
                            {item.status || 'pending'}
                          </span>
                        ) : (
                          alreadyInCloud ? (
                            <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase italic shadow-lg">
                               <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-white">Already in Cloud Repository</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-orange-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase italic shadow-lg">
                               <Activity size={10} /> Local_Only
                            </div>
                          )
                        )}
                     </div>

                     <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                        {isProcessing ? (
                          <Loader2 className="animate-spin text-white" size={32} />
                        ) : showLocal ? (
                          alreadyInCloud ? (
                            <div className="text-center space-y-2 px-8">
                               <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-white">Already in Cloud Repository</p>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleSyncLocal(item)}
                              className="bg-brand-blue text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_15px_40px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                               <CloudUpload size={18} /> Sync to Cloud
                            </button>
                          )
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApprove(itemId)}
                                className="p-3 bg-emerald-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                                title="Approve"
                              >
                                <Check size={18} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={() => handleReject(itemId)}
                                className="p-3 bg-amber-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                                title="Reject"
                              >
                                <Ban size={18} strokeWidth={3} />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setEditingItem(item)}
                                className="p-3 bg-brand-blue text-white rounded-full hover:scale-110 transition-transform"
                                title="Edit"
                              >
                                <Edit3 size={18}/>
                              </button>
                              <button 
                                onClick={() => handleDelete(itemId)}
                                className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                                title="Delete"
                              >
                                <Trash2 size={18}/>
                              </button>
                            </div>
                          </>
                        )}
                     </div>
                  </div>

                  <div className="p-6 space-y-4">
                     <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white truncate">"{item.title}"</h4>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">@{item.authorName || item.authorHandle || item.author || 'Skyverses'}</p>
                     </div>

                     <div className="pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-gray-400 text-[8px] font-black uppercase">
                           <Activity size={10} />
                           <span>{item.engine || item.model || 'native'}</span>
                        </div>
                        <div className="flex gap-1">
                           {(item.tags || []).slice(0, 2).map((tag: string) => (
                             <span key={tag} className="text-[7px] font-bold text-gray-400 border border-black/5 dark:border-white/10 px-1.5 py-0.5 rounded uppercase">#{tag}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               </motion.div>
             )})}
           </AnimatePresence>

           {!showLocal && (
             <button 
                onClick={initNewItem}
                className="aspect-[4/3] border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-brand-blue hover:border-brand-blue transition-all group bg-black/[0.01] dark:bg-white/[0.01]"
              >
                <div className="p-4 bg-black/5 dark:bg-white/5 rounded-full group-hover:scale-110 transition-transform"><Plus size={32}/></div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">Register Showcase</span>
             </button>
           )}
        </div>
      )}

      {/* EDIT/ADD DRAWER */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingItem(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                <div className="flex items-center gap-4">
                  <Database className="text-brand-blue" size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tight italic">
                    {editingItem._id || editingItem.id ? 'Edit Media Intel' : 'Register New Media'}
                  </h3>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Tiêu đề *</label>
                    <input 
                      value={editingItem.title || ''}
                      onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-blue text-black dark:text-white"
                      placeholder="VD: Cyber Ronin Ritual"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Phân loại *</label>
                    <select 
                      value={editingItem.type || 'video'}
                      onChange={e => setEditingItem({...editingItem, type: e.target.value as any})}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-blue text-black dark:text-white"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="prompt">Prompt Logic</option>
                      <option value="game_asset">Game Asset</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Mô tả (Description)</label>
                  <textarea 
                    value={editingItem.description || ''}
                    onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-brand-blue text-black dark:text-white resize-none"
                    placeholder="Mô tả ngắn về tác phẩm..."
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-blue">Media_Endpoints</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Thumbnail URL *</label>
                      <input 
                        value={editingItem.thumbnailUrl || ''}
                        onChange={e => setEditingItem({...editingItem, thumbnailUrl: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-brand-blue text-black dark:text-white"
                        placeholder="Link ảnh xem trước..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Media URL * (Gốc)</label>
                      <input 
                        value={editingItem.mediaUrl || ''}
                        onChange={e => setEditingItem({...editingItem, mediaUrl: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-brand-blue text-black dark:text-white"
                        placeholder="Link media gốc (Image/Video)..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-blue">System_Manifest</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Engine</label>
                      <input 
                        value={editingItem.engine || ''}
                        onChange={e => setEditingItem({...editingItem, engine: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-blue text-black dark:text-white"
                        placeholder="VD: gommo, fxlab..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 italic">Model Key</label>
                      <input 
                        value={editingItem.modelKey || ''}
                        onChange={e => setEditingItem({...editingItem, modelKey: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-blue text-black dark:text-white"
                        placeholder="VD: veo_3_1..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex gap-4 shrink-0">
                <button 
                  onClick={() => setEditingItem(null)}
                  className="flex-grow py-4 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-grow py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Xác nhận & Đồng bộ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
