import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Trash2, Search,
  ImageIcon, Archive,
  Upload, Loader2, Check,
  Calendar, AlertTriangle, RefreshCw,
  Edit3, Maximize2, Wand2, Grid,
  LayoutGrid, Columns, ZoomIn, Info, Copy, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mediaApi, MediaListResponse } from '../apis/media';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { QuickImageGenModal } from './QuickImageGenModal';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();

  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showQuickGen, setShowQuickGen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<GCSAssetMetadata[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [gridCols, setGridCols] = useState(4);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      setPreviewItem(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => { fetchMedia(); }, 500);
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
        bucket: asset.source || 'default',
        mediaId: asset.mediaId
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
      showToast('Tải ảnh thành công', 'success');
    } catch (error: any) {
      setErrorMessage(error.message || "Lỗi tải ảnh lên máy chủ");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xoá hình ảnh này?")) return;
    try {
      const res = await mediaApi.deleteMedia(id);
      if (res.success) {
        setAssets(prev => prev.filter(a => a._id !== id));
        setSelectedAssets(prev => prev.filter(a => a.id !== id));
        if (previewItem?._id === id) setPreviewItem(null);
        showToast('Đã xoá ảnh', 'success');
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

  const handleCopyUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    showToast('Đã sao chép URL', 'success');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.toLocaleDateString('vi-VN')}`;
  };

  const formatSize = (w?: number, h?: number) => {
    if (w && h) return `${w}×${h}`;
    return 'N/A';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full h-full max-w-[1400px] max-h-[95vh] bg-white dark:bg-[#0a0a0d] border border-black/10 dark:border-white/[0.06] flex flex-col md:rounded-2xl overflow-hidden z-10 shadow-2xl"
      >
        {/* ─── HEADER ─── */}
        <header className="px-5 py-4 md:px-8 md:py-5 border-b border-black/[0.06] dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c0f]/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Archive size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Thư viện tài sản</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{assets.length} ảnh • Chọn tối đa {maxSelect}</p>
            </div>
            <button onClick={onClose} className="md:hidden ml-auto p-2 text-slate-400 hover:text-red-500 rounded-full">
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Search */}
            <div className="relative flex-grow md:flex-grow-0 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-rose-500/40 transition-all text-slate-800 dark:text-white/80"
              />
            </div>

            {/* Grid density */}
            <div className="hidden md:flex items-center bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden">
              {[3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => setGridCols(n)}
                  className={`px-2.5 py-2 text-[10px] font-semibold transition-all ${gridCols === n ? 'bg-rose-500/10 text-rose-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white/70'}`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={() => setShowQuickGen(true)}
              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-lg shadow-purple-500/20"
            >
              <Wand2 size={12} /> Tạo AI
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-slate-900 dark:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              Tải lên
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGCSUpload} />
            <button onClick={onClose} className="hidden md:flex p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors">
              <X size={22} />
            </button>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-grow flex overflow-hidden">
          {/* Gallery */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 no-scrollbar">
            {isLoading && assets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-rose-400" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">Đang tải thư viện...</p>
              </div>
            ) : assets.length > 0 || isUploading ? (
              <div className="space-y-8">
                {isUploading && !groupedAssets['Hôm nay'] && (
                  <div className="space-y-4">
                    <DateHeader label="Hôm nay" />
                    <div className={`grid gap-3 md:gap-4`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
                      <UploadPlaceholder />
                    </div>
                  </div>
                )}

                {(Object.entries(groupedAssets) as [string, any[]][]).map(([dateLabel, items]) => (
                  <div key={dateLabel} className="space-y-4">
                    <DateHeader label={dateLabel} count={items.length} />
                    <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
                      {dateLabel === 'Hôm nay' && isUploading && <UploadPlaceholder />}
                      {items.map(item => {
                        const isSelected = selectedAssets.some(a => a.id === item._id);
                        return (
                          <motion.div
                            layout
                            key={item._id}
                            onClick={() => toggleSelect(item)}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${isSelected
                              ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0d] scale-[0.97]'
                              : 'hover:ring-1 hover:ring-white/20'
                              }`}
                          >
                            {/* Image */}
                            <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" loading="lazy" />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Selection checkbox */}
                            <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-20 ${isSelected
                              ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-500/40 scale-100'
                              : 'bg-black/30 border-white/30 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                              }`}>
                              {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                            </div>

                            {/* Hover actions */}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                              <p className="text-[8px] font-bold text-white/70 truncate max-w-[60%] uppercase tracking-wider">{item.originalName || 'Asset'}</p>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                                  className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all"
                                  title="Xem chi tiết"
                                >
                                  <ZoomIn size={12} />
                                </button>
                                <button
                                  onClick={(e) => handleDownload(e, item.imageUrl, item.originalName)}
                                  className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all"
                                  title="Tải xuống"
                                >
                                  <Download size={12} />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, item._id)}
                                  className="p-1.5 bg-red-500/60 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all"
                                  title="Xoá"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Selected glow */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-rose-500/10 pointer-events-none" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04] flex items-center justify-center">
                  <ImageIcon size={40} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Kho ảnh trống</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Tải ảnh lên hoặc tạo ảnh AI để bắt đầu</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-white/10 text-white rounded-xl text-[10px] font-bold flex items-center gap-2"
                  >
                    <Upload size={12} /> Tải ảnh lên
                  </button>
                  <button
                    onClick={() => setShowQuickGen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-2"
                  >
                    <Wand2 size={12} /> Tạo AI
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── PREVIEW SIDEBAR ─── */}
          <AnimatePresence>
            {previewItem && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="hidden md:flex flex-col border-l border-black/[0.06] dark:border-white/[0.04] bg-slate-50 dark:bg-[#0c0c0f] shrink-0 overflow-hidden"
              >
                <div className="flex-grow overflow-y-auto no-scrollbar">
                  {/* Preview image */}
                  <div className="relative aspect-square bg-black flex items-center justify-center">
                    <img src={previewItem.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                    <button
                      onClick={() => setPreviewItem(null)}
                      className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/80 hover:text-white hover:bg-black/70 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{previewItem.originalName || 'Untitled Asset'}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Clock size={10} /> {formatDate(previewItem.createdAt)}
                      </p>
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <MetaCard label="Kích thước" value={formatSize(previewItem.width, previewItem.height)} />
                      <MetaCard label="Nguồn" value={previewItem.source || 'upload'} />
                      <MetaCard label="Loại" value={previewItem.type || 'image'} />
                      <MetaCard label="Media ID" value={previewItem.mediaId ? `${previewItem.mediaId.slice(0, 8)}...` : 'N/A'} />
                    </div>

                    {/* Prompt */}
                    {previewItem.prompt && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Prompt</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-white/[0.03] p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.04] italic">
                          "{previewItem.prompt}"
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { toggleSelect(previewItem); }}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all ${selectedAssets.some(a => a.id === previewItem._id)
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                          }`}
                      >
                        <Check size={12} /> {selectedAssets.some(a => a.id === previewItem._id) ? 'Đã chọn' : 'Chọn ảnh này'}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleDownload(e, previewItem.imageUrl, previewItem.originalName)}
                          className="flex-1 py-2.5 bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:border-slate-300 dark:hover:border-white/10 transition-all"
                        >
                          <Download size={12} /> Tải xuống
                        </button>
                        <button
                          onClick={(e) => handleCopyUrl(e, previewItem.imageUrl)}
                          className="flex-1 py-2.5 bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:border-slate-300 dark:hover:border-white/10 transition-all"
                        >
                          <Copy size={12} /> Copy URL
                        </button>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, previewItem._id)}
                        className="w-full py-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-bold text-red-500 flex items-center justify-center gap-1.5 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={12} /> Xoá ảnh
                      </button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* ─── ERROR BAR ─── */}
        {errorMessage && (
          <div className="px-6 py-3 bg-red-500/5 border-t border-red-500/10 flex items-center gap-3">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <span className="text-[10px] font-bold text-red-500">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <div className="px-5 py-4 md:px-8 md:py-5 bg-white dark:bg-[#0c0c0f] border-t border-black/[0.06] dark:border-white/[0.04] shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Selected previews */}
          <div className="flex items-center gap-3 order-2 md:order-1">
            <div className="flex -space-x-2">
              {selectedAssets.map((s) => (
                <div key={s.id} className="w-9 h-9 rounded-xl border-2 border-white dark:border-[#0c0c0f] overflow-hidden shadow-lg ring-1 ring-rose-500/20">
                  <img src={s.url} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
            {selectedAssets.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {selectedAssets.length} / {maxSelect} đã chọn
                </span>
                <button
                  onClick={() => setSelectedAssets([])}
                  className="text-[9px] font-bold text-rose-400 hover:text-rose-500 underline underline-offset-2"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full md:w-auto order-1 md:order-2">
            <button
              onClick={onClose}
              className="flex-grow md:flex-none px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-black/[0.06] dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-600 dark:text-slate-300 transition-all"
            >
              Huỷ
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedAssets.length === 0}
              className={`flex-grow md:flex-none px-10 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-lg ${selectedAssets.length > 0
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-white/[0.03] text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
              Xác nhận ({selectedAssets.length})
            </button>
          </div>
        </div>
      </motion.div>

      <QuickImageGenModal
        isOpen={showQuickGen}
        onClose={() => setShowQuickGen(false)}
        onSuccess={() => { fetchMedia(); }}
      />
    </div>
  );
};

/* ─── SUB COMPONENTS ─── */

const DateHeader = ({ label, count }: { label: string; count?: number }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/[0.03] rounded-lg border border-black/[0.06] dark:border-white/[0.04]">
      <Calendar size={12} className="text-rose-400" />
      <span className="text-[10px] font-bold text-slate-700 dark:text-white/80">{label}</span>
      {count !== undefined && (
        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">({count})</span>
      )}
    </div>
    <div className="h-px flex-grow bg-black/[0.04] dark:bg-white/[0.04]" />
  </div>
);

const UploadPlaceholder = () => (
  <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] animate-pulse flex flex-col items-center justify-center gap-2">
    <Loader2 size={20} className="animate-spin text-rose-400" />
    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">Đang tải...</span>
  </div>
);

const MetaCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-2.5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-lg">
    <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-0.5">{label}</p>
    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80 truncate">{value}</p>
  </div>
);

export default ImageLibraryModal;