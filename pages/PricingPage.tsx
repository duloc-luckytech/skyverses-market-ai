
import React from 'react';
import { PRICING_PACKAGES } from '../data';
import { Link } from 'react-router-dom';
import { Check, Info, ArrowRight, HelpCircle } from 'lucide-react';

const PricingPage = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Indicative Investment</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            AI development is a high-impact capital investment. Below are reference ranges based on typical projects. All engagements are custom-quoted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {PRICING_PACKAGES.map((pkg, i) => (
            <div key={i} className={`glass-effect p-10 rounded-3xl flex flex-col relative ${pkg.name.includes('Bespoke') ? 'border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-105 z-10' : ''}`}>
              {pkg.name.includes('Bespoke') && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Most Common</div>
              )}
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <div className="text-3xl font-black text-blue-500 mb-4">{pkg.priceRange}</div>
              <p className="text-gray-400 text-sm mb-8 min-h-[60px]">{pkg.description}</p>
              
              <div className="space-y-4 mb-10 flex-grow">
                {pkg.features.map((feat, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>

              <Link to="/booking" className={`w-full text-center py-4 rounded-xl font-bold transition-all ${pkg.name.includes('Bespoke') ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                Request Custom Quote
              </Link>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="glass-effect p-12 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-500" /> Cost Factors
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Model Selection', desc: 'SaaS vs Open Source vs Fine-tuned models vary significantly in R&D and inferencing costs.' },
                { title: 'Data Complexity', desc: 'The volume and structure of your existing data impacts the engineering required for cleaning and RAG implementation.' },
                { title: 'Integration Depth', desc: 'Connecting to legacy systems via custom APIs increases the complexity of the security and connectivity layer.' },
                { title: 'UX Requirements', desc: 'Bespoke dashboards and mobile interfaces add design and frontend development cycles.' },
              ].map((item, i) => (
                <div key={i}>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-effect p-8 rounded-3xl border-dashed">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" /> Engagement FAQ
              </h3>
              <div className="space-y-4">
                <details className="group cursor-pointer">
                  <summary className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Do you offer monthly subscription models?</summary>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">No. We are a service agency. We build and deploy systems that you own or license. We offer ongoing maintenance SLAs, but we do not sell standardized SaaS seats.</p>
                </details>
                <details className="group cursor-pointer">
                  <summary className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">How long does a quote take?</summary>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">After an initial strategy call, we provide a detailed technical proposal and budget breakdown within 48 to 72 hours.</p>
                </details>
                <details className="group cursor-pointer">
                  <summary className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Can we use our own API keys?</summary>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">Yes. We can architect the system to run on your infrastructure (GCP, AWS, Azure) using your enterprise API accounts for complete cost transparency.</p>
                </details>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl text-white">
              <h3 className="text-xl font-bold mb-2">Non-Profit & Startup?</h3>
              <p className="text-blue-100 text-sm mb-6">We dedicate 10% of our capacity to high-impact social projects and early-stage bootstrapped ventures. Contact us for reduced-rate programs.</p>
              <Link to="/contact" className="text-white font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
                Inquire about programs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
