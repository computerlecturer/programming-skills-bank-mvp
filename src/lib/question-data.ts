import sqlRaw from "@/data/sql_200_questions_platform_student_final_reviewed.json";
import pythonRaw from "@/data/python_150_questions_v3_final_reviewed.json";
import javaRaw from "@/data/java_150_questions_final_reviewed.json";
import linuxRaw from "@/data/linux_120_questions_v2_strengthened.json";
import type { Question, QuestionType, SubjectId, SubjectMeta } from "@/types/question";

import { BETA_UNLOCK_ALL, FREE_LIMIT } from "@/lib/constants";

type RawQuestion = Partial<Question> & {
  id: number;
  chapter?: string;
  questionHtml: string;
  explanationHtml: string;
  acceptedAnswer?: string;
  acceptedAnswers?: string[];
  choiceOptions?: string[];
  outputColumns?: string[];
  acceptedTableRows?: string[][];
};

const SUBJECT_CONFIG: Record<SubjectId, Omit<SubjectMeta, "total">> = {
  sql: {
    id: "sql",
    name: "SQL",
    label: "SQL 200제",
    freeCount: FREE_LIMIT,
    color: "blue",
    description: "SELECT, JOIN, 서브쿼리, DDL/DML, 결과표 작성까지 실기형 SQL 문제"
  },
  python: {
    id: "python",
    name: "Python",
    label: "Python 150제",
    freeCount: FREE_LIMIT,
    color: "emerald",
    description: "출력 결과 예측, 자료형, 함수, 반복문, 오류 수정 중심 문제"
  },
  java: {
    id: "java",
    name: "Java",
    label: "Java 150제",
    freeCount: FREE_LIMIT,
    color: "amber",
    description: "클래스, 인터페이스, 상속, 문자열 비교, 생성자 흐름 중심 문제"
  },
  linux: {
    id: "linux",
    name: "Linux",
    label: "Linux 120제",
    freeCount: FREE_LIMIT,
    color: "violet",
    description: "경로, 권한, 기본 명령어, 터미널 사용법 중심 단답형 문제"
  }
};

function normalizeQuestions(raw: RawQuestion[], subject: SubjectId): Question[] {
  const config = SUBJECT_CONFIG[subject];

  return raw.map((item, index) => {
    const questionNo = item.questionNo ?? item.id ?? index + 1;
    const isFree = BETA_UNLOCK_ALL ? true : questionNo <= FREE_LIMIT;

    return {
      id: item.id,
      subject,
      subjectName: item.subjectName ?? config.name,
      questionNo,
      chapter: item.chapter ?? "기본 문제",
      chapterNo: item.chapterNo,
      chapterSlug: item.chapterSlug,
      type: (item.type ?? "short") as QuestionType,
      answerMode: item.answerMode ?? item.type,
      difficulty: item.difficulty,
      tags: item.tags ?? [config.name],
      isFree,
      accessLevel: isFree ? "free" : "paid",
      questionHtml: item.questionHtml,
      explanationHtml: item.explanationHtml,
      gradingPolicy: item.gradingPolicy,
      acceptedAnswer: item.acceptedAnswer,
      acceptedAnswers: item.acceptedAnswers,
      choiceOptions: item.choiceOptions,
      outputColumns: item.outputColumns,
      acceptedTableRows: item.acceptedTableRows
    };
  });
}

const questionMap: Record<SubjectId, Question[]> = {
  sql: normalizeQuestions(sqlRaw as RawQuestion[], "sql"),
  python: normalizeQuestions(pythonRaw as RawQuestion[], "python"),
  java: normalizeQuestions(javaRaw as RawQuestion[], "java"),
  linux: normalizeQuestions(linuxRaw as RawQuestion[], "linux")
};

export const subjects: SubjectMeta[] = (Object.keys(SUBJECT_CONFIG) as SubjectId[]).map((subject) => ({
  ...SUBJECT_CONFIG[subject],
  total: questionMap[subject].length,
  freeCount: BETA_UNLOCK_ALL ? questionMap[subject].length : SUBJECT_CONFIG[subject].freeCount
}));

export function getSubjects() {
  return subjects;
}

export function isSubjectId(value: string): value is SubjectId {
  return ["sql", "python", "java", "linux"].includes(value);
}

export function getSubjectMeta(subject: SubjectId) {
  return subjects.find((item) => item.id === subject);
}

export function getQuestions(subject: SubjectId) {
  return questionMap[subject];
}

export function getQuestion(subject: SubjectId, questionNo: number) {
  return questionMap[subject].find((question) => question.questionNo === questionNo);
}

export function getAllQuestions() {
  return questionMap;
}
