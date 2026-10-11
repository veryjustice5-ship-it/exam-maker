import React, { useState } from 'react';
import { 
  GraduationCap, 
  BarChart3, 
  BookOpenCheck, 
  Settings, 
  User, 
  CheckCircle2, 
  Globe, 
  FileCheck2,
  ChevronDown,
  Plus
} from 'lucide-react';
import { Student } from '../types';

interface HeaderProps {
  activeTab: 'catalog' | 'exam' | 'analytics' | 'teacher';
  setActiveTab: (tab: 'catalog' | 'exam' | 'analytics' | 'teacher') => void;
  students: Student[];
  currentStudent: Student;
  onSelectStudent: (student: Student) => void;
  onAddCustomStudent: (name: string, email: string) => void;
  isExamInProgress: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  students,
  currentStudent,
  onSelectStudent,
  onAddCustomStudent,
  isExamInProgress,
}) => {
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCustomStudent(
      newName.trim(), 
      newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@student.org`
    );
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
    setShowStudentMenu(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                    ExamCraft
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro Auto-Grading
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  PDF Guide &bull; Instant Marking &bull; ClassMarker Analytics
                </div>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <BookOpenCheck className="w-4 h-4" />
                <span>Exams Catalog</span>
              </button>

              {isExamInProgress && (
                <button
                  onClick={() => setActiveTab('exam')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all animate-pulse ${
                    activeTab === 'exam'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 border border-amber-600/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Exam In Progress</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Student Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('teacher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Instructor &amp; Test Builder</span>
              </button>
            </nav>
          </div>

          {/* Right Section: GitHub Pages Base URL badge & Student Switcher */}
          <div className="flex items-center gap-3">
            {/* GitHub Pages Indicator */}
            <button 
              onClick={() => setShowDeployGuide(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-mono cursor-pointer transition-all shadow-xs"
              title="Click for GitHub Pages No-Blank-Screen Setup Guide"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>GH Pages Setup Guide</span>
            </button>

            {/* Current Active Student Selector */}
            <div className="relative">
              <button
                onClick={() => setShowStudentMenu(!showStudentMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-left transition-colors"
              >
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-400"
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
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
                    <span>Active Student</span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
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
                            isSelected ? 'bg-indigo-950/40 text-indigo-200' : 'text-slate-300'
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
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
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
              activeTab === 'catalog' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            onClick={() => setActiveTab('analytics')}
            className={`py-1 px-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`py-1 px-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'teacher' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Instructor</span>
          </button>
        </div>
      </div>

      {/* GitHub Pages Deployment Guide Modal */}
      {showDeployGuide && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  Fixed for GitHub Pages
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  How to Fix the Blank White Screen on GitHub Pages
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
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Why Did GitHub Pages Show a White Screen?</span>
                </div>
                <p>
                  A white screen on GitHub Pages happens for three specific reasons:
                </p>
                <ol className="list-decimal pl-4 space-y-1 mt-1 text-[11px]">
                  <li><strong>Deploying from Source instead of Build:</strong> If GitHub Pages is set to deploy from branch root (<code className="bg-black/30 px-1 rounded">/</code>), GitHub serves uncompiled <code className="bg-black/30 px-1 rounded">/src/main.tsx</code> which browsers cannot run. It must serve the built <code className="bg-black/30 px-1 rounded">dist/</code> directory!</li>
                  <li><strong>GitHub Pages Jekyll Engine:</strong> Without a <code className="bg-black/30 px-1 rounded">.nojekyll</code> file, GitHub Pages runs Jekyll, which ignores files starting with <code className="bg-black/30 px-1 rounded">_</code> and drops assets. (We added <code className="bg-black/30 px-1 rounded">public/.nojekyll</code>).</li>
                  <li><strong>Missing Base URL:</strong> When hosted at <code className="bg-black/30 px-1 rounded">username.github.io/repo-name/</code>, assets must be relative. (Configured in <code className="bg-black/30 px-1 rounded">vite.config.ts</code>).</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white mb-2 text-indigo-300">
                  Method 1 (Recommended): Automatic 1-Click GitHub Actions
                </h4>
                <p className="mb-2">
                  We have added <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300">.github/workflows/deploy.yml</code> to your repository!
                </p>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Go to your GitHub repository on github.com.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Click <strong>Settings</strong> &rarr; <strong>Pages</strong> (in the left sidebar).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Under <strong>Build and deployment &rarr; Source</strong>, change the dropdown from <em>&quot;Deploy from a branch&quot;</em> to <strong>&quot;GitHub Actions&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                    <span>Push any commit or click <strong>Run workflow</strong> in the Actions tab. GitHub will automatically run the build and publish your site with zero blank screen!</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white mb-2 text-emerald-300">
                  Method 2: Deploying via `gh-pages` Branch
                </h4>
                <p className="mb-2">
                  If you prefer deploying via git branches:
                </p>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`# 1. Build the production files
npm run build

# 2. Deploy only the dist folder to the gh-pages branch
npx gh-pages -d dist`}
                </pre>
                <p className="mt-1 text-[11px] text-slate-400">
                  Then in GitHub Settings &rarr; Pages, select the <code className="text-white">gh-pages</code> branch with folder <code className="text-white">/ (root)</code>.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDeployGuide(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Got It, Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Add Student Profile
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your own name or student details to write exams and generate personal analytics and certificates.
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex@university.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow"
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
