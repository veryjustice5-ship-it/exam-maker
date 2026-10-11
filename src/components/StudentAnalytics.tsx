import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  Printer, 
  FileText, 
  BookOpen, 
  User, 
  ChevronRight, 
  Layers, 
  Target,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { Student, ExamAttempt, Exam } from '../types';
import { CertificateModal } from './CertificateModal';
import { formatTime } from '../utils/grading';

interface StudentAnalyticsProps {
  students: Student[];
  currentStudent: Student;
  onSelectStudent: (student: Student) => void;
  attempts: ExamAttempt[];
  exams: Exam[];
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  attempts,
  exams,
}) => {
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<ExamAttempt | null>(null);
  const [selectedCertificateAttempt, setSelectedCertificateAttempt] = useState<ExamAttempt | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'history' | 'topics'>('overview');

  // Filter attempts for this specific student
  const studentAttempts = useMemo(() => {
    return attempts.filter(a => a.studentId === currentStudent.id);
  }, [attempts, currentStudent.id]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const total = studentAttempts.length;
    if (total === 0) {
      return {
        totalAttempts: 0,
        passRate: 0,
        avgScore: 0,
        avgDurationSeconds: 0,
        highestScore: 0,
        totalTimeSpent: 0,
      };
    }

    const passed = studentAttempts.filter(a => a.passed).length;
    const scoreSum = studentAttempts.reduce((sum, a) => sum + a.percentage, 0);
    const durationSum = studentAttempts.reduce((sum, a) => sum + a.durationSeconds, 0);
    const highest = Math.max(...studentAttempts.map(a => a.percentage));

    return {
      totalAttempts: total,
      passRate: Math.round((passed / total) * 100),
      avgScore: Math.round(scoreSum / total),
      avgDurationSeconds: Math.round(durationSum / total),
      highestScore: highest,
      totalTimeSpent: durationSum,
    };
  }, [studentAttempts]);

  // Topic mastery across all tests
  const topicMastery = useMemo(() => {
    const topicMap: Record<string, { earned: number; max: number; questions: number; correct: number }> = {};

    studentAttempts.forEach(attempt => {
      attempt.categoryScores.forEach(cat => {
        if (!topicMap[cat.category]) {
          topicMap[cat.category] = { earned: 0, max: 0, questions: 0, correct: 0 };
        }
        topicMap[cat.category].earned += cat.earned;
        topicMap[cat.category].max += cat.max;
        topicMap[cat.category].questions += cat.totalQuestions;
        topicMap[cat.category].correct += cat.correctQuestions;
      });
    });

    return Object.entries(topicMap).map(([category, data]) => {
      const percentage = data.max > 0 ? Math.round((data.earned / data.max) * 100) : 0;
      return {
        category,
        earned: Math.round(data.earned * 10) / 10,
        max: data.max,
        questions: data.questions,
        correct: data.correct,
        percentage,
        status: percentage >= 85 ? 'Mastered' : percentage >= 65 ? 'Proficient' : 'Needs Practice',
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [studentAttempts]);

  // Class median benchmark for comparison
  const classAvgScore = useMemo(() => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length);
  }, [attempts]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Attempt ID', 'Exam Code', 'Exam Title', 'Date', 'Score %', 'Grade', 'Passed', 'Duration (s)'];
    const rows = studentAttempts.map(a => [
      a.id,
      a.examCode,
      `"${a.examTitle}"`,
      new Date(a.submittedAt).toISOString().split('T')[0],
      a.percentage,
      a.letterGrade,
      a.passed ? 'PASS' : 'FAIL',
      a.durationSeconds,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentStudent.name.replace(/\s+/g, '_')}_ClassMarker_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Student Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Student Details */}
          <div className="flex items-center gap-4">
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-indigo-50 border border-indigo-200 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentStudent.name}
                </h1>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {currentStudent.studentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {currentStudent.email} &bull; ClassMarker Student Dossier
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Enrolled &amp; Active</span>
              </div>
            </div>
          </div>

          {/* Student Switcher & Export */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Student Selector Dropdown */}
            <div className="relative">
              <select
                value={currentStudent.id}
                onChange={(e) => {
                  const found = students.find(s => s.id === e.target.value);
                  if (found) onSelectStudent(found);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentNumber})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={studentAttempts.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
              title="Download Student CSV Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* High-level Analytics KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          {/* 1. Exams Taken */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Tests Completed</span>
              <FileText className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalAttempts}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across all courses
            </div>
          </div>

          {/* 2. Pass Rate */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Success / Pass Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.passRate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {studentAttempts.filter(a => a.passed).length} of {stats.totalAttempts} passed
            </div>
          </div>

          {/* 3. Average Score */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Average Score</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.avgScore}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span>Class Median: <strong>{classAvgScore}%</strong></span>
              {stats.avgScore >= classAvgScore ? (
                <span className="text-emerald-600 font-bold">(+{stats.avgScore - classAvgScore}%)</span>
              ) : (
                <span className="text-rose-600 font-bold">({stats.avgScore - classAvgScore}%)</span>
              )}
            </div>
          </div>

          {/* 4. Average Time */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Avg Completion Time</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatTime(stats.avgDurationSeconds)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Total: {Math.round(stats.totalTimeSpent / 60)} mins engaged
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Performance &amp; Strengths Diagnosis
        </button>
        <button
          onClick={() => setActiveSubTab('topics')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'topics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Category &amp; Topic Mastery ({topicMastery.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Historical Exam Attempts ({studentAttempts.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STRENGTHS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Topic Mastery Radar / Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Syllabus Domain Competency Map
                </h3>
                <p className="text-xs text-slate-500">
                  Automatic proficiency tracking based on responses across tests.
                </p>
              </div>
            </div>

            {topicMastery.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No exam attempts yet. Complete an exam to view topic analytics.
              </div>
            ) : (
              <div className="space-y-4">
                {topicMastery.map((topic) => (
                  <div key={topic.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{topic.category}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          topic.status === 'Mastered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : topic.status === 'Proficient'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {topic.status}
                        </span>
                        <span className="font-mono font-bold text-slate-800">{topic.percentage}%</span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          topic.percentage >= 85
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : topic.percentage >= 65
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-r from-rose-500 to-red-400'
                        }`}
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{topic.correct} of {topic.questions} questions answered correctly</span>
                      <span>{topic.earned} / {topic.max} points</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Personalized Recommendations & Strengths */}
          <div className="space-y-6">
            {/* Top Strengths */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Target className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Top Academic Strengths</h4>
              </div>
              <p className="text-xs text-slate-500">
                Areas where {currentStudent.name} demonstrates highest mastery:
              </p>
              <div className="space-y-2">
                {topicMastery.slice(0, 2).map((t, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="font-bold text-emerald-900">{t.category}</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      {t.percentage}% Accuracy ({t.correct}/{t.questions} correct)
                    </div>
                  </div>
                ))}
                {topicMastery.length === 0 && (
                  <div className="text-xs text-slate-400 italic">No attempt data yet.</div>
                )}
              </div>
            </div>

            {/* Targeted Review Areas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Targeted Revision Needed</h4>
              </div>
              <p className="text-xs text-slate-500">
                Study guide sections recommended for review:
              </p>
              <div className="space-y-2">
                {topicMastery.filter(t => t.percentage < 75).slice(0, 2).map((t, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                    <div className="font-bold text-rose-900">{t.category}</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Current score: {t.percentage}%. Re-read relevant chapter in study guide.
                    </div>
                  </div>
                ))}
                {topicMastery.filter(t => t.percentage < 75).length === 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    All evaluated topics are at or above 75% standard!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOPIC MASTERY EXPANDED */}
      {activeSubTab === 'topics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Detailed Category Performance Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Categorized performance data across all exams written by {currentStudent.name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicMastery.map((topic) => (
              <div 
                key={topic.category}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900">{topic.category}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    topic.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {topic.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${topic.percentage >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>Questions: {topic.correct} / {topic.questions}</span>
                  <span>Points: {topic.earned} / {topic.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORICAL EXAM ATTEMPTS */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Completed Exam Ledger &amp; Test Records
              </h3>
              <p className="text-xs text-slate-500">
                Timestamped records with auto-graded scores and downloadable certificates.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
              {studentAttempts.length} Total Submissions
            </span>
          </div>

          {studentAttempts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No exam attempts recorded yet for this candidate.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                    <th className="py-3 px-3">Exam Code</th>
                    <th className="py-3 px-3">Exam Title</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-3">Time Taken</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3">Result</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {attempt.examCode}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {attempt.examTitle}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(attempt.submittedAt).toLocaleDateString()} {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {formatTime(attempt.durationSeconds)}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {attempt.percentage}% ({attempt.totalEarnedPoints}/{attempt.totalMaxPoints})
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50">
                          {attempt.letterGrade}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          attempt.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {attempt.passed && (
                          <button
                            onClick={() => setSelectedCertificateAttempt(attempt)}
                            className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-[11px] font-semibold"
                          >
                            Certificate
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAttemptForReview(attempt)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attempt Review Modal */}
      {selectedAttemptForReview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {selectedAttemptForReview.examCode}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedAttemptForReview.examTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate: <strong>{selectedAttemptForReview.studentName}</strong> &bull; Score: <strong className="text-emerald-700">{selectedAttemptForReview.percentage}% ({selectedAttemptForReview.letterGrade})</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            {/* Questions detail in attempt */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Question Breakdown &amp; Feedback
              </h4>
              {Object.values(selectedAttemptForReview.scores).map((score, i) => (
                <div 
                  key={score.questionId}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    score.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Question {i + 1} ({score.category})</span>
                    <span className={score.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                      {score.earned} / {score.max} pts
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <strong>Your answer:</strong> {String(score.userAnswer || '(none)')}
                  </div>
                  <div className="text-slate-600">
                    <strong>Expected:</strong> {score.correctAnswerSummary}
                  </div>
                  <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                    {score.feedback}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificateAttempt && (
        <CertificateModal
          attempt={selectedCertificateAttempt}
          onClose={() => setSelectedCertificateAttempt(null)}
        />
      )}
    </div>
  );
};
