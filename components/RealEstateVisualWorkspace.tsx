
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Loader2, Download, Maximize2, Trash2,
  Coins, AlertTriangle, History, Wand2, RefreshCw, Plus,
  Building2, Home, Briefcase, Store, Map,
  Building, Users, LayoutGrid, PenTool, Code, HardHat, MoreHorizontal,
  Sofa, Image as ImageIcon, Eye,
  Navigation, Wind, Film, Clock,
  CheckCircle2,
} from 'lucide-react';
import { generateDemoImage, generateDemoText, generateDemoVideo } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';
import { useImageModels, extractImageFamily } from '../hooks/useImageModels';
import { pricingApi, PricingModel } from '../apis/pricing';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skyverses_REALESTATE-VISUAL-AI_vault';

type WorkspaceMode = 'image' | 'video';

const modeOptions = [
  { id: 'image' as WorkspaceMode, label: '🖼️ Ảnh', desc: 'Render & Staging' },
  { id: 'video' as WorkspaceMode, label: '🎬 Video', desc: 'Tour & Drone' },
];

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Căn Hộ',   icon: Building2 },
  { id: 'villa',     label: 'Biệt Thự',  icon: Home      },
  { id: 'office',    label: 'Văn Phòng', icon: Briefcase },
  { id: 'shophouse', label: 'Shophouse', icon: Store     },
  { id: 'land',      label: 'Đất Nền',   icon: Map       },
];

const INDUSTRIES = [
  { id: 'developer',    label: 'Chủ ĐT',    icon: Building      },
  { id: 'agent',        label: 'Môi Giới',   icon: Users         },
  { id: 'agency',       label: 'Agency',     icon: LayoutGrid    },
  { id: 'architect',    label: 'KTS',         icon: PenTool       },
  { id: 'homebuyer',   label: 'Homebuyer',  icon: Home          },
  { id: 'devweb',       label: 'Developer',  icon: Code          },
  { id: 'construction', label: 'Xây Dựng',  icon: HardHat       },
  { id: 'other',        label: 'Khác',       icon: MoreHorizontal},
];

const IMAGE_TYPES = [
  { id: 'interior', label: 'Nội Thất',    icon: Sofa      },
  { id: 'exterior', label: 'Ngoại Thất',  icon: Building2 },
  { id: 'banner',   label: 'Banner MKT',  icon: ImageIcon },
  { id: 'aerial',   label: 'Phối Cảnh',   icon: Eye       },
  { id: 'staging',  label: 'Staging Ảo',  icon: Sparkles  },
];

const VIDEO_TYPES = [
  { id: 'walkthrough', label: 'Walkthrough', icon: Navigation },
  { id: 'drone',       label: 'Drone Aerial', icon: Wind      },
  { id: 'cinematic',   label: 'Cinematic',    icon: Film      },
  { id: 'tour360',     label: 'Tour 360°',    icon: RefreshCw },
  { id: 'timelapse',   label: 'Time-lapse',   icon: Clock     },
];

const IMAGE_STYLES: StylePreset[] = [
  { id: 'modern',      label: 'Modern',      emoji: '⚡', description: 'Clean contemporary design',      promptPrefix: 'modern minimalist real estate, clean lines, '         },
  { id: 'luxury',      label: 'Luxury',      emoji: '💎', description: 'Premium high-end feel',          promptPrefix: 'luxury premium real estate, high-end, sophisticated, ' },
  { id: 'minimal',     label: 'Tối Giản',    emoji: '🤍', description: 'Whitespace, understated',        promptPrefix: 'minimalist real estate design, simple palette, '       },
  { id: 'industrial',  label: 'Industrial',  emoji: '🏗️', description: 'Raw textures, bold structure',  promptPrefix: 'industrial style real estate, raw concrete, bold, '    },
  { id: 'traditional', label: 'Traditional', emoji: '🏮', description: 'Vietnamese traditional blend',   promptPrefix: 'traditional Vietnamese architecture blend, warm wood, ' },
  { id: 'eco',         label: 'Eco',         emoji: '🌿', description: 'Biophilic, green spaces',        promptPrefix: 'biophilic eco design, lush greenery, sustainable, '    },
];

const IMAGE_TEMPLATES = [
  { label: 'Căn Hộ Cao Cấp Đêm',  prompt: 'Luxury apartment interior night view, city lights through floor-to-ceiling windows, modern furniture, ambient lighting, photorealistic 4K',                       style: 'Luxury'   },
  { label: 'Biệt Thự Ven Sông',    prompt: 'Modern villa riverside render, tropical garden, infinity pool, golden hour, photorealistic architectural visualization',                                           style: 'Modern'   },
  { label: 'Văn Phòng Hiện Đại',   prompt: 'Contemporary office interior render, open space design, natural light, ergonomic furniture, professional real estate photography',                                 style: 'Modern'   },
  { label: 'Mặt Bằng Showroom',    prompt: 'Luxury showroom floor plan visualization, high-end retail space, marble flooring, designer lighting, premium staging',                                            style: 'Luxury'   },
];

const VIDEO_STYLES: StylePreset[] = [
  { id: 'cinematic', label: 'Cinematic', emoji: '🎬', description: 'Film-grade, dramatic',           promptPrefix: 'cinematic real estate video, dramatic lighting, film grade, '   },
  { id: 'aerial',    label: 'Aerial',    emoji: '🚁', description: 'Drone perspective, wide',        promptPrefix: 'aerial drone shot real estate, bird eye view, wide angle, '     },
  { id: 'premium',   label: 'Premium',   emoji: '💎', description: 'Luxury property showcase',       promptPrefix: 'luxury property video showcase, premium quality, '               },
  { id: 'social',    label: 'Social',    emoji: '📱', description: 'Short-form, engaging',           promptPrefix: 'social media real estate clip, engaging, short-form, '          },
  { id: 'story',     label: 'Story',     emoji: '📖', description: 'Narrative walkthrough',          promptPrefix: 'narrative property story video, walkthrough, smooth, '          },
  { id: 'natural',   label: 'Natural',   emoji: '🌿', description: 'Organic, eco-feel',              promptPrefix: 'natural organic property video, eco-friendly, biophilic, '      },
];

