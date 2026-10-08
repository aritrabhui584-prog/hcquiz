import React, { useState, useMemo } from 'react';
import { Search, Phone, Mail, Trash2, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { SubmissionRecord, AttemptRecord, QuestionItem } from '../../types/quiz';

interface AdminParticipantsProps {
  attempts: AttemptRecord[];
  submissions: SubmissionRecord[];
  questions?: QuestionItem[];
  onDeleteParticipant?: (participant: { uid: string; email: string; name: string }) => Promise<void>;
  onResetAttempt?: (participant: { uid: string; email: string }) => Promise<void>;
}

export const AdminParticipants: React.FC<AdminParticipantsProps> = ({
  attempts,
  submissions,
  questions = [],
  onDeleteParticipant,
  onResetAttempt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingParticipant, setDeletingParticipant] = useState<{ uid: string; email: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resettingUid, setResettingUid] = useState<string | null>(null);

  const isAnswerCorrect = (chosen: any, correctAnswer: any): boolean => {
    if (chosen === undefined || chosen === null || correctAnswer === undefined || correctAnswer === null) {
      return false;
    }
    const cleanChosen = String(chosen).trim().toUpperCase().replace(/^OPTION\s*/i, '').replace(/[\.\:\)]/g, '').trim();
    const cleanCorrect = String(correctAnswer).trim().toUpperCase().replace(/^OPTION\s*/i, '').replace(/[\.\:\)]/g, '').trim();

    if (cleanChosen === cleanCorrect && cleanChosen.length > 0) return true;

    const letterMap: Record<string, string> = { '0': 'A', '1': 'B', '2': 'C', '3': 'D' };
    const letterFromChosen = letterMap[cleanChosen] || cleanChosen;
    const letterFromCorrect = letterMap[cleanCorrect] || cleanCorrect;

    return letterFromChosen === letterFromCorrect && letterFromChosen.length > 0;
  };

  const questionMap = useMemo(() => {
    const map = new Map<string, QuestionItem>();
    questions.forEach((q) => {
      map.set(q.id, q);
      map.set(q.id.toLowerCase(), q);
    });
    return map;
  }, [questions]);

  // Merge unique participants from attempts and submissions
  const participantMap = new Map<string, {
    uid: string;
    name: string;
    email: string;
    phone: string;
    photoUrl?: string;
    quizId: string;
    startedAt: string;
    submittedAt: string | null;
    status: string;
    timeUsed: number | null;
    score: number | null;
    totalQuestions: number;
    attempted: number | null;
  }>();

  attempts.forEach((a) => {
    const isPastDeadline = a.deadline
      ? new Date(a.deadline).getTime() <= Date.now()
      : (new Date(a.startedAt).getTime() + (a.durationSeconds || 120) * 1000 <= Date.now());

    const isSubmitted = a.status === 'SUBMITTED' || a.finalized || Boolean(a.submittedAt) || isPastDeadline;
    const computedStatus = isSubmitted ? 'SUBMITTED' : (a.status || 'IN_PROGRESS');

    const effectiveSubmittedAt = a.submittedAt || (isPastDeadline ? a.deadline || new Date(new Date(a.startedAt).getTime() + (a.durationSeconds || 120) * 1000).toISOString() : null);
    const elapsed = effectiveSubmittedAt && a.startedAt
      ? Math.max(1, Math.round((new Date(effectiveSubmittedAt).getTime() - new Date(a.startedAt).getTime()) / 1000))
      : (isPastDeadline ? a.durationSeconds || 120 : null);

    const answers = (a as any).answers || {};
    let computedScore: number | null = (a as any).score ?? null;
    let attempted = (a as any).attempted ?? null;

    if (Object.keys(answers).length > 0) {
      let correct = 0;
      let count = 0;
      Object.entries(answers).forEach(([qId, chosen]) => {
        const isAnswered = chosen !== undefined && chosen !== null && String(chosen).trim() !== '' && String(chosen).trim().toLowerCase() !== 'unanswered' && String(chosen).trim().toLowerCase() !== 'skipped';
        if (isAnswered) {
          count++;
          const q = questionMap.get(qId) || questionMap.get(qId.toLowerCase());
          if (q && isAnswerCorrect(chosen, q.correctAnswer)) {
            correct++;
          }
        }
      });
      attempted = count;
      computedScore = correct;
    } else if (isSubmitted && (computedScore === null || computedScore === undefined)) {
      computedScore = 0;
    }

    const userKey = (a.uid || a.participantEmail || a.id).toLowerCase();
    participantMap.set(userKey, {
      uid: a.uid || userKey,
      name: a.participantName || (a.participantEmail ? a.participantEmail.split('@')[0] : 'Participant'),
      email: a.participantEmail || '',
      phone: a.participantPhone || 'N/A',
      photoUrl: a.participantPhotoUrl,
      quizId: a.quizId,
      startedAt: a.startedAt,
      submittedAt: effectiveSubmittedAt,
      status: computedStatus,
      timeUsed: (a as any).timeUsed ?? elapsed,
      score: computedScore,
      totalQuestions: a.selectedQuestionIds?.length || 25,
      attempted,
    });
  });

  submissions.forEach((s) => {
    const userKey = (s.uid || s.participantEmail || s.id).toLowerCase();
    const existing = participantMap.get(userKey);

    const subAnswers = s.answers || {};
    let subScore = s.score ?? 0;
    let subAttempted = s.attempted ?? null;

    if (Object.keys(subAnswers).length > 0) {
      let correct = 0;
      let count = 0;
      Object.entries(subAnswers).forEach(([qId, chosen]) => {
        const isAnswered = chosen !== undefined && chosen !== null && String(chosen).trim() !== '' && String(chosen).trim().toLowerCase() !== 'unanswered' && String(chosen).trim().toLowerCase() !== 'skipped';
        if (isAnswered) {
          count++;
          const q = questionMap.get(qId) || questionMap.get(qId.toLowerCase());
          if (q && isAnswerCorrect(chosen, q.correctAnswer)) {
            correct++;
          }
        }
      });
      subScore = correct;
      subAttempted = count;
    }

    participantMap.set(userKey, {
      uid: s.uid || existing?.uid || userKey,
      name: s.participantName || existing?.name || (s.participantEmail ? s.participantEmail.split('@')[0] : 'Participant'),
      email: s.participantEmail || existing?.email || '',
      phone: s.participantPhone || existing?.phone || 'N/A',
      photoUrl: s.participantPhotoUrl || existing?.photoUrl,
      quizId: s.quizId || existing?.quizId || '',
      startedAt: s.startedAt || existing?.startedAt || s.createdAt,
      submittedAt: s.submittedAt || existing?.submittedAt || s.createdAt,
      status: 'SUBMITTED',
      timeUsed: s.timeUsed ?? existing?.timeUsed ?? null,
      score: subScore,
      totalQuestions: s.totalQuestions || 25,
      attempted: s.attempted ?? (Object.keys(subAnswers).length || null),
    });
  });

  const participantsList = Array.from(participantMap.values());

  const filtered = participantsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  const confirmDelete = async () => {
    if (!deletingParticipant || !onDeleteParticipant) return;
    setIsDeleting(true);
    try {
      await onDeleteParticipant(deletingParticipant);
      setDeletingParticipant(null);
    } catch (err) {
      console.error('Failed to delete participant:', err);
      alert('Failed to delete participant. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">Participants</h1>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          Total Participants: <strong className="text-white">{participantsList.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by participant name, email address, or phone number..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080d12] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#080d12] border border-emerald-500/20 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            No participants recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950/80 text-[10px] text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Participant</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Started At</th>
                  <th className="p-3.5">Submitted At</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Time Used</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((p, idx) => (
                  <tr key={`${p.uid}_${idx}`} className="hover:bg-slate-900/40">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        {p.photoUrl && (
                          <img src={p.photoUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span>{p.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{p.email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-emerald-300">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{p.phone}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {p.startedAt ? new Date(p.startedAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {p.submittedAt ? new Date(p.submittedAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'SUBMITTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : p.status === 'IN_PROGRESS'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-cyan-400">
                      {p.timeUsed !== null ? `${p.timeUsed}s` : '—'}
                    </td>
                    <td className="p-3.5">
                      {p.score !== null ? (
                        <span className="font-black text-amber-400">
                          {p.score} / {p.totalQuestions || 25}
                        </span>
                      ) : p.status === 'SUBMITTED' ? (
                        <span className="font-black text-amber-400">
                          0 / {p.totalQuestions || 25}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">In Progress</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onResetAttempt && (
                          <button
                            onClick={async () => {
                              if (confirm(`Reset session for ${p.name} so they can re-take the quiz?`)) {
                                setResettingUid(p.uid);
                                try {
                                  await onResetAttempt({ uid: p.uid, email: p.email });
                                } finally {
                                  setResettingUid(null);
                                }
                              }
                            }}
                            disabled={resettingUid === p.uid}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/30 text-xs font-mono text-cyan-400 hover:text-cyan-200 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Reset attempt session to allow re-taking the quiz"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${resettingUid === p.uid ? 'animate-spin' : ''}`} />
                            <span>RESET</span>
                          </button>
                        )}

                        {onDeleteParticipant && (
                          <button
                            onClick={() => setDeletingParticipant({ uid: p.uid, email: p.email, name: p.name })}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-xs font-mono text-rose-400 hover:text-rose-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                            title="Delete participant record, answer scripts, and attempts"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>DELETE</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#090f14] border border-rose-500/40 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete Participant?</h3>
                <p className="font-mono text-xs text-slate-400">Irreversible administrative action</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
              <div>Participant: <strong className="text-white">{deletingParticipant.name}</strong></div>
              <div>Email: <span className="text-emerald-400">{deletingParticipant.email || 'N/A'}</span></div>
              <div className="text-[11px] text-rose-400/90 pt-1">
                ⚠️ This will permanently delete the participant&apos;s answer scripts, quiz attempts, and scores.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingParticipant(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>DELETING...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>CONFIRM DELETE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

