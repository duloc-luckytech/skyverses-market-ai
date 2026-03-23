import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Workflow, Activity, Bot, Server, ShieldCheck, Code2, ShieldAlert, ExternalLink } from 'lucide-react';
import { AppNode } from '../../hooks/useAppsPage';

const getIcon = (id: string) => {
  const icons: any = {
    a1: <Sparkles size={22} />,
    a2: <Code2 size={22} />,
    a3: <Zap size={22} />,
    a4: <Workflow size={22} />,
    a5: <Activity size={22} />,
    a6: <Bot size={22} />,
    'a-captcha': <ShieldAlert size={22} />,
    a7: <Server size={22} />,
    a8: <ShieldCheck size={22} />,
    a9: <Code2 size={22} />
  };
  return icons[id] || <Zap size={22} />;
};

interface AppCardProps {
  app: AppNode;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (app.slug) {
      navigate(`/product/${app.slug}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative bg-white dark:bg-[#0c0c10] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl overflow-hidden hover:border-brand-blue/30 hover:shadow-xl transition-all duration-500 cursor-pointer"
      onClick={handleAction}
    >
      <div className="p-6 md:p-7">
        {/* Top Row: Icon + Status */}
        <div className="flex justify-between items-start mb-5">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/10 to-purple-500/10 dark:from-brand-blue/15 dark:to-purple-500/15 ${app.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {getIcon(app.id)}
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider ${
            app.status === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15' :
            app.status === 'BETA' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' :
            'bg-slate-100 dark:bg-white/5 text-slate-400 border border-black/[0.04] dark:border-white/[0.04]'
          }`}>
            {app.status === 'OPERATIONAL' ? '● Live' : app.status}
          </span>
        </div>

        {/* Name & Desc */}
        <div className="mb-5">
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-2 group-hover:text-brand-blue transition-colors">{app.name}</h3>
          <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{app.desc}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 py-4 border-t border-black/[0.04] dark:border-white/[0.04] mb-5">
          {[
            { label: 'Latency', value: app.stats.latency },
            { label: 'Version', value: app.stats.version },
            { label: 'Deploy', value: app.stats.users },
          ].map((stat) => (
            <div key={stat.label} className="flex-1">
              <p className="text-[8px] font-bold text-slate-300 dark:text-gray-600 uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className="text-xs font-bold text-slate-700 dark:text-gray-300">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleAction(); }}
          className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-blue dark:hover:bg-brand-blue hover:text-white transition-all active:scale-[0.97]"
        >
          Sử dụng <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};