/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExamCatalog } from './components/ExamCatalog';
import { ActiveExam } from './components/ActiveExam';
import { GradingResultView } from './components/GradingResultView';
import { StudentAnalytics } from './components/StudentAnalytics';
import { TeacherTestManager } from './components/TeacherTestManager';
import { INITIAL_STUDENTS, INITIAL_EXAMS, INITIAL_ATTEMPTS } from './data/mockData';
import { Exam, Student, ExamAttempt } from './types';

const STORAGE_KEY_EXAMS = 'examcraft_exams_v1';
const STORAGE_KEY_STUDENTS = 'examcraft_students_v1';
const STORAGE_KEY_ATTEMPTS = 'examcraft_attempts_v1';

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

  // Start exam
  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setLatestAttempt(null);
    setActiveTab('exam');
  };

  // Submit exam and trigger auto-marking
  const handleSubmitExam = (attempt: ExamAttempt) => {
    setAttempts(prev => [attempt, ...prev]);
    setLatestAttempt(attempt);
    // Stay in active view or show result view
  };

  const handleRetakeExam = () => {
    if (activeExam) {
      setLatestAttempt(null);
      setActiveTab('exam');
    } else {
      setActiveTab('catalog');
    }
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
      studentNumber: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    setStudents(prev => [newStudent, ...prev]);
    setCurrentStudent(newStudent);
  };

  const handleSaveExam = (newExam: Exam) => {
    setExams(prev => [newExam, ...prev]);
  };

  const handleDeleteExam = (examId: string) => {
    setExams(prev => prev.filter(e => e.id !== examId));
  };

  const handleResetData = () => {
    if (window.confirm('Reset all exams, students, and attempts to sample defaults?')) {
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
    <div className="min-h-screen bg-slate-100/80 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (activeExam && tab !== 'exam') {
            // Keep exam in progress accessible via header badge
          }
          setActiveTab(tab);
        }}
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={handleSelectStudent}
        onAddCustomStudent={handleAddCustomStudent}
        isExamInProgress={!!activeExam && !latestAttempt}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* VIEW 1: ACTIVE EXAM OR IMMEDIATE GRADING RESULT */}
        {activeTab === 'exam' && activeExam && (
          latestAttempt ? (
            <GradingResultView
              exam={activeExam}
              attempt={latestAttempt}
              onRetakeExam={handleRetakeExam}
              onGoToAnalytics={() => setActiveTab('analytics')}
              onBackToCatalog={() => {
                setActiveExam(null);
                setLatestAttempt(null);
                setActiveTab('catalog');
              }}
            />
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
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {/* VIEW 3: STUDENT ANALYTICS (ClassMarker inspired) */}
        {activeTab === 'analytics' && (
          <StudentAnalytics
            students={students}
            currentStudent={currentStudent}
            onSelectStudent={handleSelectStudent}
            attempts={attempts}
            exams={exams}
          />
        )}

        {/* VIEW 4: TEACHER & ASSESSMENT MANAGER */}
        {activeTab === 'teacher' && (
          <TeacherTestManager
            exams={exams}
            attempts={attempts}
            students={students}
            onSaveExam={handleSaveExam}
            onDeleteExam={handleDeleteExam}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Site Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ExamCraft</span>
            <span>&bull;</span>
            <span>ClassMarker Architecture</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-medium">Automatic Marking &amp; PDF Reference Guide</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            GitHub Pages Ready: Relative Base Path (<code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">./</code>)
          </div>
        </div>
      </footer>
    </div>
  );
}
