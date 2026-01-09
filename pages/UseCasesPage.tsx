
import React from 'react';
import { USE_CASES } from '../data';
import { Link } from 'react-router-dom';
import { Megaphone, ShoppingCart, Gamepad, ArrowRight, Quote } from 'lucide-react';

const UseCasesPage = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Megaphone': return <Megaphone className="w-6 h-6 text-blue-400" />;
      case 'ShoppingCart': return <ShoppingCart className="w-6 h-6 text-green-400" />;
      case 'Gamepad': return <Gamepad className="w-6 h-6 text-purple-400" />;
      default: return <Megaphone className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Vertical Excellence</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">See how we've solved complex business problems across diverse industries with tailored AI implementation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {USE_CASES.map((uc) => (
            <div key={uc.id} className="glass-effect p-10 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="w-24 h-24" />
              </div>
              <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit">
                {getIcon(uc.icon)}
              </div>
              <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">{uc.industry}</div>
              <h3 className="text-xl font-bold mb-4">The Challenge</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed italic">"{uc.problem}"</p>
              
              <h3 className="text-xl font-bold mb-4">Our Solution</h3>
              <p className="text-gray-300 text-sm mb-8 leading-relaxed">{uc.solution}</p>
              
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 mt-auto">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Impact</div>
                <div className="text-sm font-semibold">{uc.outcome}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
          <h2 className="text-3xl font-bold mb-6">Our Philosophy on Industry AI</h2>
          <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            We don't believe in "one-size-fits-all" AI. Each industry has unique regulatory requirements, vocabulary, and data structures. Our process starts with deep vertical immersion to ensure the solution we build actually fits your business reality.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Marketing', 'Finance', 'Logistics', 'Retail', 'Education', 'Health', 'Media', 'DevOps'].map(ind => (
              <div key={ind} className="px-6 py-3 bg-black/40 rounded-xl text-sm font-bold border border-white/5 text-gray-500">
                {ind}
              </div>
            ))}
          </div>
          <Link to="/booking" className="mt-12 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-sm font-bold transition-all">
            Discuss Your Industry Use Case <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UseCasesPage;
