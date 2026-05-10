import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, User, FileText, AlertTriangle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { promptMarketApi } from '../../apis/prompt-market';
import type { PromptSet } from '../../types';

interface Props {
  promptSet: PromptSet;
  userBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export const PromptPurchaseModal: React.FC<Props> = ({
  promptSet,
  userBalance,
  onClose,
  onSuccess,
}) => {
  const { t, lang } = useLanguage();
  const { refreshSkyTokenBalance } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = promptSet.title[lang] || promptSet.title.en || '';
  const sellerName =
    typeof promptSet.sellerId === 'string'
      ? promptSet.sellerId
      : promptSet.sellerId.name;
  const promptCount = promptSet.prompts.length;
  const price = promptSet.priceSKT;
  const balanceAfter = userBalance - price;
  const canAfford = userBalance >= price;

  const handleConfirm = async () => {
    if (!canAfford || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await promptMarketApi.purchase(promptSet._id);
      if (res.success) {
        const newBalance = res.skyTokenBalance ?? balanceAfter;
        refreshSkyTokenBalance();
        onSuccess(newBalance);
      } else {
        setError(res.message ?? t('purchase_failed'));
      }
    } catch {
      setError(t('purchase_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal card */}
        <motion.div
          className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white font-sans">
              {t('confirm_purchase')}
            </h2>
            <p className="text-sm text-white/50 mt-0.5 font-sans">
              {t('review_purchase_details')}
            </p>
          </div>

          {/* Prompt set info */}
          <div className="bg-white/5 border border-white/8 rounded-xl p-4 mb-4 space-y-3">
            {/* Title */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-mono mb-0.5">
                {t('prompt_set')}
              </p>
              <p className="text-white font-semibold text-sm leading-snug font-sans line-clamp-2">
                {title}
              </p>
            </div>

            <div className="h-px bg-white/8" />

            {/* Seller */}
            <div className="flex items-center gap-2">
              <User size={14} className="text-white/40 shrink-0" />
              <span className="text-xs text-white/50 font-sans">{t('seller')}:</span>
              <span className="text-xs text-white/80 font-sans font-medium">{sellerName}</span>
            </div>

            {/* Prompt count */}
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-white/40 shrink-0" />
              <span className="text-xs text-white/50 font-sans">{t('prompts_included')}:</span>
              <span className="text-xs text-white/80 font-sans font-medium">
                {promptCount} {t('prompts')}
              </span>
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-white/5 border border-white/8 rounded-xl p-4 mb-4 space-y-2.5">
            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 font-sans">{t('price')}</span>
              <div className="flex items-center gap-1.5">
                <Coins size={14} className="text-yellow-400" />
                <span className="text-sm font-semibold text-white font-mono">
                  {price.toLocaleString()} SKT
                </span>
              </div>
            </div>

            {/* Current balance */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 font-sans">{t('your_balance')}</span>
              <div className="flex items-center gap-1.5">
                <Coins size={14} className="text-white/40" />
                <span className="text-sm text-white/80 font-mono">
                  {userBalance.toLocaleString()} SKT
                </span>
              </div>
            </div>

            <div className="h-px bg-white/8" />

            {/* Balance after */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/80 font-sans">{t('balance_after')}</span>
              <div className="flex items-center gap-1.5">
                <Coins size={14} className={canAfford ? 'text-green-400' : 'text-red-400'} />
                <span
                  className={`text-sm font-semibold font-mono ${
                    canAfford ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {canAfford ? balanceAfter.toLocaleString() : '–'} SKT
                </span>
              </div>
            </div>
          </div>

          {/* Platform fee note */}
          <p className="text-xs text-white/30 font-sans mb-4 text-center">
            {t('platform_fee_note') || '10% platform fee included'}
          </p>

          {/* Insufficient balance warning */}
          {!canAfford && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-400 font-sans font-medium">
                  {t('insufficient_balance')}
                </p>
                <Link
                  to="/skytoken"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200 transition-colors mt-0.5 font-sans underline underline-offset-2"
                >
                  {t('top_up_now')}
                  <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 font-sans">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors font-sans disabled:opacity-50"
            >
              {t('cancel')}
            </button>

            <button
              onClick={handleConfirm}
              disabled={!canAfford || loading}
              className="flex-1 py-2.5 rounded-xl bg-[#7036F0] hover:bg-[#7036F0]/80 text-white text-sm font-semibold font-sans transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t('purchasing')}
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  {t('confirm_purchase')}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptPurchaseModal;
