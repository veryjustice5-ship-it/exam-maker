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
  Sparkles,
  ExternalLink,
  Edit3,
  Key,
  X
} from 'lucide-react';
import { Student, AdminUser } from '../types';
import { ELGILogo } from './ELGILogo';
import { AdminLoginModal } from './AdminLoginModal';

interface HeaderProps {
  activeTab: 'catalog' | 'exam' | 'analytics' | 'teacher';
  setActiveTab: (tab: 'catalog' | 'exam' | 'analytics' | 'teacher') => void;
  students: Student[];
  currentStudent: Student | null;
  onOpenStudentLogin: () => void;
  onStudentLogout: () => void;
  onSelectStudent: (student: Student) => void;
  onAddCustomStudent: (name: string, email: string) => void;
  onUpdateStudent?: (student: Student) => void;
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
  onOpenStudentLogin,
  onStudentLogout,
  onSelectStudent,
  onAddCustomStudent,
  onUpdateStudent,
  isExamInProgress,
  currentAdmin,
  onAdminLogin,
  onAdminLogout,
}) => {
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Edit current student profile state
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileEmail, setEditProfileEmail] = useState('');
  const [editProfilePassword, setEditProfilePassword] = useState('');

  const openEditProfile = () => {
    if (!currentStudent) return;
    setEditProfileName(currentStudent.name);
    setEditProfileEmail(currentStudent.email);
    setEditProfilePassword(currentStudent.password || 'password123');
    setShowEditProfileModal(true);
    setShowStudentMenu(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !editProfileName.trim()) return;
    const updated: Student = {
      ...currentStudent,
      name: editProfileName.trim(),
      email: editProfileEmail.trim() || currentStudent.email,
      password: editProfilePassword.trim() || 'password123',
    };
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    setShowEditProfileModal(false);
  };

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
          {/* Logo & Brand featuring the White ELGI Logo */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            >
              <ELGILogo variant="icon" className="w-10 h-10 group-hover:scale-105 transition-transform" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white drop-shadow-[0_1px_3px_rgba(255,255,255,0.2)]">
                    ELGI EXAMS PORTAL
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono">
                    Official
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                  e-Learning GROUP INSTITUTE &bull; 10 AI &amp; Automation Modules
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
                <span>Courses &amp; Exams</span>
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
                  <span>Active Test</span>
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

          {/* Right Section: Student Portal Login & Admin Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Login Portal Button (When not logged in) */}
            {!currentStudent ? (
              <button
                onClick={onOpenStudentLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-amber-200" />
                <span>Student Login</span>
              </button>
            ) : (
              /* Authenticated Student Profile & Switcher */
              <div className="relative">
                <button
                  onClick={() => setShowStudentMenu(!showStudentMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs text-left transition-colors cursor-pointer"
                >
                  <img
                    src={currentStudent.avatar}
                    alt={currentStudent.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-500"
                  />
                  <div className="hidden sm:block">
                    <div className="font-semibold text-slate-200 leading-tight">
                      {currentStudent.name}
                    </div>
                    <div className="text-[10px] text-orange-400 font-mono leading-tight">
                      {currentStudent.studentNumber}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Student Dropdown Menu */}
                {showStudentMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
                      <span>Logged-in Student</span>
                      <button
                        onClick={() => {
                          setShowStudentMenu(false);
                          onOpenStudentLogin();
                        }}
                        className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-[11px]"
                      >
                        <User className="w-3 h-3" /> Switch ID
                      </button>
                    </div>

                    <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-white truncate">{currentStudent.name}</p>
                        <p className="text-[10px] font-mono text-orange-400 mt-0.5">ID: {currentStudent.studentNumber}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentStudent.email}</p>
                      </div>
                      <button
                        onClick={openEditProfile}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-orange-300 rounded-lg text-[10px] font-bold border border-slate-700 flex items-center gap-1 shrink-0"
                        title="Edit My Profile & Password"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="max-h-52 overflow-y-auto py-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase">Enrolled Students:</div>
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
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={stu.avatar}
                                alt={stu.name}
                                className="w-5 h-5 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-slate-200 truncate text-[11px]">
                                  {stu.name}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono truncate">
                                  {stu.studentNumber}
                                </div>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setShowStudentMenu(false);
                          setShowAddModal(true);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-orange-400" />
                        <span>Add Student</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowStudentMenu(false);
                          onStudentLogout();
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-[11px] text-red-300 font-semibold flex items-center gap-1 border border-red-800/40"
                        title="Sign Out of Student Account"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Portal Login / Indicator */}
            {currentAdmin ? (
              <div className="flex items-center gap-1.5 bg-orange-950/80 border border-orange-500/40 rounded-xl px-2.5 py-1 text-xs">
                <div className="flex items-center gap-1 text-orange-300 font-bold text-[11px]">
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                title="Admin portal with auto-grading results and exam question controls"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin Login</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}
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
            <span>Courses</span>
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

      {/* Quick Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-slate-100 space-y-4">
            <h3 className="font-bold text-base text-white">Enroll Candidate</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Candidate Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="jordan.smith@student.elgi.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit My Profile Modal */}
      {showEditProfileModal && currentStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold text-sm text-white">Edit My Student Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Student ID (Read Only)</label>
                <input
                  type="text"
                  value={currentStudent.studentNumber}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono mt-1 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Legal Name</label>
                <input
                  type="text"
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Institutional Email</label>
                <input
                  type="email"
                  value={editProfileEmail}
                  onChange={(e) => setEditProfileEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Portal Password</label>
                <input
                  type="text"
                  value={editProfilePassword}
                  onChange={(e) => setEditProfilePassword(e.target.value)}
                  placeholder="Change password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1 font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
