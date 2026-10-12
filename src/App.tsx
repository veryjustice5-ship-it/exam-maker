/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExamCatalog } from './components/ExamCatalog';
import { ActiveExam } from './components/ActiveExam';
import { GradingResultView } from './components/GradingResultView';
import { StudentSubmissionConfirmation } from './components/StudentSubmissionConfirmation';
import { StudentAnalytics } from './components/StudentAnalytics';
import { TeacherTestManager } from './components/TeacherTestManager';
import { AdminLoginModal } from './components/AdminLoginModal';
import { INITIAL_STUDENTS, INITIAL_EXAMS, INITIAL_ATTEMPTS } from './data/mockData';
import { Exam, Student, ExamAttempt, AdminUser } from './types';

const STORAGE_KEY_EXAMS = 'elgi_exams_v2';
const STORAGE_KEY_STUDENTS = 'elgi_students_v2';
const STORAGE_KEY_ATTEMPTS = 'elgi_attempts_v2';
const STORAGE_KEY_ADMIN = 'elgi_admin_user_v2';

export default function App() {
  // Load state from local storage or fallback to defaults
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXAMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read exams from localStorage', e);
    }
    return INITIAL_EXAMS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read students from localStorage', e);
    }
    return INITIAL_STUDENTS;
  });

  const [currentStudent, setCurrentStudent] = useState<Student>(() => students[0] || INITIAL_STUDENTS[0]);

  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read attempts from localStorage', e);
    }
    return INITIAL_ATTEMPTS;
  });

  // Admin authentication state
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read admin from localStorage', e);
    }
    return null;
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // App navigation state
  const [activeTab, setActiveTab] = useState<'catalog' | 'exam' | 'analytics' | 'teacher'>('catalog');
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<ExamAttempt | null>(null);
  const [inspectingAttemptForAdmin, setInspectingAttemptForAdmin] = useState<ExamAttempt | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
    } catch (e) {}
  }, [exams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {}
  }, [attempts]);

  useEffect(() => {
    try {
      if (currentAdmin) {
        localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(currentAdmin));
      } else {
        localStorage.removeItem(STORAGE_KEY_ADMIN);
      }
    } catch (e) {}
  }, [currentAdmin]);

  // Start exam
  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setLatestAttempt(null);
    setActiveTab('exam');
  };

  // Submit exam: auto-grading evaluates and saves score
  const handleSubmitExam = (attempt: ExamAttempt) => {
    setAttempts(prev => [attempt, ...prev]);
    setLatestAttempt(attempt);
    // Student remains on submission screen where score is HIDDEN!
  };

  const handleCancelExam = () => {
    setActiveExam(null);
    setLatestAttempt(null);
    setActiveTab('catalog');
  };

  const handleSelectStudent = (student: Student) => {
    setCurrentStudent(student);
  };

  const handleAddCustomStudent = (name: string, email: string) => {
    const newStudent: Student = {
      id: `stu_${Date.now()}`,
      name,
      email,
      studentNumber: `ELGI-2026-${Math.floor(100 + Math.random() * 900)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    setStudents(prev => [newStudent, ...prev]);
    setCurrentStudent(newStudent);
  };

  const handleSaveExam = (newExam: Exam) => {
    setExams(prev => [newExam, ...prev]);
  };

  const handleUpdateExam = (updatedExam: Exam) => {
    setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e));
    if (activeExam?.id === updatedExam.id) {
      setActiveExam(updatedExam);
    }
  };

  const handleDeleteExam = (examId: string) => {
    setExams(prev => prev.filter(e => e.id !== examId));
  };

  const handleUpdateAttempt = (updatedAttempt: ExamAttempt) => {
    setAttempts(prev => prev.map(a => a.id === updatedAttempt.id ? updatedAttempt : a));
  };

  const handleAdminLogin = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    setShowAdminLoginModal(false);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    if (activeTab === 'teacher' || activeTab === 'analytics') {
      setActiveTab('catalog');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all ELGI exams, students, and evaluation attempts to sample defaults?')) {
      localStorage.removeItem(STORAGE_KEY_EXAMS);
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
      setExams(INITIAL_EXAMS);
      setStudents(INITIAL_STUDENTS);
      setCurrentStudent(INITIAL_STUDENTS[0]);
      setAttempts(INITIAL_ATTEMPTS);
      setActiveExam(null);
      setLatestAttempt(null);
      setActiveTab('catalog');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={handleSelectStudent}
        onAddCustomStudent={handleAddCustomStudent}
        isExamInProgress={!!activeExam && !latestAttempt}
        currentAdmin={currentAdmin}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* VIEW 1: ACTIVE EXAM OR SUBMISSION CONFIRMATION */}
        {activeTab === 'exam' && activeExam && (
          latestAttempt ? (
            /* CRITICAL: Student CANNOT see the result!
               If user is logged in as Admin, they can preview the graded breakdown,
               otherwise student sees the official Submission Confirmation receipt */
            currentAdmin ? (
              <div className="space-y-4">
                <div className="p-3 bg-orange-100 border border-orange-300 rounded-xl text-xs text-orange-950 flex items-center justify-between">
                  <span><strong>Examiner Mode:</strong> You are viewing this attempt as an authorized Admin. Standard candidates only see the submission voucher.</span>
                  <button 
                    onClick={() => setActiveTab('teacher')}
                    className="font-bold underline text-orange-800"
                  >
                    Go to Admin Gradebook &rarr;
                  </button>
                </div>
                <GradingResultView
                  exam={activeExam}
                  attempt={latestAttempt}
                  onRetakeExam={() => {
                    setLatestAttempt(null);
                  }}
                  onGoToAnalytics={() => setActiveTab('analytics')}
                  onBackToCatalog={() => {
                    setActiveExam(null);
                    setLatestAttempt(null);
                    setActiveTab('catalog');
                  }}
                />
              </div>
            ) : (
              <StudentSubmissionConfirmation
                exam={activeExam}
                attempt={latestAttempt}
                student={currentStudent}
                onReturnToCatalog={() => {
                  setActiveExam(null);
                  setLatestAttempt(null);
                  setActiveTab('catalog');
                }}
                onOpenAdminLogin={() => setShowAdminLoginModal(true)}
              />
            )
          ) : (
            <ActiveExam
              exam={activeExam}
              currentStudent={currentStudent}
              onSubmitExam={handleSubmitExam}
              onCancelExam={handleCancelExam}
            />
          )
        )}

        {/* VIEW 2: EXAMS CATALOG */}
        {activeTab === 'catalog' && (
          <ExamCatalog
            exams={exams}
            currentStudent={currentStudent}
            attempts={attempts}
            onStartExam={handleStartExam}
            onViewAnalytics={() => {
              if (currentAdmin) setActiveTab('analytics');
              else setShowAdminLoginModal(true);
            }}
          />
        )}

        {/* VIEW 3: CONFIDENTIAL STUDENT ANALYTICS (Admin Only) */}
        {activeTab === 'analytics' && (
          currentAdmin ? (
            <StudentAnalytics
              students={students}
              currentStudent={currentStudent}
              onSelectStudent={handleSelectStudent}
              attempts={attempts}
              exams={exams}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Examiner Authentication Required
              </h2>
              <p className="text-xs text-slate-500">
                Student auto-grading analytics and individual test results are confidential.
                Sign in to the Admin Portal to access performance dossiers and gradebooks.
              </p>
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md"
              >
                Sign In to Admin Portal
              </button>
            </div>
          )
        )}

        {/* VIEW 4: ADMIN TEST & TIME MANAGER (Admin Only) */}
        {activeTab === 'teacher' && (
          currentAdmin ? (
            <TeacherTestManager
              exams={exams}
              attempts={attempts}
              students={students}
              currentAdmin={currentAdmin}
              onSaveExam={handleSaveExam}
              onUpdateExam={handleUpdateExam}
              onDeleteExam={handleDeleteExam}
              onResetData={handleResetData}
              onUpdateAttempt={handleUpdateAttempt}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Admin Clearance Required
              </h2>
              <p className="text-xs text-slate-500">
                Only authenticated examiners and academic faculty can configure exam questions, adjust time limits, and publish tests.
              </p>
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md"
              >
                Sign In to Admin Portal
              </button>
            </div>
          )
        )}
      </main>

      {/* Admin Login Modal Triggered from anywhere */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLogin}
      />

      {/* Site Footer */}
      <footer className="no-print bg-slate-950 text-slate-400 border-t border-slate-800 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
              ELGI
            </div>
            <div>
              <span className="font-extrabold text-white">ELGI EXAMS PORTAL</span>
              <span className="mx-2 text-slate-600">&bull;</span>
              <span>e-Learning GROUP INSTITUTE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>Secure Student Test Environment</span>
            <span>&bull;</span>
            <button
              onClick={() => {
                if (currentAdmin) handleAdminLogout();
                else setShowAdminLoginModal(true);
              }}
              className="text-orange-400 hover:underline cursor-pointer"
            >
              {currentAdmin ? 'Exit Admin Mode' : 'Examiner Login'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
