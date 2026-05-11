import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2, Trash2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { promptMarketApi } from '../../apis/prompt-market';
import type { PromptReview } from '../../types';

interface Props {
  promptSetId: string;
  hasPurchased: boolean;
}

function StarRating({
  value,
  onChange,
  size = 20,
  interactive = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-white/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PromptReviewSection({ promptSetId, hasPurchased }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<PromptReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews(1);
  }, [promptSetId]);

  async function loadReviews(p: number) {
    setLoading(true);
    const res = await promptMarketApi.getReviews(promptSetId, p, 10);
    setReviews(p === 1 ? res.data : [...reviews, ...res.data]);
    setAverageRating(res.averageRating);
    setReviewCount(res.reviewCount);
    setPage(p);
    setTotalPages(Math.ceil(res.pagination.total / res.pagination.limit));
    setLoading(false);
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError(t('promptReview.selectRating') || 'Please select a rating');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await promptMarketApi.submitReview(promptSetId, { rating, comment });
    if (res.success && res.data) {
      // Refresh reviews
      await loadReviews(1);
      setRating(0);
      setComment('');
    } else {
      setError(res.message || 'Failed to submit review');
    }
    setSubmitting(false);
  }

  async function handleDelete(reviewId: string) {
    const res = await promptMarketApi.deleteReview(reviewId);
    if (res.success) {
      await loadReviews(1);
    }
  }

  const userHasReviewed = reviews.some((r) => {
    const buyerId = typeof r.buyerId === 'object' ? r.buyerId._id : r.buyerId;
    return buyerId === user?._id;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {t('promptReview.title') || 'Reviews'}
        </h3>
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(averageRating)} size={16} />
            <span className="text-white/60 text-sm">
              {averageRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}
      </div>

      {/* Rating distribution bar */}
      {reviewCount > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{averageRating.toFixed(1)}</div>
              <StarRating value={Math.round(averageRating)} size={14} />
              <div className="text-xs text-white/40 mt-1">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit review form */}
      {hasPurchased && !userHasReviewed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-4"
        >
          <h4 className="text-sm font-medium text-white/80">
            {t('promptReview.writeReview') || 'Write a Review'}
          </h4>
          <StarRating value={rating} onChange={setRating} interactive size={28} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('promptReview.commentPlaceholder') || 'Share your experience with this prompt set...'}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-[#C9A84C]/50"
            rows={3}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-white text-sm font-medium hover:bg-[#C9A84C]/80 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {t('promptReview.submit') || 'Submit Review'}
          </button>
        </motion.div>
      )}

      {/* Review list */}
      <div className="space-y-3">
        <AnimatePresence>
          {reviews.map((review) => {
            const buyer =
              typeof review.buyerId === 'object' ? review.buyerId : null;
            const isOwn = buyer?._id === user?._id;

            return (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {buyer?.avatar ? (
                      <img
                        src={buyer.avatar}
                        alt={buyer.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 flex items-center justify-center ring-1 ring-white/10">
                        <User className="w-3.5 h-3.5 text-[#C9A84C]/70" />
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-white/80 font-medium">
                        {buyer?.name || 'User'}
                      </span>
                      <span className="text-xs text-white/30 ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} size={14} />
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-white/50 leading-relaxed pl-9">
                    {review.comment}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin text-white/30" />
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-center text-white/30 text-sm py-6">
            {t('promptReview.noReviews') || 'No reviews yet. Be the first to review!'}
          </p>
        )}

        {page < totalPages && !loading && (
          <button
            onClick={() => loadReviews(page + 1)}
            className="w-full py-2.5 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            {t('promptReview.loadMore') || 'Load more reviews'}
          </button>
        )}
      </div>
    </div>
  );
}
