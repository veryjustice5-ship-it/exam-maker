import { Exam, ExamAttempt, Question, QuestionScoreDetail, CategoryScoreSummary } from '../types';

export function calculateGrade(percentage: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 95) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 65) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

export function evaluateQuestion(
  q: Question,
  userAnswer: any,
  timeSpentSeconds: number = 0,
  applyNegativeMarking: boolean = false
): QuestionScoreDetail {
  let earned = 0;
  let isCorrect = false;
  let partialCredit = false;
  let correctAnswerSummary = '';
  let feedback = '';

  switch (q.type) {
    case 'single_choice': {
      const correctOption = q.options?.find(o => o.isCorrect);
      correctAnswerSummary = correctOption?.text || '';
      if (userAnswer === correctOption?.id) {
        earned = q.points;
        isCorrect = true;
        feedback = `Correct! ${q.explanation}`;
      } else if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
        earned = 0;
        feedback = `Unanswered. Correct answer was: "${correctAnswerSummary}". ${q.explanation}`;
      } else {
        earned = applyNegativeMarking && q.penalty ? -q.penalty : 0;
        feedback = `Incorrect. Correct answer is: "${correctAnswerSummary}". ${q.explanation}`;
      }
      break;
    }

    case 'true_false': {
      const correctOption = q.options?.find(o => o.isCorrect);
      correctAnswerSummary = correctOption?.text || '';
      if (userAnswer === correctOption?.id || String(userAnswer).toLowerCase() === String(correctOption?.text).toLowerCase()) {
        earned = q.points;
        isCorrect = true;
        feedback = `Correct! ${q.explanation}`;
      } else if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
        earned = 0;
        feedback = `Unanswered. Statement is: ${correctAnswerSummary}. ${q.explanation}`;
      } else {
        earned = applyNegativeMarking && q.penalty ? -q.penalty : 0;
        feedback = `Incorrect. Statement is actually ${correctAnswerSummary}. ${q.explanation}`;
      }
      break;
    }

    case 'multiple_choice': {
      const correctIds = (q.options || []).filter(o => o.isCorrect).map(o => o.id);
      const userSelected = Array.isArray(userAnswer) ? userAnswer : [];
      correctAnswerSummary = (q.options || [])
        .filter(o => o.isCorrect)
        .map(o => o.text)
        .join(', ');

      const matchedCorrect = userSelected.filter(id => correctIds.includes(id)).length;
      const wronglySelected = userSelected.filter(id => !correctIds.includes(id)).length;

      if (userSelected.length === 0) {
        earned = 0;
        feedback = `Unanswered. Correct options: ${correctAnswerSummary}. ${q.explanation}`;
      } else if (matchedCorrect === correctIds.length && wronglySelected === 0) {
        earned = q.points;
        isCorrect = true;
        feedback = `All correct! Selected all ${correctIds.length} expected options. ${q.explanation}`;
      } else {
        // Partial credit calculation:
        const pointPerCorrect = q.points / Math.max(1, correctIds.length);
        let partial = matchedCorrect * pointPerCorrect;
        if (applyNegativeMarking) {
          partial -= wronglySelected * (pointPerCorrect * 0.5);
        }
        earned = Math.max(0, Math.round(partial * 10) / 10);
        partialCredit = earned > 0 && earned < q.points;
        isCorrect = earned === q.points;
        feedback = `Partially answered (${matchedCorrect}/${correctIds.length} correct, ${wronglySelected} incorrect selection). Expected: ${correctAnswerSummary}. ${q.explanation}`;
      }
      break;
    }

    case 'fill_blank': {
      const acceptable = (q.acceptableAnswers || []).map(a => normalizeText(a));
      correctAnswerSummary = (q.acceptableAnswers || [])[0] || '';
      const userNorm = typeof userAnswer === 'string' ? normalizeText(userAnswer) : '';

      if (!userNorm) {
        earned = 0;
        feedback = `Unanswered. Correct term: "${correctAnswerSummary}". ${q.explanation}`;
      } else if (acceptable.includes(userNorm)) {
        earned = q.points;
        isCorrect = true;
        feedback = `Exact match! "${userAnswer}" is correct. ${q.explanation}`;
      } else {
        // Check partial fuzzy match (e.g. slight plural or substring)
        const partialMatch = acceptable.some(ans => ans.includes(userNorm) || userNorm.includes(ans));
        if (partialMatch && userNorm.length >= 4) {
          earned = Math.round(q.points * 0.5 * 10) / 10;
          partialCredit = true;
          feedback = `Close match awarded partial credit: entered "${userAnswer}", expected "${correctAnswerSummary}". ${q.explanation}`;
        } else {
          earned = applyNegativeMarking && q.penalty ? -q.penalty : 0;
          feedback = `Incorrect. You wrote "${userAnswer}". Correct term: "${correctAnswerSummary}". ${q.explanation}`;
        }
      }
      break;
    }

    case 'short_answer': {
      const userText = typeof userAnswer === 'string' ? userAnswer : '';
      const keywords = q.requiredKeywords || [];
      correctAnswerSummary = (q.acceptableAnswers && q.acceptableAnswers[0]) || keywords.join(', ');

      if (!userText.trim()) {
        earned = 0;
        feedback = `Unanswered. Key points required: ${keywords.join(', ')}. ${q.explanation}`;
      } else {
        const lowerText = userText.toLowerCase();
        const matchedKeywords = keywords.filter(kw => lowerText.includes(kw.toLowerCase()));
        const matchRatio = keywords.length > 0 ? matchedKeywords.length / keywords.length : 1;

        if (matchRatio >= 0.8) {
          earned = q.points;
          isCorrect = true;
          feedback = `Excellent answer! Covered key concepts (${matchedKeywords.join(', ')}). ${q.explanation}`;
        } else if (matchRatio >= 0.4) {
          earned = Math.round(q.points * matchRatio * 10) / 10;
          partialCredit = true;
          feedback = `Good attempt with partial marks (${matchedKeywords.length}/${keywords.length} core concepts covered). Missed: ${keywords.filter(k => !matchedKeywords.includes(k)).join(', ')}. ${q.explanation}`;
        } else {
          earned = 0;
          feedback = `Incomplete answer. Missing crucial concepts: ${keywords.join(', ')}. ${q.explanation}`;
        }
      }
      break;
    }
  }

  return {
    questionId: q.id,
    earned,
    max: q.points,
    isCorrect,
    partialCredit,
    userAnswer,
    correctAnswerSummary,
    feedback,
    category: q.category,
    timeSpentSeconds,
  };
}

