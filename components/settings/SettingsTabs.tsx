import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Save, Loader2, Sparkles, Zap, Activity, 
  Terminal, Brain, 
  ShieldCheck, Smartphone, Lock, Eye, EyeOff, Shield,
  Users, Copy, Check, ArrowUpRight, History as HistoryIcon,
  UserCheck, Cloud,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// ━━━━━━━━━━━━ Shared Components ━━━━━━━━━━━━

export const InputGroup = ({ label, value, disabled, icon }: any) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
      {icon && <span className="opacity-60">{icon}</span>}
      {label}
    </label>
    <input 
      defaultValue={value} disabled={disabled}
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

export const StatBox = ({ label, val, icon, color = 'text-brand-blue' }: any) => (
  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className={`${color} opacity-60`}>{icon}</span>}
      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-xl font-black tracking-tight">{val}</p>
  </div>
);

export const SecurityOption = ({ icon, label, desc, enabled, action }: any) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl hover:border-brand-blue/20 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-slate-400 dark:text-gray-500 group-hover:text-brand-blue transition-colors">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{label}</h4>
          <p className="text-xs text-slate-400 dark:text-gray-500">{desc}</p>
        </div>
      </div>
      {action ? (
        <button className="px-4 py-2 text-xs font-bold text-brand-blue border border-brand-blue/20 rounded-lg hover:bg-brand-blue/5 transition-all">{action}</button>
      ) : (
        <button className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
        </button>
      )}
    </div>
  );
};

// ━━━━━━━━━━━━ TABS ━━━━━━━━━━━━

const tabAnimation = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

// ── Profile ──
export const ProfileTab = ({ logic }: any) => {
  const { t } = useLanguage();
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-md border border-emerald-500/15">
            <Check size={10} strokeWidth={3} /> {t('settings.profile.verified')}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label={t('settings.profile.name')} value={logic.user?.name || ''} />
        <InputGroup label={t('settings.profile.email')} value={logic.user?.email || ''} disabled />
        <InputGroup label={t('settings.profile.username')} value={logic.user?.email?.split('@')[0] || ''} />
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">{t('settings.profile.language')}</label>
          <select 
            value={logic.lang} onChange={(e) => logic.setLang(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-end">
        <button onClick={logic.handleSaveProfile} className="bg-brand-blue text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-brand-blue/15 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
          {logic.isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
          {t('settings.profile.save')}
        </button>
      </div>
    </motion.div>
  );
};

// ── Compute ──
export const ComputeTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="compute" {...tabAnimation} className="space-y-8">
      {/* Balance Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#0f1015] dark:to-[#12141a] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
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

      {/* Stats */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={14} /> {t('settings.compute.stats')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label={t('settings.compute.used_month')} val="1,240 CR" icon={<Zap size={14} />} />
          <StatBox label={t('settings.compute.last_tx')} val="-45 CR" icon={<Activity size={14} />} color="text-amber-500" />
          <StatBox label={t('settings.compute.performance')} val={t('settings.compute.optimal')} icon={<Check size={14} />} color="text-emerald-500" />
        </div>
      </div>
    </motion.div>
  );
};

// ── Model Keys ──
export const ModelKeysTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="keys" {...tabAnimation} className="space-y-8">
      <div className="space-y-5">
        <KeyInputGroup 
          label="Google Gemini Key" 
          icon={<Sparkles size={14} className="text-purple-500" />}
          value={logic.modelKeys.gemini}
          onChange={(val: string) => logic.setModelKeys({...logic.modelKeys, gemini: val})}
          placeholder={t('settings.keys.placeholder')}
        />
        <KeyInputGroup 
          label="OpenAI Key" 
          icon={<Brain size={14} className="text-emerald-500" />}
          value={logic.modelKeys.openai}
          onChange={(val: string) => logic.setModelKeys({...logic.modelKeys, openai: val})}
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

      {/* Actions */}
      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-between items-center">
        <button onClick={logic.handleResetKeys} className="text-xs font-bold text-red-500 hover:underline">{t('settings.keys.reset')}</button>
        <button onClick={logic.handleSaveKeys} className="bg-brand-blue text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-brand-blue/15 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
          {logic.isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
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
      <SecurityOption 
        icon={<Smartphone />} 
        label={t('settings.security.2fa')} 
        desc={t('settings.security.2fa_desc')} 
        enabled={true} 
      />
      <SecurityOption 
        icon={<Lock />} 
        label={t('settings.security.password')} 
        desc={t('settings.security.password_desc')} 
        action={t('settings.security.change')}
      />
    </motion.div>
  );
};

// ── Billing ──
export const BillingTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="billing" {...tabAnimation} className="space-y-6">
      <div className="p-6 bg-white dark:bg-white/[0.02] border border-brand-blue/20 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-lg font-bold">Creator Studio</h3>
              <span className="px-2 py-0.5 bg-brand-blue text-white text-[8px] font-bold rounded">{t('settings.billing.monthly')}</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-500">{t('settings.billing.expires')} 15/06/2025</p>
          </div>
        </div>
        <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-bold hover:bg-brand-blue dark:hover:bg-brand-blue hover:text-white transition-all">
          {t('settings.billing.renew')}
        </button>
      </div>
    </motion.div>
  );
};

