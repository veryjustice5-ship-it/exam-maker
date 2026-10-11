import React, { useState } from 'react';
import { 
  Plus, 
  Settings, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Upload, 
  Save, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Clock,
  Award,
  Layers,
  X,
  RotateCcw,
  Edit3,
  Check,
  Eye,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Exam, Question, QuestionType, PDFGuide, ExamAttempt, Student, AdminUser } from '../types';
import { ELGILogo } from './ELGILogo';
import { formatTime } from '../utils/grading';

interface TeacherTestManagerProps {
  exams: Exam[];
  attempts: ExamAttempt[];
  students: Student[];
  currentAdmin: AdminUser | null;
  onSaveExam: (newExam: Exam) => void;
  onUpdateExam: (updatedExam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onResetData: () => void;
  onInspectAttempt?: (attempt: ExamAttempt) => void;
}

export const TeacherTestManager: React.FC<TeacherTestManagerProps> = ({
  exams,
  attempts,
  students,
  currentAdmin,
  onSaveExam,
  onUpdateExam,
  onDeleteExam,
  onResetData,
  onInspectAttempt,
}) => {
  const [activeTab, setActiveTab] = useState<'gradebook' | 'manage_exams' | 'create_exam'>('gradebook');
  const [filterExamId, setFilterExamId] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Editing existing exam state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string>('');

  // Form state for creating a new exam
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Science & Technology');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passPercentage, setPassPercentage] = useState(70);
  const [negativeMarking, setNegativeMarking] = useState(false);
  
  // PDF Guide state
  const [guideTitle, setGuideTitle] = useState('ELGI Academic Syllabus Study Guide');
  const [guideAuthor, setGuideAuthor] = useState('ELGI Curriculum & Examinations Board');
  const [guideFileName, setGuideFileName] = useState('ELGI_Study_Guide_Official.pdf');
  const [guideSectionsText, setGuideSectionsText] = useState(
    `Chapter 1: Foundational Theory & Definitions\nKey theoretical models, core laws, and fundamental definitions.\n\nChapter 2: Methods & Systematic Application\nAnalytical problem solving steps, formulas, and evaluation protocols.`
  );
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);

