import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { HomeBlock, Language, Solution } from '../../../types';
import { CardSkeleton } from '../../market/MarketSkeleton';
import { SolutionCard } from '../../market/SolutionCard';
import LazySection from '../LazySection';
import { MotionChip } from './shared';

type CmsBlockSectionProps = {
  solutions: Solution[];
  homeBlocks: HomeBlock[];
  loading: boolean;
  favorites: string[];
  likedItems: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onNavigateProduct: (slug: string) => void;
  onHoverProduct: (slug: string) => void;
  onQuickView: (e: React.MouseEvent, sol: Solution) => void;
  getStats: (id: string) => { users: string; likes: string };
};

const CmsBlockSection: React.FC<CmsBlockSectionProps> = ({
  solutions,
  homeBlocks,
  loading,
  favorites,
  likedItems,
  onToggleFavorite,
  onToggleLike,
  onNavigateProduct,
  onHoverProduct,
  onQuickView,
  getStats,
}) => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const currentLang = lang as Language;

  return (
    <LazySection rootMargin="300px" minHeight={420}>
      <section className="bg-white px-5 py-16 md:px-8 lg:px-16">
        <div className="mx-auto max-w-[1300px]">
          <div className="mb-5 flex flex-wrap gap-2">
            <MotionChip name="hover-lift" />
            <MotionChip name="stagger-children" />
          </div>
          {homeBlocks.map((block, blockIdx) => {
            const blockSols = solutions.filter((solution) => solution.homeBlocks?.includes(block.key));
            if (blockSols.length === 0 && !loading) return null;
            return (
              <div key={block.key} className={blockIdx > 0 ? 'mt-14' : ''}>
                <div className="mb-7 flex items-end justify-between gap-5">
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-blue">CMS HomeBlock</span>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#1a2330] md:text-3xl">
                      {block.title?.[currentLang] || block.title?.en}
                    </h3>
                    {block.subtitle && (
                      <p className="mt-2 text-sm text-[#1a2330]/55 md:text-base">{block.subtitle[currentLang] || block.subtitle.en}</p>
                    )}
                  </div>
                  <div className="hidden items-center gap-2 md:flex">
                    <button className="rounded-full border border-black/10 p-2 text-[#1a2330]/60"><ChevronLeft size={16} /></button>
                    <button className="rounded-full border border-black/10 p-2 text-[#1a2330]/60"><ChevronRight size={16} /></button>
                    <button onClick={() => navigate('/markets')} className="ml-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:gap-2.5">
                      View All <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                    : blockSols.slice(0, block.limit || 8).map((sol, idx) => (
                      <SolutionCard
                        key={sol._id || sol.id}
                        sol={sol}
                        idx={idx}
                        lang={lang}
                        isLiked={likedItems.includes(sol._id || sol.id)}
                        isFavorited={favorites.includes(sol._id || sol.id)}
                        onToggleFavorite={onToggleFavorite}
                        onToggleLike={onToggleLike}
                        onClick={onNavigateProduct}
                        onHover={onHoverProduct}
                        onQuickView={onQuickView}
                        stats={getStats(sol._id || sol.id)}
                      />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </LazySection>
  );
};

export default CmsBlockSection;
