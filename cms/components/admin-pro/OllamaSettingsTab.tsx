
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Loader2, Plus, Trash2, Check, X, KeyRound, Globe,
  Eye, EyeOff, ToggleLeft, ToggleRight, Save, Zap, AlertCircle,
} from 'lucide-react';
import { ollamaSettingsApi, OllamaModel, OllamaSettings, OllamaTestResult } from '../../apis/ollama-settings';

/* =====================================================
   OLLAMA CLOUD SETTINGS — Replace EzAI proxy
   Quản lý API key + baseURL + danh sách model active
===================================================== */

const SUGGESTED_MODELS: { id: string; label: string; tag: string }[] = [
  { id: 'qwen3.5',         label: 'Qwen 3.5',         tag: 'Khuyến nghị' },
  { id: 'deepseek-v3.1',    label: 'DeepSeek V3.1',    tag: 'Reasoning' },
  { id: 'gpt-oss',          label: 'GPT-OSS',           tag: 'Open' },
  { id: 'kimi-k2',          label: 'Kimi K2',           tag: 'Long context' },
  { id: 'llama3.3',         label: 'Llama 3.3',         tag: 'Meta' },
  { id: 'mixtral',          label: 'Mixtral',           tag: 'Mistral' },
];

export const OllamaSettingsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OllamaSettings | null>(null);

  // Form state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://ollama.com/v1');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [showKey, setShowKey] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<OllamaTestResult | null>(null);
  const [testingModel, setTestingModel] = useState<string | null>(null);

  // Add new model form
  const [newModelId, setNewModelId] = useState('');
  const [newModelLabel, setNewModelLabel] = useState('');

  // Load settings on mount
  useEffect(() => {
    (async () => {
      try {
        const s = await ollamaSettingsApi.get();
        setSettings(s);
        setBaseUrl(s.baseUrl);
        setModels(s.models.length > 0 ? s.models : [{ id: 'qwen3.5', label: 'Qwen 3.5', isActive: true }]);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await ollamaSettingsApi.update({
        apiKey: apiKeyInput,  // backend ignore nếu rỗng
        baseUrl,
        models,
      });
      // Reload mask
      const s = await ollamaSettingsApi.get();
      setSettings(s);
      setApiKeyInput('');
      alert('✓ Đã lưu cấu hình Ollama. Tất cả workspace AI sẽ dùng key mới.');
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'không lưu được'}`);
    }
    setIsSaving(false);
  }, [apiKeyInput, baseUrl, models]);

  const handleTest = useCallback(async (modelId: string) => {
    setTestingModel(modelId);
    setTestResult(null);
    try {
      const result = await ollamaSettingsApi.test({
        apiKey: apiKeyInput || undefined,  // dùng key đang nhập (nếu có) hoặc DB key
        baseUrl,
        model: modelId,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, ok: false, error: err?.message || 'Test failed' });
    }
    setTestingModel(null);
  }, [apiKeyInput, baseUrl]);

  const addModel = useCallback(() => {
    const id = newModelId.trim();
    if (!id) return;
    if (models.some(m => m.id === id)) {
      alert('Model ID đã tồn tại');
      return;
    }
    setModels(prev => [...prev, { id, label: newModelLabel.trim() || id, isActive: true }]);
    setNewModelId('');
    setNewModelLabel('');
  }, [newModelId, newModelLabel, models]);

  const addSuggested = useCallback((s: typeof SUGGESTED_MODELS[0]) => {
    if (models.some(m => m.id === s.id)) return;
    setModels(prev => [...prev, { id: s.id, label: s.label, isActive: true }]);
  }, [models]);

  const removeModel = useCallback((id: string) => {
    setModels(prev => prev.filter(m => m.id !== id));
  }, []);

  const toggleModel = useCallback((id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  }, []);

  const updateModelLabel = useCallback((id: string, label: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, label } : m));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Ollama Cloud — AI Provider</h2>
          <p className="text-[12px] text-slate-500 dark:text-gray-400 mt-0.5">
            Cấu hình API key và danh sách model AI cho toàn bộ workspace. Thay thế EzAI proxy cũ.
          </p>
        </div>
      </div>

      {/* Status badge */}
      {settings?.hasKey ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[12px] font-semibold">
          <Check size={14} />
          Đã có API key trong DB ({settings.apiKey})
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[12px] font-semibold">
          <AlertCircle size={14} />
          Chưa có API key — workspace sẽ fallback sang legacy EzAI keys
        </div>
      )}

      {/* API Key */}
      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#13171f] p-4">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound size={14} className="text-amber-500" />
          <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">API Key</h3>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-3 leading-relaxed">
          Lấy từ <a href="https://ollama.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">ollama.com/settings/keys</a>. Key sẽ lưu vào DB SystemSetting, ẩn trong response.
        </p>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder={settings?.hasKey ? '••••• Nhập key mới để thay (rỗng = giữ nguyên)' : 'Nhập API key Ollama Cloud (vd: 3202f6abd31445...)'}
            className="w-full px-3 py-2.5 pr-10 text-[12px] font-mono bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue/50"
          />
          <button
            onClick={() => setShowKey(v => !v)}
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Base URL */}
      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#13171f] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} className="text-cyan-500" />
          <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">Base URL</h3>
        </div>
        <input
          type="text"
          value={baseUrl}
          onChange={e => setBaseUrl(e.target.value)}
          placeholder="https://ollama.com/v1"
          className="w-full px-3 py-2.5 text-[12px] font-mono bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-brand-blue/50"
        />
        <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5">
          OpenAI-compatible endpoint. Default: <code className="text-brand-blue">https://ollama.com/v1</code>
        </p>
      </div>

      {/* Models list */}
      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#13171f] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot size={14} className="text-purple-500" />
            <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">Models ({models.length})</h3>
          </div>
        </div>

        {/* Suggested models */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-2">Gợi ý nhanh</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_MODELS.filter(s => !models.some(m => m.id === s.id)).map(s => (
              <button
                key={s.id}
                onClick={() => addSuggested(s)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-[10px] font-semibold text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-500 transition-colors"
              >
                <Plus size={10} /> {s.label} <span className="text-slate-400 dark:text-gray-500">· {s.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add custom model */}
        <div className="flex gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-white/[0.05]">
          <input
            type="text"
            value={newModelId}
            onChange={e => setNewModelId(e.target.value)}
            placeholder="Model ID (vd: qwen3.5)"
            onKeyDown={e => { if (e.key === 'Enter') addModel(); }}
            className="flex-1 px-3 py-2 text-[11px] font-mono bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-brand-blue/50"
          />
          <input
            type="text"
            value={newModelLabel}
            onChange={e => setNewModelLabel(e.target.value)}
            placeholder="Label (vd: Qwen 3.5 fast)"
            onKeyDown={e => { if (e.key === 'Enter') addModel(); }}
            className="flex-1 px-3 py-2 text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-brand-blue/50"
          />
          <button
            onClick={addModel}
            disabled={!newModelId.trim()}
            className="px-3 py-2 rounded-lg bg-purple-500 text-white text-[11px] font-bold hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <Plus size={12} /> Thêm
          </button>
        </div>

        {/* Models list */}
        <div className="space-y-2">
          {models.length === 0 ? (
            <p className="text-[12px] text-slate-400 dark:text-gray-500 text-center py-6">
              Chưa có model nào. Thêm từ "Gợi ý nhanh" hoặc nhập custom.
            </p>
          ) : (
            models.map(m => (
              <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <code className="text-[11px] font-mono text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 shrink-0">{m.id}</code>
                <input
                  value={m.label || ''}
                  onChange={e => updateModelLabel(m.id, e.target.value)}
                  placeholder="Label"
                  className="flex-1 px-2 py-1 text-[11px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-md text-slate-700 dark:text-gray-200 focus:outline-none focus:border-brand-blue/50"
                />
                {/* Test button */}
                <button
                  onClick={() => handleTest(m.id)}
                  disabled={testingModel === m.id}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50 flex items-center gap-1"
                  title="Test connection với model này"
                >
                  {testingModel === m.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                  Test
                </button>
                {/* Active toggle */}
                <button
                  onClick={() => toggleModel(m.id)}
                  className="p-1 text-slate-500 hover:text-brand-blue transition-colors"
                  title={m.isActive !== false ? 'Đang bật' : 'Đã tắt'}
                >
                  {m.isActive !== false ? (
                    <ToggleRight size={20} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={20} className="text-slate-400" />
                  )}
                </button>
                {/* Remove */}
                <button
                  onClick={() => removeModel(m.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                  title="Xoá khỏi danh sách"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test result panel */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`rounded-2xl border p-4 ${
              testResult.ok
                ? 'bg-emerald-500/[0.06] border-emerald-500/20'
                : 'bg-rose-500/[0.06] border-rose-500/20'
            }`}
          >
            <div className="flex items-start gap-2">
              {testResult.ok ? (
                <Check size={14} className="text-emerald-500 mt-0.5" />
              ) : (
                <X size={14} className="text-rose-500 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-bold ${testResult.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {testResult.ok ? `✓ Test OK — ${testResult.elapsedMs}ms` : '✗ Test failed'}
                </p>
                {testResult.model && (
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">Model: <code className="font-mono">{testResult.model}</code></p>
                )}
                {testResult.reply && (
                  <p className="text-[11px] text-slate-700 dark:text-gray-300 mt-1 italic">"{testResult.reply}"</p>
                )}
                {testResult.error && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-mono break-all">{testResult.error}</p>
                )}
              </div>
              <button onClick={() => setTestResult(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-[12px] font-bold shadow-lg shadow-brand-blue/30 hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>
    </div>
  );
};
