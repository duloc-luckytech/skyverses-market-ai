import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Loader2,
  Heart,
  ArrowLeft,
  ChevronRight,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { promptMarketApi } from '../apis/prompt-market';
import PromptSetCard from '../components/prompt-market/PromptSetCard';
import type { PromptWishlistItem, PromptSet } from '../types';

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO, staggerChildren: 0.06 },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
};

const stateVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stateVariants}
        className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-6 px-4 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-[#C9A84C]/60" />
        </motion.div>
        <motion.h2 variants={headerVariants} className="text-2xl font-bold text-white">
          {t('prompt_market.wishlist_login_title') || 'Sign in to view your wishlist'}
        </motion.h2>
        <motion.p variants={headerVariants} className="text-white/35 max-w-sm">
          {t('prompt_market.wishlist_login_desc') || 'Save your favorite prompts and come back to them anytime.'}
        </motion.p>
        <motion.button
          onClick={() => login()}
          whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(201,168,76,0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A84C] text-black font-semibold hover:bg-[#B8963F] transition active:scale-95"
        >
          Sign In
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen bg-[var(--atlas-bg-page)] text-white"
    >
      {/* ── Breadcrumb ── */}
      <motion.div
        variants={headerVariants}
        className="border-b border-white/[0.04] bg-[var(--atlas-bg-page)]/80 backdrop-blur-lg sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/35">
          <Link to="/prompt-market" className="hover:text-white/60 transition-colors">
            Prompt Market
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
          <span className="text-white/60">
            {t('prompt_market.wishlist') || 'Wishlist'}
          </span>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* ── Header ── */}
        <motion.div
          variants={headerVariants}
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

          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:block"
          >
            <Link
              to="/prompt-market"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] text-white/40 text-sm hover:border-[#C9A84C]/30 hover:text-white/60 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {t('prompt_market.browse') || 'Browse Market'}
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Loading ── */}
        {loading ? (
          <motion.div
            variants={stateVariants}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
            </motion.div>
            <span className="text-xs uppercase tracking-widest text-white/25 animate-pulse">
              {t('prompt_market.loading_wishlist') || 'Loading wishlist...'}
            </span>
          </motion.div>
        ) : items.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            variants={stateVariants}
            className="flex flex-col items-center justify-center py-20 gap-6 text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-lg bg-white/[0.02] border border-[#C9A84C]/15 flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-white/10" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('prompt_market.wishlist_empty') || 'Your wishlist is empty'}
              </h3>
              <p className="text-white/30 text-sm max-w-md">
                {t('prompt_market.wishlist_empty_desc') || 'Browse the marketplace and tap the heart icon to save prompts you love.'}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(201,168,76,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/prompt-market"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A84C] text-black font-semibold hover:bg-[#B8963F] transition active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('prompt_market.explore') || 'Explore Prompts'}
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          /* ── Grid ── */
          <>
            <motion.div
              variants={gridVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {items.map((item, i) => {
                const ps = typeof item.promptSetId === 'object' ? item.promptSetId as PromptSet : null;
                if (!ps) return null;
                const psId = ps._id;

                return (
                  <motion.div
                    key={item._id}
                    variants={cardVariants}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.99 }}
                    className="relative group/wish"
                  >
                    <PromptSetCard promptSet={ps} index={i} />

                    {/* Remove from wishlist overlay */}
                    <motion.button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(psId); }}
                      disabled={removingId === psId}
                      whileHover={{ scale: 1.08, borderColor: 'rgba(248,113,113,0.45)' }}
                      whileTap={{ scale: 0.92 }}
                      className="absolute top-3 right-12 z-20 w-8 h-8 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all opacity-0 group-hover/wish:opacity-100"
                      title={t('prompt_market.remove_wishlist') || 'Remove from wishlist'}
                    >
                      {removingId === psId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <motion.div
                variants={headerVariants}
                className="flex items-center justify-center gap-2 mt-10"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => setPage(p)}
                    whileHover={{ y: -2, scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-[#C9A84C] text-black'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:border-[#C9A84C]/30 hover:text-white/60'
                    }`}
                  >
                    {p}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PromptWishlistPage;
