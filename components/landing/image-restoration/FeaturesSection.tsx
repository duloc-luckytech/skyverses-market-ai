
import React from 'react';
import { User, Eraser, Palette, Activity, Maximize2, Zap, ShieldCheck, Clock } from 'lucide-react';

const FEATURES = [
  { t: 'Face Enhancement', i: User, d: 'Khôi phục chân dung với độ chính xác tuyệt đối, giữ nguyên đặc điểm nhận dạng.' },
  { t: 'Scratch Removal', i: Eraser, d: 'Tự động xóa bỏ các vết xước, nếp gấp và vết ố bẩn của thời gian.' },
  { t: 'Color Synthesis', i: Palette, d: 'Chế độ AI thông minh tự động lên màu cho ảnh đen trắng một cách tự nhiên.' },
  { t: 'Noise Reduction', i: Activity, d: 'Loại bỏ hiện tượng nhiễu hạt (grain) và các lỗi nén kỹ thuật số.' },
  { t: '8K Upscaling', i: Maximize2, d: 'Nâng cấp kích thước ảnh lên gấp 8 lần mà không làm vỡ hình.' },
  { t: 'Industrial Speed', i: Zap, d: 'Xử lý phục chế ảnh chỉ trong chưa đầy 5 giây nhờ cụm H100 GPU.' },
  { t: 'Privacy Vault', i: ShieldCheck, d: 'Dữ liệu cá nhân của bạn được bảo mật tuyệt đối trong mạng riêng ảo VPC.' },
  { t: 'History Sync', i: Clock, d: 'Lưu trữ lịch sử phục chế đồng bộ trên mọi thiết bị trong Cloud Registry.' }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-32 lg:py-40 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16 lg:space-y-24">
        <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic text-center text-slate-900 dark:text-white">Technical Mastery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden">
          {FEATURES.map((f, i) => {
            const Icon = f.i;
            return (
              <div key={i} className="p-10 lg:p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-emerald-500/[0.02] transition-all duration-500">
                <div className="text-emerald-600 dark:text-emerald-400 opacity-60">
                  <Icon size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base lg:text-lg font-black uppercase tracking-widest italic text-slate-900 dark:text-white">{f.t}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 font-bold uppercase leading-loose tracking-tight">"{f.d}"</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
