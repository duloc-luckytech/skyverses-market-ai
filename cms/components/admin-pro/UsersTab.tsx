
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, User, 
  Mail, Calendar, Activity, Zap, 
  Crown, MoreVertical, Shield, 
  CheckCircle2, AlertCircle, Clock,
  Smartphone, Monitor, SearchX,
  // Added missing icons
  Loader2, Edit3
} from 'lucide-react';
import { AuthUser, UserListResponse, UserListParams } from '../../apis/auth';

interface UsersTabProps {
  loading: boolean;
  response: UserListResponse | null;
  onParamsChange: (params: UserListParams) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ loading, response, onParamsChange }) => {
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    pageSize: 20,
    searchContent: '',
    sortBy: 'videoUsed',
    sortOrder: 'desc',
    plan: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onParamsChange(params);
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = { ...params, page: newPage };
    setParams(nextParams);
    onParamsChange(nextParams);
  };

  const handleSort = (field: string) => {
    const nextOrder = params.sortBy === field && params.sortOrder === 'desc' ? 'asc' : 'desc';
    const nextParams = { ...params, sortBy: field, sortOrder: nextOrder as 'asc' | 'desc' };
    setParams(nextParams);
    onParamsChange(nextParams);
  };

  const handlePlanFilter = (plan: string) => {
    const nextParams = { ...params, plan, page: 1 };
    setParams(nextParams);
    onParamsChange(nextParams);
  };

  const planOptions = ['', 'free', 'starter', 'creator', 'studio', 'enterprise'];

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-700">
      
      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white dark:bg-[#08080a] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text"
            value={params.searchContent}
            onChange={(e) => setParams({ ...params, searchContent: e.target.value })}
            placeholder="Tìm theo tên, email hoặc ID..."
            className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:border-brand-blue outline-none transition-all"
          />
        </form>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-black/40">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={params.plan}
              onChange={(e) => handlePlanFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
            >
              <option value="">Tất cả gói</option>
              {planOptions.slice(1).map(opt => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/10">
             {[10, 20, 50].map(size => (
               <button 
                 key={size}
                 onClick={() => { const next = { ...params, pageSize: size, page: 1 }; setParams(next); onParamsChange(next); }}
                 className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${params.pageSize === size ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-400'}`}
               >
                 {size}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-8 py-6">Khách hàng</th>
                <th className="px-8 py-6 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('plan')}>Gói dịch vụ <ArrowUpDown size={10} className="inline ml-1" /></th>
                <th className="px-8 py-6 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('videoUsed')}>Tiêu thụ (Video) <ArrowUpDown size={10} className="inline ml-1" /></th>
                <th className="px-8 py-6">Hiệu lực</th>
                <th className="px-8 py-6 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('lastActiveAt')}>Hoạt động cuối <ArrowUpDown size={10} className="inline ml-1" /></th>
                <th className="px-8 py-6 text-right">Quản trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-40 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-blue mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">Synchronizing_User_Grid...</p>
                  </td>
                </tr>
              ) : response?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-40 text-center opacity-30">
                    <SearchX size={64} className="mx-auto mb-6" />
                    <p className="text-xl font-black uppercase tracking-[0.2em] italic">No Nodes Detected</p>
                  </td>
                </tr>
              ) : (
                response?.data.map((u) => (
                  <tr key={u._id} className="group hover:bg-brand-blue/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                           <img src={u.avatar || 'https://i.pravatar.cc/100'} className="w-11 h-11 rounded-xl border border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform shadow-sm" alt="" />
                           <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#08080a] rounded-full"></div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-black dark:text-white uppercase italic truncate max-w-[180px]">{u.name}</p>
                          <p className="text-[9px] font-medium text-gray-500 truncate max-w-[180px]">{u.email}</p>
                          {u.googleEmail && u.googleEmail !== u.email && (
                            <p className="text-[8px] text-brand-blue font-bold opacity-60">G: {u.googleEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1.5">
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded border w-fit italic ${
                            u.plan === 'free' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' :
                            u.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-lg shadow-purple-500/5' :
                            'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
                          }`}>
                             {u.plan || 'Free'}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-2 w-40">
                          <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                             <span>QUOTA</span>
                             <span className="text-black dark:text-white">{u.videoUsed} / {u.maxVideo}</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-brand-blue shadow-[0_0_8px_#0090ff]" 
                               style={{ width: `${Math.min(100, ((u.videoUsed || 0) / (u.maxVideo || 1)) * 100)}%` }} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <Clock size={14} className="text-gray-400" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-black text-slate-700 dark:text-gray-300 uppercase">
                                {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                             </p>
                             <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest italic">Renewal Protocol</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 italic">
                             {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}
                          </p>
                          <div className="flex items-center gap-1.5 text-emerald-500 text-[8px] font-black uppercase">
                             <Activity size={10} /> Uplink Stable
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-blue rounded-lg transition-all shadow-sm">
                             <Edit3 size={14} />
                          </button>
                          <button className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-blue rounded-lg transition-all shadow-sm">
                             <MoreVertical size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && response && response.totalPages > 0 && (
          <div className="px-8 py-8 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-6">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Showing {((response.page - 1) * response.pageSize) + 1} - {Math.min(response.page * response.pageSize, response.totalItems)} of {response.totalItems} Nodes
             </p>
             
             <div className="flex items-center gap-3">
                <button 
                  disabled={response.page === 1}
                  onClick={() => handlePageChange(response.page - 1)}
                  className="p-3 border border-black/10 dark:border-white/10 rounded-xl text-gray-500 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-20"
                >
                   <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1 bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 p-1.5 rounded-xl px-4">
                   <span className="text-xs font-black text-brand-blue">{response.page}</span>
                   <span className="text-xs font-black text-gray-400 mx-2">/</span>
                   <span className="text-xs font-black text-gray-400">{response.totalPages}</span>
                </div>

                <button 
                  disabled={response.page === response.totalPages}
                  onClick={() => handlePageChange(response.page + 1)}
                  className="p-3 border border-black/10 dark:border-white/10 rounded-xl text-gray-500 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-20"
                >
                   <ChevronRight size={18} />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-8 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-brand-blue">
               <Shield size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Active Plans</span>
            </div>
            <p className="text-4xl font-black italic tracking-tighter">842</p>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Nodes with premium uplink</p>
         </div>
         <div className="p-8 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-orange-500">
               <Zap size={20} fill="currentColor" />
               <span className="text-[10px] font-black uppercase tracking-widest">Global Compute</span>
            </div>
            <p className="text-4xl font-black italic tracking-tighter">142K</p>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Total video tasks processed</p>
         </div>
         <div className="p-8 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-purple-500">
               <Crown size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Retention Ratio</span>
            </div>
            <p className="text-4xl font-black italic tracking-tighter">92%</p>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">User node stability index</p>
         </div>
      </div>
    </div>
  );
};
