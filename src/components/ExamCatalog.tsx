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
  TrendingUp,
  GraduationCap,
  ListChecks,
  Lock,
  Layers
} from 'lucide-react';
import { Exam, Student, ExamAttempt } from '../types';
import { PDFGuideViewer } from './PDFGuideViewer';

interface ExamCatalogProps {
  exams: Exam[];
  currentStudent: Student | null;
  attempts: ExamAttempt[];
  onStartExam: (exam: Exam) => void;
  onViewAnalytics: (studentId?: string) => void;
  onOpenStudentLogin: () => void;
}

export const ExamCatalog: React.FC<ExamCatalogProps> = ({
  exams,
  currentStudent,
  attempts,
  onStartExam,
  onViewAnalytics,
  onOpenStudentLogin,
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
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.learningObjectives && e.learningObjectives.some(obj => obj.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Calculate student's past attempt on an exam
  const getStudentBestAttempt = (examId: string) => {
    if (!currentStudent) return null;
    const studentAttempts = attempts.filter(
      a => a.studentId === currentStudent.id && a.examId === examId
    );
    if (studentAttempts.length === 0) return null;
    return studentAttempts.reduce((prev, curr) => (curr.percentage > prev.percentage ? curr : prev));
  };

  const totalPoints = (exam: Exam) => exam.questions.reduce((sum, q) => sum + q.points, 0);

  const handleStartExamClick = (exam: Exam) => {
    if (!currentStudent) {
      onOpenStudentLogin();
      return;
    }
    setBriefingExam(exam);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 border border-orange-500/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            ELGI EXAMS PORTAL &bull; 10 Active AI &amp; Automation Modules
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {currentStudent ? (
              <>Welcome, <span className="text-orange-400">{currentStudent.name}</span>.</>
            ) : (
              <>Official <span className="text-orange-400">AI &amp; Automation</span> Examinations.</>
            )}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Complete the 10 modules currently in the ELGI curriculum: from <strong className="text-white">AI Foundations</strong> and <strong className="text-white">The CREATE Framework</strong> to <strong className="text-white">APIs &amp; Webhooks</strong> and <strong className="text-white">The Builder Blueprint</strong>.
            Each exam includes split-screen access to the accredited <strong className="text-white">PDF Study Guide</strong> and strict examination time limits.
          </p>

          {!currentStudent && (
            <div className="mb-6 p-4 rounded-2xl bg-orange-950/60 border border-orange-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-orange-200">Candidate Authentication Required to Begin Tests</p>
                <p className="text-[11px] text-orange-300/80">Sign in with your Student ID and Password to submit auto-graded answers.</p>
              </div>
              <button
                onClick={onOpenStudentLogin}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Login Portal</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Split-Screen PDF Study Guides</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Timed Assessments &amp; Time Limits</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Objective &amp; Subjective Theory</span>
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
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search 10 AI courses, topics, codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
          />
        </div>
      </div>

      {/* Courses / Exam Cards Grid */}
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
                <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
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
                      Completed
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
                      Ready
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

                  {/* Course Learning Objectives Bullet Points */}
                  {exam.learningObjectives && exam.learningObjectives.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <ListChecks className="w-3.5 h-3.5 text-orange-600" />
                        <span>Core Learning Objectives:</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-700">
                        {exam.learningObjectives.slice(0, 3).map((obj, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-tight">
                            <span className="text-orange-500 font-bold shrink-0">&bull;</span>
                            <span className="line-clamp-1">{obj}</span>
                          </li>
                        ))}
                        {exam.learningObjectives.length > 3 && (
                          <li className="text-[10px] text-orange-600 font-semibold pl-2">
                            +{exam.learningObjectives.length - 3} more objectives in syllabus
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Attached PDF Guide Box */}
                  <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          ELGI Reference Guide
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
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                        <HelpCircle className="w-3 h-3" />
                        <span>Items</span>
                      </div>
                      <div className="font-bold text-slate-800">{exam.questions.length}</div>
                    </div>

                    <div className="p-2 rounded-xl bg-orange-50 border border-orange-100/70">
                      <div className="flex items-center justify-center gap-1 text-orange-600 text-[10px] mb-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Limit</span>
                      </div>
                      <div className="font-bold text-orange-700">{exam.durationMinutes}m</div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                        <Award className="w-3 h-3" />
                        <span>Pass</span>
                      </div>
                      <div className="font-bold text-slate-800">{exam.passPercentage}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleStartExamClick(exam)}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/30 group-hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  {currentStudent ? (
                    <>
                      <span>{bestAttempt ? 'Retake Examination' : 'Start Examination'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-orange-200" />
                      <span>Sign In to Start Exam</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-Exam Briefing Modal */}
      {briefingExam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                  {briefingExam.code}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {briefingExam.title}
                </h2>
                {currentStudent && (
                  <p className="text-xs text-slate-500 mt-1">
                    Candidate: <strong className="text-slate-800">{currentStudent.name}</strong> ({currentStudent.studentNumber})
                  </p>
                )}
              </div>
              <button
                onClick={() => setBriefingExam(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
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
                <span className="text-slate-400 block text-[10px]">Total Items</span>
                <span className="font-bold text-slate-800">{briefingExam.questions.length} Questions</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pass Standard</span>
                <span className="font-bold text-emerald-600">{briefingExam.passPercentage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Grading</span>
                <span className="font-bold text-orange-600">Automated</span>
              </div>
            </div>

            {/* Course Objectives */}
            {briefingExam.learningObjectives && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-orange-600" />
                  Assessed Learning Objectives
                </h4>
                <ul className="space-y-1.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-xs text-slate-700">
                  {briefingExam.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">&bull;</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exam Instructions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Assessment Instructions &amp; Privacy Notice
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                <li>You can consult the split-screen PDF study guide throughout the test.</li>
                <li>Your time limit begins immediately upon clicking &quot;Begin Examination&quot;.</li>
                <li>Upon submission, your test is auto-graded. In accordance with ELGI policy, student scores are held confidentially in the Admin Gradebook.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setBriefingExam(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const examToStart = briefingExam;
                  setBriefingExam(null);
                  onStartExam(examToStart);
                }}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 flex items-center gap-2"
              >
                <span>Begin Examination</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone PDF Study Guide Viewer Modal */}
      {previewGuideExam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">{previewGuideExam.pdfGuide.title}</h3>
                  <p className="text-[11px] text-slate-400">{previewGuideExam.title} &bull; {previewGuideExam.code}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewGuideExam(null)}
                className="text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold"
              >
                Close Guide
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFGuideViewer guide={previewGuideExam.pdfGuide} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
