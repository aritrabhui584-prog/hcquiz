import React, { useState } from 'react';

interface HeaderLogoProps {
  size?: number;
  className?: string;
  src?: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ size = 28, className = '', src }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const candidateSources = [
    src,
    '/logos/hardware-club/club-logo.png',
    '/club-logo.png',
    '/logo.png',
  ].filter(Boolean) as string[];

  const currentSrc = candidateSources[sourceIndex];
  const hasValidImage = sourceIndex < candidateSources.length;

  const handleImgError = () => {
    setSourceIndex((prev) => prev + 1);
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {hasValidImage ? (
        <img
          src={currentSrc}
          alt="AEC Hardware Club Logo"
          width={size}
          height={size}
          className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
          onError={handleImgError}
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer Circular Hardware Ring with PCB tick notches */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />
          <circle
            cx="20"
            cy="20"
            r="15"
            stroke="rgba(126, 232, 166, 0.45)"
            strokeWidth="1"
          />

          {/* Diagonal & Orthogonal PCB Traces */}
          <path
            d="M20 5V11 M20 29V35 M5 20H11 M29 20H35"
            stroke="#7EE8A6"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Angular Lotus / Diya Inspired Electronic Core Petals */}
          <path
            d="M20 12C20 12 25 16 25 21C25 24.5 22.5 27 20 27C17.5 27 15 24.5 15 21C15 16 20 12 20 12Z"
            stroke="#D8A94F"
            strokeWidth="1.4"
            fill="rgba(216, 169, 79, 0.12)"
          />

          {/* Central Core Diya / Spark Node (Sindoor Accent) */}
          <circle cx="20" cy="19" r="2.2" fill="#B62A35" />
          <circle cx="20" cy="19" r="1" fill="#FFFFFF" />

          {/* Micro Circuit Pad Nodes */}
          <circle cx="12" cy="12" r="1.2" fill="#7EE8A6" />
          <circle cx="28" cy="12" r="1.2" fill="#7EE8A6" />
          <circle cx="12" cy="28" r="1.2" fill="#7EE8A6" />
          <circle cx="28" cy="28" r="1.2" fill="#7EE8A6" />
        </svg>
      )}
    </div>
  );
};
