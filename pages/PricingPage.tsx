
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * PricingPage → redirects to /credits (the actual credit-based pricing page)
 * Kept as a route for SEO and backward compatibility.
 */
const PricingPage = () => {
  const navigate = useNavigate();

  usePageMeta({
    title: 'Pricing | Skyverses - AI Creative Platform',
    description: 'View credit packages and pricing for Skyverses AI tools. Pay-per-use model for video, image, music, and voice generation.',
    keywords: 'Skyverses pricing, AI credits, pay per use',
    canonical: '/credits'
  });

  useEffect(() => {
    navigate('/credits', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Redirecting to Credits...</p>
      </div>
    </div>
  );
};

export default PricingPage;