  // New exam questions
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    {
      id: 'q_new_1',
      type: 'single_choice',
      questionText: 'What is the primary governing principle introduced in Chapter 1 of the ELGI study guide?',
      points: 20,
      category: 'Foundations',
      difficulty: 'Easy',
      explanation: 'See Chapter 1 in the study guide.',
      guideReference: {
        sectionTitle: 'Chapter 1: Foundational Theory & Definitions',
        pageNumber: 1,
        quoteOrSummary: 'Introduces core theoretical models and foundational laws.',
      },
      options: [
        { id: 'opt_a', text: 'Conservation of mass & energy', isCorrect: true },
        { id: 'opt_b', text: 'Entropy maximization', isCorrect: false },
        { id: 'opt_c', text: 'Random variation', isCorrect: false },
      ],
    },
    {
      id: 'q_new_2',
      type: 'true_false',
      questionText: 'The core methodologies described in Chapter 2 apply only to theoretical problems.',
      points: 15,
      category: 'Methodologies',
      difficulty: 'Medium',
      explanation: 'False. The methodologies apply to both theoretical and practical problem solving.',
      guideReference: {
        sectionTitle: 'Chapter 2: Methods & Systematic Application',
        pageNumber: 2,
        quoteOrSummary: 'Practical analytical steps and formulas.',
      },
      options: [
        { id: 'opt_tf_t', text: 'True', isCorrect: false },
        { id: 'opt_tf_f', text: 'False', isCorrect: true },
      ],
    },
  ]);

  // Selected attempt for inspection modal
  const [inspectedAttempt, setInspectedAttempt] = useState<ExamAttempt | null>(null);

  // Handle local PDF upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUploadedPdfUrl(fileUrl);
      setGuideFileName(file.name);
      setGuideTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  // Editing existing exam actions
  const startEditingExam = (exam: Exam) => {
    setEditingExam(JSON.parse(JSON.stringify(exam))); // deep copy
    setActiveTab('manage_exams');
  };

  const handleSaveExamEdits = () => {
    if (!editingExam) return;
    onUpdateExam(editingExam);
    setEditSuccessMsg(`Changes to "${editingExam.title}" (including time limit of ${editingExam.durationMinutes}m) saved successfully!`);
    setTimeout(() => setEditSuccessMsg(''), 4000);
  };

  // Add question to currently edited exam
  const handleAddQuestionToEditingExam = (type: QuestionType) => {
    if (!editingExam) return;
    const newId = `q_edit_${Date.now()}`;
    const newQ: Question = {
      id: newId,
      type,
      questionText: `New ${type.replace('_', ' ')} question prompt...`,
      points: 10,
      category: 'General',
      difficulty: 'Medium',
      explanation: 'Explanation referencing the ELGI study guide.',
      guideReference: {
        sectionTitle: 'Chapter 1: Reference Material',
        pageNumber: 1,
        quoteOrSummary: 'Review relevant section in the guide.',
      },
    };

    if (type === 'single_choice' || type === 'multiple_choice') {
      newQ.options = [
        { id: `${newId}_1`, text: 'Option A (Correct)', isCorrect: true },
        { id: `${newId}_2`, text: 'Option B', isCorrect: false },
        { id: `${newId}_3`, text: 'Option C', isCorrect: false },
      ];
    } else if (type === 'true_false') {
      newQ.options = [
        { id: `${newId}_t`, text: 'True', isCorrect: true },
        { id: `${newId}_f`, text: 'False', isCorrect: false },
      ];
    } else if (type === 'fill_blank') {
      newQ.acceptableAnswers = ['Correct Term'];
    } else if (type === 'short_answer') {
      newQ.requiredKeywords = ['keyword1', 'keyword2'];
    }

    setEditingExam({
      ...editingExam,
      questions: [...editingExam.questions, newQ],
    });
  };

  const handleDeleteQuestionFromEditingExam = (questionId: string) => {
    if (!editingExam) return;
    setEditingExam({
      ...editingExam,
      questions: editingExam.questions.filter(q => q.id !== questionId),
    });
  };

  // Create new exam submit
  const handleCreateNewExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || newQuestions.length === 0) {
      alert('Please provide title, course code, and at least one question.');
      return;
    }

    const rawSections = guideSectionsText.split('\n\n');
    const parsedSections = rawSections.map((block, idx) => {
      const lines = block.split('\n');
      const secTitle = lines[0] || `Section ${idx + 1}`;
      const secContent = lines.slice(1).join('\n') || block;
      return {
        id: `sec_${idx + 1}`,
        title: secTitle,
        pageNumber: idx + 1,
        content: secContent,
        keyTerms: ['Core Principle', 'Syllabus Standard'],
      };
    });

    const newGuide: PDFGuide = {
      id: `guide_${Date.now()}`,
      fileName: guideFileName,
      title: guideTitle,
      authorOrSource: guideAuthor,
      totalPages: Math.max(parsedSections.length, 3),
      description: `Official Study Guide for ${title}`,
      sections: parsedSections,
      fileUrl: uploadedPdfUrl || undefined,
      isCustomUpload: !!uploadedPdfUrl,
    };

    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      title: title.trim(),
      code: code.trim().toUpperCase(),
      category: category.trim(),
      description: description.trim() || `Official ELGI Examination on ${title.trim()}`,
      durationMinutes: Number(durationMinutes) || 20,
      passPercentage: Number(passPercentage) || 70,
      negativeMarking,
      pdfGuide: newGuide,
      questions: newQuestions,
      instructions: [
        'Refer to the attached study guide during the test as needed.',
        'Submissions are scored automatically by the ELGI evaluation engine.',
        'Official results are reviewed exclusively by Academic Administration.',
      ],
    };

    onSaveExam(newExam);
    setActiveTab('gradebook');
    setTitle('');
    setCode('');
    setDescription('');
  };

  // Gradebook calculations
  const filteredAttempts = attempts.filter(a => {
    const matchesExam = filterExamId === 'all' || a.examId === filterExamId;
    const matchesStudent = a.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      a.studentNumber.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesExam && matchesStudent;
  });

  const totalCohortSubmissions = attempts.length;
  const cohortPassed = attempts.filter(a => a.passed).length;
  const cohortPassRate = totalCohortSubmissions > 0 ? Math.round((cohortPassed / totalCohortSubmissions) * 100) : 0;
  const cohortAvgScore = totalCohortSubmissions > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalCohortSubmissions) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Admin Control Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border border-orange-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
              Authorized Administrator &bull; Examiner Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ELGI Examination &amp; Grade Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Welcome, <strong>{currentAdmin?.name || 'Administrator'}</strong>. You have exclusive clearance to view student auto-graded scores (hidden from students), configure questions, adjust examination time limits, and publish tests.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onResetData}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
            title="Reset to default mock students and exams"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('gradebook')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'gradebook'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Student Auto-Grading Results ({attempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('manage_exams')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'manage_exams'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Set Questions &amp; Adjust Time Limits ({exams.length} Exams)</span>
        </button>

        <button
          onClick={() => setActiveTab('create_exam')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'create_exam'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Author New Exam</span>
        </button>
      </div>

      {/* Success notification */}
      {editSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{editSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: CONFIDENTIAL STUDENT AUTO-GRADING RESULTS */}
      {activeTab === 'gradebook' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Active Exams</span>
              <span className="text-2xl font-black text-slate-900">{exams.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Student Submissions</span>
              <span className="text-2xl font-black text-slate-900">{totalCohortSubmissions}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Pass Rate Standard</span>
              <span className="text-2xl font-black text-emerald-600">{cohortPassRate}%</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Cohort Average Score</span>
              <span className="text-2xl font-black text-orange-600">{cohortAvgScore}%</span>
            </div>
          </div>

          {/* Privacy Note Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Confidential Evaluation Ledger:</strong> Students do not see these scores upon submitting. You can click <strong>&quot;Inspect Answers&quot;</strong> to view item-by-item responses, points awarded, and time spent.
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-slate-600">Filter Exam:</span>
              <select
                value={filterExamId}
                onChange={(e) => setFilterExamId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none"
              >
                <option value="all">All Exams ({exams.length})</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.code} - {e.title}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search candidate name or ID..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Official Student Auto-Grading Submissions
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {filteredAttempts.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Exam Code</th>
                    <th className="py-3 px-4">Exam Title</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Auto-Grade Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{attempt.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{attempt.studentNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-orange-600">
                        {attempt.examCode}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {attempt.examTitle}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(attempt.submittedAt).toLocaleDateString()} {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatTime(attempt.durationSeconds)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-sm text-slate-900">
                          {attempt.percentage}%
                          <span className="text-[11px] font-bold text-orange-600 ml-1">({attempt.letterGrade})</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {attempt.totalEarnedPoints} / {attempt.totalMaxPoints} pts
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          attempt.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {attempt.passed ? 'PASSED' : 'NOT PASSED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setInspectedAttempt(attempt)}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-semibold text-[11px] flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Answers</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAttempts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No submissions matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE EXAMS, SET QUESTIONS & ADD TIME LIMITS */}
      {activeTab === 'manage_exams' && (
        <div className="space-y-6">
          {!editingExam ? (
            /* Select Exam to edit */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100">
                        {exam.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <strong>{exam.durationMinutes} min limit</strong>
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {exam.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Questions</span>
                        <span className="font-bold text-slate-800">{exam.questions.length} Items</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Pass Standard</span>
                        <span className="font-bold text-emerald-700">{exam.passPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => startEditingExam(exam)}
                      className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Questions &amp; Time Limit</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete exam "${exam.title}"?`)) {
                          onDeleteExam(exam.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Editing specific Exam Form */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Editing Exam: {editingExam.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Course Code: {editingExam.code} &bull; Adjust time limits, questions, and points
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingExam(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Back to Exams List
                  </button>
                  <button
                    onClick={handleSaveExamEdits}
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>

              {/* Time Limit & Exam Configuration Controls */}
              <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200/90 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Exam Time Limit &amp; Parameters</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Exam Time Limit (Minutes) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={300}
                        value={editingExam.durationMinutes}
                        onChange={(e) => setEditingExam({ ...editingExam, durationMinutes: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="font-semibold text-slate-500">mins</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Students will have a live countdown of this exact duration.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Passing Score Standard (%) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={editingExam.passPercentage}
                        onChange={(e) => setEditingExam({ ...editingExam, passPercentage: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="font-semibold text-slate-500">%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Minimum percentage threshold for passing.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={editingExam.title}
                      onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Management */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Questions in this Examination ({editingExam.questions.length} Items &bull; {editingExam.questions.reduce((s, q) => s + q.points, 0)} Total Marks)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any field to edit questions, options, point weights, and correct answers.
                    </p>
                  </div>

                  {/* Add Question Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-500 font-semibold mr-1">Add:</span>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('single_choice')}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold border border-orange-200"
                    >
                      + MCQ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('true_false')}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold border border-orange-200"
                    >
                      + True/False
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('fill_blank')}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold border border-orange-200"
                    >
                      + Fill Blank
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('short_answer')}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold border border-orange-200"
                    >
                      + Short Answer
                    </button>
                  </div>
                </div>

                {/* Question Cards */}
                <div className="space-y-4">
                  {editingExam.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-[11px] uppercase bg-slate-200 px-2 py-0.5 rounded font-bold text-slate-700">
                            {q.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {q.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <span>Marks:</span>
                            <input
                              type="number"
                              min={1}
                              value={q.points}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEditingExam({
                                  ...editingExam,
                                  questions: editingExam.questions.map(item => item.id === q.id ? { ...item, points: val } : item),
                                });
                              }}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestionFromEditingExam(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Question Prompt:
                        </label>
                        <textarea
                          rows={2}
                          value={q.questionText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingExam({
                              ...editingExam,
                              questions: editingExam.questions.map(item => item.id === q.id ? { ...item, questionText: val } : item),
                            });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>

                      {/* Options editing */}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice' || q.type === 'true_false') && (
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Answer Choices (Check the radio/box for the correct answer):
                          </label>
                          {q.options?.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <input
                                type={q.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                name={`opt_correct_${q.id}`}
                                checked={opt.isCorrect}
                                onChange={() => {
                                  const updated = q.options?.map(o => {
                                    if (q.type === 'multiple_choice') {
                                      return o.id === opt.id ? { ...o, isCorrect: !o.isCorrect } : o;
                                    }
                                    return { ...o, isCorrect: o.id === opt.id };
                                  });
                                  setEditingExam({
                                    ...editingExam,
                                    questions: editingExam.questions.map(item => item.id === q.id ? { ...item, options: updated } : item),
                                  });
                                }}
                                className="cursor-pointer text-orange-600 w-4 h-4"
                              />
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = q.options?.map(o => o.id === opt.id ? { ...o, text: val } : o);
                                  setEditingExam({
                                    ...editingExam,
                                    questions: editingExam.questions.map(item => item.id === q.id ? { ...item, options: updated } : item),
                                  });
                                }}
                                className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fill in blank answer */}
                      {q.type === 'fill_blank' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Acceptable Exact Solutions (comma separated):
                          </label>
                          <input
                            type="text"
                            value={(q.acceptableAnswers || []).join(', ')}
                            onChange={(e) => {
                              const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingExam({
                                ...editingExam,
                                questions: editingExam.questions.map(item => item.id === q.id ? { ...item, acceptableAnswers: list } : item),
                              });
                            }}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                          />
                        </div>
                      )}

                      {/* Explanation & Study Guide Reference */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <label className="block text-[11px] text-slate-500">Official Solution Explanation:</label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingExam({
                                ...editingExam,
                                questions: editingExam.questions.map(item => item.id === q.id ? { ...item, explanation: val } : item),
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500">PDF Guide Citation Section &amp; Page:</label>
                          <input
                            type="text"
                            value={q.guideReference?.sectionTitle || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingExam({
                                ...editingExam,
                                questions: editingExam.questions.map(item => item.id === q.id ? {
                                  ...item,
                                  guideReference: { ...(item.guideReference || { pageNumber: 1, quoteOrSummary: '' }), sectionTitle: val }
                                } : item),
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Save Bar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExamEdits}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUTHOR NEW EXAM */}
      {activeTab === 'create_exam' && (
        <form onSubmit={handleCreateNewExam} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">
              Create New Examination
            </h3>
            <p className="text-xs text-slate-500">
              Set title, duration time limit in minutes, attached PDF guide, and questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Exam Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Data Structures & Algorithm Optimization"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS-310"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Limit (Minutes) *</label>
              <input
                type="number"
                min={5}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pass Mark (%) *</label>
              <input
                type="number"
                min={10}
                max={100}
                value={passPercentage}
                onChange={(e) => setPassPercentage(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Attached PDF Guide */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Attach PDF Reference Guide
                </span>
                <span className="text-[11px] text-slate-500">
                  Upload an actual .pdf file or customize embedded study notes for split-screen reading.
                </span>
              </div>

              <label className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0">
                <Upload className="w-3.5 h-3.5 text-orange-600" />
                <span>{uploadedPdfUrl ? 'PDF Attached ✓' : 'Upload External PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Study Guide Content Chapters (Markdown):
              </label>
              <textarea
                rows={3}
                value={guideSectionsText}
                onChange={(e) => setGuideSectionsText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('gradebook')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Publish New Exam</span>
            </button>
          </div>
        </form>
      )}

      {/* INSPECT STUDENT ATTEMPT MODAL (Confidential Admin View) */}
      {inspectedAttempt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                  {inspectedAttempt.examCode}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {inspectedAttempt.examTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate: <strong>{inspectedAttempt.studentName}</strong> ({inspectedAttempt.studentNumber}) &bull; Auto-Graded Score: <strong className="text-emerald-700 font-bold">{inspectedAttempt.percentage}% ({inspectedAttempt.letterGrade})</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectedAttempt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions detail in attempt */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Itemized Question Response Log &amp; Evaluation
              </h4>
              {Object.values(inspectedAttempt.scores).map((score, i) => (
                <div 
                  key={score.questionId}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    score.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">Question {i + 1} ({score.category})</span>
                    <span className={score.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                      {score.earned} / {score.max} marks
                    </span>
                  </div>
                  <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-slate-500 block text-[10px] uppercase font-mono">Student&apos;s Answer:</strong>
                    <span>{String(score.userAnswer || '(Blank / Unanswered)')}</span>
                  </div>
                  <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-emerald-700 block text-[10px] uppercase font-mono">Expected Answer:</strong>
                    <span>{score.correctAnswerSummary}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] pt-1">
                    <strong>Auto-Marker Feedback:</strong> {score.feedback}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setInspectedAttempt(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
