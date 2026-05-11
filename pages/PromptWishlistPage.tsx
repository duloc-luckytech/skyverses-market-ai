import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  Heart,
  ArrowLeft,
  ChevronRight,
  Trash2,
  ShoppingBag,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { promptMarketApi } from '../apis/prompt-market';
import PromptSetCard from '../components/prompt-market/PromptSetCard';
import type { PromptWishlistItem, PromptSet } from '../types';

/* ═══════════════════════════════════════════════════
 * PromptWishlistPage
 * Route: /prompt-market/wishlist
 * ═══════════════════════════════════════════════════ */
const PromptWishlistPage: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, login } = useAuth();

  const [items, setItems] = useState<PromptWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchWishlist = useCallback(async (p: number) => {
    setLoading(true);
    const res = await promptMarketApi.getWishlist(p, 20);
    setItems(res.data);
    setTotalPages(res.pagination.totalPages);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist(page);
    else setLoading(false);
  }, [isAuthenticated, page, fetchWishlist]);

  const handleRemove = async (promptSetId: string) => {
    setRemovingId(promptSetId);
    const res = await promptMarketApi.toggleWishlist(promptSetId);
    if (res.success) {
      setItems((prev) => prev.filter((item) => {
        const id = typeof item.promptSetId === 'string' ? item.promptSetId : item.promptSetId._id;
        return id !== promptSetId;
      }));
    }
    setRemovingId(null);
  };

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Heart className="w-16 h-16 text-white/10" />
        <h2 className="text-2xl font-bold text-white">
          {t('prompt_market.wishlist_login_title') || 'Sign in to view your wishlist'}
        </h2>
        <p className="text-white/35 max-w-sm">
          {t('prompt_market.wishlist_login_desc') || 'Save your favorite prompts and come back to them anytime.'}
        </p>
        <button
          onClick={() => login()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A84C] text-black font-semibold hover:bg-[#B8963F] transition active:scale-95"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--atlas-bg-page)] text-white">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-white/[0.04] bg-[var(--atlas-bg-page)]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/35">
          <Link to="/prompt-market" className="hover:text-white/60 transition-colors">
            Prompt Market
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
          <span className="text-white/60">
            {t('prompt_market.wishlist') || 'Wishlist'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {t('prompt_market.my_wishlist') || 'My Wishlist'}
              </h1>
              <p className="text-sm text-white/30 mt-0.5">
                {t('prompt_market.wishlist_desc') || 'Prompts you saved for later'}
              </p>
            </div>
          </div>

          <Link
            to="/prompt-market"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] text-white/40 text-sm hover:border-[#C9A84C]/30 hover:text-white/60 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('prompt_market.browse') || 'Browse Market'}
          </Link>
        </motion.div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-white/25 animate-pulse">
              {t('prompt_market.loading_wishlist') || 'Loading wishlist...'}
            </span>
          </div>
        ) : items.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-6 text-center"
          >
            <div className="w-20 h-20 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
              <Heart className="w-10 h-10 text-white/10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('prompt_market.wishlist_empty') || 'Your wishlist is empty'}
              </h3>
              <p className="text-white/30 text-sm max-w-md">
                {t('prompt_market.wishlist_empty_desc') || 'Browse the marketplace and tap the heart icon to save prompts you love.'}
              </p>
            </div>
            <Link
              to="/prompt-market"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A84C] text-black font-semibold hover:bg-[#B8963F] transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('prompt_market.explore') || 'Explore Prompts'}
            </Link>
          </motion.div>
        ) : (
          /* ── Grid ── */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item, i) => {
                const ps = typeof item.promptSetId === 'object' ? item.promptSetId as PromptSet : null;
                if (!ps) return null;
                const psId = ps._id;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="relative group/wish"
                  >
                    <PromptSetCard promptSet={ps} index={i} />

                    {/* Remove from wishlist overlay */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(psId); }}
                      disabled={removingId === psId}
                      className="absolute top-3 right-12 z-20 w-8 h-8 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all opacity-0 group-hover/wish:opacity-100"
                      title={t('prompt_market.remove_wishlist') || 'Remove from wishlist'}
                    >
                      {removingId === psId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-[#C9A84C] text-black'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:border-[#C9A84C]/30 hover:text-white/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PromptWishlistPage;
