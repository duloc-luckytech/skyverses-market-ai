
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, Loader2, Search, Zap, Command, Box, 
  Cpu, Gamepad2, Palette, Globe, Target, Wand2,
  Briefcase, Activity, ChevronRight, Tags, BarChart3,
  Hash
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL, getHeaders } from '../apis/config';

interface ISubCategory {
  code: string;
  name: string;
  services: string[];
}

interface ICategory {
  _id: string;
  code: string;
  name: string;
  subCategories: ISubCategory[];
  status: string;
}

interface MarketSearchTerminalProps {
  query: string;
  setQuery: (val: string) => void;
  primary: string; 
  setPrimary: (val: string) => void;
  secondary: string; 
  setSecondary: (val: string) => void;
}

const MarketSearchTerminal: React.FC<MarketSearchTerminalProps> = ({
  query, setQuery, primary, setPrimary, secondary, setSecondary
}) => {
  const { t } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [directiveIndex, setDirectiveIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Content Focused Directives for Creators & Businesses
  const marketDirectives = [
    "Tìm kiếm công cụ tạo video quảng cáo...",
    "Giải pháp hình ảnh AI cho thương hiệu",
    "Tự động hóa sản xuất nội dung mạng xã hội",
    "Khám phá các mẫu nhân vật AI đồng nhất",
    "Phục chế và nâng cấp chất lượng tư liệu",
    "Hệ thống thiết kế kịch bản thông minh"
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Xử lý query: thay thế tất cả dấu + thành khoảng trắng
        const cleanQuery = query.replace(/\+/g, ' ').trim();
        const queryParams = new URLSearchParams();
        if (cleanQuery) queryParams.append('q', cleanQuery);
        if (primary && primary !== 'ALL') queryParams.append('category', primary);
        
        const response = await fetch(`${API_BASE_URL}/category?${queryParams.toString()}`, {
          headers: getHeaders()
        });
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (err) {
        console.error("Failed to load market categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [query, primary]);

  useEffect(() => {
    if (query || isFocused || isModalOpen) return;
    const interval = setInterval(() => {
      setDirectiveIndex((prev) => (prev + 1) % marketDirectives.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [query, isFocused, isModalOpen, marketDirectives.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  const activeCategory = useMemo(() => {
    return categories.find(c => c.code === primary) || null;
  }, [primary, categories]);

  const activeSubCategory = useMemo(() => {
    if (!activeCategory || secondary === 'ALL') return null;
    return activeCategory.subCategories.find(s => s.code === secondary) || null;
  }, [secondary, activeCategory]);

  const filteredCategories = useMemo(() => {
    const activeCats = categories.filter(c => c.status === 'active');
    if (!catSearch.trim()) return activeCats;
    
    const searchLow = catSearch.toLowerCase();
    return activeCats.filter(c => 
      c.name.toLowerCase().includes(searchLow) || 
      c.code.toLowerCase().includes(searchLow) ||
      c.subCategories.some(s => 
        s.name.toLowerCase().includes(searchLow) || 
        s.services.some(svc => svc.toLowerCase().includes(searchLow))
      )
    );
  }, [categories, catSearch]);

  const handleSelectNode = (pCode: string, sCode: string = 'ALL', serviceQuery: string = '') => {
    setPrimary(pCode);
    setSecondary(sCode);
    if (serviceQuery) setQuery(serviceQuery);
    setIsModalOpen(false);
    setCatSearch('');
  };

  const handleClearFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPrimary('ALL');
    setSecondary('ALL');
    setQuery('');
  };

  const getIconForCategory = (code: string) => {
    switch (code) {
      case 'AI_TOOLS': return <Cpu size={20} />;
      case 'GAMES': return <Gamepad2 size={20} />;
      case 'ART_DESIGN': return <Palette size={20} />;
      case 'WORLD': return <Globe size={20} />;
      case 'CASE_STUDIES': return <BarChart3 size={20} />;
      default: return <Briefcase size={20} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto md:mb-16 px-2 md:px-0 relative">
      <div className="relative group p-[1px] rounded-[2rem] md:rounded-full overflow-visible transition-all duration-500">
        <div className={`absolute inset-[-10px] bg-brand-blue/10 blur-3xl rounded-full transition-opacity duration-500 ${isFocused || isModalOpen ? 'opacity-100' : 'opacity-0'}`}></div>

        <div 
          onClick={() => setIsModalOpen(true)}
          className={`relative flex items-center bg-white dark:bg-[#0a0a0c] transition-all duration-500 rounded-[1.8rem] md:rounded-full overflow-hidden h-14 md:h-16 border ${
            isFocused || isModalOpen ? 'border-brand-blue shadow-2xl shadow-brand-blue/20' : 'border-black/5 dark:border-white/5 shadow-xl'
          }`}
        >
          <div className="pl-6 shrink-0 z-10">
            <Search size={18} className={isFocused || isModalOpen || query || primary !== 'ALL' ? 'text-brand-blue' : 'text-slate-400'} />
          </div>
          
          <div className="flex-grow h-full flex items-center px-4 gap-3 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {!query && !isFocused && primary === 'ALL' && (
                <motion.div
                  key={directiveIndex}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="absolute left-1 pointer-events-none text-sm md:text-base font-bold text-slate-400 dark:text-gray-600 tracking-tight whitespace-nowrap"
                >
                  {marketDirectives[directiveIndex]}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {primary !== 'ALL' && activeCategory && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-full shrink-0 shadow-lg shadow-brand-blue/20 z-20"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {activeCategory.name} {activeSubCategory ? `› ${activeSubCategory.name}` : ''}
                  </span>
                  <button onClick={handleClearFilters} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <input 
              type="text" 
              value={query}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm md:text-base font-bold text-black dark:text-white focus:outline-none tracking-tight px-1 z-10"
              placeholder=""
            />
          </div>

          <div className="pr-6 hidden sm:flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[9px] text-gray-400 font-bold uppercase italic transition-colors">
                <Command size={10} /> <span>K</span>
             </div>
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              ref={modalRef}
              initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-4 z-[200] bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[85vh] transition-colors"
            >
              <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></div>
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] italic text-gray-500">TRUNG TÂM GIẢI PHÁP SÁNG TẠO</h3>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                </div>
                <div className="relative group">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-blue/40" size={18} />
                  <input 
                    autoFocus
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Tìm theo lĩnh vực hoặc nhu cầu (VD: Video sản phẩm, Branding)..."
                    className="w-full bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-[1.2rem] py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-brand-blue/30 transition-all shadow-inner placeholder:text-gray-300 dark:placeholder:text-gray-800"
                  />
                </div>
              </div>

              <div className="flex-grow overflow-y-auto no-scrollbar p-6 md:p-8">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                    <Loader2 size={32} className="animate-spin text-brand-blue" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Đang tải danh mục...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ALL CATEGORIES CARD - CLEAN & MINIMALIST */}
                    <div 
                      onClick={() => handleSelectNode('ALL')}
                      className={`flex flex-col p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${primary === 'ALL' ? 'border-brand-blue bg-brand-blue/5 shadow-xl' : 'border-transparent bg-slate-50 dark:bg-white/[0.03] hover:border-slate-200 dark:hover:border-white/10'}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${primary === 'ALL' ? 'bg-brand-blue text-white shadow-lg' : 'bg-white dark:bg-black text-slate-400 group-hover:text-brand-blue'}`}>
                             <Sparkles size={24} />
                          </div>
                          <div className="space-y-0.5">
                             <h4 className="text-sm font-black uppercase italic tracking-tighter">Tất cả giải pháp</h4>
                             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest italic">Hệ sinh thái Skyverses</p>
                          </div>
                       </div>
                    </div>

                    {/* DYNAMIC CATEGORY CARDS */}
                    {filteredCategories.map((cat) => (
                      <div 
                        key={cat._id}
                        className={`flex flex-col p-6 rounded-[2rem] border-2 transition-all group/card ${primary === cat.code ? 'border-brand-blue bg-brand-blue/5 shadow-xl' : 'border-transparent bg-slate-50 dark:bg-white/[0.03] hover:border-slate-200 dark:hover:border-white/10'}`}
                      >
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleSelectNode(cat.code); }}>
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${primary === cat.code ? 'bg-brand-blue text-white shadow-lg' : 'bg-white dark:bg-black text-slate-400 group-hover:text-brand-blue'}`}>
                                  {getIconForCategory(cat.code)}
                               </div>
                               <div className="space-y-0.5">
                                  <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{cat.name}</h4>
                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest italic">Công cụ Flagship</p>
                               </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleSelectNode(cat.code); }} className="p-2 text-gray-300 hover:text-brand-blue transition-colors">
                               <ChevronRight size={18} />
                            </button>
                         </div>

                         {/* ALL SERVICES AS TAGS - PROFESSIONAL STYLE */}
                         <div className="flex flex-wrap gap-1.5">
                            {cat.subCategories.flatMap(sub => sub.services).slice(0, 12).map((service, idx) => (
                               <button 
                                 key={`${service}-${idx}`}
                                 onClick={(e) => { 
                                   e.stopPropagation(); 
                                   handleSelectNode(cat.code, 'ALL', service); 
                                 }}
                                 className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-transparent hover:border-brand-blue/30 rounded text-[7.5px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-all"
                               >
                                  {service}
                               </button>
                            ))}
                            {cat.subCategories.reduce((acc, curr) => acc + curr.services.length, 0) > 12 && (
                               <div className="px-2 py-1 text-[7.5px] font-black uppercase tracking-widest text-gray-300">
                                  + Xem thêm
                               </div>
                            )}
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/60 flex items-center justify-center gap-3 shrink-0">
                 <Activity size={14} className="text-brand-blue" />
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 italic">HỆ THỐNG SẴN SÀNG KHỞI TẠO NỘI DUNG</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MarketSearchTerminal;
