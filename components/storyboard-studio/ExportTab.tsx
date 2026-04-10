import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, FileJson, Upload, Trash2, Film, Image, Music,
  Play, CheckCircle, AlertCircle, Clock, Sparkles, FolderOpen,
  Plus, RefreshCw
} from 'lucide-react';
import type { Scene } from '../../hooks/useStoryboardStudio';
import type { ReferenceAsset } from '../../hooks/useStoryboardStudio';

interface ExportTabProps {
  scenes: Scene[];
  assets: ReferenceAsset[];
  script: string;
  settings: any;
  totalDuration: number;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onNewProject: () => void;
  onViewScene: (scene: Scene) => void;
  isProcessing: boolean;
}

const statusIcon = (status: Scene['status']) => {
  switch (status) {
    case 'done':       return <CheckCircle size={14} className="text-emerald-400" />;
    case 'generating': return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
    case 'error':      return <AlertCircle size={14} className="text-red-400" />;
    default:           return <Clock size={14} className="text-gray-500" />;
  }
};

const completedScenes = (scenes: Scene[]) => scenes.filter(s => s.status === 'done' || s.videoUrl || s.visualUrl);

export const ExportTab: React.FC<ExportTabProps> = ({
  scenes, assets, script, settings, totalDuration,
  onExportJSON, onImportJSON, onNewProject, onViewScene, isProcessing
}) => {
  const importRef = useRef<HTMLInputElement>(null);
  const done = completedScenes(scenes);
  const hasVideo = scenes.some(s => s.videoUrl);
  const hasImage = scenes.some(s => s.visualUrl);

  const handleDownloadAll = () => {
    scenes.forEach((scene, i) => {
      const url = scene.videoUrl || scene.visualUrl;
      if (!url) return;
      const ext = scene.videoUrl ? 'mp4' : 'jpg';
      const a = document.createElement('a');
      a.href = url;
      a.download = `scene-${String(scene.order).padStart(2, '0')}.${ext}`;
      setTimeout(() => a.click(), i * 300);
    });
  };

  const handleDownloadScene = (scene: Scene) => {
    const url = scene.videoUrl || scene.visualUrl;
    if (!url) return;
    const ext = scene.videoUrl ? 'mp4' : 'jpg';
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${String(scene.order).padStart(2, '0')}.${ext}`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex-grow overflow-y-auto p-6"
      style={{ scrollbarGutter: 'stable' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Film size={20} className="text-purple-400" />
            Export & Quản lý Project
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {done.length}/{scenes.length} cảnh hoàn tất &bull; {totalDuration}s &bull; {settings.format || 'Storyboard'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
          >
            <Plus size={14} /> Project mới
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
          >
            <Upload size={14} /> Import JSON
          </button>
          <button
            onClick={onExportJSON}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            <FileJson size={14} /> Export JSON
          </button>
        </div>
        <input ref={importRef} type="file" accept=".json" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) { onImportJSON(f); e.target.value = ''; } }} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tổng cảnh', value: scenes.length, icon: <Film size={16} />, color: 'from-purple-900/60 to-purple-800/30' },
          { label: 'Có video', value: scenes.filter(s => s.videoUrl).length, icon: <Play size={16} />, color: 'from-blue-900/60 to-blue-800/30' },
          { label: 'Có hình', value: scenes.filter(s => s.visualUrl).length, icon: <Image size={16} />, color: 'from-emerald-900/60 to-emerald-800/30' },
          { label: 'Nhân vật/BG', value: assets.filter(a => a.url).length, icon: <Sparkles size={16} />, color: 'from-amber-900/60 to-amber-800/30' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2 text-white/50">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Download all button */}
      {(hasVideo || hasImage) && (
        <button
          onClick={handleDownloadAll}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-3 mb-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all disabled:opacity-50"
        >
          <Download size={18} />
          Tải xuống tất cả ({done.length} file)
        </button>
      )}

      {/* Scene list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FolderOpen size={14} /> Danh sách phân cảnh
        </h3>
        {scenes.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Film size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có phân cảnh. Tạo storyboard để bắt đầu.</p>
          </div>
        ) : (
          <AnimatePresence>
            {scenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-colors group"
              >
                {/* Thumbnail */}
                <div
                  className="w-16 h-10 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 cursor-pointer"
                  onClick={() => onViewScene(scene)}
                >
                  {scene.videoUrl ? (
                    <video src={scene.videoUrl} className="w-full h-full object-cover" muted />
                  ) : scene.visualUrl ? (
                    <img src={scene.visualUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <Clock size={14} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {statusIcon(scene.status)}
                    <span className="text-xs font-semibold text-white">C#{String(scene.order).padStart(2, '0')}</span>
                    {scene.videoUrl && <span className="text-xs text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded">VIDEO</span>}
                    {scene.visualUrl && !scene.videoUrl && <span className="text-xs text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded">IMG</span>}
                    {scene.audioUrl && <Music size={11} className="text-purple-400" />}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{scene.prompt}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(scene.videoUrl || scene.visualUrl) && (
                    <button
                      onClick={() => handleDownloadScene(scene)}
                      className="p-1.5 rounded-lg bg-white/8 hover:bg-blue-600/40 text-gray-400 hover:text-white transition-colors"
                      title="Tải xuống"
                    >
                      <Download size={13} />
                    </button>
                  )}
                  {(scene.videoUrl || scene.visualUrl) && (
                    <button
                      onClick={() => onViewScene(scene)}
                      className="p-1.5 rounded-lg bg-white/8 hover:bg-purple-600/40 text-gray-400 hover:text-white transition-colors"
                      title="Xem"
                    >
                      <Play size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Script preview */}
      {script && (
        <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kịch bản gốc</h3>
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">{script}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ExportTab;
