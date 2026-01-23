
import React, { useState, useEffect } from 'react';
import BirthdayStudioWorkspace from '../../components/BirthdayStudioWorkspace';
import { BirthdayHero } from '../../components/birthday-generator/BirthdayHero';
import { BirthdayShowcase } from '../../components/birthday-generator/BirthdayShowcase';
import { BirthdayBenefits } from '../../components/birthday-generator/BirthdayBenefits';

const AIBirthdayGenerator = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdayImages = async () => {
      try {
        const response = await fetch('https://api.skyverses.com/explorer?page=1&limit=10&search=birthday');
        const result = await response.json();
        if (result.data) setImages(result.data);
      } catch (error) {
        console.error("Failed to fetch Birthday samples:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBirthdayImages();
  }, []);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <BirthdayStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#fdfdfe] dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-[200px]"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-pink-600/10 rounded-full blur-[200px]"></div>
        </div>
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <BirthdayHero onStartStudio={() => setIsStudioOpen(true)} />
          <BirthdayShowcase images={images} loading={loading} />
        </div>
      </section>
      <BirthdayBenefits />
    </div>
  );
};

export default AIBirthdayGenerator;