const VIDEO_TEMPLATES = [
  { label: 'Tour Căn Hộ Cao Cấp',  prompt: 'Cinematic walkthrough luxury apartment, smooth camera movement through living room to bedroom, golden hour light, photorealistic',                       style: 'Cinematic' },
  { label: 'Drone Khu Dân Cư',     prompt: 'Aerial drone shot residential complex, bird eye view showing pools amenities green space, cinematic blue sky Vietnam',                                    style: 'Aerial'    },
  { label: 'Video Biệt Thự Ven Biển', prompt: 'Luxury beachfront villa cinematic tour, ocean view, infinity pool, tropical garden, sunset golden hour',                                             style: 'Premium'   },
];

const IMAGE_ENGINES = ['gommo', 'other'];
const IMAGE_MODES   = ['Chuyên nghiệp', 'Nhanh', 'Cân bằng'];
const IMAGE_RESOLUTIONS = ['1k', '2k', '4k'];
const IMAGE_RATIOS  = ['1:1', '16:9', '4:3', '9:16', '3:4'];
const VIDEO_ENGINES = ['gommo', 'other'];
const VIDEO_MODES   = ['relaxed', 'fast', 'quality'];
const VIDEO_RESOLUTIONS = ['720p', '1080p'];
const VIDEO_RATIOS  = ['16:9', '9:16'];
const VIDEO_DURATIONS = ['5s', '8s', '10s'];
const VIDEO_QUANTITIES = [1, 2, 3];
const IMAGE_QUANTITIES = [1, 2, 3, 4];

// ─── Types ────────────────────────────────────────────────────────────────────

interface RESession {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  mode: 'image' | 'video';
  propertyType?: string;
  industry?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractFamilyName = (name: string): string => {
  const KNOWN = ['VEO', 'Kling', 'Hailuo', 'Grok', 'Sora', 'WAN', 'Wan', 'V-Fuse', 'OmniHuman', 'Seedance'];
  const n = name.trim();
  for (const fam of KNOWN) {
    if (n.toLowerCase().startsWith(fam.toLowerCase())) return fam;
  }
  return n.split(/\s*-\s/)[0].split(/\s+/)[0] || 'Other';
};

const getUnitCost = (model: PricingModel | null, resKey: string, durStr: string, mode?: string): number => {
  if (!model || !model.pricing) return 1500;
  const resMatrix = model.pricing[resKey.toLowerCase()];
  if (!resMatrix) return 1500;
  if (mode && resMatrix[mode] != null) return resMatrix[mode];
  const durKey = durStr.replace('s', '');
  return resMatrix[durKey] || 1500;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RealEstateVisualWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useTheme();
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  // ── Top-level UI state ────────────────────────────────────────────────────
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('image');
  const [viewMode, setViewMode]           = useState<'current' | 'library'>('current');
  const [sessions, setSessions]           = useState<RESession[]>([]);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [showMobileSheet, setShowMobileSheet]       = useState(false);
  const [status, setStatus]               = useState('Sẵn sàng');
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isEnhancing, setIsEnhancing]     = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Shared pickers ────────────────────────────────────────────────────────
  const [activeProperty, setActiveProperty] = useState('apartment');
  const [activeIndustry, setActiveIndustry] = useState('developer');

