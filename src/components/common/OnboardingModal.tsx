import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Cpu,
  CheckCircle2,
  X,
  ArrowRight,
  EyeOff,
  Radio,
  Lock,
  Flame,
  HelpCircle,
  Activity
} from 'lucide-react';
import { QuizEdition } from '../../types/quiz';

interface OnboardingModalProps {
  isOpen: boolean;
  quiz: QuizEdition | null;
  onConfirmStart: () => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  quiz,
  onConfirmStart,
  onClose,
}) => {
  const [acknowledgedTimer, setAcknowledgedTimer] = useState(false);
  const [acknowledgedOneShot, setAcknowledgedOneShot] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const duration = quiz?.durationSeconds || 120;
  const questionCount = quiz?.questionCount || 25;

  const canProceed = acknowledgedTimer && acknowledgedOneShot;

  const handleStart = () => {
    if (!canProceed) return;
    setIsStarting(true);
    onConfirmStart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          {/* Backdrop dismiss */}
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#080d12] border-2 border-emerald-500/40 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.15)] text-slate-100 overflow-hidden my-auto"
          >
            {/* Top Glowing Laser Circuit Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 shadow-[0_0_15px_#10b981]" />

            {/* Corner Decorative Hardware Screws */}
            <div className="absolute top-3 left-3 w-2 h-2 rounded-full border border-emerald-500/40 bg-[#0c161d]" />
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full border border-emerald-500/40 bg-[#0c161d]" />
            <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full border border-emerald-500/40 bg-[#0c161d]" />
            <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full border border-emerald-500/40 bg-[#0c161d]" />

            {/* Header: Brand & Close Button */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-500/20 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Cpu className="w-6 h-6 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black tracking-widest text-emerald-400 uppercase">
                      AEC HARDWARE CLUB
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      SYS.BRIEFING
                    </span>
                  </div>
                  <h3 className="font-sans text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    CONTEST RULES & ONE-SHOT BRIEFING
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                title="Cancel briefing"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edition Subheader Pill */}
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">
                  {quiz?.title || 'Weekly Hardware Challenge'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>SERVER CLOCK SYNCED</span>
              </div>
            </div>

            {/* Rules Matrix Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {/* Rule 1: One-Shot Constraint (CRITICAL) */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 relative overflow-hidden">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-black uppercase mb-1.5">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>1. 'ONE-SHOT' ATTEMPT ONLY</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Each participant is granted exactly <strong className="text-amber-300">one attempt</strong>. 
                  Once you click start, closing the browser, refreshing, or disconnecting will <em>not</em> reset your session.
                </p>
                <div className="mt-2 text-[10px] font-mono text-amber-400/90">
                  // Zero restarts • Strictly non-repeatable
                </div>
              </div>

              {/* Rule 2: 120s Server Timing */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 relative overflow-hidden">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-black uppercase mb-1.5">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>2. STRICT {duration}-SECOND TIMER</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  You have <strong className="text-cyan-300">{duration} seconds total</strong> for {questionCount} questions (~4s per question). 
                  Timing is verified authoritative by the server and auto-submits on expiration.
                </p>
                <div className="mt-2 text-[10px] font-mono text-cyan-400/90">
                  // Auto-submit countdown • Clock never pauses
                </div>
              </div>

              {/* Rule 3: 30 Randomized MCQs */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 relative overflow-hidden">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-black uppercase mb-1.5">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>3. {questionCount} HARDWARE MCQS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Questions are randomly pulled from the AEC repository covering PCB traces, Arduino, ESP32, sensors, and electronic components with visual animations.
                </p>
                <div className="mt-2 text-[10px] font-mono text-emerald-400/90">
                  // 1 mark per correct answer • 0 negative marking
                </div>
              </div>

              {/* Rule 4: Zero Score Leak Integrity */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 relative overflow-hidden">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-black uppercase mb-1.5">
                  <EyeOff className="w-4 h-4 shrink-0" />
                  <span>4. CONTEST INTEGRITY SEAL</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Scores will <strong className="text-purple-300">not</strong> be revealed immediately upon submission to prevent leaks. The official top 3 winners will be published later by club executives.
                </p>
                <div className="mt-2 text-[10px] font-mono text-purple-400/90">
                  // Authoritative scoring • Results announced publicly
                </div>
              </div>
            </div>

            {/* Mandatory Acknowledgment Checkboxes */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/25 space-y-3 mb-6">
              <span className="font-mono text-[10px] uppercase text-emerald-400 tracking-wider block font-bold">
                PARTICIPANT CONFIRMATION CHECKLIST:
              </span>

              {/* Check 1 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acknowledgedTimer}
                  onChange={(e) => setAcknowledgedTimer(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white leading-tight font-sans">
                  I understand the <strong>{duration}-second clock starts immediately</strong> upon clicking initiate and cannot be paused or delayed.
                </span>
              </label>

              {/* Check 2 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acknowledgedOneShot}
                  onChange={(e) => setAcknowledgedOneShot(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white leading-tight font-sans">
                  I acknowledge this is my <strong>only shot</strong> and I have a stable internet connection and device ready.
                </span>
              </label>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-900">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition cursor-pointer"
              >
                RETURN / NOT READY YET
              </button>

              <button
                type="button"
                onClick={handleStart}
                disabled={!canProceed || isStarting}
                className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition shadow-lg ${
                  canProceed && !isStarting
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-98 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-75'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {isStarting
                    ? 'CONNECTING TO CLUSTER...'
                    : canProceed
                    ? 'CONFIRM & INITIATE QUIZ'
                    : 'CHECK BOTH BOXES TO PROCEED'}
                </span>
                {canProceed && !isStarting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
