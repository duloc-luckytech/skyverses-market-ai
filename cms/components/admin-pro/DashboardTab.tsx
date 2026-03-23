import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, Zap, TrendingUp, 
  DollarSign, Activity, Globe, ShieldCheck, 
  Cpu, Flame, CheckCircle2, AlertTriangle, 
  PlaySquare, Palette, Clock, ArrowRight, Video
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, trend, color }) => (
  <div className="bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-5 hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '500/[0.06]')} ${color.replace('bg-', 'text-')}`}>
           {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
        </div>
        <div>
          <p className="text-[12px] font-medium text-slate-500 dark:text-gray-400">{label}</p>
          <h3 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
         <TrendingUp size={12} /> {trend}
      </div>
    </div>
    <p className="text-[11px] text-slate-400 border-t border-black/[0.04] dark:border-white/[0.04] pt-3">{subValue}</p>
  </div>
);

const RECENT_ACTIVITIES = [
  { id: 1, type: 'purchase', text: 'Alex.H just bought "Pro Studio Pack"', time: '2m ago', icon: <DollarSign />, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 2, type: 'generation', text: 'Luma Dream Machine generated a video', time: '5m ago', icon: <PlaySquare />, color: 'text-brand-blue bg-brand-blue/10' },
  { id: 3, type: 'signup', text: 'New user registration: M.Kowalski', time: '12m ago', icon: <Users />, color: 'text-purple-500 bg-purple-500/10' },
  { id: 4, type: 'alert', text: 'Flux 1.1 Pro queue latency spike (1.2s)', time: '28m ago', icon: <AlertTriangle />, color: 'text-rose-500 bg-rose-500/10' },
  { id: 5, type: 'generation', text: 'Midjourney v6.1 rendered 4 concepts', time: '41m ago', icon: <Palette />, color: 'text-orange-500 bg-orange-500/10' },
];

const TOP_MODELS = [
  { name: 'Flux 1.1 Pro', provider: 'Black Forest', usage: 45, calls: '14.2K' },
  { name: 'Luma Dream Machine', provider: 'Luma AI', usage: 28, calls: '8.4K' },
  { name: 'Midjourney v6.1', provider: 'Midjourney', usage: 15, calls: '6.1K' },
  { name: 'Kling AI 1.5', provider: 'Kuaishou', usage: 8, calls: '3.2K' },
  { name: 'Runway Gen-3', provider: 'Runway', usage: 4, calls: '1.5K' },
];

const CHART_DATA = [20, 35, 25, 60, 45, 80, 65];

export const DashboardTab: React.FC = () => {
  const [activities, setActivities] = useState(RECENT_ACTIVITIES);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAct = {
        id: Date.now(),
        type: 'generation',
        text: 'Nodeworker executed synthesis cluster',
        time: 'Just now',
        icon: <Activity />,
        color: 'text-brand-blue bg-brand-blue/10'
      };
      setActivities(prev => [newAct, ...prev].slice(0, 5));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* SECTION: CTA BANNER (Like MarketsPage) */}
      <div className="col-span-full mb-2">
        <div className="relative bg-gradient-to-r from-brand-blue/[0.06] to-purple-500/[0.06] border border-brand-blue/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-blue/[0.08] rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
               <ShieldCheck size={24} />
            </div>
            <div>
               <h4 className="text-[15px] font-bold text-slate-700 dark:text-white">Tổng quan hệ thống Skyverses</h4>
               <p className="text-[12px] text-slate-400 dark:text-gray-500 mt-0.5">Theo dõi luồng doanh thu, token và trạng thái Neural Cluster</p>
            </div>
          </div>
          <button className="relative z-10 shrink-0 flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
            Xem báo cáo chi tiết <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* SECTION: PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          label="Tổng doanh thu" value="$142.8K" subValue="Doanh thu thực nhận (GTV)"
          trend="+12.4%" icon={<DollarSign />} color="text-brand-blue"
        />
        <StatCard 
          label="Credits lưu hành" value="2.4M" subValue="Lưu lượng Credits lưu thông"
          trend="+8.2%" icon={<Zap />} color="text-orange-500"
        />
        <StatCard 
          label="Người dùng tích cực" value="12,840" subValue="Định danh node hoạt động"
          trend="+24.1%" icon={<Users />} color="text-purple-500"
        />
        <StatCard 
          label="Chi trả hoa hồng" value="$18.2K" subValue="Chi trả Referral / Affiliate"
          trend="+15.0%" icon={<TrendingUp />} color="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04] flex justify-between items-center">
             <div className="flex items-center gap-2">
               <BarChart3 size={16} className="text-slate-400" />
               <h3 className="text-[14px] font-bold text-slate-700 dark:text-gray-100">Biểu đồ doanh thu 7 ngày</h3>
             </div>
             <div className="flex items-center gap-2 text-[12px] font-bold text-slate-900 dark:text-white">
               <span>$24.2K</span>
               <span className="text-emerald-500 text-[10px] font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">+15%</span>
             </div>
          </div>
          
          <div className="p-6 h-[240px] flex items-end gap-2 lg:gap-4 w-full bg-slate-50/50 dark:bg-black/10">
            {CHART_DATA.map((val, i) => (
              <div key={i} className="relative flex-grow flex flex-col justify-end h-full group/bar cursor-pointer">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 1, type: "spring", delay: i * 0.1 }}
                  className="w-full bg-brand-blue/[0.05] dark:bg-brand-blue/[0.02] rounded-t-xl hover:bg-brand-blue/10 border border-transparent transition-colors relative flex items-end justify-center"
                >
                  <div 
                    className="w-full bg-brand-blue rounded-xl rounded-b-none origin-bottom transition-all duration-300 shadow-[0_-5px_15px_rgba(0,144,255,0.15)]"
                    style={{ height: `${val + 10}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">
                    Ngày {i + 1}: ${(val * 120).toLocaleString()}
                  </div>
                </motion.div>
                <span className="text-center text-[10px] font-medium text-slate-400 mt-3 hidden sm:block">Thứ {((i + 2) % 7) + 2}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP MODELS */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <h3 className="text-[14px] font-bold text-slate-700 dark:text-gray-100">Trending Inference</h3>
          </div>

          <div className="p-5 flex-1 space-y-5 flex flex-col justify-center">
            {TOP_MODELS.map((m, i) => (
              <div key={m.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">#{i + 1}</span>
                    <span className="text-[12px] font-semibold text-slate-700 dark:text-white truncate">{m.name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-brand-blue shrink-0">{m.calls} reqs</span>
                </div>
                <div className="h-[4px] w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${m.usage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${i === 0 ? 'bg-orange-500' : 'bg-brand-blue'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT ACTIVITY */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <h3 className="text-[14px] font-bold text-slate-700 dark:text-gray-100">Live Activity</h3>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-5 space-y-1">
            <AnimatePresence initial={false}>
              {activities.map((act) => (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  className="py-3 flex items-start gap-3 border-b border-black/[0.02] dark:border-white/[0.02] last:border-0"
                >
                  <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${act.color}`}>
                    {React.cloneElement(act.icon as React.ReactElement<any>, { size: 14 })}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[12px] font-medium text-slate-700 dark:text-white truncate">{act.text}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{act.time}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* NEURAL CLUSTER */}
        <div className="lg:col-span-2 bg-[#050505] dark:bg-[#0a0a0c] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-[0_0_30px_rgba(0,144,255,0.02)] relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-transparent opacity-50"></div>
            
            <div className="p-5 border-b border-white/5 flex justify-between items-center relative z-10">
               <div className="flex items-center gap-2">
                 <Cpu size={16} className="text-brand-blue" />
                 <h3 className="text-[14px] font-bold text-white">Neural Cluster Load</h3>
               </div>
               <div className="px-2 py-0.5 bg-brand-blue/10 border border-brand-blue/20 rounded text-[9px] font-bold text-brand-blue flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                 SYNCED
               </div>
            </div>

            <div className="p-6 lg:p-8 flex-1 flex flex-col justify-center relative z-10">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {[
                   { l: 'Uplink Latency', v: '12.4ms', status: 'Optimal' },
                   { l: 'Synthesis', v: '842 fps', status: 'Stable' },
                   { l: 'Queue Density', v: '0.04%', status: 'Clear' }
                 ].map(stat => (
                   <div key={stat.l} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                         <div className="h-full bg-brand-blue w-2/3 max-w-full relative">
                            <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/40 blur-[2px] -translate-x-full animate-[shimmer_2s_infinite]"></div>
                         </div>
                      </div>
                      <p className="text-[11px] font-medium text-gray-400 mb-1">{stat.l}</p>
                      <p className="text-[20px] font-bold text-white tracking-tight leading-none mb-2">{stat.v}</p>
                      <p className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                         <CheckCircle2 size={10} /> {stat.status}
                      </p>
                   </div>
                 ))}
               </div>

               <div className="mt-8 flex items-center justify-between p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-xl">
                 <div className="flex items-center gap-3">
                   <ShieldCheck size={20} className="text-brand-blue" />
                   <div>
                     <p className="text-[12px] font-bold text-white">Security Manifest</p>
                     <p className="text-[11px] text-brand-blue/70">System v4.5 is fully synchronized across all nodes.</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="absolute -bottom-20 -right-10 opacity-[0.05] pointer-events-none">
               <Globe size={300} />
            </div>
         </div>
      </div>
    </div>
  );
};
