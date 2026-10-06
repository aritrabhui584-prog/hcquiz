import React, { useEffect, useRef } from 'react';

export const CinematicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Explicitly guarantee video playback with muted attribute in DOM
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Fallback for browsers requiring user interaction
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes representing atmospheric Puja ambient embers and electronic nodes
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      baseAlpha: number;
      pulseSpeed: number;
      type: 'ember' | 'circuit' | 'bokeh';
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 36;

    const colors = [
      '#D8A94F', // Muted antique gold
      '#B62A35', // Sindoor red
      '#7EE8A6', // Hardware green
      '#6F837A', // Dark teal
      '#FFFFFF', // White spark
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const typeRand = Math.random();
      const type: 'ember' | 'circuit' | 'bokeh' =
        typeRand < 0.5 ? 'circuit' : typeRand < 0.85 ? 'ember' : 'bokeh';

      const baseAlpha =
        type === 'bokeh'
          ? Math.random() * 0.08 + 0.02
          : type === 'ember'
          ? Math.random() * 0.4 + 0.2
          : Math.random() * 0.25 + 0.1;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: type === 'ember' ? -Math.random() * 0.4 - 0.1 : (Math.random() - 0.5) * 0.2,
        size:
          type === 'bokeh'
            ? Math.random() * 40 + 20
            : type === 'ember'
            ? Math.random() * 2 + 1
            : Math.random() * 1.5 + 1,
        color:
          type === 'bokeh'
            ? Math.random() > 0.5
              ? '#D8A94F'
              : '#B62A35'
            : colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        type,
      });
    }

    // Static geometric circuit paths that slowly pulse
    const circuitLines = [
      { x1: 0.1, y1: 0.2, x2: 0.3, y2: 0.2, x3: 0.35, y3: 0.4 },
      { x1: 0.8, y1: 0.15, x2: 0.9, y2: 0.15, x3: 0.95, y3: 0.3 },
      { x1: 0.05, y1: 0.8, x2: 0.2, y2: 0.8, x3: 0.25, y3: 0.7 },
      { x1: 0.75, y1: 0.85, x2: 0.85, y2: 0.85, x3: 0.9, y3: 0.7 },
    ];

    let tick = 0;

    const render = () => {
      tick++;
      // Clear transparently so background video shows through effortlessly
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric gradient glows (top-right sindoor/gold, bottom-left teal)
      const glowGrad1 = ctx.createRadialGradient(
        width * 0.85,
        height * 0.2,
        10,
        width * 0.85,
        height * 0.2,
        width * 0.6
      );
      glowGrad1.addColorStop(0, 'rgba(182, 42, 53, 0.06)');
      glowGrad1.addColorStop(0.5, 'rgba(216, 169, 79, 0.03)');
      glowGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad1;
      ctx.fillRect(0, 0, width, height);

      const glowGrad2 = ctx.createRadialGradient(
        width * 0.15,
        height * 0.8,
        10,
        width * 0.15,
        height * 0.8,
        width * 0.5
      );
      glowGrad2.addColorStop(0, 'rgba(110, 131, 122, 0.05)');
      glowGrad2.addColorStop(0.6, 'rgba(126, 232, 166, 0.025)');
      glowGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(0, 0, width, height);

      // Subtle background PCB circuit traces
      ctx.lineWidth = 1;
      circuitLines.forEach((line, idx) => {
        const lineAlpha = (Math.sin(tick * 0.015 + idx) + 1) * 0.04 + 0.02;
        ctx.strokeStyle = `rgba(126, 232, 166, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(line.x1 * width, line.y1 * height);
        ctx.lineTo(line.x2 * width, line.y2 * height);
        ctx.lineTo(line.x3 * width, line.y3 * height);
        ctx.stroke();

        // Node dot at vertex
        ctx.fillStyle = `rgba(216, 169, 79, ${lineAlpha * 1.5})`;
        ctx.beginPath();
        ctx.arc(line.x2 * width, line.y2 * height, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        const currentAlpha = p.baseAlpha + Math.sin(tick * p.pulseSpeed) * (p.baseAlpha * 0.4);

        if (p.type === 'bokeh') {
          const bokehGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          bokehGrad.addColorStop(0, p.color === '#D8A94F' ? `rgba(216, 169, 79, ${currentAlpha})` : `rgba(182, 42, 53, ${currentAlpha})`);
          bokehGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bokehGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, currentAlpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0 bg-black">
      {/* Background Video Layer */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src="/videos/landing-bg/background-video.mp4" type="video/mp4" />
        <source src="/videos/landing-bg/bg-video.webm" type="video/webm" />
      </video>

      {/* Dynamic Animated Canvas (Embers & PCB Nodes) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

      {/* Dark Vignette Overlay for Crisp Readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.82) 100%)',
        }}
      />

      {/* Film Grain Texture */}
      <div className="film-grain-layer" />
    </div>
  );
};
