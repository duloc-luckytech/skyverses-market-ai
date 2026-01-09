import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Save, Loader2, Sparkles, Zap, Activity, 
  Terminal, Cpu, Brain, Image as LucideImage, 
  ShieldCheck, Smartphone, Lock, Eye, EyeOff, Shield,
  Users, Gift, Copy, Check, ArrowUpRight, History as HistoryIcon,
  Heart, Share2, UserCheck, Coins, LayoutGrid, Clock, MoreHorizontal,
  Cloud, HardDrive, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// --- Shared Internal Components ---
export const InputGroup = ({ label, value, disabled }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">{label}</label>
    <input 
      defaultValue={value} disabled={disabled}
      className={`w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'text-slate-800 dark:text-white'}`}
    />
  </div>
);

export const KeyInputGroup = ({ label, icon, value, onChange, placeholder }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 ml-2">
         {icon}
         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
      </div>
      <div className="relative group">
         <input 
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-800 dark:text-white"
         />
         <button 
           type="button"
           onClick={() => setShow(!show)}
           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors"
         >
           {show ? <EyeOff size={16} /> : <Eye size={16} />}
         </button>
      </div>
    </div>
  );
};

export const StatBox = ({ label, val }: any) => (
  <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl">
     <p className="text-[8px] font-black uppercase text-gray-400 mb-1">{label}</p>
     <p className="text-lg font-black italic tracking-tight">{val}</p>
  </div>
);

export const SecurityOption = ({ icon, label, desc, enabled, action }: any) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between p-6 bg-white dark:bg-black border border-black/5 dark:border-white/5 rounded-2xl group hover:border-brand-blue/20 transition-all shadow-sm">
       <div className="flex items-center gap-6">
          <div className="text-slate-300 dark:text-gray-700 group-hover:text-brand-blue transition-colors">{icon}</div>
          <div className="space-y-1">
             <h4 className="text-sm font-black uppercase tracking-tight">{label}</h4>
             <p className="text-[11px] text-gray-500 font-medium">{desc}</p>
          </div>
       </div>
       {action ? (
         <button className="px-6 py-2 border border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all rounded-lg">{action}</button>
       ) : (
         <div className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-brand-blue' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`} />
         </div>
       )}
    </div>
  );
};

// --- TABS ---

export const CloudStorageTab = () => {
  const { t } = useLanguage();
  return (
    <motion.div key="cloud" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('settings.tabs.cloud')}</h2>
        <p className="text-sm text-gray-500 max-w-xl mx-auto font-medium">{t('settings.cloud.desc')}</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-[#111114] dark:bg-black/60 border border-white/5 rounded-2xl p-6 flex items-center gap-6 shadow-2xl">
           <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <Cloud size={24} />
           </div>
           <div className="flex-grow space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-gray-500">{t('settings.cloud.usage')}</span>
                 <span className="text-white">0.5GB / 5GB</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 1.5 }} className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Basic */}
        <div className="bg-white dark:bg-[#111114] border border-black/5 dark:border-white/5 p-8 rounded-3xl flex flex-col justify-between shadow-sm group hover:border-brand-blue/20 transition-all">
           <div className="space-y-6">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">{t('settings.cloud.basic.title')}</h3>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic tracking-tighter">5 GB</span>
                    <span className="text-xs font-bold text-gray-500">{t('settings.cloud.free')}</span>
                 </div>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{t('settings.cloud.basic.desc')}</p>
              <div className="h-px bg-black/5 dark:bg-white/5" />
              <ul className="space-y-4">
                 {['Cross-device sync', 'Auto backup'].map(f => (
                   <li key={f} className="flex items-center gap-3 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                      <Check size={14} className="text-emerald-500" /> {f}
                   </li>
                 ))}
              </ul>
           </div>
           <button className="w-full mt-10 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl">{t('settings.cloud.current')}</button>
        </div>

        {/* Studio */}
        <div className="bg-white dark:bg-[#111114] border-2 border-orange-500/30 p-8 rounded-3xl flex flex-col justify-between shadow-2xl relative scale-105 z-10 group transition-all">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">RECOMMENDED</div>
           <div className="space-y-6">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-orange-500 uppercase italic">{t('settings.cloud.studio.title')}</h3>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic tracking-tighter">50 GB</span>
                    <span className="text-xs font-bold text-gray-500">$9.99/mo</span>
                 </div>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{t('settings.cloud.studio.desc')}</p>
              <div className="h-px bg-black/5 dark:bg-white/5" />
              <ul className="space-y-4">
                 {['4K support', 'Priority Render'].map(f => (
                   <li key={f} className="flex items-center gap-3 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                      <Check size={14} className="text-orange-500" /> {f}
                   </li>
                 ))}
              </ul>
           </div>
           <button className="w-full mt-10 py-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">{t('settings.cloud.upgrade')}</button>
        </div>

        {/* Cinema */}
        <div className="bg-white dark:bg-[#111114] border border-brand-blue/20 p-8 rounded-3xl flex flex-col justify-between shadow-sm group hover:border-brand-blue/30 transition-all">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-blue text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">BEST VALUE</div>
           <div className="space-y-6">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-brand-blue uppercase italic">{t('settings.cloud.cinema.title')}</h3>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic tracking-tighter">100 GB</span>
                    <span className="text-xs font-bold text-gray-500">$19.99/mo</span>
                 </div>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{t('settings.cloud.cinema.desc')}</p>
              <div className="h-px bg-black/5 dark:bg-white/5" />
              <ul className="space-y-4">
                 {['RAW storage', 'Team collaboration'].map(f => (
                   <li key={f} className="flex items-center gap-3 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                      <Check size={14} className="text-brand-blue" /> {f}
                   </li>
                 ))}
              </ul>
           </div>
           <button className="w-full mt-10 py-4 bg-gradient-to-r from-cyan-500 to-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">{t('settings.cloud.upgrade')}</button>
        </div>
      </div>
    </motion.div>
  );
};

