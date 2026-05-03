import { FREE_LIMIT_PER_SUBJECT } from "@/lib/constants";
import type { ProgressItem, Question, SubjectId } from "@/types/question";

export const subjectLabel: Record<SubjectId, string> = {
  sql: "SQL",
  python: "Python",
  java: "Java",
  linux: "Linux"
};

export function flattenQuestions(questionMap: Record<SubjectId, Question[]> | Question[]) {
  if (Array.isArray(questionMap)) return questionMap;
  return Object.values(questionMap).flat();
}

export function getQuestionKey(subject: SubjectId, questionNo: number) {
  return `${subject}:${questionNo}`;
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function buildQuestionIndex(questions: Question[]) {
  return new Map(questions.map((question) => [getQuestionKey(question.subject, question.questionNo), question]));
}

export function getWeakAreas(questions: Question[], progressItems: ProgressItem[], limit = 6) {
  const index = buildQuestionIndex(questions);
  const groups = new Map<string, { subject: SubjectId; chapter: string; type: string; solved: number; wrong: number; correct: number }>();

  for (const item of progressItems) {
    const question = index.get(getQuestionKey(item.subject, item.questionNo));
    if (!question) continue;
    const key = `${question.subject}|${question.chapter}|${question.type}`;
    const existing = groups.get(key) ?? { subject: question.subject, chapter: question.chapter, type: question.type, solved: 0, wrong: 0, correct: 0 };
    existing.solved += 1;
    if (item.status === "wrong") existing.wrong += 1;
    if (item.status === "correct") existing.correct += 1;
    groups.set(key, existing);
  }

  return Array.from(groups.values())
    .filter((group) => group.solved >= 2 || group.wrong > 0)
    .map((group) => ({
      ...group,
      accuracy: group.solved ? Math.round((group.correct / group.solved) * 100) : 0,
      wrongRate: group.solved ? Math.round((group.wrong / group.solved) * 100) : 0
    }))
    .sort((a, b) => b.wrongRate - a.wrongRate || b.wrong - a.wrong || b.solved - a.solved)
    .slice(0, limit);
}

export function getTodayRecommendations(questions: Question[], progressItems: ProgressItem[], wrongCount: number) {
  const solvedKeys = new Set(progressItems.map((item) => getQuestionKey(item.subject, item.questionNo)));
  const weak = getWeakAreas(questions, progressItems, 1)[0];
  const nextUnsolvedBySubject = (subject: SubjectId) =>
    questions.find((question) => question.subject === subject && question.questionNo <= FREE_LIMIT_PER_SUBJECT && !solvedKeys.has(getQuestionKey(subject, question.questionNo)));

  const recommendedSubject = weak?.subject ?? "sql";
  const next = nextUnsolvedBySubject(recommendedSubject) ?? questions.find((question) => (question.questionNo <= FREE_LIMIT_PER_SUBJECT) && !solvedKeys.has(getQuestionKey(question.subject, question.questionNo))) ?? questions[0];

  return {
    primaryText: wrongCount > 0 ? "먼저 오답 복습 3문항을 정리하세요." : "오늘은 과목별 무료 공개 문제 10문항으로 실기 감각을 유지하세요.",
    secondaryText: weak
      ? `${subjectLabel[weak.subject]} · ${weak.chapter} 영역의 오답률이 높습니다.`
      : "아직 충분한 학습 기록이 없어 SQL 기초 문제부터 추천합니다.",
    href: wrongCount > 0 ? "/wrong-notes" : `/practice/${next.subject}?q=${next.questionNo}`,
    buttonLabel: wrongCount > 0 ? "오답 복습 시작" : `${subjectLabel[next.subject]} ${next.questionNo}번 풀기`
  };
}
