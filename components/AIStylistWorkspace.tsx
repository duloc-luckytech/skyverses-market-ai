
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, ChevronDown, RefreshCcw, Sparkles, 
  User, MapPin, Check, 
  Loader2, Maximize2, MoreHorizontal, LayoutGrid, 
  Settings, Shirt, Download, Fingerprint, Activity,
  Zap, AlertTriangle, Coins, UserCircle, Edit3, Trash2, Upload,
  HelpCircle, ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAIStylist } from '../hooks/useAIStylist';
import { SidebarAccordion } from './ai-stylist/SidebarAccordion';
import { SelectedItems } from './ai-stylist/SelectedItems';
import { TutorialModal } from './ai-stylist/TutorialModal';
import { TemplateModal } from './ai-stylist/TemplateModal';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import { uploadToGCS } from '../services/storage';

const FEMALE_OUTFITS = [
  { id: 'fo1', name: 'Luxury Evening Silk Dress', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/68749cc3-7d20-429b-4895-59334b1ef700/public' },
  { id: 'fo2', name: 'Streetwear Tech Jacket Ensemble', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/51cfd283-36af-45c0-778a64b21c00/public' },
  { id: 'fo3', name: 'Minimalist Office Suit', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/9deb8850-5942-4d6d-32d8-e498dcc88e00/public' },
  { id: 'fo4', name: 'Cyberpunk Neon Outfit', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2357b6aa-51b5-4bd0-c0fb-985ae0847b00/public' },
  { id: 'fo5', name: 'Classic Summer Linen Set', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/60fd51ea-8928-4669-cf60-61e50187aa00/public' },
];

const MALE_OUTFITS = [
  { id: 'mo1', name: 'Tailored Italian Suit', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/1cc03bbf-87fd-4c1c-2154-fb28837f0600/public' },
  { id: 'mo2', name: 'Urban Tactical Streetwear', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d49b6831-66a8-46c0-10f0-35afc7dd9400/public' },
  { id: 'mo3', name: 'Premium Leather Biker Look', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/9c61ce4a-59cb-4dd2-674b-78a597440a00/public' },
  { id: 'mo4', name: 'Futuristic Tech-wear Suit', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/80085615-10f7-4f9b-2fa6-9fc3d6168e00/public' },
  { id: 'mo5', name: 'Modern Casual Oversized Set', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/71a413fe-6fe3-4f00-d1f6-ab089f27b400/public' },
];

const TOPS = [
  { id: 't1', name: 'Premium White Cotton Shirt', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=400' },
  { id: 't2', name: 'Black Designer Hoodie', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400' },
  { id: 't3', name: 'Linen Oversized Blouse', url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=400' },
];

const BOTTOMS = [
  { id: 'b1', name: 'Raw Indigo Denim Jeans', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400' },
  { id: 'b2', name: 'Tan Tailored Chinos', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400' },
  { id: 'b3', name: 'Relaxed Fit Cargo Pants', url: 'https://images.unsplash.com/photo-1520975954732-3cdd222995af?q=80&w=400' },
];

const ACCESSORIES = [
  { id: 'acc1', name: 'Premium Leather Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400' },
  { id: 'acc2', name: 'Designer Shades', url: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400' },
];

const SHOES = [
  { id: 'sh1', name: 'Classic Red Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400' },
  { id: 'sh2', name: 'Minimalist White Trainers', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400' },
];

const POSES = [
  { id: 'p1', name: 'Confident Runway Walk', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d64ecd5b-c60c-4251-b7e8-837a5bd0bc00/public' },
  { id: 'p2', name: 'Elegant Side Profile', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8117cc05-73a1-4e82-b105-292a631b6700/public' },
  { id: 'p3', name: 'Casual Street Crouch', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b0b5c949-540f-4720-8faf-7fa0c51cd300/public' },
  { id: 'p4', name: 'Editorial Standing Lean', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/76dbfb3d-ccea-4c87-c458-36e6b5122d00/public' },
  { id: 'p5', name: 'Dynamic Motion Spin', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/f93d9f4c-246c-4646-fe9d-e55d3cc9b800/public' },
  { id: 'p6', name: 'Hands in Pocket Chill', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/771f40e7-905e-4143-bf36-f8b289072a00/public' },
  { id: 'p7', name: 'Over the Shoulder Gaze', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d8f4c567-c793-4734-9747-e71641a33700/public' },
];

const BACKGROUNDS = [
  { id: 'bg1', name: 'Parisian Street', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/f7a7a92c-0575-460a-79d3-4e9be39f1300/public' },
  { id: 'bg2', name: 'Cyberpunk Alley', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d1c6db21-738b-4cbd-99af-9b0c4e89c800/public' },
  { id: 'bg3', name: 'Minimalist Art Gallery', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/caeb4fba-0383-4c1f-49e1-cb3d0edb0700/public' },
  { id: 'bg4', name: 'Lush Tropical Resort', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/f9bf5303-0a0f-4435-079e-db9069e86300/public' },
  { id: 'bg5', name: 'Luxury Penthouse', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/28893f3b-8115-4e32-bfd6-21a7e7f12c00/public' },
  { id: 'bg6', name: 'Brutalist Concrete Studio', url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/3be2328d-8710-4bc5-4ee1-54745eee7700/public' },
];

const STATIC_CATEGORY_DATA: Record<string, any[]> = {
  selectedOutfit: [], 
  selectedBottom: BOTTOMS,
  selectedOuterwear: TOPS,
  selectedTops: TOPS,
  selectedSets: TOPS,
  selectedSocks: TOPS,
  selectedShoes: SHOES,
  selectedAccessories: ACCESSORIES,
  background: BACKGROUNDS,
  pose: POSES,
};

const AIStylistWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useAIStylist();
  const currentStaticOutfits = s.gender === 'Female' ? FEMALE_OUTFITS : MALE_OUTFITS;

  const [isMobileSidebarExpanded, setIsMobileSidebarExpanded] = useState(false);

  const getFullDataForCategory = (key: string) => {
    const staticData = key === 'selectedOutfit' ? currentStaticOutfits : (STATIC_CATEGORY_DATA[key] || []);
    const userItems = s.userItems[key] || [];
    return [...userItems, ...staticData];
  };

  const allCategoryMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    Object.keys(STATIC_CATEGORY_DATA).forEach(key => {
      map[key] = getFullDataForCategory(key);
    });
    return map;
  }, [s.userItems, s.gender, currentStaticOutfits]);

  const itemFileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadCategory = useRef<string | null>(null);
  const [isUploadingItem, setIsUploadingItem] = useState<string | null>(null);

  const handleItemClick = (categoryKey: string) => {
    activeUploadCategory.current = categoryKey;
    itemFileInputRef.current?.click();
  };

  const handleLocalItemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const category = activeUploadCategory.current;
    if (file && category) {
      setIsUploadingItem(category);
      try {
        const metadata = await uploadToGCS(file);
        s.addCustomItem(category, metadata.url, file.name);
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setIsUploadingItem(null);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ai_stylist_${Date.now()}.png`;
      link.click();
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleEditClick = () => {
    if (s.activeHistoryIndex !== null) {
      setEditorImage(s.history[s.activeHistoryIndex]);
      setIsEditorOpen(true);
    }
  };

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  const handleEditorApplyFromStylist = (url: string) => {
    s.addGeneratedImage(url);
    setIsEditorOpen(false);
  };

  const handleDeleteClick = () => {
    if (s.activeHistoryIndex !== null) {
      if (window.confirm("Xóa hình ảnh này khỏi lịch sử phiên?")) {
        s.deleteHistoryItem(s.activeHistoryIndex);
      }
    }
  };

  const handleGenerateClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarExpanded(false);
    }
    s.handleGenerate(allCategoryMap);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-white dark:bg-[#080808] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
      
      {/* Header bar */}
      <div className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/40 backdrop-blur-md z-[160]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-white italic">
             <span>Stylist Studio</span>
          </div>
          <div className="h-4 w-px bg-black/5 dark:bg-white/5 mx-2"></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => s.setIsTemplateModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600/10 rounded-full text-[9px] font-black uppercase text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
            >
              <LayoutGrid size={12} /> Template
            </button>
            <button 
              onClick={s.openTutorial}
              className="flex items-center gap-2 px-3 py-1 bg-brand-blue/10 rounded-full text-[9px] font-black uppercase text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
            >
              <HelpCircle size={12} /> Hướng dẫn
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">
        
        {/* Backdrop for mobile expanded sidebar */}
        <AnimatePresence>
          {isMobileSidebarExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileSidebarExpanded(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* SIDEBAR: Bottom sheet on mobile, left sidebar on desktop */}
        <aside 
          className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[340px] bg-white dark:bg-[#0a0a0c] border-t lg:border-t-0 lg:border-r border-black/5 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none transition-all duration-500 ease-in-out ${isMobileSidebarExpanded ? 'h-[85dvh] rounded-t-[2.5rem]' : 'h-16 lg:h-full lg:rounded-none'}`}
        >
           {/* Mobile Handle Bar */}
           <div 
             className="lg:hidden h-16 flex flex-col items-center justify-center shrink-0 cursor-pointer relative"
             onClick={() => setIsMobileSidebarExpanded(!isMobileSidebarExpanded)}
           >
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-white/10 rounded-full mb-2"></div>
              <div className="flex items-center gap-2">
                <Shirt size={14} className="text-brand-blue" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                  {isMobileSidebarExpanded ? 'Vuốt xuống để thu gọn' : 'Thiết lập phong cách'}
                </span>
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {isMobileSidebarExpanded ? <ChevronDown size={20} className="text-slate-400"/> : <ChevronUp size={20} className="text-slate-400"/>}
              </div>
           </div>

           {/* Sidebar Content (Scrollable) - Hidden on mobile if not expanded */}
           <div className={`flex-grow overflow-y-auto no-scrollbar pb-48 transition-all ${!isMobileSidebarExpanded ? 'hidden lg:block' : 'block'}`}>
              <div className="p-6 flex items-center justify-between shrink-0">
                  <div className="flex bg-slate-200 dark:bg-black/60 p-1 rounded-xl border border-black/5 dark:border-white/5">
                    {(['Male', 'Female'] as const).map(g => (
                      <button 
                        key={g} onClick={() => s.setGender(g)}
                        className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${s.gender === g ? 'bg-white dark:bg-[#2a2a2e] text-slate-900 dark:text-white shadow-xl' : 'text-gray-600 dark:text-gray-400 hover:text-slate-900'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <button onClick={s.resetAll} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors">Reset</button>
              </div>

              <SelectedItems s={s} categoryData={allCategoryMap} />

              <div className="flex-grow">
                  <SidebarAccordion 
                    id="selectedOutfit" title="Trang phục" icon={<LayoutGrid size={16}/>} 
                    isOpen={s.openAccordions.includes('selectedOutfit')} onToggle={() => s.toggleAccordion('selectedOutfit')}
                    hasActiveItems={!!s.selectedOutfit}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleItemClick('selectedOutfit')}
                        className="aspect-[3/4] rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:border-brand-blue transition-all group"
                      >
                          {isUploadingItem === 'selectedOutfit' ? <Loader2 size={16} className="animate-spin text-brand-blue" /> : <Plus size={20} className="text-slate-400 group-hover:text-brand-blue" />}
                          <span className="text-[8px] font-black uppercase text-slate-400">Tải lên</span>
                      </button>

                      {getFullDataForCategory('selectedOutfit').map(o => (
                        <button key={o.id} onClick={() => s.setSelectedItem('selectedOutfit', o.id)} className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${s.selectedOutfit === o.id ? 'border-[#dfff1a] scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                            <img src={o.url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </SidebarAccordion>

                  {[
                    { id: 'selectedOuterwear', label: 'Outerwear', icon: <Shirt size={16}/> },
                    { id: 'selectedTops', label: 'Tops', icon: <Shirt size={16}/> },
                    { id: 'selectedSets', label: 'Sets', icon: <Shirt size={16}/> },
                    { id: 'selectedBottom', label: 'Bottoms', icon: <Shirt size={16}/> },
                    { id: 'selectedSocks', label: 'Socks', icon: <Shirt size={16}/> },
                    { id: 'selectedShoes', label: 'Shoes', icon: <Shirt size={16}/> },
                    { id: 'selectedAccessories', label: 'Accessories', icon: <Shirt size={16}/> }
                  ].map(item => (
                    <SidebarAccordion 
                      key={item.id} id={item.id} title={item.label} icon={item.icon} 
                      isOpen={s.openAccordions.includes(item.id)} onToggle={() => s.toggleAccordion(item.id)}
                      hasActiveItems={!!(s as any)[item.id]}
                    >
                      <div className="grid grid-cols-4 gap-2 pt-2">
                          <button 
                            onClick={() => handleItemClick(item.id)}
                            className="aspect-[3/4] rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center hover:border-brand-blue transition-all group"
                          >
                            {isUploadingItem === item.id ? <Loader2 size={14} className="animate-spin text-brand-blue" /> : <Plus size={16} className="text-slate-400 group-hover:text-brand-blue" />}
                          </button>

                          {getFullDataForCategory(item.id).map((b: any) => (
                            <button 
                              key={b.id} onClick={() => s.setSelectedItem(item.id, b.id)}
                              className={`aspect-[3/4] rounded-lg border-2 overflow-hidden relative group transition-all ${(s as any)[item.id] === b.id ? 'border-[#dfff1a] ring-4 ring-[#dfff1a]/10 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                              <img src={b.url} className="w-full h-full object-cover" alt="" />
                              {(s as any)[item.id] === b.id && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#dfff1a] text-black rounded-full p-1 shadow-lg">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </SidebarAccordion>
                  ))}
                  
                  {/* Additional mobile-friendly sections */}
                  <SidebarAccordion 
                    id="background" title="Background" icon={<MapPin size={16}/>} 
                    isOpen={s.openAccordions.includes('background')} onToggle={() => s.toggleAccordion('background')}
                    hasActiveItems={!!s.selectedBg}
                  >
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        <button 
                          onClick={() => handleItemClick('background')}
                          className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center hover:border-brand-blue transition-all group"
                        >
                            {isUploadingItem === 'background' ? <Loader2 size={14} className="animate-spin text-brand-blue" /> : <Plus size={16} className="text-slate-400 group-hover:text-brand-blue" />}
                        </button>

                        {getFullDataForCategory('background').map(bg => (
                          <button 
                            key={bg.id} onClick={() => s.setSelectedBg(bg.id)}
                            className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${s.selectedBg === bg.id ? 'border-brand-blue shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                              <img src={bg.url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                  </SidebarAccordion>

                  <SidebarAccordion 
                    id="pose" title="Pose" icon={<Activity size={16}/>} 
                    isOpen={s.openAccordions.includes('pose')} onToggle={() => s.toggleAccordion('pose')}
                    hasActiveItems={!!s.selectedPose}
                  >
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        <button 
                          onClick={window.innerWidth < 1024 ? () => {} : () => handleItemClick('pose')}
                          className="aspect-[3/4] rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center hover:border-brand-blue transition-all group"
                        >
                            {isUploadingItem === 'pose' ? <Loader2 size={14} className="animate-spin text-brand-blue" /> : <Plus size={16} className="text-slate-400 group-hover:text-brand-blue" />}
                        </button>

                        {getFullDataForCategory('pose').map(p => (
                          <button 
                            key={p.id} onClick={() => s.setSelectedPose(p.id)}
                            className={`relative aspect-[3/4] bg-slate-200 dark:bg-[#1a1a1a] rounded-lg border-2 transition-all overflow-hidden group ${s.selectedPose === p.id ? 'border-[#dfff1a] ring-4 ring-[#dfff1a]/10' : 'border-transparent opacity-50 hover:opacity-100'}`}
                          >
                              <div className="w-full h-full bg-slate-300 dark:bg-[#111] flex items-center justify-center relative">
                                <div className="w-full h-full bg-[radial-gradient(circle_at_40%_40%,_#fff_0%,_transparent_60%)] dark:bg-[radial-gradient(circle_at_40%_40%,_#333_0%,_transparent_60%)]"></div>
                                <img src={p.url} className="absolute inset-0 w-full h-full object-contain p-2" alt="Pose" />
                              </div>
                              {s.selectedPose === p.id && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#dfff1a] text-black rounded-full p-2 shadow-2xl z-20">
                                  <Check size={16} strokeWidth={4} />
                                </div>
                              )}
                          </button>
                        ))}
                      </div>
                  </SidebarAccordion>
              </div>
           </div>
           
           <input type="file" ref={itemFileInputRef} className="hidden" accept="image/*" onChange={handleLocalItemUpload} />
        </aside>

        {/* VIEWPORT: Main Display Area */}
        <main className="flex-grow flex flex-col relative bg-slate-100 dark:bg-[#050505] p-4 md:p-12 items-center justify-center transition-colors">
           <div 
             className={`w-full max-w-2xl aspect-[3/4] rounded-[2rem] md:rounded-[3.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.05)] dark:shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center overflow-hidden relative transition-all ${s.hasResult ? 'border-none' : 'border-dashed border-slate-200 dark:border-white/10'}`}
           >
              {s.isGenerating ? (
                <div className="flex flex-col items-center gap-6">
                   <div className="relative">
                      <Loader2 size={64} className="text-[#dfff1a] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Sparkles size={24} className="text-[#dfff1a]/50 animate-pulse" />
                      </div>
                   </div>
                   <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-800 dark:text-white animate-pulse">Styling Model...</p>
                </div>
              ) : s.hasResult && s.activeHistoryIndex !== null ? (
                <motion.img 
                  initial={{ opacity: 0, scale: 1.05 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  src={s.history[s.activeHistoryIndex]} 
                  className="w-full h-full object-cover" 
                  alt="Result" 
                />
              ) : s.userPhoto ? (
                <motion.img 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  src={s.userPhoto} 
                  className="w-full h-full object-cover opacity-50 blur-sm cursor-pointer" 
                  alt="Preview" 
                  onClick={() => s.fileInputRef.current?.click()}
                />
              ) : (
                <div 
                  onClick={() => s.fileInputRef.current?.click()}
                  className="text-center space-y-6 md:space-y-8 p-6 md:p-12 cursor-pointer group"
                >
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-300 dark:text-gray-500 group-hover:scale-110 group-hover:text-brand-blue group-hover:border-brand-blue/40 transition-all">
                      <Plus size={32} />
                   </div>
                   <div className="space-y-2">
                      <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">Nhấn để tải lên <br className="hidden md:block" /> chân dung gốc</p>
                      <p className="text-[8px] md:text-[10px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-[0.4em] italic">Full body, mặt rõ nét</p>
                   </div>
                </div>
              )}
              
              {s.userPhoto && !s.hasResult && !s.isGenerating && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-auto cursor-pointer group/overlay"
                  onClick={() => s.fileInputRef.current?.click()}
                >
                  <div className="bg-white/90 dark:bg-black/90 px-6 py-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-3 transition-transform group-hover/overlay:scale-105">
                    <RefreshCcw size={16} className="text-brand-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Thay đổi hình ảnh</span>
                  </div>
                </div>
              )}

              <input type="file" ref={s.fileInputRef} className="hidden" accept="image/*" onChange={s.handlePhotoUpload} />
           </div>

           {/* Floating Action Controls */}
           <div className="absolute bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 flex flex-col items-center gap-4 md:gap-6 z-50">
              <AnimatePresence>
                {s.history.length > 0 && !s.isGenerating && (
                  <>
                    {/* Compact history preview on mobile */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5 md:gap-2 p-1 md:p-1.5 bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10">
                       {s.history.map((url, i) => (
                         <button 
                            key={i} 
                            onClick={() => s.setActiveHistoryIndex(i)}
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border-2 transition-all ${s.activeHistoryIndex === i ? 'border-[#dfff1a]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                          >
                            <img src={url} className="w-full h-full object-cover" />
                         </button>
                       ))}
                       <button 
                          onClick={() => s.setHasResult(false)}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 dark:text-gray-600 hover:text-brand-blue hover:border-brand-blue transition-all"
                        >
                          <Plus size={14} />
                       </button>
                    </motion.div>

                    {s.hasResult && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 md:gap-3 w-full max-w-md">
                        <button 
                          onClick={() => s.useAsReference(s.history[s.activeHistoryIndex!])} 
                          className="p-3.5 md:p-5 bg-white dark:bg-[#1a1a1c]/90 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-full text-slate-600 dark:text-white hover:bg-brand-blue hover:text-white transition-all group shrink-0"
                          title="Sử dụng làm ảnh mẫu gốc"
                        >
                           <UserCircle size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        
                        <button 
                          onClick={handleEditClick} 
                          className="p-3.5 md:p-5 bg-white dark:bg-[#1a1a1c]/90 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-full text-slate-600 dark:text-white hover:bg-brand-blue hover:text-white transition-all group shrink-0"
                          title="Chỉnh sửa ảnh chuyên sâu"
                        >
                           <Edit3 size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                        </button>

                        <button onClick={() => s.setHasResult(false)} className="flex-grow bg-slate-900 dark:bg-white text-white dark:text-black py-4 md:py-5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest md:tracking-[0.4em] shadow-2xl hover:bg-brand-blue hover:text-white transition-all whitespace-nowrap">
                            Thử mẫu mới
                        </button>
                        
                        <button 
                          onClick={() => s.history[s.activeHistoryIndex!] && handleDownload(s.history[s.activeHistoryIndex!])}
                          className="p-3.5 md:p-5 bg-white dark:bg-[#1a1a1c]/90 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-full text-slate-600 dark:text-white hover:bg-brand-blue hover:text-white transition-all shrink-0"
                          title="Tải xuống"
                        >
                          <Download size={18} className="md:w-5 md:h-5"/>
                        </button>

                        <button 
                          onClick={handleDeleteClick}
                          className="hidden sm:flex p-3.5 md:p-5 bg-white dark:bg-[#1a1a1c]/90 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0"
                          title="Xóa ảnh"
                        >
                          <Trash2 size={18} className="md:w-5 md:h-5"/>
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {!s.hasResult && (
                  <div className="flex flex-col items-center gap-4 md:gap-6 w-full">
                    {/* Resource status badge */}
                    <div className="flex items-center gap-4 px-5 py-2 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full border border-black/5 dark:border-white/10 shadow-xl">
                      <div className="flex items-center gap-3">
                         <div className="text-right">
                           <p className={`text-[9px] md:text-[11px] font-black italic leading-none ${s.usagePreference === 'key' ? 'text-purple-500' : 'text-brand-blue'}`}>
                             {s.usagePreference === 'key' ? 'PERSONAL KEY' : `${s.credits.toLocaleString()} CR`}
                           </p>
                         </div>
                         <button 
                           onClick={() => s.setShowResourceModal(true)}
                           className="p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md hover:text-brand-blue transition-all active:scale-95"
                         >
                           <Settings size={12} />
                         </button>
                      </div>
                    </div>

                    <motion.button 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      onClick={handleGenerateClick}
                      disabled={s.isGenerating || !s.userPhoto}
                      className="w-full sm:w-auto bg-[#dfff1a] text-black px-12 md:px-16 py-4 md:py-5 rounded-full text-[11px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-[0_15px_40px_rgba(223,255,26,0.3)] flex items-center justify-center gap-4 md:gap-6 hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                    >
                       {s.isGenerating ? <Loader2 size={18} className="animate-spin" /> : <>Generate <div className="hidden xs:flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-black/10 rounded-full text-[9px] font-black italic"><Sparkles size={10} fill="currentColor" /> 100 credits</div></>}
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </main>
      </div>

      <ProductImageWorkspace 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialImage={editorImage}
        onApply={handleEditorApplyFromStylist}
      />

      <ResourceAuthModal 
        isOpen={s.showResourceModal} 
        onClose={() => s.setShowResourceModal(false)} 
        onConfirm={(pref) => {
          s.setUsagePreference(pref);
          s.setShowResourceModal(false);
        }} 
        hasPersonalKey={s.hasPersonalKey} 
        totalCost={s.GEN_COST} 
      />

      <TutorialModal 
        isOpen={s.showTutorial}
        onClose={s.closeTutorial}
      />

      <TemplateModal 
        isOpen={s.isTemplateModalOpen}
        onClose={() => s.setIsTemplateModalOpen(false)}
        onApply={s.applyTemplate}
      />

      <AnimatePresence>
        {s.showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-3xl transition-colors">
              <div className="w-24 h-24 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-500 shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]"><AlertTriangle size={48} /></div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">AI Styling requires **{s.GEN_COST} credits** per synthesis. <br />Your current node balance is too low.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link to="/credits" className="bg-brand-blue text-white py-5 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all text-center">Nạp thêm Credits</Link>
                <button onClick={() => s.setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest underline underline-offset-8 decoration-white/20">Để sau</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIStylistWorkspace;
