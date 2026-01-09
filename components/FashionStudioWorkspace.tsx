
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Download, Loader2, 
  Plus, Upload, RefreshCw, Sparkles, 
  Info, User, Palette, 
  CheckCircle2, Trash2, Shirt, Coins, AlertTriangle,
  ChevronRight, ArrowRight, Wand2, ShieldCheck,
  LayoutGrid, Camera, Check, AlertCircle, 
  ChevronDown, Grid, Image as LucideImage, History as HistoryIcon,
  Settings2, Smartphone, Maximize2,
  CreditCard, PlusCircle, Edit3, ChevronLeft,
  Dices
} from 'lucide-react';
import { generateDemoImage, generateDemoText } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import ImageLibraryModal from './ImageLibraryModal';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { ResourceControl } from './fashion-studio/ResourceControl';

const TOOLS = [
  { id: 'TRY_ON', label: 'Thử Đồ Ảo', icon: <Sparkles size={18} />, desc: 'Xem trước sản phẩm trên khách - Giữ nguyên dáng & tư thế' },
  { id: 'CHANGE_OUTFIT', label: 'Thay Trang Phục', icon: <Shirt size={18} />, desc: 'Đổi đồ trong ảnh - Có thể điều chỉnh tư thế tự nhiên' },
  { id: 'GEN_FASHION', label: 'Tạo Ảnh Thời Trang', icon: <Wand2 size={18} />, desc: 'Sinh ảnh thời trang AI' },
  { id: 'MODEL_GEN', label: 'Ảnh Mẫu', icon: <User size={18} />, desc: 'Chụp ảnh thời trang AI' },
  { id: 'PRODUCT_GEN', label: 'Ảnh Sản Phẩm', icon: <LucideImage size={18} />, desc: 'Ảnh sản phẩm chuyên nghiệp' },
];

const CATEGORIES = [
  'Váy đầm', 'Áo', 'Quần', 'Áo khoác', 'Vest & Blazer', 'Đồ thể thao', 
  'Trang trọng', 'Thường ngày', 'Đồ bơi', 'Nội y', 'Đồ len', 'Denim', 'Chân váy', 
  'Jumpsuit', 'Phụ kiện', 'Giày dép', 'Túi xách', 'Trang sức', 'Đồng hồ', 'Kính mắt', 
  'Mũ nón', 'Khăn quàng', 'Thắt lưng'
];

const STYLES = [
  'Hiện đại', 'Cổ điển', 'Tối giản', 'Cyberpunk', 'Luxury', 'Nghệ thuật', 'Streetwear', 'Thanh lịch', 'Bohemian', 
  'Vintage', 'Thể thao', 'Glamour', 'Preppy', 'Grunge', 'Lãng mạn', 'Punk', 
  'Gothic', 'Chic', 'K-Fashion', 'J-Fashion', 'Parisian', 
  'Bắc Âu', 'Nhiệt đới', 'Western', 'Military', 'Athleisure'
];

const ANGLES = [
  'Random', 'Eye level', 'Low angle', 'High angle', 'Close-up', 
  'Mid shot', 'Wide shot', 'Over-the-shoulder', 'Side profile', 'Three-quarter view'
];

const POSES = [
  'Random', 'Runway pose', 'Street candid', 'editorial fashion', 
  'Look back over shoulder', 'Hands on hips', 'crossed legs', 'walking pose', 
  'Seated casual', 'power stance'
];

const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const RESOLUTIONS = ['1k', '2k', '4k'];

const AI_MODELS = [
  { id: 'google_image_gen_4_5', name: 'Gemini 4.5 Image', cost: 150 },
  { id: 'google_image_gen_banana_pro', name: 'Banana Pro', cost: 500 }
];

interface FashionResult {
  id: string;
  url: string | null;
  status: 'processing' | 'done' | 'error';
  prompt: string;
  timestamp: string;
  type: string;
  modelName: string;
}

