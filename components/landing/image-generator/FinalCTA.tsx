import React from 'react';
import { Sparkles } from 'lucide-react';

interface FinalCTAProps { onStartStudio: () => void; }

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartStudio }) => (
  <section className="px-6 lg:px-16 py-20 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-2xl lg:text-4xl font-bold mb-4">
        Sẵn sàng tạo hình ảnh AI?
      </h2>
      <p className="text-sm text-slate-500 dark:text-white/30 mb-8 max-w-lg mx-auto leading-relaxed">
        22+ model · Lên tới 12K · 11 tỷ lệ · Single & Batch mode · Auto Refund · Cloud History
      </p>
      <button
        onClick={onStartStudio}
        className="px-10 py-4 bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-[0.98] transition-all inline-flex items-center gap-3"
      >
        <Sparkles size={18} />
        Bắt đầu ngay
      </button>
    </div>
  </section>
);
