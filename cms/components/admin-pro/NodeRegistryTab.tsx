
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudUpload, Check, Eye, EyeOff, Edit3, Trash2, Zap, Monitor,
  Video, Braces, Terminal, Star, Globe, ShieldCheck,
  Search, ArrowUpDown, Flame, ChevronUp, ChevronDown, Filter,
  LayoutGrid, List, GripVertical, Sparkles, Tag
} from 'lucide-react';
import { Solution } from '../../types';
import { marketApi } from '../../apis/market';
import { useToast } from '../../context/ToastContext';

interface NodeRegistryTabProps {
  solutions: Array<Solution>;
  isSyncedOnCloud: (slug: string) => boolean;
  onEdit: (sol: Solution) => void;
  onDelete: (sol: Solution) => void;
  onToggleActive: (sol: Solution) => void;
  onUpdateHomeBlocks: (sol: Solution, newBlocks: string[]) => void;
  activeTab: 'CLOUD' | 'LOCAL';
  viewMode?: 'CARD' | 'LIST';
  onRefresh?: () => void;
}

const HOME_BLOCK_OPTIONS = [
  { key: 'top_trending', label: '🔥 Top Trending', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { key: 'video_studio', label: '🎬 Video Studio', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { key: 'image_studio', label: '🖼️ Image Studio', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
  { key: 'ai_agents', label: '🤖 AI Agents', color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20' },
  { key: 'festivals', label: '🎉 Festivals', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { key: 'others', label: '📦 Others', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
];

export const NodeRegistryTab: React.FC<NodeRegistryTabProps> = ({
  solutions, isSyncedOnCloud, onEdit, onDelete, onToggleActive, onUpdateHomeBlocks, activeTab, onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'category' | 'credits'>('order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterBlock, setFilterBlock] = useState('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARD'>('TABLE');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [orderValue, setOrderValue] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(solutions.map(s => s.category.en).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [solutions]);

  // Filter & sort
  const filteredSolutions = useMemo(() => {
    let result = [...solutions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.en.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.category.en.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'ALL') result = result.filter(s => s.category.en === filterCategory);
    if (filterBlock !== 'ALL') result = result.filter(s => s.homeBlocks?.includes(filterBlock));

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'order') cmp = (a.order || 999) - (b.order || 999);
      else if (sortBy === 'name') cmp = a.name.en.localeCompare(b.name.en);
      else if (sortBy === 'category') cmp = a.category.en.localeCompare(b.category.en);
      else if (sortBy === 'credits') cmp = (a.priceCredits || 0) - (b.priceCredits || 0);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [solutions, searchQuery, filterCategory, filterBlock, sortBy, sortDir]);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleSaveOrder = async (sol: Solution, newOrder: number) => {
    const targetId = sol._id || sol.id;
    setSavingId(targetId);
    try {
      await marketApi.updateSolution(targetId, { order: newOrder });
      showToast(`Thứ tự ${sol.name.en} → #${newOrder}`, 'success');
      onRefresh?.();
    } catch (e) { showToast('Lỗi cập nhật thứ tự', 'error'); }
    finally { setSavingId(null); setEditingOrder(null); }
  };

  const handleToggleFeatured = async (sol: Solution) => {
    const targetId = sol._id || sol.id;
    setSavingId(targetId);
    try {
      await marketApi.updateSolution(targetId, { featured: !sol.featured });
      showToast(`${sol.name.en} → ${!sol.featured ? '⭐ Featured' : 'Unfeatured'}`, 'success');
      onRefresh?.();
    } catch (e) { showToast('Lỗi cập nhật featured', 'error'); }
    finally { setSavingId(null); }
  };

  const handleToggleBlock = async (sol: Solution, blockKey: string) => {
    const current = sol.homeBlocks || [];
    const newBlocks = current.includes(blockKey) ? current.filter(b => b !== blockKey) : [...current, blockKey];
    onUpdateHomeBlocks(sol, newBlocks);
  };

  const getDemoIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={13} />;
      case 'image': return <Monitor size={13} />;
      case 'automation': return <Braces size={13} />;
      default: return <Terminal size={13} />;
    }
  };

  const stats = useMemo(() => ({
    total: solutions.length,
    active: solutions.filter(s => s.isActive).length,
    featured: solutions.filter(s => s.featured).length,
    free: solutions.filter(s => s.isFree).length,
  }), [solutions]);

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp size={8} className={sortBy === col && sortDir === 'asc' ? 'text-brand-blue' : 'text-gray-300 dark:text-gray-700'} />
      <ChevronDown size={8} className={sortBy === col && sortDir === 'desc' ? 'text-brand-blue' : 'text-gray-300 dark:text-gray-700'} />
    </span>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      {/* ═══ Stats Bar ═══ */}
      <div className="shrink-0 px-8 py-5 border-b border-black/[0.04] dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.01]">
        <div className="flex items-center gap-6">
          {[
            { label: 'Tổng SP', value: stats.total, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
            { label: 'Active', value: stats.active, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Featured', value: stats.featured, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Free', value: stats.free, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`px-2 py-1 ${s.bg} rounded-md`}>
                <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Filter Toolbar ═══ */}
      <div className="shrink-0 px-8 py-4 border-b border-black/[0.04] dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.01]">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full pl-9 pr-4 py-2 text-[12px] font-medium bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 transition-colors"
            />
          </div>

          {/* Category filter */}
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-[11px] font-bold bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none text-slate-600 dark:text-gray-300">
            {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? '🏷️ Tất cả danh mục' : c}</option>)}
          </select>

          {/* Block filter */}
          <select value={filterBlock} onChange={e => setFilterBlock(e.target.value)}
            className="px-3 py-2 text-[11px] font-bold bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none text-slate-600 dark:text-gray-300">
            <option value="ALL">📍 Tất cả vị trí</option>
            {HOME_BLOCK_OPTIONS.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] rounded-lg p-0.5 ml-auto">
            <button onClick={() => setViewMode('TABLE')} className={`p-1.5 rounded-md transition-all ${viewMode === 'TABLE' ? 'bg-white dark:bg-white/10 shadow-sm text-brand-blue' : 'text-slate-400'}`}>
              <List size={14} />
            </button>
            <button onClick={() => setViewMode('CARD')} className={`p-1.5 rounded-md transition-all ${viewMode === 'CARD' ? 'bg-white dark:bg-white/10 shadow-sm text-brand-blue' : 'text-slate-400'}`}>
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Content ═══ */}
      <div className="flex-grow overflow-y-auto no-scrollbar">
        {viewMode === 'TABLE' ? (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/90 dark:bg-[#0a0a0c]/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 w-[50px] text-center cursor-pointer select-none" onClick={() => handleSort('order')}>
                  <div className="flex items-center justify-center gap-0.5">#<SortIcon col="order" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-0.5">Sản phẩm<SortIcon col="name" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-0.5">Danh mục<SortIcon col="category" /></div>
                </th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3">Vị trí hiển thị</th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('credits')}>
                  <div className="flex items-center gap-0.5">Credits<SortIcon col="credits" /></div>
                </th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
              {filteredSolutions.map((sol) => {
                const targetId = sol._id || sol.id;
                const synced = isSyncedOnCloud(sol.slug);
                const isEdOrder = editingOrder === targetId;

                return (
                  <tr key={targetId} className={`group hover:bg-brand-blue/[0.02] dark:hover:bg-brand-blue/[0.03] transition-colors ${!sol.isActive ? 'opacity-50' : ''}`}>
                    {/* Order */}
                    <td className="px-4 py-3 text-center">
                      {isEdOrder ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={orderValue} onChange={e => setOrderValue(Number(e.target.value))}
                            className="w-12 px-1 py-0.5 text-[11px] text-center bg-white dark:bg-white/5 border border-brand-blue/30 rounded focus:outline-none font-bold"
                            autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveOrder(sol, orderValue)} />
                          <button onClick={() => handleSaveOrder(sol, orderValue)} className="p-0.5 text-emerald-500 hover:bg-emerald-500/10 rounded">
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingOrder(targetId); setOrderValue(sol.order || 0); }}
                          className="flex items-center gap-1 mx-auto text-[11px] font-bold text-slate-400 hover:text-brand-blue transition-colors group/order">
                          <GripVertical size={10} className="opacity-0 group-hover:opacity-100 group-hover/order:opacity-100" />
                          <span>{sol.order || '—'}</span>
                        </button>
                      )}
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0 relative">
                          <img src={sol.imageUrl} className="w-full h-full object-cover" alt="" />
                          {synced && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-tl-md flex items-center justify-center"><Check size={7} className="text-white" strokeWidth={3} /></div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{sol.name.en}</p>
                          <p className="text-[9px] font-mono text-slate-400 truncate">{sol.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">{sol.category.en}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {activeTab === 'CLOUD' ? (
                        <button onClick={() => onToggleActive(sol)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${sol.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-black/[0.06] dark:border-white/[0.06] hover:bg-slate-200'}`}>
                          {sol.isActive ? <><Eye size={10} /> Active</> : <><EyeOff size={10} /> Hidden</>}
                        </button>
                      ) : (
                        synced
                          ? <span className="text-[9px] font-bold text-emerald-500 flex items-center justify-center gap-1"><Check size={10} /> Synced</span>
                          : <span className="text-[9px] font-bold text-orange-400">Local</span>
                      )}
                    </td>

                    {/* Featured */}
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleFeatured(sol)}
                        disabled={savingId === targetId}
                        className={`p-1.5 rounded-lg border transition-all ${sol.featured
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 shadow-sm shadow-amber-500/10 hover:bg-amber-500 hover:text-white'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-300 dark:text-gray-600 hover:border-amber-500/30 hover:text-amber-500'}`}>
                        <Star size={14} fill={sol.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>

                    {/* Home Blocks */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {HOME_BLOCK_OPTIONS.map(block => {
                          const isActive = sol.homeBlocks?.includes(block.key);
                          return (
                            <button key={block.key} onClick={() => handleToggleBlock(sol, block.key)}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-all ${isActive
                                ? block.color + ' shadow-sm'
                                : 'bg-slate-50 dark:bg-white/[0.01] border-black/[0.03] dark:border-white/[0.03] text-slate-300 dark:text-gray-700 hover:opacity-80'}`}>
                              {block.label.split(' ')[0]} {block.key.split('_').pop()}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Credits */}
                    <td className="px-4 py-3">
                      {sol.isFree ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">FREE</span>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Zap size={10} fill="currentColor" />
                          <span className="text-[11px] font-bold">{sol.priceCredits || 0}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onEdit(sol)} className="p-2 bg-slate-100 dark:bg-white/[0.04] hover:bg-brand-blue hover:text-white rounded-lg transition-all text-slate-500 dark:text-gray-400">
                          <Edit3 size={13} />
                        </button>
                        {activeTab === 'CLOUD' && (
                          <button onClick={() => onDelete(sol)} className="p-2 bg-red-50 dark:bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* ═══ CARD VIEW ═══ */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSolutions.map((sol, idx) => {
              const targetId = sol._id || sol.id;
              const synced = isSyncedOnCloud(sol.slug);
              return (
                <motion.div key={targetId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                  className={`relative flex flex-col bg-white dark:bg-[#0c0c0e] border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ${!sol.isActive ? 'opacity-50 grayscale' : 'border-black/[0.05] dark:border-white/[0.05] hover:border-brand-blue/20'}`}>

                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-black">
                    <img src={sol.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {sol.order && <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold rounded-md border border-white/10">#{sol.order}</span>}
                      {sol.featured && <span className="px-2 py-0.5 bg-amber-500/90 text-white text-[8px] font-bold rounded-md flex items-center gap-1"><Star size={8} fill="currentColor" /> Featured</span>}
                      {sol.homeBlocks?.includes('top_trending') && <span className="px-2 py-0.5 bg-orange-500/90 text-white text-[8px] font-bold rounded-md flex items-center gap-1"><Flame size={8} /> Trending</span>}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button onClick={() => onToggleActive(sol)} className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${sol.isActive ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-black/40 border-white/10 text-white/60'}`}>
                        {sol.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <p className="text-[9px] font-bold text-brand-blue uppercase tracking-wider">{sol.category.en}</p>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{sol.name.en}</h4>
                    </div>

                    {synced && <div className="absolute bottom-3 right-3"><ShieldCheck size={14} className="text-emerald-400" /></div>}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 flex-grow">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{sol.description.en}</p>

                    {/* Home Blocks */}
                    <div className="flex flex-wrap gap-1">
                      {HOME_BLOCK_OPTIONS.map(block => {
                        const isActive = sol.homeBlocks?.includes(block.key);
                        return (
                          <button key={block.key} onClick={() => handleToggleBlock(sol, block.key)}
                            className={`px-1.5 py-0.5 rounded text-[7px] font-bold border transition-all ${isActive ? block.color : 'text-slate-300 dark:text-gray-700 border-transparent hover:border-slate-200 dark:hover:border-gray-700'}`}>
                            {block.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sol.isFree
                        ? <span className="text-[9px] font-bold text-emerald-500">FREE</span>
                        : <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold"><Zap size={9} fill="currentColor" />{sol.priceCredits} CR</span>}
                      <span className="text-slate-200 dark:text-gray-800">|</span>
                      <div className="flex items-center gap-1 text-slate-400 text-[9px]">{getDemoIcon(sol.demoType)} {sol.demoType}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleToggleFeatured(sol)} className={`p-1.5 rounded-md transition-all ${sol.featured ? 'text-amber-500' : 'text-slate-300 dark:text-gray-700 hover:text-amber-500'}`}>
                        <Star size={13} fill={sol.featured ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => onEdit(sol)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-all">
                        <Edit3 size={13} />
                      </button>
                      {activeTab === 'CLOUD' && (
                        <button onClick={() => onDelete(sol)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredSolutions.length === 0 && (
          <div className="py-20 text-center">
            <Search size={32} className="mx-auto text-slate-200 dark:text-gray-800 mb-4" />
            <p className="text-sm font-bold text-slate-400">Không tìm thấy sản phẩm nào</p>
            <p className="text-[11px] text-slate-300 dark:text-gray-600 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
