import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, BarChart3, Activity, PieChart, 
  ArrowUpRight, ArrowDownRight, Clock,
  Filter, Search, Download, Info,
  AlertTriangle, CheckCircle2, ChevronRight,
  ImageIcon, Video, BrainCircuit, LayoutGrid,
  TrendingUp, Wallet, ArrowRight, CornerDownRight,
  // Added ShieldCheck and Lock to imports
  ShieldCheck, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

interface UsageEntry {
  id: string;
  date: string;
  time: string;
  tool: 'Image' | 'Video' | 'Character' | 'System';
  action: string;
  credits: number;
  status: 'Success' | 'Failed';
}

const MOCK_USAGE: UsageEntry[] = [
  { id: 'tx-001', date: '2025-05-14', time: '14:22', tool: 'Video', action: 'Cinematic Render', credits: 45, status: 'Success' },
  { id: 'tx-002', date: '2025-05-14', time: '12:05', tool: 'Image', action: '8K Upscale', credits: 5, status: 'Success' },
  { id: 'tx-003', date: '2025-05-13', time: '18:40', tool: 'Character', action: 'DNA Lock', credits: 15, status: 'Success' },
  { id: 'tx-004', date: '2025-05-13', time: '11:15', tool: 'System', action: 'Logic Stress Test', credits: 20, status: 'Success' },
  { id: 'tx-005', date: '2025-05-12', time: '09:30', tool: 'Video', action: 'Motion Synthesis', credits: 30, status: 'Failed' },
  { id: 'tx-006', date: '2025-05-12', time: '08:12', tool: 'Image', action: 'Concept Gen', credits: 2, status: 'Success' },
];

