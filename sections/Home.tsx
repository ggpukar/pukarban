import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { formatTime, getNepaliDate } from '../utils/helpers';
import { Sun, Moon, Palette } from 'lucide-react';

export const HomeSection: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { toggleBackgroundMode, backgroundMode } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const AnalogClock = () => {
    const seconds = time.getSeconds() * 6;
    const minutes = time.getMinutes() * 6 + seconds / 60;
    const hours = (time.getHours() % 12) * 30 + minutes / 12;

    return (
      <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border-4 border-white/20 relative backdrop-blur-md shadow-2xl flex items-center justify-center bg-black/30">
        
        {/* Minute/Hour Ticks */}
        <div className="absolute inset-0 rounded-full">
            {[...Array(60)].map((_, i) => (
                <div
                    key={i}
                    className="absolute inset-0"
                    style={{ transform: `rotate(${i * 6}deg)` }}
                >
                    <div className={`mx-auto mt-1 ${i % 5 === 0 ? 'w-1 h-3 bg-white/80' : 'w-0.5 h-1.5 bg-white/30'}`} />
                </div>
            ))}
        </div>

        {/* Numbers */}
        <div className="absolute inset-0 rounded-full">
            {[...Array(12)].map((_, i) => {
                const num = i + 1;
                const rotation = num * 30;
                return (
                    <div 
                        key={num}
                        className="absolute inset-0 text-center pt-5 sm:pt-6 font-bold text-white font-mono text-lg sm:text-xl"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        <span className="inline-block" style={{ transform: `rotate(-${rotation}deg)` }}>
                            {num}
                        </span>
                    </div>
                )
            })}
        </div>

        {/* Center Dot */}
        <div className="absolute w-4 h-4 bg-white rounded-full z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        
        {/* Hour Hand */}
        <div 
            className="absolute w-1.5 bg-white rounded-full origin-bottom z-10 shadow-lg"
            style={{ 
                height: '25%', 
                bottom: '50%',
                transform: `rotate(${hours}deg)` 
            }} 
        />
        
        {/* Minute Hand */}
        <div 
            className="absolute w-1 bg-gray-300 rounded-full origin-bottom z-10 shadow-lg"
            style={{ 
                height: '35%', 
                bottom: '50%',
                transform: `rotate(${minutes}deg)` 
            }} 
        />
        
        {/* Second Hand */}
        <div 
            className="absolute w-0.5 bg-red-500 rounded-full origin-bottom z-10"
            style={{ 
                height: '42%', 
                bottom: '50%',
                transform: `rotate(${seconds}deg)` 
            }} 
        />
         {/* Second Hand Tail */}
        <div 
            className="absolute w-0.5 bg-red-500 rounded-full origin-top z-10"
            style={{ 
                height: '10%', 
                top: '50%',
                transform: `rotate(${seconds}deg)` 
            }} 
        />
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative p-6 pt-20">
      <div className="absolute top-6 right-6 z-30">
        <button 
          onClick={toggleBackgroundMode}
          className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/10"
        >
          {backgroundMode === 'dark' ? <Sun size={20} /> : backgroundMode === 'light' ? <Palette size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl items-center">
        {/* Left: Profile */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center md:items-start text-center md:text-left space-y-6"
        >
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative z-10">
              <img src="https://thumbs2.imgbox.com/33/2a/pQ5hZzDq_t.jpg" alt="Prabin Ban" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity -z-10 animate-pulse" />
          </div>
          
          <div>
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              PRABIN BAN
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mt-2 font-light tracking-wide uppercase">
              A CREATIVE DEVELOPMENT LEARNER
            </p>
          </div>
        </motion.div>

        {/* Right: Time */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          <AnalogClock />
          
          <div className="text-center space-y-2 backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10 w-full max-w-xs">
            <div className="text-5xl font-mono font-bold tracking-widest">
              {formatTime(time)}
            </div>
            <div className="text-xl text-amber-400 font-semibold nepali-font">
              {getNepaliDate()} (BS)
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-widest">
              Kathmandu, Nepal
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};