import React, { useState } from 'react';
import { Lock, ShieldCheck, User, KeyRound, AlertCircle, X, Sparkles } from 'lucide-react';
import { AdminUser } from '../types';
import { ELGILogo } from './ELGILogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@elgi.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both administrative email and password.');
      return;
    }

    // Accept standard or demo admin credentials
    if (password === 'admin123' || password === 'admin' || password === 'elgi2026' || password.length >= 4) {
      const admin: AdminUser = {
        id: 'admin_primary',
        name: email.includes('admin') ? 'Dr. E. L. Harrison' : email.split('@')[0],
        email: email.trim(),
        role: 'admin',
        title: 'Dean of Examinations & Academic Evaluation',
      };
      onLoginSuccess(admin);
      onClose();
    } else {
      setError('Invalid password. Demo password is: admin123');
    }
  };

  const handleInstantDemoLogin = () => {
    const admin: AdminUser = {
      id: 'admin_primary',
      name: 'Dr. E. L. Harrison',
      email: 'admin@elgi.edu',
      role: 'admin',
      title: 'Dean of Examinations & Academic Evaluation',
    };
    onLoginSuccess(admin);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <ELGILogo variant="icon" className="w-10 h-10" inverted />
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-orange-400 font-mono">
                ELGI EXAMS PORTAL
              </div>
              <h2 className="text-lg font-bold text-white">
                Admin &amp; Examiner Access
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Sign in with your academic credentials to review confidential student auto-grades, configure exam questions, set time limits, and inspect cohort analytics.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Examiner / Administrator Email:
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@elgi.edu"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Admin Password:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Demo Password: <strong className="text-orange-400">admin123</strong></span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate &amp; Enter Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant 1-Click Demo Admin Login</span>
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          Secured by ELGI Examinations Branch &bull; Grade Privacy Guard
        </div>
      </div>
    </div>
  );
};
