import React from 'react';
import { motion } from 'motion/react';

interface CountdownTimerProps {
  secondsRemaining: number;
  totalDuration?: number;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  secondsRemaining,
  totalDuration = 120,
  className = '',
}) => {
  const safeSeconds = Math.max(0, secondsRemaining);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate percentage for progress trace (0 to 1)
  const progressRatio = Math.min(1, Math.max(0, safeSeconds / totalDuration));
  const strokeDashoffset = 283 * (1 - progressRatio); // circumference for r=45 is ~282.74

  // State colors
  // 120–31 sec: green/white (#7EE8A6)
  // 30–11 sec: amber (#D8A94F)
  // 10–01 sec: red/sindoor (#B62A35)
  const isRed = safeSeconds <= 10 && safeSeconds > 0;
  const isAmber = safeSeconds > 10 && safeSeconds <= 30;
  const isZero = safeSeconds === 0;

  const traceColor = isZero
    ? '#B62A35'
    : isRed
    ? '#B62A35'
    : isAmber
    ? '#D8A94F'
    : '#7EE8A6';

  const glowShadow = isRed
    ? 'drop-shadow(0 0 8px rgba(182, 42, 53, 0.6))'
    : isAmber
    ? 'drop-shadow(0 0 6px rgba(216, 169, 79, 0.5))'
    : 'drop-shadow(0 0 6px rgba(126, 232, 166, 0.4))';

  return (
    <div className={`relative flex items-center gap-3 select-none ${className}`}>
      {/* Radial PCB Trace Meter */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
          style={{ filter: glowShadow }}
        >
          {/* Background Outer PCB Track with Tick marks */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="3"
            strokeDasharray="2 6"
            fill="none"
          />

          {/* Active PCB Progress Trace Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            stroke={traceColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            transition={{ duration: 0.5, ease: 'linear' }}
          />

          {/* Solder Nodes at Key Quadrants */}
          <circle cx="50" cy="6" r="2" fill={safeSeconds > 90 ? traceColor : 'rgba(255,255,255,0.2)'} />
          <circle cx="94" cy="50" r="2" fill={safeSeconds > 60 ? traceColor : 'rgba(255,255,255,0.2)'} />
          <circle cx="50" cy="94" r="2" fill={safeSeconds > 30 ? traceColor : 'rgba(255,255,255,0.2)'} />
          <circle cx="6" cy="50" r="2" fill={safeSeconds > 0 ? traceColor : 'rgba(255,255,255,0.2)'} />

          {/* Clock Face & Animated Hands (counter-rotated +90deg to keep 12 o'clock at top) */}
          <g transform="rotate(90 50 50)">
            {/* Clock Inner Dial Background */}
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="rgba(0, 0, 0, 0.45)"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />

            {/* 12 Hour & Minute Dial Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const isCardinal = deg % 90 === 0;
              return (
                <line
                  key={deg}
                  x1="50"
                  y1={isCardinal ? '20' : '23'}
                  x2="50"
                  y2="26"
                  stroke={isCardinal ? traceColor : 'rgba(255, 255, 255, 0.25)'}
                  strokeWidth={isCardinal ? '1.5' : '1'}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 50 50)`}
                />
              );
            })}

            {/* Minute Hand */}
            <motion.line
              x1="50"
              y1="50"
              x2="50"
              y2="28"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                transform: `rotate(${((totalDuration - safeSeconds) * 6) % 360}deg)`,
              }}
              style={{ transformOrigin: '50px 50px' }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            />

            {/* Hour Hand */}
            <motion.line
              x1="50"
              y1="50"
              x2="50"
              y2="35"
              stroke={traceColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{
                transform: `rotate(${(((totalDuration - safeSeconds) * 0.5) + 60) % 360}deg)`,
              }}
              style={{ transformOrigin: '50px 50px' }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            />

            {/* Sweeping / Ticking Second Hand */}
            <motion.g
              animate={{
                transform: `rotate(${((totalDuration - safeSeconds) * 6 * 1) % 360}deg)`,
              }}
              style={{ transformOrigin: '50px 50px' }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            >
              {/* Main Needle */}
              <line
                x1="50"
                y1="56"
                x2="50"
                y2="21"
                stroke={isRed ? '#FF4455' : isAmber ? '#FBBF24' : '#5EEAD4'}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Second Hand Tip Glow Dot */}
              <circle
                cx="50"
                cy="21"
                r="1.5"
                fill={isRed ? '#FF4455' : isAmber ? '#FBBF24' : '#5EEAD4'}
              />
              {/* Counterbalance tail circle */}
              <circle
                cx="50"
                cy="56"
                r="1.8"
                fill="rgba(255, 255, 255, 0.5)"
              />
            </motion.g>

            {/* Center Pivot Pin / Metallic Bezel */}
            <circle cx="50" cy="50" r="3.5" fill="#121816" stroke={traceColor} strokeWidth="1.5" />
            <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Numeric Readout & State Label */}
      <div className="flex flex-col">
        <span className="font-mono-tech text-[9px] uppercase tracking-widest text-[#A9B8B0]">
          {isZero ? 'TIME EXPIRED' : isRed ? 'CRITICAL TIME' : isAmber ? 'FINAL SECONDS' : 'REMAINING'}
        </span>
        <span
          className={`font-mono-tech font-bold text-xl sm:text-2xl tracking-wider leading-none transition-colors ${
            isRed
              ? 'text-[#B62A35]'
              : isAmber
              ? 'text-[#D8A94F]'
              : 'text-white'
          }`}
        >
          {formatted}
        </span>
      </div>
    </div>
  );
};