export const ProfileTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-black/5 dark:border-white/5 pb-10">
        <div className="relative group cursor-pointer">
          <img src={logic.user?.picture} className="w-24 h-24 rounded-full border-4 border-white dark:border-[#111] shadow-2xl transition-transform group-hover:scale-105" alt="Avatar" />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="text-white" size={24} />
          </div>
        </div>
        <div className="text-center sm:text-left space-y-2">
          <h3 className="text-2xl font-black tracking-tight">{logic.user?.name}</h3>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{logic.user?.email}</p>
          <div className="flex gap-2 justify-center sm:justify-start">
            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase rounded">{t('settings.profile.verified')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InputGroup label={t('settings.profile.name')} value={logic.user?.name || ''} />
        <InputGroup label={t('settings.profile.email')} value={logic.user?.email || ''} disabled />
        <InputGroup label={t('settings.profile.username')} value={logic.user?.email?.split('@')[0] || ''} />
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-2">{t('settings.profile.language')}</label>
          <select 
            value={logic.lang} onChange={(e) => logic.setLang(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 dark:border-white/5 flex justify-end">
        <button onClick={logic.handleSaveProfile} className="bg-brand-blue text-white px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
          {logic.isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
          {t('settings.profile.save')}
        </button>
      </div>
    </motion.div>
  );
};

export const ComputeTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="compute" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
      <div className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-brand-blue/10 translate-y-full group-hover:translate-y-0 transition-transform duration-1000"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-blue rounded-full flex items-center justify-center shadow-lg"><Zap size={28}/></div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 italic">{t('settings.compute.balance_label')}</p>
            <h3 className="text-4xl font-black italic tracking-tighter">{logic.credits.toLocaleString()} CREDITS</h3>
          </div>
        </div>
        <Link to="/credits" className="relative z-10 bg-brand-blue text-white px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">{t('settings.compute.topup')}</Link>
      </div>

      <div className="space-y-6">
        <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3"><Activity size={16}/> {t('settings.compute.stats')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBox label={t('settings.compute.used_month')} val="1,240 CR" />
          <StatBox label={t('settings.compute.last_tx')} val="-45 CR" />
          <StatBox label={t('settings.compute.performance')} val={t('settings.compute.optimal')} />
        </div>
      </div>
    </motion.div>
  );
};

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
    <motion.div key="referrals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
          <Users size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tight">{t('settings.tabs.referrals')}</h3>
          <p className="text-xs text-gray-500 font-medium">{t('settings.referrals.desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-8 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between h-40 group hover:border-brand-blue/30 transition-all">
           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('settings.referrals.total_reward')}</p>
           <div className="space-y-1">
             <h4 className="text-4xl font-black italic text-brand-blue">100 <span className="text-sm not-italic opacity-50">CR</span></h4>
             <div className="flex items-center gap-2 text-green-500 text-[9px] font-black uppercase">
                <ArrowUpRight size={12}/> +15%
             </div>
           </div>
        </div>
        <div className="p-8 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between h-40 group hover:border-purple-500/30 transition-all">
           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('settings.referrals.friends_invited')}</p>
           <div className="space-y-1">
             <h4 className="text-4xl font-black italic text-purple-500">02</h4>
             <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase">
                <UserCheck size={12}/> {t('settings.referrals.active_friends')}
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-4 p-8 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl">
        <label className="text-[10px] font-black uppercase text-brand-blue tracking-widest ml-2 italic">{t('settings.referrals.link_label')}</label>
        <div className="flex gap-2">
           <div className="flex-grow bg-white dark:bg-black p-4 rounded-xl border border-black/5 dark:border-white/10 font-mono text-xs text-slate-500 dark:text-gray-400 truncate shadow-inner">
              {referralLink}
           </div>
           <button 
             onClick={handleCopy}
             className={`px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-lg ${copied ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white hover:scale-105 active:scale-95'}`}
           >
              {copied ? <Check size={14}/> : <Copy size={14}/>}
              {copied ? t('settings.referrals.copied') : t('settings.referrals.copy')}
           </button>
        </div>
      </div>

      <div className="space-y-6">
         <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
            <HistoryIcon size={16}/> {t('settings.referrals.history')}
         </h4>
         
         <div className="bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                     <th className="px-6 py-4">{t('settings.referrals.table.friend')}</th>
                     <th className="px-6 py-4">{t('settings.referrals.table.date')}</th>
                     <th className="px-6 py-4">{t('settings.referrals.table.status')}</th>
                     <th className="px-6 py-4 text-right">{t('settings.referrals.table.reward')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {mockFriends.map((f, i) => (
                    <tr key={i} className="text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       <td className="px-6 py-5">
                          <div className="space-y-0.5">
                             <p className="text-slate-800 dark:text-white uppercase tracking-tight">{f.name}</p>
                             <p className="text-[9px] text-gray-500 font-medium lowercase tracking-widest">{f.email}</p>
                          </div>
                       </td>
                       <td className="px-6 py-5 text-gray-500 font-medium italic">{f.date}</td>
                       <td className="px-6 py-5">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded">
                             {f.status}
                          </span>
                       </td>
                       <td className="px-6 py-5 text-right text-brand-blue font-black italic">{f.reward}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
};

export const ModelKeysTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="keys" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
            <Terminal size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tight">{t('settings.keys.title')}</h3>
            <p className="text-xs text-gray-500 font-medium">{t('settings.keys.desc')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <KeyInputGroup 
          label="Google Gemini Key" 
          icon={<Sparkles size={16} className="text-purple-500" />}
          value={logic.modelKeys.gemini}
          onChange={(val: string) => logic.setModelKeys({...logic.modelKeys, gemini: val})}
          placeholder={t('settings.keys.placeholder')}
        />
        <KeyInputGroup 
          label="OpenAI Key" 
          icon={<Brain size={16} className="text-emerald-500" />}
          value={logic.modelKeys.openai}
          onChange={(val: string) => logic.setModelKeys({...logic.modelKeys, openai: val})}
          placeholder={t('settings.keys.placeholder')}
        />
      </div>

      <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl flex gap-6 items-start">
        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest">{t('settings.keys.byok')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-600 leading-relaxed font-medium">
            {t('settings.keys.byok_desc')}
          </p>
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
        <button 
          onClick={logic.handleResetKeys}
          className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
        >
          {t('settings.keys.reset')}
        </button>
        <button 
          onClick={logic.handleSaveKeys} 
          className="bg-brand-blue text-white px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {logic.isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
          {t('settings.keys.save')}
        </button>
      </div>
    </motion.div>
  );
};

export const SecurityTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase italic tracking-tight">{t('settings.security.title')}</h3>
        <div className="space-y-4">
          <SecurityOption 
            icon={<Smartphone/>} 
            label={t('settings.security.2fa')} 
            desc={t('settings.security.2fa_desc')} 
            enabled={true} 
          />
          <SecurityOption 
            icon={<Lock/>} 
            label={t('settings.security.password')} 
            desc={t('settings.security.password_desc')} 
            action={t('settings.security.change')}
          />
        </div>
      </div>
    </motion.div>
  );
};

export const BillingTab = ({ logic }: any) => {
  const { t } = useLanguage();
  return (
    <motion.div key="billing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('settings.billing.title')}</label>
        <div className="p-8 border-2 border-brand-blue bg-brand-blue/5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Shield size={120} /></div>
          <div className="space-y-2 relative z-10 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Creator Studio</h3>
              <span className="px-2 py-0.5 bg-brand-blue text-white text-[9px] font-black uppercase rounded-sm">{t('settings.billing.monthly')}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium italic">{t('settings.billing.expires')} 15/06/2025</p>
          </div>
          <button className="relative z-10 bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">{t('settings.billing.renew')}</button>
        </div>
      </div>
    </motion.div>
  );
};
