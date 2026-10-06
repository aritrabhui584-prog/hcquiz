import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PhoneModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, onSuccess, onCancel }) => {
  const { updatePhone, userProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      setError('Please enter a valid phone number (min 7 digits).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await updatePhone(cleanPhone);
      onSuccess();
    } catch {
      setError('Failed to save phone number. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-[#090f14] border border-emerald-500/30 p-6 shadow-2xl text-slate-100 overflow-hidden"
          >
            {/* Top PCB Trace Glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-mono text-base font-bold text-slate-100 tracking-wide uppercase">
                  Participant Verification
                </h3>
                <p className="font-mono text-xs text-emerald-400">AEC HARDWARE CLUB // REGISTRY</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              Welcome, <span className="text-emerald-300 font-semibold">{userProfile?.name}</span>! 
              Club guidelines require a valid phone number for winner notifications and physical hardware prizes.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/70" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                  />
                </div>
                {error && <p className="mt-1.5 font-mono text-xs text-rose-400">{error}</p>}
              </div>

              <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono text-slate-400">
                  Your number is secured on the club server and never made public on the winners leaderboard.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-700 font-mono text-xs text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
                  >
                    CANCEL
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  {submitting ? 'RECORDING...' : 'CONFIRM & ENTER QUIZ'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
