import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { promptMarketApi } from "../apis/prompt-market";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface PromptVariable {
  name: string;
  description: string;
  defaultValue: string;
}

interface PromptItem {
  title: string;
  content: string;
  description: string;
  variables: PromptVariable[];
}

interface LocalizedString {
  en: string;
  vi?: string;
  ko?: string;
  ja?: string;
}

interface PromptSet {
  _id: string;
  title: LocalizedString;
  description: LocalizedString;
  category: string;
  prompts: PromptItem[];
  coverImage?: string;
  sellerId: { _id: string; name: string; avatar?: string } | string;
}

interface PromptPurchase {
  _id: string;
  buyerId: string;
  sellerId: string;
  promptSetId: PromptSet | string;
  pricePaid: number;
  sellerReceived: number;
  platformFee: number;
  createdAt: string;
}

interface PurchaseDetail {
  purchase: PromptPurchase;
  promptSet: PromptSet;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function localizedText(
  field: LocalizedString | undefined,
  language: string
): string {
  if (!field) return "";
  return (
    field[language as keyof LocalizedString] ||
    field.en ||
    ""
  );
}

function formatDate(iso: string, language: string): string {
  return new Date(iso).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPopulatedSet(purchase: PromptPurchase): PromptSet | null {
  if (
    purchase.promptSetId &&
    typeof purchase.promptSetId === "object" &&
    "_id" in purchase.promptSetId
  ) {
    return purchase.promptSetId as PromptSet;
  }
  return null;
}

/* ─── CopyButton ─────────────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ─── PromptCard ─────────────────────────────────────────────────────── */

function PromptCard({ prompt }: { prompt: PromptItem }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8">
        <p className="text-sm font-semibold text-white">{prompt.title}</p>
        {prompt.description && (
          <p className="text-xs text-white/50 mt-0.5">{prompt.description}</p>
        )}
      </div>

      {/* Content block */}
      <div className="relative">
        <pre className="px-4 py-3 text-xs text-white/80 font-mono whitespace-pre-wrap break-words leading-relaxed overflow-x-auto bg-black/40">
          {prompt.content}
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={prompt.content} />
        </div>
      </div>

      {/* Variables */}
      {prompt.variables && prompt.variables.length > 0 && (
        <div className="px-4 py-3 border-t border-white/8 flex flex-wrap gap-2">
          {prompt.variables.map((v, idx) => (
            <span
              key={idx}
              title={v.description}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#7036F0]/15 text-[#a78bfa] border border-[#7036F0]/30"
            >
              <span className="opacity-60">{"{"}</span>
              {v.name}
              <span className="opacity-60">{"}"}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PurchaseCard ───────────────────────────────────────────────────── */

function PurchaseCard({
  purchase,
  language,
}: {
  purchase: PromptPurchase;
  language: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<PurchaseDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const populatedSet = getPopulatedSet(purchase);
  const title = populatedSet
    ? localizedText(populatedSet.title, language)
    : "Prompt Set";
  const category = populatedSet?.category ?? "";

  const handleToggle = useCallback(async () => {
    if (!expanded && !detail) {
      setLoadingDetail(true);
      setDetailError(null);
      try {
        const res = await promptMarketApi.getMyPurchaseDetail(purchase._id);
        if (res.data) {
          setDetail(res.data);
        } else {
          setDetailError("Could not load details.");
        }
      } catch {
        setDetailError("Failed to load details. Please try again.");
      } finally {
        setLoadingDetail(false);
      }
    }
    setExpanded((prev) => !prev);
  }, [expanded, detail, purchase._id]);

  const displaySet = detail?.promptSet ?? populatedSet;

  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
    >
      {/* Card header / clickable row */}
      <button
        onClick={handleToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors"
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#7036F0]/20 flex items-center justify-center">
          <Package className="w-5 h-5 text-[#7036F0]" />
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {category && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/8 text-white/50">
                {category}
              </span>
            )}
            <span className="text-[11px] text-white/40">
              {formatDate(purchase.createdAt, language)}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right mr-3">
          <p className="text-sm font-bold text-[#a78bfa]">
            {purchase.pricePaid === 0 ? 'Free' : `${purchase.pricePaid.toLocaleString()} SKT`}
          </p>
          <p className="text-[11px] text-white/40">paid</p>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 text-white/40">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/8 pt-4 space-y-4">
              {/* Loading */}
              {loadingDetail && (
                <div className="flex items-center gap-2 text-white/50 text-sm py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading prompts…
                </div>
              )}

              {/* Error */}
              {detailError && !loadingDetail && (
                <p className="text-red-400 text-sm text-center py-4">
                  {detailError}
                </p>
              )}

              {/* Description */}
              {!loadingDetail && displaySet && (
                <>
                  {displaySet.description && (
                    <p className="text-xs text-white/50 leading-relaxed">
                      {localizedText(displaySet.description, language)}
                    </p>
                  )}

                  {/* Prompts */}
                  {displaySet.prompts && displaySet.prompts.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                        {displaySet.prompts.length} Prompt
                        {displaySet.prompts.length !== 1 ? "s" : ""}
                      </p>
                      {displaySet.prompts.map((prompt, idx) => (
                        <PromptCard key={idx} prompt={prompt} />
                      ))}
                    </div>
                  ) : (
                    !loadingDetail && (
                      <p className="text-xs text-white/40 text-center py-4">
                        No prompts in this set.
                      </p>
                    )
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */

export default function MyPromptPurchasesPage() {
  const { t, lang } = useLanguage();
  const { isAuthenticated, login } = useAuth();

  const [purchases, setPurchases] = useState<PromptPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchPurchases = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await promptMarketApi.getMyPurchases(pageNum, LIMIT);
        setPurchases(res.data);
        setTotal(res.pagination.total);
      } catch {
        setError("Failed to load purchases. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchPurchases(page);
    }
  }, [isAuthenticated, page, fetchPurchases]);

  const totalPages = Math.ceil(total / LIMIT);

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black/95 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#7036F0]/20 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-[#7036F0]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {t("myPurchases.authTitle") || "Sign in to view your purchases"}
            </h1>
            <p className="text-sm text-white/50 mt-2">
              {t("myPurchases.authDesc") ||
                "You need to be logged in to see your purchased prompt sets."}
            </p>
          </div>
          <button
            onClick={login}
            className="w-full py-2.5 rounded-xl bg-[#7036F0] hover:bg-[#5f2de0] text-white text-sm font-semibold transition-colors"
          >
            {t("common.login") || "Log In"}
          </button>
          <Link
            to="/prompt-market"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("myPurchases.backToMarket") || "Back to Marketplace"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/95 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <Link
            to="/prompt-market"
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("myPurchases.backToMarket") || "Marketplace"}
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t("myPurchases.title") || "My Purchased Prompts"}
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {t("myPurchases.subtitle") ||
                "All prompt sets you've purchased — click a card to reveal full content."}
            </p>
          </div>
          {total > 0 && (
            <span className="flex-shrink-0 mt-1 text-xs px-3 py-1 rounded-full bg-[#7036F0]/15 text-[#a78bfa] border border-[#7036F0]/25">
              {total} {total === 1 ? "purchase" : "purchases"}
            </span>
          )}
        </div>

        {/* ── Loading (initial) ── */}
        {loading && purchases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/40">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">
              {t("common.loading") || "Loading…"}
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => fetchPurchases(page)}
              className="mt-4 text-xs text-white/50 hover:text-white/80 underline transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && purchases.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Package className="w-8 h-8 text-white/20" />
            </div>
            <div>
              <p className="text-base font-semibold text-white/60">
                {t("myPurchases.empty") || "No purchases yet"}
              </p>
              <p className="text-sm text-white/30 mt-1">
                {t("myPurchases.emptyDesc") ||
                  "When you buy a prompt set it will appear here."}
              </p>
            </div>
            <Link
              to="/prompt-market"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7036F0] hover:bg-[#5f2de0] text-white text-sm font-semibold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {t("myPurchases.browse") || "Browse Marketplace"}
            </Link>
          </motion.div>
        )}

        {/* ── Purchases list ── */}
        {purchases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase._id}
                purchase={purchase}
                language={lang}
              />
            ))}
          </motion.div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <span className="text-sm text-white/40">
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
