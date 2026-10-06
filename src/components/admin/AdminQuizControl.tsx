import React, { useState } from 'react';
import { Play, Pause, Square, Clock, Users, CheckCircle } from 'lucide-react';
import { QuizEdition, QuizStatus, AttemptRecord, SubmissionRecord } from '../../types/quiz';

interface AdminQuizControlProps {
  quiz: QuizEdition | null;
  attempts: AttemptRecord[];
  submissions?: SubmissionRecord[];
  onUpdateQuizStatus: (status: QuizStatus) => Promise<void>;
}

export const AdminQuizControl: React.FC<AdminQuizControlProps> = ({
  quiz,
  attempts,
  submissions = [],
  onUpdateQuizStatus,
}) => {
  const [loading, setLoading] = useState(false);
  const status = quiz?.status || 'LIVE';

  const handleAction = async (target: QuizStatus) => {
    try {
      setLoading(true);
      await onUpdateQuizStatus(target);
    } finally {
      setLoading(false);
    }
  };

  // Build combined list of attempt records
  const submissionAttemptIds = new Set(submissions.map((s) => s.attemptId));
  const inProgress = attempts.filter((a) => a.status === 'IN_PROGRESS' && !submissionAttemptIds.has(a.id));
  const completedCount = Math.max(
    attempts.filter((a) => a.status === 'SUBMITTED' || a.finalized).length,
    submissions.length
  );
  const totalLoggedCount = Math.max(attempts.length, submissions.length);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">Live Quiz Control</h1>
        </div>
      </div>

      {/* Controller Hardware Console */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl bg-[#090f14] border border-emerald-500/30 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-slate-400 uppercase">CURRENT STATUS</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-2xl font-mono font-black ${
                    status === 'LIVE' ? 'text-emerald-400' : status === 'PAUSED' ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {status}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              <span>TIMER DURATION</span>
              <p className="text-white font-bold text-base">{quiz?.durationSeconds || 120} Seconds</p>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleAction('LIVE')}
              disabled={loading || status === 'LIVE'}
              className="p-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition disabled:opacity-30"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{status === 'PAUSED' ? 'RESUME QUIZ' : 'SET LIVE'}</span>
            </button>

            <button
              onClick={() => handleAction('PAUSED')}
              disabled={loading || status !== 'LIVE'}
              className="p-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition disabled:opacity-30"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>PAUSE QUIZ</span>
            </button>

            <button
              onClick={() => handleAction('STOPPED')}
              disabled={loading || status === 'STOPPED'}
              className="p-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition disabled:opacity-30"
            >
              <Square className="w-5 h-5" />
              <span>STOP QUIZ</span>
            </button>
          </div>
        </div>

        {/* Live Active Attempts Count & Breakdown */}
        <div className="rounded-2xl bg-[#090f14] border border-emerald-500/30 p-6 flex flex-col justify-between space-y-4">
          <h3 className="font-mono text-xs font-bold text-slate-300 uppercase">
            Live Session Overview
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                <Clock className="w-4 h-4" />
                <span>IN PROGRESS</span>
              </div>
              <span className="font-mono font-bold text-lg text-white">{inProgress.length}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>COMPLETED</span>
              </div>
              <span className="font-mono font-bold text-lg text-white">{completedCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                <Users className="w-4 h-4" />
                <span>TOTAL LOGGED</span>
              </div>
              <span className="font-mono font-bold text-lg text-white">{totalLoggedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Attempts Table */}
      <div className="rounded-2xl bg-[#090f14] border border-emerald-500/20 p-5 overflow-hidden">
        <h3 className="font-mono text-xs font-bold text-slate-300 uppercase mb-4">
          Recent Attempts & Submissions
        </h3>

        {totalLoggedCount === 0 ? (
          <p className="text-xs font-mono text-slate-500 text-center py-8">
            No attempts or submissions recorded yet for this edition.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-[10px] text-slate-500 border-b border-slate-800 uppercase">
                <tr>
                  <th className="pb-2">Participant</th>
                  <th className="pb-2">Contact</th>
                  <th className="pb-2">Started At</th>
                  <th className="pb-2">Submitted At</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {attempts.slice(0, 15).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-semibold text-white">{a.participantName}</td>
                    <td className="py-2.5 text-slate-400">{a.participantPhone || a.participantEmail}</td>
                    <td className="py-2.5 text-slate-400">{new Date(a.startedAt).toLocaleTimeString()}</td>
                    <td className="py-2.5 text-slate-400">{a.submittedAt ? new Date(a.submittedAt).toLocaleTimeString() : 'In Progress'}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'SUBMITTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : a.status === 'IN_PROGRESS'
                            ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
