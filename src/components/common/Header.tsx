import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { QuizEdition, QuizStatus } from '../../types/quiz';
import { HeaderLogo } from './HeaderLogo';

interface HeaderProps {
  quiz?: QuizEdition | null;
  quizStatus?: QuizStatus;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quiz,
  quizStatus,
  currentRoute,
  onNavigate,
  onOpenRules,
}) => {
  const { currentUser, userProfile, isAdmin, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const firstMobileLinkRef = useRef<HTMLButtonElement | null>(null);

  const effectiveStatus: QuizStatus = quiz?.status || quizStatus || 'LIVE';

  // Handle scroll detection for sticky navbar dynamic visual state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape and outside clicks for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => firstMobileLinkRef.current?.focus(), 50);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const getStatusBadge = () => {
    switch (effectiveStatus) {
      case 'LIVE':
        return {
          label: 'LIVE',
          dotClass: 'bg-[#7EE8A6] animate-ping',
          solidDot: 'bg-[#7EE8A6]',
          borderClass: 'border-[#7EE8A6]/40',
          textClass: 'text-[#7EE8A6]',
          bgClass: 'bg-[#7EE8A6]/10',
        };
      case 'UPCOMING':
      case 'READY':
        return {
          label: 'UPCOMING',
          dotClass: 'bg-[#D8A94F]',
          solidDot: 'bg-[#D8A94F]',
          borderClass: 'border-[#D8A94F]/40',
          textClass: 'text-[#D8A94F]',
          bgClass: 'bg-[#D8A94F]/10',
        };
      case 'PAUSED':
        return {
          label: 'PAUSED',
          dotClass: 'bg-[#D8A94F] animate-pulse',
          solidDot: 'bg-[#D8A94F]',
          borderClass: 'border-[#D8A94F]/40',
          textClass: 'text-[#D8A94F]',
          bgClass: 'bg-[#D8A94F]/10',
        };
      case 'STOPPED':
        return {
          label: 'CLOSED',
          dotClass: 'bg-[#B62A35]',
          solidDot: 'bg-[#B62A35]',
          borderClass: 'border-[#B62A35]/40',
          textClass: 'text-[#B62A35]',
          bgClass: 'bg-[#B62A35]/10',
        };
      case 'WINNERS_PUBLISHED':
        return {
          label: 'WINNERS REVEALED',
          dotClass: 'bg-[#D8A94F]',
          solidDot: 'bg-[#D8A94F]',
          borderClass: 'border-[#D8A94F]/40',
          textClass: 'text-[#D8A94F]',
          bgClass: 'bg-[#D8A94F]/10',
        };
      default:
        return {
          label: 'READY',
          dotClass: 'bg-[#7EE8A6]',
          solidDot: 'bg-[#7EE8A6]',
          borderClass: 'border-[#7EE8A6]/30',
          textClass: 'text-[#7EE8A6]',
          bgClass: 'bg-[#7EE8A6]/10',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <header className={`sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 select-none transition-all duration-300 ${
      scrolled ? 'pt-2.5 sm:pt-3 pb-2.5' : 'pt-4 sm:pt-6 pb-2 sm:pb-3'
    }`}>
      <div className={`max-w-6xl mx-auto w-full h-12 sm:h-13 rounded-full glass-pill-nav px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300 ${
        scrolled ? 'shadow-[0_16px_40px_rgba(0,0,0,0.85)] border-white/25 bg-black/80' : ''
      }`}>
        
        {/* Left: Logo & Brand Name */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <HeaderLogo size={24} />
          <span className="font-display font-semibold text-xs sm:text-[13.5px] tracking-tight text-white group-hover:text-[#7EE8A6] transition-colors whitespace-nowrap">
            AEC HARDWARE CLUB
          </span>
        </motion.div>

        {/* Center: Navigation Links (Centered with Generous Spacing & High-Fidelity Typography) */}
        <motion.nav
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="hidden md:flex items-center justify-center gap-8 lg:gap-11 text-xs lg:text-[13px] font-mono-tech uppercase tracking-[0.16em] text-white/70"
        >
          <button
            onClick={() => onNavigate('/')}
            className={`transition-colors hover:text-white cursor-pointer py-1 relative ${
              currentRoute === '/' ? 'text-[#7EE8A6] font-semibold' : ''
            }`}
          >
            HOME
            {currentRoute === '/' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-[1.5px] rounded-full bg-[#7EE8A6]" />
            )}
          </button>
          <button
            onClick={() => {
              if (onOpenRules) onOpenRules();
            }}
            className="transition-colors hover:text-white cursor-pointer py-1"
          >
            RULES
          </button>
          <button
            onClick={() => onNavigate('/winners')}
            className={`transition-colors hover:text-white cursor-pointer py-1 relative ${
              currentRoute === '/winners' ? 'text-[#D8A94F] font-semibold' : ''
            }`}
          >
            WINNERS
            {currentRoute === '/winners' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-[1.5px] rounded-full bg-[#D8A94F]" />
            )}
          </button>
        </motion.nav>

        {/* Right: Status Badge & Auth Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quiz Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${statusInfo.borderClass} ${statusInfo.bgClass} ${statusInfo.textClass} font-mono-tech text-[9.5px] tracking-wider select-none`}
          >
            <div className="relative flex items-center justify-center">
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
              <span className={`absolute w-1.5 h-1.5 rounded-full ${statusInfo.solidDot}`} />
            </div>
            <span>{statusInfo.label}</span>
          </motion.div>

          {/* Admin link */}
          {isAdmin && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              onClick={() => onNavigate('/admin')}
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-mono-tech text-[10px] tracking-wider transition cursor-pointer ${
                currentRoute.startsWith('/admin')
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'text-[#6F837A] hover:text-white border-white/15 hover:border-white/30'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-cyan-400" />
              <span>ADMIN</span>
            </motion.button>
          )}

          {/* User Sign In / Profile Pill Capsule */}
          {currentUser ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-2 pl-1.5"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white font-mono-tech text-[11px] flex items-center justify-center">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <span className="hidden lg:inline text-xs text-white/80 font-medium truncate max-w-[80px]">
                {currentUser.displayName?.split(' ')[0] || 'Member'}
              </span>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1 rounded-full text-white/50 hover:text-[#B62A35] transition cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={() => onNavigate('/login')}
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-medium transition cursor-pointer shadow-sm"
            >
              <LogIn className="w-3 h-3 text-[#7EE8A6]" />
              <span>LOGIN</span>
            </motion.button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer flex flex-col justify-center items-center gap-1 w-8 h-8"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <span className="font-mono-tech text-sm font-light leading-none">✕</span>
            ) : (
              <>
                <span className="w-3.5 h-0.5 bg-white rounded-full transition-transform" />
                <span className="w-3.5 h-0.5 bg-white rounded-full transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Glass Menu (HOME, RULES, WINNERS only) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-20 right-4 left-4 p-5 rounded-2xl glass-panel shadow-2xl border border-white/20 backdrop-blur-[24px] z-50 flex flex-col gap-3 font-mono-tech text-xs tracking-wider"
          >
            <button
              ref={firstMobileLinkRef}
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/');
              }}
              className="text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-white transition"
            >
              HOME
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenRules) onOpenRules();
              }}
              className="text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-white transition"
            >
              RULES
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/winners');
              }}
              className="text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-white transition"
            >
              WINNERS
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/admin');
                }}
                className="text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-cyan-300 transition"
              >
                ADMIN DASHBOARD
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
