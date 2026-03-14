import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, Plus, Trash2, Edit3, ChevronRight, 
  Settings2, Hash, Zap, Tag, GripVertical,
  X, Check, LayoutGrid, Activity, Info,
  FileDown, Loader2, ListTree, Layers,
  Save, AlertTriangle, ToggleLeft, ToggleRight,
  Database,
  // Fix: Added missing CheckCircle2 import
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../apis/config';

interface ISubCategory {
  code: string;
  name: string;
  services: string[];
}

interface ICategory {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  order: number;
  status: "active" | "inactive";
  subCategories: ISubCategory[];
}

export const MarketFiltersTab: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State cho Drawer
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [newServiceInput, setNewServiceInput] = useState<Record<number, string>>({});

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/category`, {
        headers: getHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleStatus = async (cat: ICategory) => {
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`${API_BASE_URL}/category/${cat._id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn vô hiệu hóa danh mục này?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/category/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setCategories(prev => prev.map(c => c._id === id ? { ...c, status: 'inactive' } : c));
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối khi vô hiệu hóa");
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    setIsSaving(true);
    try {
      const isNew = !editingCategory._id;
      const url = isNew ? `${API_BASE_URL}/category` : `${API_BASE_URL}/category/${editingCategory._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(editingCategory)
      });
      const result = await response.json();
      
      if (result.success) {
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubCategories = async () => {
    if (!editingCategory || !editingCategory._id) return;
    setIsUpdatingSub(true);
    try {
      const response = await fetch(`${API_BASE_URL}/category/${editingCategory._id}/sub`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ subCategories: editingCategory.subCategories })
      });
      const result = await response.json();
      if (result.success) {
        alert("Đã cập nhật danh mục con thành công");
        fetchCategories();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setIsUpdatingSub(false);
    }
  };

  const initNewCategory = () => {
    setEditingCategory({
      code: '',
      name: '',
      description: '',
      order: categories.length,
      status: 'active',
      subCategories: []
    });
  };

  const addSubCategory = () => {
    if (!editingCategory) return;
    const newSub: ISubCategory = {
      code: 'SUB_' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      name: 'New Sub Category',
      services: []
    };
    setEditingCategory({
      ...editingCategory,
      subCategories: [...editingCategory.subCategories, newSub]
    });
  };

  const addService = (subIdx: number) => {
    if (!editingCategory || !newServiceInput[subIdx]?.trim()) return;
    const updatedSub = [...editingCategory.subCategories];
    updatedSub[subIdx].services.push(newServiceInput[subIdx].trim());
    setEditingCategory({ ...editingCategory, subCategories: updatedSub });
    setNewServiceInput({ ...newServiceInput, [subIdx]: "" });
  };

  const handleExportExcel = () => {
    const headers = ["Category Code", "Category Name", "Status", "SubCategory Name", "Services/Tags"];
    const rows: string[][] = [];

    categories.forEach(cat => {
      if (cat.subCategories.length > 0) {
        cat.subCategories.forEach(sub => {
          rows.push([cat.code, cat.name, cat.status, sub.name, `"${sub.services.join(', ')}"`]);
        });
      } else {
        rows.push([cat.code, cat.name, cat.status, "N/A", "N/A"]);
      }
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `skyverses_filters_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColor = (code: string) => {
    const colors: Record<string, string> = {
      'ALL': '#0090ff',
      'GAMES': '#10b981',
      'ART_DESIGN': '#8b5cf6',
      'AI_TOOLS': '#f59e0b',
      'CASE_STUDIES': '#ef4444'
    };
    return colors[code] || '#6366f1';
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Syncing_Market_Schema...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-700 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Market Architecture Control</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registry Sync: {categories.length} Nodes</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleExportExcel} className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            <FileDown size={16} /> Export CSV
          </button>
          <button onClick={initNewCategory} className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all">
            <Plus size={16} /> Add Primary Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <motion.div 
            layout 
            key={cat._id} 
            className={`bg-white dark:bg-[#08080a] border rounded-[2.5rem] overflow-hidden shadow-xl group/card relative transition-all ${cat.status === 'inactive' ? 'opacity-60 grayscale border-red-500/20' : 'border-black/5 dark:border-white/5'}`}
          >
            <div className="p-8 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: getCategoryColor(cat.code) }}>
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{cat.name}</h4>
                    <p className="text-[8px] font-mono font-black text-gray-400 uppercase tracking-widest">{cat.code} • ORDER: {cat.order}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <button onClick={() => setEditingCategory(cat)} className="p-2 text-gray-400 hover:text-brand-blue transition-colors"><Edit3 size={16}/></button>
                  <button onClick={() => handleToggleStatus(cat)} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
                    {cat.status === 'active' ? <ToggleRight size={20} className="text-brand-blue" /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => handleDeactivate(cat._id!)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
               </div>
            </div>

            <div className="p-8 space-y-6">
               {cat.subCategories.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                    {cat.subCategories.map((sub) => (
                       <div key={sub.code} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-black/5 rounded-lg">
                          <span className="text-[10px] font-black uppercase text-slate-700 dark:text-gray-300">{sub.name}</span>
                          <span className="ml-2 text-[8px] text-brand-blue font-bold">({sub.services.length})</span>
                       </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-[10px] text-gray-500 italic">Chưa có danh mục con</p>
               )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* DRAWER CHỈNH SỬA */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10">
                <div className="p-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                   <div className="flex items-center gap-4">
                      <Settings2 className="text-brand-blue" size={24} />
                      <h3 className="text-xl font-black uppercase tracking-tight italic">{editingCategory._id ? 'Edit Category' : 'Create Category'}</h3>
                   </div>
                   <button onClick={() => setEditingCategory(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">
                   {/* Form Basic */}
                   <section className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue border-b border-brand-blue/20 pb-2">Primary_Matrix</h4>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Code (Unique) *</label>
                            <input value={editingCategory.code} onChange={e => setEditingCategory({...editingCategory, code: e.target.value.toUpperCase()})} className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 p-4 rounded-xl text-sm font-bold outline-none text-slate-900 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Tên danh mục *</label>
                            <input value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 p-4 rounded-xl text-sm font-bold outline-none text-slate-900 dark:text-white" />
                          </div>
                      </div>
                      <div className="flex justify-end pt-2">
                         <button onClick={handleSaveCategory} disabled={isSaving} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Lưu thông tin chính
                         </button>
                      </div>
                   </section>

                   {/* Sub Categories Manager */}
                   <div className="space-y-6 pt-6 border-t border-black/5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue border-b border-brand-blue/20 pb-2 flex-grow mr-6">Sub_Categories_Nodes</h4>
                        <button onClick={addSubCategory} className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all"><Plus size={16} /></button>
                      </div>

                      <div className="space-y-6">
                        {editingCategory.subCategories.map((sub, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 dark:bg-white/5 border border-black/5 rounded-2xl space-y-4 group/sub relative">
                            <div className="flex justify-between items-start">
                              <div className="flex-grow grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[8px] font-black uppercase text-gray-400">Display Name</label>
                                   <input value={sub.name} onChange={e => {
                                      const next = [...editingCategory.subCategories];
                                      next[idx].name = e.target.value;
                                      setEditingCategory({...editingCategory, subCategories: next});
                                   }} className="w-full bg-white dark:bg-black border-none p-2 text-[11px] font-black uppercase text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-blue rounded-md shadow-inner" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[8px] font-black uppercase text-gray-400">Unique Code</label>
                                   <input value={sub.code} onChange={e => {
                                      const next = [...editingCategory.subCategories];
                                      next[idx].code = e.target.value.toUpperCase();
                                      setEditingCategory({...editingCategory, subCategories: next});
                                   }} className="w-full bg-white dark:bg-black border-none p-2 text-[10px] font-mono text-slate-500 outline-none focus:ring-1 focus:ring-brand-blue rounded-md shadow-inner" />
                                </div>
                              </div>
                              <button onClick={() => {
                                const next = editingCategory.subCategories.filter((_, i) => i !== idx);
                                setEditingCategory({...editingCategory, subCategories: next});
                              }} className="p-2 text-gray-300 hover:text-red-500 transition-colors ml-2 opacity-0 group-hover/sub:opacity-100"><Trash2 size={16}/></button>
                            </div>

                            {/* Tags / Services */}
                            <div className="space-y-3">
                               <div className="flex flex-wrap gap-2">
                                  {sub.services.map((s, sidx) => (
                                    <span key={sidx} className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-black/40 border border-black/5 text-[9px] font-bold rounded-md shadow-sm">
                                      {s} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => {
                                        const next = [...editingCategory.subCategories];
                                        next[idx].services = next[idx].services.filter((_, i) => i !== sidx);
                                        setEditingCategory({...editingCategory, subCategories: next});
                                      }} />
                                    </span>
                                  ))}
                               </div>
                               <div className="flex gap-2">
                                  <input 
                                    value={newServiceInput[idx] || ""}
                                    onChange={e => setNewServiceInput({...newServiceInput, [idx]: e.target.value})}
                                    placeholder="Add service tag (e.g. 4K Upscale)..." 
                                    className="flex-grow bg-white dark:bg-black border border-black/5 p-2 px-4 rounded-lg text-[10px] outline-none shadow-inner italic"
                                    onKeyDown={e => e.key === 'Enter' && addService(idx)}
                                  />
                                  <button onClick={() => addService(idx)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:text-brand-blue transition-colors shadow-sm"><Plus size={14} /></button>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {editingCategory._id && editingCategory.subCategories.length > 0 && (
                        <div className="pt-4 flex justify-center">
                           <button 
                             onClick={handleUpdateSubCategories}
                             disabled={isUpdatingSub}
                             className="flex items-center gap-3 px-10 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                           >
                             {isUpdatingSub ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                             Cập nhật Sub-Registry
                           </button>
                        </div>
                      )}
                   </div>
                </div>

                <div className="p-8 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex gap-4 shrink-0 absolute bottom-0 left-0 right-0 z-50">
                  <button onClick={() => setEditingCategory(null)} className="flex-grow py-4 border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 transition-all text-slate-500">Cancel</button>
                  <button onClick={handleSaveCategory} disabled={isSaving} className="flex-grow py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Deploy Category
                  </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
