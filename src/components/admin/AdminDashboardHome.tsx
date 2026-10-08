import React, { useState } from 'react';
import {
  Radio,
  Play,
  Pause,
  Square,
  Users,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Trophy,
  RefreshCw,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { QuizEdition, QuizStatus } from '../../types/quiz';
import { AdminTab } from './AdminLayout';

interface AdminDashboardHomeProps {
  quiz: QuizEdition | null;
  participantCount: number;
  startedCount: number;
  submittedCount: number;
  questionBankCount: number;
  onUpdateQuizStatus: (newStatus: QuizStatus) => Promise<void>;
  onNavigateTab: (tab: AdminTab) => void;
  onRefreshStats: () => Promise<void>;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  quiz,
  participantCount,
  startedCount,
  submittedCount,
  questionBankCount,
  onUpdateQuizStatus,
  onNavigateTab,
  onRefreshStats,
}) => {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    targetStatus: QuizStatus | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    targetStatus: null,
    title: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const status = quiz?.status || 'LIVE';

  const triggerStatusChange = (targetStatus: QuizStatus) => {
    let title = '';
    let message = '';

    if (targetStatus === 'LIVE') {
      title = status === 'PAUSED' ? 'Resume Quiz Session?' : 'Start Quiz & Make LIVE?';
      message =
        'Participants will immediately be able to start their 120s attempts and answer questions.';
    } else if (targetStatus === 'PAUSED') {
      title = 'Pause Live Quiz?';
      message =
        'New participants will not be able to start the quiz. Ongoing attempts will display a paused advisory.';
    } else if (targetStatus === 'STOPPED') {
      title = 'Permanently Stop & Close Quiz?';
      message =
        'Participants can no longer start this edition. Existing submissions will be sealed for winner evaluation.';
    }

    setConfirmModal({
      isOpen: true,
      targetStatus,
      title,
      message,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.targetStatus) return;
    try {
      setLoading(true);
      await onUpdateQuizStatus(confirmModal.targetStatus);
      setConfirmModal({ isOpen: false, targetStatus: null, title: '', message: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Edition & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            {quiz?.title || 'Sharadiya Circuit 2026'}
          </h1>
          <p className="font-mono text-xs text-slate-400 mt-1">
            Edition #{quiz?.weekNumber || 1} • {quiz?.durationSeconds || 120}s Limit • {quiz?.questionCount || 25} Questions
          </p>
        </div>

        <button
          onClick={onRefreshStats}
          className="self-start sm:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH</span>
        </button>
      </div>

      {/* Prominent Status & Live Controls */}
      <div className="rounded-2xl bg-[#090f14] border-2 border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase text-slate-400 tracking-wider">
              CURRENT STATUS
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`text-3xl font-black font-mono tracking-wider uppercase ${
                  status === 'LIVE'
                    ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : status === 'PAUSED'
                    ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'text-rose-400'
                }`}
              >
                {status}
              </span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {status !== 'LIVE' && (
              <button
                onClick={() => triggerStatusChange('LIVE')}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider uppercase transition shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{status === 'PAUSED' ? 'RESUME QUIZ' : 'START QUIZ'}</span>
              </button>
            )}

            {status === 'LIVE' && (
              <button
                onClick={() => triggerStatusChange('PAUSED')}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs tracking-wider uppercase transition shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE QUIZ</span>
              </button>
            )}

            {status !== 'STOPPED' && (
              <button
                onClick={() => triggerStatusChange('STOPPED')}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 font-mono font-bold text-xs tracking-wider uppercase transition disabled:opacity-50"
              >
                <Square className="w-4 h-4" />
                <span>STOP QUIZ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Participants */}
        <div className="p-5 rounded-2xl bg-[#080d12] border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs mb-2">
            <span>REGISTERED USERS</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-black text-white">{participantCount}</div>
        </div>

        {/* Started Attempts */}
        <div className="p-5 rounded-2xl bg-[#080d12] border border-cyan-500/20 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs mb-2">
            <span>ATTEMPTS STARTED</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-black text-cyan-300">{startedCount}</div>
        </div>

        {/* Final Submissions */}
        <div className="p-5 rounded-2xl bg-[#080d12] border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs mb-2">
            <span>SUBMISSIONS</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-black text-amber-300">{submittedCount}</div>
        </div>

        {/* Question Pool Count */}
        <div className="p-5 rounded-2xl bg-[#080d12] border border-purple-500/20 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs mb-2">
            <span>QUESTION BANK</span>
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-mono font-black text-purple-300">
            {questionBankCount} <span className="text-sm font-normal text-slate-400">/ 25 Picked</span>
          </div>
        </div>
      </div>

      {/* Quick Access Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('questions')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-mono text-sm font-bold text-white mb-1">Questions Bank</h3>
        </div>

        <div
          onClick={() => onNavigateTab('submissions')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-mono text-sm font-bold text-white mb-1">Answer Scripts</h3>
        </div>

        <div
          onClick={() => onNavigateTab('winners')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-mono text-sm font-bold text-white mb-1">Winner Management</h3>
        </div>

        <div
          onClick={() => onNavigateTab('audit-logs')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-mono text-sm font-bold text-white mb-1">Audit Logs</h3>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#090f14] border border-amber-500/40 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-mono text-base font-bold uppercase">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, targetStatus: null, title: '', message: '' })}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 font-mono text-xs text-slate-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider"
              >
                {loading ? 'EXECUTING...' : 'CONFIRM ACTION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
