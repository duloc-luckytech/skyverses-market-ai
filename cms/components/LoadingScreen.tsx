
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
  const [isExiting, setIsExiting] = useState(false);
  const hasTriggered = useRef(false);

  const logoUrl = "/assets/skyverses-logo.png";

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    // No artificial delay — start exit as soon as component is mounted & painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsExiting(true);
      });
    });
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {!isExiting && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[2000] flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, #020206 0%, #05050f 50%, #020206 100%)' }}
        >
          {/* Ambient glow — deep blue aura */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 500,
                height: 500,
                background: 'radial-gradient(circle, rgba(0,120,255,0.08) 0%, transparent 70%)',
                animation: 'loadingBreath 3s ease-in-out infinite',
              }}
            />
          </div>

          {/* Center content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex flex-col items-center"
          >
            {/* Orbital ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full"
                style={{
                  width: 160,
                  height: 160,
                  border: '1px solid rgba(0, 120, 255, 0.08)',
                  animation: 'loadingOrbitSpin 8s linear infinite',
                }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    top: -2,
                    left: '50%',
                    marginLeft: -2,
                    background: 'rgba(0,144,255,0.5)',
                    boxShadow: '0 0 12px rgba(0,144,255,0.4)',
                  }}
                />
              </div>
            </div>

            {/* Logo */}
            <div className="relative">
              <div
                className="absolute inset-0 scale-[2] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0,120,255,0.12) 0%, transparent 60%)',
                  animation: 'loadingBreath 2.5s ease-in-out infinite',
                }}
              />
              <img
                src={logoUrl}
                alt="Skyverses"
                className="w-24 lg:w-28 relative z-10"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(0,120,255,0.15))',
                }}
              />
            </div>

            {/* Subtle tagline */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              className="mt-8"
            >
              <span
                className="text-[10px] font-medium tracking-[0.35em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                CMS Admin Panel
              </span>
            </motion.div>

            {/* Elegant thin line loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-6 overflow-hidden rounded-full"
              style={{
                width: 48,
                height: 1,
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: '40%',
                  background: 'linear-gradient(90deg, transparent, rgba(0,144,255,0.5), transparent)',
                  animation: 'loadingShimmer 1.2s ease-in-out infinite',
                }}
              />
            </motion.div>
          </motion.div>

          {/* Bottom branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <span
              className="text-[9px] font-light tracking-[0.2em] uppercase"
              style={{ color: 'rgba(255,255,255,0.08)' }}
            >
              Skyverses
            </span>
          </motion.div>

          {/* Keyframe styles */}
          <style>{`
            @keyframes loadingBreath {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.6; }
            }
            @keyframes loadingOrbitSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes loadingShimmer {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(350%); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
