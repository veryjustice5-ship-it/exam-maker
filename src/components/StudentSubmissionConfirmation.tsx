import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Printer, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Exam, ExamAttempt, Student } from '../types';
import { ELGILogo } from './ELGILogo';
import { formatTime } from '../utils/grading';

interface StudentSubmissionConfirmationProps {
  exam: Exam;
  attempt: ExamAttempt;
  student: Student;
  onReturnToCatalog: () => void;
  onOpenAdminLogin: () => void;
}

export const StudentSubmissionConfirmation: React.FC<StudentSubmissionConfirmationProps> = ({
  exam,
  attempt,
  student,
  onReturnToCatalog,
  onOpenAdminLogin,
}) => {
  const formattedDate = new Date(attempt.submittedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Official Confirmation Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Header Strip with ELGI Logo */}
        <div className="bg-slate-950 text-white px-6 sm:px-8 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ELGILogo variant="icon" className="w-9 h-9" inverted />
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-orange-400 font-mono">
                ELGI EXAMS PORTAL
              </div>
              <div className="text-[11px] text-slate-400">
                e-Learning GROUP INSTITUTE &bull; Examinations Department
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/50 text-emerald-400 text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RECORDED</span>
          </div>
        </div>

        {/* Success Icon & Notice */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center mx-auto text-orange-600 shadow-sm">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Exam Submission Received
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Your examination responses have been securely logged, timestamped, and transmitted to the automated evaluation repository.
            </p>
          </div>

          {/* Submission Receipt Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
              <span>Official Submission Voucher</span>
              <span>Ref: {attempt.certificateId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Candidate Name</span>
                <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                <span className="text-[11px] text-slate-500 font-mono block">ID: {student.studentNumber}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Examination</span>
                <span className="font-bold text-slate-900 text-sm">{exam.title}</span>
                <span className="text-[11px] font-mono text-orange-700 font-bold block">Course Code: {exam.code}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Submission Timestamp</span>
                <span className="font-medium text-slate-800">{formattedDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Duration Logged</span>
                <span className="font-medium text-slate-800">{formatTime(attempt.durationSeconds)} elapsed</span>
              </div>
            </div>
          </div>

          {/* Confidentiality Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Restricted Grade Policy (Student Access Policy)</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-900/90">
              Under <strong>e-Learning GROUP INSTITUTE Academic Examination Guidelines</strong>, all automated grading results, scores, itemized answers, and pass/fail rankings are confidential and restricted exclusively to authorized examiners and administrators. 
            </p>
            <p className="leading-relaxed text-[11px] text-amber-900/90">
              Students cannot view test scores or solutions directly in this portal. Your instructor will publish official finalized semester grades according to the academic calendar.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Submission Voucher</span>
            </button>

            <button
              onClick={onReturnToCatalog}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/30"
            >
              <span>Return to Exam Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Quick Switch Helper for Faculty / Evaluators */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-white">Are you an Examiner or Academic Administrator?</div>
            <div className="text-[11px] text-slate-400">
              Sign in to the Admin Portal to review {student.name}&apos;s auto-graded score, question breakdown, and student analytics.
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAdminLogin}
          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs whitespace-nowrap shadow-sm"
        >
          Admin Login &rarr;
        </button>
      </div>
    </div>
  );
};
