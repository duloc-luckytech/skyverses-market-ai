
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Save, Loader2, Sparkles, Zap, Activity,
  Brain, ShieldCheck, Eye, EyeOff,
  Shield, User, Users, Copy, Check, ArrowRight,
  History as HistoryIcon, Coins, Clock,
  Moon, Sun, Globe, ExternalLink, Calendar,
  Wallet, TrendingUp, ShoppingBag, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

// ━━━━━━━━━━━━ Shared ━━━━━━━━━━━━

const tabAnimation = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: '#111118',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '8px 14px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
  labelStyle: { color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700 },
  itemStyle: { color: '#fff', fontSize: '12px', fontWeight: 600 },
};

export const InputGroup = ({ label, value, onChange, disabled, icon, placeholder }: any) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
      {icon && <span className="opacity-60">{icon}</span>}
      {label}
    </label>
    <input
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-lg text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'text-slate-800 dark:text-white'}`}
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
          className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-lg text-sm font-mono outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white pr-12"
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

const MetricCard = ({ label, val, icon, color = 'brand-blue', sub }: { label: string; val: string | number; icon: React.ReactNode; color?: string; sub?: string }) => {
  const colorMap: Record<string, string> = {
    'brand-blue': 'bg-brand-blue/10 text-brand-blue border-brand-blue/10',
    'emerald': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10',
    'amber': 'bg-amber-500/10 text-amber-500 border-amber-500/10',
    'purple': 'bg-purple-500/10 text-purple-500 border-purple-500/10',
    'gold': 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/10',
    'red': 'bg-red-500/10 text-red-500 border-red-500/10',
  };
  const cls = colorMap[color] || colorMap['brand-blue'];
  return (
    <div className="p-4 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-colors">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cls}`}>
          {icon}
        </div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{val}</p>
      {sub && <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">{sub}</p>}
    </div>
  );
};

const SectionHeading = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
    {icon} {text}
  </h4>
);

// ━━━━━━━━━━━━ TABS ━━━━━━━━━━━━

