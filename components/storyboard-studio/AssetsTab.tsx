/**
 * AssetsTab.tsx — Phase 5: Assets Library (nâng cấp từ 8 ô trống)
 *
 * 4 panels:
 *  1. Characters  — nhân vật đã lock với metadata
 *  2. Locations   — reference backgrounds / địa điểm
 *  3. Props       — objects / items xuất hiện nhiều
 *  4. Sound FX    — ambient sounds, sfx library
 *
 * Features:
 *  - Gallery grid với thumbnail, name, status dot
 *  - Add button → openAssetModal()
 *  - Click card → openAssetModal(asset) để edit
 *  - Upload từ URL (text input)
 *  - Drag & drop upload (cho ảnh)
 *  - Remove asset với confirm
 *  - Filter by panel/type
 *  - Regen asset image
 *  - Sound FX: built-in library + upload custom
 */

import React, { useState, useRef, useCallback, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Package, Music2, Plus, Upload, Link2,
  Loader2, AlertCircle, CheckCircle2, Trash2, Edit3,
  RefreshCw, Image as LucideImage, Volume2, X, Play,
  Search, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { ReferenceAsset, AssetType, AssetStatus } from '../../hooks/useStoryboardStudio';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetsTabProps {
  assets: ReferenceAsset[];
  addAsset: (type: AssetType) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<ReferenceAsset>) => void;
  updateScene?: (id: string, updates: any) => void;
  handleReGenerateAsset: (id: string) => void;
  openAssetModal: (asset?: ReferenceAsset) => void;
  onViewAsset: (asset: ReferenceAsset) => void;
  onViewScene?: (scene: any) => void;
}

type PanelId = 'CHARACTER' | 'LOCATION' | 'OBJECT' | 'SFX';

interface SfxItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  emoji: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PANELS: { id: PanelId; label: string; icon: React.ReactNode; desc: string; assetType?: AssetType }[] = [
  { id: 'CHARACTER', label: 'Nhân vật',   icon: <User size={14} />,    desc: 'Character references & design sheets', assetType: 'CHARACTER' },
  { id: 'LOCATION',  label: 'Địa điểm',   icon: <MapPin size={14} />,  desc: 'Background & environment references',  assetType: 'LOCATION' },
  { id: 'OBJECT',    label: 'Props',       icon: <Package size={14} />, desc: 'Objects & props that appear often',    assetType: 'OBJECT' },
  { id: 'SFX',       label: 'Sound FX',   icon: <Music2 size={14} />,  desc: 'Ambient sounds & sound effects',       assetType: undefined },
];

const BUILTIN_SFX: SfxItem[] = [
  { id: 'sfx-city',      name: 'City Ambience',    category: 'Ambient',  duration: '∞',    emoji: '🏙️' },
  { id: 'sfx-forest',    name: 'Forest Wind',       category: 'Ambient',  duration: '∞',    emoji: '🌲' },
  { id: 'sfx-rain',      name: 'Rain Heavy',        category: 'Ambient',  duration: '∞',    emoji: '🌧️' },
  { id: 'sfx-ocean',     name: 'Ocean Waves',       category: 'Ambient',  duration: '∞',    emoji: '🌊' },
  { id: 'sfx-crowd',     name: 'Crowd Murmur',      category: 'Ambient',  duration: '∞',    emoji: '👥' },
  { id: 'sfx-thunder',   name: 'Thunder Clap',      category: 'SFX',      duration: '2.3s', emoji: '⚡' },
  { id: 'sfx-door',      name: 'Door Slam',         category: 'SFX',      duration: '0.8s', emoji: '🚪' },
  { id: 'sfx-footsteps', name: 'Footsteps Wood',    category: 'SFX',      duration: '1.5s', emoji: '👟' },
  { id: 'sfx-glass',     name: 'Glass Break',       category: 'SFX',      duration: '1.2s', emoji: '💥' },
  { id: 'sfx-phone',     name: 'Phone Ring',        category: 'SFX',      duration: '3s',   emoji: '📱' },
  { id: 'sfx-car',       name: 'Car Whoosh',        category: 'SFX',      duration: '1.8s', emoji: '🚗' },
  { id: 'sfx-notification', name: 'Notification',  category: 'UI',       duration: '0.5s', emoji: '🔔' },
];

