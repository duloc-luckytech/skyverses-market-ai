
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, Zap, TrendingUp, 
  ArrowUpRight, DollarSign, Activity, 
  Globe, ShieldCheck, Cpu
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
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-10 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative"
  >
    <div className="absolute top-0 right-0 p-10 opacity-[0.02] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-[3s]">
       {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 200 })}
    </div>
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${color} bg-opacity-10 text-opacity-100`}>
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 28, className: color.replace('bg-', 'text-') })}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
         <ArrowUpRight size={12} /> {trend}
      </div>
    </div>

    <div className="space-y-2 relative z-10">
      <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.3em] italic">{label}</p>
      <div className="flex items-baseline gap-3">
        <h3 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{value}</h3>
      </div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2 border-t border-black/5 dark:border-white/5">{subValue}</p>
    </div>
  </motion.div>
);

export const DashboardTab: React.FC = () => {
  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700">
      {/* SECTION: PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard 
          label="Tổng doanh số"
          value="$142.8K"
          subValue="Doanh thu thực nhận (GTV)"
          trend="+12.4%"
          icon={<DollarSign />}
          color="bg-brand-blue"
        />
        <StatCard 
          label="Tổng Credits"
          value="2.4M"
          subValue="Lưu lượng Credits lưu thông"
          trend="+8.2%"
          icon={<Zap />}
          color="bg-orange-500"
        />
        <StatCard 
          label="Tổng Users"
          value="12,840"
          subValue="Định danh node hoạt động"
          trend="+24.1%"
          icon={<Users />}
          color="bg-purple-500"
        />
        <StatCard 
          label="Tổng Hoa Hồng"
          value="$18.2K"
          subValue="Chi trả Referral / Affiliate"
          trend="+15.0%"
          icon={<TrendingUp />}
          color="bg-emerald-500"
        />
      </div>

      {/* SECTION: SYSTEM STATUS HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 p-10 bg-black dark:bg-black/40 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
               <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Neural Cluster Load</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">H100 Node Distribution Metrics</p>
               </div>
               <Activity size={24} className="text-brand-blue animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4 relative z-10">
               {[
                 { l: 'Uplink Latency', v: '12.4ms', status: 'Optimal' },
                 { l: 'Synthesis Throughput', v: '842 fps', status: 'Stable' },
                 { l: 'Queue Density', v: '0.04%', status: 'Clear' }
               ].map(stat => (
                 <div key={stat.l} className="space-y-4">
                    <div className="h-1 w-12 bg-brand-blue/40"></div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.l}</p>
                       <p className="text-3xl font-black text-white italic tracking-tighter">{stat.v}</p>
                       <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{stat.status}</p>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
               <Cpu size={280} />
            </div>
         </div>

         <div className="p-10 bg-brand-blue text-white rounded-[2.5rem] space-y-8 shadow-2xl shadow-brand-blue/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-[2s]"></div>
            <div className="relative z-10 space-y-6">
               <ShieldCheck size={48} className="animate-pulse" />
               <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Security Manifest</h3>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">System Core v4.5 is fully synchronized.</p>
               </div>
            </div>
            <div className="pt-10 relative z-10">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40">LAST AUDIT</p>
                     <p className="text-lg font-black italic">0.42s AGO</p>
                  </div>
                  <Globe size={32} className="opacity-20" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
