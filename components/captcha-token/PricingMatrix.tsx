
import React from 'react';
import { Coins, Zap } from 'lucide-react';

const plans = [
  { name: 'Starter Node', tokens: '1,000', latency: '242ms', price: 500, popular: false },
  { name: 'Pro Cluster', tokens: '5,000', latency: '180ms', price: 2000, popular: true },
  { name: 'Elite Backbone', tokens: '25,000', latency: '120ms', price: 8000, popular: false },
];

export const PricingMatrix: React.FC = () => {
  return (
    <section className="mt-32 border-t border-black/5 dark:border-white/5 pt-20">
       <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none">Scalable <span className="text-indigo-600">Tokens.</span></h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.5em] italic leading-none">Architecture-first dynamic pricing model</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map(plan => (
            <div key={plan.name} className={`p-12 bg-white dark:bg-[#0d0d0f] border-2 rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 group relative overflow-hidden shadow-sm ${plan.popular ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-black/5 dark:border-white/5 opacity-80 hover:opacity-100 hover:border-black/10'}`}>
               {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-8 py-2 text-[8px] font-black uppercase tracking-widest rounded-bl-2xl shadow-xl italic">RECOMMENDED_NODE</div>
               )}
               <div className="space-y-10 text-left">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] italic leading-none">Plan_Protocol</p>
                     <h4 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{plan.name}</h4>
                  </div>
                  <div className="py-6 border-y border-black/5 dark:border-white/5 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Token Capacity</span>
                        <span className="text-xl font-black italic text-indigo-600">{plan.tokens}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Latency Target</span>
                        <span className="text-sm font-black italic text-emerald-500">{plan.latency}</span>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-center justify-center gap-3 text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">
                        <Coins size={28} className="text-yellow-500" /> {plan.price}
                     </div>
                     <button className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-[0.95] ${plan.popular ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-100 dark:bg-white/5 text-gray-500 border border-black/5 dark:border-white/10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'}`}>
                        Deploy_Infrastructure
                     </button>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </section>
  );
};
