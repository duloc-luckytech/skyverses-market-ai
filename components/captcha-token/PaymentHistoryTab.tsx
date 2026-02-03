
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Activity, Check, X, Calendar, Clock, Loader2, Landmark } from 'lucide-react';
import { PaymentLog } from '../../hooks/useCaptchaToken';

interface PaymentHistoryTabProps {
  logs: PaymentLog[];
  loading?: boolean;
}

export const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ logs, loading }) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all">
         <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
            <div className="flex items-center gap-3">
               <CreditCard size={20} className="text-indigo-600" />
               <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Lịch sử Thanh toán.</h3>
            </div>
            {loading && (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang đồng bộ...</span>
              </div>
            )}
         </div>
         
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse font-mono">
               <thead>
                  <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                     <th className="px-10 py-6">Mã Giao dịch / BankRef</th>
                     <th className="px-10 py-6">Ngày nạp</th>
                     <th className="px-10 py-6">Gói cước</th>
                     <th className="px-10 py-6 text-right">Số tiền</th>
                     <th className="px-10 py-6 text-center">Trạng thái</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                         <Loader2 size={48} className="mx-auto mb-4 text-indigo-600 animate-spin" />
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing_Ledger...</p>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center opacity-10">
                         <Activity size={48} className="mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-[0.5em]">Chưa có dữ liệu thanh toán</p>
                      </td>
                    </tr>
                  ) : logs.map(l => (
                    <tr key={l._id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-[11px] font-bold">
                       <td className="px-10 py-6">
                          <div className="flex flex-col gap-1">
                             <span className="text-gray-400">#{l._id.slice(-8).toUpperCase()}</span>
                             {l.bankRef && (
                               <div className="flex items-center gap-1.5 text-[8px] text-slate-400 uppercase">
                                  <Landmark size={10} /> {l.bankRef}
                               </div>
                             )}
                          </div>
                       </td>
                       <td className="px-10 py-6 italic text-slate-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                             <Calendar size={12} className="text-indigo-600" />
                             {new Date(l.createdAt).toLocaleString('vi-VN', {
                               year: 'numeric',
                               month: '2-digit',
                               day: '2-digit',
                               hour: '2-digit',
                               minute: '2-digit'
                             })}
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black shadow-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 uppercase`}>
                            {l.plan?.name || 'Standard'}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-right font-black italic text-slate-900 dark:text-white">
                          {l.amount.toLocaleString()} {l.currency || 'VND'}
                       </td>
                       <td className="px-10 py-6">
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              l.status === 'SUCCESS' ? 'text-emerald-500 bg-emerald-500/10' : 
                              l.status === 'FAILED' ? 'text-red-500 bg-red-500/10' : 
                              'text-orange-500 bg-orange-500/10'
                            }`}>
                               {l.status === 'SUCCESS' ? <Check size={12} strokeWidth={4}/> : l.status === 'FAILED' ? <X size={12} strokeWidth={4}/> : <Clock size={12} className="animate-spin" />}
                               <span>{l.status}</span>
                            </div>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
};