// ── Profile ──
export const ProfileTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleSave = async () => {
    await logic.handleSaveProfile();
    showToast(t('settings.profile.saved'), 'success');
  };

  const setField = (key: string, val: string) => {
    logic.setProfileFields((prev: any) => ({ ...prev, [key]: val }));
  };

  return (
    <motion.div key="profile" {...tabAnimation} className="space-y-8">
      {/* Basic Info */}
      <div>
        <SectionHeading icon={<User size={14} />} text={t('settings.profile.basic_info') || 'Basic Info'} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label={t('settings.profile.email')} value={logic.user?.email || ''} disabled />
          <InputGroup label="Invite Code" value={logic.user?.inviteCode || '—'} disabled />
          <InputGroup
            label={t('settings.profile.first_name')}
            value={logic.profileFields.firstName ?? logic.user?.firstName ?? ''}
            onChange={(e: any) => setField('firstName', e.target.value)}
            placeholder={t('settings.profile.first_name_ph')}
          />
          <InputGroup
            label={t('settings.profile.last_name')}
            value={logic.profileFields.lastName ?? logic.user?.lastName ?? ''}
            onChange={(e: any) => setField('lastName', e.target.value)}
            placeholder={t('settings.profile.last_name_ph')}
          />
          <InputGroup
            label={t('settings.profile.phone')}
            value={logic.profileFields.phone ?? logic.user?.phone ?? ''}
            onChange={(e: any) => setField('phone', e.target.value)}
            placeholder="0912 xxx xxx"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">{t('settings.profile.language')}</label>
            <select
              value={logic.lang} onChange={(e) => logic.setLang(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-lg text-sm font-medium outline-none focus:border-brand-blue transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seller Profile */}
      <div>
        <SectionHeading icon={<FileText size={14} />} text="Seller Profile" />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">Bio</label>
            <textarea
              value={logic.sellerBio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => logic.setSellerBio(e.target.value)}
              placeholder="Tell buyers about yourself..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-lg text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              label="Website" icon={<Globe size={12} />}
              value={logic.sellerSocialLinks.website}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setSellerSocialLinks({ ...logic.sellerSocialLinks, website: e.target.value })}
              placeholder="https://..."
            />
            <InputGroup
              label="Twitter / X"
              value={logic.sellerSocialLinks.twitter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setSellerSocialLinks({ ...logic.sellerSocialLinks, twitter: e.target.value })}
              placeholder="@username"
            />
            <InputGroup
              label="GitHub"
              value={logic.sellerSocialLinks.github}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setSellerSocialLinks({ ...logic.sellerSocialLinks, github: e.target.value })}
              placeholder="username"
            />
          </div>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="flex items-center justify-between p-4 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl">
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={16} className="text-purple-400" /> : <Sun size={16} className="text-amber-500" />}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('settings.profile.theme')}</p>
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
        <button onClick={handleSave} className="bg-brand-blue text-white px-6 py-3 rounded-lg text-sm font-bold hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
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
  const maxVideo = logic.user?.maxVideo || 0;
  const usedPercent = maxVideo > 0 ? Math.min(100, ((logic.user?.videoUsed || 0) / maxVideo) * 100) : 0;

  return (
    <motion.div key="compute" {...tabAnimation} className="space-y-8">
      {/* Balance Hero */}
      <div className="p-6 md:p-8 border border-black/[0.06] dark:border-white/[0.04] rounded-xl bg-black/[0.01] dark:bg-white/[0.015]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Sparkles size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t('settings.compute.balance_label')}</p>
              <h3 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {logic.credits.toLocaleString()} <span className="text-base font-bold text-slate-400 dark:text-gray-600">CR</span>
              </h3>
            </div>
          </div>
          <Link to="/credits" className="bg-brand-blue text-white px-6 py-3 rounded-lg text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2">
            {t('settings.compute.topup')} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <SectionHeading icon={<Activity size={14} />} text={t('settings.compute.stats')} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard label="Plan" val={logic.user?.plan || 'Free'} icon={<Shield size={14} />} color="purple" />
          <MetricCard
            label={t('settings.compute.video_used')}
            val={maxVideo > 0 ? `${logic.user?.videoUsed || 0} / ${maxVideo}` : `${logic.user?.videoUsed || 0}`}
            icon={<Zap size={14} />}
            color="brand-blue"
          />
          <MetricCard
            label={t('settings.compute.expires')}
            val={logic.user?.planExpiresAt ? new Date(logic.user.planExpiresAt).toLocaleDateString('vi-VN') : '—'}
            icon={<Calendar size={14} />}
            color="amber"
          />
        </div>
      </div>

      {/* Video usage bar */}
      {maxVideo > 0 && (
        <div className="p-5 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Video Quota</span>
            <span className={`text-xs font-bold ${usedPercent > 80 ? 'text-red-500' : usedPercent > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>{Math.round(usedPercent)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${usedPercent > 80 ? 'bg-gradient-to-r from-red-500 to-red-400' : usedPercent > 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-slate-400">{logic.user?.videoUsed || 0} used</span>
            <span className="text-[10px] text-slate-400">{maxVideo} total</span>
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
    showToast(t('settings.keys.saved'), 'success');
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

      <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-0.5">{t('settings.keys.byok')}</p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 leading-relaxed">{t('settings.keys.byok_desc')}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-between items-center">
        <button onClick={logic.handleResetKeys} className="text-xs font-bold text-red-500 hover:underline">{t('settings.keys.reset')}</button>
        <button onClick={handleSave} className="bg-brand-blue text-white px-6 py-3 rounded-lg text-sm font-bold hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
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
    <motion.div key="security" {...tabAnimation} className="space-y-6">
      <SectionHeading icon={<Shield size={14} />} text={t('settings.security.account_info')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: <Globe size={15} />, color: 'text-brand-blue', label: 'Login method', val: 'Google OAuth' },
          { icon: <Clock size={15} />, color: 'text-emerald-500', label: t('settings.security.join_date'), val: logic.user?.createdAt ? new Date(logic.user.createdAt).toLocaleDateString('vi-VN') : '—' },
          { icon: <Activity size={15} />, color: 'text-amber-500', label: t('settings.security.last_active'), val: logic.user?.lastActiveAt ? new Date(logic.user.lastActiveAt).toLocaleDateString('vi-VN') : t('settings.security.today') },
          { icon: <Shield size={15} />, color: 'text-purple-500', label: 'Role', val: logic.user?.role || 'user' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-black/[0.01] dark:bg-white/[0.015] rounded-xl border border-black/[0.06] dark:border-white/[0.04] hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-colors">
            <div className={`w-9 h-9 rounded-lg bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-white capitalize">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-red-500/[0.03] dark:bg-red-500/[0.05] border border-red-500/10 rounded-lg space-y-2">
        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">{t('settings.security.danger_zone')}</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('settings.security.delete_desc')}
        </p>
      </div>
    </motion.div>
  );
};

// ── Billing ──
export const BillingTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Build chart data from credit history — group by date
  const creditChartData = useMemo(() => {
    if (!logic.creditHistory || logic.creditHistory.length === 0) return [];
    const grouped = new Map<string, { earned: number; spent: number }>();
    for (const tx of logic.creditHistory) {
      const date = new Date(tx.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const entry = grouped.get(date) || { earned: 0, spent: 0 };
      const isDeduct = tx.amount < 0 || tx.type === 'CONSUME';
      if (isDeduct) entry.spent += Math.abs(tx.amount);
      else entry.earned += tx.amount;
      grouped.set(date, entry);
    }
    return Array.from(grouped.entries()).reverse().map(([date, v]) => ({ date, ...v }));
  }, [logic.creditHistory]);

  return (
    <motion.div key="billing" {...tabAnimation} className="space-y-8">
      {/* Plan card */}
      <div className="p-6 border border-black/[0.06] dark:border-white/[0.04] rounded-xl bg-black/[0.01] dark:bg-white/[0.015]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Shield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xl font-bold capitalize text-slate-900 dark:text-white">{logic.user?.plan || 'Free'}</h3>
                {logic.user?.plan && (
                  <span className="px-2 py-0.5 bg-brand-blue text-white text-[8px] font-bold rounded">{t('settings.billing.monthly')}</span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                {logic.user?.planExpiresAt
                  ? `${t('settings.billing.expires')} ${new Date(logic.user.planExpiresAt).toLocaleDateString('vi-VN')}`
                  : t('settings.compute.free_plan')
                }
              </p>
            </div>
          </div>
          <Link to="/credits" className="bg-brand-blue text-white px-6 py-3 rounded-lg text-xs font-bold hover:brightness-110 transition-all">
            {t('settings.billing.upgrade')}
          </Link>
        </div>
      </div>

      {/* Credit usage chart */}
      {creditChartData.length > 1 && (
        <div>
          <SectionHeading icon={<Activity size={14} />} text={t('settings.billing.credit_usage') || 'Credit Usage'} />
          <div className="p-5 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={creditChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme === 'dark' ? '#555' : '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#555' : '#aaa' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="earned" name="Earned" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Purchase history */}
      {logic.purchaseHistory.length > 0 && (
        <div>
          <SectionHeading icon={<Coins size={14} />} text={t('settings.billing.purchase_history')} />
          <div className="bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl overflow-hidden">
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {logic.purchaseHistory.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                      <Shield size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-white">{p.planName || p.planCode}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.purchasedAt ? new Date(p.purchasedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {p.amount?.toLocaleString()} VND
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Credit transaction history */}
      <div>
        <SectionHeading icon={<HistoryIcon size={14} />} text={t('settings.billing.credit_history')} />

        {logic.creditHistoryLoading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={18} />
            <span className="text-xs text-slate-400">{t('settings.billing.loading')}</span>
          </div>
        ) : logic.creditHistory.length > 0 ? (
          <div className="bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl overflow-hidden">
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {logic.creditHistory.map((tx: any, i: number) => {
                const isDeduct = tx.amount < 0 || tx.type === 'CONSUME';
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDeduct ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <Coins size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-white">{tx.note || tx.type}</p>
                        <p className="text-[10px] text-slate-400">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          {tx.source && tx.source !== 'system' ? ` · ${tx.source}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isDeduct ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isDeduct ? '' : '+'}{tx.amount?.toLocaleString()} CR
                      </span>
                      {tx.balanceAfter !== undefined && (
                        <p className="text-[9px] text-slate-400 font-mono">= {tx.balanceAfter?.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <HistoryIcon size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs text-slate-400">{t('settings.billing.no_transactions')}</p>
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
    showToast(t('settings.referrals.link_copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div key="referrals" {...tabAnimation} className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          label={t('settings.referrals.friends_invited')}
          val={logic.referralLoading ? '—' : logic.referralTotal}
          icon={<Users size={14} />}
          color="brand-blue"
        />
        <MetricCard
          label={t('settings.referrals.code')}
          val={referralCode || '—'}
          icon={<Copy size={14} />}
          color="purple"
        />
      </div>

      {/* Referral Link */}
      <div className="p-5 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl space-y-3">
        <p className="text-xs font-bold text-brand-blue">{t('settings.referrals.link_label')}</p>
        <div className="flex gap-2">
          <div className="flex-grow bg-slate-50 dark:bg-white/[0.03] px-4 py-3 rounded-lg border border-black/[0.06] dark:border-white/[0.06] font-mono text-xs text-slate-500 dark:text-gray-400 truncate">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className={`px-5 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white hover:brightness-110 active:scale-[0.97]'}`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('settings.referrals.copied') : t('settings.referrals.copy')}
          </button>
        </div>
      </div>

      {/* Go to referral page */}
      <Link to="/referral" className="flex items-center justify-between p-4 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <ExternalLink size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('settings.referrals.view_program')}</p>
            <p className="text-[10px] text-slate-400">{t('settings.referrals.commission_note')}</p>
          </div>
        </div>
        <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
      </Link>

      {/* Friends list */}
      <div>
        <SectionHeading icon={<Users size={14} />} text={`${t('settings.referrals.friends_list')} (${logic.referralTotal})`} />

        {logic.referralLoading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={18} />
            <span className="text-xs text-slate-400">{t('settings.referrals.loading')}</span>
          </div>
        ) : logic.referralFriends.length > 0 ? (
          <div className="bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl overflow-hidden">
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {logic.referralFriends.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    {f.avatar ? (
                      <img src={f.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold">
                        {f.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{f.name || t('settings.referrals.user')}</p>
                      <p className="text-[10px] text-slate-400">{f.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {f.plan && (
                      <span className="px-2 py-0.5 text-[8px] font-bold text-brand-blue bg-brand-blue/10 rounded uppercase">{f.plan}</span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {f.createdAt ? new Date(f.createdAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs text-slate-400">{t('settings.referrals.no_friends')}</p>
            <p className="text-[10px] text-slate-400 mt-1">{t('settings.referrals.share_to_start')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Wallet ──
export const WalletTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Build chart data from SKT history
  const sktChartData = useMemo(() => {
    if (!logic.sktHistory || logic.sktHistory.length === 0) return [];
    return logic.sktHistory.slice().reverse().map((tx: any) => ({
      date: new Date(tx.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      balance: tx.balanceAfter ?? 0,
      amount: tx.amount,
    }));
  }, [logic.sktHistory]);

  // Build earnings chart from recent sales
  const earningsChartData = useMemo(() => {
    if (!logic.sellerEarnings?.recentSales?.length) return [];
    const grouped = new Map<string, number>();
    for (const sale of logic.sellerEarnings.recentSales) {
      const date = new Date(sale.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      grouped.set(date, (grouped.get(date) || 0) + sale.sellerReceived);
    }
    return Array.from(grouped.entries()).reverse().map(([date, earned]) => ({ date, earned }));
  }, [logic.sellerEarnings?.recentSales]);

  return (
    <motion.div key="wallet" {...tabAnimation} className="space-y-8">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SKT Balance */}
        <div className="p-6 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015]">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C]">
                <Coins size={20} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">SkyToken (SKT)</p>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {logic.sktLoading ? '...' : logic.sktBalance.toLocaleString()} <span className="text-sm font-bold text-slate-400">SKT</span>
            </h3>
          </div>
        </div>

        {/* Credit Balance */}
        <div className="p-6 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015]">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Sparkles size={20} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Credits</p>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {logic.credits.toLocaleString()} <span className="text-sm font-bold text-slate-400">CR</span>
            </h3>
          </div>
        </div>
      </div>

      {/* SKT Balance Trend Chart */}
      {sktChartData.length > 1 && (
        <div>
          <SectionHeading icon={<TrendingUp size={14} />} text="SKT Balance Trend" />
          <div className="p-5 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sktChartData}>
                <defs>
                  <linearGradient id="sktGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme === 'dark' ? '#555' : '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#555' : '#aaa' }} axisLine={false} tickLine={false} width={45} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="balance" stroke="#C9A84C" strokeWidth={2} fill="url(#sktGrad)" name="Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Seller Earnings */}
      <div>
        <SectionHeading icon={<TrendingUp size={14} />} text="Seller Earnings" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MetricCard label="Total Sales" val={logic.sellerEarnings.totalSales} icon={<ShoppingBag size={14} />} color="emerald" />
          <MetricCard label="Total Earned" val={`${logic.sellerEarnings.totalEarned.toLocaleString()} SKT`} icon={<Coins size={14} />} color="gold" />
        </div>

        {/* Earnings by day chart */}
        {earningsChartData.length > 1 && (
          <div className="mt-4 p-5 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Earnings by Day</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={earningsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme === 'dark' ? '#555' : '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#555' : '#aaa' }} axisLine={false} tickLine={false} width={35} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="earned" name="Earned (SKT)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent sales */}
        {logic.sellerEarnings.recentSales.length > 0 && (
          <div className="mt-4 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Sales</p>
            </div>
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {logic.sellerEarnings.recentSales.slice(0, 10).map((sale: any) => (
                <div key={sale._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <ShoppingBag size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-white truncate">
                        {sale.promptSetId?.title?.en || 'Prompt'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {sale.buyerId?.name || 'Buyer'} · {fmtDate(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 shrink-0 ml-3">
                    +{sale.sellerReceived} SKT
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SKT Transaction History */}
      <div>
        <SectionHeading icon={<HistoryIcon size={14} />} text="SKT History" />

        {logic.sktLoading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="animate-spin text-[#C9A84C]" size={18} />
            <span className="text-xs text-slate-400">Loading...</span>
          </div>
        ) : logic.sktHistory.length > 0 ? (
          <div className="bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl overflow-hidden">
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {logic.sktHistory.map((tx: any, i: number) => {
                const isPositive = tx.amount > 0;
                return (
                  <div key={tx._id || i} className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        <Coins size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-white">{tx.note || tx.type}</p>
                        <p className="text-[10px] text-slate-400">
                          {tx.createdAt ? fmtDate(tx.createdAt) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{tx.amount?.toLocaleString()} SKT
                      </span>
                      {tx.balanceAfter !== undefined && (
                        <p className="text-[9px] text-slate-400 font-mono">= {tx.balanceAfter?.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Coins size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs text-slate-400">No SKT transactions yet</p>
          </div>
        )}
      </div>

      {/* Top-up link */}
      <Link to="/credits" className="flex items-center justify-between p-4 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-xl hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Wallet size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Top-up Credits / SKT</p>
            <p className="text-[10px] text-slate-400">Purchase more credits or SkyTokens</p>
          </div>
        </div>
        <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
      </Link>
    </motion.div>
  );
};
