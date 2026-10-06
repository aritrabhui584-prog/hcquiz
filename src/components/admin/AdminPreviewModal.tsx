import React, { useState } from 'react';
import { Eye, X, Play, HelpCircle, Trophy, CheckCircle, RotateCcw } from 'lucide-react';
import { ParticipantQuestion, QuizEdition } from '../../types/quiz';
import { QuizInterface } from '../participant/QuizInterface';
import { SubmissionResult } from '../participant/SubmissionResult';
import { WinnersPage } from '../participant/WinnersPage';

interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: ParticipantQuestion[];
  quiz: QuizEdition | null;
}

export const AdminPreviewModal: React.FC<AdminPreviewModalProps> = ({
  isOpen,
  onClose,
  questions,
  quiz,
}) => {
  const [stage, setStage] = useState<'quiz' | 'submitted' | 'winners'>('quiz');

  if (!isOpen) return null;

  const mockDeadline = new Date(Date.now() + (quiz?.durationSeconds || 120) * 1000).toISOString();

  const handleSimulatedSubmit = async () => {
    setStage('submitted');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-6xl h-[95vh] rounded-2xl bg-[#070b0e] border-2 border-cyan-500/50 flex flex-col overflow-hidden shadow-2xl">
        {/* Top Simulation HUD Bar */}
        <div className="min-h-12 py-2 px-3 sm:px-4 bg-slate-950 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9.5px] sm:text-[10px] font-bold border border-cyan-500/40">
              SIMULATION // ZERO DB MUTATION
            </span>
            <span className="text-xs font-mono text-slate-400 hidden md:inline">
              Testing Participant Flow
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStage('quiz')}
              className={`px-2.5 py-1 rounded font-mono text-[10px] transition ${
                stage === 'quiz' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Quiz Flow
            </button>
            <button
              onClick={() => setStage('submitted')}
              className={`px-2.5 py-1 rounded font-mono text-[10px] transition ${
                stage === 'submitted' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Result Screen
            </button>
            <button
              onClick={() => setStage('winners')}
              className={`px-2.5 py-1 rounded font-mono text-[10px] transition ${
                stage === 'winners' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Winners Podium
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:text-rose-400 text-slate-400 ml-3 transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content Area */}
        <div className="flex-1 overflow-y-auto">
          {stage === 'quiz' && (
            <QuizInterface
              attemptId="sim_preview_attempt"
              quizTitle={quiz?.title || 'SHARADIYA CIRCUIT 2026'}
              questions={questions.slice(0, 25)}
              deadline={mockDeadline}
              durationSeconds={quiz?.durationSeconds || 120}
              onSubmit={handleSimulatedSubmit}
              isPreviewMode={true}
            />
          )}

          {stage === 'submitted' && (
            <SubmissionResult
              quizTitle={quiz?.title || 'SHARADIYA CIRCUIT 2026'}
              submittedAt={new Date().toISOString()}
              onGoHome={() => setStage('quiz')}
              onViewWinners={() => setStage('winners')}
            />
          )}

          {stage === 'winners' && (
            <WinnersPage onBack={() => setStage('quiz')} />
          )}
        </div>
      </div>
    </div>
  );
};
