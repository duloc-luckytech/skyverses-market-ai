
import React, { useState, useEffect } from 'react';
import { EventStudioWorkspace } from '../../components/NoelStudioWorkspace';
import { TetHero } from '../../components/tet-generator/TetHero';
import { TetShowcase } from '../../components/tet-generator/TetShowcase';
import { TetBenefits } from '../../components/tet-generator/TetBenefits';
import { EVENT_CONFIGS } from '../../constants/event-configs';

const AITetGenerator = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTetImages = async () => {
      try {
        const response = await fetch('https://api.skyverses.com/explorer?page=1&limit=10&search=tet');
        const result = await response.json();
        if (result.data) setImages(result.data);
      } catch (error) {
        console.error("Failed to fetch Tet samples:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTetImages();
  }, []);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <EventStudioWorkspace config={EVENT_CONFIGS.tet} onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#fdfdfe] dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-red-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-red-500/10 rounded-full blur-[200px]"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[200px]"></div>
        </div>
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <TetHero onStartStudio={() => setIsStudioOpen(true)} />
          <TetShowcase images={images} loading={loading} />
        </div>
      </section>
      <TetBenefits />
    </div>
  );
};

export default AITetGenerator;