const CreditUsagePage: React.FC = () => {
  const { credits, login, isAuthenticated } = useAuth();
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [toolFilter, setToolFilter] = useState('All');

  const filteredUsage = useMemo(() => {
    return MOCK_USAGE.filter(entry => {
      const matchesSearch = entry.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTool = toolFilter === 'All' || entry.tool === toolFilter;
      return matchesSearch && matchesTool;
    });
  }, [searchQuery, toolFilter]);

  const stats = {
    today: 52,
    month: 1240,
    remainingActions: Math.floor(credits / 4), // Rough estimate
    velocity: '+14% vs last week'
  };

  const breakdowns = [
    { label: 'Video Production', percentage: 65, color: 'bg-purple-500', icon: <Video size={14}/> },
    { label: 'High-Res Imaging', percentage: 20, color: 'bg-cyan-500', icon: <ImageIcon size={14}/> },
    { label: 'Neural Logic', percentage: 10, color: 'bg-emerald-500', icon: <BrainCircuit size={14}/> },
    { label: 'Other Systems', percentage: 5, color: 'bg-gray-500', icon: <LayoutGrid size={14}/> }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfe] dark:bg-[#020203] px-6">
        <div className="text-center space-y-8 max-w-md">
           <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto text-brand-blue">
              <Lock size={40} />
           </div>
           <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Auth Required</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Please sign in to access your neural usage dashboard and credit management.</p>
           </div>
           <button onClick={login} className="btn-sky-primary px-12 py-5 text-xs font-black uppercase tracking-[0.4em] w-full">Sign In to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-40 bg-[#fcfcfd] dark:bg-[#020203] min-h-screen transition-colors duration-500 font-sans selection:bg-brand-blue/30 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HEADER --- */}
        <header className="mb-16 space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-brand-blue">
                  <BarChart3 size={24} />
                  <span className="text-[12px] font-black uppercase tracking-[0.6em] italic">Telemetry_Center</span>
               </div>
               <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none">Credit <span className="text-brand-blue">Usage.</span></h1>
               <p className="text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-xl">“Detailed breakdown of your neural compute consumption.”</p>
            </div>
            
            <div className="flex gap-4">
               <button className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-sm text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                 <Download size={14} /> Export CSV
               </button>
               <Link to="/credits" className="flex items-center gap-2 px-6 py-3 border border-black/10 dark:border-white/10 rounded-sm text-[10px] font-black uppercase tracking-widest hover:text-brand-blue transition-all">
                 <Zap size={14} fill="currentColor" /> Buy Credits
               </Link>
            </div>
          </div>
        </header>

        {/* --- 1. SUMMARY CARDS --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <SummaryCard 
              label="Live Balance" 
              value={credits.toLocaleString()} 
              unit="CREDITS" 
              icon={<Zap fill="currentColor"/>}
              trend="+0% (Stable)"
              color="text-brand-blue"
           />
           <SummaryCard 
              label="Used Today" 
              value={stats.today.toString()} 
              unit="CREDITS" 
              icon={<TrendingUp />}
              trend={stats.velocity}
              color="text-purple-500"
              isPositive={false}
           />
           <SummaryCard 
              label="Mouthly Burn" 
              value={stats.month.toLocaleString()} 
              unit="CREDITS" 
              icon={<Activity />}
              trend="94.2% Stability"
              color="text-emerald-500"
           />
           <SummaryCard 
              label="Estimated Power" 
              value={stats.remainingActions.toString()} 
              unit="IMAGEN" 
              icon={<Zap />}
              trend="≈ 12 Video Renders"
              color="text-amber-500"
           />
        </section>

        {/* --- 2. BREAKDOWN & CHART --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
           
           {/* Breakdown List */}
           <div className="lg:col-span-5 p-8 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-sm space-y-10 shadow-sm">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <PieChart size={18} className="text-brand-blue" /> Consumption Breakdown
                 </h3>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Last 30 Days</span>
              </div>

              <div className="space-y-8">
                 {breakdowns.map((b) => (
                    <div key={b.label} className="space-y-3 group cursor-default">
                       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-sm ${b.color}/10 flex items-center justify-center ${b.color.replace('bg-', 'text-')}`}>
                                {b.icon}
                             </div>
                             <span className="text-gray-600 dark:text-gray-300">{b.label}</span>
                          </div>
                          <span className="text-black dark:text-white">{b.percentage}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${b.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${b.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                          />
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="pt-6 border-t border-black/5 dark:border-white/5">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                   * Usage is tracked in real-time. Failed generations are automatically refunded to your node.
                 </p>
              </div>
           </div>

           {/* Mock Timeline Chart */}
           <div className="lg:col-span-7 p-8 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-sm flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <TrendingUp size={18} className="text-brand-blue" /> Usage Timeline
                 </h3>
                 <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-full">
                    {['D', 'W', 'M'].map(t => (
                       <button key={t} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-black transition-all ${t === 'W' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}>{t}</button>
                    ))}
                 </div>
              </div>
              
              {/* SVG Mock Chart */}
              <div className="flex-grow flex items-end justify-between gap-2 h-64 relative">
                 <div className="absolute inset-0 grid grid-rows-4 opacity-[0.05]">
                    {[1,2,3,4].map(i => <div key={i} className="border-t border-black dark:border-white"></div>)}
                 </div>
                 {[40, 20, 60, 45, 90, 30, 70, 85, 40, 55, 20, 95].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className={`flex-grow rounded-t-sm transition-all hover:brightness-125 cursor-pointer relative group ${h > 80 ? 'bg-brand-blue' : 'bg-brand-blue/30 dark:bg-brand-blue/10'}`}
                    >
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {Math.round(h * 1.5)} CREDITS
                       </div>
                    </motion.div>
                 ))}
              </div>
              <div className="flex justify-between pt-6 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                 <span>01 May</span>
                 <span>15 May</span>
                 <span>30 May</span>
              </div>
           </div>
        </div>

        {/* --- 3. FILTER & HISTORY TABLE --- */}
        <section className="space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-black uppercase tracking-tighter italic shrink-0">Usage History</h3>
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-grow md:min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search ID or action..."
                      className="w-full bg-white dark:bg-black border border-black/5 dark:border-white/10 pl-10 pr-4 py-3 rounded-full text-xs font-bold focus:border-brand-blue outline-none transition-all"
                    />
                 </div>
                 <div className="flex items-center gap-2 px-4 py-3 border border-black/5 dark:border-white/10 rounded-full bg-white dark:bg-black">
                    <Filter size={14} className="text-gray-400" />
                    <select 
                      value={toolFilter}
                      onChange={e => setToolFilter(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold focus:outline-none uppercase tracking-widest cursor-pointer"
                    >
                       <option value="All">All Tools</option>
                       <option value="Image">Image AI</option>
                       <option value="Video">Video AI</option>
                       <option value="Character">Character Sync</option>
                       <option value="System">System Tools</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/10 rounded-sm overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                          <th className="px-8 py-6">Timestamp</th>
                          <th className="px-8 py-6">Transaction ID</th>
                          <th className="px-8 py-6">Neural Node</th>
                          <th className="px-8 py-6">Operational Task</th>
                          <th className="px-8 py-6 text-right">Quota Spent</th>
                          <th className="px-8 py-6 text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                       {filteredUsage.length > 0 ? filteredUsage.map((entry) => (
                          <tr key={entry.id} className="text-[11px] font-medium group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                             <td className="px-8 py-6">
                                <div className="space-y-0.5">
                                   <p className="font-bold text-black dark:text-white">{entry.date}</p>
                                   <p className="text-[9px] text-gray-400 font-black">{entry.time}</p>
                                </div>
                             </td>
                             <td className="px-8 py-6 font-mono text-gray-400 dark:text-gray-600 group-hover:text-brand-blue transition-colors">#{entry.id}</td>
                             <td className="px-8 py-6">
                                <span className={`px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                                  entry.tool === 'Video' ? 'bg-purple-500/10 text-purple-500' :
                                  entry.tool === 'Image' ? 'bg-cyan-500/10 text-cyan-500' :
                                  'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                  {entry.tool} AI
                                </span>
                             </td>
                             <td className="px-8 py-6 uppercase font-black text-slate-700 dark:text-slate-300 tracking-tighter">{entry.action}</td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <Zap size={10} className="text-brand-blue" fill="currentColor" />
                                   <span className="font-black italic">-{entry.credits}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${entry.status === 'Success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                   <div className={`w-1 h-1 rounded-full ${entry.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                   {entry.status}
                                </div>
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan={6} className="px-8 py-20 text-center opacity-30">
                                <Search size={40} className="mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest italic">No matching telemetry found in local storage</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>

        {/* --- 4. CREDIT RULES & ESTIMATES --- */}
        <section className="mt-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 p-12 bg-gray-50 dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-blue">
                 <ShieldCheck size={200} />
              </div>
              <div className="relative z-10 space-y-10">
                 <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Neural Price Matrix</h3>
                    <p className="text-gray-500 font-medium">Standardized credit consumption protocol for all authorized nodes.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PriceItem label="Image Synthesis" credits="2 - 5" detail="Varies by resolution (720p to 8K)" />
                    <PriceItem label="Cinematic Video" credits="20 - 50" detail="Varies by duration (4s to 12s)" />
                    <PriceItem label="Character DNA Sync" credits="15 - 30" detail="Per identity lock session" />
                    <PriceItem label="Voice Performance" credits="1 / 100" detail="Credits per synthesized words" />
                    <PriceItem label="System Stress Test" credits="10" detail="Automated logic diagnostic run" />
                    <PriceItem label="Agent Autonomous Flow" credits="25" detail="Full chain execution protocol" />
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Conditional Low Credit Warning */}
              {credits < 200 && (
                <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-sm space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
                      <AlertTriangle size={20} />
                      <span className="text-[11px] font-black uppercase tracking-widest italic">Low_Quota_Warning</span>
                   </div>
                   <p className="text-[11px] font-bold text-amber-700 dark:text-amber-500/80 leading-relaxed uppercase">
                     Node_042 reporting low compute balance. Replenish now to prevent production interruption during synthesis cycles.
                   </p>
                   <Link to="/credits" className="flex items-center justify-between w-full p-4 bg-amber-500 text-white rounded-sm text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                      Replenish Node <ArrowRight size={14}/>
                   </Link>
                </div>
              )}

              <div className="p-8 bg-brand-blue/5 border border-brand-blue/20 rounded-sm space-y-6 flex-grow flex flex-col justify-center">
                 <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-tighter">Ready for <br /> <span className="text-brand-blue italic">Full Scale?</span></h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                       Upgrade to Enterprise Node for unlimited credits, private VPC hosting, and dedicated support architects.
                    </p>
                 </div>
                 <Link to="/booking" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue group">
                    TALK TO SALES <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
                 </Link>
              </div>
           </div>
        </section>

        {/* --- 5. FINAL CALL TO ACTION --- */}
        <section className="py-40 text-center relative overflow-hidden bg-white dark:bg-black border border-black/5 dark:border-white/5 rounded-sm shadow-3xl mt-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-brand-blue/5 rounded-full blur-[200px] pointer-events-none"></div>
           <div className="max-w-4xl mx-auto space-y-12 relative z-10">
              <h2 className="text-7xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.8] italic text-black dark:text-white">
                Never Stop <br /> <span className="text-brand-blue">Building.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
                 <Link to="/credits" className="bg-black dark:bg-white text-white dark:text-black px-24 py-8 rounded-full text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all group">
                    Top Up Credits <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                 </Link>
                 <Link to="/" className="px-16 py-8 border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-sm font-black uppercase tracking-[0.6em] transition-all rounded-full italic">
                    Explore Tools
                 </Link>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const SummaryCard = ({ label, value, unit, icon, trend, color, isPositive = true }: any) => (
  <div className="p-8 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/10 rounded-sm space-y-6 group hover:border-brand-blue transition-all shadow-sm">
     <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-sm bg-black/5 dark:bg-white/5 flex items-center justify-center ${color} group-hover:bg-brand-blue group-hover:text-white transition-all`}>
           {icon}
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
           {isPositive ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {trend}
        </div>
     </div>
     <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest italic">{label}</p>
        <div className="flex items-baseline gap-2">
           <h4 className="text-4xl font-black italic tracking-tighter text-black dark:text-white">{value}</h4>
           <span className="text-[10px] font-black text-brand-blue uppercase">{unit}</span>
        </div>
     </div>
  </div>
);

const PriceItem = ({ label, credits, detail }: any) => (
  <div className="flex items-start gap-4 group">
     <div className="mt-1 w-2 h-2 bg-brand-blue group-hover:scale-125 transition-transform"></div>
     <div className="space-y-1">
        <div className="flex items-center gap-4">
           <span className="text-sm font-black uppercase tracking-tighter italic text-black dark:text-white">{label}</span>
           <div className="flex-grow h-px bg-black/5 dark:bg-white/10 min-w-[20px] lg:min-w-[100px]"></div>
           <span className="text-sm font-black text-brand-blue italic">{credits} CR</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{detail}</p>
     </div>
  </div>
);

export default CreditUsagePage;