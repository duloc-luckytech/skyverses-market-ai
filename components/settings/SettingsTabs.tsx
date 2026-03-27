
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Save, Loader2, Sparkles, Zap, Activity,
  Brain, ShieldCheck, Smartphone, Lock, Eye, EyeOff,
  Shield, Users, Copy, Check, ArrowRight,
  History as HistoryIcon, UserCheck, Cloud,
  Moon, Sun, Globe, Coins, Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

// ━━━━━━━━━━━━ Shared ━━━━━━━━━━━━

const tabAnimation = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

export const InputGroup = ({ label, value, onChange, disabled, icon }: any) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
      {icon && <span className="opacity-60">{icon}</span>}
      {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'text-slate-800 dark:text-white'}`}
    />
  </div>
);

export const KeyInputGroup = ({ label, icon, value, onChange, placeholder }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-1">
        {icon}
        <label className="text-xs font-bold text-slate-500 dark:text-gray-400">{label}</label>
      </div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-xl text-sm font-mono outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white pr-12"
        />
        <button
          type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, val, icon, color = 'text-brand-blue' }: any) => (
  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className={`${color} opacity-60`}>{icon}</span>}
      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-xl font-black tracking-tight">{val}</p>
  </div>
);

// ━━━━━━━━━━━━ TABS ━━━━━━━━━━━━

// ── Profile ──
export const ProfileTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleSave = async () => {
    await logic.handleSaveProfile();
    showToast('Đã lưu thông tin!', 'success');
  };

  return (
    <motion.div key="profile" {...tabAnimation} className="space-y-8">
      {/* Avatar Row */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="relative group cursor-pointer">
          <img src={logic.user?.picture} className="w-20 h-20 rounded-2xl border-2 border-white dark:border-[#1a1a1e] shadow-lg object-cover" alt="Avatar" />
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="text-white" size={20} />
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{logic.user?.name}</h3>
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">{logic.user?.email}</p>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-md border border-emerald-500/15">
              <Check size={10} strokeWidth={3} /> {t('settings.profile.verified')}
            </span>
            {logic.user?.plan && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded-md border border-brand-blue/15">
                {logic.user.plan}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup
          label={t('settings.profile.name')}
          value={logic.profileName}
          onChange={(e: any) => logic.setProfileName(e.target.value)}
        />
        <InputGroup label={t('settings.profile.email')} value={logic.user?.email || ''} disabled />
        <InputGroup label="Invite Code" value={logic.user?.inviteCode || '—'} disabled />
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">{t('settings.profile.language')}</label>
          <select
            value={logic.lang} onChange={(e) => logic.setLang(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-brand-blue transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={16} className="text-purple-400" /> : <Sun size={16} className="text-amber-500" />}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Giao diện</p>
            <p className="text-[10px] text-slate-400">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={`w-11 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-purple-500' : 'bg-slate-300'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${theme === 'dark' ? 'right-0.5' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Save */}
      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-end">
        <button onClick={handleSave} className="bg-brand-blue text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-brand-blue/15 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
          {logic.isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {t('settings.profile.save')}
        </button>
      </div>
    </motion.div>
  );
};

