
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Save, Loader2, Power, RefreshCw,
  Gauge, Image, Video, CheckCircle2
} from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../apis/config';
import { useToast } from '../../context/ToastContext';

interface FxflowConfig {
  enabled: boolean;
  routingPercent: number;
  videoQuality: string;
  imageModel: string;
}

const QUALITY_OPTIONS = [
  { value: 'fast', label: 'Fast', desc: 'Nhanh nhất, chất lượng cơ bản' },
  { value: 'relaxed', label: 'Relaxed', desc: 'Cân bằng tốc độ & chất lượng' },
  { value: 'quality', label: 'Quality', desc: 'Chất lượng cao nhất, chậm hơn' },
];

const MODEL_OPTIONS = [
  { value: 'NARWHAL', label: 'Narwhal', desc: 'Default – đa năng' },
  { value: 'GEM_PIX_2', label: 'Gem Pix 2', desc: 'Gemini-based image gen' },
  { value: 'IMAGEN_3_5', label: 'Imagen 3.5', desc: 'Google Imagen' },
];

export const FxflowTab: React.FC = () => {
  const [config, setConfig] = useState<FxflowConfig>({
    enabled: true, routingPercent: 100, videoQuality: 'relaxed', imageModel: 'NARWHAL'
  });
  const [originalConfig, setOriginalConfig] = useState<FxflowConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/fxflow/config`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setOriginalConfig(data.data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleChange = (key: keyof FxflowConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/fxflow/config`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setOriginalConfig(data.data);
        setConfig(data.data);
        showToast('Đã lưu cấu hình FXFlow', 'success');
      } else { showToast('Lưu thất bại', 'error'); }
    } catch (err) { showToast('Lỗi kết nối server', 'error'); }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-brand-blue" size={24} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap size={16} className="text-purple-500" /> Cấu hình FXFlow Provider
          </h2>
          <p className="text-[10px] text-slate-400">Quản lý routing traffic và chất lượng cho engine FXFlow (bên thứ 3)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchConfig} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all">
            <RefreshCw size={14} />
          </button>
          <button onClick={handleSave} disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-purple-600/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Lưu cấu hình
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-2 space-y-5">
          {/* Enable Toggle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.enabled ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                <Power size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">FXFlow Engine</p>
                <p className="text-[9px] text-slate-400">{config.enabled ? 'Đang hoạt động — traffic sẽ được route sang FXFlow' : 'Đã tắt — 100% traffic giữ lại gommo'}</p>
              </div>
            </div>
            <button onClick={() => handleChange('enabled', !config.enabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${config.enabled ? 'bg-purple-500' : 'bg-slate-200 dark:bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.enabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </motion.div>

          {/* Routing Percent */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge size={12} /> Tỷ lệ Routing (%)
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Gommo</span>
                <span className="text-lg font-black text-purple-500">{config.routingPercent}%</span>
                <span className="text-[11px] text-slate-500">FXFlow</span>
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={config.routingPercent}
                onChange={e => handleChange('routingPercent', Number(e.target.value))}
                className="w-full h-2 accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>0% (tất cả gommo)</span>
                <span>100% (tất cả fxflow)</span>
              </div>
              {/* Quick presets */}
              <div className="grid grid-cols-5 gap-2">
                {[0, 25, 50, 75, 100].map(val => (
                  <button key={val} onClick={() => handleChange('routingPercent', val)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${config.routingPercent === val
                      ? 'border-purple-500 bg-purple-500/5 text-purple-500'
                      : 'border-black/[0.06] dark:border-white/[0.06] text-slate-500 hover:border-purple-500/30'
                    }`}>
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Video Quality */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Video size={12} /> Video Quality
            </p>
            <div className="grid grid-cols-3 gap-3">
              {QUALITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => handleChange('videoQuality', opt.value)}
                  className={`p-3 border rounded-xl text-left transition-all ${config.videoQuality === opt.value
                    ? 'border-purple-500 bg-purple-500/5'
                    : 'border-black/[0.06] dark:border-white/[0.06] hover:border-purple-500/30'
                  }`}>
                  <p className={`text-[11px] font-bold ${config.videoQuality === opt.value ? 'text-purple-500' : 'text-slate-700 dark:text-gray-300'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Image Model */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Image size={12} /> Default Image Model
            </p>
            <div className="grid grid-cols-3 gap-3">
              {MODEL_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => handleChange('imageModel', opt.value)}
                  className={`p-3 border rounded-xl text-left transition-all ${config.imageModel === opt.value
                    ? 'border-purple-500 bg-purple-500/5'
                    : 'border-black/[0.06] dark:border-white/[0.06] hover:border-purple-500/30'
                  }`}>
                  <p className={`text-[11px] font-bold ${config.imageModel === opt.value ? 'text-purple-500' : 'text-slate-700 dark:text-gray-300'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          {/* Status Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái hiện tại</p>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Engine</span>
                <span className={`font-bold ${config.enabled ? 'text-emerald-500' : 'text-red-400'}`}>
                  {config.enabled ? '● ONLINE' : '● OFFLINE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Routing</span>
                <span className="font-bold text-slate-900 dark:text-white">{config.routingPercent}% → FXFlow</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Video Quality</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{config.videoQuality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Image Model</span>
                <span className="font-bold text-slate-900 dark:text-white">{config.imageModel}</span>
              </div>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-4 bg-purple-500/[0.03] border border-purple-500/10 rounded-xl space-y-2">
            <p className="text-[10px] font-bold text-purple-500 flex items-center gap-1.5">
              <CheckCircle2 size={12} /> FXFlow Integration
            </p>
            <ul className="text-[9px] text-slate-500 dark:text-gray-500 space-y-1 leading-relaxed">
              <li>• Bên thứ 3 poll task từ <code className="text-purple-500">/fxflow/tasks/pending</code></li>
              <li>• Submit kết quả qua <code className="text-purple-500">/fxflow/tasks/:id/complete</code></li>
              <li>• Auto-refund credit nếu task lỗi</li>
              <li>• Routing % thay đổi realtime, không cần restart</li>
            </ul>
          </motion.div>

          {/* API Endpoints */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-4 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">API Endpoints</p>
            <div className="space-y-1.5 text-[9px] font-mono">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-bold">GET</span>
                <span className="text-slate-500 dark:text-gray-400 truncate">/fxflow/tasks/pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded font-bold">POST</span>
                <span className="text-slate-500 dark:text-gray-400 truncate">/fxflow/tasks/:id/complete</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
