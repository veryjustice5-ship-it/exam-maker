import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Exam, Student, ExamAttempt } from '../types';
import { PDFGuideViewer } from './PDFGuideViewer';

interface ExamCatalogProps {
  exams: Exam[];
  currentStudent: Student;
  attempts: ExamAttempt[];
  onStartExam: (exam: Exam) => void;
  onViewAnalytics: (studentId: string) => void;
}

export const ExamCatalog: React.FC<ExamCatalogProps> = ({
  exams,
  currentStudent,
  attempts,
  onStartExam,
  onViewAnalytics,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [briefingExam, setBriefingExam] = useState<Exam | null>(null);
  const [previewGuideExam, setPreviewGuideExam] = useState<Exam | null>(null);

  // Extract categories
  const categories = ['All', ...Array.from(new Set(exams.map(e => e.category)))];

  // Filter exams
  const filteredExams = exams.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate student's past attempt on an exam
  const getStudentBestAttempt = (examId: string) => {
    const studentAttempts = attempts.filter(
      a => a.studentId === currentStudent.id && a.examId === examId
    );
    if (studentAttempts.length === 0) return null;
    return studentAttempts.reduce((prev, curr) => (curr.percentage > prev.percentage ? curr : prev));
  };

  const totalPoints = (exam: Exam) => exam.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 border border-orange-500/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            ELGI EXAMS PORTAL &bull; e-Learning GROUP INSTITUTE
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome, <span className="text-orange-400">{currentStudent.name}</span>.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Write your official course examinations with live access to the accredited <strong className="text-white">PDF Study Guide</strong>.
            Tests are strictly timed and evaluated by the automated ELGI marking engine.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Split-Screen PDF Study Guide</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Real-Time Examination Timers</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Secure Server-Side Auto-Marking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search exams, course codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
          />
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => {
          const bestAttempt = getStudentBestAttempt(exam.id);
          const points = totalPoints(exam);

          return (
            <div
              key={exam.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Top Badge strip */}
                <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                      {exam.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {exam.category}
                    </span>
                  </div>

                  {bestAttempt ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Recorded
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
                      Ready to Start
                    </span>
                  )}
                </div>

                {/* Exam Title & Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Attached PDF Guide Box */}
                  <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          ELGI Study Guide Attached
                        </div>
                        <div className="text-xs font-semibold text-slate-800 truncate" title={exam.pdfGuide.title}>
                          {exam.pdfGuide.fileName}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewGuideExam(exam)}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-800 shrink-0 hover:underline ml-2"
                    >
                      Read
                    </button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                        <HelpCircle className="w-3 h-3" />
                        <span>Questions</span>
                      </div>
                      <div className="font-bold text-slate-800">{exam.questions.length}</div>
                    </div>

                    <div className="p-2 rounded-xl bg-orange-50 border border-orange-100/70">
                      <div className="flex items-center justify-center gap-1 text-orange-600 text-[10px] mb-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Time Limit</span>
                      </div>
                      <div className="font-bold text-orange-700">{exam.durationMinutes}m</div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                        <Award className="w-3 h-3" />
                        <span>Pass Mark</span>
                      </div>
                      <div className="font-bold text-slate-800">{exam.passPercentage}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setBriefingExam(exam)}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/30 group-hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <span>{bestAttempt ? 'Retake Examination' : 'Start Examination'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-Exam Briefing Modal */}
      {briefingExam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {briefingExam.code}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {briefingExam.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate: <strong className="text-slate-800">{currentStudent.name}</strong> ({currentStudent.studentNumber})
                </p>
              </div>
              <button
                onClick={() => setBriefingExam(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            {/* Test Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Time Limit</span>
                <span className="font-bold text-slate-800">{briefingExam.durationMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Questions</span>
                <span className="font-bold text-slate-800">{briefingExam.questions.length} Items</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pass Standard</span>
                <span className="font-bold text-emerald-600">{briefingExam.passPercentage}% Minimum</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Grading</span>
                <span className="font-bold text-indigo-600">Automated</span>
              </div>
            </div>

            {/* Exam Instructions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Exam Rules &amp; Assessment Guidelines
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {briefingExam.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Study Guide notice */}
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-indigo-900 font-medium">
                  Attached Guide: <strong className="font-semibold">{briefingExam.pdfGuide.fileName}</strong>
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold">Available Side-by-Side</span>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBriefingExam(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const examToStart = briefingExam;
                  setBriefingExam(null);
                  onStartExam(examToStart);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
              >
                <span>I Understand, Begin Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview PDF Guide Modal */}
      {previewGuideExam && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
          <div className="w-full max-w-4xl h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <PDFGuideViewer
              guide={previewGuideExam.pdfGuide}
              onClose={() => setPreviewGuideExam(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
