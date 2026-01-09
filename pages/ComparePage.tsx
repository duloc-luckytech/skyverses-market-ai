
import React, { useState } from 'react';
import { SOLUTIONS } from '../data';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, Minus, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ComparePage = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([SOLUTIONS[0].id, SOLUTIONS[1].id]);
  const { lang } = useLanguage();

  const toggleSolution = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < 3) setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedSolutions = SOLUTIONS.filter(s => selectedIds.includes(s.id));

  const features = [
    "Fine-tuning Required",
    "Security Scrubbing",
    "Custom UI Layer",
    "API Integrations",
    "Mobile Ready",
    "On-premise Support"
  ];

  return (
    <div className="pt-32 pb-24 bg-[#020617] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <Link to="/market" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Compare Solutions</h1>
          <p className="text-gray-400 max-w-2xl">Analyze technical differences and suitability across our ecosystem. Select up to 3 products.</p>
        </div>

        {/* Selection Bar */}
        <div className="flex flex-wrap gap-3 mb-12">
          {SOLUTIONS.map(sol => (
            <button
              key={sol.id}
              onClick={() => toggleSolution(sol.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedIds.includes(sol.id) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
            >
              {selectedIds.includes(sol.id) && <Check className="w-3 h-3 inline mr-2" />}
              {/* Fix: name is a LocalizedString object, use lang index for rendering */}
              {sol.name[lang]}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-6 text-left border-b border-white/5 bg-white/2 rounded-tl-3xl w-64">Metric</th>
                {selectedSolutions.map(sol => (
                  <th key={sol.id} className="p-6 text-left border-b border-white/5 bg-white/2 min-w-[280px]">
                    <div className="flex flex-col">
                      {/* Fix: category is a LocalizedString object, use lang index for rendering */}
                      <span className="text-blue-500 text-[10px] font-black uppercase mb-1">{sol.category[lang]}</span>
                      {/* Fix: name is a LocalizedString object, use lang index for rendering */}
                      <span className="text-xl font-bold mb-4">{sol.name[lang]}</span>
                      <Link to={`/product/${sol.slug}`} className="text-xs text-blue-400 font-bold hover:underline">View Detail</Link>
                    </div>
                  </th>
                ))}
                {Array.from({length: 3 - selectedSolutions.length}).map((_, i) => (
                  <th key={i} className="p-6 border-b border-white/5 bg-white/1 opacity-20">
                    <span className="text-xs text-gray-600">Empty Slot</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Category: Basics */}
              <tr>
                <td className="p-6 border-b border-white/5 font-bold text-gray-500 text-xs uppercase tracking-widest">Complexity</td>
                {selectedSolutions.map(sol => (
                  <td key={sol.id} className="p-6 border-b border-white/5 text-sm">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${sol.complexity === 'Enterprise' ? 'bg-purple-500/10 text-purple-400' : sol.complexity === 'Advanced' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                      {sol.complexity}
                    </span>
                  </td>
                ))}
                {Array.from({length: 3 - selectedSolutions.length}).map((_, i) => <td key={i} className="p-6 border-b border-white/5"></td>)}
              </tr>
              <tr>
                <td className="p-6 border-b border-white/5 font-bold text-gray-500 text-xs uppercase tracking-widest">Est. Deployment</td>
                {selectedSolutions.map(sol => (
                  <td key={sol.id} className="p-6 border-b border-white/5 text-sm text-gray-300">
                    {sol.complexity === 'Enterprise' ? '8-12 Weeks' : sol.complexity === 'Advanced' ? '4-6 Weeks' : '2-3 Weeks'}
                  </td>
                ))}
                {Array.from({length: 3 - selectedSolutions.length}).map((_, i) => <td key={i} className="p-6 border-b border-white/5"></td>)}
              </tr>
              <tr>
                <td className="p-6 border-b border-white/5 font-bold text-gray-500 text-xs uppercase tracking-widest">Pricing Start</td>
                {selectedSolutions.map(sol => (
                  <td key={sol.id} className="p-6 border-b border-white/5 text-sm font-bold text-white">
                    {sol.priceReference}
                  </td>
                ))}
                {Array.from({length: 3 - selectedSolutions.length}).map((_, i) => <td key={i} className="p-6 border-b border-white/5"></td>)}
              </tr>
              {/* Feature Matrix */}
              {features.map((feat, i) => (
                <tr key={feat}>
                  <td className="p-6 border-b border-white/5 text-sm font-medium text-gray-400">{feat}</td>
                  {selectedSolutions.map(sol => (
                    <td key={sol.id} className="p-6 border-b border-white/5">
                      {/* Simulating variation for demo purposes */}
                      {(sol.complexity === 'Enterprise' || (sol.complexity === 'Advanced' && i % 2 === 0)) ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Minus className="w-5 h-5 text-gray-700" />
                      )}
                    </td>
                  ))}
                  {Array.from({length: 3 - selectedSolutions.length}).map((_, i) => <td key={i} className="p-6 border-b border-white/5"></td>)}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-6 rounded-bl-3xl"></td>
                {selectedSolutions.map(sol => (
                  <td key={sol.id} className="p-6">
                    <Link to="/booking" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-bold text-xs inline-block transition-all">
                      Request Consultation
                    </Link>
                  </td>
                ))}
                {Array.from({length: 3 - selectedSolutions.length}).map((_, i) => <td key={i} className="p-6"></td>)}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
