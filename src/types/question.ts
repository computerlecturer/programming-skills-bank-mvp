export type SubjectId = "sql" | "python" | "java" | "linux";

export type QuestionType = "short" | "text" | "choice" | "sql" | "result-table";

export type SubjectColor = "blue" | "emerald" | "amber" | "violet";

export type PracticeMode = "study" | "exam";

export type SubjectMeta = {
  id: SubjectId;
  name: string;
  label: string;
  total: number;
  freeCount: number;
  color: SubjectColor;
  description: string;
};

export type GradingPolicy = {
  mode?: string;
  caseSensitive?: boolean;
  ignoreWhitespace?: boolean;
  ignoreSemicolon?: boolean;
  ignoreColumnHeaderWhitespace?: boolean;
  allowNullVariants?: boolean;
  preserveLineBreaks?: boolean;
  note?: string;
};

export type Question = {
  id: number;
  subject: SubjectId;
  subjectName: string;
  questionNo: number;
  chapter: string;
  chapterNo?: number;
  chapterSlug?: string;
  type: QuestionType;
  answerMode?: string;
  difficulty?: string;
  tags: string[];
  isFree: boolean;
  accessLevel: "free" | "paid";
  questionHtml: string;
  explanationHtml: string;
  gradingPolicy?: GradingPolicy;
  acceptedAnswer?: string;
  acceptedAnswers?: string[];
  choiceOptions?: string[];
  outputColumns?: string[];
  acceptedTableRows?: string[][];
};

export type TextAnswer = string;

/**
 * result-table 답안은 정답 구조가 노출되지 않도록 사용자가 직접 컬럼과 행을 구성한다.
 * columns: 사용자가 입력한 결과 컬럼명
 * rows: 사용자가 입력한 결과 데이터 행
 */
export type TableAnswer = {
  columns: string[];
  rows: string[][];
};

/** 이전 MVP에서 저장된 배열형 result-table 답안과의 localStorage 호환용 */
export type LegacyTableAnswer = string[][];

export type UserAnswer = TextAnswer | TableAnswer | LegacyTableAnswer;

export type ProgressStatus = "correct" | "wrong";

export type ProgressItem = {
  subject: SubjectId;
  questionNo: number;
  status: ProgressStatus;
  answer: UserAnswer;
  updatedAt: string;
};

export type WrongNoteReviewStatus = "active" | "reviewed";

export type WrongNote = ProgressItem & {
  questionId: number;
  chapter: string;
  questionHtml: string;
  reviewStatus?: WrongNoteReviewStatus;
  wrongCount?: number;
  firstWrongAt?: string;
  reviewedAt?: string;
  lastWrongAnswer?: UserAnswer;
};

export type FavoriteQuestion = {
  subject: SubjectId;
  questionNo: number;
  createdAt: string;
};

export type QuestionMemo = {
  subject: SubjectId;
  questionNo: number;
  memo: string;
  updatedAt: string;
};

export type IssueReportType = "question" | "answer" | "explanation" | "typo" | "other";

export type IssueReport = {
  id: string;
  subject: SubjectId;
  questionNo: number;
  type: IssueReportType;
  message: string;
  createdAt: string;
};

export type MockExamAnswer = {
  subject: SubjectId;
  questionNo: number;
  answer: UserAnswer;
  isCorrect: boolean;
};

export type MockExamResult = {
  id: string;
  createdAt: string;
  durationSeconds: number;
  total: number;
  correct: number;
  answers: MockExamAnswer[];
};
