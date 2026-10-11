import React from 'react';
import { Award, Printer, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { ExamAttempt } from '../types';

interface CertificateModalProps {
  attempt: ExamAttempt;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  attempt,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(attempt.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-8">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Official Certificate of Examination Completion</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-amber-50/40 via-white to-indigo-50/40 border-8 border-double border-indigo-950/20 m-4 rounded-xl text-center relative">
          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Award className="w-96 h-96 text-indigo-900" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-indigo-900 px-3 py-1 rounded-full bg-indigo-100/70 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Verified Academic Assessment
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-serif text-slate-900 mt-4 tracking-tight">
                Certificate of Achievement
              </h1>
              <p className="text-xs uppercase tracking-widest font-mono text-slate-500 mt-1">
                ClassMarker Standard Online Certification
              </p>
            </div>

            {/* Recipient */}
            <div className="py-2">
              <p className="text-xs text-slate-600 font-sans italic">This is proudly awarded to</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-indigo-950 font-serif border-b-2 border-indigo-900/30 inline-block px-8 py-2 mt-1">
                {attempt.studentName}
              </h2>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Student ID: {attempt.studentNumber}
              </p>
            </div>

            {/* Achievement Text */}
            <div className="max-w-xl mx-auto text-sm text-slate-700 leading-relaxed font-sans">
              for successfully completing the rigorous examination and demonstrating subject mastery in
              <div className="font-bold text-slate-950 text-base sm:text-lg mt-1 font-serif">
                &ldquo;{attempt.examTitle}&rdquo; ({attempt.examCode})
              </div>
            </div>

            {/* Score & Grade Seal */}
            <div className="grid grid-cols-3 max-w-md mx-auto gap-3 py-2 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Final Grade</span>
                <span className="text-2xl font-black text-indigo-600">{attempt.letterGrade}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Score Achieved</span>
                <span className="text-2xl font-black text-emerald-600">{attempt.percentage}%</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Pass Standard</span>
                <span className="text-2xl font-black text-slate-700">{attempt.passPercentage}%</span>
              </div>
            </div>

            {/* Signatures & Issue Verification */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs font-serif">
              <div className="text-left">
                <div className="border-b border-slate-400 pb-1 font-mono text-slate-800 font-semibold">
                  ExamCraft Academic Board
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Authorized Automated Examiner</div>
                <div className="text-[10px] text-slate-400 font-mono">Date Issued: {formattedDate}</div>
              </div>

              <div className="text-right">
                <div className="font-mono text-[11px] text-slate-800 font-bold">
                  {attempt.certificateId}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Verification ID</div>
                <div className="text-[9px] text-emerald-600 font-mono flex items-center justify-end gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" /> Digital Ledger Cryptographic Record
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
