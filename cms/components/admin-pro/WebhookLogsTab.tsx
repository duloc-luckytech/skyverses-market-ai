import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Loader2, RefreshCw,
  Globe, Clock, Code, ChevronDown, ChevronUp,
  Receipt, Banknote, User, CheckCircle2, XCircle
} from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../apis/config';

interface WebhookLog {
  _id: string;
  transactionId?: string;
  payload: any;
  receivedAt: string;
  createdAt: string;
}

interface BankTxn {
  _id: string;
  transactionId: string;
  transactionNum?: string;
  amount: number;
  description?: string;
  date?: string;
  bank?: string;
  accountNumber?: string;
  userId?: { _id: string; email: string; name: string } | null;
  createdAt: string;
}

export const WebhookLogsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'webhooks' | 'bank'>('webhooks');
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [bankTxns, setBankTxns] = useState<BankTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalBank, setTotalBank] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const LIMIT = 20;

  const fetchData = useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/credits/admin/webhook-logs?page=${p}&limit=${LIMIT}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      setWebhookLogs(json.webhookLogs || []);
      setBankTxns(json.bankTransactions || []);
      setTotalPages(json.pagination?.totalPages || 0);
      setTotalLogs(json.pagination?.totalLogs || 0);
      setTotalBank(json.pagination?.totalBankTxns || 0);
      setPage(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(1); }, []);

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Webhook & Bank Logs</h2>
          <p className="text-xs text-slate-400">{totalLogs} webhook logs · {totalBank} bank transactions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sub-tabs */}
          <div className="flex bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl">
            <button onClick={() => setActiveSubTab('webhooks')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSubTab === 'webhooks' ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-slate-400'}`}>
              <Globe size={11} className="inline mr-1" /> Webhook Raw
            </button>
            <button onClick={() => setActiveSubTab('bank')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSubTab === 'bank' ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-slate-400'}`}>
              <Banknote size={11} className="inline mr-1" /> Bank Processed
            </button>
          </div>
          <button onClick={() => fetchData(page)} className="p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.06] text-slate-400 hover:text-brand-blue transition-all">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-2" />
            <p className="text-[10px] text-slate-400">Đang tải...</p>
          </div>
        ) : activeSubTab === 'webhooks' ? (
          /* ═══ WEBHOOK RAW LOGS ═══ */
          <>
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="col-span-2">Transaction ID</div>
              <div className="col-span-3">Thời gian nhận</div>
              <div className="col-span-6">Payload Preview</div>
              <div className="col-span-1 text-right">Expand</div>
            </div>

            {webhookLogs.length === 0 ? (
              <div className="py-20 text-center">
                <Globe size={32} className="text-slate-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Chưa nhận webhook nào</p>
              </div>
            ) : (
              webhookLogs.map((log) => {
                const isExpanded = expandedId === log._id;
                const date = new Date(log.receivedAt || log.createdAt);
                const payloadStr = JSON.stringify(log.payload || {});
                const preview = payloadStr.length > 120 ? payloadStr.substring(0, 120) + '...' : payloadStr;

                return (
                  <div key={log._id} className="border-b border-black/[0.02] dark:border-white/[0.02]">
                    <div 
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors items-center cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : log._id)}
                    >
                      <div className="col-span-2">
                        <span className="text-[10px] font-mono text-brand-blue">{log.transactionId?.slice(0, 16) || log._id.slice(-8)}</span>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            {date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-6">
                        <p className="text-[10px] font-mono text-slate-400 truncate">{preview}</p>
                      </div>
                      <div className="col-span-1 text-right">
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400 inline" /> : <ChevronDown size={14} className="text-slate-400 inline" />}
                      </div>
                    </div>

                    {/* Expanded payload */}
                    {isExpanded && (
                      <div className="px-5 pb-4">
                        <pre className="p-4 bg-slate-900 text-green-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        ) : (
          /* ═══ BANK TRANSACTIONS (PROCESSED) ═══ */
          <>
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="col-span-2">Transaction ID</div>
              <div className="col-span-2">Ngân hàng</div>
              <div className="col-span-2 text-right">Số tiền</div>
              <div className="col-span-2">Nội dung CK</div>
              <div className="col-span-2">User linked</div>
              <div className="col-span-2 text-right">Thời gian</div>
            </div>

            {bankTxns.length === 0 ? (
              <div className="py-20 text-center">
                <Banknote size={32} className="text-slate-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Chưa có giao dịch ngân hàng</p>
              </div>
            ) : (
              bankTxns.map((tx) => {
                const date = new Date(tx.date || tx.createdAt);
                const hasUser = tx.userId && typeof tx.userId === 'object';
                return (
                  <div key={tx._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-3 border-b border-black/[0.02] dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors items-center">
                    <div className="col-span-2">
                      <span className="text-[10px] font-mono text-slate-500">{tx.transactionId?.slice(0, 16)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase">{tx.bank || '—'}</span>
                      {tx.accountNumber && <p className="text-[9px] text-slate-400">{tx.accountNumber}</p>}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-black text-emerald-500 tabular-nums">{(tx.amount || 0).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-400 ml-1">₫</span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate" title={tx.description}>{tx.description || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      {hasUser ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">{(tx.userId as any).email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <XCircle size={10} className="text-slate-300" />
                          <span className="text-[10px] text-slate-400">Chưa match</span>
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-[10px] text-slate-400 tabular-nums">
                        {date.toLocaleDateString('vi-VN')} · {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between bg-slate-50/30 dark:bg-white/[0.005]">
            <p className="text-[10px] font-bold text-slate-400">Trang {page}/{totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => fetchData(page - 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25"><ChevronLeft size={12} /></button>
              <button disabled={page >= totalPages} onClick={() => fetchData(page + 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25"><ChevronRight size={12} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
