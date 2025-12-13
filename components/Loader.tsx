import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';

export const Loader: React.FC = () => {
  const { isLoading, setIsLoading, isAuthenticated } = useAppStore();
  const [progress, setProgress] = useState(0);

  // If already authenticated (rehydrated), do not show loader at all.
  const shouldShow = isLoading && !isAuthenticated;

  useEffect(() => {
    if (!shouldShow) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 800); // Small delay after 100%
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [setIsLoading, shouldShow]);

  // Immediate exit if we shouldn't show (avoids flash on hydration)
  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
        >
          {/* Namaste Image Container */}
          <motion.div
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1, type: "spring" }}
             className="w-64 h-64 mb-8 relative flex items-center justify-center"
          >
             <div className="w-full h-full rounded-full overflow-hidden border-4 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative">
                 {/* 
                    Using the specific Nepali Namaste illustration. 
                    The circular crop (rounded-full) effectively hides the rectangular background.
                 */}
                 <img 
                   src="https://image.shutterstock.com/image-vector/illustration-nepali-man-doing-namaste-260nw-2374587499.jpg" 
                   alt="Namaste" 
                   className="w-full h-full object-cover object-top scale-110" 
                 />
                 {/* Inner Glow Overlay to help blend edges */}
                 <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
             </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-bold font-serif mb-4 text-amber-500 tracking-wider"
          >
            Namaste
          </motion.h1>
          
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-8">
            <motion.div 
              className="h-full bg-amber-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">{progress}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
