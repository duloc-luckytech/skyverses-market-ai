
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers, Zap, Workflow, Activity, Bot, Server, ShieldCheck, Code2, ShieldAlert } from 'lucide-react';
import { AppNode } from '../../hooks/useAppsPage';

interface AppCardProps {
  app: AppNode;
}

const getIcon = (id: string, color: string) => {
  const icons: any = {
    a1: <Sparkles size={20} />,
    a2: <Layers size={20} />,
    a3: <Zap size={20} />,
    a4: <Workflow size={20} />,
    a5: <Activity size={20} />,
    a6: <Bot size={20} />,
    'a-captcha': <ShieldAlert size={20} />,
    a7: <Server size={20} />,
    a8: <ShieldCheck size={20} />,
    a9: <Code2 size={20} />
  };
  return React.cloneElement(icons[id] || <Zap size={20}/>, { className: color });
};

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (app.slug) {
      navigate(`/product/${app.slug}`);
    } else {
      // Logic mặc định cho các app chưa có trang riêng
      console.log(`Initializing node: ${app.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-sm hover:shadow-2xl hover:border-brand-blue/30 transition-all duration-500 overflow-hidden cursor-pointer"
      onClick={handleAction}
    >
      <div className={`absolute -top-10 -right-10 opacity-[0.02] dark:opacity-[0.05] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-[3s] ${app.color}`}>
         {React.cloneElement(getIcon(app.id, app.color), { size: 200 })}
      </div>

      <div className="flex justify-between items-start relative z-10">
         <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
            {getIcon(app.id, app.color)}
         </div>
         <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
           app.status === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
           app.status === 'BETA' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
           'bg-slate-500/10 text-slate-500 border-slate-500/20'
         }`}>
            {app.status}
         </div>
      </div>

      <div className="space-y-3 relative z-10">
         <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none group-hover:text-brand-blue transition-colors">{app.name}</h3>
         <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">"{app.desc}"</p>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/5 dark:border-white/5 relative z-10">
         <div className="space-y-1">
            <p className="text-[7px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Latency</p>
            <p className="text-[11px] font-black italic text-slate-700 dark:text-white">{app.stats.latency}</p>
         </div>
         <div className="space-y-1">
            <p className="text-[7px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Version</p>
            <p className="text-[11px] font-black italic text-slate-700 dark:text-white">{app.stats.version}</p>
         </div>
         <div className="space-y-1">
            <p className="text-[7px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Deploy</p>
            <p className="text-[11px] font-black italic text-slate-700 dark:text-white">{app.stats.users}</p>
         </div>
      </div>

      <div className="pt-6 relative z-10">
         <button 
           onClick={(e) => { e.stopPropagation(); handleAction(); }}
           className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-blue dark:hover:bg-brand-blue hover:text-white transition-all shadow-xl active:scale-95"
         >
            Initialize Node <ArrowRight size={14} />
         </button>
      </div>
    </motion.div>
  );
};
