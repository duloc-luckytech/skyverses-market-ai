import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Loader2,
  ArrowUpRight, RefreshCw, Banknote, Bitcoin, Sparkles,
  Receipt, Clock, User
} from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../apis/config';

interface TopUpRecord {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  source: string;
  note: string;
  meta?: { packageCode?: string; totalCredits?: number; bankTransactionId?: string; network?: string; txHash?: string };
  user?: { email: string; name: string; avatar?: string };
  createdAt: string;
}

export const PaymentHistoryTab: React.FC = () => {
  const [records, setRecords] = useState<TopUpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const LIMIT = 25;

  const fetchData = useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), limit: LIMIT.toString() });
      if (sourceFilter) params.append('source', sourceFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`${API_BASE_URL}/credits/admin/top-up-history?${params}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      setRecords(json.data || []);
      setTotal(json.pagination?.total || 0);
      setTotalPages(json.pagination?.totalPages || 0);
      setPage(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [sourceFilter, searchQuery]);

  useEffect(() => { fetchData(1); }, [sourceFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

  const sourceColors: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    'bank_transfer': { label: 'Bank', color: '#10b981', bg: '#10b98112', icon: <Banknote size={11} /> },
    'crypto': { label: 'Crypto', color: '#f59e0b', bg: '#f59e0b12', icon: <Bitcoin size={11} /> },
    'admin': { label: 'Admin', color: '#8b5cf6', bg: '#8b5cf612', icon: <User size={11} /> },
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch sử nạp Credits</h2>
          <p className="text-xs text-slate-400">{total} giao dịch nạp tiền (Bank + Crypto + Admin)</p>
        </div>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={13} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm ghi chú, mã..."
              className="bg-white dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-brand-blue/40 w-52"
            />
          </form>
          <div className="flex items-center gap-2 px-3 py-2 border border-black/[0.04] dark:border-white/[0.06] rounded-xl bg-white dark:bg-white/[0.03]">
            <Filter size={12} className="text-slate-400" />
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer text-slate-600 dark:text-gray-400">
              <option value="">Tất cả</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="crypto">Crypto</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={() => fetchData(page)} className="p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.06] text-slate-400 hover:text-brand-blue transition-all">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="col-span-3">Người dùng</div>
          <div className="col-span-1">Nguồn</div>
          <div className="col-span-2 text-right">Số lượng</div>
          <div className="col-span-2 text-right">Số dư sau</div>
          <div className="col-span-2">Ghi chú</div>
          <div className="col-span-2 text-right">Thời gian</div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-2" />
            <p className="text-[10px] text-slate-400">Đang tải...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center">
            <Receipt size={32} className="text-slate-200 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Chưa có giao dịch nạp tiền</p>
          </div>
        ) : (
          records.map((tx) => {
            const src = sourceColors[tx.source] || { label: tx.source, color: '#64748b', bg: '#64748b12', icon: <Sparkles size={11} /> };
            const date = new Date(tx.createdAt);
            return (
              <div key={tx._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-3 border-b border-black/[0.02] dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors items-center">
                {/* User */}
                <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                  {tx.user?.avatar ? (
                    <img src={tx.user.avatar} className="w-7 h-7 rounded-lg border border-black/[0.04]" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold">
                      {tx.user?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{tx.user?.name || 'Unknown'}</p>
                    <p className="text-[9px] text-slate-400 truncate">{tx.user?.email || tx.userId}</p>
                  </div>
                </div>
                {/* Source */}
                <div className="col-span-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider" style={{ backgroundColor: src.bg, color: src.color }}>
                    {src.icon} {src.label}
                  </span>
                </div>
                {/* Amount */}
                <div className="col-span-2 text-right">
                  <span className="text-sm font-black text-emerald-500 tabular-nums">+{tx.amount.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 ml-1">CR</span>
                </div>
                {/* Balance after */}
                <div className="col-span-2 text-right">
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 tabular-nums">{(tx.balanceAfter || 0).toLocaleString()}</span>
                  <span className="text-[9px] text-slate-300 ml-1">CR</span>
                </div>
                {/* Note */}
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 truncate" title={tx.note}>{tx.note || '—'}</p>
                  {tx.meta?.packageCode && (
                    <p className="text-[8px] text-brand-blue font-bold">{tx.meta.packageCode}</p>
                  )}
                </div>
                {/* Time */}
                <div className="col-span-2 text-right">
                  <p className="text-[10px] text-slate-400 tabular-nums">
                    {date.toLocaleDateString('vi-VN')} · {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between bg-slate-50/30 dark:bg-white/[0.005]">
            <p className="text-[10px] font-bold text-slate-400">{total} giao dịch · Trang {page}/{totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => fetchData(page - 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25"><ChevronLeft size={12} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const s = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = s + i;
                if (p > totalPages) return null;
                return <button key={p} onClick={() => fetchData(p)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${p === page ? 'bg-brand-blue text-white' : 'text-slate-400'}`}>{p}</button>;
              })}
              <button disabled={page >= totalPages} onClick={() => fetchData(page + 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25"><ChevronRight size={12} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
