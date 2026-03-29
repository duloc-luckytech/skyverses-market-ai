
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Tag, Layers, FileText, MessageSquare,
  Image, Link2, DollarSign, Globe, Smartphone, Monitor, Puzzle,
  Cpu, Sparkles, Code2, BookOpen,
  User, Mail, Building2, ExternalLink, Send as SendIcon,
  Check, AlertCircle, Zap, ArrowRight, ArrowLeft, Loader2, CheckCircle
} from 'lucide-react';
import {
  ProductSubmission, PRODUCT_CATEGORIES, COMPLEXITY_LEVELS,
  DEMO_TYPES, PLATFORM_OPTIONS
} from '../../hooks/useAppsPage';

// ═══ SHARED INPUT STYLES ═══
const INPUT_CLASS = "w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600";
const SELECT_CLASS = "w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer";
const LABEL_CLASS = "flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1";

// ═══ ANIMATION VARIANTS ═══
const stepVariants = {
  enter: { opacity: 0, x: 30, transition: { duration: 0.3 } },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

interface StepProps {
  formData: ProductSubmission;
  updateField: <K extends keyof ProductSubmission>(field: K, value: ProductSubmission[K]) => void;
  autoSlug: (name: string) => void;
  togglePlatform: (platform: string) => void;
}

// ═══════════ STEP 1: Product Info ═══════════
export const Step1ProductInfo: React.FC<StepProps> = ({ formData, updateField, autoSlug }) => (
  <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
    {/* Product Name + Slug */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><Package size={12} /> Tên sản phẩm <span className="text-rose-400">*</span></label>
        <input
          required value={formData.productName}
          onChange={e => autoSlug(e.target.value)}
          className={INPUT_CLASS}
          placeholder="VD: AI Video Generator Pro"
        />
      </div>
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><Link2 size={12} /> Slug (tự động)</label>
        <input
          value={formData.productSlug}
          onChange={e => updateField('productSlug', e.target.value)}
          className={INPUT_CLASS + ' text-slate-400'}
          placeholder="ai-video-generator-pro"
        />
      </div>
    </div>

    {/* Category + Demo Type */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><Layers size={12} /> Danh mục <span className="text-rose-400">*</span></label>
        <select
          value={formData.category}
          onChange={e => updateField('category', e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="" disabled>Chọn danh mục</option>
          {PRODUCT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><FileText size={12} /> Loại Demo <span className="text-rose-400">*</span></label>
        <select
          value={formData.demoType}
          onChange={e => updateField('demoType', e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="" disabled>Chọn loại demo</option>
          {DEMO_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>
    </div>

    {/* Complexity */}
    <div className="space-y-2">
      <label className={LABEL_CLASS}><Layers size={12} /> Cấp độ phức tạp</label>
      <div className="grid grid-cols-3 gap-2">
        {COMPLEXITY_LEVELS.map(level => (
          <button
            key={level.value}
            type="button"
            onClick={() => updateField('complexity', level.value)}
            className={`p-3 rounded-xl border text-center transition-all ${
              formData.complexity === level.value
                ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                : 'bg-white dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] text-slate-600 dark:text-gray-400 hover:border-brand-blue/30'
            }`}
          >
            <p className="text-[11px] font-bold">{level.label}</p>
            <p className={`text-[9px] mt-0.5 ${formData.complexity === level.value ? 'text-white/60' : 'text-slate-300 dark:text-gray-600'}`}>{level.desc}</p>
          </button>
        ))}
      </div>
    </div>

    {/* Short Description */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><MessageSquare size={12} /> Mô tả ngắn <span className="text-rose-400">*</span></label>
      <textarea
        required rows={2}
        value={formData.shortDescription}
        onChange={e => updateField('shortDescription', e.target.value)}
        className={INPUT_CLASS + ' resize-none'}
        placeholder="1-2 câu miêu tả value proposition chính của sản phẩm..."
        maxLength={200}
      />
      <p className="text-[10px] text-slate-300 dark:text-gray-600 text-right">{formData.shortDescription.length}/200</p>
    </div>

    {/* Full Description */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><FileText size={12} /> Mô tả đầy đủ</label>
      <textarea
        rows={4}
        value={formData.fullDescription}
        onChange={e => updateField('fullDescription', e.target.value)}
        className={INPUT_CLASS + ' resize-none'}
        placeholder="Mô tả chi tiết sản phẩm, use case, công nghệ sử dụng, điểm mạnh..."
      />
    </div>

    {/* Tags */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><Tag size={12} /> Tags (phân cách bằng dấu phẩy)</label>
      <input
        value={formData.tags}
        onChange={e => updateField('tags', e.target.value)}
        className={INPUT_CLASS}
        placeholder="VD: video, AI, generator, text-to-video, VEO3"
      />
    </div>
  </motion.div>
);

// ═══════════ STEP 2: Media & Pricing ═══════════
export const Step2MediaPricing: React.FC<StepProps> = ({ formData, updateField, togglePlatform }) => (
  <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
    {/* Thumbnail URL */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><Image size={12} /> Thumbnail URL <span className="text-rose-400">*</span></label>
      <input
        required
        value={formData.thumbnailUrl}
        onChange={e => updateField('thumbnailUrl', e.target.value)}
        className={INPUT_CLASS}
        placeholder="https://... (ảnh đại diện sản phẩm, 16:9 recommended)"
      />
      {/* Preview */}
      {formData.thumbnailUrl && (
        <div className="mt-2 rounded-xl overflow-hidden border border-black/[0.04] dark:border-white/[0.04] h-[140px] bg-slate-50 dark:bg-white/[0.02]">
          <img 
            src={formData.thumbnailUrl} 
            alt="Preview" 
            className="w-full h-full object-cover" 
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
    </div>

    {/* Gallery URLs */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><Image size={12} /> Gallery URLs (mỗi URL 1 dòng)</label>
      <textarea
        rows={3}
        value={formData.galleryUrls}
        onChange={e => updateField('galleryUrls', e.target.value)}
        className={INPUT_CLASS + ' resize-none'}
        placeholder={"https://image1.png\nhttps://image2.png\nhttps://image3.png"}
      />
    </div>

    {/* Demo URL */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><ExternalLink size={12} /> Demo URL</label>
      <input
        value={formData.demoUrl}
        onChange={e => updateField('demoUrl', e.target.value)}
        className={INPUT_CLASS}
        placeholder="https://demo.yourapp.com"
      />
    </div>

    {/* Pricing */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><DollarSign size={12} /> Giá (Credits/lượt)</label>
        <input
          type="number"
          value={formData.priceCredits}
          onChange={e => updateField('priceCredits', e.target.value)}
          className={INPUT_CLASS}
          placeholder="VD: 5"
          disabled={formData.isFree}
        />
      </div>
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><Zap size={12} /> Miễn phí</label>
        <button
          type="button"
          onClick={() => updateField('isFree', !formData.isFree)}
          className={`w-full py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            formData.isFree
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-50 dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] text-slate-400'
          }`}
        >
          {formData.isFree ? <><Check size={14} /> FREE</> : 'Đặt miễn phí'}
        </button>
      </div>
    </div>

    {/* Platforms */}
    <div className="space-y-2">
      <label className={LABEL_CLASS}><Globe size={12} /> Nền tảng hỗ trợ</label>
      <div className="flex flex-wrap gap-2">
        {PLATFORM_OPTIONS.map(plat => (
          <button
            key={plat.value}
            type="button"
            onClick={() => togglePlatform(plat.value)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold border transition-all ${
              formData.platforms.includes(plat.value)
                ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                : 'bg-white dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] text-slate-500 dark:text-gray-400 hover:border-brand-blue/30'
            }`}
          >
            {formData.platforms.includes(plat.value) && <Check size={10} />}
            {plat.label}
          </button>
        ))}
      </div>
    </div>
  </motion.div>
);

// ═══════════ STEP 3: Technical ═══════════
export const Step3Technical: React.FC<StepProps> = ({ formData, updateField }) => (
  <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
    {/* AI Models */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><Cpu size={12} /> AI Models sử dụng</label>
      <input
        value={formData.aiModels}
        onChange={e => updateField('aiModels', e.target.value)}
        className={INPUT_CLASS}
        placeholder="VD: VEO3, Flux Pro, Kling, GPT-4o, Gemini..."
      />
    </div>

    {/* Features */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><Sparkles size={12} /> Tính năng chính <span className="text-rose-400">*</span> (mỗi dòng 1 feature)</label>
      <textarea
        required rows={5}
        value={formData.features}
        onChange={e => updateField('features', e.target.value)}
        className={INPUT_CLASS + ' resize-none'}
        placeholder={"Text-to-Video AI Generation\nMulti-model support (VEO3, Kling, Sora)\nReal-time preview\nBatch processing\n4K output support"}
      />
      {formData.features && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {formData.features.split('\n').filter(Boolean).map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-blue/[0.06] text-brand-blue rounded-lg text-[10px] font-medium border border-brand-blue/10">
              <Check size={8} /> {f.trim()}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* API Endpoint */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><Code2 size={12} /> API Endpoint (nếu có)</label>
      <input
        value={formData.apiEndpoint}
        onChange={e => updateField('apiEndpoint', e.target.value)}
        className={INPUT_CLASS}
        placeholder="https://api.yourapp.com/v1/generate"
      />
    </div>

    {/* Documentation */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><BookOpen size={12} /> Tài liệu / README URL</label>
      <input
        value={formData.documentation}
        onChange={e => updateField('documentation', e.target.value)}
        className={INPUT_CLASS}
        placeholder="https://docs.yourapp.com"
      />
    </div>

    {/* Info banner */}
    <div className="flex items-start gap-3 p-3.5 bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/10 dark:border-brand-blue/15 rounded-xl">
      <AlertCircle size={16} className="text-brand-blue shrink-0 mt-0.5" />
      <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
        Các thông tin kỹ thuật giúp đội ngũ Skyverses hiểu rõ sản phẩm của bạn và tích hợp nhanh hơn vào Marketplace.
      </p>
    </div>
  </motion.div>
);

// ═══════════ STEP 4: Review & Submit ═══════════
interface Step4Props extends StepProps {
  user: any;
}

export const Step4ReviewSubmit: React.FC<Step4Props> = ({ formData, updateField, user }) => (
  <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
    {/* Auto-filled creator info */}
    {user && (
      <div className="flex items-center gap-3.5 p-4 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] border border-emerald-500/10 rounded-xl">
        <img 
          src={user.picture || user.avatar} 
          alt="" 
          className="w-10 h-10 rounded-xl object-cover border border-emerald-500/20" 
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-400 dark:text-gray-500">{user.email}</p>
        </div>
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded-lg">VERIFIED</span>
      </div>
    )}

    {/* Creator Info Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><User size={12} /> Tên hiển thị <span className="text-rose-400">*</span></label>
        <input
          required
          value={formData.creatorName}
          onChange={e => updateField('creatorName', e.target.value)}
          className={INPUT_CLASS}
          placeholder="Tên creator / developer"
        />
      </div>
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><Mail size={12} /> Email liên hệ <span className="text-rose-400">*</span></label>
        <input
          required type="email"
          value={formData.creatorEmail}
          onChange={e => updateField('creatorEmail', e.target.value)}
          className={INPUT_CLASS}
          placeholder="name@company.com"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><Building2 size={12} /> Studio / Team</label>
        <input
          value={formData.creatorStudio}
          onChange={e => updateField('creatorStudio', e.target.value)}
          className={INPUT_CLASS}
          placeholder="VD: Skyverses Team"
        />
      </div>
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}><ExternalLink size={12} /> Website</label>
        <input
          value={formData.creatorWebsite}
          onChange={e => updateField('creatorWebsite', e.target.value)}
          className={INPUT_CLASS}
          placeholder="https://yourwebsite.com"
        />
      </div>
    </div>

    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><SendIcon size={12} /> Telegram</label>
      <input
        value={formData.creatorTelegram}
        onChange={e => updateField('creatorTelegram', e.target.value)}
        className={INPUT_CLASS}
        placeholder="@username"
      />
    </div>

    {/* Review Summary */}
    <div className="space-y-3 p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
      <h4 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Tổng quan sản phẩm</h4>
      <div className="space-y-2">
        {[
          { label: 'Tên', value: formData.productName },
          { label: 'Danh mục', value: PRODUCT_CATEGORIES.find(c => c.value === formData.category)?.label || '—' },
          { label: 'Cấp độ', value: formData.complexity },
          { label: 'Giá', value: formData.isFree ? 'FREE' : (formData.priceCredits ? `${formData.priceCredits} Credits` : '—') },
          { label: 'Platforms', value: formData.platforms.join(', ') || '—' },
          { label: 'Features', value: formData.features ? `${formData.features.split('\n').filter(Boolean).length} tính năng` : '—' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-black/[0.02] dark:border-white/[0.02] last:border-0">
            <span className="text-[11px] text-slate-400 dark:text-gray-500">{item.label}</span>
            <span className="text-[12px] font-bold text-slate-700 dark:text-gray-300">{item.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Additional Notes */}
    <div className="space-y-1.5">
      <label className={LABEL_CLASS}><MessageSquare size={12} /> Ghi chú thêm</label>
      <textarea
        rows={3}
        value={formData.additionalNotes}
        onChange={e => updateField('additionalNotes', e.target.value)}
        className={INPUT_CLASS + ' resize-none'}
        placeholder="Bất kỳ thông tin bổ sung nào cho Skyverses team..."
      />
    </div>
  </motion.div>
);

// ═══════════ FORM NAVIGATION ═══════════
interface FormNavProps {
  currentStep: number;
  isStepValid: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const FormNavigation: React.FC<FormNavProps> = ({
  currentStep, isStepValid, isSubmitting, isSuccess, onPrev, onNext, onSubmit
}) => (
  <div className="flex items-center justify-between pt-5 border-t border-black/[0.04] dark:border-white/[0.04]">
    {currentStep > 1 ? (
      <button
        type="button"
        onClick={onPrev}
        className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={14} /> Quay lại
      </button>
    ) : (
      <div />
    )}

    {currentStep < 4 ? (
      <button
        type="button"
        onClick={onNext}
        disabled={!isStepValid}
        className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-blue/20"
      >
        Tiếp theo <ArrowRight size={14} />
      </button>
    ) : (
      <button
        type="button"
        onClick={onSubmit}
        disabled={!isStepValid || isSubmitting}
        className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-brand-blue to-purple-500 text-white text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/20"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
        ) : isSuccess ? (
          <><CheckCircle size={16} /> Gửi thành công!</>
        ) : (
          <><SendIcon size={16} /> Gửi đề xuất</>
        )}
      </button>
    )}
  </div>
);

// ═══════════ SUCCESS OVERLAY ═══════════
export const SuccessOverlay: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 bg-white/95 dark:bg-[#0a0a0e]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-5 rounded-2xl"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
    >
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <CheckCircle size={40} className="text-emerald-500" />
      </div>
    </motion.div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gửi thành công!</h3>
      <p className="text-sm text-slate-400 dark:text-gray-500 max-w-sm">
        Sản phẩm của bạn đã được gửi thành công. 
        Đội ngũ Skyverses sẽ review và phản hồi trong <strong className="text-brand-blue">48 giờ</strong>.
      </p>
    </div>
    <button
      onClick={onReset}
      className="mt-2 px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
    >
      Gửi sản phẩm khác
    </button>
  </motion.div>
);
