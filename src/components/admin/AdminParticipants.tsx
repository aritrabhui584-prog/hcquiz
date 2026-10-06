import React, { useState } from 'react';
import { Search, Phone, Mail } from 'lucide-react';
import { SubmissionRecord, AttemptRecord } from '../../types/quiz';

interface AdminParticipantsProps {
  attempts: AttemptRecord[];
  submissions: SubmissionRecord[];
}

export const AdminParticipants: React.FC<AdminParticipantsProps> = ({
  attempts,
  submissions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

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
    participantMap.set(a.uid, {
      uid: a.uid,
      name: a.participantName || (a.participantEmail ? a.participantEmail.split('@')[0] : 'Participant'),
      email: a.participantEmail || '',
      phone: a.participantPhone || 'N/A',
      photoUrl: a.participantPhotoUrl,
      quizId: a.quizId,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt || null,
      status: a.status,
      timeUsed: a.submittedAt ? Math.round((new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) / 1000) : null,
      score: null,
      totalQuestions: a.selectedQuestionIds?.length || 25,
      attempted: null,
    });
  });

  submissions.forEach((s) => {
    const existing = participantMap.get(s.uid);
    participantMap.set(s.uid, {
      uid: s.uid,
      name: s.participantName || existing?.name || (s.participantEmail ? s.participantEmail.split('@')[0] : 'Participant'),
      email: s.participantEmail || existing?.email || '',
      phone: s.participantPhone || existing?.phone || 'N/A',
      photoUrl: s.participantPhotoUrl || existing?.photoUrl,
      quizId: s.quizId || existing?.quizId || '',
      startedAt: s.startedAt || existing?.startedAt || s.createdAt,
      submittedAt: s.submittedAt || existing?.submittedAt || s.createdAt,
      status: 'SUBMITTED',
      timeUsed: s.timeUsed ?? existing?.timeUsed ?? null,
      score: s.score,
      totalQuestions: s.totalQuestions || 25,
      attempted: s.attempted,
    });
  });

  const participantsList = Array.from(participantMap.values());

  const filtered = participantsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

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
                          {p.score} / {p.totalQuestions}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
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
