import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Flag, 
  CheckCircle, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  AlertTriangle, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Sparkles,
  Send,
  Eye,
  Maximize2
} from 'lucide-react';
import { Exam, Student, ExamAttempt } from '../types';
import { PDFGuideViewer } from './PDFGuideViewer';
import { gradeExamAttempt, formatTime } from '../utils/grading';

interface ActiveExamProps {
  exam: Exam;
  currentStudent: Student;
  onSubmitExam: (attempt: ExamAttempt) => void;
  onCancelExam: () => void;
}

export const ActiveExam: React.FC<ActiveExamProps> = ({
  exam,
  currentStudent,
  onSubmitExam,
  onCancelExam,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<string, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(exam.durationMinutes * 60);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [guideTargetPage, setGuideTargetPage] = useState<number>(1);
  const [guideKeyword, setGuideKeyword] = useState<string>('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime] = useState<string>(new Date().toISOString());

  // Track question-specific timer
  const currentQuestion = exam.questions[currentQuestionIndex];
  const questionStartTimeRef = useRef<number>(Date.now());

  // Main countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update time spent per question on switch
  const recordQuestionTime = () => {
    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    if (currentQuestion) {
      setTimeSpentPerQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + elapsed,
      }));
    }
    questionStartTimeRef.current = Date.now();
  };

  const goToQuestion = (index: number) => {
    recordQuestionTime();
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const toggleFlag = (questionId: string) => {
    setFlagged(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId) 
        : [...prev, questionId]
    );
  };

  // Answer handler
  const setAnswerForQuestion = (qId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  // Checkbox handler for multiple_choice
  const toggleCheckboxOption = (qId: string, optionId: string) => {
    const current = (answers[qId] as string[]) || [];
    if (current.includes(optionId)) {
      setAnswerForQuestion(qId, current.filter(id => id !== optionId));
    } else {
      setAnswerForQuestion(qId, [...current, optionId]);
    }
  };

  const isQuestionAnswered = (qId: string) => {
    const ans = answers[qId];
    if (ans === undefined || ans === null || ans === '') return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return true;
  };

  const answeredCount = exam.questions.filter(q => isQuestionAnswered(q.id)).length;
  const unansweredCount = exam.questions.length - answeredCount;

  // Jump guide to reference for this question
  const jumpToQuestionGuideRef = () => {
    if (currentQuestion.guideReference) {
      setGuideTargetPage(currentQuestion.guideReference.pageNumber);
      setGuideKeyword(currentQuestion.guideReference.sectionTitle.split(':')[0] || '');
      setIsGuideOpen(true);
    }
  };

  const handleFinalSubmit = () => {
    recordQuestionTime();
    const gradedAttempt = gradeExamAttempt(
      exam,
      currentStudent.id,
      currentStudent.name,
      currentStudent.studentNumber,
      answers,
      timeSpentPerQuestion,
      flagged,
      startTime
    );
    onSubmitExam(gradedAttempt);
  };

  const handleAutoSubmitOnTimeout = () => {
    recordQuestionTime();
    const gradedAttempt = gradeExamAttempt(
      exam,
      currentStudent.id,
      currentStudent.name,
      currentStudent.studentNumber,
      answers,
      timeSpentPerQuestion,
      flagged,
      startTime
    );
    onSubmitExam(gradedAttempt);
  };

  // Timer warning styling
  const isUrgent = timeRemainingSeconds < 180; // <3 mins
  const isWarning = timeRemainingSeconds < 360 && !isUrgent; // <6 mins

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-[1600px] mx-auto overflow-hidden bg-slate-100 rounded-2xl border border-slate-300 shadow-xl">
      {/* Top Test Control Bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 sm:px-6 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
        {/* Left: Exam Info */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {exam.code}
          </span>
          <div className="truncate">
            <h2 className="text-sm font-bold truncate text-slate-100">{exam.title}</h2>
            <div className="text-[11px] text-slate-400">
              Candidate: <span className="text-slate-200 font-semibold">{currentStudent.name}</span> &bull; Auto-Marking Enabled
            </div>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-all ${
          isUrgent 
            ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
            : isWarning 
            ? 'bg-amber-950/60 text-amber-300 border-amber-600/50'
            : 'bg-slate-800 text-emerald-400 border-slate-700'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400' : 'text-emerald-400'}`} />
          <span>{formatTime(timeRemainingSeconds)}</span>
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">remaining</span>
        </div>

        {/* Right: PDF Toggle & Finish Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isGuideOpen
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Study Guide</span>
            <span className="text-[10px] bg-slate-900/60 px-1 rounded text-slate-300">
              {isGuideOpen ? 'Hide' : 'Show'}
            </span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/30 flex items-center gap-1.5"
          >
            <span>Finish &amp; Submit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Examination Viewport (Split between Questions & PDF Guide) */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left / Main: Question Paper Pane */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-white transition-all ${isGuideOpen ? 'md:w-1/2 lg:w-7/12' : 'w-full'}`}>
          {/* Question Nav Breadcrumb / Progress */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500">{currentQuestion.category}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {currentQuestion.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {currentQuestion.points} Points
              </span>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  flagged.includes(currentQuestion.id)
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {flagged.includes(currentQuestion.id) ? 'Flagged' : 'Flag for Review'}
                </span>
              </button>
            </div>
          </div>

          {/* Question Content Viewport */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQuestion.questionText}
              </h3>

              {/* Guide Reference Quick Jump Link */}
              {currentQuestion.guideReference && (
                <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    Study Guide Reference: <strong className="font-semibold">{currentQuestion.guideReference.sectionTitle}</strong> (Page {currentQuestion.guideReference.pageNumber})
                  </span>
                  <button
                    onClick={jumpToQuestionGuideRef}
                    className="text-indigo-600 font-bold hover:underline ml-1"
                  >
                    Open Page &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Answer Inputs based on Question Type */}
            <div className="space-y-3 pt-2">
              {/* 1. Single Choice */}
              {currentQuestion.type === 'single_choice' && (
                <div className="space-y-2.5">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 font-medium shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQuestion.id}`}
                          checked={isSelected}
                          onChange={() => setAnswerForQuestion(currentQuestion.id, opt.id)}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm leading-relaxed">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 2. Multiple Choice (Select All that Apply) */}
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Select all correct answers:
                  </div>
                  {currentQuestion.options?.map((opt) => {
                    const selectedList = (answers[currentQuestion.id] as string[]) || [];
                    const isChecked = selectedList.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 font-medium shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckboxOption(currentQuestion.id, opt.id)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm leading-relaxed">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 3. True / False */}
              {currentQuestion.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.id;
                    const isTrue = opt.text.toLowerCase() === 'true';
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswerForQuestion(currentQuestion.id, opt.id)}
                        className={`py-4 px-6 rounded-xl border text-base font-bold transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? isTrue 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : 'bg-rose-600 text-white border-rose-600 shadow-md'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. Fill in the Blank */}
              {currentQuestion.type === 'fill_blank' && (
                <div className="space-y-2 max-w-lg">
                  <label className="block text-xs font-semibold text-slate-600">
                    Type the correct scientific or technical term below:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswerForQuestion(currentQuestion.id, e.target.value)}
                    placeholder="Enter your exact answer here..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Our auto-marking engine recognizes standard abbreviations, synonyms, and punctuation variants.
                  </p>
                </div>
              )}

              {/* 5. Short Answer / Explanation */}
              {currentQuestion.type === 'short_answer' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    Provide your written explanation (auto-marked against key concepts and rubrics):
                  </label>
                  <textarea
                    rows={5}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswerForQuestion(currentQuestion.id, e.target.value)}
                    placeholder="Formulate your concise response referring to the study guide..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Keyword &amp; conceptual criteria evaluated automatically on submit.</span>
                    <span>{(answers[currentQuestion.id] || '').length} characters</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Question Navigation & Grid bar */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3 shrink-0">
            {/* Prev / Next Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {/* Status tally */}
              <div className="text-xs text-slate-600 hidden sm:flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Answered: <strong>{answeredCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                  Unanswered: <strong>{unansweredCount}</strong>
                </span>
                {flagged.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-700">
                    <Flag className="w-3 h-3 text-amber-500" />
                    Flagged: <strong>{flagged.length}</strong>
                  </span>
                )}
              </div>

              {currentQuestionIndex < exam.questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <span>Review &amp; Submit</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Navigation Numbers Grid */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAns = isQuestionAnswered(q.id);
                const isFlg = flagged.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`relative w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white'
                        : isAns
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                    title={`Question ${idx + 1}: ${isAns ? 'Answered' : 'Unanswered'}${isFlg ? ' (Flagged)' : ''}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlg && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-1 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right / Secondary: Attached PDF Reference Guide Split-Screen */}
        {isGuideOpen && (
          <div className="md:w-1/2 lg:w-5/12 h-64 md:h-full border-t md:border-t-0 md:border-l border-slate-300 flex flex-col bg-slate-900">
            <PDFGuideViewer
              guide={exam.pdfGuide}
              initialPage={guideTargetPage}
              highlightKeyword={guideKeyword}
              onClose={() => setIsGuideOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal (ClassMarker inspired) */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ready to Submit Your Exam?
              </h3>
              <p className="text-xs text-slate-500">
                Your answers will be automatically evaluated, scored, and recorded instantly.
              </p>
            </div>

            {/* Questions Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600">Answered Questions:</span>
                <span className="font-bold text-emerald-700">{answeredCount} of {exam.questions.length}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600">Unanswered Questions:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Flagged for Review:</span>
                <span className="font-bold text-amber-600">{flagged.length}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You still have <strong>{unansweredCount} unanswered questions</strong>. Any blank answers will receive 0 marks.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Return to Exam
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
              >
                Yes, Submit &amp; Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
