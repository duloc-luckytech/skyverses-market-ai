import React from 'react';

interface EditInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

export const EditInput: React.FC<EditInputProps> = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-semibold text-slate-400 dark:text-gray-500 tracking-wide">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-[12px] font-medium bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 focus:ring-1 focus:ring-brand-blue/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-700"
    />
  </div>
);
