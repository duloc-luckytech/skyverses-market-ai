
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SelectedItemsProps {
  s: any;
  categoryData: Record<string, any[]>;
}

export const SelectedItems: React.FC<SelectedItemsProps> = ({ s, categoryData }) => {
  // Danh sách các key thuộc tính lẻ (không bao gồm selectedOutfit)
  const individualKeys = [
    'selectedOuterwear', 
    'selectedTops', 
    'selectedSets', 
    'selectedBottom', 
    'selectedSocks', 
    'selectedShoes', 
    'selectedAccessories'
  ];

  // Theo yêu cầu: 
  // 1. Nếu chọn TRANG PHỤC (selectedOutfit) thì ẩn khu vực này.
  // 2. Nếu chọn các Thuộc tính lẻ thì mới hiện khu vực này.
  // Vì hook useAIStylist đã tự động set null cho các thuộc tính lẻ khi chọn Outfit 
  // và ngược lại, nên ta chỉ cần kiểm tra xem có món đồ lẻ nào đang được chọn hay không.
  const hasIndividualSelection = individualKeys.some(key => (s as any)[key]);

  return (
    <AnimatePresence>
      {hasIndividualSelection && (
        <motion.div 
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          className="px-5 overflow-hidden shrink-0"
        >
          <div className="bg-slate-100 dark:bg-[#161618] border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6 shadow-sm dark:shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-slate-500 dark:text-gray-400">Selected items</span>
              <button className="text-[10px] font-black uppercase bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 rounded-xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                Save as Outfit
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {individualKeys.map(key => {
                const val = (s as any)[key];
                if (!val) return null;
                const url = categoryData[key]?.find(i => i.id === val)?.url;
                return (
                  <div key={key} className="w-20 h-20 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-[#222] relative group">
                    <img src={url} className="w-full h-full object-cover" alt="Selected Item" />
                    <button 
                      onClick={() => s.setSelectedItem(key, null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X size={18} className="text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
