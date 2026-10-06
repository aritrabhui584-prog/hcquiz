import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Award,
  Medal,
  Clock,
  Search,
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  Flame,
  CheckCircle2,
  Calendar,
  Printer,
  Cpu
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LeaderboardRecord } from '../../types/quiz';

interface LeaderboardProps {
  onBack: () => void;
  onViewPodium: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, onViewPodium }) => {
  const [leaderboards, setLeaderboards] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'top3' | 'top10'>('all');

  // Fetch verified records from Firestore collection 'leaderboard'
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'leaderboard'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LeaderboardRecord[] = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() } as LeaderboardRecord)
          );
          // Sort by weekNumber descending or finalizedAt descending
          list.sort((a, b) => (b.weekNumber || 0) - (a.weekNumber || 0));
          setLeaderboards(list);
          if (!selectedRecordId || !list.some((r) => r.id === selectedRecordId)) {
            setSelectedRecordId(list[0]?.id || '');
          }
        } else {
          setLeaderboards([]);
          setSelectedRecordId('');
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Leaderboard fetch note:', err);
        setLeaderboards([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedRecordId]);

  // Active Leaderboard record
  const currentRecord = leaderboards.find((l) => l.id === selectedRecordId) || leaderboards[0];

  // Filter rankings based on search and tier
  const filteredRankings = (currentRecord?.rankings || []).filter((item) => {
    const matchesSearch = item.participantName
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;

    if (filterTier === 'top3') return item.rank <= 3;
    if (filterTier === 'top10') return item.rank <= 10;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#070b0e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Cybernetic PCB Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[650px] h-[650px] bg-emerald-500/8 blur-[180px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/5 blur-[130px] rounded-full" />

        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 1px, transparent 1px),
              linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px, 36px 36px, 36px 36px',
          }}
        />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-400 hover:text-white transition bg-[#080d12]/80 backdrop-blur-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
            <span>RETURN TO HOME</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onViewPodium}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-mono text-xs transition shadow-sm cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>VIEW 3-TIER PODIUM</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition cursor-pointer"
              title="Print standings table"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>PRINT</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>OFFICIAL FIRESTORE REGISTRY</span>
            </div>
          </div>
        </div>

        {/* Hero Title & Telemetry Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>OFFICIAL COMPETITIVE ARCHIVES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans">
              HARDWARE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                LEADERBOARD
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
              Final verified participant rankings and completion benchmarks for concluded weekly challenges.
            </p>
          </div>

          {/* Past Completed Quiz Edition Switcher Dropdown */}
          {leaderboards.length > 0 && (
            <div className="w-full md:w-auto min-w-[280px]">
              <label className="block font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>SELECT CHALLENGE EDITION</span>
              </label>
              <div className="relative">
                <select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-white font-mono text-xs focus:outline-none focus:border-emerald-400 cursor-pointer shadow-lg pr-9"
                >
                  {leaderboards.map((l) => (
                    <option key={l.id} value={l.id} className="bg-slate-950 text-white py-1">
                      {l.edition}: {l.quizTitle}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* If No Leaderboard Records Published in Firestore */}
        {!loading && leaderboards.length === 0 ? (
          <div className="py-20 rounded-2xl bg-[#080d12]/95 border border-emerald-500/25 p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-mono text-lg font-bold text-white uppercase">
                NO FINALIZED LEADERBOARDS RECORDED YET
              </h3>
              <p className="font-mono text-xs text-slate-400 max-w-md mx-auto">
                Official standings and participant benchmarks will appear here in real time once the current challenge edition is concluded and certified by club executives.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition cursor-pointer"
            >
              RETURN TO CHALLENGE
            </button>
          </div>
        ) : (
          <>
            {/* Edition Summary Performance Cards */}
            {currentRecord && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
                {/* Card 1: Total Contestants */}
                <div className="p-4 rounded-2xl bg-[#080d12]/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] uppercase tracking-wider">CONTESTANTS</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {currentRecord.totalParticipants || currentRecord.rankings.length}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    Verified server submissions
                  </p>
                </div>

                {/* Card 2: Highest Score */}
                <div className="p-4 rounded-2xl bg-[#080d12]/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] uppercase tracking-wider">TOP SCORE</span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300">
                    {currentRecord.rankings[0]?.score || 0} / 25
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    by {currentRecord.rankings[0]?.participantName || 'Champion'}
                  </p>
                </div>

                {/* Card 3: Fastest Time */}
                <div className="p-4 rounded-2xl bg-[#080d12]/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] uppercase tracking-wider">FASTEST SOLVE</span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-300">
                    {currentRecord.fastestTime ||
                      Math.min(...(currentRecord.rankings.map((r) => r.timeUsed) || [120]))}
                    s
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    Authoritative server timing
                  </p>
                </div>

                {/* Card 4: Class Average */}
                <div className="p-4 rounded-2xl bg-[#080d12]/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] uppercase tracking-wider">CLASS AVERAGE</span>
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-300">
                    {currentRecord.averageScore || '18.4'} / 25
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    Benchmark average marks
                  </p>
                </div>
              </div>
            )}

            {/* Top 3 Quick Podium Strip */}
            {currentRecord && currentRecord.rankings.length >= 3 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#0a1015] to-amber-950/20 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>TOP 3 PODIUM LAUREATES</span>
                  </span>
                  <button
                    onClick={onViewPodium}
                    className="font-mono text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Inspect ceremony →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 1st Place */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/60 text-amber-300 font-mono font-black flex items-center justify-center text-sm shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                        1st
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {currentRecord.rankings[0]?.participantName}
                        </h4>
                        <span className="font-mono text-[10px] text-amber-300">
                          {currentRecord.rankings[0]?.badgeTitle || 'Grand Champion'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-amber-300 text-sm">
                        {currentRecord.rankings[0]?.score}/25
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {currentRecord.rankings[0]?.timeUsed}s
                      </span>
                    </div>
                  </div>

                  {/* 2nd Place */}
                  <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-400/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-400/20 border border-slate-400/60 text-slate-200 font-mono font-black flex items-center justify-center text-sm">
                        2nd
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {currentRecord.rankings[1]?.participantName}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-300">
                          {currentRecord.rankings[1]?.badgeTitle || 'Senior Fellow'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-slate-200 text-sm">
                        {currentRecord.rankings[1]?.score}/25
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {currentRecord.rankings[1]?.timeUsed}s
                      </span>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="p-3.5 rounded-xl bg-amber-900/20 border border-amber-700/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-700/20 border border-amber-700/60 text-amber-400 font-mono font-black flex items-center justify-center text-sm">
                        3rd
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {currentRecord.rankings[2]?.participantName}
                        </h4>
                        <span className="font-mono text-[10px] text-amber-500">
                          {currentRecord.rankings[2]?.badgeTitle || 'Circuit Laureate'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-amber-400 text-sm">
                        {currentRecord.rankings[2]?.score}/25
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {currentRecord.rankings[2]?.timeUsed}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by contestant name..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/70 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto font-mono text-xs">
                <button
                  onClick={() => setFilterTier('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    filterTier === 'all'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  ALL ({currentRecord?.rankings.length || 0})
                </button>
                <button
                  onClick={() => setFilterTier('top10')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    filterTier === 'top10'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  TOP 10
                </button>
                <button
                  onClick={() => setFilterTier('top3')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    filterTier === 'top3'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  PODIUM (TOP 3)
                </button>
              </div>
            </div>

            {/* Master Rankings Table */}
            <div className="rounded-2xl bg-[#080d12]/95 border border-emerald-500/25 overflow-hidden shadow-2xl backdrop-blur-md">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <Cpu className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="font-mono text-xs text-slate-400">
                    FETCHING VERIFIED FIRESTORE STANDINGS...
                  </p>
                </div>
              ) : filteredRankings.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <p className="font-mono text-sm text-slate-400">
                    No contestants matched "{searchQuery}".
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterTier('all');
                    }}
                    className="font-mono text-xs text-emerald-400 underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-emerald-500/20 bg-slate-950/80 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4 sm:px-6">RANK</th>
                        <th className="py-3.5 px-4 sm:px-6">PARTICIPANT</th>
                        <th className="py-3.5 px-4 sm:px-6 text-center">MARKS (/25)</th>
                        <th className="py-3.5 px-4 sm:px-6 text-center">ACCURACY</th>
                        <th className="py-3.5 px-4 sm:px-6 text-center">TIME TAKEN</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                      {filteredRankings.map((item) => {
                        const isFirst = item.rank === 1;
                        const isSecond = item.rank === 2;
                        const isThird = item.rank === 3;

                        return (
                          <tr
                            key={`${item.rank}-${item.participantName}`}
                            className={`transition hover:bg-slate-900/60 ${
                              isFirst
                                ? 'bg-amber-500/5 hover:bg-amber-500/10'
                                : isSecond
                                ? 'bg-slate-400/5 hover:bg-slate-400/10'
                                : isThird
                                ? 'bg-amber-700/5 hover:bg-amber-700/10'
                                : ''
                            }`}
                          >
                            <td className="py-4 px-4 sm:px-6 font-mono">
                              {isFirst ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-bold border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                  <Trophy className="w-3 h-3 text-amber-400" />
                                  <span>#1</span>
                                </span>
                              ) : isSecond ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-400/20 text-slate-200 font-bold border border-slate-400/50">
                                  <Medal className="w-3 h-3 text-slate-300" />
                                  <span>#2</span>
                                </span>
                              ) : isThird ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-700/20 text-amber-400 font-bold border border-amber-700/50">
                                  <Award className="w-3 h-3 text-amber-500" />
                                  <span>#3</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold pl-2">
                                  #{item.rank}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4 sm:px-6">
                              <div className="font-bold text-white text-sm">
                                {item.participantName}
                              </div>
                              {item.badgeTitle && (
                                <span
                                  className={`inline-block font-mono text-[10px] mt-0.5 ${
                                    isFirst
                                      ? 'text-amber-400'
                                      : isSecond
                                      ? 'text-slate-300'
                                      : isThird
                                      ? 'text-amber-500'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {item.badgeTitle}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4 sm:px-6 text-center font-mono">
                              <div className="inline-block text-center">
                                <span className="text-sm font-black text-white">
                                  {item.score}
                                </span>
                                <span className="text-slate-500 text-[11px]">
                                  {' '}
                                  / {item.totalQuestions || 25}
                                </span>
                                <div className="w-16 h-1 rounded-full bg-slate-800 mx-auto mt-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isFirst
                                        ? 'bg-amber-400'
                                        : item.score >= 20
                                        ? 'bg-emerald-400'
                                        : 'bg-cyan-400'
                                    }`}
                                    style={{
                                      width: `${(item.score / (item.totalQuestions || 25)) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 sm:px-6 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs">
                                {item.accuracyPercentage !== undefined
                                  ? `${item.accuracyPercentage}%`
                                  : `${Math.round((item.score / (item.totalQuestions || 25)) * 100)}%`}
                              </span>
                            </td>

                            <td className="py-4 px-4 sm:px-6 text-center font-mono text-slate-300">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{item.timeUsed}s</span>
                              </span>
                            </td>

                            <td className="py-4 px-4 sm:px-6 text-right font-mono">
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>VERIFIED</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-3.5 bg-slate-950 border-t border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>COLLECTION: /databases/(default)/documents/leaderboard</span>
                </div>
                <div>
                  AUTHENTIC AEC HARDWARE CLUB BENCHMARK RECORD
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Division Note */}
      <div className="pt-8 mt-12 border-t border-slate-900 text-center font-mono text-xs text-slate-600 flex items-center justify-center gap-2">
        <Cpu className="w-3.5 h-3.5 text-slate-700" />
        <span>AEC HARDWARE CLUB // EMBEDDED SYSTEMS DIVISION // PUBLIC STANDINGS ARCHIVE</span>
      </div>
    </div>
  );
};
