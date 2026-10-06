import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Copy,
  Users,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { SubmissionRecord } from '../../types/quiz';

interface AdminSettingsProps {
  submissions: SubmissionRecord[];
  onTriggerSync: () => Promise<{ totalPending: number; syncedCount: number; errors: string[] }>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  submissions,
  onTriggerSync,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    totalPending: number;
    syncedCount: number;
    errors: string[];
  } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const syncedCount = submissions.filter((s) => s.syncedToSheets).length;
  const pendingCount = submissions.filter((s) => !s.syncedToSheets).length;

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await onTriggerSync();
      setSyncResult(res);
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = (type: 'participants' | 'scripts') => {
    window.location.href = `/api/admin/export-csv?type=${type}`;
  };

  const appsScriptCode = `// Google Apps Script to receive submissions from AEC Hardware Club Server
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Participants
  var sheet1 = ss.getSheetByName("Participants") || ss.insertSheet("Participants");
  if (sheet1.getLastRow() === 0) {
    sheet1.appendRow(["Participant ID", "Name", "Email", "Phone", "Quiz ID", "Quiz Name", "Started At", "Submitted At", "Time Used", "Status", "Score"]);
  }
  sheet1.appendRow(data.sheet1_participant);
  
  // Sheet 2: Answer Scripts
  var sheet2 = ss.getSheetByName("Answer Scripts") || ss.insertSheet("Answer Scripts");
  if (sheet2.getLastRow() === 0) {
    var headers = ["Participant ID", "Name", "Email", "Quiz ID"];
    for (var i = 1; i <= 30; i++) headers.push("Q" + (i < 10 ? "0" + i : i));
    headers.push("Correct", "Wrong", "Score", "Time Used");
    sheet2.appendRow(headers);
  }
  sheet2.appendRow(data.sheet2_answerScript);
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-4 border-b border-emerald-500/20">
        <h1 className="text-2xl font-black text-white uppercase">Settings & Google Sheets</h1>
      </div>

      {/* Google Sheets Sync Status Card */}
      <div className="p-6 rounded-2xl bg-[#090f14] border-2 border-emerald-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white uppercase">
                Google Sheets Auto-Append Engine
              </h2>
              <p className="text-xs font-mono text-emerald-400">
                SHEET 1: PARTICIPANTS • SHEET 2: ANSWER SCRIPTS
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider uppercase transition shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'SYNCING...' : 'SYNC PENDING TO SHEETS'}</span>
          </button>
        </div>

        {/* Sync Status Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">TOTAL SUBMISSIONS</span>
            <span className="text-2xl font-bold text-white">{submissions.length}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-center font-mono">
            <span className="text-[10px] text-emerald-400 uppercase block">SYNCED TO SHEETS</span>
            <span className="text-2xl font-bold text-emerald-300">{syncedCount}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-center font-mono">
            <span className="text-[10px] text-amber-400 uppercase block">PENDING / RETRYABLE</span>
            <span className="text-2xl font-bold text-amber-300">{pendingCount}</span>
          </div>
        </div>

        {/* Sync Trigger Result Feedback */}
        {syncResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
            <div className="text-emerald-400 font-bold">
              ✓ Sync run finished: Processed {syncResult.syncedCount} submissions.
            </div>
            {syncResult.errors.length > 0 && (
              <div className="text-amber-400">
                Notice: {syncResult.errors.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Instant CSV Downloads */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-mono">
            Direct download offline spreadsheets at any time:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('participants')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHEET 1 (PARTICIPANTS.CSV)</span>
            </button>
            <button
              onClick={() => handleExport('scripts')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHEET 2 (ANSWER_SCRIPTS.CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Instructions & Code Adapter */}
      <div className="p-6 rounded-2xl bg-[#080d12] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>CONNECTING YOUR CLUB GOOGLE SHEET</span>
          </div>
          <button
            onClick={copyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedSnippet ? 'COPIED!' : 'COPY APPS SCRIPT'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          To set up zero-credential auto-appending into a real Google Sheet, follow these simple club steps:
        </p>

        <ol className="list-decimal pl-5 space-y-2 text-xs font-mono text-slate-400">
          <li>Create a blank Google Sheet titled <strong className="text-white">"AEC Hardware Club — Weekly Quiz"</strong>.</li>
          <li>In your Google Sheet, open <strong className="text-white">Extensions → Apps Script</strong>.</li>
          <li>Paste the code snippet below and click <strong className="text-white">Deploy → New deployment</strong> (Select type: <em>Web app</em>, Access: <em>Anyone</em>).</li>
          <li>Copy the Web App URL and add it to your server environment as <code className="text-emerald-400">GOOGLE_SHEETS_WEBHOOK_URL</code>.</li>
        </ol>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
          <pre className="font-mono text-[11px] text-emerald-300 leading-relaxed">
            {appsScriptCode}
          </pre>
        </div>
      </div>

      {/* Admin Security Roster */}
      <div className="p-6 rounded-2xl bg-[#080d12] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>CONFIGURED ADMINISTRATOR ROSTER</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-300">
            <span>Super Administrator:</span>
            <span className="text-emerald-400 font-bold">aritrabhui@gmail.com</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Privileges:</span>
            <span>Full System Control, Quiz State, Winner Release</span>
          </div>
        </div>
      </div>
    </div>
  );
};
