
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";

  useEffect(() => {
    const duration = 2000; // 2 giây để tạo cảm giác nhanh gọn nhưng mượt mà
    const interval = 20;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onFinished, 800); 
          }, 300);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onFinished]);

  return (
    <div className={`fixed inset-0 z-[2000] bg-[#020203] flex flex-col items-center justify-center transition-all duration-1000 ${isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Cinematic Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}></div>
      </div>

      {/* Center Cluster */}
      <div className="relative z-20 flex flex-col items-center gap-12">
        
        {/* Logo with Soft Glow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-brand-blue/20 blur-[60px] rounded-full scale-150 animate-pulse"></div>
          <img 
            src={logoUrl} 
            alt="Skyverses" 
            className="w-48 lg:w-60 relative z-10 drop-shadow-[0_0_20px_rgba(0,144,255,0.3)]"
          />
        </motion.div>

        {/* Minimal Progress Bar */}
        <div className="w-64 lg:w-80 space-y-3">
          <div className="h-[1px] w-full bg-white/10 relative overflow-hidden rounded-full">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-brand-blue shadow-[0_0_15px_rgba(0,144,255,1)]"
              style={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            ></motion.div>
          </div>
          <div className="flex justify-center">
            <span className="text-[10px] font-black tracking-[0.5em] text-brand-blue/40 uppercase italic animate-pulse">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
