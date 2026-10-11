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
  RotateCcw
} from 'lucide-react';
import { Exam, Question, QuestionType, PDFGuide, ExamAttempt, Student } from '../types';

interface TeacherTestManagerProps {
  exams: Exam[];
  attempts: ExamAttempt[];
  students: Student[];
  onSaveExam: (newExam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onResetData: () => void;
}

export const TeacherTestManager: React.FC<TeacherTestManagerProps> = ({
  exams,
  attempts,
  students,
  onSaveExam,
  onDeleteExam,
  onResetData,
}) => {
  const [activeView, setActiveView] = useState<'gradebook' | 'create_exam'>('gradebook');
  const [filterExamId, setFilterExamId] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Form state for creating a new exam
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Science & Technology');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [passPercentage, setPassPercentage] = useState(70);
  const [negativeMarking, setNegativeMarking] = useState(false);
  
  // PDF Guide state
  const [guideTitle, setGuideTitle] = useState('Course Study & Reference Guide');
  const [guideAuthor, setGuideAuthor] = useState('Faculty Curriculum Dept');
  const [guideFileName, setGuideFileName] = useState('Study_Guide_Official.pdf');
  const [guideSectionsText, setGuideSectionsText] = useState(
    `Chapter 1: Foundations & Core Principles\nThis chapter introduces the fundamental concepts, governing laws, and foundational theorems.\n\nChapter 2: Applied Analysis & Frameworks\nPractical applications, step-by-step methodologies, and problem-solving standards.`
  );
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);

