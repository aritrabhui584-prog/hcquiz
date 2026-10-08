import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  X,
  Printer,
  FileText,
  Download,
  ShieldCheck,
  Cpu,
  ChevronDown,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { SubmissionRecord, QuestionItem, AttemptRecord } from '../../types/quiz';

interface AdminSubmissionsProps {
  submissions: SubmissionRecord[];
  attempts?: AttemptRecord[];
  questions: QuestionItem[];
  onDeleteSubmission?: (submission: SubmissionRecord) => Promise<void>;
}

type ExportMode = 'individual' | 'ledger' | 'dossier';

export const AdminSubmissions: React.FC<AdminSubmissionsProps> = ({
  submissions,
  attempts = [],
  questions,
  onDeleteSubmission,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'date'>('score');
  const [deletingSubmission, setDeletingSubmission] = useState<SubmissionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // PDF Preview & Export Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>('ledger');
  const [targetSubmissions, setTargetSubmissions] = useState<SubmissionRecord[]>([]);

  const questionMap = useMemo(() => {
    const map = new Map<string, QuestionItem>();
    questions.forEach((q) => map.set(q.id, q));
    return map;
  }, [questions]);

  // Combine direct submissions collection with any submitted attempt records
  const allSubmissions = useMemo(() => {
    const map = new Map<string, SubmissionRecord>();
    submissions.forEach((s) => {
      map.set(s.id || s.attemptId || s.uid, s);
    });

    attempts.forEach((a) => {
      if (a.status === 'SUBMITTED' || a.finalized || a.submittedAt) {
        const subId = `sub_${a.id}`;
        if (!map.has(subId) && !map.has(a.id)) {
          const timeUsed = (a as any).timeUsed ?? (a.submittedAt && a.startedAt ? Math.round((new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) / 1000) : a.durationSeconds);
          map.set(subId, {
            id: subId,
            attemptId: a.id,
            uid: a.uid,
            quizId: a.quizId,
            quizTitle: 'SHARADIYA CIRCUIT 2026',
            participantName: a.participantName || (a.participantEmail ? a.participantEmail.split('@')[0] : 'Participant'),
            participantEmail: a.participantEmail || '',
            participantPhone: a.participantPhone || 'N/A',
            participantPhotoUrl: a.participantPhotoUrl,
            stream: a.stream || '',
            year: a.year || '',
            rollNo: a.rollNo || '',
            membershipId: a.membershipId || '',
            answers: (a as any).answers || {},
            totalQuestions: a.selectedQuestionIds?.length || 25,
            attempted: (a as any).attempted ?? ((a as any).answers ? Object.keys((a as any).answers).length : a.selectedQuestionIds?.length || 25),
            correct: (a as any).score ?? (a as any).correct ?? 0,
            wrong: (a as any).wrong ?? 0,
            score: (a as any).score ?? 0,
            startedAt: a.startedAt,
            submittedAt: a.submittedAt || a.startedAt,
            timeUsed,
            syncedToSheets: false,
            createdAt: a.submittedAt || a.startedAt,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [submissions, attempts]);

  const sortedSubmissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allSubmissions
      .filter((s) => {
        if (!term) return true;
        const name = (s.participantName || '').toLowerCase();
        const email = (s.participantEmail || '').toLowerCase();
        const phone = s.participantPhone || '';
        return name.includes(term) || email.includes(term) || phone.includes(term);
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
          return (a.timeUsed ?? 0) - (b.timeUsed ?? 0); // Tie-break with faster time
        }
        if (sortBy === 'time') return (a.timeUsed ?? 0) - (b.timeUsed ?? 0);
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      });
  }, [allSubmissions, searchTerm, sortBy]);

  // Aggregate stats for filtered list
  const filterStats = useMemo(() => {
    const total = sortedSubmissions.length;
    if (total === 0) return { avgScore: 0, maxScore: 0, minTime: 0, total: 0 };
    const maxScore = Math.max(...sortedSubmissions.map((s) => s.score));
    const minTime = Math.min(...sortedSubmissions.map((s) => s.timeUsed));
    const avgScore =
      Math.round((sortedSubmissions.reduce((acc, s) => acc + s.score, 0) / total) * 10) / 10;
    return { avgScore, maxScore, minTime, total };
  }, [sortedSubmissions]);

  // Open PDF Modal for Single Script
  const handleOpenSinglePdf = (submission: SubmissionRecord) => {
    setExportMode('individual');
    setTargetSubmissions([submission]);
    setPdfModalOpen(true);
  };

  const confirmDeleteSubmission = async () => {
    if (!deletingSubmission || !onDeleteSubmission) return;
    setIsDeleting(true);
    try {
      await onDeleteSubmission(deletingSubmission);
      if (selectedSubmission?.id === deletingSubmission.id) {
        setSelectedSubmission(null);
      }
      setDeletingSubmission(null);
    } catch (err) {
      console.error('Failed to delete submission:', err);
      alert('Failed to delete answer script. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open PDF Modal for Filtered List (Summary Ledger or Full Dossier)
  const handleOpenBatchPdf = (mode: 'ledger' | 'dossier') => {
    setExportMode(mode);
    setTargetSubmissions(sortedSubmissions);
    setPdfModalOpen(true);
  };

  // Build clean HTML document for printing
  const generatePrintableHtml = (
    mode: ExportMode,
    items: SubmissionRecord[]
  ): string => {
    const nowStr = new Date().toLocaleString();

    let contentHtml = '';

    if (mode === 'ledger') {
      // Summary Ledger Table
      const rowsHtml = items
        .map(
          (s, idx) => `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 8px 10px; font-weight: bold; color: #475569;">#${idx + 1}</td>
            <td style="padding: 8px 10px;">
              <div style="font-weight: bold; color: #0f172a;">${s.participantName}</div>
              <div style="color: #64748b; font-size: 10px;">${s.participantEmail} ${s.participantPhone ? `• ${s.participantPhone}` : ''}</div>
            </td>
            <td style="padding: 8px 10px; font-weight: bold; color: #047857; text-align: center;">${s.score} / ${s.totalQuestions}</td>
            <td style="padding: 8px 10px; color: #047857; text-align: center;">${s.correct}</td>
            <td style="padding: 8px 10px; color: #b91c1c; text-align: center;">${s.wrong}</td>
            <td style="padding: 8px 10px; text-align: center; color: #0284c7; font-weight: bold;">${s.timeUsed}s</td>
            <td style="padding: 8px 10px; text-align: center; font-weight: bold;">${Math.round((s.score / s.totalQuestions) * 100)}%</td>
            <td style="padding: 8px 10px; text-align: right; color: #64748b; font-size: 10px;">${new Date(s.submittedAt).toLocaleDateString()} ${new Date(s.submittedAt).toLocaleTimeString()}</td>
          </tr>
        `
        )
        .join('');

      contentHtml = `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; text-transform: uppercase;">
            CONTESTANT SUBMISSIONS LEDGER & EVALUATION SUMMARY
          </h2>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 16px 0;">
            Authoritative server-evaluated candidate answer scripts recorded for weekly competition benchmarking.
          </p>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Total Submissions</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${items.length}</div>
            </div>
            <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Highest Score</div>
              <div style="font-size: 18px; font-weight: 800; color: #047857;">${filterStats.maxScore} / 30</div>
            </div>
            <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Average Score</div>
              <div style="font-size: 18px; font-weight: 800; color: #0284c7;">${filterStats.avgScore} / 30</div>
            </div>
            <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Fastest Completion</div>
              <div style="font-size: 18px; font-weight: 800; color: #b45309;">${filterStats.minTime}s</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 8px 10px;">Rank</th>
                <th style="padding: 8px 10px;">Contestant</th>
                <th style="padding: 8px 10px; text-align: center;">Score</th>
                <th style="padding: 8px 10px; text-align: center;">Correct</th>
                <th style="padding: 8px 10px; text-align: center;">Wrong</th>
                <th style="padding: 8px 10px; text-align: center;">Time Used</th>
                <th style="padding: 8px 10px; text-align: center;">Accuracy</th>
                <th style="padding: 8px 10px; text-align: right;">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    } else {
      // Individual or Multi-Candidate Dossier
      contentHtml = items
        .map((s, idx) => {
          const answersEntries = Object.entries(s.answers || {});

          const questionsBreakdownHtml = answersEntries
            .map(([qId, selectedOption], qIdx) => {
              const q = questionMap.get(qId);
              const isCorrect =
                q && selectedOption.toUpperCase() === q.correctAnswer.toUpperCase();

              return `
              <div style="padding: 10px; margin-bottom: 8px; border: 1px solid ${
                isCorrect ? '#a7f3d0' : '#fecaca'
              }; background: ${
                isCorrect ? '#ecfdf5' : '#fff1f2'
              }; border-radius: 6px; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <span style="font-weight: 700; font-size: 11px; color: #0f172a;">
                    Q${qIdx + 1}: ${q?.questionText || qId}
                  </span>
                  <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: ${
                    isCorrect ? '#047857' : '#b91c1c'
                  }; background: ${isCorrect ? '#d1fae5' : '#fee2e2'};">
                    ${isCorrect ? '+1.0 MARK (CORRECT)' : '0.0 MARKS (WRONG)'}
                  </span>
                </div>

                <div style="display: flex; gap: 20px; font-size: 10px; color: #334155; margin-top: 4px;">
                  <div>Participant Response: <strong style="color: #0f172a;">Option ${selectedOption}</strong></div>
                  <div>Official Answer Key: <strong style="color: #047857;">Option ${
                    q?.correctAnswer || 'N/A'
                  }</strong></div>
                  ${q?.category ? `<div>Category: <span style="color: #64748b;">${q.category}</span></div>` : ''}
                  ${q?.difficulty ? `<div>Difficulty: <span style="color: #64748b;">${q.difficulty}</span></div>` : ''}
                </div>

                ${
                  q?.explanation
                    ? `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; font-size: 9.5px; color: #64748b; font-style: italic;">
                    Solution Note: ${q.explanation}
                  </div>`
                    : ''
                }
              </div>
            `;
            })
            .join('');

          return `
            <div style="${idx < items.length - 1 ? 'page-break-after: always;' : ''} margin-bottom: 30px;">
              <!-- Document Header Box -->
              <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase;">
                      CONTESTANT ANSWER SCRIPT EVALUATION REPORT
                    </h2>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                      Quiz Edition: <strong>${s.quizTitle || 'Weekly Hardware Challenge'}</strong> // Script ID: ${s.id}
                    </div>
                  </div>
                  <div style="text-align: right; font-size: 10px; color: #64748b;">
                    <div>Attempt Ref: <code>${s.attemptId}</code></div>
                    <div>Submitted: <strong>${new Date(s.submittedAt).toLocaleDateString()} ${new Date(s.submittedAt).toLocaleTimeString()}</strong></div>
                  </div>
                </div>
              </div>

              <!-- Participant Profile & KPI Matrix -->
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 18px;">
                <div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #64748b;">Participant Name & Email</div>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${s.participantName}</div>
                  <div style="font-size: 10px; color: #475569;">${s.participantEmail}</div>
                  ${s.participantPhone ? `<div style="font-size: 9.5px; color: #64748b;">Phone: ${s.participantPhone}</div>` : ''}
                </div>
                <div style="text-align: center; border-left: 1px solid #e2e8f0;">
                  <div style="font-size: 9px; text-transform: uppercase; color: #64748b;">Total Marks</div>
                  <div style="font-size: 16px; font-weight: 900; color: #047857;">${s.score} / ${s.totalQuestions}</div>
                </div>
                <div style="text-align: center; border-left: 1px solid #e2e8f0;">
                  <div style="font-size: 9px; text-transform: uppercase; color: #64748b;">Correct</div>
                  <div style="font-size: 16px; font-weight: 900; color: #047857;">${s.correct}</div>
                </div>
                <div style="text-align: center; border-left: 1px solid #e2e8f0;">
                  <div style="font-size: 9px; text-transform: uppercase; color: #64748b;">Incorrect</div>
                  <div style="font-size: 16px; font-weight: 900; color: #b91c1c;">${s.wrong}</div>
                </div>
                <div style="text-align: center; border-left: 1px solid #e2e8f0;">
                  <div style="font-size: 9px; text-transform: uppercase; color: #64748b;">Time Taken</div>
                  <div style="font-size: 16px; font-weight: 900; color: #0284c7;">${s.timeUsed}s</div>
                </div>
              </div>

              <!-- Question by Question Title -->
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 10px; letter-spacing: 0.5px;">
                Verified Answer Script Breakdown (${answersEntries.length} Items Evaluated):
              </div>

              <!-- Question Cards -->
              <div>
                ${questionsBreakdownHtml}
              </div>

              <!-- Verification Sign-off Box -->
              <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; page-break-inside: avoid;">
                <div>
                  <div>AEC Hardware Club • Authoritative Examination Committee</div>
                  <div>Official Cryptographic Audit Hash: <code>#${s.id.slice(0, 16)}</code></div>
                </div>
                <div style="text-align: right; min-width: 180px;">
                  <div style="border-bottom: 1px solid #94a3b8; height: 24px; margin-bottom: 4px;"></div>
                  <div>Authorized Club Evaluator Signature</div>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>AEC Hardware Club - Answer Script Export</title>
          <style>
            @page {
              size: A4;
              margin: 15mm 12mm 15mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-banner {
              border-bottom: 3px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 18px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .club-brand {
              font-size: 15px;
              font-weight: 900;
              letter-spacing: 1px;
              text-transform: uppercase;
              color: #0f172a;
            }
            .club-sub {
              font-size: 10px;
              color: #047857;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .report-date {
              font-size: 10px;
              color: #64748b;
              text-align: right;
            }
            .footer-banner {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="club-brand">AEC HARDWARE CLUB</div>
              <div class="club-sub">EMBEDDED SYSTEMS DIVISION // WEEKLY BENCHMARK AUDIT</div>
            </div>
            <div class="report-date">
              <div>OFFICIAL ARCHIVE EXPORT</div>
              <div>Generated: ${nowStr}</div>
            </div>
          </div>

          ${contentHtml}

          <div class="footer-banner">
            CONFIDENTIAL • AEC HARDWARE CLUB EXAMINATION REGISTRY • AUTHORITATIVE RECORDS
          </div>
        </body>
      </html>
    `;
  };

  // Trigger Browser Print Dialogue to Save as PDF
  const handlePrintPdf = () => {
    const printHtml = generatePrintableHtml(exportMode, targetSubmissions);

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(printHtml);
      frameDoc.close();

      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 2000);
      }, 350);
    }
  };

  // Direct Download HTML Backup
  const handleDownloadHtml = () => {
    const printHtml = generatePrintableHtml(exportMode, targetSubmissions);
    const blob = new Blob([printHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEC_Hardware_Answer_Scripts_${exportMode}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Action Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Answer Scripts
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'time' | 'date')}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="score">Sort: Highest Score First</option>
            <option value="time">Sort: Fastest Time Used</option>
            <option value="date">Sort: Most Recent Submission</option>
          </select>

          {/* Export Filtered Summary Ledger PDF Button */}
          <button
            onClick={() => handleOpenBatchPdf('ledger')}
            disabled={sortedSubmissions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-xs font-mono text-slate-200 hover:text-emerald-300 transition shadow-sm cursor-pointer disabled:opacity-40"
            title="Export filtered participants as a formatted summary ledger PDF"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>LEDGER PDF ({sortedSubmissions.length})</span>
          </button>

          {/* Export Comprehensive Dossier PDF Button */}
          <button
            onClick={() => handleOpenBatchPdf('dossier')}
            disabled={sortedSubmissions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 text-xs font-mono text-emerald-300 transition shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer disabled:opacity-40 font-bold"
            title="Export full question-by-question scripts for all filtered candidates into a multi-page PDF"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>FULL DOSSIER PDF</span>
          </button>
        </div>
      </div>

      {/* Search Input & KPI Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by participant name, email, or phone number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080d12] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="md:col-span-4 flex items-center justify-between px-4 py-2 rounded-xl bg-[#080d12] border border-slate-800 font-mono text-xs text-slate-400">
          <span>MATCHES: <strong className="text-white">{sortedSubmissions.length}</strong></span>
          <span>AVG: <strong className="text-emerald-400">{filterStats.avgScore}/25</strong></span>
          <span>HIGH: <strong className="text-amber-400">{filterStats.maxScore}/25</strong></span>
        </div>
      </div>

      {/* Submissions Table with Quick Row PDF Export */}
      <div className="rounded-2xl bg-[#080d12] border border-emerald-500/20 overflow-hidden shadow-xl">
        {sortedSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs space-y-1">
            <p>NO SUBMITTED ANSWER SCRIPTS MATCH SEARCH CRITERIA</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-emerald-400 underline cursor-pointer text-[11px]"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950/80 text-[10px] text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Participant</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Correct</th>
                  <th className="p-3.5">Wrong</th>
                  <th className="p-3.5">Time Used</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sortedSubmissions.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3.5 font-bold text-slate-400">
                      #{String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{s.participantName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{s.participantEmail}</span>
                        {s.participantPhone && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400/80">{s.participantPhone}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-base font-black text-amber-400">
                        {s.score}
                      </span>
                      <span className="text-[10px] text-slate-500"> / {s.totalQuestions}</span>
                    </td>
                    <td className="p-3.5 text-emerald-400 font-bold">{s.correct}</td>
                    <td className="p-3.5 text-rose-400 font-bold">{s.wrong}</td>
                    <td className="p-3.5 font-bold text-cyan-300">{s.timeUsed}s</td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(s.submittedAt).toLocaleDateString()} {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Row PDF Button */}
                        <button
                          onClick={() => handleOpenSinglePdf(s)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-xs text-emerald-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                          title="Export candidate's answer script as formatted PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>PDF</span>
                        </button>

                        {/* Full Screen Script Inspector */}
                        <button
                          onClick={() => setSelectedSubmission(s)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                          title="Inspect question-by-question responses"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>SCRIPT</span>
                        </button>

                        {/* Delete Submission Action */}
                        {onDeleteSubmission && (
                          <button
                            onClick={() => setDeletingSubmission(s)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-xs text-rose-400 hover:text-rose-200 transition flex items-center gap-1 cursor-pointer"
                            title="Delete this candidate's answer script"
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

      {/* Answer Script Full Inspection Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-2xl bg-[#090f14] border border-emerald-500/40 p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">
                  AUTHORITATIVE SCRIPT RECORD // {selectedSubmission.id}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedSubmission.participantName} ({selectedSubmission.participantEmail})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Export this individual script as PDF */}
                <button
                  onClick={() => handleOpenSinglePdf(selectedSubmission)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs transition cursor-pointer font-bold"
                  title="Print or save this script as PDF document"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EXPORT SCRIPT AS PDF</span>
                </button>

                {/* Delete Script from inspection modal */}
                {onDeleteSubmission && (
                  <button
                    onClick={() => setDeletingSubmission(selectedSubmission)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-400 hover:text-rose-200 font-mono text-xs transition cursor-pointer"
                    title="Delete this answer script"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Score & Timing Summary Bar */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center text-xs mb-6">
              <div>
                <span className="text-slate-500 text-[10px] block">TOTAL SCORE</span>
                <span className="text-xl font-black text-amber-400">{selectedSubmission.score}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CORRECT</span>
                <span className="text-xl font-black text-emerald-400">{selectedSubmission.correct}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">WRONG</span>
                <span className="text-xl font-black text-rose-400">{selectedSubmission.wrong}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">TIME USED</span>
                <span className="text-xl font-black text-cyan-400">{selectedSubmission.timeUsed}s</span>
              </div>
            </div>

            {/* Detailed Question By Question Analysis */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-slate-400 uppercase">
                QUESTION-BY-QUESTION BREAKDOWN:
              </h4>

              {Object.entries(selectedSubmission.answers).map(([qId, selectedOption], idx) => {
                const question = questionMap.get(qId);
                const isCorrect =
                  question && selectedOption.toUpperCase() === question.correctAnswer.toUpperCase();

                return (
                  <div
                    key={qId}
                    className={`p-3.5 rounded-xl border text-xs font-mono space-y-1.5 ${
                      isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        Q{String(idx + 1).padStart(2, '0')}: {question?.questionText || qId}
                      </span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> +1 CORRECT
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" /> 0 WRONG
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Participant Selected: <strong className="text-white">Option {selectedOption}</strong></span>
                      <span>Correct Key: <strong className="text-emerald-400">Option {question?.correctAnswer || 'N/A'}</strong></span>
                    </div>

                    {question?.explanation && (
                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                        Explanation: {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Formatted PDF Document Preview & Print Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-[#080d12] border-2 border-emerald-500/50 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-slate-100">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-slate-950 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-white uppercase">
                    Formatted PDF Export Console
                  </h3>
                  <p className="font-mono text-[10px] text-slate-400">
                    AEC HARDWARE CLUB // PRINT-OPTIMIZED ARCHIVAL DOCUMENT
                  </p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
                {targetSubmissions.length === 1 ? (
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    SINGLE SCRIPT ({targetSubmissions[0].participantName})
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => setExportMode('ledger')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        exportMode === 'ledger'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      SUMMARY LEDGER
                    </button>
                    <button
                      onClick={() => setExportMode('dossier')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        exportMode === 'dossier'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      FULL SCRIPTS DOSSIER
                    </button>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadHtml}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 font-mono text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  title="Download standalone HTML backup"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">HTML</span>
                </button>

                <button
                  onClick={handlePrintPdf}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT / SAVE AS PDF</span>
                </button>

                <button
                  onClick={() => setPdfModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview Sheet */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-900/50 flex justify-center">
              <div className="w-full max-w-3xl bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-2xl border border-slate-300 font-sans text-xs">
                {/* Print Header */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900 mb-5">
                  <div>
                    <h2 className="text-base font-black tracking-wide uppercase text-slate-900">
                      AEC HARDWARE CLUB
                    </h2>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                      EMBEDDED SYSTEMS DIVISION // EVALUATION EXAMINATION ARCHIVE
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-mono">
                    <div>OFFICIAL RECORD</div>
                    <div>{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Preview Body */}
                {exportMode === 'ledger' ? (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-800 mb-2">
                      PARTICIPANT SUBMISSIONS SUMMARY LEDGER ({targetSubmissions.length} RECORDS)
                    </h3>
                    <div className="grid grid-cols-4 gap-2 mb-4 text-center font-mono">
                      <div className="p-2 bg-slate-100 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">SUBMISSIONS</span>
                        <span className="text-sm font-bold text-slate-900">{targetSubmissions.length}</span>
                      </div>
                      <div className="p-2 bg-slate-100 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">TOP SCORE</span>
                        <span className="text-sm font-bold text-emerald-700">{filterStats.maxScore}/30</span>
                      </div>
                      <div className="p-2 bg-slate-100 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">AVG SCORE</span>
                        <span className="text-sm font-bold text-sky-700">{filterStats.avgScore}/30</span>
                      </div>
                      <div className="p-2 bg-slate-100 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">FASTEST SOLVE</span>
                        <span className="text-sm font-bold text-amber-700">{filterStats.minTime}s</span>
                      </div>
                    </div>

                    <table className="w-full text-left font-mono text-[10px] border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-2">#</th>
                          <th className="p-2">Contestant</th>
                          <th className="p-2 text-center">Score</th>
                          <th className="p-2 text-center">Correct</th>
                          <th className="p-2 text-center">Wrong</th>
                          <th className="p-2 text-center">Time</th>
                          <th className="p-2 text-center">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {targetSubmissions.slice(0, 15).map((s, idx) => (
                          <tr key={s.id}>
                            <td className="p-2 font-bold">{idx + 1}</td>
                            <td className="p-2">
                              <span className="font-bold text-slate-900">{s.participantName}</span>
                              <span className="text-[9px] text-slate-500 block">{s.participantEmail}</span>
                            </td>
                            <td className="p-2 text-center font-bold text-emerald-700">{s.score}/30</td>
                            <td className="p-2 text-center text-emerald-700">{s.correct}</td>
                            <td className="p-2 text-center text-rose-700">{s.wrong}</td>
                            <td className="p-2 text-center font-bold text-sky-700">{s.timeUsed}s</td>
                            <td className="p-2 text-center font-bold">{Math.round((s.score / s.totalQuestions) * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {targetSubmissions.length > 15 && (
                      <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                        ... plus {targetSubmissions.length - 15} more records will be printed in full in the exported PDF.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {targetSubmissions.slice(0, 2).map((s, cIdx) => (
                      <div key={s.id} className="mb-6 pb-6 border-b border-slate-300">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-700 uppercase">
                              CANDIDATE #{cIdx + 1} • {s.quizTitle || 'Weekly Hardware Challenge'}
                            </span>
                            <h3 className="text-sm font-black text-slate-900 uppercase">
                              {s.participantName}
                            </h3>
                            <span className="text-[10px] text-slate-600 font-mono">
                              {s.participantEmail} {s.participantPhone ? `• ${s.participantPhone}` : ''}
                            </span>
                          </div>
                          <div className="text-right font-mono text-xs">
                            <span className="font-black text-emerald-700 text-sm">
                              SCORE: {s.score} / {s.totalQuestions}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              TIME: {s.timeUsed}s
                            </span>
                          </div>
                        </div>

                        {/* Sample Question Cards Preview */}
                        <div className="space-y-1.5 font-mono text-[10px]">
                          {Object.entries(s.answers).slice(0, 5).map(([qId, selectedOption], qIdx) => {
                            const question = questionMap.get(qId);
                            const isCorrect =
                              question && selectedOption.toUpperCase() === question.correctAnswer.toUpperCase();

                            return (
                              <div
                                key={qId}
                                className={`p-2 rounded border ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                                } flex items-center justify-between`}
                              >
                                <div>
                                  <span className="font-bold">
                                    Q{qIdx + 1}: {question?.questionText?.slice(0, 70) || qId}...
                                  </span>
                                  <div className="text-[9px] text-slate-600 mt-0.5">
                                    Selected: <strong>Option {selectedOption}</strong> | Correct: <strong>Option {question?.correctAnswer || 'A'}</strong>
                                  </div>
                                </div>
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {isCorrect ? '+1.0' : '0.0'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {targetSubmissions.length > 2 && (
                      <p className="text-[10px] text-slate-500 italic text-center">
                        ... plus {targetSubmissions.length - 2} additional candidate scripts will be formatted with full page breaks in the PDF export.
                      </p>
                    )}
                  </div>
                )}

                {/* Print Sign-off Box */}
                <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-[9px] text-slate-500 font-mono">
                  <div>
                    <div>AEC Hardware Club • Official Evaluation Registry</div>
                    <div>Verification Hash: #AEC-EVAL-CERTIFIED</div>
                  </div>
                  <div className="text-right">
                    <div className="border-b border-slate-400 w-36 mb-1"></div>
                    <div>Examiner Signature & Seal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Submission Confirmation Modal */}
      {deletingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#090f14] border border-rose-500/40 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete Answer Script?</h3>
                <p className="font-mono text-xs text-slate-400">Irreversible administrative action</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
              <div>Candidate: <strong className="text-white">{deletingSubmission.participantName}</strong></div>
              <div>Email: <span className="text-emerald-400">{deletingSubmission.participantEmail || 'N/A'}</span></div>
              <div>Script ID: <code className="text-slate-400">{deletingSubmission.id}</code></div>
              <div>Score: <strong className="text-amber-400">{deletingSubmission.score} / {deletingSubmission.totalQuestions}</strong> ({deletingSubmission.timeUsed}s)</div>
              <div className="text-[11px] text-rose-400/90 pt-1">
                ⚠️ This will permanently erase this candidate&apos;s answer script evaluation and recorded score.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubmission(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={confirmDeleteSubmission}
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
