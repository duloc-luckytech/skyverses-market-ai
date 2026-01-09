
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, User, Upload, Folder, Check, Trash2 } from 'lucide-react';
import { ReferenceAsset, AssetType } from '../../hooks/useStoryboardStudio';

interface CharacterEditModalProps {
  asset: ReferenceAsset;
  onClose: () => void;
  onSave: (asset: ReferenceAsset) => void;
  onDelete: (id: string) => void;
  updateAsset: (updates: Partial<ReferenceAsset>) => void;
}

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({ 
  asset, onClose, onSave, onDelete, updateAsset 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => updateAsset({ url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden shadow-3xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <User size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-white leading-none">Chỉnh sửa tham chiếu</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar max-h-[70vh]">
          {/* HÌNH ẢNH */}
          <div className="flex items-start gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 aspect-square bg-[#0c0c0e] rounded-xl flex items-center justify-center border border-white/5 cursor-pointer hover:border-emerald-500/40 transition-all overflow-hidden relative group"
            >
              {asset.url ? (
                <img src={asset.url} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-700" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload size={20} className="text-white" />
              </div>
            </div>
            
            <div className="space-y-3 flex-grow">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">HÌNH ẢNH</label>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25272b] hover:bg-[#2d2f35] rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-blue border border-brand-blue/20 transition-all"
                >
                  <Upload size={14} /> Tải lên
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25272b] hover:bg-[#2d2f35] rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5 transition-all">
                  <Folder size={14} /> Chọn từ Album
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
          </div>

          {/* TÊN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">TÊN</label>
            <input 
              value={asset.name}
              onChange={(e) => updateAsset({ name: e.target.value })}
              className="w-full bg-[#0c0c0e] border border-white/5 p-4 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all text-white"
              placeholder="Nhân vật mới"
            />
          </div>

          {/* LOẠI */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">LOẠI</label>
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl w-fit">
              {[
                { id: 'CHARACTER', label: 'Nhân vật' },
                { id: 'LOCATION', label: 'Địa điểm' },
                { id: 'OBJECT', label: 'Đối tượng' }
              ].map(type => (
                <button 
                  key={type.id}
                  onClick={() => updateAsset({ type: type.id as AssetType })}
                  className={`px-6 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${asset.type === type.id ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* MÔ TẢ */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">MÔ TẢ</label>
            <textarea 
              value={asset.description}
              onChange={(e) => updateAsset({ description: e.target.value })}
              className="w-full h-24 bg-[#0c0c0e] border border-white/5 p-4 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 transition-all text-white resize-none"
              placeholder="Mô tả chi tiết về nhân vật/đối tượng..."
            />
          </div>

          {/* PROMPT TẠO ẢNH */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">PROMPT TẠO ẢNH (TÙY CHỌN)</label>
            <textarea 
              value={asset.designPrompt}
              onChange={(e) => updateAsset({ designPrompt: e.target.value })}
              className="w-full h-32 bg-[#0c0c0e] border border-white/5 p-5 rounded-xl text-[13px] font-mono text-gray-400 leading-relaxed outline-none focus:border-emerald-500 transition-all resize-none italic"
              placeholder="Design sheet of..."
            />
            <p className="text-[9px] text-gray-600 font-bold uppercase italic mt-1">Để trống để sử dụng prompt mặc định dựa trên tên và mô tả</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/20 shrink-0">
          <button 
            onClick={() => onDelete(asset.id)}
            className="text-[12px] font-black uppercase text-red-500 hover:brightness-125 transition-all"
          >
            Xóa
          </button>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-[12px] font-black uppercase text-gray-400 hover:text-white transition-all"
            >
              Hủy
            </button>
            <button 
              onClick={() => onSave(asset)}
              className="px-8 py-2.5 bg-[#00a870] text-white rounded-xl text-[12px] font-black uppercase flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-900/20"
            >
              <Check size={18} strokeWidth={4} /> Lưu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
