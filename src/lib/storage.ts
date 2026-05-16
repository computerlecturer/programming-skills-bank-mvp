import type {
  FavoriteQuestion,
  IssueReport,
  IssueReportType,
  MockExamResult,
  ProgressItem,
  ProgressStatus,
  AnswerReveal,
  QuestionMemo,
  SubjectId,
  UserAnswer,
  WrongNote
} from "@/types/question";

const PROGRESS_KEY = "psb:progress";
const WRONG_KEY = "psb:wrong-notes";
const LAST_KEY = "psb:last-question";
const MODE_KEY = "psb:practice-mode";
const FAVORITES_KEY = "psb:favorites";
const MEMOS_KEY = "psb:memos";
const REPORTS_KEY = "psb:issue-reports";
const MOCK_RESULTS_KEY = "psb:mock-exam-results";
const ANSWER_REVEALS_KEY = "psb:answer-reveals";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function keyOf(subject: SubjectId, questionNo: number) {
  return `${subject}:${questionNo}`;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getProgress() {
  return readJson<Record<string, ProgressItem>>(PROGRESS_KEY, {});
}

export function getSubjectProgress(subject: SubjectId) {
  const progress = getProgress();
  return Object.values(progress).filter((item) => item.subject === subject);
}

export function saveProgress(subject: SubjectId, questionNo: number, status: ProgressStatus, answer: UserAnswer) {
  const progress = getProgress();
  const key = keyOf(subject, questionNo);
  progress[key] = {
    subject,
    questionNo,
    status,
    answer,
    updatedAt: new Date().toISOString()
  };
  writeJson(PROGRESS_KEY, progress);
}

export function getProgressItem(subject: SubjectId, questionNo: number) {
  return getProgress()[keyOf(subject, questionNo)];
}

export function getAnswerReveals() {
  return readJson<Record<string, AnswerReveal>>(ANSWER_REVEALS_KEY, {});
}

export function getSubjectAnswerReveals(subject: SubjectId) {
  const reveals = getAnswerReveals();
  return Object.values(reveals).filter((item) => item.subject === subject);
}

export function saveAnswerReveal(subject: SubjectId, questionNo: number) {
  const reveals = getAnswerReveals();
  const key = keyOf(subject, questionNo);
  reveals[key] = {
    subject,
    questionNo,
    revealedAt: new Date().toISOString()
  };
  writeJson(ANSWER_REVEALS_KEY, reveals);
}

export function saveLastQuestion(subject: SubjectId, questionNo: number) {
  const last = readJson<Record<SubjectId, number>>(LAST_KEY, {
    sql: 1,
    python: 1,
    java: 1,
    linux: 1
  });
  last[subject] = questionNo;
  writeJson(LAST_KEY, last);
}

export function getLastQuestion(subject: SubjectId) {
  const last = readJson<Partial<Record<SubjectId, number>>>(LAST_KEY, {});
  return last[subject] ?? 1;
}

export function getPracticeMode() {
  return readJson<"study" | "exam">(MODE_KEY, "study");
}

export function savePracticeMode(mode: "study" | "exam") {
  writeJson(MODE_KEY, mode);
}

export function getWrongNotes() {
  return readJson<Record<string, WrongNote>>(WRONG_KEY, {});
}

export function getWrongNotesList(options?: { includeReviewed?: boolean }) {
  const notes = Object.values(getWrongNotes());
  const filtered = options?.includeReviewed ? notes : notes.filter((note) => note.reviewStatus !== "reviewed");
  return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function addWrongNote(note: WrongNote) {
  const notes = getWrongNotes();
  const key = keyOf(note.subject, note.questionNo);
  const existing = notes[key];
  const now = new Date().toISOString();

  notes[key] = {
    ...existing,
    ...note,
    status: "wrong",
    reviewStatus: "active",
    wrongCount: (existing?.wrongCount ?? 0) + 1,
    firstWrongAt: existing?.firstWrongAt ?? now,
    lastWrongAnswer: note.answer,
    updatedAt: now,
    reviewedAt: undefined
  };

  writeJson(WRONG_KEY, notes);
}

export function markWrongNoteReviewed(subject: SubjectId, questionNo: number, answer: UserAnswer) {
  const notes = getWrongNotes();
  const key = keyOf(subject, questionNo);
  const existing = notes[key];
  if (!existing) return;

  const now = new Date().toISOString();
  notes[key] = {
    ...existing,
    status: "correct",
    reviewStatus: "reviewed",
    answer,
    updatedAt: now,
    reviewedAt: now
  };
  writeJson(WRONG_KEY, notes);
}

export function reactivateWrongNote(subject: SubjectId, questionNo: number) {
  const notes = getWrongNotes();
  const key = keyOf(subject, questionNo);
  const existing = notes[key];
  if (!existing) return;
  notes[key] = {
    ...existing,
    status: "wrong",
    reviewStatus: "active",
    updatedAt: new Date().toISOString()
  };
  writeJson(WRONG_KEY, notes);
}

export function removeWrongNote(subject: SubjectId, questionNo: number) {
  const notes = getWrongNotes();
  delete notes[keyOf(subject, questionNo)];
  writeJson(WRONG_KEY, notes);
}

export function clearWrongNotes() {
  writeJson(WRONG_KEY, {});
}

export function getFavorites() {
  return readJson<Record<string, FavoriteQuestion>>(FAVORITES_KEY, {});
}

export function getFavoritesList() {
  return Object.values(getFavorites()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function isFavoriteQuestion(subject: SubjectId, questionNo: number) {
  return Boolean(getFavorites()[keyOf(subject, questionNo)]);
}

export function toggleFavoriteQuestion(subject: SubjectId, questionNo: number) {
  const favorites = getFavorites();
  const key = keyOf(subject, questionNo);
  if (favorites[key]) {
    delete favorites[key];
    writeJson(FAVORITES_KEY, favorites);
    return false;
  }
  favorites[key] = { subject, questionNo, createdAt: new Date().toISOString() };
  writeJson(FAVORITES_KEY, favorites);
  return true;
}

export function getMemos() {
  return readJson<Record<string, QuestionMemo>>(MEMOS_KEY, {});
}

export function getMemo(subject: SubjectId, questionNo: number) {
  return getMemos()[keyOf(subject, questionNo)]?.memo ?? "";
}

export function saveMemo(subject: SubjectId, questionNo: number, memo: string) {
  const memos = getMemos();
  const key = keyOf(subject, questionNo);
  const trimmed = memo.trim();
  if (!trimmed) {
    delete memos[key];
  } else {
    memos[key] = { subject, questionNo, memo: trimmed, updatedAt: new Date().toISOString() };
  }
  writeJson(MEMOS_KEY, memos);
}

export function getMemosList() {
  return Object.values(getMemos()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getIssueReports() {
  return readJson<IssueReport[]>(REPORTS_KEY, []);
}

export function addIssueReport(subject: SubjectId, questionNo: number, type: IssueReportType, message: string) {
  const reports = getIssueReports();
  const report: IssueReport = {
    id: uid("report"),
    subject,
    questionNo,
    type,
    message: message.trim(),
    createdAt: new Date().toISOString()
  };
  writeJson(REPORTS_KEY, [report, ...reports]);
  return report;
}

export function getMockExamResults() {
  return readJson<MockExamResult[]>(MOCK_RESULTS_KEY, []);
}

export function saveMockExamResult(result: Omit<MockExamResult, "id" | "createdAt">) {
  const results = getMockExamResults();
  const saved: MockExamResult = {
    ...result,
    id: uid("mock"),
    createdAt: new Date().toISOString()
  };
  writeJson(MOCK_RESULTS_KEY, [saved, ...results].slice(0, 20));
  return saved;
}
