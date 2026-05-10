
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Check, X, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { cmsSkytokenApi } from '../../apis/skytoken';
import { SkyTokenWithdrawal } from '../../../types';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const SktWithdrawalTab: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<SkyTokenWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params: { page: number; limit: number; status?: string } = { page, limit };
    if (statusFilter !== 'all') params.status = statusFilter;
    const res = await cmsSkytokenApi.getWithdrawals(params);
    if (res.success !== false) {
      setWithdrawals(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: StatusFilter) => {
    setStatusFilter(key);
    setPage(1);
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this withdrawal request?')) return;
    setActionLoading(id);
    const res = await cmsSkytokenApi.approveWithdrawal(id);
    if (res.success !== false) fetchData();
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const adminNote = prompt('Rejection reason:');
    if (!adminNote) return;
    setActionLoading(id);
    const res = await cmsSkytokenApi.rejectWithdrawal(id, adminNote);
    if (res.success !== false) fetchData();
    setActionLoading(null);
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Mark as completed (bank transferred)?')) return;
    setActionLoading(id);
    const res = await cmsSkytokenApi.completeWithdrawal(id);
    if (res.success !== false) fetchData();
    setActionLoading(null);
  };

  const getUserDisplay = (userId: SkyTokenWithdrawal['userId']) => {
    if (typeof userId === 'object' && userId !== null) {
      return { name: userId.name, email: userId.email };
    }
    return { name: String(userId), email: '' };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SKT Withdrawal Requests</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg w-fit">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === f.key
                ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          No withdrawal requests found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount SKT</th>
                <th className="px-4 py-3 font-medium">Amount VND</th>
                <th className="px-4 py-3 font-medium">Bank Info</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {withdrawals.map((w) => {
                const user = getUserDisplay(w.userId);
                const isActioning = actionLoading === w._id;

                return (
                  <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                      {user.email && (
                        <div className="text-xs text-gray-400">{user.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-mono">
                      {w.amountSKT.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-mono">
                      {w.amountVND.toLocaleString()} ₫
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white">{w.bankName}</div>
                      <div className="text-xs text-gray-400">{w.bankAccountNumber} - {w.bankAccountName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[w.status] ?? ''}`}>
                        {w.status}
                      </span>
                      {w.adminNote && (
                        <div className="text-xs text-gray-400 mt-1 max-w-[160px] truncate" title={w.adminNote}>
                          {w.adminNote}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      {isActioning ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {w.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(w._id)}
                                className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(w._id)}
                                className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {w.status === 'approved' && (
                            <button
                              onClick={() => handleComplete(w._id)}
                              className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
                              title="Mark completed"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SktWithdrawalTab;
