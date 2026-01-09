import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Download, Trash2, Search, 
  ImageIcon, Archive, 
  Upload, Loader2, Check,
  Calendar, AlertTriangle, RefreshCw,
  Edit3, Maximize2, Wand2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mediaApi, MediaListResponse } from '../apis/media';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { QuickImageGenModal } from './QuickImageGenModal';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (selected: GCSAssetMetadata[]) => void;
  onEdit?: (url: string) => void; 
  maxSelect?: number;
}

const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onEdit,
  maxSelect = 1 
}) => {
  const { credits, isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showQuickGen, setShowQuickGen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<GCSAssetMetadata[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res: MediaListResponse = await mediaApi.getMediaList({
        page: 1,
        limit: 100,
        search: searchQuery
      });
      if (res && res.data) {
        setAssets(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
      setErrorMessage("Không thể tải danh sách hình ảnh từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedAssets([]);
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchMedia();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const groupedAssets = useMemo<Record<string, any[]>>(() => {
    const groups: Record<string, any[]> = {};
    assets.forEach(asset => {
      const date = new Date(asset.createdAt);
      const today = new Date();
      let label = date.toLocaleDateString('vi-VN');

      if (date.toDateString() === today.toDateString()) {
        label = 'Hôm nay';
      } else {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
          label = 'Hôm qua';
        }
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(asset);
    });
    return groups;
  }, [assets]);

  const toggleSelect = (asset: any) => {
    if (!onConfirm) return;
    setSelectedAssets(prev => {
      const isAlreadySelected = prev.some(a => a.id === asset._id);
      if (isAlreadySelected) return prev.filter(a => a.id !== asset._id);
      
      const mappedAsset: GCSAssetMetadata = {
        id: asset._id,
        url: asset.imageUrl,
        name: asset.originalName || 'unnamed',
        size: '0 MB',
        type: 'image/png',
        blob: new Blob(), 
        timestamp: asset.createdAt,
        gcsPath: asset.imageUrl,
        bucket: asset.source || 'default'
      };

      if (maxSelect === 1) return [mappedAsset];
      if (prev.length >= maxSelect) return prev;
      return [...prev, mappedAsset];
    });
  };

  const handleConfirmSelection = () => {
    if (onConfirm && selectedAssets.length > 0) {
      onConfirm(selectedAssets);
      onClose();
    }
  };

  const handleGCSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      await uploadToGCS(file);
      await fetchMedia();
    } catch (error: any) {
      setErrorMessage(error.message || "Lỗi tải ảnh lên máy chủ");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xoá hình ảnh này khỏi thư viện?")) return;
    
    try {
      const res = await mediaApi.deleteMedia(id);
      if (res.success) {
        setAssets(prev => prev.filter(a => a._id !== id));
        setSelectedAssets(prev => prev.filter(a => a.id !== id));
      } else {
        alert("Không thể xoá hình ảnh này.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'download.png';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const handleEditClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(url);
    } else {
      console.log("Edit requested for:", url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full h-full max-w-7xl bg-[#fcfcfd] dark:bg-[#0c0c0e] border border-black/10 dark:border-white/10 flex flex-col md:rounded-2xl overflow-hidden z-10">
        <header className="px-4 py-4 md:px-8 md:py-6 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0e0e11] flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <Archive size={20} className="text-brand-blue md:w-6 md:h-6" />
            <div className="space-y-0.5">
              <h2 className="text-lg md:text-xl font-black uppercase italic text-slate-900 dark:text-white leading-none">Thư viện tài sản</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">Quản lý và chọn tài sản của bạn</p>
            </div>
            <button onClick={onClose} className="md:hidden ml-auto p-1.5 text-slate-400 hover:text-red-500 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
             <div className="relative group w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="Tìm tài sản..." 
                  className="bg-[#f4f7f9] dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full px-10 py-2.5 text-[11px] md:text-xs focus:ring-1 focus:ring-brand-blue outline-none text-slate-900 dark:text-white w-full shadow-inner" 
                />
             </div>
             
             <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setShowQuickGen(true)}
                  className="flex-grow md:flex-none bg-purple-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-purple-500/20"
                >
                    <Wand2 size={12} className="md:w-3.5 md:h-3.5" />
                    Tạo AI
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="flex-grow md:flex-none bg-brand-blue text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                >
                    {isUploading ? <Loader2 size={12} className="animate-spin md:w-3.5 md:h-3.5" /> : <Upload size={12} className="md:w-3.5 md:h-3.5" />}
                    Tải lên
                </button>
                <button onClick={onClose} className="hidden md:flex p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={28} /></button>
             </div>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-4 md:p-8 no-scrollbar bg-[#f8f9fb] dark:bg-[#020203]">
           {isLoading && assets.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                <RefreshCw size={48} className="animate-spin text-brand-blue" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Đang đồng bộ dữ liệu...</p>
             </div>
           ) : (assets.length > 0 || isUploading) ? (
             <div className="space-y-12">
               {isUploading && !groupedAssets['Hôm nay'] && (
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-4">
                       <Calendar size={16} className="text-brand-blue" />
                       <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white/80">Hôm nay</h3>
                       <div className="h-px flex-grow bg-black/5 dark:border-white/5"></div>
                    </div>
                    {/* Fixed to strictly 2 columns on desktop as well */}
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                      <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 animate-pulse flex flex-col items-center justify-center gap-3">
                         <Loader2 size={24} className="animate-spin text-brand-blue" />
                         <span className="text-[8px] font-black uppercase text-slate-400">Đang tải...</span>
                      </div>
                    </div>
                  </div>
               )}

               {(Object.entries(groupedAssets) as [string, any[]][]).map(([dateLabel, items]) => (
                 <div key={dateLabel} className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-4">
                       <Calendar size={16} className="text-brand-blue" />
                       <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white/80">{dateLabel}</h3>
                       <div className="h-px flex-grow bg-black/5 dark:border-white/5"></div>
                    </div>
                    {/* Fixed to strictly 2 columns on desktop as requested */}
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                       {dateLabel === 'Hôm nay' && isUploading && (
                          <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 animate-pulse flex flex-col items-center justify-center gap-3">
                             <Loader2 size={24} className="animate-spin text-brand-blue" />
                             <span className="text-[8px] font-black uppercase text-slate-400">Đang tải...</span>
                          </div>
                       )}
                       {items.map(item => {
                         const isSelected = selectedAssets.some(a => a.id === item._id);
                         return (
                           <motion.div 
                             layout
                             key={item._id} 
                             onClick={() => toggleSelect(item)} 
                             className={`relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${isSelected ? 'border-brand-blue shadow-2xl scale-[0.98]' : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-200 dark:hover:border-white/10 shadow-sm'}`}
                           >
                             <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                             
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 md:p-3">
                               <div className="flex justify-end gap-1.5 md:gap-2">
                                  <button 
                                    onClick={(e) => handleDownload(e, item.imageUrl, item.originalName)}
                                    className="p-1.5 bg-white/90 dark:bg-black/60 rounded-lg text-slate-700 dark:text-white hover:bg-brand-blue hover:text-white transition-all shadow-xl"
                                    title="Tải xuống"
                                  >
                                     <Download size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => handleEditClick(e, item.imageUrl)}
                                    className="p-1.5 bg-white/90 dark:bg-black/60 rounded-lg text-slate-700 dark:text-white hover:bg-brand-blue hover:text-white transition-all shadow-xl"
                                    title="Chỉnh sửa"
                                  >
                                     <Edit3 size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => handleDelete(e, item._id)}
                                    className="p-1.5 bg-red-500/90 rounded-lg text-white hover:bg-red-600 transition-all shadow-xl"
                                    title="Xoá"
                                  >
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                               
                               <div className="flex items-center gap-1.5 md:gap-2">
                                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue text-white' : 'bg-black/40 border-white/20'}`}>
                                    {isSelected && <Check size={12} strokeWidth={4} className="text-white md:w-3.5 md:h-3.5" />}
                                  </div>
                                  <p className="text-[7px] md:text-[8px] font-black text-white uppercase truncate tracking-widest flex-grow">{item.originalName || 'Untitled_Asset'}</p>
                               </div>
                             </div>

                             {isSelected && !isLoading && (
                               <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-brand-blue text-white rounded-full p-1 md:p-1.5 shadow-xl pointer-events-none">
                                 <Check size={12} strokeWidth={4} className="text-white md:w-3.5 md:h-3.5" />
                               </div>
                             )}
                           </motion.div>
                         );
                       })}
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 italic">
                <ImageIcon strokeWidth={1} className="w-20 h-20 md:w-[100px] md:h-[100px]" />
                <div className="space-y-2">
                  <p className="text-lg md:text-xl font-black uppercase tracking-[0.5em]">Kho ảnh trống</p>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Tải ảnh lên hoặc tạo ảnh mới để bắt đầu</p>
                </div>
             </div>
           )}
        </div>

        {errorMessage && (
          <div className="px-4 py-3 md:px-8 md:py-3 bg-red-500/10 border-t border-red-500/20 flex items-center gap-3 text-red-500">
            <AlertTriangle size={14} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{errorMessage}</span>
          </div>
        )}

        <div className="p-4 md:p-6 bg-white dark:bg-[#0d0d0f] border-t border-black/5 dark:border-white/10 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3 md:gap-4 order-2 md:order-1">
              <div className="flex -space-x-2 md:-space-x-3">
                 {selectedAssets.map((s) => (
                   <div key={s.id} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-[#0d0d0f] overflow-hidden shadow-lg">
                      <img src={s.url} className="w-full h-full object-cover" alt="" />
                   </div>
                 ))}
              </div>
              {selectedAssets.length > 0 && (
                <p className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 dark:text-gray-500 italic">Đã chọn {selectedAssets.length} / {maxSelect}</p>
              )}
           </div>
           <div className="flex gap-2 md:gap-4 w-full md:w-auto order-1 md:order-2">
              <button 
                onClick={onClose}
                className="flex-grow md:flex-none px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmSelection} 
                disabled={selectedAssets.length === 0} 
                className={`flex-grow md:flex-none px-8 md:px-12 py-3 md:py-4 rounded-full font-black uppercase text-[10px] md:text-xs transition-all shadow-xl ${selectedAssets.length > 0 ? 'bg-brand-blue text-white hover:scale-105 active:scale-95 shadow-brand-blue/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'}`}
              >
                Xác nhận
              </button>
           </div>
        </div>
      </motion.div>

      <QuickImageGenModal 
        isOpen={showQuickGen} 
        onClose={() => setShowQuickGen(false)} 
        onSuccess={() => {
          fetchMedia();
        }}
      />
    </div>
  );
};

export default ImageLibraryModal;