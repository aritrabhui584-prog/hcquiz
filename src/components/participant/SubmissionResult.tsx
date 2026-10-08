import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { soundEffects } from '../../lib/soundEffects';

interface SubmissionResultProps {
  quizTitle: string;
  submittedAt?: string;
  onGoHome: () => void;
  onViewWinners: () => void;
}

export const SubmissionResult: React.FC<SubmissionResultProps> = ({
  quizTitle,
  submittedAt,
  onGoHome,
  onViewWinners,
}) => {
  useEffect(() => {
    soundEffects.playSubmissionSuccess();
  }, []);

  const easeVisual = [0.22, 1, 0.36, 1] as const;

  return (
    <main className="relative w-full h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center p-6 sm:p-8 lg:p-12 select-none">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeVisual }}
        className="relative w-full max-w-lg rounded-[22px] glass-panel p-7 sm:p-9 text-center shadow-2xl overflow-hidden"
      >
        {/* Subtle Ambient Pulse */}
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#7EE8A6]/10 blur-[90px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Minimal Animated Circuit Pulse Node */}
        <div className="relative inline-flex items-center justify-center mb-5">
          <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeDasharray="3 4" />
            <motion.circle
              cx="40"
              cy="40"
              r="30"
              stroke="#7EE8A6"
              strokeWidth="1.5"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <circle cx="40" cy="40" r="8" fill="#7EE8A6" />
            <motion.circle
              cx="40"
              cy="40"
              r="16"
              stroke="#7EE8A6"
              strokeWidth="1"
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        {/* Status Eyebrow (10–12px) */}
        <div className="inline-block px-3 py-1 rounded-full bg-[#7EE8A6]/10 border border-[#7EE8A6]/30 text-[#7EE8A6] font-mono-tech text-[10.5px] tracking-widest uppercase mb-3">
          SIGNAL RECEIVED
        </div>

        {/* Cinematic Headline (28–36px) */}
        <h1 className="font-display font-medium text-[clamp(24px,2.4vw,32px)] text-white tracking-tight leading-[1.1] mb-2">
          YOUR ANSWER SCRIPT<br />HAS BEEN RECORDED
        </h1>

        {/* 25 Responses Locked Pill */}
        <p className="font-mono-tech text-xs text-[#D8A94F] tracking-widest uppercase mt-2 mb-6">
          25 RESPONSES LOCKED
        </p>

        {/* Announcement Message */}
        <div className="space-y-3.5 text-xs sm:text-sm text-[#A9B8B0] leading-relaxed max-w-sm mx-auto mb-7">
          <p>
            Results will be announced by <strong className="text-white">AEC Hardware Club</strong>.
          </p>
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-left font-mono-tech text-[11px] space-y-1.5 text-[#6F837A]">
            <div className="flex justify-between">
              <span>SECURITY PROTOCOL:</span>
              <span className="text-[#7EE8A6]">RECORDED</span>
            </div>
            <div className="flex justify-between">
              <span>TIMESTAMP:</span>
              <span className="text-white">{submittedAt ? new Date(submittedAt).toLocaleTimeString() : 'LOCKED'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onViewWinners}
            className="btn-primary-vantage w-full sm:w-auto px-5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#D8A94F]" />
            <span>VIEW WINNERS</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-white/15 font-mono-tech text-xs text-[#A9B8B0] hover:text-white hover:border-white/30 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN HOME</span>
          </button>
        </div>
      </motion.div>
    </main>
  );
};