const CustomStudioDropdown = ({ label, value, options, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">{label}</label>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-bold outline-none text-slate-900 dark:text-white transition-all hover:border-slate-300 dark:hover:border-white/20"
      >
        <div className="flex items-center gap-2">
          {value === 'Random' ? <Dices size={12} className="text-purple-500" /> : <div className="w-3 h-3" />}
          <span className="truncate">{value}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1b1e] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[150] max-h-64 overflow-y-auto no-scrollbar py-2"
          >
            {options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => { onSelect(opt); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold transition-colors ${value === opt ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  {opt === 'Random' ? (
                    <Dices size={14} className="text-purple-500" />
                  ) : (
                    <div className="w-3.5 h-3.5" />
                  )}
                  <span>{opt}</span>
                </div>
                {value === opt && <Check size={14} strokeWidth={4} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FashionStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const navigate = useNavigate();
  
  const [activeTool, setActiveTool] = useState(TOOLS[0].id);
  const [activeTab, setActiveTab] = useState<'current' | 'collection'>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [status, setStatus] = useState('Sẵn sàng');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key'>(() => {
    const saved = localStorage.getItem('skyverses_usage_preference');
    return (saved as any) || 'credits';
  });
  
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [personalKey, setPersonalKey] = useState<string | undefined>(undefined);

  const [prompt, setPrompt] = useState('');
  const [modelImg, setModelImg] = useState<string | null>(null);
  const [garmentImg, setGarmentImg] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [results, setResults] = useState<FashionResult[]>([]);

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [angle, setAngle] = useState(ANGLES[0]);
  const [pose, setPose] = useState(POSES[0]);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [ratio, setRatio] = useState(RATIOS[1]);
  const [res, setRes] = useState(RESOLUTIONS[0]);
  const [quantity, setQuantity] = useState(1);

  const modelInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  const actionCost = selectedModel.cost * quantity;

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try {
        const keys = JSON.parse(vault);
        if (keys.gemini && keys.gemini.trim() !== '') {
          setHasPersonalKey(true);
          setPersonalKey(keys.gemini);
        }
      } catch (e) {}
    }
  }, [showResourceModal]);

  const selectedToolObj = TOOLS.find(t => t.id === activeTool);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(type);
      setStatus(`Đang tải lên...`);
      try {
        const metadata = await uploadToGCS(file);
        if (type === 'MODEL') setModelImg(metadata.url);
        else if (type === 'GARMENT') setGarmentImg(metadata.url);
        else {
          setReferenceImages(prev => [...prev, metadata.url]);
        }
        setStatus('Tải lên hoàn tất');
      } catch (err) {
        console.error("Upload error:", err);
        setStatus('Lỗi tải ảnh');
      } finally {
        setIsUploading(null);
      }
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await generateDemoText(`Hãy viết lại prompt sau đây thành một mô tả chuyên nghiệp cho AI tạo ảnh thời trang: "${prompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
        setPrompt(enhanced);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const pollJobStatus = async (jobId: string, resultId: string) => {
    try {
      const response: ImageJobResponse = await imagesApi.getJobStatus(jobId);
      const jobStatus = response.data?.status;
      if (jobStatus === 'done' && response.data.result?.images?.length) {
        const imageUrl = response.data.result.images[0];
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
        setActiveResultId(resultId);
        setStatus('Hoàn tất');
        refreshUserInfo();
      } else if (jobStatus === 'failed' || (jobStatus as string) === 'error' || (jobStatus as string) === 'reject') {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
        setStatus('Phân tích lỗi');
      } else {
        setTimeout(() => pollJobStatus(jobId, resultId), 4000);
      }
    } catch (e) {
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
      setStatus('Lỗi đồng bộ');
    }
  };

  const performInference = async (pref: 'credits' | 'key') => {
    const cost = selectedModel.cost * quantity;
    const cleanPrompt = prompt.trim();
    let finalPrompt = `Category: ${category}. Style: ${style}. Angle: ${angle}. Pose: ${pose}. Ratio: ${ratio}. ${cleanPrompt}`;
    
    const resultId = Date.now().toString();
    const newResult: FashionResult = {
      id: resultId,
      url: null,
      status: 'processing',
      prompt: cleanPrompt || 'Synthesis Process',
      timestamp: new Date().toLocaleTimeString(),
      type: activeTool,
      modelName: selectedModel.name
    };

    setResults(prev => [newResult, ...prev]);
    setActiveResultId(resultId);

    const inputImages = [];
    if (modelImg) inputImages.push(modelImg);
    if (garmentImg) inputImages.push(garmentImg);
    inputImages.push(...referenceImages);

    if (pref === 'key') {
      const activeKey = personalKey;
      if (!activeKey) { navigate('/settings'); return; }
      setIsGenerating(true);
      setStatus('Đang kiến tạo...');
      try {
        const imageUrl = await generateDemoImage({ prompt: finalPrompt, images: inputImages, model: selectedModel.id, aspectRatio: ratio, quality: res, apiKey: activeKey });
        if (imageUrl) {
          setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
          setStatus('Hoàn tất');
        }
      } catch (err) {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
        setStatus('Lỗi xử lý');
      } finally { setIsGenerating(false); }
    } else {
      if (credits < cost) { setShowLowCreditAlert(true); return; }
      setIsGenerating(true);
      setStatus('Đang khởi tạo...');
      try {
        const payload: ImageJobRequest = {
          type: inputImages.length > 0 ? "image_to_image" : "text_to_image",
          input: { prompt: finalPrompt, images: inputImages.length > 0 ? inputImages : undefined },
          config: { width: 1024, height: 1024, aspectRatio: ratio, seed: 0, style: "cinematic" },
          engine: { provider: "gommo", model: selectedModel.id as any },
          enginePayload: { prompt: finalPrompt, privacy: "PRIVATE", projectId: "default", category: "FASHION" }
        };
        const apiRes = await imagesApi.createJob(payload);
        if (apiRes.success && apiRes.data.jobId) {
          useCredits(cost);
          pollJobStatus(apiRes.data.jobId, resultId);
        } else {
          setResults(prev => prev.filter(r => r.id !== resultId));
          setStatus('Lỗi API');
        }
      } catch (e) {
        setResults(prev => prev.filter(r => r.id !== resultId));
        setStatus('Lỗi kết nối');
      } finally { setIsGenerating(false); }
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) { login(); return; }
    if (!usagePreference) {
      setIsResumingGenerate(true);
      setShowResourceModal(true);
      return;
    }
    performInference(usagePreference);
  };

  const openEditor = (url: string) => {
    setEditorImage(url);
    setIsEditorOpen(true);
  };

  const handleEditorApply = (newUrl: string) => {
    const editId = `edit-${Date.now()}`;
    const editedResult: FashionResult = {
      id: editId,
      url: newUrl,
      status: 'done',
      prompt: 'Edited in Studio',
      timestamp: new Date().toLocaleTimeString(),
      type: 'EDIT',
      modelName: 'Studio Editor'
    };
    setResults(prev => [editedResult, ...prev]);
    setActiveResultId(editId);
    setIsEditorOpen(false);
  };

  const handleLibrarySelect = (selectedAssets: GCSAssetMetadata[]) => {
    const urls = selectedAssets.map(asset => asset.url);
    setReferenceImages(prev => [...prev, ...urls].slice(0, 6));
  };

  const isGenerateDisabled = isGenerating || (usagePreference === 'credits' && credits < actionCost);

  const activeResult = results.find(r => r.id === activeResultId);

  return (
    <div className="h-full w-full flex bg-[#f4f7f9] dark:bg-[#0a0b0d] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
      
      {/* SIDEBAR */}
      <aside className="w-[380px] shrink-0 border-r border-slate-200 dark:border-white/5 flex flex-col bg-white dark:bg-[#0d0e12] overflow-hidden relative shadow-2xl transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-4 shrink-0">
           <Link to="/" className="p-2 -ml-2 text-slate-400 hover:text-brand-blue dark:hover:text-white transition-colors"><ChevronLeft size={24} /></Link>
           <div className="w-10 h-10 bg-pink-600/10 dark:bg-pink-600/20 border border-pink-500/20 dark:border-pink-500/30 rounded-lg flex items-center justify-center text-pink-600 dark:text-pink-500"><Shirt size={22} /></div>
           <div className="space-y-0.5"><h2 className="text-lg font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Fashion Studio</h2><p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest italic">PRODUCTION_v4.2</p></div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-5 space-y-8 pb-48">
           {/* CÔNG CỤ */}
           <section className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest px-1">Chọn công cụ</label>
              <div className="grid grid-cols-2 gap-2">
                {TOOLS.map(t => (
                  <button 
                    key={t.id} onClick={() => setActiveTool(t.id)} 
                    className={`flex items-center gap-3 p-3 border rounded-md transition-all text-left group ${activeTool === t.id ? 'border-pink-500 bg-pink-500/5 dark:bg-pink-500/10 text-pink-600 dark:text-white font-bold' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-200'}`}
                  >
                    <div className={`transition-colors ${activeTool === t.id ? 'text-pink-600 dark:text-pink-500' : 'text-slate-300 dark:text-gray-400'}`}>{t.icon}</div>
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                ))}
              </div>
           </section>
           
           {/* ẢNH THAM CHIẾU THEO LOẠI */}
           <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest px-1">Tài sản tham chiếu</label>
              
              {/* NOTE GIỮA LABEL VÀ HÌNH ẢNH */}
              <div className="p-4 bg-pink-500/5 border border-pink-500/20 rounded-lg text-left">
                {activeTool === 'TRY_ON' && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase">🛍️ THỬ ĐỒ ẢO - Preview sản phẩm</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase leading-relaxed tracking-tight">
                      • IMAGE 1: Ảnh khách/mẫu • IMAGE 2: Sản phẩm cần thử <br />
                      • Giữ NGUYÊN dáng người, tư thế, góc chụp <br />
                      • Dùng cho: E-commerce, xem trước sản phẩm
                    </p>
                  </div>
                )}
                {activeTool === 'CHANGE_OUTFIT' && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase">🔄 THAY TRANG PHỤC - Chỉnh sửa ảnh</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase leading-relaxed tracking-tight">
                      • IMAGE 1: Ảnh gốc cần sửa • IMAGE 2: Đồ mới muốn mặc <br />
                      • Tư thế CÓ THỂ điều chỉnh tự nhiên <br />
                      • Dùng cho: Edit ảnh cũ, đổi style, social media
                    </p>
                  </div>
                )}
                {activeTool === 'GEN_FASHION' && (
                  <p className="text-[10px] font-bold text-pink-600 dark:text-pink-400 leading-relaxed uppercase italic">
                    📌 Tùy chọn: Thêm ảnh tham chiếu phong cách, người mẫu, quần áo để AI lấy cảm hứng
                  </p>
                )}
                {activeTool === 'MODEL_GEN' && (
                  <p className="text-[10px] font-bold text-pink-600 dark:text-pink-400 leading-relaxed uppercase italic">
                    📌 IMAGE 1: Ảnh mẫu tham chiếu • IMAGE 2: Trang phục • IMAGE 3+: Phong cách chụp
                  </p>
                )}
                {activeTool === 'PRODUCT_GEN' && (
                  <p className="text-[10px] font-bold text-pink-600 dark:text-pink-400 leading-relaxed uppercase italic">
                    📌 IMAGE 1: Ảnh sản phẩm cần chụp • IMAGE 2+: Phong cách/ánh sáng tham chiếu
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Slot Người mẫu */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-600 ml-1">Người mẫu</span>
                  <div 
                    onClick={() => modelInputRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${modelImg ? 'border-pink-500 bg-pink-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-pink-500/50'}`}
                  >
                    {isUploading === 'MODEL' ? (
                      <Loader2 size={24} className="animate-spin text-pink-500" />
                    ) : modelImg ? (
                      <>
                        <img src={modelImg} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <RefreshCw size={20} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <User size={28} className="text-slate-300 dark:text-gray-700" />
                        <Plus className="absolute bottom-3 right-3 text-pink-500" size={14} />
                      </>
                    )}
                    {modelImg && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setModelImg(null); }} 
                        className="absolute top-2 right-2 bg-pink-600 text-white p-1 rounded-full shadow-lg z-20"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  <input type="file" ref={modelInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'MODEL')} />
                </div>

                {/* Slot Sản phẩm / Áo */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-600 ml-1">Sản phẩm (Áo/Váy)</span>
                  <div 
                    onClick={() => garmentInputRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${garmentImg ? 'border-pink-500 bg-pink-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-pink-500/50'}`}
                  >
                    {isUploading === 'GARMENT' ? (
                      <Loader2 size={24} className="animate-spin text-pink-500" />
                    ) : garmentImg ? (
                      <>
                        <img src={garmentImg} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <RefreshCw size={20} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Shirt size={28} className="text-slate-300 dark:text-gray-700" />
                        <Plus className="absolute bottom-3 right-3 text-pink-500" size={14} />
                      </>
                    )}
                    {garmentImg && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setGarmentImg(null); }} 
                        className="absolute top-2 right-2 bg-pink-600 text-white p-1 rounded-full shadow-lg z-20"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  <input type="file" ref={garmentInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'GARMENT')} />
                </div>
              </div>
           </section>

           <section className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">Danh mục</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-bold outline-none text-slate-900 dark:text-white">
                   {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">Phong cách</label>
                <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-bold outline-none text-slate-900 dark:text-white">
                   {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
           </section>

           {/* GÓC MÁY & KIỂU POSE */}
           <section className="grid grid-cols-2 gap-4">
              <CustomStudioDropdown 
                label="GÓC MÁY" 
                value={angle} 
                options={ANGLES} 
                onSelect={setAngle} 
              />
              <CustomStudioDropdown 
                label="KIỂU POSE" 
                value={pose} 
                options={POSES} 
                onSelect={setPose} 
              />
           </section>

           <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest">Mô tả kịch bản</label>
                <button onClick={handleEnhancePrompt} className="text-[9px] font-black text-orange-500 uppercase flex items-center gap-1 hover:brightness-110">
                  <Sparkles size={10} /> Sáng tạo
                </button>
              </div>
              <textarea 
                value={prompt} onChange={e => setPrompt(e.target.value)} 
                className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-[11px] font-bold focus:border-pink-500 outline-none rounded-lg text-slate-800 dark:text-white shadow-inner" 
                placeholder="VD: Ánh sáng Studio, bối cảnh sang trọng..." 
              />
           </section>

           <section className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Model</label>
                 <select value={selectedModel.id} onChange={e => setSelectedModel(AI_MODELS.find(m => m.id === e.target.value)!)} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-bold outline-none text-slate-900 dark:text-white">
                   {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Tỷ lệ</label>
                 <select value={ratio} onChange={e => setRatio(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-bold outline-none text-slate-900 dark:text-white">
                   {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
              </div>
              {/* NEW: RESOLUTION AND QUANTITY */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Độ phân giải</label>
                 <select value={res} onChange={e => setRes(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-bold outline-none text-slate-900 dark:text-white">
                   {RESOLUTIONS.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Số lượng</label>
                 <input 
                   type="number" 
                   min="1" max="4" 
                   value={quantity} 
                   onChange={e => setQuantity(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))} 
                   className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-bold outline-none text-slate-900 dark:text-white" 
                 />
              </div>
           </section>
        </div>
      </aside>

      <main className="flex-grow flex flex-col relative overflow-hidden">
         <div className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/60 dark:bg-[#0d0e12]/60 backdrop-blur-md z-[70]">
            <div className="flex bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-lg border border-slate-100 dark:border-white/5">
              <button onClick={() => setActiveTab('current')} className={`px-8 py-2 text-[11px] font-black uppercase rounded-full transition-all ${activeTab === 'current' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Phiên hiện tại</button>
              <button onClick={() => setActiveTab('collection')} className={`px-8 py-2 text-[11px] font-black uppercase rounded-full transition-all ${activeTab === 'collection' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Bộ sưu tập</button>
            </div>
         </div>

         <div className="flex-grow flex items-center justify-center p-12 relative">
            <AnimatePresence mode="wait">
               {activeResult ? (
                  <motion.div key={activeResult.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-4xl w-full aspect-[3/4] max-h-[75vh] bg-black rounded-sm overflow-hidden shadow-3xl">
                    {activeResult.status === 'processing' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-slate-100/80 dark:bg-black/60 backdrop-blur-sm">
                        <div className="relative">
                          <Loader2 size={80} className="text-pink-600 animate-spin" />
                          <Sparkles size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-400 animate-pulse" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.5em] text-pink-600 animate-pulse">Synthesizing...</p>
                      </div>
                    ) : activeResult.url ? (
                      <img src={activeResult.url} className="w-full h-full object-cover" alt="Fashion Result" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-red-50 gap-4">
                        <AlertCircle size={48} />
                        <p className="text-sm font-black uppercase tracking-widest">Hệ thống lỗi</p>
                      </div>
                    )}
                    {activeResult.status === 'done' && (
                      <div className="absolute top-6 right-6 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => openEditor(activeResult.url!)} className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-2xl text-slate-800 dark:text-white"><Edit3 size={18}/></button>
                        <a href={activeResult.url!} download className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                      </div>
                    )}
                  </motion.div>
               ) : (
                 <div className="text-center space-y-6 opacity-10 flex flex-col items-center select-none">
                   <Shirt size={100} strokeWidth={1} />
                   <p className="text-xl font-black uppercase tracking-[0.5em] italic">Viewport_Offline</p>
                 </div>
               )}
            </AnimatePresence>
         </div>

         {/* STICKY BOTTOM ACTIONS */}
         <div className="absolute bottom-0 left-0 w-full p-6 bg-white/95 dark:bg-[#0d0e12]/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 z-[80] shadow-2xl">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
               <ResourceControl 
                  usagePreference={usagePreference}
                  credits={credits}
                  actionCost={actionCost}
                  onSettingsClick={() => setShowResourceModal(true)}
               />
               
               <button 
                 onClick={handleGenerate} 
                 disabled={isGenerateDisabled} 
                 className={`flex-grow py-5 bg-gradient-to-r from-pink-700 to-purple-600 text-white font-black uppercase text-xs tracking-[0.5em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 rounded-lg relative overflow-hidden ${isGenerateDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'group'}`}
               >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                  KHỞI CHẠY STUDIO
               </button>
            </div>
         </div>
      </main>

      <aside className="w-[320px] shrink-0 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0e12] flex flex-col overflow-hidden z-50 transition-all duration-500">
         <div className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center px-6 shrink-0 bg-slate-50 dark:bg-black/20"><div className="flex items-center gap-2"><HistoryIcon size={14} className="text-brand-blue" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Lịch sử</span></div></div>
         <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
            <AnimatePresence initial={false}>
               {results.map((res) => (
                  <motion.div key={res.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 group ${activeResultId === res.id ? 'border-pink-500 bg-pink-500/5 shadow-lg' : 'border-black/5 dark:border-white/5 bg-white dark:bg-[#141416] hover:border-black/10'}`} onClick={() => setActiveResultId(res.id)}>
                     <div className="relative aspect-square rounded-xl overflow-hidden bg-black/5 border border-black/5">
                        {res.status === 'processing' ? (<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-black/20"><Loader2 size={24} className="text-pink-500 animate-spin" /></div>) : res.url ? (<img src={res.url} className="w-full h-full object-cover" alt="" />) : (<div className="absolute inset-0 flex items-center justify-center text-red-500 bg-red-50 gap-4"><AlertCircle size={20}/></div>)}
                     </div>
                     <div className="px-1 space-y-1"><h4 className="text-[10px] font-black uppercase italic tracking-tighter truncate text-slate-800 dark:text-white/90">"{res.prompt}"</h4><div className="flex justify-between items-center text-[7px] font-bold text-gray-500 uppercase tracking-widest"><span>{res.timestamp}</span><span className="text-pink-600">{res.type}</span></div></div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </aside>

      <ProductImageWorkspace isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} initialImage={editorImage} onApply={handleEditorApply} />
      
      <ResourceAuthModal 
        isOpen={showResourceModal} 
        onClose={() => setShowResourceModal(false)} 
        onConfirm={(pref) => { 
          setUsagePreference(pref as any); 
          localStorage.setItem('skyverses_usage_preference', pref); 
          setShowResourceModal(false); 
          if (isResumingGenerate) { setIsResumingGenerate(false); performInference(pref as any); } 
        }} 
        hasPersonalKey={hasPersonalKey} 
        totalCost={actionCost} 
      />

      <AnimatePresence>
        {showLowCreditAlert && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="max-w-md w-full bg-white dark:bg-[#111218] p-10 border border-slate-200 dark:border-white/10 rounded-sm text-center space-y-8 shadow-3xl"><div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500"><AlertTriangle size={40} /></div><div className="space-y-3"><h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3><p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-tight">Fashion synthesis yêu cầu ít nhất **{actionCost} credits**.</p></div><div className="flex flex-col gap-4"><Link to="/credits" className="bg-pink-600 text-white py-5 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-xl text-center hover:bg-pink-700 transition-colors">Nạp thêm Credits</Link><button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Đóng</button></div></motion.div></motion.div>)}
      </AnimatePresence>
      
      <ImageLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onConfirm={handleLibrarySelect} onEdit={(url) => { openEditor(url); setIsLibraryOpen(false); }} maxSelect={6} />
    </div>
  );
};

export default FashionStudioWorkspace;
