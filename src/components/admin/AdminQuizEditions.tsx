import React, { useState } from 'react';
import { Plus, Edit2, Copy, Check, Radio, Layers, Clock, HelpCircle, Save, X } from 'lucide-react';
import { QuizEdition, QuizStatus } from '../../types/quiz';

interface AdminQuizEditionsProps {
  quizzes: QuizEdition[];
  currentQuizId?: string;
  onSaveQuiz: (quiz: Partial<QuizEdition>) => Promise<void>;
  onSetActiveQuiz: (quizId: string) => Promise<void>;
}

export const AdminQuizEditions: React.FC<AdminQuizEditionsProps> = ({
  quizzes,
  currentQuizId,
  onSaveQuiz,
  onSetActiveQuiz,
}) => {
  const [editingQuiz, setEditingQuiz] = useState<Partial<QuizEdition> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingQuiz({
      id: `quiz_${Date.now()}`,
      title: `Weekly Hardware Quiz #${String(quizzes.length + 1).padStart(2, '0')}`,
      description: 'Competitive 25-MCQ electronics benchmark challenge',
      edition: `Edition ${quizzes.length + 1}`,
      weekNumber: quizzes.length + 1,
      questionCount: 25,
      durationSeconds: 120,
      status: 'READY',
      theme: 'Embedded & PCB',
      resultsPublished: false,
    });
  };

  const handleStartEdit = (quiz: QuizEdition) => {
    setIsNew(false);
    setEditingQuiz({ ...quiz });
  };

  const handleDuplicate = (quiz: QuizEdition) => {
    setIsNew(true);
    setEditingQuiz({
      ...quiz,
      id: `quiz_${Date.now()}`,
      title: `${quiz.title} (Copy)`,
      weekNumber: quiz.weekNumber + 1,
      status: 'DRAFT',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !editingQuiz.title) return;
    try {
      setSaving(true);
      await onSaveQuiz(editingQuiz);
      setEditingQuiz(null);
      setIsNew(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">Quiz Editions</h1>
        </div>

        <button
          onClick={handleStartCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE NEW QUIZ</span>
        </button>
      </div>

      {/* Edit / Create Form Modal */}
      {editingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl bg-[#090f14] border border-emerald-500/40 p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-mono text-sm font-bold text-white uppercase">
                {isNew ? 'Create New Quiz Edition' : 'Edit Quiz Edition'}
              </h3>
              <button
                onClick={() => setEditingQuiz(null)}
                className="p-1 hover:text-rose-400 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 uppercase mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={editingQuiz.title || ''}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-1">
                    Week Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingQuiz.weekNumber || 1}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, weekNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-1">
                    Theme / Focus
                  </label>
                  <input
                    type="text"
                    value={editingQuiz.theme || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, theme: e.target.value })}
                    placeholder="e.g. Embedded & Sensors"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-1">
                    Question Count (Default 30)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={editingQuiz.questionCount || 25}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, questionCount: parseInt(e.target.value) || 25 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-1">
                    Duration (Seconds, Default 120s)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="3600"
                    value={editingQuiz.durationSeconds || 120}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, durationSeconds: parseInt(e.target.value) || 120 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-400 uppercase mb-1">
                  Status
                </label>
                <select
                  value={editingQuiz.status || 'DRAFT'}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, status: e.target.value as QuizStatus })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="READY">READY</option>
                  <option value="LIVE">LIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="STOPPED">STOPPED</option>
                  <option value="RESULTS_PENDING">RESULTS_PENDING</option>
                  <option value="WINNERS_PUBLISHED">WINNERS_PUBLISHED</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-400 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingQuiz.description || ''}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingQuiz(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 font-mono text-xs text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider"
                >
                  {saving ? 'SAVING...' : 'SAVE EDITION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map((q) => {
          const isActive = q.id === currentQuizId;
          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl bg-[#080d12] border transition ${
                isActive ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                    WEEK #{q.weekNumber}
                  </span>
                  {isActive && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      ACTIVE SYSTEM SELECTION
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    q.status === 'LIVE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : q.status === 'PAUSED'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {q.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{q.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">{q.description}</p>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono text-xs mb-4">
                <div>
                  <span className="text-slate-500 text-[10px] block">QUESTIONS</span>
                  <span className="font-bold text-white">{q.questionCount || 25}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">DURATION</span>
                  <span className="font-bold text-cyan-400">{q.durationSeconds || 120}s</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">THEME</span>
                  <span className="font-bold text-slate-300 truncate block">{q.theme || 'Standard'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(q)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!isActive && (
                  <button
                    onClick={() => onSetActiveQuiz(q.id)}
                    className="px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 font-mono text-xs transition"
                  >
                    SET AS CURRENT
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