  // ── Prompt & history ─────────────────────────────────────────────────────
  const [prompt, setPrompt]               = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory]     = useState(false);
  const [result, setResult]               = useState<string | null>(null);

  // S2: AI Enhance diff
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [showEnhanceDiff, setShowEnhanceDiff] = useState(false);

  // ── IMAGE mode state ──────────────────────────────────────────────────────
  const [activeImageType, setActiveImageType] = useState('interior');
  const [activeStyle, setActiveStyle]         = useState('Modern');
  const [activeVideoStyle, setActiveVideoStyle] = useState('Cinematic');

  // Image model settings — use useImageModels hook
  const [imgEngine, setImgEngine] = useState('gommo');
  const imgModels = useImageModels(imgEngine);
  const {
    availableModels: imgAvailableModels,
    selectedModel: imgSelectedModel,
    setSelectedModel: setImgSelectedModel,
    selectedFamily: imgSelectedFamily,
    setSelectedFamily: setImgSelectedFamily,
    selectedMode: imgSelectedMode,
    setSelectedMode: setImgSelectedMode,
    selectedRes: imgSelectedRes,
    setSelectedRes: setImgSelectedRes,
    selectedRatio: imgSelectedRatio,
    setSelectedRatio: setImgSelectedRatio,
    familyList: imgFamilyList,
    familyModels: imgFamilyModels,
    familyModes: imgFamilyModes,
    familyResolutions: imgFamilyResolutions,
    familyRatios: imgFamilyRatios,
    selectedModelCost,
  } = imgModels;
  const [imgQuantity, setImgQuantity] = useState(1);
  const [references, setReferences]   = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // currentUnitCost for image
  const imgUnitCost = selectedModelCost;

  // ── VIDEO mode state ──────────────────────────────────────────────────────
  const [videoEngine, setVideoEngine]   = useState('gommo');
  const [videoAvailableModels, setVideoAvailableModels] = useState<PricingModel[]>([]);
  const [videoSelectedModelObj, setVideoSelectedModelObj] = useState<PricingModel | null>(null);
  const [videoSelectedFamily, setVideoSelectedFamily]     = useState('');
  const [videoSelectedMode, setVideoSelectedMode]         = useState('relaxed');
  const [videoResolution, setVideoResolution]             = useState('720p');
  const [videoRatio, setVideoRatio]                       = useState('16:9');
  const [videoDuration, setVideoDuration]                 = useState('8s');
  const [soundEnabled, setSoundEnabled]                   = useState(false);
  const [videoQuantity, setVideoQuantity]                 = useState(1);
  const [videoActiveType, setVideoActiveType]             = useState('walkthrough');

  // Fetch video models
  useEffect(() => {
    setVideoSelectedFamily('');
    setVideoAvailableModels([]);
    const fetchPricing = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'video', engine: videoEngine });
        if (res.success && res.data.length > 0) {
          setVideoAvailableModels(res.data);
          const defaultModel = res.data.find(m => m.modelKey === 'veo_3_1') || res.data[0];
          setVideoSelectedFamily(extractFamilyName(defaultModel.name));
          setVideoSelectedModelObj(defaultModel);
        }
      } catch (err) {
        console.error('Failed to fetch video pricing:', err);
      }
    };
    fetchPricing();
  }, [videoEngine]);

  // Video family groupings
  const videoFamilies = useMemo(() => {
    const groups: Record<string, PricingModel[]> = {};
    videoAvailableModels.forEach(m => {
      const fam = extractFamilyName(m.name);
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(m);
    });
    return groups;
  }, [videoAvailableModels]);
  const videoFamilyList   = useMemo(() => Object.keys(videoFamilies).sort(), [videoFamilies]);
  const videoFamilyModels = useMemo(() => videoFamilies[videoSelectedFamily] || [], [videoFamilies, videoSelectedFamily]);
  const videoFamilyModes  = useMemo(() => [...new Set(videoFamilyModels.flatMap(m => m.modes || (m.mode ? [m.mode] : [])))], [videoFamilyModels]);
  const videoFamilyRes    = useMemo(() => [...new Set(videoFamilyModels.flatMap(m => Object.keys(m.pricing || {})))], [videoFamilyModels]);
  const videoFamilyRatios = useMemo(() => [...new Set(videoFamilyModels.flatMap(m => m.aspectRatios || []))].filter(r => r && r !== 'auto'), [videoFamilyModels]);

  // Auto-resolve best video model from family
  useEffect(() => {
    if (videoFamilyModels.length === 0) return;
    let best = videoFamilyModels.find(m => {
      const hasModeMatch = (m.modes || []).includes(videoSelectedMode) || m.mode === videoSelectedMode;
      const hasResMatch  = m.pricing && m.pricing[videoResolution.toLowerCase()];
      return hasModeMatch && hasResMatch;
    });
    if (!best) best = videoFamilyModels.find(m => (m.modes || []).includes(videoSelectedMode) || m.mode === videoSelectedMode);
    if (!best) best = videoFamilyModels.find(m => m.pricing && m.pricing[videoResolution.toLowerCase()]);
    if (!best) best = videoFamilyModels[0];
    if (best && best._id !== videoSelectedModelObj?._id) setVideoSelectedModelObj(best);
  }, [videoSelectedFamily, videoSelectedMode, videoResolution, videoFamilyModels]);

  useEffect(() => {
    if (videoFamilyModels.length === 0) return;
    if (videoFamilyModes.length > 0 && !videoFamilyModes.includes(videoSelectedMode)) setVideoSelectedMode(videoFamilyModes[0]);
    if (videoFamilyRes.length > 0 && !videoFamilyRes.includes(videoResolution)) setVideoResolution(videoFamilyRes[0]);
    if (videoFamilyRatios.length > 0 && !videoFamilyRatios.includes(videoRatio)) setVideoRatio(videoFamilyRatios[0]);
  }, [videoSelectedFamily, videoFamilyModes, videoFamilyRes, videoFamilyRatios, videoFamilyModels]);

  // isModeBased detection for video
  const isModeBased = useMemo(() => {
    if (!videoSelectedModelObj?.pricing) return false;
    const resKey = videoResolution.toLowerCase();
    const resPricing = videoSelectedModelObj.pricing[resKey];
    if (!resPricing) return false;
    const keys = Object.keys(resPricing);
    return keys.length > 0 && keys.every(k => isNaN(Number(k)));
  }, [videoSelectedModelObj, videoResolution]);

  const availableVideoDurations = useMemo(() => {
    if (!videoSelectedModelObj?.pricing) return VIDEO_DURATIONS;
    const resKey = videoResolution.toLowerCase();
    const resPricing = videoSelectedModelObj.pricing[resKey];
    if (!resPricing) return VIDEO_DURATIONS;
    if (isModeBased) return ['8s'];
    return Object.keys(resPricing).map(d => `${d}s`);
  }, [videoSelectedModelObj, videoResolution, isModeBased]);

  useEffect(() => {
    if (availableVideoDurations.length > 0 && !availableVideoDurations.includes(videoDuration)) {
      setVideoDuration(availableVideoDurations[0]);
    }
  }, [availableVideoDurations, videoDuration]);

  const cycleDuration = () => {
    const idx = availableVideoDurations.indexOf(videoDuration);
    setVideoDuration(availableVideoDurations[(idx + 1) % availableVideoDurations.length]);
  };

  const cycleVideoRatio = () => {
    const ratios = videoFamilyRatios.length > 0 ? videoFamilyRatios : VIDEO_RATIOS;
    const idx = ratios.indexOf(videoRatio);
    setVideoRatio(ratios[(idx + 1) % ratios.length]);
  };

  const videoUnitCost = useMemo(
    () => getUnitCost(videoSelectedModelObj, videoResolution, videoDuration, videoSelectedMode),
    [videoSelectedModelObj, videoResolution, videoDuration, videoSelectedMode]
  );

  // ── Load sessions & prompt history from localStorage ─────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sessions');
    if (saved) { try { setSessions(JSON.parse(saved)); } catch { /* ignore */ } }
    const savedPrompts = localStorage.getItem(STORAGE_KEY + '_prompts');
    if (savedPrompts) { try { setPromptHistory(JSON.parse(savedPrompts)); } catch { /* ignore */ } }
  }, []);

  // ── Derived labels ────────────────────────────────────────────────────────
  const propertyLabel  = PROPERTY_TYPES.find(p => p.id === activeProperty)?.label || '';
  const industryLabel  = INDUSTRIES.find(i => i.id === activeIndustry)?.label || '';
  const imageTypeLabel = IMAGE_TYPES.find(t => t.id === activeImageType)?.label || '';
  const videoTypeLabel = VIDEO_TYPES.find(t => t.id === videoActiveType)?.label || '';

  // ── AI Enhance ────────────────────────────────────────────────────────────
  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setShowEnhanceDiff(false);
    setEnhancedPreview(null);
    setStatus('Đang tối ưu prompt...');
    try {
      const system = 'Bạn là chuyên gia bất động sản và thiết kế kiến trúc Việt Nam. Viết lại prompt sau thành mô tả chi tiết cho AI tạo ảnh/video BĐS: góc máy, ánh sáng, phong cách, vật liệu. Ngắn gọn, tiếng Việt.';
      const enhanced = await generateDemoText(`${system}\n\nPrompt gốc: "${prompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
        setEnhancedPreview(enhanced);
        setShowEnhanceDiff(true);
        setStatus('Xem trước prompt mới →');
      }
    } catch { /* ignore */ } finally {
      setIsEnhancing(false);
    }
  };

  // ── File upload for reference images ─────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 6 - references.length;
    Array.from(files).slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setReferences(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  // ── Save session helper ───────────────────────────────────────────────────
  const saveSession = (url: string, mode: WorkspaceMode, promptText: string) => {
    const newSession: RESession = {
      id: Date.now().toString(),
      imageUrl: url,
      prompt: promptText,
      createdAt: new Date().toLocaleString('vi-VN'),
      mode,
      propertyType: activeProperty,
      industry: activeIndustry,
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(updated));

    // Save prompt history (max 10)
    const newHistory = [promptText, ...promptHistory.filter(p => p !== promptText)].slice(0, 10);
    setPromptHistory(newHistory);
    localStorage.setItem(STORAGE_KEY + '_prompts', JSON.stringify(newHistory));
  };

  // ── Generate IMAGE ────────────────────────────────────────────────────────
  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    if (credits < imgUnitCost * imgQuantity) { setShowLowCreditAlert(true); return; }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsGenerating(true);
    setStatus('Đang kết nối AI...');
    try {
      const stylePrefix = IMAGE_STYLES.find(s => s.label === activeStyle)?.promptPrefix || '';
      const finalPrompt = `${stylePrefix}${prompt} — ${propertyLabel} ${imageTypeLabel}, real estate photography, Vietnam market [${industryLabel}]`.trim();

      setStatus('AI đang tạo ảnh BĐS...');
      const imageUrl = await generateDemoImage(finalPrompt, references);

      if (controller.signal.aborted) return;

      if (imageUrl) {
        useCredits(imgUnitCost * imgQuantity);
        setResult(imageUrl);
        saveSession(imageUrl, 'image', prompt);
        setStatus('Hoàn tất ✓');
        showToast('Ảnh BĐS đã được tạo thành công!', 'success');
      } else {
        setStatus('Lỗi tạo ảnh');
        showToast('Không tạo được ảnh — credits chưa bị trừ, thử lại nhé!', 'warning');
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setStatus('Lỗi hệ thống');
      showToast('Lỗi hệ thống — credits chưa bị trừ.', 'error');
    } finally {
      if (!controller.signal.aborted) setIsGenerating(false);
      abortRef.current = null;
    }
  };

  // ── Generate VIDEO ────────────────────────────────────────────────────────
  const handleGenerateVideo = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    if (credits < videoUnitCost * videoQuantity) { setShowLowCreditAlert(true); return; }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsGenerating(true);
    setStatus('Đang kết nối AI...');
    try {
      const videoStylePrefix = VIDEO_STYLES.find(s => s.label === activeVideoStyle)?.promptPrefix || '';
      const finalVideoPrompt = `${videoStylePrefix}${prompt} — ${propertyLabel} ${videoTypeLabel}, Vietnam real estate [${industryLabel}]`.trim();

      setStatus('AI đang tạo video BĐS...');
      const videoUrl = await generateDemoVideo({
        prompt: finalVideoPrompt,
        isUltra: videoSelectedModelObj?.modelKey?.includes('ultra') || videoSelectedModelObj?.name?.includes('PRO') || false,
        duration: videoDuration,
        resolution: videoResolution as '720p' | '1080p',
        aspectRatio: videoRatio as '16:9' | '9:16',
        references: references.length > 0 ? [references[0]] : undefined,
      });

      if (controller.signal.aborted) return;

      if (videoUrl) {
        useCredits(videoUnitCost * videoQuantity);
        setResult(videoUrl);
        saveSession(videoUrl, 'video', prompt);
        setStatus('Hoàn tất ✓');
        showToast('Video BĐS đã được tạo thành công!', 'success');
      } else {
        setStatus('Lỗi tạo video');
        showToast('Không tạo được video — credits chưa bị trừ, thử lại nhé!', 'warning');
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setStatus('Lỗi hệ thống');
      showToast('Lỗi hệ thống — credits chưa bị trừ.', 'error');
    } finally {
      if (!controller.signal.aborted) setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleGenerate = () => {
    if (workspaceMode === 'image') handleGenerateImage();
    else handleGenerateVideo();
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(updated));
  };

  const currentUnitCost = workspaceMode === 'image' ? imgUnitCost : videoUnitCost;
  const currentQuantity = workspaceMode === 'image' ? imgQuantity : videoQuantity;

  // ── Status dot color ──────────────────────────────────────────────────────
  const statusDotColor = isGenerating
    ? 'bg-amber-400 animate-pulse'
    : status.includes('Lỗi')
      ? 'bg-red-400'
      : 'bg-emerald-400';

  // ─────────────────────────────────────────────────────────────────────────
  // Sidebar content (shared between desktop + mobile sheet)
  // ─────────────────────────────────────────────────────────────────────────
  const renderSidebarContent = () => (
    <div className="p-4 space-y-4 flex-grow overflow-y-auto">

      {/* Property Type Picker */}
      <div>
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Loại Bất Động Sản</p>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map(pt => {
            const Icon = pt.icon;
            const isActive = activeProperty === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => setActiveProperty(pt.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                }`}
              >
                <Icon size={11} />
                {pt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Industry Picker */}
      <div>
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Đối Tượng / Ngành</p>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map(ind => {
            const Icon = ind.icon;
            const isActive = activeIndustry === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setActiveIndustry(ind.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                }`}
              >
                <Icon size={11} />
                {ind.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── IMAGE MODE sidebar ── */}
      {workspaceMode === 'image' && (
        <>
          {/* Image Type Picker */}
          <div>
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Loại Hình Ảnh</p>
            <div className="grid grid-cols-2 gap-1.5">
              {IMAGE_TYPES.map(it => {
                const Icon = it.icon;
                const isActive = activeImageType === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => setActiveImageType(it.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all ${
                      isActive
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}
                  >
                    <Icon size={12} />
                    <span className="text-[10px] font-semibold">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Settings Combo (STEP 6.5A) */}
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest">Cài Đặt Engine</p>
            {/* Server (Engine) select */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Engine</p>
                <select
                  value={imgEngine}
                  onChange={e => setImgEngine(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {IMAGE_ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              {/* Model Family select */}
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Model Family</p>
                <select
                  value={imgSelectedFamily}
                  onChange={e => setImgSelectedFamily(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {imgFamilyList.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            {/* Mode + Resolution */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Chế độ</p>
                <select
                  value={imgSelectedMode}
                  onChange={e => setImgSelectedMode(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {(imgFamilyModes.length > 0 ? imgFamilyModes : IMAGE_MODES).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Độ phân giải</p>
                <select
                  value={imgSelectedRes}
                  onChange={e => setImgSelectedRes(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {(imgFamilyResolutions.length > 0 ? imgFamilyResolutions : IMAGE_RESOLUTIONS).map(r => (
                    <option key={r} value={r}>{r.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Ratio buttons */}
            <div>
              <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Tỷ lệ khung hình</p>
              <div className="flex flex-wrap gap-1">
                {(imgFamilyRatios.length > 0 ? imgFamilyRatios : IMAGE_RATIOS).map(r => (
                  <button
                    key={r}
                    onClick={() => setImgSelectedRatio(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      imgSelectedRatio === r
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-[#666] hover:border-brand-blue/40'
                    }`}
                  >{r}</button>
                ))}
              </div>
            </div>
            {/* Quantity */}
            <div>
              <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Số lượng</p>
              <div className="flex gap-1.5">
                {IMAGE_QUANTITIES.map(q => (
                  <button
                    key={q}
                    onClick={() => setImgQuantity(q)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                      imgQuantity === q
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-[#666] hover:border-brand-blue/40'
                    }`}
                  >{q}</button>
                ))}
              </div>
            </div>
            {/* Cost indicator */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 dark:text-[#555]">Chi phí mỗi ảnh</span>
              <span className="font-bold text-brand-blue">{imgUnitCost.toLocaleString()} CR</span>
            </div>
          </div>

          {/* AISuggestPanel for image */}
          <AISuggestPanel
            productSlug="realestate-visual-ai"
            productName="RealEstate Visual AI"
            styles={IMAGE_STYLES}
            onPromptSelect={(p) => setPrompt(prev => p + (prev ? '\n' + prev : ''))}
            onApply={(cfg) => {
              if (cfg.prompt) setPrompt(cfg.prompt);
              if (cfg.style && IMAGE_STYLES.find(s => s.label === cfg.style)) setActiveStyle(cfg.style);
            }}
            historyKey={STORAGE_KEY}
            featuredTemplates={IMAGE_TEMPLATES}
            productContext={`RealEstate Visual AI for ${propertyLabel} ${imageTypeLabel}, Vietnam property market [${industryLabel}]`}
          />
        </>
      )}

      {/* ── VIDEO MODE sidebar ── */}
      {workspaceMode === 'video' && (
        <>
          {/* Video Type Picker */}
          <div>
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Loại Video</p>
            <div className="flex flex-wrap gap-1.5">
              {VIDEO_TYPES.map(vt => {
                const Icon = vt.icon;
                const isActive = videoActiveType === vt.id;
                return (
                  <button
                    key={vt.id}
                    onClick={() => setVideoActiveType(vt.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${
                      isActive
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}
                  >
                    <Icon size={11} />
                    {vt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Settings Combo (STEP 6.5B) */}
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest">Cài Đặt Engine Video</p>
            {/* Engine + Family */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Engine</p>
                <select
                  value={videoEngine}
                  onChange={e => setVideoEngine(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {VIDEO_ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Model Family</p>
                <select
                  value={videoSelectedFamily}
                  onChange={e => setVideoSelectedFamily(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {videoFamilyList.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            {/* Mode + Resolution */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Chế độ</p>
                <select
                  value={videoSelectedMode}
                  onChange={e => setVideoSelectedMode(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {(videoFamilyModes.length > 0 ? videoFamilyModes : VIDEO_MODES).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Độ phân giải</p>
                <select
                  value={videoResolution}
                  onChange={e => setVideoResolution(e.target.value)}
                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  {(videoFamilyRes.length > 0 ? videoFamilyRes : VIDEO_RESOLUTIONS).map(r => (
                    <option key={r} value={r}>{r.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Ratio cycle + Duration cycle + Sound toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={cycleVideoRatio}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.06] text-[10px] font-semibold text-slate-600 dark:text-[#888] hover:border-brand-blue/40 hover:text-brand-blue transition-all"
              >
                <RefreshCw size={10} /> {videoRatio}
              </button>
              {!isModeBased && (
                <button
                  onClick={cycleDuration}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.06] text-[10px] font-semibold text-slate-600 dark:text-[#888] hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                >
                  <Clock size={10} /> {videoDuration}
                </button>
              )}
              <button
                onClick={() => setSoundEnabled(s => !s)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                  soundEnabled
                    ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                    : 'border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-[#666] hover:border-brand-blue/40'
                }`}
              >
                {soundEnabled ? '🔊 Sound' : '🔇 Mute'}
              </button>
            </div>
            {/* Video Quantity */}
            <div>
              <p className="text-[9px] text-slate-400 dark:text-[#555] mb-1">Số lượng</p>
              <div className="flex gap-1.5">
                {VIDEO_QUANTITIES.map(q => (
                  <button
                    key={q}
                    onClick={() => setVideoQuantity(q)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                      videoQuantity === q
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-[#666] hover:border-brand-blue/40'
                    }`}
                  >{q}</button>
                ))}
              </div>
            </div>
            {/* Cost indicator */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 dark:text-[#555]">Chi phí mỗi video</span>
              <span className="font-bold text-brand-blue">{videoUnitCost.toLocaleString()} CR</span>
            </div>
          </div>

          {/* AISuggestPanel for video */}
          <AISuggestPanel
            productSlug="realestate-video-ai"
            productName="RealEstate Video AI"
            styles={VIDEO_STYLES}
            onPromptSelect={(p) => setPrompt(prev => p + (prev ? '\n' + prev : ''))}
            onApply={(cfg) => {
              if (cfg.prompt) setPrompt(cfg.prompt);
              if (cfg.style && VIDEO_STYLES.find(s => s.label === cfg.style)) setActiveVideoStyle(cfg.style);
            }}
            historyKey={STORAGE_KEY + '_video'}
            featuredTemplates={VIDEO_TEMPLATES}
            productContext={`RealEstate Video AI for ${propertyLabel} ${videoTypeLabel}, Vietnam property market [${industryLabel}]`}
          />
        </>
      )}

      {/* ── Prompt Textarea (shared) ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest">
            Mô tả {workspaceMode === 'image' ? 'Hình Ảnh' : 'Video'}
          </p>
          {promptHistory.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowHistory(v => !v)}
                className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors"
              >
                <History size={10} /> Lịch sử ({promptHistory.length})
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-5 z-50 w-72 bg-white dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-black/[0.05] dark:border-white/[0.05]">
                      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest px-1">10 Prompts gần nhất</p>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {promptHistory.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => { setPrompt(p); setShowHistory(false); }}
                          className="w-full text-left px-3 py-2.5 text-[11px] text-slate-700 dark:text-white/70 hover:bg-brand-blue/[0.06] hover:text-brand-blue transition-colors line-clamp-2 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => {
            // W1: ⌘+Enter shortcut
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder={
            workspaceMode === 'image'
              ? `Mô tả hình ảnh ${propertyLabel} ${imageTypeLabel} bạn muốn tạo...`
              : `Mô tả video ${propertyLabel} ${videoTypeLabel} bạn muốn tạo...`
          }
          rows={4}
          className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
        />
        {/* S2: AI Enhance */}
        <button
          onClick={handleEnhance}
          disabled={isEnhancing || !prompt.trim()}
          className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-brand-blue hover:opacity-80 disabled:opacity-30 transition-opacity"
        >
          {isEnhancing ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
          AI Boost Prompt
        </button>

        {/* S2: Enhance diff preview */}
        <AnimatePresence>
          {showEnhanceDiff && enhancedPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-brand-blue/25 bg-brand-blue/[0.03] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-brand-blue/15 bg-brand-blue/[0.04]">
                  <span className="text-[9px] font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1">
                    <Wand2 size={9} /> Prompt đã được tối ưu
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setPrompt(enhancedPreview); setShowEnhanceDiff(false); setEnhancedPreview(null); setStatus('Đã áp dụng prompt mới'); showToast('Prompt đã được cập nhật!', 'success'); }}
                      className="text-[9px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      ✓ Áp dụng
                    </button>
                    <button
                      onClick={() => { setShowEnhanceDiff(false); setEnhancedPreview(null); setStatus('Sẵn sàng'); }}
                      className="text-[9px] text-slate-400 hover:text-red-400 transition-colors"
                    >
                      ✕ Bỏ
                    </button>
                  </div>
                </div>
                <div className="px-3 py-2 border-b border-dashed border-brand-blue/10">
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Trước</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#888] line-clamp-2 leading-relaxed">{prompt}</p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[8px] font-bold text-brand-blue uppercase mb-1">Sau</p>
                  <p className="text-[10px] text-slate-700 dark:text-white/80 line-clamp-4 leading-relaxed">{enhancedPreview}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reference images */}
      <div>
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Ảnh tham chiếu ({references.length}/6)</p>
        <div className="grid grid-cols-3 gap-1.5">
          {references.map((ref, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden relative group bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <img src={ref} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setReferences(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {references.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center hover:border-brand-blue/40 transition-colors text-slate-400 dark:text-[#555]"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col bg-[#f4f7f9] dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">

      {/* ── TOP NAV (h-14) ── */}
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-6 shrink-0 z-[100] transition-colors gap-3">
        {/* Left: view toggle + title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10">
            {(['current', 'library'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 md:px-5 py-1.5 text-[10px] md:text-[11px] font-bold rounded-full transition-all ${viewMode === m ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {m === 'current' ? 'Phiên hiện tại' : `Thư viện (${sessions.length})`}
              </button>
            ))}
          </div>
          <span className="hidden sm:block text-[12px] font-bold text-slate-700 dark:text-white/80 whitespace-nowrap">
            🏡 RealEstate Visual AI
          </span>
        </div>

        {/* Right: mode toggle + credits + close */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mode toggle pill */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/5 p-0.5 rounded-full border border-slate-200 dark:border-white/10">
            {modeOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => { setWorkspaceMode(opt.id); setResult(null); setStatus('Sẵn sàng'); }}
                title={opt.desc}
                className={`px-2.5 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold rounded-full transition-all ${
                  workspaceMode === opt.id
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Mobile settings trigger (S1) */}
          <button
            onClick={() => setShowMobileSheet(true)}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold"
          >
            <Sparkles size={11} />
          </button>
          {/* Credits badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full">
            <Coins size={12} className="text-brand-blue" />
            <span className="text-[10px] font-black text-brand-blue">{credits.toLocaleString()} CR</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-grow flex overflow-hidden">

        {/* ── SIDEBAR (hidden on mobile) ── */}
        <div className="hidden md:flex w-[380px] shrink-0 bg-white dark:bg-[#0d0d0f] border-r border-slate-200 dark:border-white/5 flex-col overflow-hidden transition-colors">
          {renderSidebarContent()}

          {/* Generate button footer */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0d0d0f] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-[#555]">
              <div className="flex items-center gap-1.5">
                {/* W11: Status dot */}
                <div className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                {status}
              </div>
              <div className="flex items-center gap-2">
                {/* W3: Cancel button */}
                {isGenerating && (
                  <button
                    onClick={() => {
                      abortRef.current?.abort();
                      setIsGenerating(false);
                      setStatus('Đã hủy');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <X size={11} /> Hủy
                  </button>
                )}
                <span className="font-semibold text-brand-blue">
                  {(currentUnitCost * currentQuantity).toLocaleString()} CR / lần
                </span>
              </div>
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isGenerating
                ? <><Loader2 size={14} className="animate-spin" /> Đang tạo...</>
                : workspaceMode === 'image'
                  ? <><Sparkles size={14} /> Tạo Ảnh BĐS <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd></>
                  : <><Film size={14} /> Tạo Video BĐS <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd></>
              }
            </motion.button>
          </div>
        </div>

        {/* ── MAIN VIEWPORT ── */}
        <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#060608] overflow-hidden">

          {viewMode === 'current' ? (
            <div className="flex-1 flex items-center justify-center p-6 md:p-8">
              {isGenerating ? (
                /* Skeleton loading — 2×2 shimmer grid (W2) */
                <div className="w-full max-w-2xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`rounded-2xl bg-slate-200 dark:bg-white/[0.04] animate-pulse overflow-hidden relative ${workspaceMode === 'image' ? 'aspect-video' : 'aspect-[16/9]'}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-[11px] text-slate-400 dark:text-[#555] animate-pulse">
                    AI đang tạo {workspaceMode === 'image' ? 'ảnh' : 'video'} BĐS · thường mất {workspaceMode === 'image' ? '10–30 giây' : '1–3 phút'}...
                  </p>
                </div>
              ) : result ? (
                /* Result with Download + Fullscreen overlay (W5) */
                <div className="relative group max-w-2xl w-full">
                  {workspaceMode === 'image' ? (
                    <img
                      src={result}
                      alt="Generated real estate"
                      className="w-full rounded-2xl shadow-2xl border border-black/[0.06] dark:border-white/[0.04]"
                    />
                  ) : (
                    <video
                      src={result}
                      controls
                      autoPlay
                      loop
                      className="w-full rounded-2xl shadow-2xl border border-black/[0.06] dark:border-white/[0.04] aspect-video object-contain bg-black"
                    />
                  )}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <a
                      href={result}
                      download={workspaceMode === 'image' ? 'realestate.png' : 'realestate.mp4'}
                      className="p-3 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-lg"
                      title="Tải xuống"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() => window.open(result, '_blank')}
                      className="p-3 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-lg"
                      title="Xem toàn màn hình"
                    >
                      <Maximize2 size={18} />
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-3 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-lg"
                      title="Tạo lại"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                  {/* Mode + type badge */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-blue/90 backdrop-blur-sm text-white text-[10px] font-bold">
                      {workspaceMode === 'image' ? '🖼️' : '🎬'} {propertyLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold">
                      {workspaceMode === 'image' ? imageTypeLabel : videoTypeLabel}
                    </span>
                  </div>
                </div>
              ) : (
                /* Empty state — starter prompt cards (W6) */
                <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-md">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-3">
                      {workspaceMode === 'image' ? <ImageIcon size={28} className="text-brand-blue" /> : <Film size={28} className="text-brand-blue" />}
                    </div>
                    <p className="text-sm font-semibold text-slate-400 dark:text-[#555]">Bắt đầu tạo {workspaceMode === 'image' ? 'ảnh' : 'video'} BĐS</p>
                    <p className="text-[11px] text-slate-300 dark:text-[#444] mt-1">Chọn gợi ý bên dưới hoặc nhập mô tả của bạn</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    {(workspaceMode === 'image'
                      ? [
                          { emoji: '🏠', label: 'Căn hộ luxury view biển',    prompt: 'Luxury apartment interior night view, panoramic ocean view, floor-to-ceiling windows, premium furniture, ambient lighting, photorealistic 4K' },
                          { emoji: '🌿', label: 'Biệt thự vườn nhiệt đới',    prompt: 'Modern tropical villa exterior render, lush garden, infinity pool, golden hour lighting, architectural visualization' },
                          { emoji: '🏙️', label: 'Văn phòng sky view',         prompt: 'Contemporary office interior render, open space, floor-to-ceiling glass, city skyline view, professional photography' },
                          { emoji: '🌅', label: 'Phối cảnh dự án golden hour', prompt: 'Real estate development aerial view, mixed-use complex, golden hour lighting, photorealistic architectural render' },
                        ]
                      : [
                          { emoji: '🎬', label: 'Tour căn hộ cinema',  prompt: 'Cinematic walkthrough luxury apartment, smooth dolly shot through living room, warm ambient lighting' },
                          { emoji: '🚁', label: 'Drone khu dân cư',    prompt: 'Aerial drone shot residential complex Vietnam, bird eye view showing amenities and green spaces, cinematic' },
                          { emoji: '💎', label: 'Showcase biệt thự',   prompt: 'Luxury villa showcase video, smooth camera movement through interior and exterior, golden hour' },
                          { emoji: '🌊', label: 'Villa ven biển',      prompt: 'Beachfront villa cinematic tour, ocean view, infinity pool, tropical garden, sunset' },
                        ]
                    ).map(sp => (
                      <button
                        key={sp.label}
                        onClick={() => setPrompt(sp.prompt)}
                        className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] text-left hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group"
                      >
                        <span className="text-xl">{sp.emoji}</span>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-white/70 mt-1.5 group-hover:text-brand-blue transition-colors line-clamp-2">{sp.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* W8/W9: Library Grid */
            <div className="flex-1 overflow-y-auto p-6">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <ImageIcon size={24} className="text-slate-300 dark:text-[#444]" />
                  </div>
                  <p className="text-sm text-slate-400 dark:text-[#555]">Thư viện trống — tạo hình ảnh đầu tiên!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => { setResult(session.imageUrl); setWorkspaceMode(session.mode); setViewMode('current'); }}
                      className="group relative rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.04] bg-white dark:bg-[#0d0d0f] cursor-pointer hover:border-brand-blue/30 transition-all hover:-translate-y-0.5"
                    >
                      <div className="aspect-video overflow-hidden bg-black">
                        {session.mode === 'image' ? (
                          <img src={session.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <video src={session.imageUrl} className="w-full h-full object-cover" muted />
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${session.mode === 'image' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-purple-500/10 text-purple-500'}`}>
                            {session.mode === 'image' ? '🖼️ Ảnh' : '🎬 Video'}
                          </span>
                          {session.propertyType && (
                            <span className="text-[8px] text-slate-400 dark:text-[#555]">
                              {PROPERTY_TYPES.find(p => p.id === session.propertyType)?.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 dark:text-white/70 line-clamp-2">{session.prompt}</p>
                        <p className="text-[9px] text-slate-400 dark:text-[#555] mt-1">{session.createdAt}</p>
                      </div>
                      <button
                        onClick={(e) => deleteSession(e, session.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── L8: Low Credit Modal ── */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowLowCreditAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#0f0f11] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/[0.06] dark:border-white/[0.06] text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Không đủ Credits</h3>
              <p className="text-sm text-slate-500 dark:text-[#666] mb-4">
                Bạn cần{' '}
                <strong className="text-brand-blue">
                  {(currentUnitCost * currentQuantity).toLocaleString()} CR
                </strong>{' '}
                để tạo {workspaceMode === 'image' ? 'ảnh' : 'video'} này.<br />
                Số dư hiện tại: <strong>{credits.toLocaleString()} CR</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLowCreditAlert(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Hủy
                </button>
                <Link
                  to="/credits"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold text-center hover:brightness-110 transition-all"
                >
                  Nạp Credits
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── S1: Mobile Bottom Sheet ── */}
        {showMobileSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden absolute inset-0 z-[300] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d0d0f] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Sheet handle */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0 relative">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                <p className="text-[12px] font-bold text-slate-700 dark:text-white/80">
                  Cài đặt — {workspaceMode === 'image' ? '🖼️ Ảnh' : '🎬 Video'}
                </p>
                <button onClick={() => setShowMobileSheet(false)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Sheet body scrollable */}
              <div className="overflow-y-auto flex-1 px-4 pb-4">
                {renderSidebarContent()}
              </div>

              {/* Sheet footer CTA */}
              <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/5">
                <motion.button
                  onClick={() => { setShowMobileSheet(false); handleGenerate(); }}
                  disabled={isGenerating || !prompt.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {workspaceMode === 'image'
                    ? <><Sparkles size={14} /> Tạo Ảnh — {(imgUnitCost * imgQuantity).toLocaleString()} CR</>
                    : <><Film size={14} /> Tạo Video — {(videoUnitCost * videoQuantity).toLocaleString()} CR</>
                  }
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealEstateVisualWorkspace;
