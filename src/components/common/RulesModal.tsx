import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, HelpCircle, Shield, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';
import { QuizEdition } from '../../types/quiz';

interface RulesModalProps {
  isOpen: boolean;
  quiz?: QuizEdition | null;
  onClose: () => void;
  onConfirmStart?: () => void;
  showStartButton?: boolean;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  quiz,
  onClose,
  onConfirmStart,
  showStartButton = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const duration = quiz?.durationSeconds || 120;
  const questionCount = quiz?.questionCount || 25;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0c1310] border border-white/15 p-6 sm:p-8 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rules-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7EE8A6]/10 border border-[#7EE8A6]/30 flex items-center justify-center text-[#7EE8A6]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 id="rules-modal-title" className="font-display font-medium text-lg text-white">
                  Contest Rules & Protocol
                </h2>
                <p className="font-mono-tech text-[11px] text-[#A9B8B0]">
                  SHARADIYA CIRCUIT 2026 // AEC HARDWARE CLUB
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close rules"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rules Content */}
          <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 text-sm text-[#A9B8B0]">
            {/* Core Directives Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-[#7EE8A6] mb-1.5" />
                <span className="font-mono-tech text-[10px] text-[#7EE8A6] uppercase tracking-wider">
                  TOTAL TIME
                </span>
                <span className="font-display text-lg font-medium text-white">{duration} Seconds</span>
                <span className="text-[11px] text-white/50">Strict countdown</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <HelpCircle className="w-5 h-5 text-[#D8A94F] mb-1.5" />
                <span className="font-mono-tech text-[10px] text-[#D8A94F] uppercase tracking-wider">
                  QUESTIONS
                </span>
                <span className="font-display text-lg font-medium text-white">{questionCount} MCQs</span>
                <span className="text-[11px] text-white/50">Random pool</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <Shield className="w-5 h-5 text-[#B62A35] mb-1.5" />
                <span className="font-mono-tech text-[10px] text-[#B62A35] uppercase tracking-wider">
                  LIMIT
                </span>
                <span className="font-display text-lg font-medium text-white">1 Attempt</span>
                <span className="text-[11px] text-white/50">One participant only</span>
              </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <CheckCircle className="w-4 h-4 text-[#7EE8A6] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-white block mb-0.5 font-sans">1. Single Attempt Policy</strong>
                  Each member may enter the circuit exactly once per edition. Re-entry or restarts are strictly locked out by the authentication matrix.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <CheckCircle className="w-4 h-4 text-[#7EE8A6] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-white block mb-0.5 font-sans">2. Server-Authoritative Timing</strong>
                  The 120-second countdown is governed directly by high-precision server time. When the clock reaches 00:00, current answers are automatically captured and submitted.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <CheckCircle className="w-4 h-4 text-[#7EE8A6] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-white block mb-0.5 font-sans">3. Blind Contest Mode</strong>
                  Correct answers and scores are concealed during and immediately after the quiz to prevent telemetry leaks. The official podium is revealed by AEC Hardware Club executives.
                </div>
              </div>
            </div>

            {/* Important Warning Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#B62A35]/15 border border-[#B62A35]/40 text-[#FFFFFF] text-xs">
              <AlertTriangle className="w-4 h-4 text-[#B62A35] shrink-0 mt-0.5" />
              <span>
                Do not refresh or switch tabs during an active quiz session. The timer will continue running in the background.
              </span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-mono-tech text-xs text-[#A9B8B0] hover:text-white hover:bg-white/5 transition"
            >
              DISMISS
            </button>
            {showStartButton && onConfirmStart && (
              <button
                type="button"
                onClick={onConfirmStart}
                className="btn-primary-vantage px-5 py-2 text-xs flex items-center gap-1.5"
              >
                <span>COMMENCE QUIZ</span>
                <span className="font-mono-tech">→</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
