import React, { useState } from 'react';
import { 
  GraduationCap, 
  BarChart3, 
  BookOpenCheck, 
  Settings, 
  User, 
  CheckCircle2, 
  Globe, 
  Lock,
  LogOut,
  ChevronDown,
  Plus,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Student, AdminUser } from '../types';
import { ELGILogo } from './ELGILogo';
import { AdminLoginModal } from './AdminLoginModal';

interface HeaderProps {
  activeTab: 'catalog' | 'exam' | 'analytics' | 'teacher';
  setActiveTab: (tab: 'catalog' | 'exam' | 'analytics' | 'teacher') => void;
  students: Student[];
  currentStudent: Student;
  onSelectStudent: (student: Student) => void;
  onAddCustomStudent: (name: string, email: string) => void;
  isExamInProgress: boolean;
  currentAdmin: AdminUser | null;
  onAdminLogin: (admin: AdminUser) => void;
  onAdminLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  students,
  currentStudent,
  onSelectStudent,
  onAddCustomStudent,
  isExamInProgress,
  currentAdmin,
  onAdminLogin,
  onAdminLogout,
}) => {
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCustomStudent(
      newName.trim(), 
      newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@student.elgi.edu`
    );
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
    setShowStudentMenu(false);
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand matching the uploaded image */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            >
              <ELGILogo variant="icon" className="w-10 h-10 group-hover:scale-105 transition-transform" inverted />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-white bg-clip-text text-transparent">
                    ELGI EXAMS PORTAL
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono">
                    Official
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                  e-Learning GROUP INSTITUTE &bull; Automated Examinations
                </div>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-800">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpenCheck className="w-4 h-4 text-orange-400" />
                <span>Exams Catalog</span>
              </button>

              {isExamInProgress && (
                <button
                  onClick={() => setActiveTab('exam')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all animate-pulse ${
                    activeTab === 'exam'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-600/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Exam In Progress</span>
                </button>
              )}

              {/* Student Analytics: Available to Admin or prompts login */}
              <button
                onClick={() => {
                  if (currentAdmin) {
                    setActiveTab('analytics');
                  } else {
                    setShowAdminLoginModal(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={currentAdmin ? "View Student Auto-Grading Analytics" : "Admin Clearance Required to view auto-grades"}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Student Analytics</span>
                {!currentAdmin && (
                  <Lock className="w-3 h-3 text-amber-400 opacity-80" />
                )}
              </button>

              {/* Admin Test Manager: Available to Admin */}
              <button
                onClick={() => {
                  if (currentAdmin) {
                    setActiveTab('teacher');
                  } else {
                    setShowAdminLoginModal(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'teacher'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4 text-orange-400" />
                <span>Admin Test &amp; Time Manager</span>
                {!currentAdmin && (
                  <Lock className="w-3 h-3 text-amber-400 opacity-80" />
                )}
              </button>
            </nav>
          </div>

          {/* Right Section: Admin Status / Student Switcher / GH Pages */}
          <div className="flex items-center gap-3">
            {/* GitHub Pages Indicator */}
            <button 
              onClick={() => setShowDeployGuide(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-mono cursor-pointer transition-all shadow-xs"
              title="Click for GitHub Pages Setup Guide"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>GH Pages Ready</span>
            </button>

            {/* Admin Login / Logged In Badge */}
            {currentAdmin ? (
              <div className="flex items-center gap-2 bg-orange-950/80 border border-orange-500/40 rounded-xl px-2.5 py-1 text-xs">
                <div className="flex items-center gap-1.5 text-orange-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span className="hidden sm:inline">Admin: {currentAdmin.name}</span>
                  <span className="sm:hidden">Admin</span>
                </div>
                <button
                  onClick={onAdminLogout}
                  className="p-1 hover:text-white text-orange-400/80 hover:bg-orange-900/60 rounded"
                  title="Sign out of Admin Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Active Student Selector */}
            <div className="relative">
              <button
                onClick={() => setShowStudentMenu(!showStudentMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs text-left transition-colors cursor-pointer"
              >
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-orange-500"
                />
                <div className="hidden sm:block">
                  <div className="font-semibold text-slate-200 leading-tight">
                    {currentStudent.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono leading-tight">
                    {currentStudent.studentNumber}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Student Dropdown Menu */}
              {showStudentMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
                    <span>Active Student</span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3" /> New Student
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {students.map((stu) => {
                      const isSelected = stu.id === currentStudent.id;
                      return (
                        <button
                          key={stu.id}
                          onClick={() => {
                            onSelectStudent(stu);
                            setShowStudentMenu(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-800 transition-colors ${
                            isSelected ? 'bg-orange-950/40 text-orange-200' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-slate-200 truncate">
                                {stu.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {stu.studentNumber}
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-1 px-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'catalog' ? 'text-orange-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Exams</span>
          </button>
          {isExamInProgress && (
            <button
              onClick={() => setActiveTab('exam')}
              className={`py-1 px-2 font-medium flex items-center gap-1.5 text-amber-400 animate-pulse`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Live Test</span>
            </button>
          )}
          <button
            onClick={() => {
              if (currentAdmin) setActiveTab('analytics');
              else setShowAdminLoginModal(true);
            }}
            className={`py-1 px-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'text-orange-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => {
              if (currentAdmin) setActiveTab('teacher');
              else setShowAdminLoginModal(true);
            }}
            className={`py-1 px-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'teacher' ? 'text-orange-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={(admin) => {
          onAdminLogin(admin);
          setActiveTab('teacher');
        }}
      />

      {/* GitHub Pages Deployment Guide Modal */}
      {showDeployGuide && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  Fixed for GitHub Pages
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-400" />
                  GitHub Pages Deployment Settings
                </h3>
              </div>
              <button
                onClick={() => setShowDeployGuide(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>How White Screen was Prevented</span>
                </div>
                <p>
                  1. <code className="bg-black/30 px-1 rounded">package-lock.json</code> was created to resolve the dependencies lock error.<br />
                  2. <code className="bg-black/30 px-1 rounded">public/.nojekyll</code> disables Jekyll asset dropping.<br />
                  3. Base URL in <code className="bg-black/30 px-1 rounded">vite.config.ts</code> automatically sets your repo path.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white mb-2 text-orange-300">
                  1-Click GitHub Actions Deployment
                </h4>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span>In your GitHub repository, go to <strong>Settings &rarr; Pages</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Under <strong>Build and deployment &rarr; Source</strong>, choose <strong>&quot;GitHub Actions&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span>The included <code className="text-orange-400 font-mono">.github/workflows/deploy.yml</code> automatically builds and deploys your site!</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDeployGuide(false)}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-400" />
              Add Student Profile
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your own name or student details to write exams on the ELGI Portal.
            </p>
            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Montgomery"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex@student.elgi.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow"
                >
                  Save &amp; Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
