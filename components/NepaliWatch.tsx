import React, { useEffect, useState } from 'react';
import { NEPALI_NUMERALS } from '../constants';

const NepaliWatch: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsDegrees = (time.getSeconds() / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() + time.getMinutes() / 60) / 12) * 360;

  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-nepalRed bg-gray-900 shadow-[0_0_20px_rgba(220,20,60,0.5)] flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-gold opacity-50 animate-pulse"></div>

      {/* Clock Face Numbers */}
      {NEPALI_NUMERALS.map((num, i) => {
        const rotation = i * 30;
        const radian = (rotation - 90) * (Math.PI / 180);
        const radius = 40; // Percentage from center
        const x = 50 + radius * Math.cos(radian);
        const y = 50 + radius * Math.sin(radian);

        return (
          <div
            key={i}
            className="absolute text-gold font-bold text-lg"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {num}
          </div>
        );
      })}

      {/* Hands */}
      {/* Hour Hand */}
      <div
        className="absolute w-1.5 h-[25%] bg-white rounded-full origin-bottom z-10"
        style={{
          left: '50%',
          bottom: '50%',
          transform: `translateX(-50%) rotate(${hoursDegrees}deg)`,
        }}
      ></div>

      {/* Minute Hand */}
      <div
        className="absolute w-1 h-[35%] bg-gold rounded-full origin-bottom z-10"
        style={{
          left: '50%',
          bottom: '50%',
          transform: `translateX(-50%) rotate(${minutesDegrees}deg)`,
        }}
      ></div>

      {/* Second Hand */}
      <div
        className="absolute w-0.5 h-[40%] bg-nepalRed rounded-full origin-bottom z-20"
        style={{
          left: '50%',
          bottom: '50%',
          transform: `translateX(-50%) rotate(${secondsDegrees}deg)`,
        }}
      ></div>

      {/* Center Dot */}
      <div className="absolute w-3 h-3 bg-gold rounded-full z-30 shadow-md"></div>
      
      {/* Digital Time Display (Hybrid) */}
      <div className="absolute bottom-[20%] bg-black/50 px-2 py-1 rounded text-xs text-gold font-mono tracking-widest border border-gold/30">
        {time.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default NepaliWatch;