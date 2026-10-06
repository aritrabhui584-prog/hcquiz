import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  Radio,
  Trophy,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Eye,
  X,
  Code
} from 'lucide-react';
import { AuditLogItem, AuditEventType } from '../../types/quiz';

interface AdminAuditLogsProps {
  logs: AuditLogItem[];
  onRefresh: () => Promise<void>;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actorName && log.actorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || log.eventType === filterType;
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;

    return matchesSearch && matchesType && matchesCategory && matchesSeverity;
  });

  const getEventBadge = (type: AuditEventType) => {
    switch (type) {
      case 'QUIZ_START':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>QUIZ_START</span>
          </span>
        );
      case 'QUIZ_SUBMIT':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
            <Send className="w-2.5 h-2.5" />
            <span>QUIZ_SUBMIT</span>
          </span>
        );
      case 'STATUS_CHANGE':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5" />
            <span>STATUS_CHANGE</span>
          </span>
        );
      case 'WINNERS_PUBLISHED':
      case 'WINNERS_UNPUBLISHED':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-yellow-950/60 border border-yellow-500/40 text-yellow-300 flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" />
            <span>{type}</span>
          </span>
        );
      case 'QUESTION_MUTATION':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center gap-1">
            <HelpCircle className="w-2.5 h-2.5" />
            <span>QUESTION_MUTATION</span>
          </span>
        );
      case 'SHEETS_SYNC':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-950/60 border border-blue-500/40 text-blue-300 flex items-center gap-1">
            <FileSpreadsheet className="w-2.5 h-2.5" />
            <span>SHEETS_SYNC</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
            {type}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: 'INFO' | 'WARN' | 'CRITICAL') => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            CRITICAL
          </span>
        );
      case 'WARN':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            WARN
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
            INFO
          </span>
        );
    }
  };

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AEC_Audit_Logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">Audit Logs</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadJson}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition"
            title="Export audit log JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider uppercase transition shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'REFRESHING...' : 'REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#080d12] border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">TOTAL EVENTS LOGGED</span>
          <span className="text-xl font-bold text-white">{logs.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#080d12] border border-cyan-500/20 font-mono">
          <span className="text-[10px] text-cyan-400 uppercase block">QUIZ STARTS</span>
          <span className="text-xl font-bold text-cyan-300">
            {logs.filter((l) => l.eventType === 'QUIZ_START').length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#080d12] border border-emerald-500/20 font-mono">
          <span className="text-[10px] text-emerald-400 uppercase block">SUBMISSIONS</span>
          <span className="text-xl font-bold text-emerald-300">
            {logs.filter((l) => l.eventType === 'QUIZ_SUBMIT').length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#080d12] border border-amber-500/20 font-mono">
          <span className="text-[10px] text-amber-400 uppercase block">ADMIN MUTATIONS</span>
          <span className="text-xl font-bold text-amber-300">
            {logs.filter((l) => l.category === 'ADMIN' || l.eventType === 'STATUS_CHANGE').length}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search details, actor email, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080d12] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#080d12] border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
        >
          <option value="ALL">All Event Types</option>
          <option value="QUIZ_START">QUIZ_START</option>
          <option value="QUIZ_SUBMIT">QUIZ_SUBMIT</option>
          <option value="STATUS_CHANGE">STATUS_CHANGE</option>
          <option value="WINNERS_PUBLISHED">WINNERS_PUBLISHED</option>
          <option value="QUESTION_MUTATION">QUESTION_MUTATION</option>
          <option value="SHEETS_SYNC">SHEETS_SYNC</option>
          <option value="CONFIG_CHANGE">CONFIG_CHANGE</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#080d12] border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
        >
          <option value="ALL">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      {/* Chronological Table */}
      <div className="rounded-2xl bg-[#080d12] border border-emerald-500/20 overflow-hidden shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            NO AUDIT LOG ENTRIES FOUND MATCHING CRITERIA
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950/80 text-[10px] text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Actor / Origin</th>
                  <th className="p-3.5">Log Description</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                      <span className="text-[9px] text-slate-600 block">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getEventBadge(log.eventType)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-white text-[11px]">
                        {log.actorName || log.actorEmail || 'System'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {log.actorEmail}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-md">
                      <p className="text-slate-200 text-xs truncate" title={log.details}>
                        {log.details}
                      </p>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>INSPECT</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-[#090f14] border border-cyan-500/40 p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-white uppercase">
                  SECURITY AUDIT TELEMETRY // {selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:text-rose-400 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">EVENT:</span>
                  <span className="font-bold text-cyan-300">{selectedLog.eventType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CATEGORY:</span>
                  <span className="font-bold text-emerald-400">{selectedLog.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SEVERITY:</span>
                  <span>{getSeverityBadge(selectedLog.severity)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">RECORDED:</span>
                  <span className="text-slate-300 text-[10px] truncate block">
                    {new Date(selectedLog.timestamp).toISOString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs text-slate-400 uppercase mb-1">
                  Actor Information
                </h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="text-white">{selectedLog.actorName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-white">{selectedLog.actorEmail || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">UID:</span>
                    <span className="text-slate-400 text-[11px]">{selectedLog.actorUid || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs text-slate-400 uppercase mb-1">
                  Event Description
                </h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
                  {selectedLog.details}
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Payload Metadata (JSON)</span>
                  </h4>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
