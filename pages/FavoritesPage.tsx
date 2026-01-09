
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../data';
import { 
  ChevronRight, Bookmark, BookmarkX, ArrowLeft, 
  ImageIcon, Download, Trash2, Search,
  Loader2, Maximize2, Upload, 
  Clock, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { mediaApi } from '../apis/media';
import ProductImageWorkspace from '../components/ProductImageWorkspace';

type FavTab = 'SOLUTIONS' | 'SERVER_ASSETS';

const FavoritesPage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  const [activeTab, setActiveTab] = useState<FavTab>('SOLUTIONS');
  
  // States cho dữ liệu
  const [favorites, setFavorites] = useState<string[]>([]);
  const [serverAssets, setServerAssets] = useState<any[]>([]);
  
  // States cho UI/UX
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalServer, setTotalServer] = useState(0);

  // States cho Editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load solutions favorites từ LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // 2. Load Server Assets từ API
  const fetchServerAssets = async (isNewLoad = false) => {
    setIsLoading(true);
    try {
      const currentPage = isNewLoad ? 1 : page;
      const res = await mediaApi.getMediaList({
        page: currentPage,
        limit: 24,
        search: searchQuery
      });
      
      if (isNewLoad) {
        setServerAssets(res.data);
        setPage(1);
      } else {
        setServerAssets(prev => [...prev, ...res.data]);
      }
      setTotalServer(res.total);
    } catch (err) {
      console.error('Fetch Server Assets Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'SERVER_ASSETS') {
      const timer = setTimeout(() => {
        fetchServerAssets(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeTab, searchQuery]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.filter(favId => favId !== id);
    setFavorites(newFavs);
    localStorage.setItem('skyverses_favorites', JSON.stringify(newFavs));
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
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
        const res = await mediaApi.uploadImage({
          base64,
          fileName: file.name,
          size: file.size,
          source: 'fxlab', 
          aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE'
        });

        if (res.success) {
          fetchServerAssets(true);
        } else {
          alert(res.message || "Lỗi khi upload hình ảnh.");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload Process Error:', err);
      alert("Lỗi kết nối khi upload.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này khỏi thư viện?")) return;
    
    try {
      const res = await mediaApi.deleteMedia(id);
      if (res.success) {
        setServerAssets(prev => prev.filter(item => item._id !== id));
        setTotalServer(prev => Math.max(0, prev - 1));
      } else {
        alert((res as any).error || res.message || "Lỗi khi xóa hình ảnh.");
      }
    } catch (err: any) {
      console.error("Delete Media Error:", err);
      alert("Lỗi kết nối khi thực hiện lệnh xóa.");
    }
  };

  const openEditor = (url: string) => {
    setEditorImage(url);
    setIsEditorOpen(true);
  };

  const favoriteSolutions = useMemo(() => 
    SOLUTIONS.filter(sol => favorites.includes(sol.id) && 
      (sol.name[lang].toLowerCase().includes(searchQuery.toLowerCase()) || sol.slug.includes(searchQuery.toLowerCase()))
    ), 
  [favorites, lang, searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#fcfcfd] dark:bg-[#030304] overflow-hidden font-sans transition-colors duration-500 pt-32 pb-40">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[200px]"></div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        
        <header className="mb-12 space-y-8">
           <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-brand-blue transition-colors tracking-widest">
              <ArrowLeft size={14} /> Quay lại Market
           </Link>
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                 <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic text-black dark:text-white leading-none">
                   Thư viện <span className="text-brand-blue">Lưu trữ.</span>
                 </h1>
                 <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.3em]">Quản lý giải pháp và tài sản hình ảnh cá nhân.</p>
              </div>
              
              <div className="relative w-full md:w-96 group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue" size={18} />
                 <input 
                   type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Tìm kiếm nội dung..."
                   className="w-full bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-sm"
                 />
              </div>
           </div>
        </header>

        {/* TAB NAVIGATION & TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/10 w-fit">
            <button 
              onClick={() => setActiveTab('SOLUTIONS')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'SOLUTIONS' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              <Bookmark size={16} fill={activeTab === 'SOLUTIONS' ? 'currentColor' : 'none'} /> 
              Giải pháp
            </button>
            
            <button 
              onClick={() => setActiveTab('SERVER_ASSETS')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'SERVER_ASSETS' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              <ImageIcon size={16} /> 
              Thư viện ảnh
            </button>
          </div>

          <AnimatePresence>
            {activeTab === 'SERVER_ASSETS' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-6"
              >
                <button 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="bg-brand-blue text-white px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  Tải ảnh
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[500px]">
          {isLoading && serverAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-48 gap-6">
              <Loader2 className="animate-spin text-brand-blue" size={48} />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 italic">Đang đồng bộ dữ liệu server...</span>
            </div>
          ) : activeTab === 'SOLUTIONS' ? (
            /* --- SOLUTIONS VIEW --- */
            favoriteSolutions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
                {favoriteSolutions.map((sol) => (
                  <div 
                    key={sol.id} 
                    className="group relative flex flex-col bg-white dark:bg-[#08080a] border border-black/[0.06] dark:border-white/[0.08] rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-black">
                      <img 
                        src={sol.imageUrl} 
                        alt={sol.name[lang]} 
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
                      />
                      <button 
                        onClick={() => toggleFavorite(sol.id)}
                        className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-md rounded-full text-brand-blue border border-brand-blue/30 shadow-xl z-30"
                      >
                        <Bookmark size={18} fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-brand-blue italic mb-4">{sol.name[lang]}</h3>
                      <p className="text-black/60 dark:text-white/50 text-[12px] leading-relaxed line-clamp-3 mb-8 italic">"{sol.description[lang]}"</p>
                      <Link to={`/product/${sol.slug}`} className="mt-auto w-full bg-brand-blue text-white py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all">
                        Khám phá <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<BookmarkX size={64} />} label="Chưa có mục lưu trữ" />
            )
          ) : (
            /* --- SERVER ASSETS VIEW (Thư viện ảnh) --- */
            serverAssets.length > 0 ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {serverAssets.map((asset) => (
                    <div key={asset._id} className="relative group aspect-[3/4] bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all">
                      <img src={asset.imageUrl} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                      
                      {/* Hover Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                        <a href={asset.imageUrl} target="_blank" className="p-2.5 bg-white text-black rounded-lg shadow-xl hover:scale-110 transition-transform" title="Xem ảnh gốc">
                            <Maximize2 size={16} />
                        </a>
                        <button 
                          onClick={() => openEditor(asset.imageUrl)}
                          className="p-2.5 bg-white text-brand-blue rounded-lg shadow-xl hover:scale-110 transition-transform"
                          title="Chỉnh sửa bằng AI"
                        >
                            <Edit3 size={16} />
                        </button>
                        <a href={asset.imageUrl} download className="p-2.5 bg-white text-black rounded-lg shadow-xl hover:scale-110 transition-transform" title="Tải xuống">
                            <Download size={16} />
                        </a>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMedia(asset._id); }}
                          className="p-2.5 bg-white text-red-600 rounded-lg shadow-xl hover:scale-110 transition-transform cursor-pointer"
                          title="Xoá hình ảnh"
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Content Info */}
                      <div className="absolute bottom-5 left-5 right-5 space-y-2">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest truncate italic leading-none">
                            {asset.originalName || 'Unnamed_Asset'}
                        </p>
                        <div className="flex justify-between items-center text-[7px] font-bold text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Clock size={10} /> {new Date(asset.createdAt).toLocaleDateString()}</span>
                            <span>{asset.width || '?'}x{asset.height || '?'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalServer > serverAssets.length && (
                  <div className="flex justify-center pt-8">
                     <button 
                       onClick={() => { setPage(p => p + 1); fetchServerAssets(); }}
                       className="px-10 py-3.5 border border-black/10 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all"
                     >
                       Xem thêm nội dung
                     </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState 
                icon={<ImageIcon size={64} />} 
                label="Thư viện hình ảnh trống" 
                subLabel="Hãy bắt đầu tải lên hoặc tạo ảnh mới bằng các công cụ AI."
              />
            )
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <ProductImageWorkspace 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)}
        initialImage={editorImage}
        onApply={(newUrl) => {
          // Khi lưu từ editor, ta load lại thư viện để thấy ảnh mới nếu server sync
          fetchServerAssets(true);
          setIsEditorOpen(false);
        }}
      />
    </div>
  );
};

const EmptyState = ({ icon, label, subLabel }: { icon: React.ReactNode, label: string, subLabel?: string }) => (
  <div className="py-48 text-center flex flex-col items-center justify-center space-y-8 opacity-40">
    <div className="text-gray-300 transition-transform hover:scale-110 duration-500">{icon}</div>
    <div className="space-y-3">
      <span className="text-xl font-black uppercase tracking-[0.4em] italic block">{label}</span>
      {subLabel && <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{subLabel}</p>}
    </div>
  </div>
);

export default FavoritesPage;
