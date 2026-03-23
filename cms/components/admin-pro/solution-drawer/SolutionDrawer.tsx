
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Box, Fingerprint, Languages, Layout, Tag,
  Cpu, DollarSign, Zap, Loader2, Trash2, LayoutGrid,
  ToggleRight, ToggleLeft, ShieldCheck, Check,
  Flame, Video, ImageIcon, Bot, Gift, Eye,
  Star, Globe2, ChevronRight, Plus, Settings2, Palette
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

const TABS = [
  { id: 'identity', label: 'Định danh', icon: <Fingerprint size={14} /> },
  { id: 'content', label: 'Nội dung', icon: <Languages size={14} /> },
  { id: 'display', label: 'Hiển thị', icon: <Layout size={14} /> },
  { id: 'features', label: 'Tính năng', icon: <Cpu size={14} /> },
  { id: 'pricing', label: 'Thương mại', icon: <DollarSign size={14} /> },
];

interface SolutionDrawerProps {
  editingId: string | null;
  editedItem: any;
  setEditedItem: (item: any) => void;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SolutionDrawer: React.FC<SolutionDrawerProps> = ({
  editingId, editedItem, setEditedItem, isSaving, onClose, onSave
}) => {
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await systemConfigApi.getSystemConfig();
        if (res.success && res.data.marketHomeBlock) {
          setHomeBlocks(res.data.marketHomeBlock.sort((a, b) => a.order - b.order));
        }
      } catch (e) { console.error("Load home blocks failed", e); }
      finally { setLoadingConfig(false); }
    };
    loadConfig();
  }, []);

  const handleAddStringToList = (listKey: string, value: string) => {
    if (!value.trim()) return;
    setEditedItem({ ...editedItem, [listKey]: [...(editedItem[listKey] || []), value.trim()] });
  };

  const handleRemoveFromList = (listKey: string, index: number) => {
    const newList = [...(editedItem[listKey] || [])];
    newList.splice(index, 1);
    setEditedItem({ ...editedItem, [listKey]: newList });
  };

  const toggleHomeBlock = (blockId: string) => {
    const currentBlocks = editedItem.homeBlocks || [];
    const newBlocks = currentBlocks.includes(blockId)
      ? currentBlocks.filter((id: string) => id !== blockId)
      : [...currentBlocks, blockId];
    setEditedItem({ ...editedItem, homeBlocks: newBlocks });
  };

  const addFeature = () => {
    setEditedItem({
      ...editedItem,
      features: [...(editedItem.features || []), { en: '', vi: '', ko: '', ja: '' }]
    });
  };

  if (!editedItem) return null;

  const SectionTitle = ({ icon, title, color = 'text-brand-blue' }: { icon: React.ReactNode; title: string; color?: string }) => (
    <div className="flex items-center gap-2.5 mb-6">
      <div className={`w-8 h-8 rounded-lg ${color.replace('text-', 'bg-')}/10 flex items-center justify-center ${color}`}>{icon}</div>
      <h4 className="text-[12px] font-bold text-slate-900 dark:text-white">{title}</h4>
    </div>
  );

  const FieldLabel = ({ children }: { children: string }) => (
    <label className="block text-[10px] font-semibold text-slate-400 dark:text-gray-500 mb-1.5 tracking-wide">{children}</label>
  );

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#0a0a0c] h-full shadow-3xl flex flex-col border-l border-black/[0.06] dark:border-white/[0.06] text-slate-900 dark:text-white overflow-hidden">

        {/* ═══ Header ═══ */}
        <div className="shrink-0 px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {/* Preview thumbnail */}
            {editedItem.imageUrl ? (
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] bg-black shrink-0">
                <img src={editedItem.imageUrl} className="w-full h-full object-cover" alt="" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                <Box size={20} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {editedItem.name?.en || (editingId === 'NEW' ? 'Sản phẩm mới' : 'Chỉnh sửa sản phẩm')}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {editedItem.slug && <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{editedItem.slug}</span>}
                {editedItem.featured && <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Star size={8} fill="currentColor" /> Featured</span>}
                {editedItem.isActive === false && <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">Hidden</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        {/* ═══ Tab Navigation ═══ */}
        <div className="shrink-0 px-6 py-2 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-1 overflow-x-auto no-scrollbar bg-white dark:bg-[#0a0a0c]">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-blue/10 text-brand-blue'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Body ═══ */}
        <div className="flex-grow overflow-y-auto no-scrollbar">
          <div className="p-6 pb-28 space-y-6">
            <AnimatePresence mode="wait">
              {/* ─── IDENTITY TAB ─── */}
              {activeTab === 'identity' && (
                <motion.div key="identity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <SectionTitle icon={<Fingerprint size={16} />} title="Định danh sản phẩm" />

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Slug (đường dẫn duy nhất)</FieldLabel>
                        <input value={editedItem.slug} onChange={e => setEditedItem({...editedItem, slug: e.target.value})}
                          className="w-full px-3 py-2.5 text-[12px] font-mono bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 transition-colors" />
                      </div>
                      <div>
                        <FieldLabel>Phân hạng</FieldLabel>
                        <select value={editedItem.complexity} onChange={e => setEditedItem({...editedItem, complexity: e.target.value})}
                          className="w-full px-3 py-2.5 text-[12px] font-medium bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none text-slate-700 dark:text-gray-300">
                          <option value="Standard">Standard</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Thứ tự ưu tiên</FieldLabel>
                        <input type="number" value={editedItem.order || 0} onChange={e => setEditedItem({...editedItem, order: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2.5 text-[12px] font-bold bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30" />
                      </div>
                      <div>
                        <FieldLabel>Trạng thái</FieldLabel>
                        <input value={editedItem.status || 'active'} onChange={e => setEditedItem({...editedItem, status: e.target.value})}
                          className="w-full px-3 py-2.5 text-[12px] font-medium bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Demo Type</FieldLabel>
                        <select value={editedItem.demoType} onChange={e => setEditedItem({...editedItem, demoType: e.target.value})}
                          className="w-full px-3 py-2.5 text-[12px] font-medium bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none text-slate-700 dark:text-gray-300">
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="automation">Automation</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-4 w-full">
                          {/* Featured toggle */}
                          <button onClick={() => setEditedItem({...editedItem, featured: !editedItem.featured})}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[11px] font-semibold transition-all flex-1 justify-center ${
                              editedItem.featured
                                ? 'bg-amber-500/10 border-amber-500/25 text-amber-600'
                                : 'bg-slate-50 dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] text-slate-400'}`}>
                            <Star size={13} fill={editedItem.featured ? 'currentColor' : 'none'} />
                            Featured
                          </button>
                          {/* Active toggle */}
                          <button onClick={() => setEditedItem({...editedItem, isActive: !editedItem.isActive})}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[11px] font-semibold transition-all flex-1 justify-center ${
                              editedItem.isActive !== false
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600'
                                : 'bg-slate-50 dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] text-slate-400'}`}>
                            {editedItem.isActive !== false ? <Eye size={13} /> : <X size={13} />}
                            {editedItem.isActive !== false ? 'Active' : 'Hidden'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── CONTENT TAB ─── */}
              {activeTab === 'content' && (
                <motion.div key="content" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <SectionTitle icon={<Languages size={16} />} title="Nội dung đa ngôn ngữ" color="text-indigo-500" />

                  <div className="space-y-5">
                    {/* Names */}
                    <div className="p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
                      <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5"><Globe2 size={12} /> Tên sản phẩm</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { code: 'en', flag: '🇬🇧', label: 'English' },
                          { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
                          { code: 'ko', flag: '🇰🇷', label: '한국어' },
                          { code: 'ja', flag: '🇯🇵', label: '日本語' },
                        ].map(lang => (
                          <div key={lang.code}>
                            <label className="text-[9px] font-medium text-slate-400 mb-1 block">{lang.flag} {lang.label}</label>
                            <input value={editedItem.name[lang.code] || ''} onChange={e => setEditedItem({...editedItem, name: {...editedItem.name, [lang.code]: e.target.value}})}
                              className="w-full px-3 py-2 text-[12px] bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg focus:outline-none focus:border-brand-blue/30" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
                      <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5"><Tag size={12} /> Danh mục</p>
                      <div className="grid grid-cols-2 gap-3">
                        {['en', 'vi'].map(code => (
                          <div key={code}>
                            <label className="text-[9px] font-medium text-slate-400 mb-1 block">{code === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}</label>
                            <input value={editedItem.category[code] || ''} onChange={e => setEditedItem({...editedItem, category: {...editedItem.category, [code]: e.target.value}})}
                              className="w-full px-3 py-2 text-[12px] bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg focus:outline-none focus:border-brand-blue/30" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
                      <p className="text-[10px] font-semibold text-slate-500">📝 Mô tả sản phẩm</p>
                      {['en', 'vi'].map(code => (
                        <div key={code}>
                          <label className="text-[9px] font-medium text-slate-400 mb-1 block">{code === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}</label>
                          <textarea value={editedItem.description[code] || ''} onChange={e => setEditedItem({...editedItem, description: {...editedItem.description, [code]: e.target.value}})}
                            rows={3}
                            className="w-full px-3 py-2 text-[12px] bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg focus:outline-none focus:border-brand-blue/30 resize-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── DISPLAY TAB ─── */}
              {activeTab === 'display' && (
                <motion.div key="display" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <SectionTitle icon={<Palette size={16} />} title="Hình ảnh & Vị trí hiển thị" color="text-emerald-500" />

                  <div className="space-y-5">
                    {/* Image URL + Preview */}
                    <div>
                      <FieldLabel>URL ảnh bìa</FieldLabel>
                      <input value={editedItem.imageUrl} onChange={e => setEditedItem({...editedItem, imageUrl: e.target.value})}
                        className="w-full px-3 py-2.5 text-[12px] font-mono bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 mb-3" />
                      {editedItem.imageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] aspect-video bg-black">
                          <img src={editedItem.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <p className="text-[10px] font-bold text-white/60">Live preview</p>
                            <p className="text-sm font-bold text-white">{editedItem.name?.en || 'Product Name'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Home Blocks */}
                    <div className="p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
                      <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5"><LayoutGrid size={12} /> Vị trí hiển thị (Trang chủ)</p>
                      <div className="flex flex-wrap gap-2">
                        {loadingConfig ? (
                          <Loader2 size={16} className="animate-spin text-brand-blue" />
                        ) : (
                          homeBlocks.map(block => {
                            const isSelected = (editedItem.homeBlocks || []).includes(block.key);
                            const Icon = BLOCK_ICONS[block.key] || <LayoutGrid size={12} />;
                            return (
                              <button key={block.key} type="button" onClick={() => toggleHomeBlock(block.key)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all border ${
                                  isSelected
                                    ? 'bg-brand-blue/10 border-brand-blue/25 text-brand-blue shadow-sm'
                                    : 'bg-white dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-400 hover:border-brand-blue/20'
                                }`}>
                                {isSelected ? <Check size={12} strokeWidth={3} /> : Icon}
                                {block.title.en}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <EditArray label="Tags" listKey="tags" items={editedItem.tags || []} onAdd={handleAddStringToList} onRemove={handleRemoveFromList} icon={<Tag size={14}/>} />

                    {/* Models */}
                    <EditArray label="AI Models" listKey="models" items={editedItem.models || []} onAdd={handleAddStringToList} onRemove={handleRemoveFromList} icon={<Cpu size={14}/>} />
                  </div>
                </motion.div>
              )}

              {/* ─── FEATURES TAB ─── */}
              {activeTab === 'features' && (
                <motion.div key="features" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <SectionTitle icon={<Cpu size={16} />} title="Tính năng sản phẩm" color="text-purple-500" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-slate-400">{editedItem.features?.length || 0} tính năng</p>
                      <button onClick={addFeature} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-[11px] font-semibold hover:bg-brand-blue/20 transition-colors">
                        <Plus size={12} /> Thêm
                      </button>
                    </div>

                    {editedItem.features?.map((feat: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] rounded-xl relative group">
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <span className="text-[9px] font-bold text-slate-300">#{idx + 1}</span>
                          <button onClick={() => handleRemoveFromList('features', idx)}
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-500/5 rounded opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pr-12">
                          <div>
                            <label className="text-[9px] font-medium text-slate-400 mb-1 block">🇬🇧 EN</label>
                            <input value={feat.en || ''} onChange={e => {
                              const next = [...editedItem.features];
                              next[idx] = { ...next[idx], en: e.target.value };
                              setEditedItem({...editedItem, features: next});
                            }}
                              className="w-full px-3 py-2 text-[12px] bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg focus:outline-none focus:border-brand-blue/30" />
                          </div>
                          <div>
                            <label className="text-[9px] font-medium text-slate-400 mb-1 block">🇻🇳 VI</label>
                            <input value={feat.vi || ''} onChange={e => {
                              const next = [...editedItem.features];
                              next[idx] = { ...next[idx], vi: e.target.value };
                              setEditedItem({...editedItem, features: next});
                            }}
                              className="w-full px-3 py-2 text-[12px] bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg focus:outline-none focus:border-brand-blue/30" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!editedItem.features || editedItem.features.length === 0) && (
                      <div className="py-8 text-center border-2 border-dashed border-black/[0.06] dark:border-white/[0.06] rounded-xl">
                        <Cpu size={24} className="mx-auto text-slate-200 dark:text-gray-700 mb-2" />
                        <p className="text-[11px] text-slate-400">Chưa có tính năng nào</p>
                        <button onClick={addFeature} className="mt-2 text-[10px] font-semibold text-brand-blue hover:underline">+ Thêm tính năng</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── PRICING TAB ─── */}
              {activeTab === 'pricing' && (
                <motion.div key="pricing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <SectionTitle icon={<DollarSign size={16} />} title="Chính sách thương mại" color="text-amber-500" />

                  <div className="space-y-5">
                    {/* Free/Paid toggle */}
                    <div className="p-5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/[0.03] dark:to-orange-500/[0.03] border border-amber-500/15 rounded-xl">
                      <p className="text-[10px] font-semibold text-amber-600 mb-3">Hình thức truy cập</p>
                      <div className="flex bg-white dark:bg-black/30 p-1 rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
                        <button onClick={() => setEditedItem({...editedItem, isFree: true})}
                          className={`flex-1 py-2.5 rounded-md text-[11px] font-semibold transition-all ${editedItem.isFree ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                          Miễn phí
                        </button>
                        <button onClick={() => setEditedItem({...editedItem, isFree: false})}
                          className={`flex-1 py-2.5 rounded-md text-[11px] font-semibold transition-all ${!editedItem.isFree ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                          Trả phí (Credits)
                        </button>
                      </div>
                    </div>

                    {!editedItem.isFree && (
                      <div className="p-5 bg-slate-50/50 dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
                        <FieldLabel>Giá Credits mỗi lần sử dụng</FieldLabel>
                        <div className="flex items-center gap-2">
                          <Zap size={16} className="text-amber-500" fill="currentColor" />
                          <input type="number" value={editedItem.priceCredits || 0} onChange={e => setEditedItem({...editedItem, priceCredits: parseInt(e.target.value) || 0})}
                            className="w-32 px-3 py-2.5 text-xl font-bold bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 text-amber-600" />
                          <span className="text-[12px] font-medium text-slate-400">Credits</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <FieldLabel>Tham chiếu giá</FieldLabel>
                      <input value={editedItem.priceReference || ''} onChange={e => setEditedItem({...editedItem, priceReference: e.target.value})}
                        placeholder="VD: $0.05/image từ Stability AI"
                        className="w-full px-3 py-2.5 text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30" />
                    </div>

                    {/* Industries & Problems */}
                    <EditArray label="Ngành nghề ứng dụng" listKey="industries" items={editedItem.industries || []} onAdd={handleAddStringToList} onRemove={handleRemoveFromList} icon={<Globe2 size={14}/>} />
                    <EditArray label="Vấn đề giải quyết" listKey="problems" items={editedItem.problems || []} onAdd={handleAddStringToList} onRemove={handleRemoveFromList} icon={<Settings2 size={14}/>} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <div className="shrink-0 px-6 py-4 border-t border-black/[0.04] dark:border-white/[0.04] bg-slate-50/80 dark:bg-black/40 flex items-center justify-between gap-4">
          <button onClick={onClose} className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
            Huỷ
          </button>
          <button onClick={onSave} disabled={isSaving}
            className="flex-1 max-w-sm bg-brand-blue text-white py-3 rounded-xl text-[12px] font-bold shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isSaving ? 'Đang lưu...' : editingId === 'NEW' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
