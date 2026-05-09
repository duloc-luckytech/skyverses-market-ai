import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  User,
  Package,
  Receipt,
  LogIn,
  AlertCircle,
  Search,
  Eye,
  ChevronDown,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { promptMarketApi } from '../apis/prompt-market';
import type { PromptSet } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = 'listings' | 'sales';

interface EarningsData {
  totalSales: number;
  totalEarned: number;
  recentSales: Array<{
    _id: string;
    pricePaid: number;
    sellerReceived: number;
    buyerId: { _id: string; name: string; avatar?: string };
    promptSetId: { _id: string; title: { en: string }; slug: string };
    createdAt: string;
  }>;
}

const CATEGORIES = ['all', 'coding', 'writing', 'marketing', 'design', 'business', 'education', 'other'] as const;
const STATUSES = ['all', 'active', 'draft', 'pending', 'rejected', 'archived'] as const;

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PromptSet['status'], string> = {
  active: 'bg-green-500/15 text-green-400 border border-green-500/30',
  draft: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  pending: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/30',
  archived: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30',
};

const STATUS_LABELS: Record<PromptSet['status'], string> = {
  active: 'Active',
  draft: 'Draft',
  pending: 'Pending',
  rejected: 'Rejected',
  archived: 'Archived',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PromptSet['status'] }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-3">
      <Package size={40} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function FilterDropdown({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white/70 focus:outline-none focus:border-[#7036F0]/50 capitalize cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0c0c14] capitalize">
            {opt === 'all' ? `All ${label}` : opt}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PromptSellPage() {
  const { t, lang } = useLanguage();
  const { isAuthenticated, login } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('listings');
  const [listings, setListings] = useState<PromptSet[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({
    totalSales: 0,
    totalEarned: 0,
    recentSales: [],
  });
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingEarnings, setLoadingEarnings] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // ─── Fetch data ─────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    setError(null);
    try {
      const res = await promptMarketApi.getMyListings();
      setListings(res.data ?? []);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoadingListings(false);
    }
  }, []);

  const fetchEarnings = useCallback(async () => {
    setLoadingEarnings(true);
    try {
      const res = await promptMarketApi.getMyEarnings();
      setEarnings(res);
    } catch {
      // silently keep defaults
    } finally {
      setLoadingEarnings(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchListings();
    fetchEarnings();
  }, [isAuthenticated, fetchListings, fetchEarnings]);

  // ─── Delete handler ──────────────────────────────────────────────────────────

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      const res = await promptMarketApi.remove(id);
      if (res.success) {
        setListings((prev) => prev.filter((l) => l._id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Auth guard ───────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center flex flex-col items-center gap-5"
        >
          <div className="w-14 h-14 rounded-full bg-[#7036F0]/20 flex items-center justify-center">
            <LogIn size={24} className="text-[#7036F0]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Sign in required</h2>
            <p className="text-white/50 text-sm">
              You need to be logged in to access your Seller Dashboard.
            </p>
          </div>
          <button
            onClick={login}
            className="w-full py-3 rounded-xl bg-[#7036F0] hover:bg-[#5a2bc7] text-white font-medium transition-colors"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Derived data ──────────────────────────────────────────────────────────

  const filteredListings = useMemo(() => {
    let result = listings;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) => {
        const title = l.title[lang as keyof typeof l.title] ?? l.title.en ?? '';
        return title.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q);
      });
    }
    if (filterCategory !== 'all') {
      result = result.filter((l) => l.category === filterCategory);
    }
    if (filterStatus !== 'all') {
      result = result.filter((l) => l.status === filterStatus);
    }
    return result;
  }, [listings, searchQuery, filterCategory, filterStatus, lang]);

  const hasActiveFilters = searchQuery.trim() !== '' || filterCategory !== 'all' || filterStatus !== 'all';

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black/95">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Seller Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Manage your prompt listings and track earnings</p>
          </div>
          <Link
            to="/prompt-market/sell/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7036F0] hover:bg-[#5a2bc7] text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Create New
          </Link>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/10">
          {([
            { key: 'listings' as TabKey, label: 'My Listings', icon: Package },
            { key: 'sales' as TabKey, label: 'Recent Sales', icon: Receipt },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === key
                  ? 'border-[#7036F0] text-white'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'listings' && (
            <motion.div
              key="listings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Filter bar */}
              {listings.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search listings..."
                      className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#7036F0]/50"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Category filter */}
                  <FilterDropdown
                    value={filterCategory}
                    options={CATEGORIES}
                    onChange={setFilterCategory}
                    label="Categories"
                  />

                  {/* Status filter */}
                  <FilterDropdown
                    value={filterStatus}
                    options={STATUSES}
                    onChange={setFilterStatus}
                    label="Statuses"
                  />

                  {/* Clear filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                      <X size={12} />
                      Clear
                    </button>
                  )}
                </div>
              )}

              {loadingListings ? (
                <div className="flex items-center justify-center py-20 text-white/40">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              ) : listings.length === 0 ? (
                <EmptyState message="You have no listings yet. Create your first prompt set!" />
              ) : filteredListings.length === 0 ? (
                <EmptyState message="No listings match your filters." />
              ) : (
                <>
                  {/* Results count */}
                  {hasActiveFilters && (
                    <p className="text-xs text-white/30 mb-3">
                      {filteredListings.length} of {listings.length} listings
                    </p>
                  )}

                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-[1fr_120px_90px_80px_70px_110px] gap-4 px-5 py-3 bg-white/5 text-white/40 text-xs font-medium uppercase tracking-wide border-b border-white/10">
                      <span>Title</span>
                      <span>Category</span>
                      <span>Price</span>
                      <span>Status</span>
                      <span>Sales</span>
                      <span className="text-right">Actions</span>
                    </div>

                    {/* Table rows */}
                    <div className="divide-y divide-white/5">
                      {filteredListings.map((listing) => {
                        const title =
                          listing.title[lang as keyof typeof listing.title] ??
                          listing.title.en ??
                          'Untitled';
                        const isDeleting = deletingId === listing._id;

                        return (
                          <div
                            key={listing._id}
                            className={`flex flex-col md:grid md:grid-cols-[1fr_120px_90px_80px_70px_110px] gap-2 md:gap-4 px-5 py-4 items-start md:items-center transition-colors hover:bg-white/[0.03] ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {/* Title + cover thumbnail */}
                            <div className="flex items-center gap-3 min-w-0">
                              {listing.coverImage ? (
                                <img
                                  src={listing.coverImage}
                                  alt=""
                                  className="w-10 h-7 rounded object-cover flex-shrink-0 border border-white/10"
                                />
                              ) : (
                                <div className="w-10 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                  <Package size={12} className="text-white/20" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">{title}</p>
                                <p className="text-white/30 text-xs truncate">{listing.prompts.length} prompts</p>
                              </div>
                            </div>

                            {/* Category */}
                            <span className="text-white/50 text-xs capitalize">
                              {listing.category || '—'}
                            </span>

                            {/* Price */}
                            <span className="text-white/70 text-sm font-mono">
                              {listing.isFree ? (
                                <span className="text-green-400">Free</span>
                              ) : (
                                `${listing.priceSKT} SKT`
                              )}
                            </span>

                            {/* Status */}
                            <StatusBadge status={listing.status} />

                            {/* Purchase count */}
                            <span className="text-white/50 text-sm font-mono">
                              {listing.purchaseCount ?? 0}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:justify-end">
                              <Link
                                to={`/prompt-market/${listing.slug}`}
                                className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs transition-colors"
                                title="View"
                              >
                                <Eye size={12} />
                              </Link>
                              <Link
                                to={`/prompt-market/sell/edit/${listing._id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                              >
                                <Pencil size={12} />
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(listing._id, title)}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs transition-colors"
                              >
                                {isDeleting ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'sales' && (
            <motion.div
              key="sales"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              {loadingEarnings ? (
                <div className="flex items-center justify-center py-20 text-white/40">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              ) : earnings.recentSales.length === 0 ? (
                <EmptyState message="No sales yet. Share your listings to start earning!" />
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  {/* Table header */}
                  <div className="hidden md:grid grid-cols-[1fr_1fr_100px_100px_110px] gap-4 px-5 py-3 bg-white/5 text-white/40 text-xs font-medium uppercase tracking-wide border-b border-white/10">
                    <span>Buyer</span>
                    <span>Prompt Set</span>
                    <span>Paid</span>
                    <span>You Received</span>
                    <span className="text-right">Date</span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {earnings.recentSales.map((sale) => (
                      <div
                        key={sale._id}
                        className="flex flex-col md:grid md:grid-cols-[1fr_1fr_100px_100px_110px] gap-2 md:gap-4 px-5 py-4 items-start md:items-center hover:bg-white/[0.03] transition-colors"
                      >
                        {/* Buyer */}
                        <div className="flex items-center gap-2 min-w-0">
                          {sale.buyerId.avatar ? (
                            <img
                              src={sale.buyerId.avatar}
                              alt={sale.buyerId.name}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                              <User size={14} className="text-white/40" />
                            </div>
                          )}
                          <span className="text-white/70 text-sm truncate">{sale.buyerId.name}</span>
                        </div>

                        {/* Prompt set */}
                        <Link
                          to={`/prompt-market/${sale.promptSetId.slug}`}
                          className="text-white/70 text-sm hover:text-white transition-colors truncate"
                        >
                          {sale.promptSetId.title.en}
                        </Link>

                        {/* Price paid */}
                        <span className="text-white/60 text-sm font-mono">
                          {sale.pricePaid} SKT
                        </span>

                        {/* Seller received */}
                        <span className="text-[#7036F0] text-sm font-mono font-medium">
                          +{sale.sellerReceived} SKT
                        </span>

                        {/* Date */}
                        <span className="text-white/30 text-xs md:text-right">
                          {formatDate(sale.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
