
import React from 'react';
import { Cpu, Users, Eye, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mission */}
        <div className="text-center mb-24">
          <div className="p-3 bg-blue-600 rounded-2xl w-fit mx-auto mb-8">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8">Nexus Intelligence</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We are a high-performance AI agency dedicated to bridging the gap between cutting-edge research and real-world business ROI.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
            <img src="https://picsum.photos/seed/team/800/600" alt="Our Team" className="relative rounded-3xl border border-white/10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Philosophy</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Founded in 2017, NexusAI started with a simple belief: AI should be invisible, helpful, and measurable. We moved away from the hype cycles to focus on building "hard" engineering solutions that solve genuine friction in enterprise workflows.
            </p>
            <p className="text-gray-400 leading-relaxed">
              We don't believe in AI replacement; we believe in AI augmentation. Our tools are designed to amplify human capability, allowing your experts to focus on strategy while our systems handle the high-volume execution.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="glass-effect p-10 rounded-3xl">
            <Users className="w-10 h-10 text-blue-500 mb-6" />
            <h3 className="text-xl font-bold mb-4">Unrivaled Expertise</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Our team consists of PhD researchers, senior full-stack engineers, and industry-specific strategists.</p>
          </div>
          <div className="glass-effect p-10 rounded-3xl">
            <Eye className="w-10 h-10 text-purple-500 mb-6" />
            <h3 className="text-xl font-bold mb-4">Ethical AI Focus</h3>
            <p className="text-gray-400 text-sm leading-relaxed">We prioritize transparency, bias mitigation, and data sovereignty in every project we architect.</p>
          </div>
          <div className="glass-effect p-10 rounded-3xl">
            <Target className="w-10 h-10 text-green-500 mb-6" />
            <h3 className="text-xl font-bold mb-4">Outcome-Driven</h3>
            <p className="text-gray-400 text-sm leading-relaxed">We measure success by your bottom line: reduced overhead, increased output, or improved customer LTV.</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gray-900 rounded-3xl p-16 text-center border border-white/10">
          <h2 className="text-3xl font-bold mb-6">Want to work with us?</h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">We are always looking for ambitious projects that push the boundaries of what's possible with modern digital intelligence.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/booking" className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-colors">
              Book a Strategy Call
            </Link>
            <Link to="/solutions" className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-full font-bold flex items-center gap-2">
              Explore Solutions <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
