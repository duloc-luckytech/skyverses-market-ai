
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Box, Fingerprint, Languages, Layout, Tag, 
  Cpu, DollarSign, Zap, Loader2, Trash2, LayoutGrid, 
  ToggleRight, ToggleLeft, ShieldCheck, Check,
  Flame, Video, ImageIcon, Bot, Gift
} from 'lucide-react';
import { EditInput } from './EditInput';
import { EditArray } from './EditArray';
import { systemConfigApi } from '../../../apis/config';
import { HomeBlock, Language } from '../../../types';

const BLOCK_ICONS: Record<string, any> = {
  top_trending: <Flame size={12}/>,
  video_studio: <Video size={12}/>,
  image_studio: <ImageIcon size={12}/>,
  ai_agents: <Bot size={12}/>,
  festivals: <Gift size={12}/>,
  others: <LayoutGrid size={12}/>
};

interface SolutionDrawerProps {
  editingId: string | null;
  editedItem: any;
  setEditedItem: (item: any) => void;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SolutionDrawer: React.FC<SolutionDrawerProps> = ({
  editingId,
  editedItem,
  setEditedItem,
  isSaving,
  onClose,
  onSave
}) => {
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await systemConfigApi.getSystemConfig();
        if (res.success && res.data.marketHomeBlock) {
          setHomeBlocks(res.data.marketHomeBlock.sort((a, b) => a.order - b.order));
        }
      } catch (e) {
        console.error("Load home blocks failed", e);
      } finally {
        setLoadingConfig(false);
      }
    };
    loadConfig();
  }, []);

  const handleAddStringToList = (listKey: string, value: string) => {
    if (!value.trim()) return;
    setEditedItem({
      ...editedItem,
      [listKey]: [...(editedItem[listKey] || []), value.trim()]
    });
  };

  const handleRemoveFromList = (listKey: string, index: number) => {
    const newList = [...(editedItem[listKey] || [])];
    newList.splice(index, 1);
    setEditedItem({ ...editedItem, [listKey]: newList });
  };

  const toggleHomeBlock = (blockId: string) => {
    const currentBlocks = editedItem.homeBlocks || [];
    const isSelected = currentBlocks.includes(blockId);
    
    let newBlocks;
    if (isSelected) {
      newBlocks = currentBlocks.filter((id: string) => id !== blockId);
    } else {
      newBlocks = [...currentBlocks, blockId];
    }
    
    setEditedItem({ ...editedItem, homeBlocks: newBlocks });
  };

  const addFeature = () => {
    setEditedItem({
      ...editedItem,
      features: [...(editedItem.features || []), { en: '', vi: '', ko: '', ja: '' }]
    });
  };

  if (!editedItem) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-4xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-2xl shadow-inner"><Box size={28} /></div>
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white leading-none">{editingId === 'NEW' ? 'Đăng ký giải pháp mới' : 'Chi tiết thông số giải pháp'}</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">MÃ_ĐỊNH_DANH: {editedItem.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><X size={32}/></button>
        </div>
        
        {/* Body */}
        <div className="flex-grow overflow-y-auto p-10 space-y-16 no-scrollbar pb-32">
          {/* Định danh */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-brand-blue pl-4">
              <Fingerprint size={20} className="text-brand-blue" />
              <h4 className="text-sm font-black uppercase tracking-[0.3em] italic">Giao thức định danh</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EditInput label="Đường dẫn sản phẩm (Slug - Duy nhất)" value={editedItem.slug} onChange={(v) => setEditedItem({...editedItem, slug: v})} />
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2 italic">Phân hạng mức độ (Complexity)</label>
                <select value={editedItem.complexity} onChange={e => setEditedItem({...editedItem, complexity: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-800 dark:text-white">
                  <option value="Standard">Tiêu chuẩn (Standard)</option>
                  <option value="Advanced">Nâng cao (Advanced)</option>
                  <option value="Enterprise">Doanh nghiệp (Enterprise)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <EditInput label="Trọng số hiển thị (Thứ tự)" type="number" value={String(editedItem.order)} onChange={(v) => setEditedItem({...editedItem, order: parseInt(v) || 0})} />
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2 italic">Trạng thái hệ thống</label>
                  <input value={editedItem.status} onChange={e => setEditedItem({...editedItem, status: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-xs font-black uppercase text-brand-blue outline-none shadow-inner" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5">
                <span className="text-[10px] font-black uppercase text-gray-500">Đặt làm sản phẩm nổi bật</span>
                <button onClick={() => setEditedItem({...editedItem, featured: !editedItem.featured})} className={`p-1 rounded-full transition-all ${editedItem.featured ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {editedItem.featured ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </div>
          </section>

          {/* Localization */}
          <section className="space-y-10">
            <div className="flex items-center gap-3 border-l-4 border-indigo-600 pl-4">
              <Languages size={20} className="text-indigo-600" />
              <h4 className="text-sm font-black uppercase tracking-[0.3em] italic">Cấu hình đa ngôn ngữ</h4>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <EditInput label="TIẾNG ANH (EN) *" value={editedItem.name.en} onChange={(v) => setEditedItem({...editedItem, name: {...editedItem.name, en: v}})} />
                <EditInput label="TIẾNG VIỆT (VI) *" value={editedItem.name.vi} onChange={(v) => setEditedItem({...editedItem, name: {...editedItem.name, vi: v}})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <EditInput label="DANH MỤC (EN) *" value={editedItem.category.en} onChange={(v) => setEditedItem({...editedItem, category: {...editedItem.category, en: v}})} />
                <EditInput label="DANH MỤC (VI) *" value={editedItem.category.vi} onChange={(v) => setEditedItem({...editedItem, category: {...editedItem.category, vi: v}})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['en', 'vi'].map(langCode => (
                  <div key={langCode} className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest px-2">{langCode === 'vi' ? 'TIẾNG VIỆT' : 'ENGLISH'}</label>
                    <textarea value={editedItem.description[langCode]} onChange={e => setEditedItem({...editedItem, description: {...editedItem.description, [langCode]: e.target.value}})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-xs font-medium text-slate-900 dark:text-white" rows={3} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Content & Tech */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-emerald-600 pl-4">
              <Layout size={20} className="text-emerald-600" />
              <h4 className="text-sm font-black uppercase tracking-[0.3em] italic">Hình ảnh & Phân loại kĩ thuật</h4>
            </div>
            <EditInput label="Đường dẫn ảnh bìa chính (URL) *" value={editedItem.imageUrl} onChange={(v) => setEditedItem({...editedItem, imageUrl: v})} />
            
            <div className="grid grid-cols-1 gap-10">
              {/* HOME BLOCKS SELECTOR FROM API */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <LayoutGrid size={16} className="text-brand-blue" />
                  <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest italic">Vị trí hiển thị (Trang chủ)</label>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-[1.5rem] shadow-inner">
                  {loadingConfig ? (
                    <Loader2 size={16} className="animate-spin text-brand-blue" />
                  ) : (
                    homeBlocks.map((block) => {
                      const isSelected = (editedItem.homeBlocks || []).includes(block.key);
                      const Icon = BLOCK_ICONS[block.key] || <LayoutGrid size={12} />;
                      return (
                        <button
                          key={block.key}
                          type="button"
                          onClick={() => toggleHomeBlock(block.key)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                            isSelected 
                              ? 'bg-brand-blue border-brand-blue text-white shadow-lg' 
                              : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500 hover:border-brand-blue/30'
                          }`}
                          title={block.subtitle.en}
                        >
                          {isSelected ? <Check size={12} strokeWidth={4} /> : React.cloneElement(Icon as React.ReactElement<any>, { size: 12 })}
                          {block.title.en}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <EditArray label="Thẻ từ khóa vận hành (Tags)" listKey="tags" items={editedItem.tags || []} onAdd={handleAddStringToList} onRemove={handleRemoveFromList} icon={<Tag size={14}/>} />
            </div>
          </section>

          {/* AI Stack */}
          <section className="space-y-12">
            <div className="flex items-center gap-3 border-l-4 border-purple-600 pl-4">
              <Cpu size={20} className="text-purple-600" />
              <h4 className="text-sm font-black uppercase tracking-[0.3em] italic">Kiến trúc kĩ thuật AI</h4>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Tính năng cốt lõi</label>
                <button onClick={addFeature} className="text-[9px] font-black text-brand-blue uppercase">+ Thêm</button>
              </div>
              {editedItem.features.map((feat: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/5 rounded-2xl relative group">
                  <div className="grid grid-cols-2 gap-4">
                    <EditInput label="EN" value={feat.en} onChange={(v) => {
                       const next = [...editedItem.features];
                       next[idx] = { ...next[idx], en: v };
                       setEditedItem({...editedItem, features: next});
                    }} />
                    <EditInput label="VI" value={feat.vi} onChange={(v) => {
                       const next = [...editedItem.features];
                       next[idx] = { ...next[idx], vi: v };
                       setEditedItem({...editedItem, features: next});
                    }} />
                  </div>
                  <button onClick={() => handleRemoveFromList('features', idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </section>

          {/* Kinh tế */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-4">
              <DollarSign size={20} className="text-orange-500" />
              <h4 className="text-sm font-black uppercase tracking-[0.3em] italic">Chính sách thương mại</h4>
            </div>
            <div className="p-10 bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-orange-400">Truy cập</label>
                  <div className="flex bg-black/5 p-1 rounded-xl">
                    <button onClick={() => setEditedItem({...editedItem, isFree: true})} className={`flex-grow py-2 rounded-lg text-[10px] font-black ${editedItem.isFree ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Miễn phí</button>
                    <button onClick={() => setEditedItem({...editedItem, isFree: false})} className={`flex-grow py-2 rounded-lg text-[10px] font-black ${!editedItem.isFree ? 'bg-orange-600 text-white' : 'text-gray-500'}`}>Trả phí</button>
                  </div>
                </div>
                {!editedItem.isFree && (
                  <EditInput label="Giá Credits" type="number" value={String(editedItem.priceCredits)} onChange={(v) => setEditedItem({...editedItem, priceCredits: parseInt(v) || 0})} />
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/60 flex justify-between items-center gap-10 shrink-0 transition-colors">
          <button onClick={onClose} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Hủy thay đổi</button>
          <button onClick={onSave} disabled={isSaving} className="flex-grow bg-brand-blue text-white py-6 rounded-2xl text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(0,144,255,0.3)] flex items-center justify-center gap-6 hover:brightness-110 active:scale-[0.98] transition-all">
            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} fill="currentColor"/>}
            {editingId ? 'CẬP NHẬT REGISTRY' : 'XÁC BẢN LÊN THỊ TRƯỜNG'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
