import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import schoolLogo from '../assets/school-logo.png';
import {
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Check
} from 'lucide-react';

export const LoginPage = () => {
  const { loginWithEmail, inactivityNotice, clearInactivityNotice } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginWithEmail(email, password, keepSignedIn);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Authentication request failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell min-h-screen bg-[#0f0508] flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* CCT Crimson & Gold Moving Ambient Orbs */}
      <div className="ambient-orb absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-rose-900/30 rounded-full blur-[120px] pointer-events-none" style={{ animation: 'light-orb-pulse 10s ease-in-out infinite' }} />
      <div className="ambient-orb absolute -bottom-32 -right-32 w-[36rem] h-[36rem] bg-amber-600/25 rounded-full blur-[130px] pointer-events-none" style={{ animation: 'light-orb-pulse 12s ease-in-out infinite reverse' }} />
      <div className="ambient-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] bg-red-950/40 rounded-full blur-[110px] pointer-events-none" style={{ animation: 'light-orb-pulse 8s ease-in-out infinite 2s' }} />

      {/* Card with Moving Crimson & Gold Light Border */}
      <div className="moving-light-border max-w-md w-full z-10 shadow-2xl shadow-rose-950/80">
        <div className="moving-light-content bg-slate-950/95 border border-rose-950/80 p-7 sm:p-8 space-y-6 backdrop-blur-2xl">

          {/* Header with Official School Logo */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-16 h-20 mx-auto grid place-items-center p-1 bg-gradient-to-b from-amber-500/20 via-rose-900/40 to-slate-950 rounded-2xl border border-amber-500/30 shadow-lg shadow-rose-950/50">
                <img
                  src={schoolLogo}
                  alt="City College of Tagaytay Logo"
                  className="h-full w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight sm:text-2xl">City College of Tagaytay</h1>
              <p className="text-xs text-amber-200/80 font-medium mt-0.5">Academic Performance Monitoring & Reporting System</p>
            </div>
          </div>



          {inactivityNotice && (
            <div className="p-3 bg-amber-950/90 border border-amber-500/60 rounded-xl text-amber-200 text-xs flex items-center justify-between space-x-2 shadow-lg animate-pulse">
              <div className="flex items-center space-x-2 min-w-0">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{inactivityNotice}</span>
              </div>
              <button
                type="button"
                onClick={clearInactivityNotice}
                className="text-amber-400 hover:text-white font-bold text-xs px-1.5 py-0.5 rounded shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Institutional Email</label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-20 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="user@cct.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input w-full pl-9.5 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-20 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input w-full pl-9.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-300 transition-colors z-20"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-0.5 pb-0.5">
              <button
                type="button"
                onClick={() => setKeepSignedIn((prev) => !prev)}
                className="flex items-center gap-2.5 cursor-pointer group text-left focus:outline-none"
              >
                <div className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center shrink-0 ${
                  keepSignedIn
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-slate-950 shadow-sm shadow-amber-500/40'
                    : 'bg-slate-950/80 border-slate-700/80 group-hover:border-amber-500/60'
                }`}>
                  {keepSignedIn && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-medium text-amber-200/80 group-hover:text-amber-100 transition-colors">
                  Keep me signed in on this device
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-action button-shine w-full py-3 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 hover:from-rose-800 hover:to-amber-600 text-amber-100 border border-amber-500/40 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/80"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-[11px] text-slate-500 text-center pt-2">
            Authorized personnel access only. Accounts managed by VPAA Office. City College of Tagaytay © 2026
          </div>

        </div>
      </div>

    </div>
  );
};
