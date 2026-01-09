
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Edit3, Sparkles, Plus, Zap, Eye, EyeOff, Loader2, Crown, Star, Calendar, ArrowDown, Trash2 } from 'lucide-react';
import { CreditPackage } from '../../apis/credits';

interface CreditPacksTabProps {
  packs: CreditPackage[];
  onAddNew: () => void;
  onEdit: (pack: CreditPackage) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  togglingId: string | null;
}

export const CreditPacksTab: React.FC<CreditPacksTabProps> = ({ 
  packs, onAddNew, onEdit, onToggle, onDelete, loading, togglingId 
}) => {
  return (
    <div className="p-12">
      {loading && packs.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-6 opacity-40">
           <Loader2 className="animate-spin text-brand-blue" size={48} />
           <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing_Economic_Vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {packs.map(pack => (
            <div 
              key={pack._id} 
              className={`bg-[#fcfcfd] dark:bg-[#111114] border-2 p-10 rounded-[2.5rem] space-y-6 group transition-all shadow-sm relative ${pack.active ? 'border-black/5 dark:border-white/5 hover:border-brand-blue/30' : 'border-dashed border-red-500/20 opacity-60 grayscale'} ${pack.highlight ? 'ring-2 ring-brand-blue ring-offset-4 dark:ring-offset-black' : ''}`}
              style={pack.highlight ? { boxShadow: `0 0 40px ${pack.theme?.accentColor || '#0090ff'}15` } : {}}
            >
              {/* Ribbon Overlay */}
              {pack.ribbon?.text && (
                 <div 
                   className="absolute -top-3 -right-3 px-4 py-1.5 rounded-lg shadow-xl flex items-center gap-2 z-10 animate-bounce"
                   style={{ backgroundColor: pack.ribbon.color }}
                 >
                    <span className="text-[12px]">{pack.ribbon.icon}</span>
                    <span className="text-[10px] font-black uppercase text-black italic tracking-tighter">{pack.ribbon.text}</span>
                 </div>
              )}

              <div className="flex justify-between items-start">
                <div 
                  className={`p-4 rounded-2xl shadow-inner transition-transform group-hover:scale-110 ${pack.active ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}
                  style={pack.active ? { color: pack.theme?.accentColor, backgroundColor: `${pack.theme?.accentColor}10` } : {}}
                >
                  <Coins size={36} />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onToggle(pack._id)}
                    className={`p-2.5 rounded-lg transition-all ${pack.active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                  >
                    {togglingId === pack._id ? <Loader2 size={16} className="animate-spin" /> : pack.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => onEdit(pack)} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-lg transition-colors">
                    <Edit3 size={16}/>
                  </button>
                  <button 
                    onClick={() => onDelete(pack._id)}
                    className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{pack.name}</h3>
                   {pack.badge && (
                      <span className="px-2 py-0.5 bg-brand-blue text-white text-[7px] font-black uppercase rounded-full shadow-lg" style={{ backgroundColor: pack.theme?.accentColor }}>
                        {pack.badge}
                      </span>
                   )}
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                   <Calendar size={10} /> {pack.billingCycle} • {pack.billedMonths} mo
                </div>
              </div>

              <div className="py-6 border-y border-black/5 dark:border-white/5 flex justify-between items-baseline">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Sản lượng Credits</p>
                  <p className="text-5xl font-black italic text-brand-blue" style={{ color: pack.theme?.accentColor }}>
                    {pack.totalCredits?.toLocaleString() || pack.credits.toLocaleString()} 
                    <span className="text-xs not-italic opacity-50 ml-1">CR</span>
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Giá niêm yết</p>
                  <div className="flex flex-col items-end">
                    {pack.originalPrice && pack.originalPrice > pack.price && (
                      <span className="text-[10px] text-gray-400 line-through font-bold">{pack.originalPrice.toLocaleString()} {pack.currency}</span>
                    )}
                    <p className="text-xl font-black text-slate-800 dark:text-white">{pack.price.toLocaleString()} {pack.currency}</p>
                    {pack.discountPercent ? (
                      <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                        <ArrowDown size={10} /> {pack.discountPercent}% OFF
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3 min-h-[80px]">
                 <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                    <Zap size={12} fill="currentColor" /> {pack.credits.toLocaleString()} Gốc
                 </div>
                 {pack.bonusPercent > 0 && (
                   <div className="flex items-center gap-2 text-purple-500 text-[9px] font-black uppercase tracking-widest">
                      <Sparkles size={12} /> Thưởng thêm: {pack.bonusPercent}% (+{Math.floor(pack.credits * pack.bonusPercent / 100)} CR)
                   </div>
                 )}
                 {pack.bonusCredits > 0 && (
                    <div className="flex items-center gap-2 text-brand-blue text-[9px] font-black uppercase tracking-widest">
                       <Plus size={12} /> Cố định: +{pack.bonusCredits} CR
                    </div>
                 )}
              </div>

              <div className="pt-2 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-t border-black/5 dark:border-white/5 pt-4">
                <span>Vị trí: {pack.sortOrder}</span>
                <span className={pack.active ? 'text-emerald-500' : 'text-red-500'}>{pack.active ? 'OPERATIONAL' : 'DEPRECATED'}</span>
              </div>
            </div>
          ))}
          
          <button 
            onClick={onAddNew}
            className="aspect-square border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-gray-300 hover:text-brand-blue hover:border-brand-blue/30 transition-all group bg-black/[0.01] dark:bg-white/[0.01]"
          >
            <div className="p-6 bg-black/5 dark:bg-white/5 rounded-full group-hover:scale-110 transition-transform shadow-inner"><Plus size={48}/></div>
            <span className="text-xs font-black uppercase tracking-widest italic">Thêm gói nạp mới</span>
          </button>
        </div>
      )}
    </div>
  );
};
