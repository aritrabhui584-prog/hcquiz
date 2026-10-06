import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Layers,
  HelpCircle,
  Cpu,
  Users,
  FileSpreadsheet,
  Trophy,
  Settings,
  Eye,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { QuizStatus } from '../../types/quiz';

export type AdminTab =
  | 'dashboard'
  | 'quiz-control'
  | 'quizzes'
  | 'questions'
  | 'animations'
  | 'participants'
  | 'submissions'
  | 'winners'
  | 'settings'
  | 'audit-logs';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  quizStatus?: QuizStatus;
  quizTitle?: string;
  onOpenPreview: () => void;
  onExitToApp: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  quizStatus = 'LIVE',
  quizTitle = 'SHARADIYA CIRCUIT 2026',
  onOpenPreview,
  onExitToApp,
  children,
}) => {
  const { userProfile, logout } = useAuth();

  const navItems: { tab: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'quiz-control', label: 'Quiz Control', icon: <Radio className="w-4 h-4 text-emerald-400" />, badge: quizStatus },
    { tab: 'quizzes', label: 'Quiz Editions', icon: <Layers className="w-4 h-4" /> },
    { tab: 'questions', label: 'Questions', icon: <HelpCircle className="w-4 h-4" /> },
    { tab: 'animations', label: 'Animations', icon: <Cpu className="w-4 h-4 text-cyan-400" /> },
    { tab: 'participants', label: 'Participants', icon: <Users className="w-4 h-4" /> },
    { tab: 'submissions', label: 'Answer Scripts', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { tab: 'winners', label: 'Winner Management', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { tab: 'audit-logs', label: 'Audit Logs', icon: <ShieldAlert className="w-4 h-4 text-emerald-400" /> },
    { tab: 'settings', label: 'Settings & Sheets', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#05080b] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#070b0e] border-r border-emerald-500/20 flex flex-col shrink-0 select-none">
        {/* Brand Banner */}
        <div className="p-4 border-b border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-xs font-black tracking-widest text-white uppercase">
                AEC ADMIN CONSOLE
              </h2>
              <p className="font-mono text-[10px] text-emerald-400/80">HARDWARE QUIZ CONTROLLER</p>
            </div>
          </div>

          <div className="mt-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
            <span className="text-slate-400">CURRENT:</span>
            <span className="text-white font-bold truncate max-w-[120px]">{quizTitle}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition ${
                  isActive
                    ? 'bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : item.badge === 'PAUSED'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions & Mode Switcher */}
        <div className="p-3 border-t border-emerald-500/20 space-y-2">
          {/* Admin Simulation Preview */}
          <button
            onClick={onOpenPreview}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs font-bold transition"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>TEST PARTICIPANT SIM</span>
          </button>

          {/* Exit to Public App */}
          <button
            onClick={onExitToApp}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO PUBLIC APP</span>
          </button>

          {/* User Info & Logout */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800">
            <span className="truncate max-w-[130px]">{userProfile?.email}</span>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 hover:text-rose-400 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
