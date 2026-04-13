import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Trash2, Search,
  ImageIcon, Archive,
  Upload, Loader2, Check,
  Calendar, AlertTriangle, RefreshCw,
  Wand2, ZoomIn, Copy, Clock,
  ArrowUpDown, CheckSquare, Square,
  ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mediaApi, MediaListResponse } from '../apis/media';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { startBackgroundUploadPoll } from '../services/uploadPoller';
import { QuickImageGenModal } from './QuickImageGenModal';
import { useToast } from '../context/ToastContext';

/* =====================================================
   TYPES & CONSTANTS
===================================================== */
interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (selected: GCSAssetMetadata[]) => void;
  onEdit?: (url: string) => void;
  maxSelect?: number;
}

const ITEMS_PER_PAGE = 30;

const SOURCE_FILTERS = [
  { key: '', label: 'Tất cả' },
  { key: 'ai_generated', label: 'AI' },
  { key: 'upload', label: 'Upload' },
  { key: 'gommo', label: 'Server 1' },
  { key: 'fxflow', label: 'Server 2' },
  { key: 'grok', label: 'Grok' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'oldest', label: 'Cũ nhất' },
  { key: 'name_asc', label: 'Tên A→Z' },
  { key: 'name_desc', label: 'Tên Z→A' },
];

/* =====================================================
   SKELETON CARD
===================================================== */
const SkeletonCard = () => (
  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200/50 dark:from-white/5 to-transparent" />
    <div className="absolute bottom-3 left-3 right-3 space-y-2">
      <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full w-3/4" />
      <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full w-1/2" />
    </div>
  </div>
);

