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
import { StudentLoginModal } from './components/StudentLoginModal';
import { INITIAL_STUDENTS, INITIAL_EXAMS, INITIAL_ATTEMPTS } from './data/mockData';
import { Exam, Student, ExamAttempt, AdminUser } from './types';
import { GraduationCap, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const STORAGE_KEY_EXAMS = 'elgi_exams_v3';
const STORAGE_KEY_STUDENTS = 'elgi_students_v4';
const STORAGE_KEY_ATTEMPTS = 'elgi_attempts_v4';
const STORAGE_KEY_ADMIN = 'elgi_admin_user_v3';
const STORAGE_KEY_CURRENT_STUDENT = 'elgi_current_student_v4';

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20 && parsed.some(s => s.name === 'Wisdom Diaba')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read students from localStorage', e);
    }
    return INITIAL_STUDENTS;
  });

  // Current logged in student (persisted in localStorage)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_STUDENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {}
    // Default to the first student (Wisdom Diaba) for seamless initial experience
    return INITIAL_STUDENTS[0] || null;
  });

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
  const [showStudentLoginModal, setShowStudentLoginModal] = useState<boolean>(false);

  // App navigation state
  const [activeTab, setActiveTab] = useState<'catalog' | 'exam' | 'analytics' | 'teacher'>('catalog');
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<ExamAttempt | null>(null);

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
      if (currentStudent) {
        localStorage.setItem(STORAGE_KEY_CURRENT_STUDENT, JSON.stringify(currentStudent));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_STUDENT);
      }
    } catch (e) {}
  }, [currentStudent]);

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
    if (!currentStudent) {
      setShowStudentLoginModal(true);
      return;
    }
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

  // Student auth handlers
  const handleStudentLogin = (student: Student) => {
    setCurrentStudent(student);
    setShowStudentLoginModal(false);
  };

  const handleStudentLogout = () => {
    setCurrentStudent(null);
    if (activeTab === 'exam') {
      setActiveExam(null);
      setLatestAttempt(null);
      setActiveTab('catalog');
    }
  };

  const handleRegisterStudent = (
    name: string,
    email: string,
    studentNumber: string,
    password: string
  ): Student => {
    const newStudent: Student = {
      id: `stu_${Date.now()}`,
      name,
      email,
      studentNumber,
      password,
      registeredAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    setStudents(prev => [newStudent, ...prev]);
    setCurrentStudent(newStudent);
    return newStudent;
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
      password: 'password123',
      registeredAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    setStudents(prev => [newStudent, ...prev]);
    setCurrentStudent(newStudent);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (currentStudent?.id === updatedStudent.id) {
      setCurrentStudent(updatedStudent);
    }
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (currentStudent?.id === studentId) {
      setCurrentStudent(prev => students.find(s => s.id !== studentId) || null);
    }
  };

  const handleBulkUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    if (currentStudent) {
      const match = newStudents.find(s => s.id === currentStudent.id || s.name === currentStudent.name);
      if (match) setCurrentStudent(match);
      else if (newStudents.length > 0) setCurrentStudent(newStudents[0]);
      else setCurrentStudent(null);
    }
  };

  const handleResetStudents = () => {
    setStudents(INITIAL_STUDENTS);
    setCurrentStudent(INITIAL_STUDENTS[0] || null);
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
    if (window.confirm('Reset all ELGI 10 courses, student credentials, and evaluation attempts to official defaults?')) {
      localStorage.removeItem(STORAGE_KEY_EXAMS);
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEY_CURRENT_STUDENT);
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
        onOpenStudentLogin={() => setShowStudentLoginModal(true)}
        onStudentLogout={handleStudentLogout}
        onSelectStudent={handleSelectStudent}
        onAddCustomStudent={handleAddCustomStudent}
        onUpdateStudent={handleUpdateStudent}
        isExamInProgress={!!activeExam && !latestAttempt}
        currentAdmin={currentAdmin}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* VIEW 1: ACTIVE EXAM OR SUBMISSION CONFIRMATION */}
        {activeTab === 'exam' && activeExam && (
          !currentStudent ? (
            <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Student Sign In Required</h2>
              <p className="text-xs text-slate-500">
                Please authenticate with your Student ID and Password to undertake and submit this assessment.
              </p>
              <button
                onClick={() => setShowStudentLoginModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md"
              >
                Open Student Login Portal
              </button>
            </div>
          ) : (
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
          )
        )}

        {/* VIEW 2: EXAMS CATALOG (All 10 AI Modules) */}
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
            onOpenStudentLogin={() => setShowStudentLoginModal(true)}
          />
        )}

        {/* VIEW 3: CONFIDENTIAL STUDENT ANALYTICS (Admin Only) */}
        {activeTab === 'analytics' && (
          currentAdmin ? (
            <StudentAnalytics
              students={students}
              currentStudent={currentStudent || students[0]}
              onSelectStudent={handleSelectStudent}
              attempts={attempts}
              exams={exams}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
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
              onUpdateStudent={handleUpdateStudent}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkUpdateStudents={handleBulkUpdateStudents}
              onResetStudents={handleResetStudents}
              onSelectStudent={handleSelectStudent}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Admin Clearance Required
              </h2>
              <p className="text-xs text-slate-500">
                Course creation, time limits, question editing, and the student auto-grading gradebook are restricted to authorized administrators.
              </p>
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md"
              >
                Sign In as Administrator
              </button>
            </div>
          )
        )}
      </main>

      {/* Student Login Portal Modal */}
      <StudentLoginModal
        isOpen={showStudentLoginModal}
        onClose={() => setShowStudentLoginModal(false)}
        students={students}
        onLogin={handleStudentLogin}
        onRegisterStudent={handleRegisterStudent}
        currentStudent={currentStudent}
      />

      {/* Admin Login Modal (When triggered from locks or buttons) */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={(admin) => {
          handleAdminLogin(admin);
          setActiveTab('teacher');
        }}
      />
    </div>
  );
}
