
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Ban, Terminal, Lock, 
  AlertTriangle, Scale, Sparkles, 
  Copyright, Server, UserX, RefreshCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PolicyCard = ({ number, title, icon, content, isAlert = false }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`p-8 border rounded-[2rem] space-y-6 transition-all shadow-sm ${
      isAlert 
      ? 'border-red-500/20 bg-red-50 dark:bg-[#150a0a]' 
      : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f1115]'
    }`}
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${isAlert ? 'bg-red-500/20 text-red-500' : 'bg-brand-blue/10 text-brand-blue'}`}>
        {icon}
      </div>
      <span className="text-4xl font-black italic opacity-5 text-slate-900 dark:text-white">{number}</span>
    </div>
    <div className="space-y-3">
      <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white tracking-tight">
        <span className={`${isAlert ? 'text-red-500' : 'text-brand-blue'} mr-2`}>{number}.</span> {title}
      </h3>
      <div className="text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
        {typeof content === 'string' ? content : (
          <ul className="space-y-2">
            {content.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <span className="opacity-50">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </motion.div>
);

const PolicyPage = () => {
  const { t } = useLanguage();
  return (
    <div className="pt-32 pb-40 min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500 relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/5 rounded-full blur-[150px]"></div>
         <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-24">
        
        {/* Header Section */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-brand-blue/10 border border-brand-blue/20 rounded-full flex items-center justify-center mx-auto text-brand-blue shadow-[0_0_50px_rgba(0,144,255,0.2)]"
          >
            <Scale size={40} />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">
              {t('policy.title')}
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-lg lg:text-xl font-medium max-w-3xl mx-auto leading-relaxed italic">
              {t('policy.subtitle')}
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PolicyCard 
            number="1"
            title={t('policy.1.title')}
            isAlert
            icon={<ShieldCheck size={24} />}
            content={t('policy.1.content')}
          />
          
          <PolicyCard 
            number="5"
            title={t('policy.5.title')}
            isAlert
            icon={<Ban size={24} />}
            content={[
              t('policy.5.item.1'),
              t('policy.5.item.2'),
              t('policy.5.item.3'),
              t('policy.5.item.4')
            ]}
          />

          <PolicyCard 
            number="4"
            title={t('policy.4.title')}
            icon={<Sparkles size={24} />}
            content={t('policy.4.content')}
          />

          <PolicyCard 
            number="3"
            title={t('policy.3.title')}
            icon={<Server size={24} />}
            content={t('policy.3.content')}
          />

          <PolicyCard 
            number="2"
            title={t('policy.2.title')}
            icon={<Copyright size={24} />}
            content={t('policy.2.content')}
          />

          <PolicyCard 
            number="6"
            title={t('policy.6.title')}
            isAlert
            icon={<UserX size={24} />}
            content={t('policy.6.content')}
          />
        </section>

        {/* Updates Section */}
        <section className="bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-white/5 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <RefreshCcw size={120} className="text-slate-900 dark:text-white" />
           </div>
           <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">{t('policy.updates.title')}</h3>
              <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed max-w-3xl">
                 {t('policy.updates.content')}
              </p>
           </div>
        </section>
      </div>
    </div>
  );
};

export default PolicyPage;
