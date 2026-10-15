import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowRight,
  Sparkles,
  GraduationCap,
  Search
} from 'lucide-react';
import { Student } from '../types';
import { ELGILogo } from './ELGILogo';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onLogin: (student: Student) => void;
  onRegisterStudent: (name: string, email: string, studentNumber: string, password: string) => Student;
  currentStudent: Student | null;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  students,
  onLogin,
  onRegisterStudent,
  currentStudent,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form
  const [studentIdInput, setStudentIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [pickerSearch, setPickerSearch] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = studentIdInput.trim().toUpperCase();
    const cleanPass = passwordInput.trim();

    if (!cleanId) {
      setLoginError('Please enter your Student ID.');
      return;
    }
    if (!cleanPass) {
      setLoginError('Please enter your password.');
      return;
    }

    // Find student by studentNumber or id or email
    const match = students.find(
      s => s.studentNumber.toUpperCase() === cleanId ||
           s.id.toUpperCase() === cleanId ||
           s.email.toLowerCase() === studentIdInput.trim().toLowerCase()
    );

    if (!match) {
      setLoginError(`No enrolled student found with Student ID "${cleanId}". Check sample accounts below or register.`);
      return;
    }

    // Verify password (matches saved password, 'password123', or their own Student ID)
    const expectedPass = match.password || 'password123';
    const isPassValid = cleanPass === expectedPass || cleanPass.toUpperCase() === match.studentNumber.toUpperCase();
    if (!isPassValid) {
      setLoginError(`Incorrect password. Default password for ${match.name} is: ${expectedPass}`);
      return;
    }

    onLogin(match);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) {
      setRegError('Please provide your full legal name.');
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setRegError('Password must be at least 4 characters.');
      return;
    }

    const genId = regStudentId.trim().toUpperCase() || 
      `ELGI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const alreadyExists = students.some(
      s => s.studentNumber.toUpperCase() === genId
    );

    if (alreadyExists) {
      setRegError(`Student ID "${genId}" is already registered. Please choose another.`);
      return;
    }

    const email = regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '.')}@student.elgi.edu`;
    const newStu = onRegisterStudent(regName.trim(), email, genId, regPassword.trim());

    setRegSuccess(`Account enrolled successfully! Student ID: ${newStu.studentNumber}`);
    setTimeout(() => {
      onLogin(newStu);
      onClose();
    }, 1200);
  };

  const fillDemoStudent = (stu: Student) => {
    setStudentIdInput(stu.studentNumber);
    setPasswordInput(stu.password || 'password123');
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner with ELGI White Logo */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <ELGILogo variant="full" className="scale-90 origin-left" />
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Student Login Portal</h3>
              <p className="text-xs text-slate-300">
                Official authentication for online AI &amp; Automation course assessments
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-2 mt-4 bg-slate-950/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Sign In</span>
            </button>
            <button
              onClick={() => { setMode('register'); setRegError(''); }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll New Student</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Student ID / Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. ELGI-2026-001</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={studentIdInput}
                    onChange={e => setStudentIdInput(e.target.value)}
                    placeholder="ELGI-2026-001"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-400 font-normal">Default: password123</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md hover:shadow transition flex items-center justify-center gap-2"
              >
                <span>Access Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Enrolled Students Quick-Fill Selector */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Enrolled Cohort ({students.length}):</span>
                  </p>
                  <span className="text-orange-600 font-mono text-[10px] font-bold">Pass: password123</span>
                </div>

                {/* Search filter for enrolled students */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    placeholder="Search candidate name or ID..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                  {pickerSearch && (
                    <button
                      type="button"
                      onClick={() => setPickerSearch('')}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {students
                    .filter(s => {
                      const q = pickerSearch.toLowerCase();
                      return s.name.toLowerCase().includes(q) || s.studentNumber.toLowerCase().includes(q);
                    })
                    .map(stu => (
                      <button
                        key={stu.id}
                        type="button"
                        onClick={() => fillDemoStudent(stu)}
                        className={`p-1.5 rounded-xl border text-left transition flex items-center gap-2 ${
                          studentIdInput.toUpperCase() === stu.studentNumber.toUpperCase()
                            ? 'border-orange-500 bg-orange-50/70 ring-1 ring-orange-500'
                            : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate leading-tight">{stu.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 truncate leading-tight">{stu.studentNumber}</p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </form>
          ) : (
            /* Register Mode */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Legal Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institutional Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="alex.morgan@student.elgi.edu"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Assigned Student ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional: auto-generated if blank</span>
                </label>
                <input
                  type="text"
                  value={regStudentId}
                  onChange={e => setRegStudentId(e.target.value)}
                  placeholder="e.g. ELGI-2026-005"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Student Portal Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Choose secure password"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Enrollment &amp; Sign In</span>
              </button>
            </form>
          )}

          {/* Privacy Notice */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 text-center">
            Student test scores and auto-grading assessments are securely submitted to the ELGI Academic Board.
          </div>
        </div>
      </div>
    </div>
  );
};