// ── Compute ──
export const ComputeTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const usedPercent = logic.user?.plan ? Math.min(100, ((logic.user?.videoUsed || 0) / (logic.user?.maxVideo || 1)) * 100) : 0;

  return (
    <motion.div key="compute" {...tabAnimation} className="space-y-8">
      {/* Balance Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#0f1015] dark:to-[#12141a] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
            <Sparkles size={22} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t('settings.compute.balance_label')}</p>
            <h3 className="text-3xl font-black tracking-tight text-white">{logic.credits.toLocaleString()} <span className="text-sm font-bold text-white/40">credits</span></h3>
          </div>
        </div>
        <Link to="/credits" className="bg-brand-blue text-white px-6 py-3 rounded-xl text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-md">
          {t('settings.compute.topup')} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Usage stats */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={14} /> {t('settings.compute.stats')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label="Plan" val={logic.user?.plan || 'Free'} icon={<Shield size={14} />} color="text-purple-500" />
          <StatBox
            label="Video đã dùng"
            val={`${logic.user?.videoUsed || 0} / ${logic.user?.maxVideo || '∞'}`}
            icon={<Zap size={14} />}
          />
          <StatBox
            label={t('settings.compute.performance')}
            val={t('settings.compute.optimal')}
            icon={<Check size={14} />}
            color="text-emerald-500"
          />
        </div>
      </div>

      {/* Video usage bar */}
      {logic.user?.plan && (
        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Video quota</span>
            <span className="text-xs font-bold text-slate-400">{Math.round(usedPercent)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPercent}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${usedPercent > 80 ? 'bg-red-500' : usedPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── Model Keys ──
export const ModelKeysTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleSave = async () => {
    await logic.handleSaveKeys();
    showToast('Đã lưu API Keys!', 'success');
  };

  return (
    <motion.div key="keys" {...tabAnimation} className="space-y-8">
      <div className="space-y-5">
        <KeyInputGroup
          label="Google Gemini Key"
          icon={<Sparkles size={14} className="text-purple-500" />}
          value={logic.modelKeys.gemini}
          onChange={(val: string) => logic.setModelKeys({ ...logic.modelKeys, gemini: val })}
          placeholder={t('settings.keys.placeholder')}
        />
        <KeyInputGroup
          label="OpenAI Key"
          icon={<Brain size={14} className="text-emerald-500" />}
          value={logic.modelKeys.openai}
          onChange={(val: string) => logic.setModelKeys({ ...logic.modelKeys, openai: val })}
          placeholder={t('settings.keys.placeholder')}
        />
      </div>

      {/* BYOK Notice */}
      <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-0.5">{t('settings.keys.byok')}</p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 leading-relaxed">{t('settings.keys.byok_desc')}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-between items-center">
        <button onClick={logic.handleResetKeys} className="text-xs font-bold text-red-500 hover:underline">{t('settings.keys.reset')}</button>
        <button onClick={handleSave} className="bg-brand-blue text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-brand-blue/15 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
          {logic.isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {t('settings.keys.save')}
        </button>
      </div>
    </motion.div>
  );
};

// ── Security ──
export const SecurityTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="security" {...tabAnimation} className="space-y-4">
      {/* Account info */}
      <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thông tin tài khoản</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/[0.02] rounded-lg border border-black/[0.03] dark:border-white/[0.03]">
            <Globe size={14} className="text-brand-blue" />
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Login method</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-white">Google OAuth</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/[0.02] rounded-lg border border-black/[0.03] dark:border-white/[0.03]">
            <Clock size={14} className="text-emerald-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Tham gia từ</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-white">
                {logic.user?.createdAt ? new Date(logic.user.createdAt).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security options */}
      <div className="flex items-center justify-between p-5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl hover:border-brand-blue/20 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-slate-400">
            <Smartphone size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('settings.security.2fa')}</h4>
            <p className="text-xs text-slate-400 dark:text-gray-500">{t('settings.security.2fa_desc')}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 rounded-md border border-amber-500/15 uppercase tracking-wider">
          Coming soon
        </span>
      </div>

      <div className="flex items-center justify-between p-5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl hover:border-brand-blue/20 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-slate-400">
            <Lock size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('settings.security.password')}</h4>
            <p className="text-xs text-slate-400 dark:text-gray-500">{t('settings.security.password_desc')}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 rounded-md uppercase tracking-wider">
          Google only
        </span>
      </div>

      {/* Danger zone */}
      <div className="p-5 bg-red-500/[0.03] border border-red-500/10 rounded-xl space-y-3 mt-6">
        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">Danger Zone</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Nếu bạn muốn xóa tài khoản vĩnh viễn, vui lòng liên hệ support@skyverses.io. Dữ liệu sẽ không thể khôi phục.
        </p>
      </div>
    </motion.div>
  );
};

// ── Billing ──
export const BillingTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="billing" {...tabAnimation} className="space-y-6">
      {/* Plan info */}
      <div className="p-6 bg-white dark:bg-white/[0.02] border border-brand-blue/20 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-lg font-bold">{logic.user?.plan || 'Free'}</h3>
              {logic.user?.plan && (
                <span className="px-2 py-0.5 bg-brand-blue text-white text-[8px] font-bold rounded">{t('settings.billing.monthly')}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-500">
              {logic.user?.planExpiresAt
                ? `${t('settings.billing.expires')} ${new Date(logic.user.planExpiresAt).toLocaleDateString('vi-VN')}`
                : 'Không có gói đăng ký'
              }
            </p>
          </div>
        </div>
        <Link to="/credits" className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-bold hover:bg-brand-blue dark:hover:bg-brand-blue hover:text-white transition-all">
          Nâng cấp
        </Link>
      </div>

      {/* Transaction history */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <HistoryIcon size={14} /> Lịch sử giao dịch
        </h4>

        {logic.creditHistoryLoading ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={18} />
            <span className="text-xs text-slate-400">Đang tải...</span>
          </div>
        ) : logic.creditHistory.length > 0 ? (
          <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {logic.creditHistory.map((tx: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'DEDUCT' || tx.type === 'USAGE'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                      <Coins size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-white">{tx.note || tx.type}</p>
                      <p className="text-[10px] text-slate-400">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'DEDUCT' || tx.type === 'USAGE' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {tx.type === 'DEDUCT' || tx.type === 'USAGE' ? '-' : '+'}{Math.abs(tx.amount || 0).toLocaleString()} CR
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <HistoryIcon size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs text-slate-400">Chưa có giao dịch nào</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Referrals ──
export const ReferralsTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralCode = logic.user?.inviteCode || '';
  const referralLink = `${window.location.origin}/login?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Đã sao chép link!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div key="referrals" {...tabAnimation} className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('settings.referrals.total_reward')}</p>
          <h4 className="text-3xl font-black text-brand-blue tracking-tight">
            {logic.referralLoading ? '—' : logic.referralStats.totalEarned} <span className="text-sm font-bold text-slate-300">CR</span>
          </h4>
        </div>
        <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('settings.referrals.friends_invited')}</p>
          <h4 className="text-3xl font-black text-purple-500 tracking-tight">
            {logic.referralLoading ? '—' : logic.referralStats.totalInvited}
          </h4>
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold mt-1">
            <UserCheck size={12} /> {t('settings.referrals.active_friends')}
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="p-5 bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/10 dark:border-brand-blue/15 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-brand-blue">{t('settings.referrals.link_label')}</p>
          <span className="text-[10px] font-mono text-brand-blue/60 bg-brand-blue/10 px-2 py-0.5 rounded">{referralCode}</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-grow bg-white dark:bg-black/40 px-4 py-3 rounded-lg border border-black/[0.04] dark:border-white/[0.06] font-mono text-xs text-slate-500 dark:text-gray-400 truncate">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className={`px-5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white hover:brightness-110 active:scale-[0.97]'}`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('settings.referrals.copied') : t('settings.referrals.copy')}
          </button>
        </div>
      </div>

      {/* Referral page link */}
      <Link to="/referral" className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl hover:border-brand-blue/20 transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Users size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Xem chi tiết chương trình Referral</p>
            <p className="text-[10px] text-slate-400">Bao gồm hoa hồng 5% coming soon</p>
          </div>
        </div>
        <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
      </Link>

      {/* History */}
      {logic.referralStats.history.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <HistoryIcon size={14} /> {t('settings.referrals.history')}
          </h4>
          <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {logic.referralStats.history.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold">
                      {f.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{f.name}</p>
                      <p className="text-[10px] text-slate-400">{f.date ? new Date(f.date).toLocaleDateString('vi-VN') : ''}</p>
                    </div>
                  </div>
                  <span className="font-bold text-brand-blue">+{f.credits} CR</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── Cloud Storage ──
export const CloudStorageTab = () => {
  const { t } = useLanguage();
  return (
    <motion.div key="cloud" {...tabAnimation} className="space-y-8">
      {/* Usage Bar */}
      <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Cloud size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{t('settings.cloud.usage')}</span>
              <span className="text-xs font-bold text-slate-400">Unlimited</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '5%' }} transition={{ duration: 1 }} className="h-full bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-0.5">Lưu trữ tự động</p>
            <p className="text-[11px] text-slate-400 dark:text-gray-500 leading-relaxed">
              Tất cả hình ảnh và video bạn tạo được lưu trữ tự động trên cloud.
              Truy cập từ mục "Thư viện" để quản lý và tải xuống bất cứ lúc nào.
            </p>
          </div>
        </div>
      </div>

      {/* Manage link */}
      <Link to="/favorites" className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl hover:border-emerald-500/20 transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Cloud size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Quản lý thư viện</p>
            <p className="text-[10px] text-slate-400">Xem, tải xuống, xóa hình ảnh & video</p>
          </div>
        </div>
        <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </Link>
    </motion.div>
  );
};
