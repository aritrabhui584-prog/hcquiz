import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PublishedWinner } from '../../types/quiz';
import { HeaderLogo } from '../common/HeaderLogo';

interface WinnersPageProps {
  onBack: () => void;
}

export const WinnersPage: React.FC<WinnersPageProps> = ({ onBack }) => {
  const [winnerData, setWinnerData] = useState<PublishedWinner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const snap = await getDoc(doc(db, 'winners', 'win_quiz_sharadiya_2026'));
        if (snap.exists()) {
          setWinnerData(snap.data() as PublishedWinner);
        }
      } catch (err) {
        console.warn('Could not load winners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  const easeVisual = [0.16, 1, 0.3, 1];

  return (
    <main className="relative w-full min-h-[calc(100vh-6rem)] flex flex-col justify-between items-center text-center px-6 sm:px-10 lg:px-16 max-w-5xl mx-auto py-8 sm:py-12 select-none">
      {/* Top Bar Back Action */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono-tech text-xs text-[#A9B8B0] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO CIRCUIT</span>
        </button>
        <span className="font-mono-tech text-[11px] text-[#D8A94F] tracking-widest uppercase">
          OFFICIAL PODIUM
        </span>
      </div>

      {/* Header Eyebrow & Title */}
      <div className="relative z-10 flex flex-col items-center mb-10">
        <HeaderLogo size={42} className="mb-3" />
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#D8A94F]/10 border border-[#D8A94F]/30 text-[#D8A94F] font-mono-tech text-[10.5px] tracking-wider uppercase mb-2">
          {winnerData?.edition || 'SPECIAL EDITION 2026'}
        </div>
        <h1 className="font-display font-medium text-3xl sm:text-5xl text-white tracking-tight uppercase leading-tight">
          CIRCUIT CHAMPIONS
        </h1>
        <p className="text-xs sm:text-sm text-[#A9B8B0] mt-1 max-w-lg">
          {winnerData?.message || 'Recognizing the highest performing hardware engineers and circuit designers.'}
        </p>
      </div>

      {/* 3 Winner Positions (Podium with Photos) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto w-full items-end mb-8">
        
        {/* 2nd Place (Silver) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeVisual, delay: 0.2 }}
          className="rounded-2xl glass-panel p-6 sm:p-7 text-center border border-slate-300/30 bg-gradient-to-b from-[#18211E]/80 to-black/90 relative order-2 md:order-1"
        >
          <div className="relative w-20 h-20 mx-auto mb-3.5">
            {winnerData?.secondPlace?.photoURL ? (
              <img
                src={winnerData.secondPlace.photoURL}
                alt={winnerData.secondPlace.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-300/80 shadow-[0_0_20px_rgba(203,213,225,0.25)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-300/10 border-2 border-slate-300/40 text-slate-200 flex items-center justify-center text-2xl font-bold">
                {winnerData?.secondPlace?.name?.charAt(0) || <User className="w-8 h-8 opacity-50" />}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#121816] border border-slate-300/60 flex items-center justify-center text-sm shadow-md">
              🥈
            </div>
          </div>

          <span className="font-mono-tech text-[10px] tracking-widest text-[#A9B8B0] uppercase block mb-1">
            SECOND PLACE
          </span>
          <h3 className="font-display font-medium text-lg sm:text-xl text-white truncate">
            {winnerData?.secondPlace?.name || 'To Be Announced'}
          </h3>
          {winnerData?.secondPlace?.stream && (
            <p className="font-mono-tech text-[10.5px] text-[#7EE8A6] mt-0.5 truncate">
              {winnerData.secondPlace.stream}
            </p>
          )}
          <p className="font-mono-tech text-[10px] text-[#6F837A] mt-1">
            {winnerData?.secondPlace?.badgeTitle || 'Senior Systems Fellow'}
          </p>
        </motion.div>

        {/* 1st Place (Gold - Elevated Center) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeVisual, delay: 0.1 }}
          className="rounded-2xl glass-panel-gold p-7 sm:p-8 text-center relative order-1 md:order-2 shadow-2xl scale-105 z-20"
        >
          <div className="relative w-24 h-24 mx-auto mb-4">
            {winnerData?.firstPlace?.photoURL ? (
              <img
                src={winnerData.firstPlace.photoURL}
                alt={winnerData.firstPlace.name}
                className="w-24 h-24 rounded-full object-cover border-3 border-[#D8A94F] shadow-[0_0_30px_rgba(216,169,79,0.4)]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#D8A94F]/20 border-3 border-[#D8A94F] text-[#D8A94F] flex items-center justify-center text-3xl font-bold">
                {winnerData?.firstPlace?.name?.charAt(0) || <User className="w-10 h-10 opacity-60" />}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#121816] border-2 border-[#D8A94F] flex items-center justify-center text-base shadow-lg">
              🥇
            </div>
          </div>

          <span className="font-mono-tech text-[11px] tracking-widest text-[#D8A94F] uppercase font-bold block mb-1">
            FIRST PLACE // CHAMPION
          </span>
          <h2 className="font-display font-medium text-xl sm:text-2xl text-white truncate">
            {winnerData?.firstPlace?.name || 'To Be Announced'}
          </h2>
          {winnerData?.firstPlace?.stream && (
            <p className="font-mono-tech text-xs text-[#7EE8A6] mt-0.5 truncate font-medium">
              {winnerData.firstPlace.stream}
            </p>
          )}
          <p className="font-mono-tech text-xs text-[#D8A94F] mt-1.5">
            {winnerData?.firstPlace?.badgeTitle || 'Grand Hardware Architect'}
          </p>
        </motion.div>

        {/* 3rd Place (Bronze) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeVisual, delay: 0.3 }}
          className="rounded-2xl glass-panel p-6 sm:p-7 text-center border border-[#B62A35]/30 bg-gradient-to-b from-[#18211E]/80 to-black/90 relative order-3 md:order-3"
        >
          <div className="relative w-20 h-20 mx-auto mb-3.5">
            {winnerData?.thirdPlace?.photoURL ? (
              <img
                src={winnerData.thirdPlace.photoURL}
                alt={winnerData.thirdPlace.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#D8A94F]/70 shadow-[0_0_20px_rgba(182,42,53,0.25)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#B62A35]/15 border-2 border-[#B62A35]/40 text-[#D8A94F] flex items-center justify-center text-2xl font-bold">
                {winnerData?.thirdPlace?.name?.charAt(0) || <User className="w-8 h-8 opacity-50" />}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#121816] border border-[#D8A94F]/60 flex items-center justify-center text-sm shadow-md">
              🥉
            </div>
          </div>

          <span className="font-mono-tech text-[10px] tracking-widest text-[#A9B8B0] uppercase block mb-1">
            THIRD PLACE
          </span>
          <h3 className="font-display font-medium text-lg sm:text-xl text-white truncate">
            {winnerData?.thirdPlace?.name || 'To Be Announced'}
          </h3>
          {winnerData?.thirdPlace?.stream && (
            <p className="font-mono-tech text-[10.5px] text-[#7EE8A6] mt-0.5 truncate">
              {winnerData.thirdPlace.stream}
            </p>
          )}
          <p className="font-mono-tech text-[10px] text-[#6F837A] mt-1">
            {winnerData?.thirdPlace?.badgeTitle || 'Circuit Laureate'}
          </p>
        </motion.div>
      </div>

      {/* Footer Technical Note */}
      <div className="relative z-10 text-center font-mono-tech text-[10.5px] text-[#6F837A] pt-4">
        <span>AEC HARDWARE CLUB // STRICT CONTEST INTEGRITY PROTOCOL</span>
      </div>
    </main>
  );
};
