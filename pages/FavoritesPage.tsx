
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../data';
import {
  ChevronRight, Bookmark, BookmarkX, ArrowLeft,
  Image as ImageIcon, Download, Trash2, Search,
  Loader2, Maximize2, Upload, Film,
  Clock, Edit3, Play, X, Eye, Grid3X3, LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { mediaApi } from '../apis/media';
import { videosApi } from '../apis/videos';
import { imagesApi } from '../apis/images';
import ProductImageWorkspace from '../components/ProductImageWorkspace';
import { useToast } from '../context/ToastContext';

type FavTab = 'SOLUTIONS' | 'IMAGES' | 'VIDEOS';

/* ───── Helpers ───── */
const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return ''; }
};

/* ───── Main Component ───── */
const FavoritesPage = () => {
  const { lang } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<FavTab>('IMAGES');

  // ── Solution favorites (localStorage) ──
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Image library (server) ──
  const [imageAssets, setImageAssets] = useState<any[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePage, setImagePage] = useState(1);
  const [imageTotal, setImageTotal] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // ── Video library (server) ──
  const [videoAssets, setVideoAssets] = useState<any[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoPage, setVideoPage] = useState(1);
  const [videoHasMore, setVideoHasMore] = useState(true);

  // ── UI States ──
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const LIMIT = 24;

  // ═══════════════════════════════════════════
  // 1. Load solutions favorites
  // ═══════════════════════════════════════════
  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.filter(favId => favId !== id);
    setFavorites(newFavs);
    localStorage.setItem('skyverses_favorites', JSON.stringify(newFavs));
  };

  const favoriteSolutions = useMemo(() =>
    SOLUTIONS.filter(sol => favorites.includes(sol.id) &&
      (sol.name[lang].toLowerCase().includes(searchQuery.toLowerCase()) || sol.slug.includes(searchQuery.toLowerCase()))
    ),
    [favorites, lang, searchQuery]);

  // ═══════════════════════════════════════════
  // 2. Fetch Image Assets
  // ═══════════════════════════════════════════
  const fetchImages = useCallback(async (pageNum: number, isNewLoad = false) => {
    setImageLoading(true);
    try {
      const res = await mediaApi.getMediaList({ page: pageNum, limit: LIMIT, search: searchQuery });
      if (isNewLoad) {
        setImageAssets(res.data || []);
        setImagePage(1);
      } else {
        setImageAssets(prev => [...prev, ...(res.data || [])]);
      }
      setImageTotal(res.total || 0);
    } catch (err) {
      console.error('Fetch Images Error:', err);
    } finally {
      setImageLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === 'IMAGES') {
      const timer = setTimeout(() => fetchImages(1, true), 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, searchQuery, fetchImages]);

  const loadMoreImages = () => {
    const nextPage = imagePage + 1;
    setImagePage(nextPage);
    fetchImages(nextPage);
  };

  // ═══════════════════════════════════════════
  // 3. Fetch Video Assets
  // ═══════════════════════════════════════════
  const fetchVideos = useCallback(async (pageNum: number, isNewLoad = false) => {
    setVideoLoading(true);
    try {
      const res = await videosApi.getJobs({ status: 'done', page: pageNum, limit: LIMIT, q: searchQuery || undefined });
      if (res.success && res.data) {
        const mapped = res.data.map(item => ({
          id: item.jobId,
          url: item.videoUrl || null,
          thumbnail: item.thumbnail || null,
          prompt: item.prompt || 'Untitled',
          model: item.model || 'AI Model',
          createdAt: item.createdAt,
        }));
        if (isNewLoad) {
          setVideoAssets(mapped);
          setVideoPage(1);
        } else {
          setVideoAssets(prev => [...prev, ...mapped]);
        }
        setVideoHasMore(res.meta.page < res.meta.totalPages);
      }
    } catch (err) {
      console.error('Fetch Videos Error:', err);
    } finally {
      setVideoLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === 'VIDEOS') {
      const timer = setTimeout(() => fetchVideos(1, true), 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, searchQuery, fetchVideos]);

  const loadMoreVideos = () => {
    const nextPage = videoPage + 1;
    setVideoPage(nextPage);
    fetchVideos(nextPage);
  };

  // ═══════════════════════════════════════════
  // Actions
  // ═══════════════════════════════════════════
  const handleUploadClick = () => {
    if (!isAuthenticated) { login(); return; }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const res = await mediaApi.uploadImage({ base64, fileName: file.name, size: file.size, source: 'fxlab', aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE' });
        if (res.success) {
          showToast('Upload thành công!', 'success');
          fetchImages(1, true);
        } else {
          showToast(res.message || 'Lỗi khi upload.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Lỗi kết nối khi upload.', 'error');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      const res = await mediaApi.deleteMedia(id);
      if (res.success) {
        setImageAssets(prev => prev.filter(item => item._id !== id));
        setImageTotal(prev => Math.max(0, prev - 1));
        showToast('Đã xóa thành công.', 'success');
      } else {
        showToast(res.message || 'Lỗi khi xóa.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối.', 'error');
    }
  };

  const openEditor = (url: string) => { setEditorImage(url); setIsEditorOpen(true); };

  const triggerDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl; link.download = filename;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  // ═══════════════════════════════════════════
  // Tab config
  // ═══════════════════════════════════════════
  const tabs: { key: FavTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'IMAGES', label: 'Hình ảnh', icon: <ImageIcon size={15} />, count: imageTotal },
    { key: 'VIDEOS', label: 'Video', icon: <Film size={15} />, count: videoAssets.length },
    { key: 'SOLUTIONS', label: 'Giải pháp', icon: <Bookmark size={15} />, count: favoriteSolutions.length },
  ];

  return (
    <div className="relative min-h-screen bg-[#fcfcfd] dark:bg-[#030304] overflow-hidden font-sans transition-colors duration-500 pt-28 md:pt-32 pb-40">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-blue/5 dark:bg-brand-blue/8 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-[1800px] mx-auto px-5 md:px-12 lg:px-20 relative z-10">

        {/* ─── HEADER ─── */}
        <header className="mb-10 space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 hover:text-brand-blue transition-colors tracking-widest">
            <ArrowLeft size={14} /> Quay lại Market
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Thư viện <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">Lưu trữ</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                Quản lý hình ảnh, video AI và giải pháp đã lưu của bạn.
              </p>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={16} />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:border-brand-blue/40 outline-none transition-all text-slate-700 dark:text-white/80 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </header>

        {/* ─── TABS & TOOLBAR ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-xl border border-black/[0.05] dark:border-white/[0.05]">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all ${activeTab === tab.key
                  ? 'bg-white dark:bg-white/[0.08] text-brand-blue shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white/70'
                  }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${activeTab === tab.key ? 'bg-brand-blue/10 text-brand-blue' : 'bg-black/[0.04] dark:bg-white/[0.04] text-slate-400 dark:text-slate-500'}`}>
                    {tab.count > 999 ? `${(tab.count / 1000).toFixed(1)}k` : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {activeTab === 'IMAGES' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3">
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-purple-500 text-white px-6 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider shadow-lg shadow-brand-blue/15 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                  Tải ảnh lên
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── TAB CONTENT ─── */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">

            {/* ═══ IMAGES TAB ═══ */}
            {activeTab === 'IMAGES' && (
              <motion.div key="images" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                {imageLoading && imageAssets.length === 0 ? (
                  <LoadingState label="Đang tải thư viện ảnh..." />
                ) : imageAssets.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {imageAssets.map(asset => (
                        <ImageCard
                          key={asset._id}
                          asset={asset}
                          onFullscreen={() => setFullscreenMedia({ url: asset.imageUrl, type: 'image' })}
                          onEdit={() => openEditor(asset.imageUrl)}
                          onDownload={() => triggerDownload(asset.imageUrl, asset.originalName || `image_${asset._id}.png`)}
                          onDelete={() => handleDeleteMedia(asset._id)}
                        />
                      ))}
                    </div>
                    {imageTotal > imageAssets.length && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={loadMoreImages}
                          disabled={imageLoading}
                          className="flex items-center gap-2 px-8 py-3 border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all disabled:opacity-50"
                        >
                          {imageLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                          Xem thêm ({imageTotal - imageAssets.length} còn lại)
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={<ImageIcon size={56} />} label="Thư viện ảnh trống" subLabel="Hãy tải ảnh lên hoặc tạo ảnh mới bằng AI." />
                )}
              </motion.div>
            )}

            {/* ═══ VIDEOS TAB ═══ */}
            {activeTab === 'VIDEOS' && (
              <motion.div key="videos" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                {videoLoading && videoAssets.length === 0 ? (
                  <LoadingState label="Đang tải thư viện video..." />
                ) : videoAssets.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {videoAssets.map(video => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          onPlay={() => video.url && setFullscreenMedia({ url: video.url, type: 'video' })}
                          onDownload={() => video.url && triggerDownload(video.url, `video_${video.id}.mp4`)}
                        />
                      ))}
                    </div>
                    {videoHasMore && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={loadMoreVideos}
                          disabled={videoLoading}
                          className="flex items-center gap-2 px-8 py-3 border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all disabled:opacity-50"
                        >
                          {videoLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                          Xem thêm video
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={<Film size={56} />} label="Chưa có video" subLabel="Tạo video từ AI để bắt đầu xây dựng thư viện." />
                )}
              </motion.div>
            )}

            {/* ═══ SOLUTIONS TAB ═══ */}
            {activeTab === 'SOLUTIONS' && (
              <motion.div key="solutions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                {favoriteSolutions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteSolutions.map(sol => (
                      <div key={sol.id} className="group relative flex flex-col bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl overflow-hidden hover:shadow-xl hover:border-brand-blue/20 transition-all duration-500">
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-black">
                          <img src={sol.imageUrl} alt={sol.name[lang]}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                          <button
                            onClick={() => toggleFavorite(sol.id)}
                            className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-brand-blue border border-brand-blue/30 shadow-lg z-30 hover:bg-red-500 hover:text-white hover:border-red-500/50 transition-all"
                          >
                            <Bookmark size={14} fill="currentColor" />
                          </button>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white/90 mb-2 line-clamp-1">{sol.name[lang]}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">{sol.description[lang]}</p>
                          <Link to={`/product/${sol.slug}`} className="mt-auto w-full bg-gradient-to-r from-brand-blue to-purple-500 text-white py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
                            Khám phá <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<BookmarkX size={56} />} label="Chưa có mục lưu trữ" subLabel="Ghé thăm Market để lưu các giải pháp yêu thích." />
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ═══ FULLSCREEN MEDIA MODAL ═══ */}
      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 md:p-10"
            onClick={() => setFullscreenMedia(null)}
          >
            <button onClick={() => setFullscreenMedia(null)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50">
              <X size={22} />
            </button>
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
              className="max-w-5xl w-full max-h-[85vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {fullscreenMedia.type === 'image' ? (
                <img src={fullscreenMedia.url} className="w-full h-full max-h-[85vh] object-contain bg-black" alt="" />
              ) : (
                <video src={fullscreenMedia.url} autoPlay controls className="w-full h-full max-h-[85vh] object-contain bg-black" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <ProductImageWorkspace
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialImage={editorImage}
        onApply={() => { fetchImages(1, true); setIsEditorOpen(false); }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════ */
/* ─── SUB-COMPONENTS ─── */
/* ═══════════════════════════════════════════ */

const ImageCard = ({ asset, onFullscreen, onEdit, onDownload, onDelete }: {
  asset: any;
  onFullscreen: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) => (
  <div className="relative group aspect-[3/4] bg-white dark:bg-[#0d0d0f] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden hover:shadow-xl hover:border-brand-blue/15 transition-all duration-500">
    <img src={asset.imageUrl} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt="" loading="lazy" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Actions */}
    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
      <button onClick={onFullscreen} className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-slate-700 dark:text-white rounded-lg shadow-lg hover:scale-110 transition-transform" title="Xem">
        <Maximize2 size={13} />
      </button>
      <button onClick={onEdit} className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-brand-blue rounded-lg shadow-lg hover:scale-110 transition-transform" title="Chỉnh sửa">
        <Edit3 size={13} />
      </button>
      <button onClick={onDownload} className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-slate-700 dark:text-white rounded-lg shadow-lg hover:scale-110 transition-transform" title="Tải xuống">
        <Download size={13} />
      </button>
      <button onClick={onDelete} className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-red-500 rounded-lg shadow-lg hover:scale-110 transition-transform" title="Xóa">
        <Trash2 size={13} />
      </button>
    </div>

    {/* Info */}
    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <p className="text-[9px] font-semibold text-white truncate">{asset.originalName || 'Unnamed'}</p>
      <div className="flex items-center justify-between mt-1 text-[8px] text-white/50 font-medium">
        <span className="flex items-center gap-1"><Clock size={8} /> {formatDate(asset.createdAt)}</span>
        {asset.width && asset.height && <span>{asset.width}×{asset.height}</span>}
      </div>
    </div>
  </div>
);

const VideoCard = ({ video, onPlay, onDownload }: {
  video: any;
  onPlay: () => void;
  onDownload: () => void;
}) => (
  <div className="group relative bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden hover:shadow-xl hover:border-purple-500/15 transition-all duration-500">
    {/* Thumbnail */}
    <div className="relative aspect-video bg-slate-100 dark:bg-black overflow-hidden cursor-pointer" onClick={onPlay}>
      {video.thumbnail ? (
        <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="" loading="lazy" />
      ) : video.url ? (
        <video src={video.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" muted preload="metadata" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
          <Film size={32} className="text-slate-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all">
          <Play size={24} fill="white" className="ml-1" />
        </div>
      </div>

      {/* Badge */}
      <div className="absolute top-2.5 left-2.5 z-20">
        <span className="px-2 py-0.5 bg-purple-500/80 text-white text-[8px] font-bold uppercase tracking-wider rounded-md">
          {video.model?.replace(/_/g, ' ').slice(0, 20) || 'VIDEO'}
        </span>
      </div>
    </div>

    {/* Info */}
    <div className="p-4 space-y-2.5">
      <p className="text-xs font-semibold text-slate-700 dark:text-white/80 line-clamp-2 leading-relaxed">{video.prompt}</p>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Clock size={10} /> {formatDate(video.createdAt)}
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={onPlay} className="p-1.5 bg-purple-500/10 text-purple-500 dark:text-purple-400 rounded-md hover:bg-purple-500 hover:text-white transition-all" title="Xem">
            <Eye size={12} />
          </button>
          <button onClick={onDownload} className="p-1.5 bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 rounded-md hover:bg-brand-blue hover:text-white transition-all" title="Tải xuống">
            <Download size={12} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const LoadingState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-32 gap-4">
    <Loader2 className="animate-spin text-brand-blue" size={36} />
    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
  </div>
);

const EmptyState = ({ icon, label, subLabel }: { icon: React.ReactNode; label: string; subLabel?: string }) => (
  <div className="py-32 text-center flex flex-col items-center justify-center space-y-5">
    <div className="text-slate-300 dark:text-slate-600">{icon}</div>
    <div className="space-y-2">
      <span className="text-lg font-bold text-slate-500 dark:text-slate-400 block">{label}</span>
      {subLabel && <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">{subLabel}</p>}
    </div>
  </div>
);

export default FavoritesPage;