  // Questions state for new exam
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'new_q_1',
      type: 'single_choice',
      questionText: 'What is the primary governing principle introduced in Chapter 1 of the study guide?',
      points: 20,
      category: 'Foundations',
      difficulty: 'Easy',
      explanation: 'See Chapter 1: Foundations in the attached guide.',
      guideReference: {
        sectionTitle: 'Chapter 1: Foundations & Core Principles',
        pageNumber: 1,
        quoteOrSummary: 'Introduces fundamental concepts and governing laws.',
      },
      options: [
        { id: 'opt_a', text: 'Conservation of mass & energy', isCorrect: true },
        { id: 'opt_b', text: 'Entropy maximization', isCorrect: false },
        { id: 'opt_c', text: 'Random variation', isCorrect: false },
      ],
    },
    {
      id: 'new_q_2',
      type: 'true_false',
      questionText: 'The core methodologies described in Chapter 2 apply only to theoretical problems.',
      points: 15,
      category: 'Applied Analysis',
      difficulty: 'Medium',
      explanation: 'False. The methodologies are designed for both theoretical and practical problem solving.',
      guideReference: {
        sectionTitle: 'Chapter 2: Applied Analysis & Frameworks',
        pageNumber: 2,
        quoteOrSummary: 'Practical applications and step-by-step methodologies.',
      },
      options: [
        { id: 'opt_tf_t', text: 'True', isCorrect: false },
        { id: 'opt_tf_f', text: 'False', isCorrect: true },
      ],
    },
    {
      id: 'new_q_3',
      type: 'fill_blank',
      questionText: 'Type the key terminology used to denote standard step-by-step protocols in applied analysis:',
      points: 20,
      category: 'Applied Analysis',
      difficulty: 'Medium',
      acceptableAnswers: ['methodology', 'framework', 'protocol'],
      explanation: 'See Section 2 for the framework terminology.',
      guideReference: {
        sectionTitle: 'Chapter 2: Applied Analysis & Frameworks',
        pageNumber: 2,
        quoteOrSummary: 'Frameworks and step-by-step methodologies.',
      },
    },
  ]);

  // Handle local PDF file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUploadedPdfUrl(fileUrl);
      setGuideFileName(file.name);
      setGuideTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newId = `q_${Date.now()}`;
    const baseQ: Question = {
      id: newId,
      type,
      questionText: `New ${type.replace('_', ' ')} question prompt...`,
      points: 10,
      category: 'General Principles',
      difficulty: 'Medium',
      explanation: 'Explanation with citation to the study guide.',
      guideReference: {
        sectionTitle: 'Chapter 1: Reference Material',
        pageNumber: 1,
        quoteOrSummary: 'Review standard textbook section.',
      },
    };

    if (type === 'single_choice' || type === 'multiple_choice') {
      baseQ.options = [
        { id: `${newId}_opt1`, text: 'Option A (Correct)', isCorrect: true },
        { id: `${newId}_opt2`, text: 'Option B', isCorrect: false },
        { id: `${newId}_opt3`, text: 'Option C', isCorrect: false },
      ];
    } else if (type === 'true_false') {
      baseQ.options = [
        { id: `${newId}_t`, text: 'True', isCorrect: true },
        { id: `${newId}_f`, text: 'False', isCorrect: false },
      ];
    } else if (type === 'fill_blank') {
      baseQ.acceptableAnswers = ['Correct Term'];
    } else if (type === 'short_answer') {
      baseQ.requiredKeywords = ['keyword1', 'keyword2'];
    }

    setQuestions([...questions, baseQ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveNewExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || questions.length === 0) {
      alert('Please provide exam title, code, and at least one question.');
      return;
    }

    // Split sections from text
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
        keyTerms: ['Core Standard', 'Key Concept'],
      };
    });

    const newGuide: PDFGuide = {
      id: `guide_${Date.now()}`,
      fileName: guideFileName,
      title: guideTitle,
      authorOrSource: guideAuthor,
      totalPages: Math.max(parsedSections.length, 3),
      description: `Official PDF study companion for ${title}`,
      sections: parsedSections.length > 0 ? parsedSections : [
        {
          id: 'sec_default',
          title: 'Reference Guide',
          pageNumber: 1,
          content: guideSectionsText,
        }
      ],
      fileUrl: uploadedPdfUrl || undefined,
      isCustomUpload: !!uploadedPdfUrl,
    };

    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      title: title.trim(),
      code: code.trim().toUpperCase(),
      category: category.trim(),
      description: description.trim() || `Comprehensive examination on ${title.trim()}`,
      durationMinutes: Number(durationMinutes) || 15,
      passPercentage: Number(passPercentage) || 70,
      negativeMarking,
      pdfGuide: newGuide,
      questions,
      instructions: [
        'Refer to the attached study guide during the test as needed.',
        'Submissions are scored automatically by the marking engine.',
        `Pass threshold is ${passPercentage}%.`,
      ],
    };

    onSaveExam(newExam);
    setActiveView('gradebook');
    // Reset inputs
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
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Instructor Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assessment Management &amp; Cohort Gradebook
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Monitor real-time student test submissions, auto-marked scores, or author new tests with attached PDF study guides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView(activeView === 'gradebook' ? 'create_exam' : 'gradebook')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform hover:scale-105"
          >
            {activeView === 'gradebook' ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Create New Exam</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                <span>View Cohort Gradebook</span>
              </>
            )}
          </button>

          <button
            onClick={onResetData}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
            title="Reset to default mock students, exams & attempts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: COHORT GRADEBOOK */}
      {activeView === 'gradebook' && (
        <div className="space-y-6">
          {/* Summary metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Active Exams</span>
              <span className="text-2xl font-black text-slate-900">{exams.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Total Submissions</span>
              <span className="text-2xl font-black text-slate-900">{totalCohortSubmissions}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Class Pass Rate</span>
              <span className="text-2xl font-black text-emerald-600">{cohortPassRate}%</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs block">Class Average</span>
              <span className="text-2xl font-black text-indigo-600">{cohortAvgScore}%</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-slate-600">Filter Exam:</span>
              <select
                value={filterExamId}
                onChange={(e) => setFilterExamId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Student Examination Results Ledger
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {filteredAttempts.length} Records Shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Exam Code</th>
                    <th className="py-3 px-4">Exam Title</th>
                    <th className="py-3 px-4">Submission Date</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{attempt.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{attempt.studentNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {attempt.examCode}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {attempt.examTitle}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(attempt.submittedAt).toLocaleDateString()} {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {attempt.percentage}% ({attempt.totalEarnedPoints}/{attempt.totalMaxPoints} pts)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700">
                          {attempt.letterGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          attempt.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredAttempts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No submissions matching current criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CREATE NEW EXAM WITH PDF STUDY GUIDE */}
      {activeView === 'create_exam' && (
        <form onSubmit={handleSaveNewExam} className="space-y-8">
          {/* Section 1: General Exam Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Settings className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Exam Basic Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Principles & Stereochemistry"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHEM-201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discipline Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time Limit (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pass Standard (%)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Course Description &amp; Scope</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide brief summary of the concepts assessed..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: PDF Reference Guide Attachment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Attached PDF Study Guide (Interactive Reader)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Available to students in split-screen during exam</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Study Guide Title</label>
                <input
                  type="text"
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author / Academic Source</label>
                <input
                  type="text"
                  value={guideAuthor}
                  onChange={(e) => setGuideAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Upload real PDF file or edit structured sections */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Upload External PDF File or Customize Embedded Text
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Upload an actual PDF file from your device, or use our rich embedded reader chapters below.
                  </span>
                </div>

                <label className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadedPdfUrl ? 'Replace PDF File' : 'Upload PDF File'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedPdfUrl && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="font-semibold">Attached PDF: {guideFileName}</span>
                  <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded">Ready</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference Guide Chapters &amp; Notes (Markdown / Text):
                </label>
                <textarea
                  rows={4}
                  value={guideSectionsText}
                  onChange={(e) => setGuideSectionsText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono"
                  placeholder="Chapter 1: Intro&#10;Key definitions...&#10;&#10;Chapter 2: Methods&#10;Techniques..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Questions Builder */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Examination Questions ({questions.length} Items &bull; {questions.reduce((s, q) => s + q.points, 0)} Total Points)
                </h3>
              </div>

              {/* Add question quick buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Add:</span>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('single_choice')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200"
                >
                  + MCQ (Single)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200"
                >
                  + Multiple Response
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('true_false')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200"
                >
                  + True/False
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('fill_blank')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200"
                >
                  + Fill in Blank
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('short_answer')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200"
                >
                  + Short Answer
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-[11px] uppercase bg-slate-200 px-2 py-0.5 rounded font-bold text-slate-700">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <span>Points:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={q.points}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQuestions(questions.map(item => item.id === q.id ? { ...item, points: val } : item));
                          }}
                          className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-800"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Question Prompt:
                    </label>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestions(questions.map(item => item.id === q.id ? { ...item, questionText: val } : item));
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  {/* Options editor based on type */}
                  {(q.type === 'single_choice' || q.type === 'multiple_choice' || q.type === 'true_false') && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Answer Options (Select correct ones):
                      </label>
                      {q.options?.map((opt, optIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type={q.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                            name={`correct_${q.id}`}
                            checked={opt.isCorrect}
                            onChange={() => {
                              const updated = q.options?.map(o => {
                                if (q.type === 'multiple_choice') {
                                  return o.id === opt.id ? { ...o, isCorrect: !o.isCorrect } : o;
                                }
                                return { ...o, isCorrect: o.id === opt.id };
                              });
                              setQuestions(questions.map(item => item.id === q.id ? { ...item, options: updated } : item));
                            }}
                            className="cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = q.options?.map(o => o.id === opt.id ? { ...o, text: val } : o);
                              setQuestions(questions.map(item => item.id === q.id ? { ...item, options: updated } : item));
                            }}
                            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'fill_blank' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Acceptable Answer Variations (comma separated):
                      </label>
                      <input
                        type="text"
                        value={(q.acceptableAnswers || []).join(', ')}
                        onChange={(e) => {
                          const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setQuestions(questions.map(item => item.id === q.id ? { ...item, acceptableAnswers: list } : item));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                        placeholder="Mitosis, karyokinesis"
                      />
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Required Rubric Keywords (comma separated for auto-scoring):
                      </label>
                      <input
                        type="text"
                        value={(q.requiredKeywords || []).join(', ')}
                        onChange={(e) => {
                          const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setQuestions(questions.map(item => item.id === q.id ? { ...item, requiredKeywords: list } : item));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                        placeholder="energy, atp, mitochondria"
                      />
                    </div>
                  )}

                  {/* Guide Reference Citation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-500">Study Guide Section Citation:</label>
                      <input
                        type="text"
                        value={q.guideReference?.sectionTitle || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions(questions.map(item => item.id === q.id ? {
                            ...item,
                            guideReference: { ...(item.guideReference || { pageNumber: 1, quoteOrSummary: '' }), sectionTitle: val }
                          } : item));
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                        placeholder="Chapter 1: Principles"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500">Page Number:</label>
                      <input
                        type="number"
                        min={1}
                        value={q.guideReference?.pageNumber || 1}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setQuestions(questions.map(item => item.id === q.id ? {
                            ...item,
                            guideReference: { ...(item.guideReference || { sectionTitle: '', quoteOrSummary: '' }), pageNumber: val }
                          } : item));
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveView('gradebook')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Publish Exam</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
