import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowLeft,
  User,
  Star,
  ShoppingBag,
  FileText,
  Calendar,
  BadgeCheck,
  Crown,
  TrendingUp,
  Zap,
  UserPlus,
  UserMinus,
  Globe,
  ExternalLink,
  ChevronRight,
  Users,
  Award,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { promptMarketApi } from '../apis/prompt-market';
import PromptSetCard from '../components/prompt-market/PromptSetCard';
import type { SellerProfile, SellerBadge } from '../types';

/* ─── helpers ─── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const BADGE_CONFIG: Record<SellerBadge['type'], { icon: React.ReactNode; color: string; bg: string }> = {
  verified: {
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
    color: 'text-[#C9A84C]',
    bg: 'bg-[#C9A84C]/10 border-[#C9A84C]/20',
  },
  pro: {
    icon: <Crown className="w-3.5 h-3.5" />,
    color: 'text-[#E5C767]',
    bg: 'bg-[#E5C767]/10 border-[#E5C767]/20',
  },
  top_seller: {
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  rising_star: {
    icon: <Zap className="w-3.5 h-3.5" />,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
  },
};

/* ─── Stat Card ─── */
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({
  icon, label, value,
}) => (
  <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
    <span className="text-[#C9A84C]/60">{icon}</span>
    <span className="text-lg font-bold text-white">{value}</span>
    <span className="text-[11px] text-white/30 uppercase tracking-wider">{label}</span>
  </div>
);

/* ═══════════════════════════════════════════════════
 * PromptSellerProfilePage
 * Route: /prompt-market/seller/:sellerId
 * ═══════════════════════════════════════════════════ */
const PromptSellerProfilePage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const { t, lang } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'newest'>('all');

  useEffect(() => {
    if (!sellerId) return;
    const load = async () => {
      setLoading(true);
      const [profileRes, followRes] = await Promise.all([
        promptMarketApi.getSellerProfile(sellerId),
        isAuthenticated
          ? promptMarketApi.checkFollowing(sellerId)
          : Promise.resolve({ following: false }),
      ]);
      const d = profileRes.data;
      const merged = d ? { ...d, ...d.stats } : null;
      setProfile(merged);
      setFollowing(followRes.following);
      setFollowerCount(d?.stats?.followerCount ?? 0);
      setLoading(false);
    };
    load();
  }, [sellerId, isAuthenticated]);

  const handleToggleFollow = async () => {
    if (!sellerId || !isAuthenticated || followLoading) return;
    setFollowLoading(true);
    const res = await promptMarketApi.toggleFollowSeller(sellerId);
    if (res.success) {
      setFollowing(res.following);
      setFollowerCount(res.followerCount);
    }
    setFollowLoading(false);
  };

  const loc = (obj: { en: string; vi: string; ko: string; ja: string } | undefined) =>
    obj ? (obj[lang as keyof typeof obj] || obj.en) : '';

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-white/25 animate-pulse">
          Loading profile...
        </span>
      </div>
    );
  }

  /* ── not found ── */
  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <User className="w-16 h-16 text-white/10" />
        <h2 className="text-2xl font-bold text-white">Seller Not Found</h2>
        <p className="text-white/35 max-w-sm">
          This seller profile doesn&apos;t exist or has been removed.
        </p>
        <Link
          to="/prompt-market"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-black font-medium hover:bg-[#B8963F] transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Market
        </Link>
      </div>
    );
  }

  /* ── sorted listings ── */
  const sortedListings = [...profile.listings].sort((a, b) => {
    if (activeTab === 'popular') return b.purchaseCount - a.purchaseCount;
    if (activeTab === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  return (
    <div className="min-h-screen bg-[var(--atlas-bg-page)] text-white">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-white/[0.04] bg-[var(--atlas-bg-page)]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/35">
          <Link to="/prompt-market" className="hover:text-white/60 transition-colors">
            Prompt Market
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
          <span className="text-white/60 truncate">{profile.name}</span>
        </div>
      </div>

      {/* ── Hero Profile ── */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-40 sm:h-52 bg-gradient-to-br from-[#C9A84C]/15 via-[#8B7635]/10 to-[#060608]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-end">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg object-cover ring-4 ring-[#060608] shadow-atlas-lg"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center ring-4 ring-[#060608] shadow-atlas-lg">
                  <User className="w-12 h-12 text-[#C9A84C]/40" />
                </div>
              )}
            </motion.div>

            {/* Name + badges + follow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex-1 min-w-0 pb-1"
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.name}</h1>
                {profile.verified && (
                  <BadgeCheck className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                )}
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {profile.badges.map((badge) => {
                    const cfg = BADGE_CONFIG[badge.type];
                    return (
                      <span
                        key={badge.type}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${cfg.color} ${cfg.bg}`}
                      >
                        {cfg.icon}
                        {badge.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Follow button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex-shrink-0 sm:pb-1"
            >
              {isAuthenticated && (
                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                    following
                      ? 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:border-red-500/30 hover:text-red-400'
                      : 'bg-[#C9A84C] text-black hover:bg-[#B8963F] shadow-[0_0_20px_rgba(201,168,76,0.2)]'
                  }`}
                >
                  {following ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      {t('prompt_market.following') || 'Following'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {t('prompt_market.follow') || 'Follow'}
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </div>

          {/* Bio + Social */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-5 max-w-2xl"
          >
            {profile.bio && (
              <p className="text-white/45 text-sm leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-[12px] text-white/30">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {fmtDate(profile.joinedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {followerCount.toLocaleString()} {t('prompt_market.followers') || 'followers'}
              </span>
              {profile.socialLinks?.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[#C9A84C] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8"
          >
            <StatCard
              icon={<FileText className="w-5 h-5" />}
              label={t('prompt_market.listings') || 'Listings'}
              value={profile.totalListings}
            />
            <StatCard
              icon={<ShoppingBag className="w-5 h-5" />}
              label={t('prompt_market.total_sales') || 'Total Sales'}
              value={profile.totalSales.toLocaleString()}
            />
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label={t('prompt_market.avg_rating') || 'Avg Rating'}
              value={profile.totalReviews > 0 ? profile.averageRating.toFixed(1) : '—'}
            />
            <StatCard
              icon={<Award className="w-5 h-5" />}
              label={t('prompt_market.reviews') || 'Reviews'}
              value={profile.totalReviews.toLocaleString()}
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label={t('prompt_market.followers') || 'Followers'}
              value={followerCount.toLocaleString()}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Listings Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-white/[0.04] mb-6">
          {(['all', 'popular', 'newest'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[#C9A84C] text-[#C9A84C]'
                  : 'border-transparent text-white/35 hover:text-white/60'
              }`}
            >
              {tab === 'all'
                ? t('prompt_market.all_listings') || 'All Listings'
                : tab === 'popular'
                ? t('prompt_market.most_popular') || 'Most Popular'
                : t('prompt_market.newest') || 'Newest'}
            </button>
          ))}
          <span className="ml-auto text-xs text-white/20">
            {profile.totalListings} {t('prompt_market.results') || 'results'}
          </span>
        </div>

        {/* Grid */}
        {sortedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortedListings.map((ps, i) => (
              <PromptSetCard key={ps._id} promptSet={ps} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">
              {t('prompt_market.no_listings') || 'No listings yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptSellerProfilePage;
