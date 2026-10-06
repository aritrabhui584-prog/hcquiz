import React from 'react';
import { HeaderLogo } from './HeaderLogo';

interface FooterProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenRules?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentRoute,
  onNavigate,
  onOpenRules,
}) => {
  return (
    <footer className="relative z-30 w-full glass-footer select-none overflow-hidden transition-all duration-300">
      {/* Subtle Ambient PCB Trace Background Decoration at very low opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden">
        <svg
          className="w-full h-full stroke-[#7EE8A6]"
          viewBox="0 0 1200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 60 H200 L240 20 H450 L480 60 H700 L730 100 H950 L980 60 H1200" strokeWidth="1.2" />
          <path d="M100 120 V80 L130 50 H300 L340 90 H550" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="200" cy="60" r="3" fill="#D8A94F" />
          <circle cx="480" cy="60" r="3" fill="#7EE8A6" />
          <circle cx="730" cy="100" r="3" fill="#D8A94F" />
          <circle cx="980" cy="60" r="3" fill="#7EE8A6" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-7 flex flex-col gap-5">
        {/* Main 3-Column Bar: Left Brand, Center Tagline, Right Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          
          {/* Left: AEC HARDWARE CLUB & SHARADIYA CIRCUIT 2026 */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group text-center md:text-left"
          >
            <HeaderLogo size={24} className="shrink-0" />
            <div className="flex flex-col">
              <span className="font-display font-medium text-xs tracking-tight text-white/90 group-hover:text-[#7EE8A6] transition-colors duration-300">
                AEC HARDWARE CLUB
              </span>
              <span className="font-mono-tech text-[9px] text-[#A9B8B0] tracking-[0.18em] leading-tight">
                SHARADIYA CIRCUIT <span className="text-[#D8A94F]">2026</span>
              </span>
            </div>
          </div>

          {/* Center: Tagline */}
          <div className="text-center">
            <p className="font-serif-accent text-xs sm:text-[13px] text-white/70 tracking-wide font-normal">
              Where Tradition Meets Technology.
            </p>
          </div>

          {/* Right: HOME · RULES · WINNERS (No Quiz link, 250–350ms smooth transition) */}
          <nav className="flex items-center gap-4 sm:gap-6 font-mono-tech text-xs tracking-wider text-[#A9B8B0]">
            <button
              onClick={() => onNavigate('/')}
              className={`hover:text-white transition-colors duration-300 cursor-pointer py-1 ${
                currentRoute === '/' ? 'text-[#7EE8A6] font-medium' : ''
              }`}
            >
              HOME
            </button>
            <span className="text-white/20 select-none">·</span>
            <button
              onClick={() => {
                if (onOpenRules) onOpenRules();
              }}
              className="hover:text-white transition-colors duration-300 cursor-pointer py-1"
            >
              RULES
            </button>
            <span className="text-white/20 select-none">·</span>
            <button
              onClick={() => onNavigate('/winners')}
              className={`hover:text-white transition-colors duration-300 cursor-pointer py-1 ${
                currentRoute === '/winners' ? 'text-[#D8A94F] font-medium' : ''
              }`}
            >
              WINNERS
            </button>
          </nav>
        </div>

        {/* Bottom Closing Signature */}
        <div className="pt-4 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-[10.5px] font-mono-tech text-[#6F837A]">
          <p>
            © 2026 AEC Hardware Club · Built with curiosity, circuits &amp; code.
          </p>
          <p className="text-[10px] text-[#A9B8B0]/60 tracking-wider">
            SPECIAL EDITION
          </p>
        </div>
      </div>
    </footer>
  );
};
