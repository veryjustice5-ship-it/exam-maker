import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Award, 
  Clock, 
  RotateCcw, 
  BarChart3, 
  FileText, 
  Printer, 
  BookOpen, 
  ChevronRight, 
  ExternalLink,
  Filter,
  Check,
  X
} from 'lucide-react';
import { Exam, ExamAttempt } from '../types';
import { CertificateModal } from './CertificateModal';
import { PDFGuideViewer } from './PDFGuideViewer';
import { formatTime } from '../utils/grading';

interface GradingResultViewProps {
  exam: Exam;
  attempt: ExamAttempt;
  onRetakeExam: () => void;
  onGoToAnalytics: () => void;
  onBackToCatalog: () => void;
}

export const GradingResultView: React.FC<GradingResultViewProps> = ({
  exam,
  attempt,
  onRetakeExam,
  onGoToAnalytics,
  onBackToCatalog,
}) => {
  const [showCertificate, setShowCertificate] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [previewGuidePage, setPreviewGuidePage] = useState<number | null>(null);

  // Trigger confetti if passed
  useEffect(() => {
    if (attempt.passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.passed]);

  // Filter questions
  const filteredQuestionList = exam.questions.filter(q => {
    const detail = attempt.scores[q.id];
    if (filterMode === 'correct') return detail?.isCorrect;
    if (filterMode === 'incorrect') return !detail?.isCorrect;
    return true;
  });

  const correctCount = Object.values(attempt.scores).filter(s => s.isCorrect).length;
  const incorrectCount = exam.questions.length - correctCount;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner: Score & Pass/Fail status */}
      <div className={`rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
        attempt.passed
          ? 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 border border-emerald-500/30'
          : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border border-rose-500/30'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 border border-white/20">
                {attempt.examCode}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                attempt.passed ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-400/20 text-rose-300 border border-rose-400/40'
              }`}>
                {attempt.passed ? 'Assessment Passed' : 'Assessment Not Passed'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {attempt.passed ? 'Congratulations!' : 'Keep Going!'} {attempt.studentName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {attempt.passed
                ? `You met the passing threshold of ${attempt.passPercentage}% with an official score of ${attempt.percentage}%. Your automatic grade has been registered.`
                : `You scored ${attempt.percentage}%. The pass mark is ${attempt.passPercentage}%. Review the questions below with reference to the study guide before retaking.`
              }
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                <span>Time Spent: <strong>{formatTime(attempt.durationSeconds)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Correct: <strong>{correctCount}/{exam.questions.length}</strong></span>
              </div>
            </div>
          </div>

          {/* Big Score Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col items-center justify-center min-w-[200px] text-center shrink-0">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-300">
              Auto-Graded Score
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight my-1">
              {attempt.percentage}%
            </div>
            <div className="text-xs font-semibold text-slate-200">
              {attempt.totalEarnedPoints} / {attempt.totalMaxPoints} Points
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 font-mono text-xs font-bold">
              Grade: <span className="text-amber-300">{attempt.letterGrade}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons inside banner */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
          {attempt.passed && (
            <button
              onClick={() => setShowCertificate(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              <span>Claim Certificate</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center gap-2 border border-white/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onGoToAnalytics}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Full Analytics</span>
          </button>

          <button
            onClick={onRetakeExam}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/15"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Exam</span>
          </button>

          <button
            onClick={onBackToCatalog}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-medium ml-auto"
          >
            Back to Catalog &rarr;
          </button>
        </div>
      </div>

      {/* Category Mastery Breakdown (ClassMarker style) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Topic Mastery &amp; Competency Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated across discrete syllabus areas specified in the study guide.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {attempt.categoryScores.length} Domains
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attempt.categoryScores.map((cat) => {
            const isHigh = cat.percentage >= 80;
            const isMid = cat.percentage >= 60 && !isHigh;

            return (
              <div 
                key={cat.category}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-slate-800 leading-snug">
                    {cat.category}
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isHigh ? 'bg-emerald-100 text-emerald-800' : isMid ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {cat.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? 'bg-emerald-500' : isMid ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Score: {cat.earned} / {cat.max} pts</span>
                  <span>{cat.correctQuestions}/{cat.totalQuestions} questions correct</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized Questions Review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Question Review &amp; Study Citations
            </h3>
            <p className="text-xs text-slate-500">
              Review your submitted answers alongside official solutions, explanations, and PDF guide pages.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({exam.questions.length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'incorrect' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Needs Review ({incorrectCount})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-5">
          {filteredQuestionList.map((q, idx) => {
            const detail = attempt.scores[q.id];
            const isCorrect = detail?.isCorrect;
            const isPartial = detail?.partialCredit;

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-5 space-y-4 transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isPartial
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {q.category}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isPartial
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : isPartial ? <AlertCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{detail?.earned} / {q.points} pts</span>
                    </span>
                  </div>
                </div>

                {/* Prompt */}
                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {q.questionText}
                </h4>

                {/* Student Answer vs Correct Answer Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Your Answer */}
                  <div className={`p-3 rounded-lg border ${
                    isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Candidate&apos;s Submitted Answer
                    </div>
                    <div className="font-medium text-slate-800 break-words">
                      {formatUserAnswer(detail?.userAnswer, q)}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-3 rounded-lg border bg-white border-slate-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                      Official Expected Answer
                    </div>
                    <div className="font-semibold text-slate-900 break-words">
                      {detail?.correctAnswerSummary || 'Expected solution based on rubric'}
                    </div>
                  </div>
                </div>

                {/* Automated Feedback & Explanation */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Automated Marking Rationale:</span>
                  </div>
                  <p className="leading-relaxed">{detail?.feedback}</p>
                </div>

                {/* Study Guide Citation Reference Button */}
                {q.guideReference && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="text-indigo-950">
                        Guide Citation: <strong>{q.guideReference.sectionTitle}</strong> (Page {q.guideReference.pageNumber})
                      </span>
                    </div>

                    <button
                      onClick={() => setPreviewGuidePage(q.guideReference!.pageNumber)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                    >
                      <span>Read Section</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          attempt={attempt}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* PDF Guide Viewer Modal for Reference citation */}
      {previewGuidePage !== null && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
          <div className="w-full max-w-4xl h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <PDFGuideViewer
              guide={exam.pdfGuide}
              initialPage={previewGuidePage}
              onClose={() => setPreviewGuidePage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function formatUserAnswer(answer: any, q: any): string {
  if (answer === undefined || answer === null || answer === '') {
    return '(No answer provided)';
  }
  if (q.type === 'single_choice' || q.type === 'true_false') {
    const opt = q.options?.find((o: any) => o.id === answer);
    return opt ? opt.text : String(answer);
  }
  if (q.type === 'multiple_choice' && Array.isArray(answer)) {
    if (answer.length === 0) return '(No options selected)';
    const texts = answer.map(id => {
      const opt = q.options?.find((o: any) => o.id === id);
      return opt ? opt.text : id;
    });
    return texts.join(', ');
  }
  return String(answer);
}
