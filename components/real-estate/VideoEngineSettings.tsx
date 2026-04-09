/**
 * VideoEngineSettings
 * Wraps the shared ModelEngineSettings component and adds video-specific
 * controls: Duration, Sound toggle — rendered below the shared config.
 *
 * This keeps full UI parity with /ai-image-generator's "Cấu hình AI" block,
 * including: ServerSelector, Model family dropdown + list modal, Chế độ pills,
 * Tỷ lệ + P.Giải pills, SL selector.
 */
import React from 'react';
import { Clock, Volume2, VolumeX } from 'lucide-react';
import { ModelEngineSettings } from '../image-generator/ModelEngineSettings';

export interface VideoEngineSettingsProps {
  /* ── Passed through to ModelEngineSettings ── */
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (val: any) => void;
  selectedEngine: string;
  onSelectEngine: (val: string) => void;
  familyList: string[];
  selectedFamily: string;
  setSelectedFamily: (val: string) => void;
  familyModels: any[];
  familyModes: string[];
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  familyResolutions: string[];
  selectedRes: string;
  setSelectedRes: (val: string) => void;
  familyRatios: string[];
  selectedRatio: string;
  setSelectedRatio: (val: string) => void;
  quantity: number;
  setQuantity: (val: number) => void;
  isGenerating?: boolean;

  /* ── Video-specific extras ── */
  availableDurations: string[];
  selectedDuration: string;
  cycleDuration: () => void;
  isModeBased: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  /** Cost per video — shown in SL row info */
  unitCost: number;
}

export const VideoEngineSettings: React.FC<VideoEngineSettingsProps> = ({
  /* ModelEngineSettings props */
  availableModels, selectedModel, setSelectedModel,
  selectedEngine, onSelectEngine,
  familyList, selectedFamily, setSelectedFamily,
  familyModels, familyModes, selectedMode, setSelectedMode,
  familyResolutions, selectedRes, setSelectedRes,
  familyRatios, selectedRatio, setSelectedRatio,
  quantity, setQuantity,
  isGenerating = false,
  /* Video-specific */
  availableDurations, selectedDuration, cycleDuration, isModeBased,
  soundEnabled, setSoundEnabled,
  unitCost,
}) => (
  <>
    {/* ── Shared "Cấu hình AI" block — identical to /ai-image-generator ── */}
    <ModelEngineSettings
      availableModels={availableModels}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      selectedRatio={selectedRatio}
      setSelectedRatio={setSelectedRatio}
      selectedRes={selectedRes}
      setSelectedRes={setSelectedRes}
      quantity={quantity}
      setQuantity={setQuantity}
      selectedMode={selectedMode}
      setSelectedMode={setSelectedMode}
      selectedEngine={selectedEngine}
      onSelectEngine={onSelectEngine}
      activeMode="SINGLE"
      isGenerating={isGenerating}
      familyList={familyList}
      selectedFamily={selectedFamily}
      setSelectedFamily={setSelectedFamily}
      familyModels={familyModels}
      familyModes={familyModes}
      familyRatios={familyRatios}
      familyResolutions={familyResolutions}
    />

    {/* ── Video-exclusive controls: Duration + Sound ── */}
    <div className="flex items-center gap-2 pt-1 px-1">
      {!isModeBased && availableDurations.length > 0 && (
        <button
          onClick={cycleDuration}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/[0.06] dark:border-white/[0.04] text-[10px] font-semibold text-slate-600 dark:text-[#888] hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-40 transition-all"
        >
          <Clock size={10} />
          {selectedDuration}
        </button>
      )}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        disabled={isGenerating}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all disabled:opacity-40 ${
          soundEnabled
            ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
            : 'border-black/[0.06] dark:border-white/[0.04] text-slate-500 dark:text-[#666] hover:border-rose-500/30 hover:text-rose-400'
        }`}
      >
        {soundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
        {soundEnabled ? 'Sound' : 'Mute'}
      </button>
      <span className="ml-auto text-[10px] font-bold text-rose-400">
        {unitCost.toLocaleString()} CR
      </span>
    </div>
  </>
);
