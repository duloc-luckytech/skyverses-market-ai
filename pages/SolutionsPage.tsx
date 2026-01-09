
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../data';
import { ArrowRight, Filter, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SolutionsPage = () => {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Fixed: s.category is LocalizedString, extract 'en' for logic to avoid comparison errors
  const categories = ['All', ...new Set(SOLUTIONS.map(s => s.category.en))];
  
  // Fixed: filter based on s.category.en against activeCategory string
  const filteredSolutions = activeCategory === 'All' 
    ? SOLUTIONS 
    : SOLUTIONS.filter(s => s.category.en === activeCategory);

  return (
    <div className="pt-32 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our AI Solutions</h1>
          <p className="text-gray-400 max-w-2xl">Proven architectures ready for deployment and customization within your existing business environment.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <div className="flex items-center gap-2 text-gray-400 text-sm mr-4">
            <Filter className="w-4 h-4" /> Filter by:
          </div>
          {categories.map((cat) => {
            // Localize category label for display using current language
            const label = cat === 'All' ? 'All' : SOLUTIONS.find(s => s.category.en === cat)?.category[lang] || cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSolutions.map((sol) => (
            <div key={sol.id} className="glass-effect rounded-3xl overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all">
              <div className="h-64 overflow-hidden relative">
                {/* Fixed: Localize alt text from sol.name */}
                <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-white/10">
                  {/* Fixed: Localize category label */}
                  {sol.category[lang]}
                </div>
              </div>
              <div className="p-8 flex-grow">
                {/* Fixed: Localize product name */}
                <h3 className="text-2xl font-bold mb-3">{sol.name[lang]}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {/* Fixed: Localize product description */}
                  {sol.description[lang]}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Ideal Industries</span>
                    <div className="flex flex-wrap gap-2">
                      {sol.industries.map(ind => (
                        <span key={ind} className="bg-white/5 px-3 py-1 rounded-lg text-xs text-gray-300 border border-white/5">{ind}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                  <Link to={`/solution/${sol.slug}`} className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    View Demo & Detail <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to="/booking" className="w-full sm:w-auto text-center bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm font-bold">
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-blue-900/10 border border-blue-500/20 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Can't find exactly what you need?</h3>
            <p className="text-gray-400">Our core strength is in rapid bespoke development. Tell us your challenge and we'll architect a solution.</p>
          </div>
          <Link to="/booking" className="whitespace-nowrap bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
            Talk to an Architect <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;