const SFX_CATEGORIES = ['All', 'Ambient', 'SFX', 'UI'];

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusDot: React.FC<{ status: AssetStatus }> = ({ status }) => {
  const map: Record<AssetStatus, string> = {
    idle:       'bg-slate-300 dark:bg-white/20',
    processing: 'bg-brand-blue animate-pulse',
    done:       'bg-emerald-400',
    error:      'bg-rose-400',
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${map[status]}`} />;
};

// ─── Asset Card ───────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: ReferenceAsset;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onRegen: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onEdit, onView, onDelete, onRegen }) => {
  const [hovered, setHovered] = useState(false);

  const typeColor: Record<AssetType, string> = {
    CHARACTER: 'border-violet-500/30 bg-violet-500/5',
    LOCATION:  'border-sky-500/30    bg-sky-500/5',
    OBJECT:    'border-amber-500/30  bg-amber-500/5',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-2xl border overflow-hidden cursor-pointer group ${typeColor[asset.type]}`}
      onClick={onEdit}
    >
      {/* Thumbnail */}
      <div className="aspect-square relative bg-slate-100 dark:bg-white/[0.03]">
        {asset.status === 'processing' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-brand-blue/50" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
              Processing...
            </span>
          </div>
        ) : asset.url ? (
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-200 dark:text-white/10">
            {asset.type === 'CHARACTER' && <User size={28} />}
            {asset.type === 'LOCATION'  && <MapPin size={28} />}
            {asset.type === 'OBJECT'    && <Package size={28} />}
            <span className="text-[9px] font-black uppercase tracking-widest">No image</span>
          </div>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={onEdit}
                title="Chỉnh sửa"
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-brand-blue hover:text-white flex items-center justify-center text-white transition-all"
              >
                <Edit3 size={12} />
              </button>
              <button
                onClick={onRegen}
                title="Tái tạo ảnh"
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-sky-500 hover:text-white flex items-center justify-center text-white transition-all"
              >
                <RefreshCw size={12} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete(); }}
                title="Xóa"
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-rose-500 hover:text-white flex items-center justify-center text-white transition-all"
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-2.5 py-2 flex items-center gap-1.5">
        <StatusDot status={asset.status} />
        <span className="text-[10px] font-bold text-slate-700 dark:text-white/70 truncate flex-1">
          {asset.name}
        </span>
        {asset.status === 'error' && (
          <AlertCircle size={10} className="text-rose-400 shrink-0" />
        )}
      </div>

      {/* Description */}
      {asset.description && (
        <p className="px-2.5 pb-2 text-[9px] text-slate-400 dark:text-white/25 truncate">
          {asset.description}
        </p>
      )}
    </motion.div>
  );
};

// ─── Add Card (empty slot) ────────────────────────────────────────────────────

const AddCard: React.FC<{ onAdd: () => void; label: string }> = ({ onAdd, label }) => (
  <motion.button
    onClick={onAdd}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/8 hover:border-brand-blue/40 hover:bg-brand-blue/[0.03] flex flex-col items-center justify-center gap-2 transition-all group"
  >
    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-brand-blue/10 flex items-center justify-center transition-all">
      <Plus size={18} className="text-slate-300 dark:text-white/20 group-hover:text-brand-blue transition-colors" />
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20 group-hover:text-brand-blue transition-colors">
      {label}
    </span>
  </motion.button>
);

// ─── URL Upload panel ─────────────────────────────────────────────────────────

interface UrlUploadProps {
  panelId: PanelId;
  onAddUrl: (url: string, name: string, type: AssetType) => void;
}

