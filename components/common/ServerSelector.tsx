import React from 'react';
import { Cpu } from 'lucide-react';

/**
 * SERVER_OPTIONS — Danh sách server dùng chung cho tất cả page tạo hình/video/audio
 * Khi cần thêm server mới, chỉ cần thêm vào đây.
 */
export const SERVER_OPTIONS = [
  { key: 'gommo', label: 'Server 1' },
  { key: 'fxflow', label: 'Server 2' },
] as const;

export type ServerKey = typeof SERVER_OPTIONS[number]['key'];

/**
 * getServerLabel — Lấy label hiển thị từ server key
 */
export const getServerLabel = (key: string): string => {
  return SERVER_OPTIONS.find(s => s.key === key)?.label || key;
};

/**
 * ServerSelector — Shared pill-style selector
 * Dùng chung cho image, video, audio, product image, v.v.
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
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
  variant = 'pill',
  showLabel = true,
  labelText = 'Server',
}) => {
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
          {SERVER_OPTIONS.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
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
          return (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                isActive
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                  : 'bg-black/[0.02] dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-black/[0.04] dark:border-white/[0.04] hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
