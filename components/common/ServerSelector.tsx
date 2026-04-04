
import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { pricingApi } from '../../apis/pricing';

/**
 * SERVER_OPTIONS — Danh sách server dùng chung cho tất cả page tạo hình/video/audio
 * Khi cần thêm server mới, chỉ cần thêm vào đây.
 */
export const SERVER_OPTIONS = [
  { key: 'gommo', label: 'Server 1' },
  { key: 'fxflow', label: 'Server 2' },
  { key: 'grok', label: 'Server 3' },
] as const;

export type ServerKey = typeof SERVER_OPTIONS[number]['key'];

/**
 * getServerLabel — Lấy label hiển thị từ server key
 */
export const getServerLabel = (key: string): string => {
  return SERVER_OPTIONS.find(s => s.key === key)?.label || key;
};

/**
 * useServerStatus — Shared hook to fetch server live/off status
 * Returns a map: { gommo: true, fxflow: false }
 */
export const useServerStatus = () => {
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await pricingApi.getServerStatus();
        if (!cancelled && res.success) {
          setStatusMap(res.data);
        }
      } catch (e) {
        console.error('Failed to fetch server status:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { statusMap, isLoading };
};

/**
 * ServerSelector — Shared pill-style selector
 * Dùng chung cho image, video, audio, product image, v.v.
 * Servers that are offline will be disabled + show "(OFF)" label
 */
interface ServerSelectorProps {
  selected: string;
  onChange: (key: string) => void;
  disabled?: boolean;
  /** Visual variant: 'pill' | 'dropdown' */
  variant?: 'pill' | 'dropdown';
  /** Show label above */
  showLabel?: boolean;
  labelText?: string;
  /** External server status map (optional — if not provided, fetches itself) */
  serverStatusMap?: Record<string, boolean>;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
  variant = 'pill',
  showLabel = true,
  labelText = 'Server',
  serverStatusMap,
}) => {
  // Use internal hook if no external map provided
  const internal = useServerStatus();
  const statusMap = serverStatusMap || internal.statusMap;

  // Auto-switch to first live server if current is off
  useEffect(() => {
    if (Object.keys(statusMap).length === 0) return;
    if (statusMap[selected] === false) {
      const firstLive = SERVER_OPTIONS.find(s => statusMap[s.key] !== false);
      if (firstLive) onChange(firstLive.key);
    }
  }, [statusMap, selected]);

  if (variant === 'dropdown') {
    return (
      <div className="space-y-1.5">
        {showLabel && (
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 flex items-center gap-1.5">
            <Cpu size={11} className="text-rose-400" /> {labelText}
          </label>
        )}
        <select
          value={selected}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 p-3 rounded-lg text-[11px] font-black uppercase outline-none appearance-none focus:border-purple-500 text-slate-800 dark:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          {SERVER_OPTIONS.map(s => {
            const isLive = statusMap[s.key] !== false;
            return (
              <option key={s.key} value={s.key} disabled={!isLive}>
                {s.label}{!isLive ? ' (OFF)' : ''}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  // Pill variant
  return (
    <div className="space-y-1.5">
      {showLabel && (
        <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
          <Cpu size={11} className="text-rose-400" /> {labelText}
        </p>
      )}
      <div className="flex gap-1.5">
        {SERVER_OPTIONS.map(s => {
          const isActive = selected === s.key;
          const isLive = statusMap[s.key] !== false;
          const isDisabledServer = !isLive;
          return (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              disabled={disabled || isDisabledServer}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border relative ${
                isDisabledServer
                  ? 'bg-red-500/5 text-red-400/50 border-red-500/10 cursor-not-allowed opacity-60'
                  : isActive
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-black/[0.04] dark:border-white/[0.04] hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10'
              } disabled:cursor-not-allowed`}
            >
              {isDisabledServer && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {isLive && isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              )}
              {s.label}{isDisabledServer ? ' (OFF)' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};
