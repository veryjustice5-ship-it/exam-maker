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
  ArrowRight,
  Filter,
  CheckSquare,
  FileCheck,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Exam, Question, QuestionType, PDFGuide, ExamAttempt, Student, AdminUser } from '../types';
import { ELGILogo } from './ELGILogo';
import { formatTime, calculateGrade } from '../utils/grading';

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
  onUpdateAttempt?: (updatedAttempt: ExamAttempt) => void;
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
  onUpdateAttempt,
}) => {
  const [activeTab, setActiveTab] = useState<'gradebook' | 'manage_exams' | 'create_exam'>('gradebook');
  const [filterExamId, setFilterExamId] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Editing existing exam state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string>('');
  const [editingQuestionsFilter, setEditingQuestionsFilter] = useState<'all' | 'objective' | 'subjective'>('all');

  // Form state for creating a new exam
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Theoretical & Applied Sciences');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passPercentage, setPassPercentage] = useState(70);
  const [negativeMarking, setNegativeMarking] = useState(false);
  
  // PDF Guide state
  const [guideTitle, setGuideTitle] = useState('ELGI Academic Syllabus & Reference Guide');
  const [guideAuthor, setGuideAuthor] = useState('ELGI Curriculum & Examinations Board');
  const [guideFileName, setGuideFileName] = useState('ELGI_Study_Guide_Official.pdf');
  const [guideSectionsText, setGuideSectionsText] = useState(
    `Chapter 1: Foundational Theory & Principles\nKey theoretical models, core laws, definitions, and mathematical frameworks.\n\nChapter 2: Methods & Analytical Derivations\nAnalytical problem solving steps, formulas, derivations, and systematic evaluation protocols.`
  );
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);

  // New exam questions builder state
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    {
      id: 'q_new_1',
      type: 'single_choice',
      questionText: 'What is the primary governing principle introduced in Chapter 1 of the ELGI study guide?',
      points: 15,
      category: 'Foundations',
      difficulty: 'Easy',
      explanation: 'See Chapter 1 in the study guide.',
      guideReference: {
        sectionTitle: 'Chapter 1: Foundational Theory & Principles',
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
      type: 'essay_theory',
      questionText: 'THEORY QUESTION (ESSAY DERIVATION): Formulate a comprehensive theoretical discussion analyzing how foundational principles in Chapter 1 govern dynamic system equilibria. Detail: (1) Core definitions; (2) Governing mathematical or physical processes; and (3) Inherent thermodynamic or analytical limitations.',
      points: 35,
      category: 'Theoretical Foundations',
      difficulty: 'Hard',
      minWords: 45,
      requiredKeywords: ['equilibrium', 'conservation', 'process', 'derivation', 'limitation', 'theory'],
      modelAnswer: 'Systems maintain dynamic equilibrium when opposing process fluxes balance. According to governing conservation laws, mass and energy cannot be created or destroyed, constraining steady-state configurations. When perturbations occur, systems dissipate gradients toward thermodynamic stability, bounded by entropy production.',
      explanation: 'Evaluates thorough theoretical essay comprehension and analytical synthesis.',
      rubricCriteria: [
        { id: 'crit_1_default', title: 'Conceptual Definition & Scope', points: 15, keywords: ['equilibrium', 'conservation', 'theory'], description: 'Articulates core laws and theoretical scope.' },
        { id: 'crit_2_default', title: 'Derivation & Dynamic Equilibrium Flux', points: 20, keywords: ['flux', 'derivation', 'process', 'limitation'], description: 'Explains governing processes and thermodynamic limitations.' },
      ],
      guideReference: {
        sectionTitle: 'Chapter 1: Foundational Theory & Principles',
        pageNumber: 1,
        quoteOrSummary: 'Key theoretical models, core laws, definitions, and mathematical frameworks.',
      },
    },
  ]);

  // Selected attempt for inspection modal (Confidential Faculty View)
  const [inspectedAttempt, setInspectedAttempt] = useState<ExamAttempt | null>(null);
  const [manualScores, setManualScores] = useState<Record<string, number>>({});
  const [manualRemarks, setManualRemarks] = useState<Record<string, string>>({});
  const [inspectorSaveMsg, setInspectorSaveMsg] = useState<string>('');

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
    const newQ: Question = createTemplateQuestion(type, newId);

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

  const handleMoveQuestionInEditingExam = (index: number, direction: 'up' | 'down') => {
    if (!editingExam) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editingExam.questions.length) return;
    const updated = [...editingExam.questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setEditingExam({ ...editingExam, questions: updated });
  };

  // Create Template Question helper
  function createTemplateQuestion(type: QuestionType, id: string): Question {
    const base: Question = {
      id,
      type,
      questionText: '',
      points: 15,
      category: 'General Theory',
      difficulty: 'Medium',
      explanation: 'Refer to the relevant section in the ELGI study guide.',
      guideReference: {
        sectionTitle: 'Chapter 1: Foundational Theory',
        pageNumber: 1,
        quoteOrSummary: 'Review relevant section in the guide.',
      },
    };

    if (type === 'single_choice' || type === 'multiple_choice') {
      base.points = 15;
      base.questionText = 'Select the correct statement regarding...';
      base.options = [
        { id: `${id}_1`, text: 'Option A (Correct Answer)', isCorrect: true },
        { id: `${id}_2`, text: 'Option B', isCorrect: false },
        { id: `${id}_3`, text: 'Option C', isCorrect: false },
        { id: `${id}_4`, text: 'Option D', isCorrect: false },
      ];
    } else if (type === 'true_false') {
      base.points = 10;
      base.questionText = 'True or False: Under standard conditions...';
      base.options = [
        { id: `${id}_t`, text: 'True', isCorrect: true },
        { id: `${id}_f`, text: 'False', isCorrect: false },
      ];
    } else if (type === 'fill_blank') {
      base.points = 15;
      base.questionText = 'Type the exact technical term that defines...';
      base.acceptableAnswers = ['Key Term'];
    } else if (type === 'short_answer') {
      base.points = 20;
      base.questionText = 'Briefly state and explain the significance of...';
      base.requiredKeywords = ['concept', 'principle', 'law'];
      base.acceptableAnswers = ['Brief explanation covering core concepts.'];
    } else if (type === 'essay_theory' || type === 'case_study') {
      base.points = 30;
      base.minWords = 45;
      base.questionText = type === 'essay_theory' 
        ? 'SECTION B (THEORY QUESTION): Formulate a rigorous theoretical discussion explaining... Detail: (1) Foundational definitions; (2) Governing mechanisms; and (3) Critical analytical evaluation.'
        : 'SECTION B (THEORETICAL CASE STUDY): An experimental system demonstrates anomalous behavior under non-equilibrium conditions. Formulate a theoretical diagnostic analysis detailing: (1) Observed symptoms; (2) Governing theoretical laws; and (3) Proposed architectural or experimental remediation.';
      base.modelAnswer = 'Comprehensive model theoretical solution detailing theoretical foundations, derivations, and practical applications according to syllabus standards.';
      base.requiredKeywords = ['mechanism', 'principle', 'derivation', 'theory', 'equilibrium'];
      base.rubricCriteria = [
        { id: `r1_${id}`, title: 'Criterion 1: Theoretical Definition & Conceptual Scope', points: 15, keywords: ['definition', 'principle', 'foundation'], description: 'Evaluates thoroughness of conceptual definition and scope.' },
        { id: `r2_${id}`, title: 'Criterion 2: Governing Mechanism & Step-by-Step Derivation', points: 15, keywords: ['mechanism', 'process', 'derivation'], description: 'Evaluates detailed step-by-step analytical derivation.' },
      ];
    }
    return base;
  }

  // Add question to new exam
  const handleAddQuestionToNewExam = (type: QuestionType) => {
    const newId = `q_new_${Date.now()}`;
    const newQ = createTemplateQuestion(type, newId);
    setNewQuestions(prev => [...prev, newQ]);
  };

  const handleDeleteQuestionFromNewExam = (id: string) => {
    setNewQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleLoadStandardTemplate = () => {
    setNewQuestions([
      {
        id: `q_tpl_1_${Date.now()}`,
        type: 'single_choice',
        questionText: 'SECTION A (OBJECTIVE): What is the fundamental conservation law governing closed thermodynamic systems?',
        points: 15,
        category: 'Thermodynamics',
        difficulty: 'Easy',
        explanation: 'Energy cannot be created or destroyed in an isolated system.',
        options: [
          { id: 'opt_1', text: 'First Law of Thermodynamics (Conservation of Energy)', isCorrect: true },
          { id: 'opt_2', text: 'Third Law of Thermodynamics (Absolute Zero Entropy)', isCorrect: false },
          { id: 'opt_3', text: 'Newton Third Law (Equal and Opposite Action)', isCorrect: false },
        ],
      },
      {
        id: `q_tpl_2_${Date.now()}`,
        type: 'true_false',
        questionText: 'SECTION A (OBJECTIVE): In open systems, total internal entropy can decrease if entropy export exceeds internal production.',
        points: 10,
        category: 'Thermodynamics',
        difficulty: 'Medium',
        explanation: 'True. Under Prigogine non-equilibrium thermodynamics, dS = d_e S + d_i S, so negative boundary flux can maintain ordered macrostates.',
        options: [
          { id: 'opt_tf_t', text: 'True', isCorrect: true },
          { id: 'opt_tf_f', text: 'False', isCorrect: false },
        ],
      },
      {
        id: `q_tpl_3_${Date.now()}`,
        type: 'fill_blank',
        questionText: 'SECTION A (OBJECTIVE): Name the microscopic multiplicity term (Omega) in Ludwig Boltzmann entropy formula S = k_B * ln(Omega):',
        points: 15,
        category: 'Statistical Mechanics',
        difficulty: 'Medium',
        acceptableAnswers: ['Multiplicity', 'Microstate Multiplicity', 'Microstates', 'Thermodynamic Probability'],
        explanation: 'Omega represents thermodynamic multiplicity—the count of microstates corresponding to the macrostate.',
      },
      {
        id: `q_tpl_4_${Date.now()}`,
        type: 'essay_theory',
        questionText: 'SECTION B (THEORY QUESTION): Formulate a rigorous theoretical discussion explaining how non-equilibrium dissipative structures self-organize without violating the Second Law of Thermodynamics. Detail: (1) Total entropy decomposition differential dS = d_e S + d_i S; (2) The non-negativity constraint on internal production d_i S >= 0; and (3) Physical manifestations such as Benard convection or living metabolic systems.',
        points: 30,
        category: 'Non-Equilibrium Thermodynamics',
        difficulty: 'Hard',
        minWords: 50,
        requiredKeywords: ['prigogine', 'dissipative', 'entropy', 'open system', 'equilibrium', 'flux', 'second law'],
        modelAnswer: 'Open systems exchange energy and matter with their surroundings. The total entropy differential dS decomposes into internal entropy production (d_i S >= 0) and external boundary exchange (d_e S). While the Second Law mandates that internal entropy production cannot be negative, total system entropy can stay low if negative entropy is imported (d_e S < -d_i S) by continuously exhausting high-entropy heat and waste into the surroundings.',
        explanation: 'Thermodynamic proof demonstrating mathematical consistency between dissipative self-organization and the Second Law.',
        rubricCriteria: [
          { id: 'crit_t1', title: 'Entropy Differential Formulation (dS = d_e S + d_i S)', points: 10, keywords: ['entropy', 'differential', 'production', 'flux'], description: 'Formulates mathematical split into internal production and external boundary flux.' },
          { id: 'crit_t2', title: 'Second Law Compliance & Dissipation Flux', points: 10, keywords: ['second law', 'negative entropy', 'waste', 'heat'], description: 'Demonstrates compliance with non-negative internal production.' },
          { id: 'crit_t3', title: 'Physical Self-Organization in Living/Physical Systems', points: 10, keywords: ['dissipative', 'self-organization', 'structure', 'benard'], description: 'Applies proof to physical macroscopic phenomena.' },
        ],
      },
      {
        id: `q_tpl_5_${Date.now()}`,
        type: 'case_study',
        questionText: 'SECTION B (THEORETICAL CASE STUDY): An analytical engineering prototype encounters unexpected turbulence and instability during phase-change thermal transfer. Formulate a theoretical case study identifying: (1) Potential thermodynamic causes; (2) Mathematical governing equations; and (3) A systematic remediation methodology.',
        points: 30,
        category: 'Applied Engineering Theory',
        difficulty: 'Hard',
        minWords: 45,
        requiredKeywords: ['turbulence', 'instability', 'boundary layer', 'transfer', 'reynolds', 'remediation'],
        modelAnswer: 'Thermal transfer instability arises when the Rayleigh or Reynolds number exceeds critical thresholds, transitioning laminar boundary flow into turbulent eddies. Governing Navier-Stokes and heat diffusion equations demonstrate non-linear velocity gradient divergence. Remediation involves augmenting surface micro-geometry to stabilize the boundary layer and optimizing flow velocities.',
        explanation: 'Theoretical case study evaluating convective instability and boundary flow modeling.',
        rubricCriteria: [
          { id: 'crit_cs1', title: 'Instability Diagnostic & Dimensionless Numbers', points: 15, keywords: ['rayleigh', 'reynolds', 'turbulence', 'instability'], description: 'Identifies non-dimensional numbers and boundary transition.' },
          { id: 'crit_cs2', title: 'Remediation Architecture & Flow Optimization', points: 15, keywords: ['remediation', 'velocity', 'boundary layer', 'optimization'], description: 'Formulates actionable mathematical and architectural solution.' },
        ],
      },
    ]);
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
      durationMinutes: Number(durationMinutes) || 30,
      passPercentage: Number(passPercentage) || 70,
      negativeMarking,
      pdfGuide: newGuide,
      questions: newQuestions,
      instructions: [
        'Refer to the attached study guide during the test as needed using the split drawer.',
        'Objective questions are marked instantly; Subjective Theory essays are evaluated against academic rubrics.',
        'Official results are reviewed exclusively by Academic Administration.',
      ],
    };

    onSaveExam(newExam);
    setActiveTab('gradebook');
  };

  // Open inspector modal for attempt
  const openInspector = (attempt: ExamAttempt) => {
    setInspectedAttempt(JSON.parse(JSON.stringify(attempt)));
    const initialScores: Record<string, number> = {};
    const initialRemarks: Record<string, string> = {};
    Object.entries(attempt.scores).forEach(([qId, s]) => {
      initialScores[qId] = s.earned;
      if (s.examinerRemarks) {
        initialRemarks[qId] = s.examinerRemarks;
      }
    });
    setManualScores(initialScores);
    setManualRemarks(initialRemarks);
    setInspectorSaveMsg('');
  };

  // Save manual score override in Inspector
  const handleSaveInspectorOverrides = () => {
    if (!inspectedAttempt) return;

    let totalEarned = 0;
    const updatedScores = { ...inspectedAttempt.scores };

    Object.entries(updatedScores).forEach(([qId, s]) => {
      const overrideEarned = manualScores[qId] !== undefined ? manualScores[qId] : s.earned;
      const remarks = manualRemarks[qId] || s.examinerRemarks;

      updatedScores[qId] = {
        ...s,
        earned: overrideEarned,
        manualScoreOverride: overrideEarned,
        examinerRemarks: remarks,
        isCorrect: overrideEarned >= s.max * 0.85,
        partialCredit: overrideEarned > 0 && overrideEarned < s.max,
      };
      totalEarned += overrideEarned;
    });

    const newPercentage = Math.round((totalEarned / inspectedAttempt.totalMaxPoints) * 100);
    const newPassed = newPercentage >= inspectedAttempt.passPercentage;
    const newGrade = calculateGrade(newPercentage);

    const updatedAttempt: ExamAttempt = {
      ...inspectedAttempt,
      scores: updatedScores,
      totalEarnedPoints: Math.round(totalEarned * 10) / 10,
      percentage: newPercentage,
      passed: newPassed,
      letterGrade: newGrade,
    };

    setInspectedAttempt(updatedAttempt);
    if (onUpdateAttempt) {
      onUpdateAttempt(updatedAttempt);
    }
    setInspectorSaveMsg('Examiner Grade & Remarks Saved Successfully! Candidate final grade updated.');
    setTimeout(() => setInspectorSaveMsg(''), 4000);
  };

  // Filtered attempts for gradebook table
  const filteredAttempts = attempts.filter((att) => {
    const matchesExam = filterExamId === 'all' || att.examId === filterExamId;
    const matchesSearch = 
      att.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      att.studentNumber.toLowerCase().includes(searchStudent.toLowerCase()) ||
      att.examCode.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner with ELGI Branding & Admin Status */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <ELGILogo variant="icon" className="w-14 h-14 shrink-0" inverted />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-orange-400 font-mono">
                  EXAMINATIONS &amp; ASSESSMENT ADMINISTRATION
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono font-bold">
                  CLEARANCE LEVEL 1
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                ELGI Admin Portal &amp; Test Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Set objective and subjective theory questions with marking rubrics, configure strict exam time limits, and review student auto-evaluations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('gradebook')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'gradebook'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Student Gradebook ({attempts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('manage_exams')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'manage_exams'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Manage Questions &amp; Time ({exams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('create_exam')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'create_exam'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Author New Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: COHORT GRADEBOOK & CANDIDATE AUTO-EVALUATIONS */}
      {activeTab === 'gradebook' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Student Cohort Gradebook &amp; Submissions
                </h3>
                <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                  Confidential Faculty Access
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Review automated test scoring, inspect student essays and theory answers, and override scores with examiner remarks.
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Search candidate name or ID..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 w-48 sm:w-60"
              />

              <select
                value={filterExamId}
                onChange={(e) => setFilterExamId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Examinations</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.code} - {e.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">Examination</th>
                  <th className="pb-3 font-semibold">Time Elapsed</th>
                  <th className="pb-3 font-semibold">Auto-Grade</th>
                  <th className="pb-3 font-semibold">Theory Items</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((attempt) => {
                  const theoryCount = Object.values(attempt.scores).filter(s => s.isSubjective || (s.wordCount && s.wordCount > 0)).length;

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-slate-900">{attempt.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{attempt.studentNumber}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-slate-800">{attempt.examTitle}</div>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                          {attempt.examCode}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 font-mono text-[11px]">
                        {formatTime(attempt.durationSeconds)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-900">{attempt.percentage}%</span>
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {attempt.letterGrade}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {attempt.totalEarnedPoints} / {attempt.totalMaxPoints} pts
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        {theoryCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                            <BookOpen className="w-3 h-3 text-amber-600" />
                            <span>{theoryCount} Theory item{theoryCount > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Objective Only</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          attempt.passed 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {attempt.passed ? 'PASSED' : 'BELOW STANDARD'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => openInspector(attempt)}
                          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect &amp; Grade</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredAttempts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No candidate submissions found matching current search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE EXAMS, QUESTIONS & TIME LIMITS */}
      {activeTab === 'manage_exams' && (
        <div className="space-y-6">
          {/* Exam Selector Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Select Examination to Edit Questions &amp; Time
                </h3>
                <p className="text-xs text-slate-500">
                  Configure question banks, add theoretical essay questions with rubrics, and change time limits.
                </p>
              </div>

              {editSuccessMsg && (
                <div className="p-2 px-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold animate-fadeIn">
                  {editSuccessMsg}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {exams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => startEditingExam(exam)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    editingExam?.id === exam.id
                      ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-400/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-orange-700 border border-orange-200">
                      {exam.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-600" />
                      {exam.durationMinutes}m limit
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-2 truncate">
                    {exam.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>{exam.questions.length} questions</span>
                    <span className="text-orange-700 font-semibold">{exam.passPercentage}% to pass</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Editing Workspace */}
          {editingExam && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                      EDITING: {editingExam.code}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {editingExam.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage parameters, time allowance, objective items, and subjective theory marking schemes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveExamEdits}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-600/30"
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
                  <span>Exam Parameters &amp; Time Limit Settings</span>
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

              {/* Questions Management Toolbar */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>Questions in this Examination</span>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {editingExam.questions.length} Items &bull; {editingExam.questions.reduce((s, q) => s + q.points, 0)} Total Marks
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add, reorder, or edit questions. Set theory essay prompts with NLP marking rubrics and model answers.
                    </p>
                  </div>

                  {/* Filter Group: All, Objective, Subjective */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setEditingQuestionsFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        editingQuestionsFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({editingExam.questions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingQuestionsFilter('subjective')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        editingQuestionsFilter === 'subjective'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-amber-700 hover:bg-amber-100/50'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Theory ({editingExam.questions.filter(q => q.type === 'essay_theory' || q.type === 'case_study').length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingQuestionsFilter('objective')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        editingQuestionsFilter === 'objective'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Objective ({editingExam.questions.filter(q => q.type !== 'essay_theory' && q.type !== 'case_study').length})
                    </button>
                  </div>
                </div>

                {/* Prominent Action Bar to Add Different Question Types */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Theory Types Group */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 uppercase tracking-wide text-[11px] flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                      Subjective Theory:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('essay_theory')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-600/30 flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Theory / Essay (Subjective)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('case_study')}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Case Study Analysis</span>
                    </button>
                  </div>

                  {/* Objective Types Group */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-600 uppercase tracking-wide text-[11px]">
                      Objective:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('single_choice')}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300"
                    >
                      + MCQ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('true_false')}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300"
                    >
                      + True/False
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('fill_blank')}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300"
                    >
                      + Fill Blank
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToEditingExam('short_answer')}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300"
                    >
                      + Short Answer
                    </button>
                  </div>
                </div>

                {/* Question Cards List */}
                <div className="space-y-4">
                  {editingExam.questions
                    .map((q, originalIdx) => ({ q, originalIdx }))
                    .filter(({ q }) => {
                      if (editingQuestionsFilter === 'subjective') return q.type === 'essay_theory' || q.type === 'case_study';
                      if (editingQuestionsFilter === 'objective') return q.type !== 'essay_theory' && q.type !== 'case_study';
                      return true;
                    })
                    .map(({ q, originalIdx }) => {
                      const isSubjective = q.type === 'essay_theory' || q.type === 'case_study';

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-3xl border transition-all space-y-3.5 ${
                            isSubjective 
                              ? 'border-amber-300 bg-amber-50/30 shadow-xs' 
                              : 'border-slate-200 bg-slate-50/60'
                          }`}
                        >
                          {/* Question Card Top Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                                isSubjective ? 'bg-amber-600' : 'bg-slate-800'
                              }`}>
                                {originalIdx + 1}
                              </span>

                              {/* Question Type Tag */}
                              <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${
                                isSubjective
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-slate-200 text-slate-700 border-slate-300'
                              }`}>
                                {isSubjective ? 'SUBJECTIVE THEORY' : 'OBJECTIVE'} &bull; {q.type.replace('_', ' ')}
                              </span>

                              {/* Change Question Type Selector */}
                              <select
                                value={q.type}
                                onChange={(e) => {
                                  const newType = e.target.value as QuestionType;
                                  const templated = createTemplateQuestion(newType, q.id);
                                  setEditingExam({
                                    ...editingExam,
                                    questions: editingExam.questions.map(item => item.id === q.id ? {
                                      ...templated,
                                      questionText: q.questionText || templated.questionText,
                                      category: q.category,
                                      points: q.points || templated.points,
                                    } : item),
                                  });
                                }}
                                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                              >
                                <option value="essay_theory">Theory / Essay (Subjective)</option>
                                <option value="case_study">Case Study Analysis (Subjective)</option>
                                <option value="single_choice">Single Choice MCQ</option>
                                <option value="multiple_choice">Multiple Choice (Multi-Select)</option>
                                <option value="true_false">True / False</option>
                                <option value="fill_blank">Fill in the Blank</option>
                                <option value="short_answer">Short Answer</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Points Input */}
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
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
                                  className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900"
                                />
                              </div>

                              {/* Reorder Up / Down */}
                              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                                <button
                                  type="button"
                                  disabled={originalIdx === 0}
                                  onClick={() => handleMoveQuestionInEditingExam(originalIdx, 'up')}
                                  className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={originalIdx === editingExam.questions.length - 1}
                                  onClick={() => handleMoveQuestionInEditingExam(originalIdx, 'down')}
                                  className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 border-l border-slate-200"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestionFromEditingExam(q.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Question Prompt Text */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Question Prompt / Problem Statement:
                            </label>
                            <textarea
                              rows={3}
                              value={q.questionText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingExam({
                                  ...editingExam,
                                  questions: editingExam.questions.map(item => item.id === q.id ? { ...item, questionText: val } : item),
                                });
                              }}
                              placeholder={isSubjective ? 'Formulate the theoretical essay question, specifying derivations, principles, and expected analytical depth...' : 'Enter question statement...'}
                              className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 leading-relaxed font-sans"
                            />
                          </div>

                          {/* Options editing for Objective Questions */}
                          {(q.type === 'single_choice' || q.type === 'multiple_choice' || q.type === 'true_false') && (
                            <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Fill in blank answer */}
                          {q.type === 'fill_blank' && (
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                              />
                            </div>
                          )}

                          {/* Short Answer keywords */}
                          {q.type === 'short_answer' && (
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Required Essential Keywords (comma separated for auto-marking):
                              </label>
                              <input
                                type="text"
                                value={(q.requiredKeywords || []).join(', ')}
                                onChange={(e) => {
                                  const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  setEditingExam({
                                    ...editingExam,
                                    questions: editingExam.questions.map(item => item.id === q.id ? { ...item, requiredKeywords: list } : item),
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                                placeholder="principle, formula, derivation"
                              />
                            </div>
                          )}

                          {/* Theory / Essay & Case Study Subjective Rubric Configurator */}
                          {isSubjective && (
                            <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-amber-300">
                              <div className="flex items-center justify-between text-xs font-bold text-amber-950 pb-2 border-b border-amber-200">
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="w-4 h-4 text-orange-600" />
                                  <span>Subjective Theory Configuration &amp; Auto-Marking Rubric</span>
                                </span>
                                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Evaluated via NLP Rubric Engine
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Minimum Expected Word Count:
                                  </label>
                                  <input
                                    type="number"
                                    min={10}
                                    max={500}
                                    value={q.minWords || 45}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setEditingExam({
                                        ...editingExam,
                                        questions: editingExam.questions.map(item => item.id === q.id ? { ...item, minWords: val } : item),
                                      });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                                  />
                                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                                    Students will see a live word counter and progress bar.
                                  </span>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Core Theoretical Keywords (comma separated):
                                  </label>
                                  <input
                                    type="text"
                                    value={(q.requiredKeywords || []).join(', ')}
                                    onChange={(e) => {
                                      const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                      setEditingExam({
                                        ...editingExam,
                                        questions: editingExam.questions.map(item => item.id === q.id ? { ...item, requiredKeywords: list } : item),
                                      });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900"
                                    placeholder="mechanism, derivation, principles, flux"
                                  />
                                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                                    Key concepts required for awarding marks.
                                  </span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Model Theoretical Answer (Official Marking Scheme / Solution):
                                </label>
                                <textarea
                                  rows={3}
                                  value={q.modelAnswer || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingExam({
                                      ...editingExam,
                                      questions: editingExam.questions.map(item => item.id === q.id ? { ...item, modelAnswer: val } : item),
                                    });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-sans text-slate-900"
                                  placeholder="Type the model essay solution covering all expected theoretical arguments and mathematical proofs..."
                                />
                              </div>

                              {/* Rubric Criteria List */}
                              <div className="space-y-2 pt-1 border-t border-amber-200">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-orange-600" />
                                    <span>Detailed Rubric Breakdown:</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const curCriteria = q.rubricCriteria || [];
                                      const newCrit = {
                                        id: `crit_${Date.now()}`,
                                        title: `Criterion ${curCriteria.length + 1}: Core Theoretical Concept`,
                                        points: 10,
                                        keywords: ['principle', 'concept'],
                                        description: 'Description of expected theoretical discussion.',
                                      };
                                      setEditingExam({
                                        ...editingExam,
                                        questions: editingExam.questions.map(item => item.id === q.id ? {
                                          ...item,
                                          rubricCriteria: [...curCriteria, newCrit],
                                        } : item),
                                      });
                                    }}
                                    className="text-orange-700 hover:text-orange-900 font-bold underline cursor-pointer text-xs"
                                  >
                                    + Add Rubric Criterion
                                  </button>
                                </div>

                                {q.rubricCriteria?.map((crit, cIdx) => (
                                  <div key={crit.id || cIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                    <div className="sm:col-span-5">
                                      <input
                                        type="text"
                                        value={crit.title}
                                        placeholder="Criterion Title (e.g. Theoretical Derivation)"
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updated = (q.rubricCriteria || []).map((c, i) => i === cIdx ? { ...c, title: val } : c);
                                          setEditingExam({
                                            ...editingExam,
                                            questions: editingExam.questions.map(item => item.id === q.id ? { ...item, rubricCriteria: updated } : item),
                                          });
                                        }}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900"
                                      />
                                    </div>
                                    <div className="sm:col-span-2">
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min={1}
                                          value={crit.points}
                                          onChange={(e) => {
                                            const val = Number(e.target.value);
                                            const updated = (q.rubricCriteria || []).map((c, i) => i === cIdx ? { ...c, points: val } : c);
                                            setEditingExam({
                                              ...editingExam,
                                              questions: editingExam.questions.map(item => item.id === q.id ? { ...item, rubricCriteria: updated } : item),
                                            });
                                          }}
                                          className="w-12 bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-xs text-center font-bold text-slate-900"
                                        />
                                        <span className="text-[10px] text-slate-500 font-semibold">pts</span>
                                      </div>
                                    </div>
                                    <div className="sm:col-span-4">
                                      <input
                                        type="text"
                                        value={crit.keywords.join(', ')}
                                        placeholder="Keywords (comma separated)"
                                        onChange={(e) => {
                                          const kws = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                          const updated = (q.rubricCriteria || []).map((c, i) => i === cIdx ? { ...c, keywords: kws } : c);
                                          setEditingExam({
                                            ...editingExam,
                                            questions: editingExam.questions.map(item => item.id === q.id ? { ...item, rubricCriteria: updated } : item),
                                          });
                                        }}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                                      />
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = (q.rubricCriteria || []).filter((_, i) => i !== cIdx);
                                          setEditingExam({
                                            ...editingExam,
                                            questions: editingExam.questions.map(item => item.id === q.id ? { ...item, rubricCriteria: updated } : item),
                                          });
                                        }}
                                        className="text-rose-500 hover:text-rose-700 text-sm font-bold cursor-pointer"
                                        title="Delete Criterion"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Explanation & Study Guide Reference */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Solution Explanation:</label>
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
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">PDF Guide Citation Section &amp; Page:</label>
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
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

      {/* TAB 3: AUTHOR NEW EXAM WITH QUESTIONS & THEORY ITEMS BUILDER */}
      {activeTab === 'create_exam' && (
        <form onSubmit={handleCreateNewExam} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Create New Examination
              </h3>
              <p className="text-xs text-slate-500">
                Set course code, title, duration time limit in minutes, attached PDF guide, and author both objective and subjective theory questions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadStandardTemplate}
              className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold text-xs border border-orange-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Load Template (Objective + Subjective Theory)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Exam Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Systems Theory & Analytical Dynamics"
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
                placeholder="e.g. ELGI-TH-502"
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
              <span className="text-[10px] text-slate-400 mt-0.5 block">Timer will countdown during exam.</span>
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
                  Upload an actual .pdf file or customize embedded syllabus notes for split-screen reading.
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

          {/* Question Builder in Create Exam Form */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span>Questions in this Examination</span>
                  <span className="font-mono text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">
                    {newQuestions.length} Questions &bull; {newQuestions.reduce((s, q) => s + q.points, 0)} Total Marks
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  Add multiple-choice objective items as well as subjective theory / essay problems with marking rubrics.
                </p>
              </div>

              {/* Add buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleAddQuestionToNewExam('essay_theory')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-600/30 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Theory / Essay (Subjective)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestionToNewExam('case_study')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300"
                >
                  + Case Study
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestionToNewExam('single_choice')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300"
                >
                  + MCQ
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestionToNewExam('true_false')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300"
                >
                  + True/False
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestionToNewExam('fill_blank')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300"
                >
                  + Fill Blank
                </button>
              </div>
            </div>

            {/* List of questions for new exam */}
            <div className="space-y-4">
              {newQuestions.map((q, idx) => {
                const isSubjective = q.type === 'essay_theory' || q.type === 'case_study';

                return (
                  <div
                    key={q.id}
                    className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                      isSubjective ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-white ${
                          isSubjective ? 'bg-amber-600' : 'bg-slate-800'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${
                          isSubjective ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}>
                          {isSubjective ? 'SUBJECTIVE THEORY' : 'OBJECTIVE'} &bull; {q.type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-semibold text-slate-600">Marks:</span>
                          <input
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setNewQuestions(prev => prev.map(item => item.id === q.id ? { ...item, points: val } : item));
                            }}
                            className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestionFromNewExam(q.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Question Prompt:
                      </label>
                      <textarea
                        rows={2}
                        value={q.questionText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewQuestions(prev => prev.map(item => item.id === q.id ? { ...item, questionText: val } : item));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-sans"
                        placeholder="Type question prompt..."
                      />
                    </div>

                    {/* Quick Rubric / Answer for Subjective */}
                    {isSubjective && (
                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                              Minimum Words:
                            </label>
                            <input
                              type="number"
                              value={q.minWords || 40}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setNewQuestions(prev => prev.map(item => item.id === q.id ? { ...item, minWords: val } : item));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                              Theoretical Keywords:
                            </label>
                            <input
                              type="text"
                              value={(q.requiredKeywords || []).join(', ')}
                              onChange={(e) => {
                                const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                setNewQuestions(prev => prev.map(item => item.id === q.id ? { ...item, requiredKeywords: list } : item));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Model Answer / Marking Scheme:
                          </label>
                          <textarea
                            rows={2}
                            value={q.modelAnswer || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewQuestions(prev => prev.map(item => item.id === q.id ? { ...item, modelAnswer: val } : item));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                            placeholder="Expected theoretical solution..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
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

      {/* INSPECT STUDENT ATTEMPT MODAL (Confidential Faculty & Examiner View) */}
      {inspectedAttempt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto text-slate-900 border border-slate-200">
            {/* Top Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                    {inspectedAttempt.examCode}
                  </span>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 font-mono">
                    CONFIDENTIAL EXAMINER DOSSIER
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {inspectedAttempt.examTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate: <strong>{inspectedAttempt.studentName}</strong> ({inspectedAttempt.studentNumber}) &bull; Overall Grade: <strong className="text-emerald-700 font-bold">{inspectedAttempt.percentage}% ({inspectedAttempt.letterGrade})</strong> &bull; Total Marks: {inspectedAttempt.totalEarnedPoints} / {inspectedAttempt.totalMaxPoints}
                </p>
              </div>
              <button
                onClick={() => setInspectedAttempt(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectorSaveMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{inspectorSaveMsg}</span>
              </div>
            )}

            {/* Questions detail in attempt */}
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>Itemized Question Response Log, Theory Evaluation &amp; Grade Adjustment</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  {Object.keys(inspectedAttempt.scores).length} Questions
                </span>
              </div>

              {Object.values(inspectedAttempt.scores).map((score, i) => {
                const isSubjective = score.isSubjective || (score.wordCount !== undefined && score.wordCount > 0);

                return (
                  <div 
                    key={score.questionId}
                    className={`p-5 rounded-2xl border text-xs space-y-3 ${
                      isSubjective
                        ? 'border-amber-300 bg-amber-50/20'
                        : score.isCorrect 
                        ? 'border-emerald-200 bg-emerald-50/20' 
                        : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-bold">Question {i + 1} ({score.category})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSubjective 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isSubjective ? 'SUBJECTIVE THEORY' : 'OBJECTIVE'}
                        </span>
                      </div>

                      {/* Marks Awarded with live override */}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Examiner Awarded:</span>
                        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-300">
                          <input
                            type="number"
                            min={0}
                            max={score.max}
                            step={0.5}
                            value={manualScores[score.questionId] !== undefined ? manualScores[score.questionId] : score.earned}
                            onChange={(e) => {
                              const val = Math.min(score.max, Math.max(0, Number(e.target.value)));
                              setManualScores({ ...manualScores, [score.questionId]: val });
                            }}
                            className="w-12 text-center font-black text-slate-900 text-xs bg-slate-50 border border-slate-200 rounded"
                          />
                          <span className="font-bold text-slate-600">/ {score.max} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Student's Written Answer */}
                    <div className="text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                        <span>Candidate&apos;s Submitted Response:</span>
                        {score.wordCount !== undefined && (
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            Word Count: {score.wordCount} words
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                        {String(score.userAnswer || '(Blank / Unanswered)')}
                      </p>
                    </div>

                    {/* Rubric Breakdown for Subjective Theory */}
                    {score.rubricResults && score.rubricResults.length > 0 && (
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1.5 text-[11px]">
                        <strong className="text-amber-950 block text-[10px] uppercase font-mono tracking-wider">
                          Auto-Marker Rubric Evaluation:
                        </strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {score.rubricResults.map((r, rIdx) => (
                            <div key={rIdx} className="bg-white p-2 rounded-lg border border-amber-200">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span className="truncate">{r.criterion}</span>
                                <span className={r.earnedPoints === r.maxPoints ? 'text-emerald-700' : 'text-amber-700'}>
                                  {r.earnedPoints} / {r.maxPoints} pts
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{r.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Solution / Model Answer */}
                    <div className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      <strong className="text-emerald-700 block text-[10px] uppercase font-mono">
                        Official Expected Solution / Model Answer:
                      </strong>
                      <span className="text-slate-800">{score.correctAnswerSummary}</span>
                    </div>

                    {/* Auto-Marker Feedback */}
                    <div className="text-slate-600 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong>Auto-Marker Rationale:</strong> {score.feedback}
                    </div>

                    {/* Examiner Feedback & Remarks Input */}
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-600 font-mono mb-1">
                        Official Examiner Remarks / Evaluation Notes:
                      </label>
                      <input
                        type="text"
                        value={manualRemarks[score.questionId] !== undefined ? manualRemarks[score.questionId] : (score.examinerRemarks || '')}
                        onChange={(e) => setManualRemarks({ ...manualRemarks, [score.questionId]: e.target.value })}
                        placeholder="Add formal examiner notes or feedback for this item..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Modal Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Any modifications made to marks and remarks will update candidate gradebook records.
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectedAttempt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveInspectorOverrides}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Examiner Grade &amp; Remarks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
