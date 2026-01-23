
import React from 'react';
import { Solution, Language } from '../../types';
import { SolutionCard } from './SolutionCard';

interface SolutionListProps {
  solutions: Solution[];
  lang: string;
  likedItems: string[];
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onNavigate: (slug: string) => void;
  getFakeStats: (id: string) => { users: string; likes: string };
}

export const SolutionList: React.FC<SolutionListProps> = ({
  solutions,
  lang,
  likedItems,
  favorites,
  onToggleFavorite,
  onToggleLike,
  onNavigate,
  getFakeStats
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 animate-in fade-in duration-700">
      {solutions.map((sol, idx) => (
        <SolutionCard 
          key={sol._id || sol.id} 
          sol={sol} 
          idx={idx} 
          lang={lang} 
          isLiked={likedItems.includes(sol._id || sol.id)}
          isFavorited={favorites.includes(sol.id)}
          onToggleFavorite={onToggleFavorite}
          onToggleLike={onToggleLike}
          onClick={onNavigate}
          stats={getFakeStats(sol._id || sol.id)}
          isGrid={true}
        />
      ))}
    </div>
  );
};