// ── Referrals ──
export const ReferralsTab = ({ logic }: any) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const referralLink = `https://market.skyverses.io/register?ref=${logic.user?._id?.slice(0, 8) || 'CREATIVE'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mockFriends = [
    { name: 'Hoàng Anh', email: 'hoang***@studio.com', date: '12/05/2025', reward: '+50 CR', status: 'Hoạt động' },
    { name: 'Minh Tuấn', email: 'tuan***@media.vn', date: '10/05/2025', reward: '+50 CR', status: 'Hoạt động' },
  ];

  return (
    <motion.div key="referrals" {...tabAnimation} className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('settings.referrals.total_reward')}</p>
          <h4 className="text-3xl font-black text-brand-blue tracking-tight">100 <span className="text-sm font-bold text-slate-300">CR</span></h4>
          <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold mt-1">
            <ArrowUpRight size={12}/> +15%
          </div>
        </div>
        <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('settings.referrals.friends_invited')}</p>
          <h4 className="text-3xl font-black text-purple-500 tracking-tight">02</h4>
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold mt-1">
            <UserCheck size={12}/> {t('settings.referrals.active_friends')}
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="p-5 bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/10 dark:border-brand-blue/15 rounded-xl space-y-3">
        <p className="text-xs font-bold text-brand-blue">{t('settings.referrals.link_label')}</p>
        <div className="flex gap-2">
          <div className="flex-grow bg-white dark:bg-black/40 px-4 py-3 rounded-lg border border-black/[0.04] dark:border-white/[0.06] font-mono text-xs text-slate-500 dark:text-gray-400 truncate">
            {referralLink}
          </div>
          <button 
            onClick={handleCopy}
            className={`px-5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              copied ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white hover:brightness-110 active:scale-[0.97]'
            }`}
          >
            {copied ? <Check size={14}/> : <Copy size={14}/>}
            {copied ? t('settings.referrals.copied') : t('settings.referrals.copy')}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <HistoryIcon size={14}/> {t('settings.referrals.history')}
        </h4>
        <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('settings.referrals.table.friend')}</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">{t('settings.referrals.table.date')}</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('settings.referrals.table.status')}</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">{t('settings.referrals.table.reward')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {mockFriends.map((f, i) => (
                <tr key={i} className="text-xs hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 dark:text-white">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{f.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">{f.date}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-md">
                      <Check size={10} strokeWidth={3} /> {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-brand-blue">{f.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
              <span className="text-xs font-bold text-slate-400">0.5 GB / 5 GB</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 1 }} className="h-full bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Basic */}
        <div className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{t('settings.cloud.basic.title')}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight">5 GB</span>
              <span className="text-xs font-bold text-slate-400">{t('settings.cloud.free')}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4 flex-grow">{t('settings.cloud.basic.desc')}</p>
          <div className="space-y-2 mb-4">
            {['Cross-device sync', 'Auto backup'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <Check size={12} className="text-emerald-500" /> {f}
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 text-xs font-bold rounded-lg cursor-default">{t('settings.cloud.current')}</button>
        </div>

        {/* Studio */}
        <div className="p-5 bg-white dark:bg-white/[0.02] border-2 border-amber-500/30 rounded-xl flex flex-col relative">
          <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-amber-500 text-white text-[8px] font-bold uppercase tracking-wider rounded-md shadow-sm">Recommended</div>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-amber-500 mb-1">{t('settings.cloud.studio.title')}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight">50 GB</span>
              <span className="text-xs font-bold text-slate-400">$9.99/mo</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4 flex-grow">{t('settings.cloud.studio.desc')}</p>
          <div className="space-y-2 mb-4">
            {['4K support', 'Priority Render'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <Check size={12} className="text-amber-500" /> {f}
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:brightness-110 active:scale-[0.97] transition-all shadow-sm">{t('settings.cloud.upgrade')}</button>
        </div>

        {/* Cinema */}
        <div className="p-5 bg-white dark:bg-white/[0.02] border border-brand-blue/20 rounded-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-brand-blue mb-1">{t('settings.cloud.cinema.title')}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight">100 GB</span>
              <span className="text-xs font-bold text-slate-400">$19.99/mo</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4 flex-grow">{t('settings.cloud.cinema.desc')}</p>
          <div className="space-y-2 mb-4">
            {['RAW storage', 'Team collaboration'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <Check size={12} className="text-brand-blue" /> {f}
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-brand-blue text-white text-xs font-bold rounded-lg hover:brightness-110 active:scale-[0.97] transition-all shadow-sm">{t('settings.cloud.upgrade')}</button>
        </div>
      </div>
    </motion.div>
  );
};