export function gradeExamAttempt(
  exam: Exam,
  studentId: string,
  studentName: string,
  studentNumber: string,
  userAnswers: Record<string, any>,
  questionTimeSpent: Record<string, number> = {},
  flaggedQuestionIds: string[] = [],
  startedAt: string = new Date().toISOString()
): ExamAttempt {
  const scores: Record<string, QuestionScoreDetail> = {};
  let totalEarnedPoints = 0;
  let totalMaxPoints = 0;

  // Track category scores
  const categoryMap: Record<string, { earned: number; max: number; total: number; correct: number }> = {};

  exam.questions.forEach(q => {
    const timeSpent = questionTimeSpent[q.id] || 0;
    const detail = evaluateQuestion(q, userAnswers[q.id], timeSpent, !!exam.negativeMarking);
    scores[q.id] = detail;
    totalEarnedPoints += detail.earned;
    totalMaxPoints += detail.max;

    if (!categoryMap[q.category]) {
      categoryMap[q.category] = { earned: 0, max: 0, total: 0, correct: 0 };
    }
    categoryMap[q.category].earned += detail.earned;
    categoryMap[q.category].max += detail.max;
    categoryMap[q.category].total += 1;
    if (detail.isCorrect) {
      categoryMap[q.category].correct += 1;
    }
  });

  // Clamp total points at 0 if negative marking brought it below zero
  totalEarnedPoints = Math.max(0, Math.round(totalEarnedPoints * 10) / 10);
  const percentage = totalMaxPoints > 0 ? Math.round((totalEarnedPoints / totalMaxPoints) * 100) : 0;
  const passed = percentage >= exam.passPercentage;
  const letterGrade = calculateGrade(percentage);

  const categoryScores: CategoryScoreSummary[] = Object.entries(categoryMap).map(([category, stats]) => ({
    category,
    earned: Math.round(stats.earned * 10) / 10,
    max: stats.max,
    percentage: stats.max > 0 ? Math.round((stats.earned / stats.max) * 100) : 0,
    totalQuestions: stats.total,
    correctQuestions: stats.correct,
  }));

  const submittedAt = new Date().toISOString();
  const startTimeMs = new Date(startedAt).getTime();
  const endTimeMs = new Date(submittedAt).getTime();
  const durationSeconds = Math.max(1, Math.round((endTimeMs - startTimeMs) / 1000));

  // Generate certificate hash
  const certId = `CERT-${exam.code}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return {
    id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    examId: exam.id,
    examTitle: exam.title,
    examCode: exam.code,
    studentId,
    studentName,
    studentNumber,
    startedAt,
    submittedAt,
    durationSeconds,
    userAnswers,
    scores,
    totalEarnedPoints,
    totalMaxPoints,
    percentage,
    letterGrade,
    passed,
    passPercentage: exam.passPercentage,
    categoryScores,
    flaggedQuestionIds,
    certificateId: certId,
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
