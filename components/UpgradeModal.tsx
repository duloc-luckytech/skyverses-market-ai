import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, Sparkles, Zap, Building2, Check, Lock,
  Film, FileText, Share2, Download, Layers, Crown
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: highlight which feature triggered the upgrade prompt */
  featureHint?: string;
}

interface PlanDef {
  id: string;
  name: string;
  price: string;
  period: string;
  accent: string;
  badgeClass: string;
  icon: React.ReactNode;
  features: { text: string; ok: boolean }[];
  cta: string | null;
  ctaExternal?: boolean;
  ctaLabel: string;
  highlight: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    accent: 'border-white/10',
    badgeClass: 'bg-white/5 text-white/50',
    icon: <Layers size={18} />,
    features: [
      { text: 'Tối đa 10 cảnh / dự án', ok: true },
      { text: '100 ảnh / tháng', ok: true },
      { text: 'Export Overview + PDF', ok: true },
      { text: 'EDL / XML / FCPXML', ok: false },
      { text: 'Animatic preview', ok: false },
      { text: 'Share link công khai', ok: false },
      { text: 'Batch export video', ok: false },
      { text: 'Render không watermark', ok: false },
    ],
    cta: null,
    ctaLabel: 'Gói hiện tại',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/tháng',
    accent: 'border-brand-blue/60 ring-1 ring-brand-blue/20',
    badgeClass: 'bg-gradient-to-r from-brand-blue to-purple-500 text-white',
    icon: <Zap size={18} />,
    features: [
      { text: 'Không giới hạn cảnh', ok: true },
      { text: '1,000 ảnh / tháng', ok: true },
      { text: 'Tất cả export (PDF, EDL, XML...)', ok: true },
      { text: 'Animatic preview', ok: true },
      { text: 'Share link công khai', ok: true },
      { text: 'Batch export video', ok: true },
      { text: 'Render không watermark', ok: true },
      { text: 'Hàng đợi ưu tiên', ok: true },
    ],
    cta: '/credits',
    ctaLabel: '✦ Nâng cấp lên Pro',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Liên hệ',
    period: '',
    accent: 'border-purple-500/40',
    badgeClass: 'bg-purple-500/20 text-purple-300',
    icon: <Building2 size={18} />,
    features: [
      { text: 'Tất cả tính năng Pro', ok: true },
      { text: 'API access', ok: true },
      { text: 'Team collaboration', ok: true },
      { text: 'Dedicated support', ok: true },
      { text: 'Custom branding', ok: true },
      { text: 'SLA cam kết', ok: true },
      { text: 'Quản lý nhiều workspace', ok: true },
      { text: 'Tích hợp hệ thống riêng', ok: true },
    ],
    cta: 'https://skyverses.com/contact',
    ctaExternal: true,
    ctaLabel: 'Liên hệ ngay',
    highlight: false,
  },
];

const FEATURE_LABELS: Record<string, string> = {
  export_edl: 'Export EDL',
  export_xml: 'Export XML / FCPXML',
  export_animatic: 'Animatic Preview',
  share_link: 'Share Link',
  batch_export: 'Batch Export Video',
  unlimited_scenes: 'Không giới hạn cảnh',
  watermark_free: 'Render không watermark',
  priority_render: 'Hàng đợi ưu tiên',
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureHint }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-end md:items-center justify-center p-0 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar bg-[#0a0a0d] border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0a0a0d] border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                  <Crown size={16} className="text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-[15px] font-black uppercase italic tracking-tight text-white">Nâng cấp lên Pro</h2>
                  {featureHint && FEATURE_LABELS[featureHint] && (
                    <p className="text-[10px] text-white/40 font-medium">
                      <Lock size={9} className="inline mr-1" />
                      {FEATURE_LABELS[featureHint]} — chỉ dành cho Pro
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/8 rounded-full text-white/40 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pricing grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {PLANS.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: plan.id === 'free' ? 0 : plan.id === 'pro' ? 0.06 : 0.12 }}
                  className={`relative flex flex-col rounded-2xl border bg-white/[0.03] p-5 gap-4 ${plan.accent} ${plan.highlight ? 'shadow-[0_0_40px_-8px_rgba(59,130,246,0.3)]' : ''}`}
                >
                  {/* PRO recommended badge */}
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-blue rounded-full text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">
                      ✦ Khuyên dùng
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.badgeClass}`}>
                      {plan.icon}
                    </span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-white/90">{plan.name}</p>
                      <p className="text-xs text-white/40 font-medium leading-none mt-0.5">
                        <span className="text-lg font-black text-white">{plan.price}</span>{plan.period}
                      </p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {f.ok ? (
                          <Check size={13} className="shrink-0 text-emerald-400" />
                        ) : (
                          <Lock size={11} className="shrink-0 text-white/20" />
                        )}
                        <span className={`text-[11px] font-medium leading-snug ${f.ok ? 'text-white/80' : 'text-white/25 line-through'}`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-2">
                    {plan.cta ? (
                      plan.ctaExternal ? (
                        <a
                          href={plan.cta}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                            border border-purple-500/30 text-purple-300 hover:bg-purple-500/10`}
                        >
                          {plan.ctaLabel}
                        </a>
                      ) : (
                        <Link
                          to={plan.cta}
                          onClick={onClose}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                            ${plan.highlight
                              ? 'bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/30'
                              : 'border border-white/10 text-white/60 hover:bg-white/5'
                            }`}
                        >
                          {plan.ctaLabel}
                        </Link>
                      )
                    ) : (
                      <div className="w-full flex items-center justify-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/5 text-white/20 cursor-default">
                        {plan.ctaLabel}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
              <div className="flex items-center gap-4 text-[10px] text-white/25 font-medium uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Film size={11} /> Unlimited renders</span>
                <span className="flex items-center gap-1.5"><FileText size={11} /> All exports</span>
                <span className="flex items-center gap-1.5"><Share2 size={11} /> Share links</span>
                <span className="flex items-center gap-1.5"><Download size={11} /> Batch download</span>
              </div>
              <p className="text-[10px] text-white/20 font-medium">Hủy bất cứ lúc nào · Không có phí ẩn</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
