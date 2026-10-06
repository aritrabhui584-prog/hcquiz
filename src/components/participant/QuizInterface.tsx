import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Send, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { ParticipantQuestion } from '../../types/quiz';
import { HardwareAnimation } from '../animations/HardwareAnimation';
import { CountdownTimer } from './CountdownTimer';
import { soundEffects } from '../../lib/soundEffects';

interface QuizInterfaceProps {
  attemptId: string;
  quizTitle: string;
  questions: ParticipantQuestion[];
  deadline: string; // ISO timestamp
  durationSeconds: number;
  onSubmit: (answers: Record<string, string>, isTimeout?: boolean) => Promise<void>;
  isPreviewMode?: boolean;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  attemptId,
  quizTitle,
  questions,
  deadline,
  durationSeconds,
  onSubmit,
  isPreviewMode = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const remaining = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
    return isNaN(remaining) ? durationSeconds : remaining;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(() => soundEffects.isEnabled());

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const currentQuestion = questions[currentIndex] || questions[0];

  const toggleSfx = () => {
    const val = soundEffects.toggle();
    setSfxEnabled(val);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex((p) => p + 1);
    }
  };

  const handleJumpTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    soundEffects.playQuizStart();
  }, []);

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsTimedOut(true);
    setIsSubmitting(true);
    setShowSubmitModal(false);
    try {
      soundEffects.playSubmissionSuccess();
      await onSubmit(answersRef.current, true);
    } catch (err) {
      console.error('Auto submission error:', err);
    }
  }, [isSubmitting, onSubmit]);

  useEffect(() => {
    const deadlineTime = new Date(deadline).getTime();
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((deadlineTime - Date.now()) / 1000));
      setSecondsRemaining(diff);

      if (diff === 30) soundEffects.playTimerWarning('moderate');
      if (diff === 10) soundEffects.playTimerWarning('urgent');
      if (diff <= 5 && diff > 0) soundEffects.playCountdownTick();

      if (diff <= 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [deadline, handleAutoSubmit]);

  const handleSelectOption = (optKey: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    soundEffects.playOptionSelect();
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optKey,
    }));
  };

  const handleManualSubmit = async () => {
    setIsSubmitting(true);
    setShowSubmitModal(false);
    try {
      soundEffects.playSubmissionSuccess();
      await onSubmit(answers, false);
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestion?.id || ''];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 32 : -32,
      opacity: 0,
      scale: 0.985,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -32 : 32,
      opacity: 0,
      scale: 0.985,
    }),
  };

  return (
    <main className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sm:p-5 lg:p-7 max-w-6xl mx-auto select-none overflow-y-auto">
      
      {/* Top Header HUD */}
      <section className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-[10.5px] sm:text-[11px] font-medium text-[#7EE8A6] uppercase tracking-[0.16em]">
              AEC HARDWARE CLUB
            </span>
            <span className="text-white/30">•</span>
            <span className="font-mono-tech text-[10.5px] sm:text-[11px] text-[#D8A94F] tracking-wider">
              SHARADIYA CIRCUIT
            </span>
            {isPreviewMode && (
              <span className="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-[#D8A94F]/20 text-[#D8A94F] border border-[#D8A94F]/40">
                PREVIEW
              </span>
            )}
          </div>
          <h1 className="font-display font-medium text-sm sm:text-base md:text-lg text-white mt-0.5 truncate max-w-md sm:max-w-xl">
            {quizTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Audio Telemetry Toggle */}
          <button
            type="button"
            onClick={toggleSfx}
            className={`p-2 rounded-xl border font-mono-tech text-xs transition cursor-pointer active:scale-95 ${
              sfxEnabled
                ? 'bg-white/5 border-white/20 text-[#7EE8A6]'
                : 'bg-black/60 border-white/10 text-white/40'
            }`}
            title={sfxEnabled ? 'Audio telemetry active' : 'Audio muted'}
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Radial Countdown Timer with Clock mechanism */}
          <CountdownTimer
            secondsRemaining={secondsRemaining}
            totalDuration={durationSeconds}
          />
        </div>
      </section>

      {/* Main Question Arena */}
      <section className="relative z-10 flex-1 my-3 sm:my-5 flex flex-col justify-center max-w-5xl mx-auto w-full">
        
        {/* Progress Line & Meta Status */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 text-xs font-mono-tech text-[#A9B8B0]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-white font-medium tracking-wider text-[11px] sm:text-xs">
              QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7EE8A6]/10 border border-[#7EE8A6]/30 text-[#7EE8A6] text-[10px] uppercase font-medium">
              {currentQuestion?.category || 'SYSTEMS'}
            </span>
          </div>

          <div className="text-[11px] text-[#A9B8B0]">
            ANSWERED: <strong className="text-white font-mono-tech">{answeredCount}</strong> / {questions.length}
          </div>
        </div>

        {/* Glowing Circuit Node Progress Line (Smooth responsive pips) */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-4 sm:mb-6 w-full overflow-x-auto py-1">
          {questions.map((q, idx) => {
            const isDone = Boolean(answers[q.id]);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => handleJumpTo(idx)}
                className={`h-1.5 sm:h-2 flex-1 min-w-[8px] rounded-full transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#7EE8A6] shadow-[0_0_12px_#7EE8A6] ring-1 ring-white'
                    : isDone
                    ? 'bg-[#7EE8A6]/70'
                    : 'bg-white/10 hover:bg-white/25'
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Question Card with Smooth Directional Slide Transitions */}
        <div className="relative overflow-hidden min-h-[380px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion?.id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-2xl bg-[#0c1310] border border-white/15 p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center shadow-2xl"
            >
              {/* Left Column: 3D Hardware Component Model */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
                {currentQuestion && (
                  <HardwareAnimation
                    type={currentQuestion.animationType}
                    customAssetUrl={currentQuestion.animationAssetUrl}
                    size="md"
                    showLabel={true}
                  />
                )}
              </div>

              {/* Right Column: Question Statement & Options */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6 w-full">
                
                {/* Question Statement */}
                <h2 className="font-display font-medium text-base sm:text-xl lg:text-2xl text-white leading-snug tracking-[-0.01em]">
                  {currentQuestion?.questionText}
                </h2>

                {/* 2-Column Options Grid (Desktop) / 1-Col (Mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {[
                    { key: 'A', text: currentQuestion?.optionA },
                    { key: 'B', text: currentQuestion?.optionB },
                    { key: 'C', text: currentQuestion?.optionC },
                    { key: 'D', text: currentQuestion?.optionD },
                  ].map(({ key, text }) => {
                    const isSelected = currentAnswer === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleSelectOption(key as 'A' | 'B' | 'C' | 'D')}
                        className={`text-left p-3 sm:p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#121c17] border-[#7EE8A6] text-white shadow-[0_0_15px_rgba(126,232,166,0.3)] ring-1 ring-[#7EE8A6]'
                            : 'bg-black/40 border-white/10 text-[#A9B8B0] hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg font-mono-tech font-bold text-xs flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#7EE8A6] text-black shadow-[0_0_10px_#7EE8A6]'
                              : 'bg-white/10 text-[#A9B8B0] border border-white/10'
                          }`}
                        >
                          {key}
                        </span>
                        <span className="font-normal text-xs sm:text-sm text-white/90 flex-1 leading-snug">
                          {text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom Compact Navigation Bar */}
      <section className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl font-mono-tech text-xs text-[#A9B8B0] hover:text-white border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>PREV</span>
        </button>

        <div className="flex items-center gap-3">
          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary-vantage inline-flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer active:scale-95 shadow-lg"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="btn-primary-vantage inline-flex items-center gap-2 px-6 py-2.5 text-xs bg-[#7EE8A6] text-black shadow-[0_0_20px_rgba(126,232,166,0.4)] cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT QUIZ</span>
            </button>
          )}
        </div>
      </section>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-2xl bg-[#0c1310] border border-white/15 p-6 sm:p-8 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center gap-3 mb-3 text-[#7EE8A6]">
                <HelpCircle className="w-6 h-6" />
                <h3 className="font-display font-medium text-lg text-white">
                  SUBMIT ANSWER SCRIPT?
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#A9B8B0] mb-6 leading-relaxed">
                <p>
                  You have recorded answers for <strong className="text-white font-mono-tech">{answeredCount}</strong> of <strong className="text-white font-mono-tech">{questions.length}</strong> questions.
                </p>
                <p className="text-white/60">
                  Once submitted, your answer script cannot be changed.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-lg border border-white/15 font-mono-tech text-xs text-[#A9B8B0] hover:text-white transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={isSubmitting}
                  className="btn-primary-vantage px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}</span>
                  <span className="font-mono-tech">→</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-Timeout / In-Progress Transition Overlay */}
      <AnimatePresence>
        {(isTimedOut || isSubmitting) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-center p-6"
          >
            <div className="w-12 h-12 rounded-full border-2 border-[#7EE8A6] border-t-transparent animate-spin mb-4" />
            <h2 className="font-display text-2xl font-medium text-white mb-1">
              {isTimedOut ? 'TIME COMPLETE' : 'TRANSMITTING SCRIPT'}
            </h2>
            <p className="font-mono-tech text-xs text-[#7EE8A6] tracking-widest animate-pulse">
              SUBMISSION IN PROGRESS...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