const UrlUploadPanel: React.FC<UrlUploadProps> = ({ panelId, onAddUrl }) => {
  const [url, setUrl]   = useState('');
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const typeMap: Record<PanelId, AssetType | null> = {
    CHARACTER: 'CHARACTER', LOCATION: 'LOCATION', OBJECT: 'OBJECT', SFX: null,
  };
  const assetType = typeMap[panelId];

  const handleSubmit = () => {
    if (!url.trim() || !assetType) return;
    onAddUrl(url.trim(), name.trim() || 'Untitled', assetType);
    setUrl(''); setName(''); setOpen(false);
  };

  if (panelId === 'SFX') return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/8 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40 hover:border-brand-blue/30 hover:text-brand-blue transition-all"
      >
        <Link2 size={12} /> Thêm từ URL
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-20 w-80 p-4 rounded-2xl bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/10 shadow-xl shadow-black/20"
          >
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                Thêm tài nguyên từ URL
              </p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tên tài nguyên..."
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-brand-blue/50 transition-all"
              />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="https://..."
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-brand-blue/50 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!url.trim()}
                  className="flex-1 py-2 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Thêm
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/8 text-slate-400 dark:text-white/30 hover:text-red-400 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Drag & Drop Zone ─────────────────────────────────────────────────────────