/* =====================================================
   LIGHTBOX
===================================================== */
const Lightbox: React.FC<{
  item: any;
  items: any[];
  onClose: () => void;
  onNavigate: (item: any) => void;
}> = ({ item, items, onClose, onNavigate }) => {
  const currentIdx = items.findIndex(i => i._id === item._id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < items.length - 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(items[currentIdx - 1]);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(items[currentIdx + 1]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, hasPrev, hasNext, items, onClose, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-all z-50">
        <X size={24} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white/70 z-50">
        {currentIdx + 1} / {items.length}
      </div>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={e => { e.stopPropagation(); onNavigate(items[currentIdx - 1]); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-50"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={e => { e.stopPropagation(); onNavigate(items[currentIdx + 1]); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-50"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Image */}
      <motion.img
        key={item._id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        src={item.imageUrl}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
        alt=""
        onClick={e => e.stopPropagation()}
      />

      {/* Bottom info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl z-50" onClick={e => e.stopPropagation()}>
        <span className="text-[10px] font-bold text-white/80 truncate max-w-[200px]">{item.originalName || 'Asset'}</span>
        {item.width && item.height && (
          <span className="text-[9px] text-white/50 font-medium">{item.width}×{item.height}</span>
        )}
      </div>
    </motion.div>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */
const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({
  isOpen, onClose, onConfirm, onEdit, maxSelect = 1
}) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Data
  const [assets, setAssets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // UI
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingJobs, setUploadingJobs] = useState<{ id: string; fileName: string }[]>([]);
  const [showQuickGen, setShowQuickGen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<GCSAssetMetadata[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [lightboxItem, setLightboxItem] = useState<any | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const userScrolledRef = useRef(false);

  /* =====================================================
     FETCH DATA
  ===================================================== */
  const fetchMedia = useCallback(async (pageNum: number, append = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    isFetchingRef.current = true;

    try {
      const res: MediaListResponse = await mediaApi.getMediaList({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        source: sourceFilter || undefined,
        maxAge: 1, // ⏰ Chỉ lấy hình trong 1 giờ gần nhất (hình cũ sẽ bị hết hạn)
      });

      if (res && res.data) {
        if (append) {
          setAssets(prev => [...prev, ...res.data]);
        } else {
          setAssets(res.data);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }
        setTotal(res.total || 0);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setErrorMessage('Không thể tải danh sách hình ảnh từ máy chủ.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [searchQuery, sourceFilter]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSelectedAssets([]);
      setErrorMessage(null);
      setPreviewItem(null);
      setLightboxItem(null);
      setIsBulkMode(false);
      setBulkSelected([]);
      userScrolledRef.current = false;
      fetchMedia(1);
    }
  }, [isOpen]); // eslint-disable-line

  // Debounced search + source filter
  useEffect(() => {
    if (!isOpen) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      userScrolledRef.current = false;
      fetchMedia(1);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery, sourceFilter]); // eslint-disable-line

  // Infinite scroll
  const handleUserScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el && el.scrollTop > 100) userScrolledRef.current = true;
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isFetchingRef.current || !userScrolledRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 300) {
      const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
      if (page < totalPages) fetchMedia(page + 1, true);
    }
  }, [page, total, fetchMedia]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => { handleUserScroll(); handleScroll(); };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [handleScroll, handleUserScroll]);

  /* =====================================================
     SORT
  ===================================================== */
  const sortedAssets = useMemo(() => {
    const sorted = [...assets];
    switch (sortBy) {
      case 'oldest': sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'name_asc': sorted.sort((a, b) => (a.originalName || '').localeCompare(b.originalName || '')); break;
      case 'name_desc': sorted.sort((a, b) => (b.originalName || '').localeCompare(a.originalName || '')); break;
      default: break; // newest = default from API
    }
    return sorted;
  }, [assets, sortBy]);

  /* =====================================================
     GROUP BY DATE
  ===================================================== */
  const groupedAssets = useMemo<Record<string, any[]>>(() => {
    const groups: Record<string, any[]> = {};
    sortedAssets.forEach(asset => {
      const date = new Date(asset.createdAt);
      const today = new Date();
      let label = date.toLocaleDateString('vi-VN');
      if (date.toDateString() === today.toDateString()) label = 'Hôm nay';
      else {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) label = 'Hôm qua';
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(asset);
    });
    return groups;
  }, [sortedAssets]);

  const hasMore = page < Math.ceil(total / ITEMS_PER_PAGE);

  /* =====================================================
     SELECTION HANDLERS
  ===================================================== */
  const toggleSelect = (asset: any) => {
    if (isBulkMode) {
      setBulkSelected(prev =>
        prev.includes(asset._id) ? prev.filter(id => id !== asset._id) : [...prev, asset._id]
      );
      return;
    }
    if (!onConfirm) return;
    setSelectedAssets(prev => {
      const isAlreadySelected = prev.some(a => a.id === asset._id);
      if (isAlreadySelected) return prev.filter(a => a.id !== asset._id);
      const mapped: GCSAssetMetadata = {
        id: asset._id, url: asset.imageUrl, name: asset.originalName || 'unnamed',
        size: '0 MB', type: 'image/png', blob: new Blob(), timestamp: asset.createdAt,
        gcsPath: asset.imageUrl, bucket: asset.source || 'default', mediaId: asset.mediaId
      };
      if (maxSelect === 1) return [mapped];
      if (prev.length >= maxSelect) return prev;
      return [...prev, mapped];
    });
  };

  const handleConfirmSelection = () => {
    if (onConfirm && selectedAssets.length > 0) { onConfirm(selectedAssets); onClose(); }
  };

  /* =====================================================
     BULK DELETE
  ===================================================== */
  const handleBulkDelete = async () => {
    if (bulkSelected.length === 0) return;
    if (!window.confirm(`Xác nhận xoá ${bulkSelected.length} ảnh?`)) return;
    setIsDeleting(true);
    let deleted = 0;
    for (const id of bulkSelected) {
      try {
        const res = await mediaApi.deleteMedia(id);
        if (res.success) deleted++;
      } catch {}
    }
    setAssets(prev => prev.filter(a => !bulkSelected.includes(a._id)));
    setTotal(prev => prev - deleted);
    setBulkSelected([]);
    setIsDeleting(false);
    showToast(`Đã xoá ${deleted} ảnh`, 'success');
  };

  const toggleBulkSelectAll = () => {
    if (bulkSelected.length === sortedAssets.length) setBulkSelected([]);
    else setBulkSelected(sortedAssets.map(a => a._id));
  };

  /* =====================================================
     UPLOAD / DELETE / DOWNLOAD
  ===================================================== */
  const processUpload = async (file: File) => {
    const tempId = `pending-${Date.now()}`;
    setUploadingJobs(prev => [...prev, { id: tempId, fileName: file.name }]);
    setIsUploading(true);
    setErrorMessage(null);
    try {
      // Step 1: Upload → returns immediately with imageUrl + jobId (no blocking poll)
      const asset = await uploadToGCS(file);

      // Step 2: Refresh list right away so the image appears in grid (no mediaId yet)
      await fetchMedia(1);
      showToast('Tải ảnh thành công', 'success');

      // Step 3: If server returned a jobId, poll in background for mediaId/projectId
      if (asset.jobId) {
        startBackgroundUploadPoll({
          jobId: asset.jobId,
          onDone: () => {
            // Second refresh — updates mediaId + projectId in the list
            fetchMedia(1);
          },
          onError: (msg) => {
            console.warn('[uploadPoller] Poll failed:', msg);
          },
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi tải ảnh lên máy chủ');
    } finally {
      // Remove spinner after upload + first fetchMedia (not waiting for poll)
      setUploadingJobs(prev => prev.filter(j => j.id !== tempId));
      setIsUploading(false);
    }
  };

  const handleGCSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
    if (e.target) e.target.value = '';
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xoá hình ảnh này?')) return;
    try {
      const res = await mediaApi.deleteMedia(id);
      if (res.success) {
        setAssets(prev => prev.filter(a => a._id !== id));
        setTotal(prev => prev - 1);
        setSelectedAssets(prev => prev.filter(a => a.id !== id));
        if (previewItem?._id === id) setPreviewItem(null);
        showToast('Đã xoá ảnh', 'success');
      }
    } catch (err) { console.error('Delete error:', err); }
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
    } catch { window.open(url, '_blank'); }
  };

  const handleCopyUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    showToast('Đã sao chép URL', 'success');
  };

  /* =====================================================
     DRAG & DROP
  ===================================================== */
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processUpload(file);
    } else {
      showToast('Chỉ hỗ trợ file ảnh', 'error');
    }
  };

  /* =====================================================
     HELPERS
  ===================================================== */
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.toLocaleDateString('vi-VN')}`;
  };

  const formatSize = (w?: number, h?: number) => (w && h) ? `${w}×${h}` : 'N/A';

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
        <header className="px-5 py-4 md:px-8 md:py-5 border-b border-black/[0.06] dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c0f]/80 backdrop-blur-xl shrink-0">
          {/* Row 1 */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Archive size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Thư viện tài sản</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {total} ảnh tổng • Đang xem {assets.length} • Chọn tối đa {maxSelect}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk mode toggle */}
              <button
                onClick={() => { setIsBulkMode(!isBulkMode); setBulkSelected([]); }}
                className={`p-2 rounded-lg transition-all ${isBulkMode ? 'bg-red-500/10 text-red-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                title="Chế độ chọn hàng loạt"
              >
                <CheckSquare size={16} />
              </button>

              <button onClick={() => fetchMedia(1)} disabled={isLoading} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all disabled:opacity-30" title="Làm mới">
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button onClick={() => setShowQuickGen(true)} className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-lg shadow-purple-500/20">
                <Wand2 size={12} /> Tạo AI
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || uploadingJobs.length > 0} className="bg-slate-900 dark:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50">
                {(isUploading || uploadingJobs.length > 0) ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploadingJobs.length > 0 ? `Đang xử lý (${uploadingJobs.length})` : 'Tải lên'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGCSUpload} />
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Row 2: Search + Filters + Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-grow max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên ảnh..."
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl pl-9 pr-8 py-2.5 text-xs outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/10 transition-all text-slate-800 dark:text-white/80"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={12} /></button>
              )}
            </div>

            {/* Source filter */}
            <div className="flex bg-slate-100 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04] p-0.5 overflow-x-auto no-scrollbar">
              {SOURCE_FILTERS.map(f => (
                <button key={f.key} onClick={() => setSourceFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${sourceFilter === f.key ? 'bg-white dark:bg-white/10 text-rose-500 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >{f.label}</button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl px-2 py-1 ml-auto">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer appearance-none pr-2"
              >
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Bulk mode bar */}
          <AnimatePresence>
            {isBulkMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <button onClick={toggleBulkSelectAll} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors">
                    {bulkSelected.length === sortedAssets.length ? <CheckSquare size={14} className="text-red-500" /> : <Square size={14} />}
                    {bulkSelected.length === sortedAssets.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <span className="text-[10px] font-bold text-red-500">{bulkSelected.length} đã chọn</span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkSelected.length === 0 || isDeleting}
                    className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold hover:bg-red-600 transition-all disabled:opacity-40"
                  >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Xoá ({bulkSelected.length})
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-grow flex overflow-hidden">
          {/* Gallery */}
          <div
            ref={scrollRef}
            className={`flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 no-scrollbar relative transition-all ${isDragOver ? 'ring-2 ring-inset ring-rose-500/50 bg-rose-500/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragOver && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-rose-500/10 backdrop-blur-sm rounded-xl pointer-events-none">
                <div className="flex flex-col items-center gap-3 text-rose-500">
                  <Upload size={48} strokeWidth={1.5} />
                  <p className="text-sm font-bold">Thả ảnh vào đây</p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && assets.length === 0 ? (
              <div className="space-y-8">
                <DateHeader label="Đang tải..." />
                <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                  {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            ) : sortedAssets.length > 0 || uploadingJobs.length > 0 || isUploading ? (
              <div className="space-y-8">
                {uploadingJobs.length > 0 && !groupedAssets['Hôm nay'] && (
                  <div className="space-y-4">
                    <DateHeader label="Hôm nay" />
                    <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                      {uploadingJobs.map(job => <UploadPlaceholder key={job.id} fileName={job.fileName} />)}
                    </div>
                  </div>
                )}

                {(Object.entries(groupedAssets) as [string, any[]][]).map(([dateLabel, items]) => (
                  <div key={dateLabel} className="space-y-4">
                    <DateHeader label={dateLabel} count={items.length} />
                    <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                      {dateLabel === 'Hôm nay' && uploadingJobs.map(job => <UploadPlaceholder key={job.id} fileName={job.fileName} />)}
                      {items.map(item => {
                        const isSelected = selectedAssets.some(a => a.id === item._id);
                        const isBulkChecked = bulkSelected.includes(item._id);
                        return (
                          <motion.div
                            layout key={item._id}
                            onClick={() => toggleSelect(item)}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                              isBulkMode && isBulkChecked ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0d] scale-[0.97]' :
                              isSelected ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0d] scale-[0.97]' :
                              'hover:ring-1 hover:ring-white/20'
                            }`}
                          >
                            <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Source badge */}
                            {item.source && (
                              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[7px] font-bold uppercase text-white/70 tracking-wider z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.source}
                              </div>
                            )}

                            {/* Checkbox */}
                            <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-20 ${
                              isBulkMode
                                ? (isBulkChecked ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/40 scale-100' : 'bg-black/30 border-white/30 scale-100')
                                : (isSelected ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-500/40 scale-100' : 'bg-black/30 border-white/30 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100')
                            }`}>
                              {(isSelected || isBulkChecked) && <Check size={12} strokeWidth={4} className="text-white" />}
                            </div>

                            {/* Hover actions */}
                            {!isBulkMode && (
                              <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                                <p className="text-[8px] font-bold text-white/70 truncate max-w-[50%] uppercase tracking-wider">{item.originalName || 'Asset'}</p>
                                <div className="flex gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); setLightboxItem(item); }} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all" title="Xem lớn">
                                    <Maximize2 size={12} />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all" title="Chi tiết">
                                    <ZoomIn size={12} />
                                  </button>
                                  <button onClick={(e) => handleDownload(e, item.imageUrl, item.originalName)} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all" title="Tải xuống">
                                    <Download size={12} />
                                  </button>
                                  <button onClick={(e) => handleDelete(e, item._id)} className="p-1.5 bg-red-500/60 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all" title="Xoá">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {isSelected && !isBulkMode && <div className="absolute inset-0 bg-rose-500/10 pointer-events-none" />}
                            {isBulkChecked && isBulkMode && <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Load more */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-6 gap-3">
                    <Loader2 size={16} className="animate-spin text-rose-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đang tải thêm...</span>
                  </div>
                )}

                {!hasMore && assets.length > 0 && !isLoadingMore && (
                  <div className="flex items-center justify-center py-4 gap-2 opacity-40">
                    <div className="h-px w-12 bg-slate-300 dark:bg-white/10" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Hết danh sách</span>
                    <div className="h-px w-12 bg-slate-300 dark:bg-white/10" />
                  </div>
                )}
              </div>
            ) : (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04] flex items-center justify-center">
                  <ImageIcon size={40} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    {searchQuery || sourceFilter ? 'Không tìm thấy kết quả' : 'Kho ảnh trống'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {searchQuery || sourceFilter ? 'Thử từ khoá hoặc bộ lọc khác' : 'Tải ảnh lên, kéo thả hoặc tạo ảnh AI'}
                  </p>
                </div>
                {!searchQuery && !sourceFilter ? (
                  <div className="flex gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-slate-900 dark:bg-white/10 text-white rounded-xl text-[10px] font-bold flex items-center gap-2">
                      <Upload size={12} /> Tải ảnh lên
                    </button>
                    <button onClick={() => setShowQuickGen(true)} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-2">
                      <Wand2 size={12} /> Tạo AI
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setSearchQuery(''); setSourceFilter(''); }} className="px-5 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
                    <X size={12} /> Xoá bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── PREVIEW SIDEBAR ─── */}
          <AnimatePresence>
            {previewItem && !isBulkMode && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="hidden md:flex flex-col border-l border-black/[0.06] dark:border-white/[0.04] bg-slate-50 dark:bg-[#0c0c0f] shrink-0 overflow-hidden"
              >
                <div className="flex-grow overflow-y-auto no-scrollbar">
                  <div className="relative aspect-square bg-black flex items-center justify-center cursor-pointer" onClick={() => setLightboxItem(previewItem)}>
                    <img src={previewItem.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                      <Maximize2 size={24} className="text-white" />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setPreviewItem(null); }} className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/80 hover:text-white hover:bg-black/70 transition-all">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{previewItem.originalName || 'Untitled Asset'}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Clock size={10} /> {formatDate(previewItem.createdAt)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <MetaCard label="Kích thước" value={formatSize(previewItem.width, previewItem.height)} />
                      <MetaCard label="Nguồn" value={previewItem.source || 'upload'} />
                      <MetaCard label="Loại" value={previewItem.type || 'image'} />
                      <MetaCard label="Media ID" value={previewItem.mediaId ? `${previewItem.mediaId.slice(0, 8)}...` : 'N/A'} />
                    </div>

                    {previewItem.prompt && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Prompt</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-white/[0.03] p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.04] italic">
                          "{previewItem.prompt}"
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <button onClick={() => toggleSelect(previewItem)}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all ${selectedAssets.some(a => a.id === previewItem._id)
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'}`}
                      >
                        <Check size={12} /> {selectedAssets.some(a => a.id === previewItem._id) ? 'Đã chọn' : 'Chọn ảnh này'}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={(e) => handleDownload(e, previewItem.imageUrl, previewItem.originalName)} className="flex-1 py-2.5 bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                          <Download size={12} /> Tải xuống
                        </button>
                        <button onClick={(e) => handleCopyUrl(e, previewItem.imageUrl)} className="flex-1 py-2.5 bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                          <Copy size={12} /> Copy URL
                        </button>
                      </div>
                      <button onClick={(e) => handleDelete(e, previewItem._id)} className="w-full py-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-bold text-red-500 flex items-center justify-center gap-1.5 hover:bg-red-500 hover:text-white transition-all">
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
            <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-400 hover:text-red-500"><X size={14} /></button>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <div className="px-5 py-4 md:px-8 md:py-5 bg-white dark:bg-[#0c0c0f] border-t border-black/[0.06] dark:border-white/[0.04] shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 order-2 md:order-1">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {selectedAssets.map((s) => (
                  <div key={s.id} className="w-9 h-9 rounded-xl border-2 border-white dark:border-[#0c0c0f] overflow-hidden shadow-lg ring-1 ring-rose-500/20">
                    <img src={s.url} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
              {selectedAssets.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{selectedAssets.length} / {maxSelect} đã chọn</span>
                  <button onClick={() => setSelectedAssets([])} className="text-[9px] font-bold text-rose-400 hover:text-rose-500 underline underline-offset-2">Bỏ chọn</button>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.02] rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{assets.length} / {total}</span>
              {hasMore && <span className="text-[8px] text-rose-400 font-bold">• cuộn để tải thêm</span>}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto order-1 md:order-2">
            <button onClick={onClose} className="flex-grow md:flex-none px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-black/[0.06] dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-600 dark:text-slate-300 transition-all">
              Huỷ
            </button>
            <button onClick={handleConfirmSelection} disabled={selectedAssets.length === 0}
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

      {/* ─── LIGHTBOX ─── */}
      <AnimatePresence>
        {lightboxItem && (
          <Lightbox
            item={lightboxItem}
            items={sortedAssets}
            onClose={() => setLightboxItem(null)}
            onNavigate={item => setLightboxItem(item)}
          />
        )}
      </AnimatePresence>

      <QuickImageGenModal
        isOpen={showQuickGen}
        onClose={() => setShowQuickGen(false)}
        onSuccess={() => { fetchMedia(1); }}
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
      {count !== undefined && <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">({count})</span>}
    </div>
    <div className="h-px flex-grow bg-black/[0.04] dark:bg-white/[0.04]" />
  </div>
);

const UploadPlaceholder = ({ fileName }: { fileName?: string }) => (
  <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] animate-pulse flex flex-col items-center justify-center gap-2">
    <Loader2 size={20} className="animate-spin text-rose-400" />
    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">Đang xử lý...</span>
    {fileName && <span className="text-[7px] text-slate-300 dark:text-slate-600 truncate px-2 max-w-full">{fileName}</span>}
  </div>
);

const MetaCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-2.5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-lg">
    <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-0.5">{label}</p>
    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80 truncate">{value}</p>
  </div>
);

export default ImageLibraryModal;