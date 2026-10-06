/**
 * AEC Hardware Club — Web Audio API Synthesized Sound Effects Library
 *
 * Provides subtle, low-latency, electronic-themed audio telemetry:
 * - Quiz Start: Lab equipment bench initialization arpeggio
 * - Timer Warnings: Soft radar ping at 30s, urgent twin pulse at 10s, micro-tick for final 5s
 * - Submission Success: Positive 4-note telemetry chord confirmation
 * - Tactile Option Select: Subtle micro-relay click
 *
 * Pure Web Audio API: Zero external audio files, zero 404s, works offline, volume-normalized.
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private lastWarningPlayedAt: Record<string, number> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aec_quiz_sound_enabled');
      this.soundEnabled = stored !== null ? stored === 'true' : true;
    }
  }

  /**
   * Lazily initializes and resumes the AudioContext upon user gesture
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aec_quiz_sound_enabled', String(enabled));
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.soundEnabled);
    if (this.soundEnabled) {
      this.playOptionSelect();
    }
    return this.soundEnabled;
  }

  /**
   * 1. QUIZ START: Electronic lab equipment bench power-up initialization sequence
   */
  public playQuizStart(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, now);
      masterGain.connect(ctx.destination);

      // Low-pass filter to give warm, laboratory electronics aesthetic
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.connect(masterGain);

      // Note 1: 440 Hz (A4)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(554.37, now + 0.08); // slide to C#5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(filter);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Note 2: 659.25 Hz (E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.09);
      gain2.gain.setValueAtTime(0, now + 0.09);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.105);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(filter);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.3);

      // Note 3: 880 Hz (A5) Harmonic chime
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(880, now + 0.18);
      osc3.frequency.exponentialRampToValueAtTime(1108.73, now + 0.3);
      gain3.gain.setValueAtTime(0, now + 0.18);
      gain3.gain.linearRampToValueAtTime(0.4, now + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc3.connect(gain3);
      gain3.connect(filter);
      osc3.start(now + 0.18);
      osc3.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio synthesis note:', e);
    }
  }

  /**
   * 2. TIMER WARNING: Electronic sonar ping & telemetry radar alert
   */
  public playTimerWarning(level: 'moderate' | 'urgent' = 'moderate'): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Debounce duplicate triggers within 1.5 seconds
    const nowMs = Date.now();
    const last = this.lastWarningPlayedAt[level] || 0;
    if (nowMs - last < 1500) return;
    this.lastWarningPlayedAt[level] = nowMs;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.14, now);
      masterGain.connect(ctx.destination);

      if (level === 'moderate') {
        // Soft dual radar ping at 30s
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Urgent twin blip at 10s
        [0, 0.09].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(987.77, now + offset); // B5
          gain.gain.setValueAtTime(0, now + offset);
          gain.gain.linearRampToValueAtTime(0.45, now + offset + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + offset);
          osc.stop(now + offset + 0.08);
        });
      }
    } catch (e) {
      console.warn('Audio synthesis note:', e);
    }
  }

  /**
   * Final 5-seconds countdown subtle tick
   */
  public playCountdownTick(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * 3. SUBMISSION SUCCESS: Positive 4-note telemetry chord confirmation
   */
  public playSubmissionSuccess(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.14, now);
      masterGain.connect(ctx.destination);

      // Warm low-pass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.connect(masterGain);

      // C Major triad + High C: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.28 },
        { freq: 659.25, time: 0.07, dur: 0.32 },
        { freq: 783.99, time: 0.14, dur: 0.38 },
        { freq: 1046.5, time: 0.22, dur: 0.65 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = note.freq > 1000 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0, now + note.time);
        gain.gain.linearRampToValueAtTime(0.3, now + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur + 0.05);
      });
    } catch (e) {
      console.warn('Audio synthesis note:', e);
    }
  }

  /**
   * 4. OPTION SELECT / BUTTON CLICK: Ultra-subtle micro relay blip
   */
  public playOptionSelect(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.025);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }
}

export const soundEffects = new SoundEffectsManager();