interface DragDropZoneProps {
  onDrop: (files: FileList) => void;
  assetType: AssetType;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({ onDrop, assetType }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) onDrop(e.dataTransfer.files);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onDrop(e.target.files);
  };

  const typeLabel: Record<AssetType, string> = {
    CHARACTER: 'nhân vật', LOCATION: 'địa điểm', OBJECT: 'props',
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`
        rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3
        cursor-pointer transition-all text-center
        ${isDragging
          ? 'border-brand-blue/60 bg-brand-blue/5 scale-[1.01]'
          : 'border-slate-200 dark:border-white/8 hover:border-brand-blue/30 hover:bg-brand-blue/[0.02]'
        }
      `}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDragging ? 'bg-brand-blue/20 text-brand-blue' : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20'}`}>
        <Upload size={20} />
      </div>
      <div>
        <p className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isDragging ? 'text-brand-blue' : 'text-slate-400 dark:text-white/30'}`}>
          {isDragging ? 'Thả để upload' : 'Kéo thả ảnh vào đây'}
        </p>
        <p className="text-[9px] text-slate-300 dark:text-white/15 mt-0.5">
          Hoặc click để chọn ảnh {typeLabel[assetType]}
        </p>
      </div>
    </div>
  );
};

// ─── Characters / Locations / Objects Panel ───────────────────────────────────

interface AssetPanelProps {
  assetType: AssetType;
  assets: ReferenceAsset[];
  onAdd: () => void;
  onAddUrl: (url: string, name: string, type: AssetType) => void;
  onAddFiles: (files: FileList, type: AssetType) => void;
  onEdit: (asset: ReferenceAsset) => void;
  onView: (asset: ReferenceAsset) => void;
  onDelete: (id: string) => void;
  onRegen: (id: string) => void;
  panelId: PanelId;
}

const AssetPanel: React.FC<AssetPanelProps> = ({
  assetType, assets, onAdd, onAddUrl, onAddFiles, onEdit, onView, onDelete, onRegen, panelId,
}) => {
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = assets.filter(a =>
    a.type === assetType &&
    (search === '' || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[160px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2">
          <Search size={11} className="text-slate-300 dark:text-white/20 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="flex-1 bg-transparent text-[11px] text-slate-700 dark:text-white/70 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={10} className="text-slate-300 dark:text-white/20 hover:text-rose-400 transition-colors" />
            </button>
          )}
        </div>

        {/* URL upload */}
        <UrlUploadPanel panelId={panelId} onAddUrl={onAddUrl} />

        {/* Add button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-blue/20"
        >
          <Plus size={12} /> Thêm mới
        </button>
      </div>

      {/* Stats row */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-white/20">
          <span>{filtered.length} tài nguyên</span>
          <span>·</span>
          <span className="text-emerald-400">{filtered.filter(a => a.status === 'done').length} đã render</span>
          {filtered.some(a => a.status === 'processing') && (
            <>
              <span>·</span>
              <span className="text-brand-blue flex items-center gap-1">
                <Loader2 size={8} className="animate-spin" />
                {filtered.filter(a => a.status === 'processing').length} đang xử lý
              </span>
            </>
          )}
        </div>
      )}

      {/* Asset grid */}
      {filtered.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4"
        >
          <AnimatePresence>
            {filtered.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={() => onEdit(asset)}
                onView={() => onView(asset)}
                onDelete={() => handleDelete(asset.id)}
                onRegen={() => onRegen(asset.id)}
              />
            ))}
            {/* Add slot */}
            <AddCard onAdd={onAdd} label="Thêm" />
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Drag drop zone when empty */}
          <DragDropZone
            assetType={assetType}
            onDrop={files => onAddFiles(files, assetType)}
          />
          {search && (
            <p className="text-center text-[10px] text-slate-300 dark:text-white/20">
              Không tìm thấy kết quả cho "<span className="font-bold">{search}</span>"
            </p>
          )}
        </div>
      )}

      {/* Confirm delete toast */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-rose-500 text-white text-[11px] font-bold shadow-xl"
          >
            <AlertCircle size={14} />
            Click lại để xác nhận xóa
            <button onClick={() => setConfirmDeleteId(null)} className="ml-2 opacity-70 hover:opacity-100">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Sound FX Panel ───────────────────────────────────────────────────────────

const SfxPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const [customSfx, setCustomSfx] = useState<SfxItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const all = [...BUILTIN_SFX, ...customSfx];

  const filtered = all.filter(s =>
    (activeCategory === 'All' || s.category === activeCategory) &&
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCustom = () => {
    if (!urlInput.trim()) return;
    const item: SfxItem = {
      id: `sfx-custom-${Date.now()}`,
      name: nameInput.trim() || 'Custom SFX',
      category: 'Custom',
      duration: '?',
      emoji: '🎵',
    };
    setCustomSfx(prev => [...prev, item]);
    setUrlInput(''); setNameInput('');
  };

  const handleRemove = (id: string) => {
    setCustomSfx(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[160px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2">
          <Search size={11} className="text-slate-300 dark:text-white/20 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm âm thanh..."
            className="flex-1 bg-transparent text-[11px] text-slate-700 dark:text-white/70 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/8">
          {SFX_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SFX grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map(sfx => (
          <motion.div
            key={sfx.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-brand-blue/20 hover:bg-brand-blue/[0.02] transition-all"
          >
            {/* Play button */}
            <button
              onClick={() => setPlaying(prev => prev === sfx.id ? null : sfx.id)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                playing === sfx.id
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30 group-hover:bg-brand-blue/10 group-hover:text-brand-blue'
              }`}
            >
              {playing === sfx.id
                ? <span className="flex gap-0.5">
                    <span className="w-1 h-3 bg-current rounded animate-pulse" />
                    <span className="w-1 h-3 bg-current rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-3 bg-current rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                  </span>
                : <Play size={13} />
              }
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-700 dark:text-white/70 truncate leading-none">
                {sfx.emoji} {sfx.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8px] font-bold text-slate-300 dark:text-white/20 uppercase tracking-widest">
                  {sfx.category}
                </span>
                <span className="text-[8px] font-mono text-slate-200 dark:text-white/15">
                  {sfx.duration}
                </span>
              </div>
            </div>

            {/* Remove (custom only) */}
            {sfx.id.startsWith('sfx-custom') && (
              <button
                onClick={() => handleRemove(sfx.id)}
                className="shrink-0 w-6 h-6 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 flex items-center justify-center text-slate-300 dark:text-white/20 transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={10} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-3">
          <Music2 size={32} className="text-slate-200 dark:text-white/10" />
          <p className="text-[10px] text-slate-300 dark:text-white/20 font-bold uppercase tracking-widest">
            Không tìm thấy âm thanh
          </p>
        </div>
      )}

      {/* Upload custom SFX */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/8 p-4 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 flex items-center gap-1.5">
          <Upload size={10} /> Upload SFX tùy chỉnh
        </p>
        <div className="flex gap-2">
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Tên âm thanh..."
            className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-brand-blue/50 transition-all"
          />
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            placeholder="URL audio..."
            className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-brand-blue/50 transition-all"
          />
          <button
            onClick={handleAddCustom}
            disabled={!urlInput.trim()}
            className="px-4 py-2 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-blue/20"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AssetsTab Component ─────────────────────────────────────────────────

export const AssetsTab: React.FC<AssetsTabProps> = ({
  assets,
  addAsset,
  removeAsset,
  updateAsset,
  handleReGenerateAsset,
  openAssetModal,
  onViewAsset,
}) => {
  const [activePanel, setActivePanel] = useState<PanelId>('CHARACTER');

  // Handle URL add → create asset with url pre-filled
  const handleAddUrl = useCallback((url: string, name: string, type: AssetType) => {
    // Create a temp asset then open modal — we open the modal with a pre-filled asset
    const tempAsset: ReferenceAsset = {
      id: `asset-${Date.now()}`,
      name,
      url,
      mediaId: null,
      type,
      status: 'idle',
      description: '',
      designPrompt: '',
    };
    openAssetModal(tempAsset);
  }, [openAssetModal]);

  // Handle file drops → create asset for each file
  const handleAddFiles = useCallback((files: FileList, type: AssetType) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const tempAsset: ReferenceAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: reader.result as string,
          mediaId: null,
          type,
          status: 'idle',
          description: '',
          designPrompt: '',
        };
        openAssetModal(tempAsset);
      };
      reader.readAsDataURL(file);
    });
  }, [openAssetModal]);

  // Counts per type
  const counts: Record<PanelId, number> = {
    CHARACTER: assets.filter(a => a.type === 'CHARACTER').length,
    LOCATION:  assets.filter(a => a.type === 'LOCATION').length,
    OBJECT:    assets.filter(a => a.type === 'OBJECT').length,
    SFX:       0,
  };

  return (
    <motion.div
      key="tab-assets"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 min-h-0 flex flex-col p-5 lg:p-10 overflow-y-auto no-scrollbar bg-[#fafafa] dark:bg-[#050506] transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8 pb-32 lg:pb-10">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
              Thư viện tài nguyên
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-600 mt-1.5">
              {assets.length} tài nguyên · {assets.filter(a => a.status === 'done').length} đã render
            </p>
          </div>
          <button
            onClick={() => addAsset(activePanel === 'SFX' ? 'CHARACTER' : (activePanel as AssetType))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-blue/20"
          >
            <Sparkles size={13} /> Tạo tài nguyên
          </button>
        </div>

        {/* ── Panel tabs ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {PANELS.map(panel => {
            const count = counts[panel.id];
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  activePanel === panel.id
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                    : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-white/40 hover:border-brand-blue/30 hover:text-brand-blue bg-white dark:bg-transparent'
                }`}
              >
                {panel.icon}
                {panel.label}
                {count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    activePanel === panel.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Panel description ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <p className="text-[10px] text-slate-400 dark:text-white/25 mb-6">
              {PANELS.find(p => p.id === activePanel)?.desc}
            </p>

            {/* Asset panels */}
            {activePanel !== 'SFX' ? (
              <AssetPanel
                assetType={activePanel as AssetType}
                panelId={activePanel}
                assets={assets}
                onAdd={() => addAsset(activePanel as AssetType)}
                onAddUrl={handleAddUrl}
                onAddFiles={handleAddFiles}
                onEdit={openAssetModal}
                onView={onViewAsset}
                onDelete={removeAsset}
                onRegen={handleReGenerateAsset}
              />
            ) : (
              <SfxPanel />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </motion.div>
  );
};
