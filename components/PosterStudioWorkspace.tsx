
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Download, Share2, Loader2, 
  ImageIcon, Plus, Upload, 
  RefreshCw, Sparkles, Sliders, 
  Palette, Wand2, Target, 
  Maximize2, History as HistoryIcon,
  Type, Box, LayoutGrid,
  Trash2, Utensils, Baby, Briefcase, 
  CheckCircle2, LucideImage, ChevronRight,
  // Added Coins and AlertTriangle to imports
  Percent, Gift, MessageCircle, Users, Shirt, Cpu, Plane, 
  GraduationCap, Building, Heart, TrendingUp, Car, Dog, 
  Activity, Music, Gamepad, Church, Cake, TreePine, Moon, 
  Ghost, Sun, Snowflake, Flower2, Coffee, Croissant, Store, 
  Waves, Dumbbell, Award, Megaphone, ChevronDown, Smartphone, ShieldCheck,
  Coins, AlertTriangle
} from 'lucide-react';
import { generateDemoImage, generateDemoText } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'skyverses_poster_vault';

// Fix: Moved Star component definition before its usage in ALL_CATEGORIES to avoid hoisting error.
// Fix: Added default fill value and made it optional to satisfy TypeScript requirements.
const Star = ({ size, fill = "none" }: { size: number, fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

// Danh sách đầy đủ danh mục dựa trên screenshot
const ALL_CATEGORIES = [
  { id: 'sale', label: 'Sale', icon: <Percent size={24}/> },
  { id: 'products', label: 'Sản phẩm', icon: <Briefcase size={24}/> },
  { id: 'events', label: 'Sự kiện', icon: <Star size={24}/> },
  { id: 'ads', label: 'Quảng cáo', icon: <Megaphone size={24}/> },
  { id: 'festivals', label: 'Lễ hội', icon: <Gift size={24}/> },
  { id: 'social', label: 'MXH', icon: <MessageCircle size={24}/> },
  { id: 'branding', label: 'Thương hiệu', icon: <CheckCircle2 size={24}/> },
  { id: 'hr', label: 'Tuyển dụng', icon: <Users size={24}/> },
  { id: 'food', label: 'Ẩm thực', icon: <Utensils size={24}/> },
  { id: 'fashion', label: 'Thời trang', icon: <Shirt size={24}/> },
  { id: 'tech', label: 'Công nghệ', icon: <Cpu size={24}/> },
  { id: 'beauty', label: 'Làm đẹp', icon: <Sparkles size={24}/> },
  { id: 'travel', label: 'Du lịch', icon: <Plane size={24}/> },
  { id: 'education', label: 'Giáo dục', icon: <GraduationCap size={24}/> },
  { id: 'gym', label: 'Gym', icon: <Zap size={24}/> },
  { id: 'realestate', label: 'BĐS', icon: <Building size={24}/> },
  { id: 'health', label: 'Y tế', icon: <Heart size={24}/> },
  { id: 'finance', label: 'Tài chính', icon: <TrendingUp size={24}/> },
  { id: 'auto', label: 'Ô tô', icon: <Car size={24}/> },
  { id: 'pets', label: 'Thú cưng', icon: <Dog size={24}/> },
  { id: 'sports', label: 'Thể thao', icon: <Activity size={24}/> },
  { id: 'music', label: 'Âm nhạc', icon: <Music size={24}/> },
  { id: 'gaming', label: 'Game', icon: <Gamepad size={24}/> },
  { id: 'wedding', label: 'Cưới hỏi', icon: <Church size={24}/> },
  { id: 'birthday', label: 'Sinh nhật', icon: <Cake size={24}/> },
  { id: 'noel', label: 'Giáng sinh', icon: <TreePine size={24}/> },
  { id: 'newyear', label: 'Năm mới', icon: <Moon size={24}/> },
  { id: 'halloween', label: 'Halloween', icon: <Ghost size={24}/> },
  { id: 'valentine', label: 'Valentine', icon: <Heart size={24}/> },
  { id: 'summer', label: 'Mùa hè', icon: <Sun size={24}/> },
  { id: 'winter', label: 'Mùa đông', icon: <Snowflake size={24}/> },
  { id: 'spring', label: 'Mùa xuân', icon: <Flower2 size={24}/> },
  { id: 'coffee', label: 'Cà phê', icon: <Coffee size={24}/> },
  { id: 'bakery', label: 'Bánh ngọt', icon: <Croissant size={24}/> },
  { id: 'restaurant', label: 'Nhà hàng', icon: <Store size={24}/> },
  { id: 'spa', label: 'Spa', icon: <Waves size={24}/> },
  { id: 'gymkm', label: 'KM Gym', icon: <Dumbbell size={24}/> },
  { id: 'yoga', label: 'Yoga', icon: <Heart size={24}/> },
  { id: 'kids', label: 'Trẻ em', icon: <Baby size={24}/> },
  { id: 'school', label: 'Học đường', icon: <Award size={24}/> },
];

const STYLES = ['Hiện đại', 'Cổ điển', 'Tối giản', 'Cyberpunk', 'Luxury', 'Nghệ thuật'];
const MODELS = ['Nano Banana Pro', 'Nano Banana Lite', 'Gemini 3 Pro Image'];
const SIZES = ['9:16', '16:9', '1:1', '4:5', '3:4'];
const MODES = ['Chuyên nghiệp', 'Nhanh', 'Cân bằng'];
const RESOLUTIONS = ['1k', '2k', '4k'];

interface PosterSession {
  id: string;
  url: string;
  prompt: string;
  config: any;
  timestamp: string;
}

const PosterStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  // UI State
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES[2].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [status, setStatus] = useState('Sẵn sàng');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'library'>('current');

  // Content State
  const [prompt, setPrompt] = useState('một hình con mèo');
  const [title, setTitle] = useState('10%');
  const [subtitle, setSubtitle] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  
  // Advanced Settings State
  const [brandName, setBrandName] = useState('');
  const [brandColors, setBrandColors] = useState(['#FF5722', '#FFC107']);
  const [hexInput, setHexInput] = useState('#2196F3');
  const [useBrandColor, setUseBrandColor] = useState(true);
  const [addTextToPoster, setAddTextToPoster] = useState(true);

  // AI Configuration State
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);
  const [quantity, setQuantity] = useState(1);

  // History State
  const [sessions, setSessions] = useState<PosterSession[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  // LOAD HISTORY FROM BROWSER DB (localStorage)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi nạp dữ liệu từ browser DB", e);
      }
    }
  }, []);

  // Lấy Object danh mục đang chọn để hiển thị Tag
  const selectedCategoryObj = ALL_CATEGORIES.find(c => c.id === activeCategory);

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setStatus('Đang tối ưu mô tả...');
    try {
      const systemInstruction = "Bạn là một chuyên gia marketing. Hãy viết lại mô tả sau đây thành một prompt cực kỳ chi tiết cho AI tạo ảnh để tạo ra một poster bán hàng ấn tượng. Giữ nội dung cốt lõi nhưng thêm vào các chi tiết về ánh sáng, vật liệu và bố cục. Trả về kết quả bằng Tiếng Việt ngắn gọn.";
      const enhanced = await generateDemoText(`${systemInstruction}\n\nNội dung gốc: "${prompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
        setPrompt(enhanced);
        setStatus('Đã tăng cường prompt');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files) as File[];
      const remainingSlots = 6 - references.length;
      const filesToProcess = fileList.slice(0, remainingSlots);

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReferences(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // --- BRAND COLOR LOGIC ---
  const handleAddColor = () => {
    if (brandColors.length < 10) {
      setBrandColors([...brandColors, hexInput]);
    }
  };

  const handleColorBlockClick = (index: number) => {
    setEditingColorIndex(index);
    if (colorPickerRef.current) {
      colorPickerRef.current.value = brandColors[index];
      colorPickerRef.current.click();
    }
  };

  const onColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (editingColorIndex !== null) {
      const newColors = [...brandColors];
      newColors[editingColorIndex] = newColor;
      setBrandColors(newColors);
    }
  };

  const removeBrandColor = (index: number) => {
    setBrandColors(brandColors.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    if (!isAuthenticated) {
      login();
      return;
    }

    const totalCost = 150 * quantity;
    if (credits < totalCost) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsGenerating(true);
    setStatus('Đang kết nối H100 Node...');

    try {
      const successful = useCredits(totalCost);
      if (!successful) throw new Error('Insufficient credits');

      const categoryLabel = ALL_CATEGORIES.find(c => c.id === activeCategory)?.label;
      const brandContext = brandName ? `Thương hiệu: ${brandName}.` : "";
      const colorContext = useBrandColor ? `Tông màu chủ đạo: ${brandColors.join(', ')}.` : "";
      const textContext = addTextToPoster ? `Bao gồm tiêu đề chính: "${title}" và tiêu đề phụ: "${subtitle}".` : "Tạo ảnh không có chữ.";
      
      const fullPrompt = `Tạo poster marketing chuyên nghiệp cho lĩnh vực ${categoryLabel}. 
      Phong cách: ${selectedStyle}. Kích thước tỷ lệ: ${selectedSize}. Chế độ: ${selectedMode}. 
      ${brandContext} ${colorContext} ${textContext} 
      Mô tả chi tiết: ${prompt}. 
      Yêu cầu: Chất lượng ${selectedRes}, bố cục hiện đại, độ tương phản cao, chuẩn quảng cáo thương mại.`;

      const imageUrl = await generateDemoImage(fullPrompt, references);
      
      if (imageUrl) {
        setResult(imageUrl);
        const newSession: PosterSession = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: prompt,
          config: { selectedSize, selectedStyle, selectedModel },
          timestamp: new Date().toLocaleString()
        };

        // SAVE TO LOCAL DATABASE
        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
        
        setStatus('Hoàn tất');
      } else {
        setStatus('Lỗi tạo ảnh');
      }
    } catch (err) {
      console.error(err);
      setStatus('Lỗi hệ thống');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (result && sessions.find(s => s.id === id)?.url === result) {
      setResult(null);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#f4f7f9] dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">
      
      {/* 1. TOP NAV */}
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 transition-colors">
          <button 
            onClick={() => setViewMode('current')}
            className={`px-5 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === 'current' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Phiên hiện tại
          </button>
          <button 
            onClick={() => setViewMode('library')}
            className={`px-5 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === 'library' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Thư viện ({sessions.length})
          </button>
          <button className="px-5 py-1.5 text-[11px] font-bold text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors">Chọn tất cả</button>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full">
              <Coins size={12} className="text-brand-blue" />
              <span className="text-[10px] font-black text-brand-blue">{credits.toLocaleString()} CR</span>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
           </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        
        {/* 2. SIDEBAR ĐIỀU KHIỂN (TRÁI) */}
        <aside className="w-[380px] border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col shrink-0 overflow-y-auto no-scrollbar pb-10 transition-colors duration-500">
           <div className="p-5 space-y-8">
              
              {/* DANH MỤC */}
              <section className="space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400 transition-colors">
                    <Target size={14} className="text-brand-blue" /> DANH MỤC
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                    {ALL_CATEGORIES.filter(c => ['events', 'products', 'kids', 'food'].includes(c.id)).map(c => (
                      <button 
                        key={c.id} onClick={() => setActiveCategory(c.id)}
                        className={`flex flex-col items-center justify-center gap-3 aspect-square border transition-all rounded-lg ${activeCategory === c.id ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 text-purple-600 dark:text-white shadow-sm' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-200 dark:hover:border-white/10'}`}
                      >
                         <div className="scale-75">{c.icon}</div>
                         <span className="text-[9px] font-bold">{c.label}</span>
                      </button>
                    ))}
                 </div>

                 {/* TAG DANH MỤC ĐANG CHỌN */}
                 <AnimatePresence>
                    {selectedCategoryObj && (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }} 
                         animate={{ opacity: 1, x: 0 }} 
                         exit={{ opacity: 0, x: -10 }}
                         className="pt-2"
                       >
                          <button 
                            className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-102 active:scale-98 transition-all group"
                          >
                             <div className="scale-75 text-white/90">{selectedCategoryObj.icon}</div>
                             <span className="text-[11px] font-black uppercase tracking-widest italic">{selectedCategoryObj.label}</span>
                             <div 
                               onClick={(e) => { e.stopPropagation(); setActiveCategory('events'); }}
                               className="p-1 hover:bg-white/20 rounded-full transition-colors ml-1"
                             >
                                <X size={14} className="opacity-60 group-hover:opacity-100" />
                             </div>
                          </button>
                       </motion.div>
                    )}
                 </AnimatePresence>

                 <button 
                   onClick={() => setShowCategoryModal(true)}
                   className="w-full py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all rounded-full flex items-center justify-center gap-3 shadow-sm dark:shadow-none"
                 >
                   <LayoutGrid size={14} /> Xem thêm (36+)
                 </button>
              </section>

              {/* MÔ TẢ POSTER */}
              <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400 transition-colors">
                       <Type size={14} /> MÔ TẢ POSTER
                    </div>
                    <button 
                      onClick={handleEnhance}
                      disabled={isEnhancing || !prompt.trim()}
                      className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-30"
                    >
                       {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       Tăng cường
                    </button>
                 </div>
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 text-xs font-bold focus:border-brand-blue outline-none transition-all resize-none rounded-md text-slate-800 dark:text-white"
                   placeholder="Nhập ý tưởng cho poster của bạn..."
                 />
              </section>

              {/* TIÊU ĐỀ */}
              <section className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TIÊU ĐỀ CHÍNH (TÙY CHỌN)</label>
                    <input 
                      value={title} onChange={e => setTitle(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white" 
                      placeholder="VD: 10% OFF" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TIÊU ĐỀ PHỤ (TÙY CHỌN)</label>
                    <input 
                      value={subtitle} onChange={e => setSubtitle(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white" 
                      placeholder="VD: Chỉ áp dụng hôm nay" 
                    />
                 </div>
              </section>

              {/* ẢNH THAM CHIẾU */}
              <section className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-widest">
                    <div className="flex items-center gap-2">
                       <LucideImage size={14} /> ẢNH THAM CHIẾU
                    </div>
                    <span className="text-slate-300 dark:text-gray-600">{references.length}/6</span>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {references.map((ref, idx) => (
                       <div key={idx} className="relative aspect-square bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md overflow-hidden group transition-colors">
                          <img src={ref} className="w-full h-full object-cover" />
                          <button onClick={() => setReferences(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                             <X size={10} />
                          </button>
                       </div>
                    ))}
                    {references.length < 6 && (
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="aspect-square border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-md flex flex-col items-center justify-center gap-2 hover:border-brand-blue group transition-all"
                       >
                          <Plus size={18} className="text-slate-300 dark:text-gray-400 group-hover:text-brand-blue" />
                          <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase">Thêm ảnh</span>
                       </button>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
              </section>

              {/* MODEL SETTINGS GRID */}
              <section className="grid grid-cols-2 gap-x-4 gap-y-5 pt-4 border-t border-slate-100 dark:border-white/5 transition-colors">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">MODEL AI</label>
                    <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                       {MODELS.map(m => <option key={m} className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">{m}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">PHONG CÁCH</label>
                    <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                       {STYLES.map(s => <option key={s} className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">{s}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">KÍCH THƯỚC</label>
                    <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                       {SIZES.map(s => <option key={s} className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">{s}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">MODE</label>
                    <select value={selectedMode} onChange={e => setSelectedMode(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                       {MODES.map(m => <option key={m} className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">{m}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">RES</label>
                    <select value={selectedRes} onChange={e => setSelectedRes(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                       {RESOLUTIONS.map(r => <option key={r} className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">{r.toUpperCase()}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">SỐ LƯỢNG</label>
                    <input type="number" min="1" max="4" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white" />
                 </div>
              </section>

              {/* CREDIT ESTIMATE */}
              <div className="flex justify-between items-center pt-4 text-orange-600 dark:text-orange-400 transition-colors">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                    <Zap size={14} fill="currentColor" /> Đơn giá: 150
                 </div>
                 <div className="text-[12px] font-black uppercase italic">
                    Tổng: {150 * quantity} credits
                 </div>
              </div>

              {/* TÙY CHỌN NÂNG CAO */}
              <section className="space-y-5">
                 <button 
                   onClick={() => setShowAdvanced(!showAdvanced)}
                   className="w-full flex items-center justify-between p-3 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-md text-[10px] font-black uppercase tracking-widest hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-500 dark:text-white"
                 >
                    <div className="flex items-center gap-2">
                       <Sliders size={14} /> Tùy chọn nâng cao
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
                 </button>

                 <AnimatePresence>
                    {showAdvanced && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-6 overflow-hidden">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TÊN THƯƠNG HIỆU</label>
                             <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold outline-none rounded-md text-slate-800 dark:text-white" placeholder="Tên thương hiệu của bạn" />
                          </div>

                          {/* --- MÀU THƯƠNG HIỆU --- */}
                          <div className="space-y-3">
                             <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">MÀU THƯƠNG HIỆU</label>
                             <div className="flex flex-wrap gap-2.5 items-center p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-md transition-colors">
                                {brandColors.map((color, i) => (
                                   <div key={i} className="relative group cursor-pointer">
                                      <div 
                                        onClick={() => handleColorBlockClick(i)}
                                        className="w-8 h-8 rounded-sm shadow-lg border border-slate-200 dark:border-white/10 hover:scale-110 transition-transform" 
                                        style={{ backgroundColor: color }}
                                      ></div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); removeBrandColor(i); }}
                                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                         <X size={8} />
                                      </button>
                                   </div>
                                ))}
                                
                                <input 
                                  type="color" ref={colorPickerRef} className="hidden" 
                                  onChange={onColorPickerChange} 
                                />

                                <div className="flex-grow flex items-center gap-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-sm transition-colors">
                                   <span className="text-[9px] text-slate-400 dark:text-gray-600 uppercase font-black">#HEX</span>
                                   <input 
                                     value={hexInput} onChange={e => setHexInput(e.target.value.toUpperCase())}
                                     className="bg-transparent border-none outline-none text-[10px] font-black w-full text-brand-blue" 
                                     placeholder="#FFFFFF" 
                                   />
                                   <button 
                                     onClick={handleAddColor}
                                     className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                   >
                                      <CheckCircle2 size={14} />
                                   </button>
                                </div>
                                
                                <button 
                                  onClick={() => { setEditingColorIndex(null); handleAddColor(); }}
                                  className="w-8 h-8 border border-dashed border-slate-300 dark:border-white/20 rounded-sm flex items-center justify-center text-slate-400 hover:border-slate-500 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all hover:bg-white/5"
                                >
                                   <Plus size={14} />
                                </button>
                             </div>
                             <p className="text-[8px] text-slate-400 dark:text-gray-600 font-bold uppercase italic">* Nhấp vào ô màu để thay đổi hoặc thêm</p>
                          </div>

                          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5 transition-colors">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">Sử dụng màu thương hiệu</span>
                                <Toggle active={useBrandColor} onChange={() => setUseBrandColor(!useBrandColor)} />
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">Thêm chữ vào poster</span>
                                <Toggle active={addTextToPoster} onChange={() => setAddTextToPoster(!addTextToPoster)} />
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </section>

              {/* NÚT TẠO POSTER */}
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_80px_rgba(234,88,12,0.3)] hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-4 rounded-xl disabled:opacity-30"
              >
                 {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Wand2 size={18} />}
                 TẠO POSTER
              </button>

              {/* PHIÊN LÀM VIỆC */}
              <section className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-4 transition-colors">
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">
                    <HistoryIcon size={14} /> PHIÊN LÀM VIỆC
                 </div>
                 <div className="space-y-3">
                    {sessions.slice(0, 5).map(s => (
                       <div key={s.id} className="relative group/sess">
                          <button onClick={() => { setResult(s.url); setViewMode('current'); }} className="w-full flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg hover:border-brand-blue transition-all group text-left shadow-sm dark:shadow-none">
                             <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-slate-100 dark:border-transparent">
                                <img src={s.url} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-grow min-w-0">
                                <p className="text-[9px] font-black text-slate-900 dark:text-white truncate uppercase">{s.prompt}</p>
                                <p className="text-[7px] text-slate-400 dark:text-gray-500 uppercase">{s.timestamp}</p>
                             </div>
                             <ChevronRight size={12} className="text-slate-300 dark:text-gray-600 group-hover:text-brand-blue" />
                          </button>
                          <button onClick={(e) => deleteSession(e, s.id)} className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/sess:opacity-100 transition-opacity shadow-lg">
                             <Trash2 size={10} />
                          </button>
                       </div>
                    ))}
                    {sessions.length === 0 && (
                       <div className="py-12 text-center opacity-20">
                          <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-400 dark:text-white">Chưa có phiên nào</p>
                       </div>
                    )}
                 </div>
              </section>
           </div>
        </aside>

        {/* 3. MÀN HÌNH CHÍNH (PHẢI) */}
        <main className="flex-grow bg-[#f0f3f6] dark:bg-[#020202] relative overflow-hidden flex flex-col items-center justify-center p-8 transition-colors duration-500">
           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

           <AnimatePresence mode="wait">
              {viewMode === 'library' ? (
                 <motion.div key="library-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full overflow-y-auto p-10 no-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                       {sessions.map(s => (
                          <div key={s.id} className="relative group/lib aspect-[3/4] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden shadow-xl dark:shadow-2xl hover:border-brand-blue transition-all">
                             <img src={s.url} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/lib:opacity-100 transition-opacity"></div>
                             <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/lib:opacity-100 transition-all translate-x-4 group-hover/lib:translate-x-0">
                                <button onClick={(e) => deleteSession(e, s.id)} className="p-2 bg-red-500 text-white rounded-full shadow-lg"><Trash2 size={14}/></button>
                                <a href={s.url} download className="p-2 bg-white text-black rounded-full shadow-lg"><Download size={14}/></a  >
                             </div>
                             <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover/lib:opacity-100 transition-all translate-y-4 group-hover/lib:translate-y-0">
                                <p className="text-[8px] font-black uppercase text-brand-blue truncate mb-1">{s.prompt}</p>
                                <button onClick={() => { setResult(s.url); setViewMode('current'); }} className="w-full py-2 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-sm shadow-xl">Mở chỉnh sửa</button>
                             </div>
                          </div>
                       ))}
                       {sessions.length === 0 && (
                          <div className="col-span-full h-[50vh] flex flex-col items-center justify-center opacity-10 space-y-6">
                             <LayoutGrid size={120} className="text-slate-400 dark:text-white" />
                             <p className="text-xl font-black uppercase tracking-[0.5em] text-slate-800 dark:text-white">Thư viện trống</p>
                          </div>
                       )}
                    </div>
                 </motion.div>
              ) : isGenerating ? (
                 <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 text-center">
                    <div className="relative">
                       <Loader2 size={120} className="text-orange-500 animate-spin" strokeWidth={1} />
                       <Sparkles size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-800 dark:text-white">ĐANG TỔNG HỢP PHÂN CẢNH...</p>
                       <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">H100 Node #042 // Neural Lattice</p>
                    </div>
                 </motion.div>
              ) : result ? (
                 <motion.div key="res" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`relative shadow-[0_50px_150px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_150px_rgba(0,0,0,1)] border border-slate-200 dark:border-white/5 bg-white dark:bg-black rounded-sm overflow-hidden group ${selectedSize === '9:16' ? 'aspect-[9/16] h-[75vh]' : selectedSize === '16:9' ? 'aspect-video w-[70vw]' : 'aspect-square h-[70vh]'} transition-colors duration-500`}>
                    <img src={result} className="w-full h-full object-cover" alt="Poster Result" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button className="p-4 bg-white dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-xl text-slate-800 dark:text-white"><Share2 size={18}/></button>
                       <a href={result} download={`poster_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-xl"><Download size={18}/></a>
                    </div>
                    <div className="absolute bottom-6 left-6 space-y-1 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                       <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Synthesis Verified</p>
                       <p className="text-[8px] text-white/50 uppercase">{selectedModel} // {selectedRes}</p>
                    </div>
                 </motion.div>
              ) : (
                 <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 opacity-20 dark:opacity-10 flex flex-col items-center transition-opacity">
                    <div className="w-32 h-32 bg-slate-200 dark:bg-white/5 rounded-3xl flex items-center justify-center border border-slate-300 dark:border-white/10 transition-colors">
                       <LayoutGrid size={80} strokeWidth={1} className="text-slate-500 dark:text-white" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-800 dark:text-white">Chưa có poster</h3>
                       <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500">Tạo poster marketing đầu tiên với AI</p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>

           <div className="absolute bottom-10 flex items-center gap-12 text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest transition-colors">
              <div className="flex items-center gap-2"><Smartphone size={14}/> Mobile Optimised</div>
              <div className="flex items-center gap-2"><Maximize2 size={14}/> 4K Visual Depth</div>
              <div className="flex items-center gap-2"><ShieldCheck size={14}/> Enterprise Safe</div>
           </div>
        </main>
      </div>

      {/* --- ALL CATEGORIES MODAL --- */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 lg:p-12"
          >
             <motion.div 
               initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
               className="w-full max-w-5xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col max-h-[90vh] shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-colors"
             >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 transition-colors">
                   <div className="flex items-center gap-3">
                      <LayoutGrid className="text-pink-500" size={24} />
                      <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Tất cả danh mục</h2>
                   </div>
                   <button onClick={() => setShowCategoryModal(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <X size={24} />
                   </button>
                </div>

                {/* Modal Body - Scrollable Grid */}
                <div className="flex-grow overflow-y-auto p-8 lg:p-10 no-scrollbar">
                   <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                      {ALL_CATEGORIES.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => { setActiveCategory(c.id); setShowCategoryModal(false); }}
                          className={`flex flex-col items-center justify-center gap-4 aspect-square rounded-xl border transition-all group ${activeCategory === c.id ? 'border-pink-500 bg-pink-50 dark:bg-gradient-to-br dark:from-pink-500/20 dark:to-purple-600/20 text-pink-600 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(236,72,153,0.2)]' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-200 dark:hover:border-white/10'}`}
                        >
                           <div className={`transition-transform duration-300 ${activeCategory === c.id ? 'scale-110' : 'group-hover:scale-110'}`}>{c.icon}</div>
                           <span className="text-[10px] font-black uppercase tracking-tighter text-center px-1">{c.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-end transition-colors">
                   <button 
                     onClick={() => setShowCategoryModal(false)}
                     className="px-10 py-3 bg-pink-600 text-white font-black uppercase text-[12px] tracking-widest rounded-lg hover:bg-pink-500 active:scale-95 transition-all shadow-xl"
                   >
                     Đóng
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOW CREDIT DIALOG */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
             <div className="max-w-md w-full bg-white dark:bg-[#0c0c0e] p-10 border border-slate-200 dark:border-white/10 rounded-sm text-center space-y-8 shadow-3xl transition-colors">
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500"><AlertTriangle size={40} /></div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3>
                   <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">Việc khởi tạo yêu cầu **150 credits**. Vui lòng nạp thêm để tiếp tục.</p>
                </div>
                <div className="flex flex-col gap-4">
                   <Link to="/credits" className="bg-orange-500 text-white py-5 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-xl text-center hover:bg-orange-600 transition-colors">Nạp thêm Credits</Link>
                   <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Để sau</button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-orange-500' : 'bg-slate-300 dark:bg-gray-700'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${active ? 'left-5.5' : 'left-0.5'}`} />
  </button>
);

export default PosterStudioWorkspace;
