import React from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { QuizEdition, QuizStatus } from '../../types/quiz';

interface LandingPageProps {
  quiz: QuizEdition | null;
  hasAttempted: boolean;
  onStartQuiz: () => void;
  onOpenPhoneModal: () => void;
  onOpenRulesModal: () => void;
  onViewWinners?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  quiz,
  hasAttempted,
  onStartQuiz,
  onOpenPhoneModal,
  onOpenRulesModal,
  onViewWinners,
}) => {
  const { currentUser, userProfile } = useAuth();

  const quizStatus: QuizStatus = quiz?.status || 'LIVE';
  const isLive = quizStatus === 'LIVE';

  const handleCtaClick = () => {
    if (!currentUser) {
      onOpenPhoneModal();
      return;
    }
    if (!userProfile?.rollNo || !userProfile?.stream || !userProfile?.year || !userProfile?.phone) {
      onOpenPhoneModal();
      return;
    }
    if (!isLive) {
      return;
    }

    onStartQuiz();
  };

  const getCtaText = () => {
    if (!currentUser) return 'ENTER THE CIRCUIT';
    if (isLive) return 'START THE QUIZ';
    if (quizStatus === 'PAUSED') return 'QUIZ PAUSED';
    if (quizStatus === 'STOPPED') return 'QUIZ CLOSED';
    return 'ENTER THE CIRCUIT';
  };

  // Vantage-inspired precision motion easings
  const easePrimary = [0.16, 1, 0.3, 1] as const;
  const easeVisual = [0.22, 1, 0.36, 1] as const;

  return (
    <main className="relative w-full flex-1 flex flex-col justify-center items-center text-center px-6 sm:px-10 lg:px-16 max-w-5xl mx-auto select-none py-12 sm:py-16 lg:py-20">
      <section className="relative z-10 flex flex-col items-center justify-center max-w-3xl w-full">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easePrimary, delay: 0.18 }}
          className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8"
        >
          <span className="font-mono-tech text-xs sm:text-[12px] font-medium uppercase tracking-[0.24em] text-[#7EE8A6]">
            AEC HARDWARE CLUB
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span className="font-mono-tech text-xs sm:text-[12px] tracking-[0.24em] text-[#D8A94F]">
            SPECIAL EDITION
          </span>
        </motion.div>

        {/* Headline Reveal */}
        <div className="overflow-hidden mb-8 sm:mb-10 flex flex-col items-center">
          <div className="overflow-hidden py-1">
            <motion.div
              initial={{ y: '110%', skewY: 2, opacity: 0 }}
              animate={{ y: '0%', skewY: 0, opacity: 1 }}
              transition={{ duration: 0.85, ease: easeVisual, delay: 0.3 }}
              className="font-display font-medium text-[clamp(44px,6.8vw,92px)] tracking-[-0.035em] text-white uppercase leading-[0.98] drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
            >
              SHARADIYA
            </motion.div>
          </div>
          <div className="overflow-hidden py-1">
            <motion.div
              initial={{ y: '110%', skewY: 2, opacity: 0 }}
              animate={{ y: '0%', skewY: 0, opacity: 1 }}
              transition={{ duration: 0.85, ease: easeVisual, delay: 0.44 }}
              className="flex items-baseline justify-center gap-4"
            >
              <span className="font-display font-medium text-[clamp(44px,6.8vw,92px)] tracking-[-0.035em] text-white/95 uppercase leading-[0.98] drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
                CIRCUIT
              </span>
              <span className="font-display font-light text-[clamp(30px,4.6vw,66px)] text-[#D8A94F] tracking-tight drop-shadow-[0_2px_8px_rgba(216,169,79,0.3)]">
                2026
              </span>
            </motion.div>
          </div>
        </div>

        {/* Supporting Copy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easePrimary, delay: 0.74 }}
          className="space-y-3 mb-10 sm:mb-12 max-w-[560px]"
        >
          <p className="font-serif-accent text-[clamp(17px,1.45vw,22px)] leading-[1.5] text-white/95 font-normal">
            Where Tradition Meets Technology.
          </p>
          <p className="font-mono-tech text-[clamp(13px,1.05vw,16px)] text-[#A9B8B0] leading-[1.6] tracking-wide">
            25 questions. 120 seconds. One attempt.
          </p>
        </motion.div>

        {/* Action Stack */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easePrimary, delay: 0.96 }}
          className="flex flex-col items-center w-full"
        >
          {hasAttempted ? (
            <div className="p-5 rounded-2xl glass-panel max-w-md w-full border border-[#D8A94F]/30 bg-black/40 text-left">
              <div className="flex items-center gap-2.5 text-[#D8A94F] mb-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-mono-tech font-bold text-xs tracking-wider">
                  ATTEMPT RECORDED
                </span>
              </div>
              <p className="text-xs text-[#A9B8B0] leading-relaxed">
                Your answer script is permanently secured in the club vault. Results will be published on the official Winners page.
              </p>
              {onViewWinners && (
                <button
                  onClick={onViewWinners}
                  className="mt-3.5 inline-flex items-center gap-1.5 font-mono-tech text-xs text-[#D8A94F] hover:underline cursor-pointer"
                >
                  <span>View Winners Podium</span>
                  <span>→</span>
                </button>
              )}
            </div>
          ) : !isLive ? (
            <div className="p-5 rounded-2xl glass-panel max-w-md w-full border border-white/10 bg-black/40 text-left">
              <div className="flex items-center gap-2.5 text-[#A9B8B0] mb-1.5">
                <Lock className="w-4 h-4 shrink-0 text-[#B62A35]" />
                <span className="font-mono-tech font-bold text-xs tracking-wider text-white">
                  {quizStatus === 'PAUSED' ? 'QUIZ PAUSED BY ADMINISTRATOR' : 'QUIZ OPENS SOON'}
                </span>
              </div>
              <p className="text-xs text-[#A9B8B0] leading-relaxed">
                {quizStatus === 'PAUSED'
                  ? 'The session is temporarily suspended. Please wait for the quizmaster.'
                  : 'System calibrations in progress. The circuit activates at the scheduled hour.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
              {/* Primary Button */}
              <button
                type="button"
                onClick={handleCtaClick}
                className="btn-primary-vantage relative h-13 px-8 rounded-xl bg-white text-[#111111] flex items-center justify-between gap-5 cursor-pointer select-none group shadow-[0_2px_10px_rgba(0,0,0,0.45)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all"
              >
                <span className="font-display font-medium text-[clamp(16px,1.25vw,19px)] tracking-[-0.28px] uppercase">
                  {getCtaText()}
                </span>
                {/* Dark Square Control Container with SVG Arrow */}
                <div className="w-7 h-7 rounded-[6px] bg-[#070909] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform duration-160 shrink-0">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 7H11M11 7L7 3M11 7L7 11"
                      stroke="#FFFFFF"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenRulesModal}
                className="font-mono-tech text-xs sm:text-sm text-[#A9B8B0] hover:text-white transition cursor-pointer flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-white/5"
              >
                <span>Read Briefing</span>
                <span className="text-[12px]">↗</span>
              </button>
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
};
