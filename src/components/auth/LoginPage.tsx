import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Phone, AlertCircle, ArrowLeft, LogOut, User, Hash, GraduationCap, Award, Camera, Upload, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HeaderLogo } from '../common/HeaderLogo';
import { isAuthorizedAdminEmail, auth } from '../../lib/firebase';

interface LoginPageProps {
  onSuccess: () => void;
  onGoHome: () => void;
}

const STREAM_OPTIONS = [
  'Electronics & Communication (ECE)',
  'Computer Science & Engineering (CSE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Information Technology (IT)',
  'AI & Machine Learning (AIML)',
  'Other Department',
];

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate / Other',
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoHome }) => {
  const { currentUser, userProfile, isAdmin, login, logout, updateProfileData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [stream, setStream] = useState(userProfile?.stream || STREAM_OPTIONS[0]);
  const [year, setYear] = useState(userProfile?.year || YEAR_OPTIONS[0]);
  const [rollNo, setRollNo] = useState(userProfile?.rollNo || '');
  const [membershipId, setMembershipId] = useState(userProfile?.membershipId || '');
  const [photoUrl, setPhotoUrl] = useState(userProfile?.photoURL || currentUser?.photoURL || '');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAdmin || isAuthorizedAdminEmail(currentUser?.email)) {
      onSuccess();
    }
  }, [isAdmin, currentUser, onSuccess]);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.stream) setStream(userProfile.stream);
      if (userProfile.year) setYear(userProfile.year);
      if (userProfile.rollNo) setRollNo(userProfile.rollNo);
      if (userProfile.membershipId) setMembershipId(userProfile.membershipId);
      if (userProfile.photoURL) setPhotoUrl(userProfile.photoURL);
    } else if (currentUser) {
      if (currentUser.displayName) setName(currentUser.displayName);
      if (currentUser.photoURL) setPhotoUrl(currentUser.photoURL);
    }
  }, [userProfile, currentUser]);

  const handleGoogleLogin = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      await login();
      const currentEmail = auth.currentUser?.email || currentUser?.email;
      if (isAuthorizedAdminEmail(currentEmail)) {
        onSuccess();
      }
    } catch (err: any) {
      const msg = err?.code === 'auth/unauthorized-domain'
        ? 'Domain is not whitelisted in Firebase Console (Authentication > Settings > Authorized domains > add localhost).'
        : (err?.message || 'Google sign-in could not be completed.');
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoUrl(compressed);
          if (errorMessage) setErrorMessage('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanRollNo = rollNo.replace(/\D/g, '');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }
    if (!cleanRollNo || cleanRollNo.length !== 12) {
      setErrorMessage('Please enter a valid 12-digit University Roll Number');
      return;
    }
    if (!stream.trim()) {
      setErrorMessage('Please select your Stream');
      return;
    }
    if (!year.trim()) {
      setErrorMessage('Please select your Year of study');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);
    try {
      await updateProfileData({
        name: name.trim(),
        phone: cleanPhone,
        stream: stream.trim(),
        year: year.trim(),
        rollNo: cleanRollNo,
        membershipId: membershipId.trim(),
        photoURL: photoUrl || currentUser?.photoURL || '',
      });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving registration details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-2xl bg-[#0c1310] border border-white/15 p-6 sm:p-8 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden"
      >
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 font-mono-tech text-xs text-[#A9B8B0] hover:text-white mb-4 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN HOME</span>
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <HeaderLogo size={42} className="mb-3" />
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#7EE8A6]/10 border border-[#7EE8A6]/30 text-[#7EE8A6] font-mono-tech text-[10px] tracking-wider mb-2">
            AEC HARDWARE CLUB
          </div>
          <h1 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-tight">
            {currentUser ? 'PARTICIPANT PROFILE' : 'ENTER THE CIRCUIT'}
          </h1>
          <p className="text-xs text-[#A9B8B0] mt-1 max-w-sm">
            {currentUser
              ? 'Complete your profile and photo for leaderboard and winner podium display.'
              : 'Sign in with your Google account to participate in the competition.'}
          </p>
        </div>

        {!currentUser ? (
          /* Step 1: Google Sign In Only */
          <div className="space-y-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-3 hover:bg-white/90 active:scale-[0.99] transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSaving ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}</span>
            </button>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#B62A35]/15 border border-[#B62A35]/30 text-xs text-[#ff8e95] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 text-center">
              <span className="text-[11px] font-mono-tech text-[#6F837A] tracking-wider uppercase">
                ONE PARTICIPANT // ONE ATTEMPT
              </span>
            </div>
          </div>
        ) : (
          /* Step 2: Post Google Sign-In Registration Form */
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Connected Google Account Header with Photo Upload */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                {/* Avatar Preview + Upload trigger */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-13 h-13 rounded-full object-cover border-2 border-[#7EE8A6]/60 group-hover:border-[#7EE8A6] transition shadow-md"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-[#7EE8A6]/20 border-2 border-[#7EE8A6]/40 flex items-center justify-center text-[#7EE8A6] font-bold text-lg group-hover:border-[#7EE8A6] transition">
                      {(currentUser.displayName || currentUser.email || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                    <Camera className="w-4 h-4 text-[#7EE8A6]" />
                  </div>
                </div>

                <div className="truncate text-left">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentUser.displayName || 'Google User'}
                  </p>
                  <p className="text-[11px] text-[#A9B8B0] font-mono-tech truncate">
                    {currentUser.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 font-mono-tech text-[10px] text-[#7EE8A6] hover:underline cursor-pointer"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      <span>{photoUrl ? 'Change Photo' : 'Add Photo'}</span>
                    </button>
                    {photoUrl !== currentUser.photoURL && currentUser.photoURL && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(currentUser.photoURL || '')}
                        className="inline-flex items-center gap-1 font-mono-tech text-[10px] text-[#A9B8B0] hover:text-white cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Google Pic</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <span className="shrink-0 text-[10px] font-mono-tech px-2.5 py-1 rounded-full bg-[#7EE8A6]/10 text-[#7EE8A6] border border-[#7EE8A6]/30">
                VERIFIED ID
              </span>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="font-mono-tech text-[10.5px] text-[#A9B8B0] uppercase tracking-wider block mb-1">
                  Full Name <span className="text-[#B62A35]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F837A]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-sans text-xs focus:outline-none focus:border-[#7EE8A6]"
                  />
                </div>
              </div>

              {/* Stream & Year (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono-tech text-[10.5px] text-[#A9B8B0] uppercase tracking-wider block mb-1">
                    Stream / Branch <span className="text-[#B62A35]">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F837A]" />
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-sans text-xs focus:outline-none focus:border-[#7EE8A6] appearance-none cursor-pointer"
                    >
                      {STREAM_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#121816] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-mono-tech text-[10.5px] text-[#A9B8B0] uppercase tracking-wider block mb-1">
                    Year of Study <span className="text-[#B62A35]">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-sans text-xs focus:outline-none focus:border-[#7EE8A6] appearance-none cursor-pointer"
                  >
                    {YEAR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#121816] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Roll No. & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono-tech text-[10.5px] text-[#A9B8B0] uppercase tracking-wider block mb-1">
                    University Roll No. (12 digits) <span className="text-[#B62A35]">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F837A]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rollNo}
                      onChange={(e) => {
                        setRollNo(e.target.value.replace(/\D/g, '').slice(0, 12));
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="12-digit roll number"
                      maxLength={12}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono-tech text-xs focus:outline-none focus:border-[#7EE8A6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono-tech text-[10.5px] text-[#A9B8B0] uppercase tracking-wider block mb-1">
                    Phone Number (10 digits) <span className="text-[#B62A35]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F837A]" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono-tech text-xs focus:outline-none focus:border-[#7EE8A6]"
                    />
                  </div>
                </div>
              </div>

              {/* HC Membership ID (Optional) */}
              <div>
                <label className="font-mono-tech text-[10.5px] text-[#A9B8B0] uppercase tracking-wider block mb-1">
                  HC Membership ID <span className="text-[#6F837A] font-normal normal-case">(Optional)</span>
                </label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F837A]" />
                  <input
                    type="text"
                    value={membershipId}
                    onChange={(e) => setMembershipId(e.target.value)}
                    placeholder="e.g. HC-2026-104 (if registered member)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono-tech text-xs placeholder:text-white/30 focus:outline-none focus:border-[#7EE8A6]"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-[#B62A35] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 rounded-xl btn-primary-vantage text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-lg"
            >
              <span>{isSaving ? 'RECORDING DETAILS...' : 'CONFIRM & ENTER CIRCUIT →'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2 rounded-xl border border-white/10 hover:bg-white/5 text-[#A9B8B0] hover:text-[#B62A35] font-mono-tech text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SWITCH GOOGLE ACCOUNT / SIGN OUT</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
