export type QuestionType = 
  | 'single_choice' 
  | 'multiple_choice' 
  | 'true_false' 
  | 'fill_blank' 
  | 'short_answer'
  | 'essay_theory'
  | 'case_study';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface RubricCriterion {
  id: string;
  title: string;
  points: number;
  keywords: string[];
  description: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  // For fill_blank and short_answer:
  acceptableAnswers?: string[];
  // For short_answer & theory keyword/rubric matching:
  requiredKeywords?: string[];
  // For theory/essay questions:
  modelAnswer?: string;
  minWords?: number;
  rubricCriteria?: RubricCriterion[];
  points: number;
  penalty?: number; // For negative marking if wrong
  category: string; // e.g. "Cellular Respiration", "Algorithms", "World War II"
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  guideReference?: {
    sectionTitle: string;
    pageNumber: number;
    quoteOrSummary: string;
  };
}

export interface PDFGuideSection {
  id: string;
  title: string;
  pageNumber: number;
  content: string;
  keyTerms?: string[];
  subsections?: { title: string; content: string }[];
}

export interface PDFGuide {
  id: string;
  fileName: string;
  title: string;
  authorOrSource: string;
  totalPages: number;
  description: string;
  sections: PDFGuideSection[];
  // If user uploads an external PDF file, we store data URL / object URL here:
  fileUrl?: string;
  isCustomUpload?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  durationMinutes: number;
  passPercentage: number;
  pdfGuide: PDFGuide;
  questions: Question[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  negativeMarking?: boolean;
  instructions: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  avatar: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  title: string;
}

export interface QuestionScoreDetail {
  questionId: string;
  earned: number;
  max: number;
  isCorrect: boolean;
  partialCredit: boolean;
  userAnswer: any;
  correctAnswerSummary: string;
  feedback: string;
  category: string;
  timeSpentSeconds: number;
  // Subjective theory evaluation details:
  isSubjective?: boolean;
  wordCount?: number;
  rubricResults?: { criterion: string; maxPoints: number; earnedPoints: number; feedback: string }[];
  manualScoreOverride?: number;
  examinerRemarks?: string;
}

export interface CategoryScoreSummary {
  category: string;
  earned: number;
  max: number;
  percentage: number;
  totalQuestions: number;
  correctQuestions: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  examCode: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  userAnswers: Record<string, any>; // questionId -> answer
  scores: Record<string, QuestionScoreDetail>;
  totalEarnedPoints: number;
  totalMaxPoints: number;
  percentage: number;
  letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  passed: boolean;
  passPercentage: number;
  categoryScores: CategoryScoreSummary[];
  flaggedQuestionIds: string[];
  certificateId: string;
}
