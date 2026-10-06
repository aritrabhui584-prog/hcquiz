import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface HardwareDurgaVisualProps {
  isActivating?: boolean;
  onActivated?: () => void;
  className?: string;
}

export const HardwareDurgaVisual: React.FC<HardwareDurgaVisualProps> = ({
  isActivating = false,
  onActivated,
  className = '',
}) => {
  const [stage, setStage] = useState<'IDLE' | 'TRACES' | 'INITIALIZING' | 'READY'>('IDLE');

  useEffect(() => {
    if (isActivating) {
      setStage('TRACES');
      const t1 = setTimeout(() => setStage('INITIALIZING'), 550);
      const t2 = setTimeout(() => {
        setStage('READY');
        if (onActivated) onActivated();
      }, 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setStage('IDLE');
    }
  }, [isActivating, onActivated]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer Breathing Radial Hardware Glow */}
      <motion.div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(126, 232, 166, 0.12) 0%, rgba(216, 169, 79, 0.08) 40%, rgba(182, 42, 53, 0.04) 70%, transparent 85%)',
        }}
        animate={
          isActivating
            ? { scale: [1, 1.4, 1.2], opacity: [0.6, 1, 0.9] }
            : { scale: [0.95, 1.05, 0.95], opacity: [0.5, 0.8, 0.5] }
        }
        transition={{ duration: isActivating ? 0.6 : 5, repeat: isActivating ? 1 : Infinity, ease: 'easeInOut' }}
      />

      {/* Main Symmetrical Hardware-Durga Abstract Vector */}
      <svg
        viewBox="0 0 500 500"
        className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] h-auto drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D8A94F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D8A94F" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="greenTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7EE8A6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6F837A" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="sindoorGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B62A35" stopOpacity="1" />
            <stop offset="100%" stopColor="#8A1820" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Geometric Alpana Outer Halo Rings with PCB Traces */}
        <motion.circle
          cx="250"
          cy="250"
          r="220"
          stroke="rgba(255, 255, 255, 0.10)"
          strokeWidth="1"
          strokeDasharray="4 8"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx="250"
          cy="250"
          r="195"
          stroke="url(#greenTrace)"
          strokeWidth="1.2"
          strokeDasharray="8 6 2 6"
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        />

        {/* Outer Hexagonal Geometric Corona (Pandal Crown Architecture) */}
        <path
          d="M250 45 L370 120 L370 270 L250 345 L130 270 L130 120 Z"
          stroke="rgba(216, 169, 79, 0.22)"
          strokeWidth="1.2"
          strokeDasharray="6 4"
        />

        {/* 2. Symmetrical Crown & Trishula Inspired High-Tech Bus Lines */}
        {/* Central Crown Peak */}
        <motion.path
          d="M250 65 L250 145 M250 65 L225 110 L250 125 L275 110 L250 65"
          stroke="#D8A94F"
          strokeWidth="1.6"
          filter="url(#glowFilter)"
          initial={{ pathLength: 0.8 }}
          animate={{ pathLength: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Left Crown Radiating Bus */}
        <path
          d="M225 110 L170 125 L150 160 L120 160"
          stroke="rgba(126, 232, 166, 0.45)"
          strokeWidth="1.2"
        />
        {/* Right Crown Radiating Bus */}
        <path
          d="M275 110 L330 125 L350 160 L380 160"
          stroke="rgba(126, 232, 166, 0.45)"
          strokeWidth="1.2"
        />

        {/* 3. 10 Symmetrical Circuit Array Arms (Abstract Electronic Weaponry / Bus Traces) */}
        {/* Left Arm Traces */}
        <path d="M210 200 L140 180 L90 195 L60 195" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <path d="M205 220 L130 220 L80 240 L50 240" stroke="#7EE8A6" strokeWidth="1.4" opacity="0.6" />
        <path d="M210 240 L145 260 L95 285 L70 285" stroke="rgba(216, 169, 79, 0.4)" strokeWidth="1.2" />
        <path d="M215 260 L160 300 L110 330 L85 330" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" />
        <path d="M225 280 L180 340 L130 375 L105 375" stroke="rgba(126, 232, 166, 0.4)" strokeWidth="1.2" />

        {/* Right Arm Traces */}
        <path d="M290 200 L360 180 L410 195 L440 195" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <path d="M295 220 L370 220 L420 240 L450 240" stroke="#7EE8A6" strokeWidth="1.4" opacity="0.6" />
        <path d="M290 240 L355 260 L405 285 L430 285" stroke="rgba(216, 169, 79, 0.4)" strokeWidth="1.2" />
        <path d="M285 260 L340 300 L390 330 L415 330" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" />
        <path d="M275 280 L320 340 L370 375 L395 375" stroke="rgba(126, 232, 166, 0.4)" strokeWidth="1.2" />

        {/* End Node Pads for the 10 Arms */}
        {[[60,195], [50,240], [70,285], [85,330], [105,375], [440,195], [450,240], [430,285], [415,330], [395,375]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3" stroke="#D8A94F" strokeWidth="1" fill="#080908" />
            <circle cx={cx} cy={cy} r="1.2" fill={i % 2 === 0 ? '#7EE8A6' : '#B62A35'} />
          </g>
        ))}

        {/* 4. Symmetrical Central Face / Core Matrix Structure */}
        {/* Subtle Geometric Face Contour */}
        <path
          d="M215 165 C215 165 250 155 285 165 C295 210 280 260 250 285 C220 260 205 210 215 165 Z"
          stroke="rgba(216, 169, 79, 0.5)"
          strokeWidth="1.5"
          fill="rgba(11, 18, 16, 0.7)"
        />

        {/* Iconic Electronic Symmetrical Eyes (Alpana Curves with LED pupils) */}
        {/* Left Eye */}
        <path
          d="M222 205 Q235 195 244 205 Q235 215 222 205 Z"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          fill="rgba(255,255,255,0.06)"
        />
        <circle cx="234" cy="205" r="2.2" fill="#7EE8A6" filter="url(#glowFilter)" />

        {/* Right Eye */}
        <path
          d="M256 205 Q265 195 278 205 Q265 215 256 205 Z"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          fill="rgba(255,255,255,0.06)"
        />
        <circle cx="266" cy="205" r="2.2" fill="#7EE8A6" filter="url(#glowFilter)" />

        {/* Third Eye (Trinayana / Sindoor Micro Focus Diode) */}
        <path
          d="M250 174 Q254 182 250 190 Q246 182 250 174 Z"
          stroke="#B62A35"
          strokeWidth="1.4"
          fill="url(#sindoorGlow)"
          filter="url(#glowFilter)"
        />
        <circle cx="250" cy="182" r="1.5" fill="#FFFFFF" />

        {/* Subtle Electronic Nose & Lip Traces */}
        <path d="M250 198 L250 226 L246 228 M250 226 L254 228" stroke="rgba(216, 169, 79, 0.6)" strokeWidth="1.2" />
        <path d="M242 242 Q250 248 258 242" stroke="rgba(182, 42, 53, 0.8)" strokeWidth="1.4" strokeLinecap="round" />

        {/* 5. Traveling Signal Pulses (Motion Elements) */}
        <motion.circle
          r="2.5"
          fill="#7EE8A6"
          filter="url(#glowFilter)"
          animate={{
            cx: [250, 250, 225, 170, 150, 120],
            cy: [65, 110, 110, 125, 160, 160],
            opacity: [0, 1, 1, 1, 1, 0],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          r="2.5"
          fill="#D8A94F"
          filter="url(#glowFilter)"
          animate={{
            cx: [250, 250, 275, 330, 350, 380],
            cy: [65, 110, 110, 125, 160, 160],
            opacity: [0, 1, 1, 1, 1, 0],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        />

        {/* Bottom Symmetrical Mahishasuramardini Geometric Base (Substation Grounding Grid) */}
        <path
          d="M200 320 L250 360 L300 320 L330 380 L250 430 L170 380 Z"
          stroke="rgba(126, 232, 166, 0.3)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <path d="M250 360 L250 430" stroke="#7EE8A6" strokeWidth="1.5" opacity="0.7" />
        <circle cx="250" cy="430" r="3.5" fill="#080908" stroke="#7EE8A6" strokeWidth="1.5" />
      </svg>

      {/* Activation Status Readout HUD Overlay */}
      {stage !== 'IDLE' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 px-4 py-1.5 rounded-full bg-[#080e14]/90 border border-[#7EE8A6]/40 font-mono-tech text-[11px] tracking-widest text-[#7EE8A6] flex items-center gap-2 shadow-[0_0_20px_rgba(126,232,166,0.25)]"
        >
          <span className="w-2 h-2 rounded-full bg-[#7EE8A6] animate-ping" />
          <span>
            {stage === 'TRACES'
              ? 'TRACE ACTIVATION...'
              : stage === 'INITIALIZING'
              ? 'SYSTEM INITIALIZED'
              : 'QUIZ READY'}
          </span>
        </motion.div>
      )}
    </div>
  );
};
