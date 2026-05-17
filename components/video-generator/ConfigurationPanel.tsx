import React from 'react';
import { Settings2, ChevronDown, ChevronUp, Settings, Zap, Loader2, Video, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PricingModel } from '../../apis/pricing';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VideoModelEngineSettings } from './VideoModelEngineSettings';

interface ConfigurationPanelProps {
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null;
  setSelectedModelObj: (model: PricingModel | null) => void;
  selectedEngine: string; setSelectedEngine: (val: string) => void;
  selectedMode: string; setSelectedMode: (val: string) => void;
  ratio: string; cycleRatio: () => void;
  duration: string; cycleDuration: () => void;
  soundEnabled: boolean; cycleSound: () => void;
  resolution: string; cycleResolution: () => void;
  usagePreference: 'credits' | 'key' | null;
  credits: number; setShowResourceModal: (val: boolean) => void;
  currentTotalCost: number; handleGenerate: () => void;
  isGenerating: boolean; isGenerateDisabled: boolean; generateTooltip: string | null;
  activeMode: 'SINGLE' | 'MULTI' | 'AUTO';
  autoTasksCount: number; multiFramesCount: number;
  isMobileExpanded: boolean;
  quantity: number; setQuantity: (val: number) => void;
  isModeBased?: boolean;
  familyList?: string[]; selectedFamily?: string; setSelectedFamily?: (val: string) => void;
  familyModes?: string[]; familyResolutions?: string[]; familyRatios?: string[];
  setRatio?: (val: string) => void; setResolution?: (val: string) => void;
  familyModels?: PricingModel[];
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  // ⚠️ Guard: chặn chọn 1080p+ nếu chưa nạp gói
  const HIGH_RES = ['1080p', '2k', '4k', '2K', '4K'];
  const handleResolutionClick = (res: string) => {
    if (!user?.plan && HIGH_RES.includes(res)) {
      showToast('⚠️ Bạn cần nạp gói lần đầu để sử dụng độ phân giải ' + res + '. Vui lòng nạp credits để tiếp tục.', 'error');
      return;
    }
    if (props.setResolution) props.setResolution(res);
    else props.cycleResolution();
  };

  const summaryText = [
    props.selectedFamily || '',
    props.selectedModelObj?.name || '',
  ].filter(Boolean).join(' · ');

  return (
    <div className={`shrink-0 border-t border-white/[0.08] bg-[#111111]/95 backdrop-blur-lg ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
      <div className="px-4 py-3 space-y-2.5">

        {/* ─── COLLAPSIBLE HEADER ─── */}
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase text-white/70 tracking-wider flex items-center gap-1.5">
              <Settings2 size={12} className="text-brand-blue" /> Cấu hình AI
            </span>
            {!isExpanded && summaryText && (
              <span className="text-[10px] font-medium text-brand-blue/80 truncate max-w-[140px]">{summaryText}</span>
            )}
          </div>
          {isExpanded
            ? <ChevronUp size={12} className="text-white/45 group-hover:text-brand-blue transition-colors" />
            : <ChevronDown size={12} className="text-white/45 group-hover:text-brand-blue transition-colors" />
          }
        </button>

        {/* ─── SHARED VideoModelEngineSettings ─── */}
        {isExpanded && (
          <VideoModelEngineSettings
            selectedEngine={props.selectedEngine}
            onSelectEngine={props.setSelectedEngine}
            availableModels={props.availableModels}
            selectedModelObj={props.selectedModelObj}
            setSelectedModelObj={props.setSelectedModelObj}
            familyList={props.familyList || []}
            selectedFamily={props.selectedFamily || ''}
            setSelectedFamily={props.setSelectedFamily || (() => {})}
            familyModels={props.familyModels || []}
            familyModes={props.familyModes || []}
            familyResolutions={props.familyResolutions || []}
            familyRatios={props.familyRatios || []}
            selectedMode={props.selectedMode}
            setSelectedMode={props.setSelectedMode}
            ratio={props.ratio}
            setRatio={props.setRatio || props.cycleRatio}
            resolution={props.resolution}
            setResolution={handleResolutionClick}
            isModeBased={props.isModeBased || false}
            duration={props.duration}
            cycleDuration={props.cycleDuration}
            soundEnabled={props.soundEnabled}
            setSoundEnabled={() => props.cycleSound()}
            quantity={props.quantity}
            setQuantity={props.setQuantity}
            showQuantity={props.activeMode === 'SINGLE'}
            isGenerating={props.isGenerating}
          />
        )}

        {/* ─── COST BAR ─── */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <button onClick={() => props.setShowResourceModal(true)} className="p-1 text-white/45 hover:text-brand-blue transition-colors rounded-md hover:bg-white/[0.06]">
              <Settings size={12} />
            </button>
            <span className={`text-[12px] font-medium ${props.usagePreference === 'key' ? 'text-brand-blue' : 'text-white/70'}`}>
              {props.usagePreference === 'credits' ? `${props.credits.toLocaleString()} CR` : props.usagePreference === 'key' ? 'API Key' : '—'}
            </span>
            <Link
              to="/credits"
              className="flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-brand-blue to-brand-blueHover text-black rounded-full text-[10px] font-semibold uppercase tracking-wider hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-sm shadow-brand-blue/20"
            >
              <Plus size={10} /> Nạp
            </Link>
          </div>
          <div className="flex items-center gap-1 text-amber-500/80">
            <Zap size={10} fill="currentColor" />
            <span className="text-[11px] font-semibold">
              {props.usagePreference === 'key' ? '0' : props.currentTotalCost}
            </span>
          </div>
        </div>
      </div>

      {/* ─── GENERATE BUTTON ─── */}
      <div className="px-4 pb-4">
        <div className="relative group/btn">
          <button
            onClick={props.handleGenerate}
            disabled={props.isGenerateDisabled}
            className={`w-full py-3.5 rounded-xl font-semibold uppercase text-[12px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2.5 ${
              props.isGenerateDisabled
                ? 'bg-white/[0.06] text-white/45 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-blue to-brand-blueHover text-black hover:brightness-110 active:scale-[0.98] shadow-brand-blue/20'
            }`}
          >
            {props.isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Video size={14} />}
            {props.activeMode === 'AUTO'
              ? `Chạy ${props.autoTasksCount} tác vụ`
              : props.activeMode === 'MULTI'
                ? `Tạo ${props.multiFramesCount} video`
                : 'Tạo Video'}
          </button>
          {props.generateTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all z-50">
              <div className="bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap shadow-atlas-lg">
                {props.generateTooltip}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
