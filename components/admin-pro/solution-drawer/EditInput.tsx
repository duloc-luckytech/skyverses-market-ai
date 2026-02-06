import React from 'react';

interface EditInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}

export const EditInput: React.FC<EditInputProps> = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2 italic">{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner" 
    />
  </div>
);
