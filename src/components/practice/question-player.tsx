"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Filter,
  Flag,
  Grid3X3,
  ListChecks,
  LockKeyhole,
  NotebookPen,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Target,
  X,
  XCircle
} from "lucide-react";
import { AnswerInput } from "@/components/practice/answer-input";
import { AnswerResult } from "@/components/practice/answer-result";
import { LockedQuestion } from "@/components/practice/locked-question";
import { AiVariationPanel } from "@/components/service/ai-variation-panel";
import { subjectColorClass } from "@/components/subject/subject-color";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BETA_UNLOCK_ALL, FREE_LIMIT_PER_SUBJECT } from "@/lib/constants";
import { submitQuestionReport } from "@/lib/question-report-service";
import { hasBetaFullAccessAsync, subscribeServiceAuthChanges } from "@/lib/service-auth";
import { gradeQuestion } from "@/lib/grading";
import { getQuestionTypeLabel } from "@/lib/question-labels";
import { getStudyGuide } from "@/lib/study-guide";
import {
  addWrongNote,
  getMemo,
  getPracticeMode,
  getSubjectProgress,
  isFavoriteQuestion,
  markWrongNoteReviewed,
  saveLastQuestion,
  saveMemo,
  savePracticeMode,
  saveProgress,
  toggleFavoriteQuestion
} from "@/lib/storage";
import { cn, toPercent } from "@/lib/utils";
import type { IssueReportType, PracticeMode, ProgressStatus, Question, QuestionType, SubjectMeta, UserAnswer } from "@/types/question";

type Props = {
  subject: SubjectMeta;
  questions: Question[];
  initialQuestionNo: number;
};

type StatusFilter = "all" | "unsolved" | "correct" | "wrong" | "free" | "locked";
type TypeFilter = "all" | QuestionType;

function emptyAnswer(question: Question): UserAnswer {
  if (question.type === "result-table") return { columns: [""], rows: [[""]] };
  return "";
}

function statusClass(status?: ProgressStatus) {
  if (status === "correct") return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
  if (status === "wrong") return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100";
  return "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function normalizeSearchText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").toLowerCase();
}


const LINUX_COMMAND_GROUPS = [
  {
    title: "위치·기본",
    items: [
      ["pwd", "현재 작업 디렉터리의 절대 경로 출력", "현재 위치·작업 경로 확인"],
      ["ls", "파일과 디렉터리 목록 출력", "목록 확인"],
      ["cd", "디렉터리 이동", "폴더 이동"],
      ["whoami", "현재 로그인 사용자 출력", "사용자 이름 확인"],
      ["echo", "문자열 또는 변수 값 출력", "화면 출력"],
      ["clear", "터미널 화면 지우기", "화면 정리"],
      ["date", "현재 날짜와 시간 출력", "날짜·시간 확인"]
    ]
  },
  {
    title: "파일·디렉터리 관리",
    items: [
      ["mkdir", "새 디렉터리 생성", "폴더 생성"],
      ["touch", "빈 파일 생성 또는 시간 갱신", "새 파일 생성"],
      ["cp", "파일·디렉터리 복사", "복사"],
      ["mv", "파일 이동 또는 이름 변경", "이동·이름 변경"],
      ["rm", "파일 또는 디렉터리 삭제", "삭제"],
      ["rmdir", "비어 있는 디렉터리 삭제", "빈 폴더 삭제"]
    ]
  },
  {
    title: "파일 내용 확인",
    items: [
      ["cat", "파일 전체 내용 출력", "내용 출력"],
      ["head", "파일 앞부분 출력", "처음 몇 줄"],
      ["tail", "파일 뒷부분 출력", "마지막 몇 줄"],
      ["less", "긴 파일을 한 화면씩 보기", "넘겨 보기"],
      ["more", "긴 파일을 화면 단위로 출력", "한 화면씩 출력"],
      ["grep", "파일 내용에서 문자열 검색", "포함된 줄 찾기"],
      ["wc", "줄·단어·문자 수 확인", "개수 세기"],
      ["sort", "내용 정렬 출력", "정렬"]
    ]
  },
  {
    title: "권한·도움말·환경",
    items: [
      ["chmod", "파일·디렉터리 접근 권한 변경", "권한 변경"],
      ["sudo", "관리자 권한으로 명령 실행", "root 권한"],
      ["man", "명령어 매뉴얼 확인", "사용법·도움말"],
      ["export", "환경 변수 설정·내보내기", "환경 변수 설정"],
      ["env", "환경 변수 목록 출력", "환경 변수 확인"],
      ["which", "명령어 실행 파일 위치 확인", "명령어 위치"]
    ]
  },
  {
    title: "시스템·네트워크·검색",
    items: [
      ["ps", "프로세스 목록 확인", "실행 중인 프로세스"],
      ["top", "프로세스·시스템 상태 실시간 확인", "실시간 상태"],
      ["kill", "프로세스 종료", "프로세스 종료"],
      ["df", "파일 시스템 디스크 사용량 확인", "디스크 사용량"],
      ["du", "파일·디렉터리 용량 확인", "폴더 용량"],
      ["ifconfig", "네트워크 인터페이스 정보 확인", "IP·네트워크 정보"],
      ["ping", "네트워크 연결 상태 확인", "연결 테스트"],
      ["find", "파일·디렉터리 검색", "파일 찾기"],
      ["vi", "터미널 기반 텍스트 편집기", "파일 편집"]
    ]
  }
] as const;

const LINUX_SYMBOL_POINTS = [
  ["/", "루트 디렉터리 또는 경로 구분자"],
  [".", "현재 디렉터리"],
  ["..", "상위 디렉터리"],
  ["~", "현재 사용자의 홈 디렉터리"],
  ["*", "여러 글자를 대신하는 와일드카드"]
] as const;

const LINUX_PERMISSION_POINTS = [
  ["r", "4", "읽기"],
  ["w", "2", "쓰기"],
  ["x", "1", "실행"],
  ["-", "0", "권한 없음"]
] as const;

function LinuxCommandReference() {
  return (
    <details className="rounded-[1.5rem] border border-violet-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer text-base font-black text-violet-950">6. Linux 필수 명령어·문제도감 펼치기</summary>
      <div className="mt-4 space-y-5">
        <p className="rounded-2xl bg-violet-50 p-4 text-sm font-semibold leading-7 text-violet-950">
          문제를 풀다가 명령어가 떠오르지 않으면 지문 속 표현을 먼저 찾은 뒤, 아래 표에서 기능이 같은 명령어를 비교하세요. 표는 정답을 외우는 용도보다 <span className="font-black">오답 후보를 제거하는 기준표</span>로 사용하면 좋습니다.
        </p>

        <div className="grid gap-4">
          {LINUX_COMMAND_GROUPS.map((group) => (
            <div key={group.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-950">{group.title}</div>
              <div className="divide-y divide-slate-200">
                {group.items.map(([command, meaning, clue]) => (
                  <div key={`${group.title}-${command}`} className="grid grid-cols-[5.5rem_1fr] gap-3 px-4 py-3 text-sm sm:grid-cols-[6rem_1.2fr_1fr]">
                    <code className="rounded-lg bg-slate-950 px-2 py-1 text-center text-xs font-black text-white">{command}</code>
                    <span className="font-semibold leading-6 text-slate-800">{meaning}</span>
                    <span className="hidden font-bold leading-6 text-violet-700 sm:block">단서: {clue}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <h5 className="mb-3 text-sm font-black text-blue-950">경로 기호 빠른 정리</h5>
            <div className="space-y-2">
              {LINUX_SYMBOL_POINTS.map(([symbol, meaning]) => (
                <div key={symbol} className="grid grid-cols-[3.5rem_1fr] gap-2 text-sm font-semibold text-blue-950">
                  <code className="rounded-lg bg-white px-2 py-1 text-center font-black text-blue-700 ring-1 ring-blue-100">{symbol}</code>
                  <span className="leading-6">{meaning}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <h5 className="mb-3 text-sm font-black text-emerald-950">권한 숫자 빠른 정리</h5>
            <div className="space-y-2">
              {LINUX_PERMISSION_POINTS.map(([letter, value, meaning]) => (
                <div key={letter} className="grid grid-cols-[3rem_3rem_1fr] gap-2 text-sm font-semibold text-emerald-950">
                  <code className="rounded-lg bg-white px-2 py-1 text-center font-black text-emerald-700 ring-1 ring-emerald-100">{letter}</code>
                  <span className="rounded-lg bg-white px-2 py-1 text-center font-black ring-1 ring-emerald-100">{value}</span>
                  <span className="leading-6">{meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

export function QuestionPlayer({ subject, questions, initialQuestionNo }: Props) {
  const router = useRouter();
  const [questionNo, setQuestionNo] = useState(initialQuestionNo);
  const question = useMemo(() => questions.find((item) => item.questionNo === questionNo) ?? questions[0], [questionNo, questions]);
  const [answer, setAnswer] = useState<UserAnswer>(() => emptyAnswer(question));
  const [result, setResult] = useState<boolean | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, ProgressStatus>>({});
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<PracticeMode>("study");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [favorite, setFavorite] = useState(false);
  const [memo, setMemo] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);
  const [reportType, setReportType] = useState<IssueReportType>("question");
  const [reportMessage, setReportMessage] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [studyOpen, setStudyOpen] = useState(false);
  const [hasMemberAccess, setHasMemberAccess] = useState(false);
  const color = subjectColorClass[subject.color];
  const studyGuide = useMemo(() => getStudyGuide(question), [question]);
  const guideQuickPoints = useMemo(() => (studyGuide.quickPoints?.length ? studyGuide.quickPoints : studyGuide.theory.slice(0, 3)), [studyGuide]);
  const guideExamples = useMemo(() => studyGuide.examples ?? [], [studyGuide]);

  const isLocked = BETA_UNLOCK_ALL ? false : (!hasMemberAccess && question.questionNo > FREE_LIMIT_PER_SUBJECT);
  const solvedCount = Object.keys(statusMap).length;
  const correctCount = Object.values(statusMap).filter((status) => status === "correct").length;
  const wrongCount = Object.values(statusMap).filter((status) => status === "wrong").length;
  const progressPercent = toPercent(solvedCount, questions.length);
  const accuracy = solvedCount ? toPercent(correctCount, solvedCount) : 0;
  const freeLeft = BETA_UNLOCK_ALL ? Math.max(0, questions.length - question.questionNo) : Math.max(0, FREE_LIMIT_PER_SUBJECT - Math.min(question.questionNo, FREE_LIMIT_PER_SUBJECT));
  const solvedCorrectlyForAi = statusMap[question.questionNo] === "correct" || result === true;

  const chapters = useMemo(() => Array.from(new Set(questions.map((item) => item.chapter))).filter(Boolean), [questions]);
  const types = useMemo(() => Array.from(new Set(questions.map((item) => item.type))) as QuestionType[], [questions]);

  const filteredQuestions = useMemo(() => {
    const search = query.trim().toLowerCase();
    return questions.filter((item) => {
      const locked = BETA_UNLOCK_ALL ? false : (!hasMemberAccess && item.questionNo > FREE_LIMIT_PER_SUBJECT);
      const itemStatus = statusMap[item.questionNo];

      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (chapterFilter !== "all" && item.chapter !== chapterFilter) return false;
      if (statusFilter === "unsolved" && itemStatus) return false;
      if (statusFilter === "correct" && itemStatus !== "correct") return false;
      if (statusFilter === "wrong" && itemStatus !== "wrong") return false;
      if (statusFilter === "free" && locked) return false;
      if (statusFilter === "locked" && !locked) return false;

      if (!search) return true;
      const haystack = [
        item.questionNo,
        item.chapter,
        item.type,
        item.difficulty ?? "",
        item.tags?.join(" ") ?? "",
        normalizeSearchText(item.questionHtml)
      ].join(" ").toLowerCase();
      return haystack.includes(search);
    });
  }, [chapterFilter, hasMemberAccess, query, questions, statusFilter, statusMap, typeFilter]);

  const refreshStatus = () => {
    const progress = getSubjectProgress(subject.id);
    const nextStatus: Record<number, ProgressStatus> = {};
    for (const item of progress) nextStatus[item.questionNo] = item.status;
    setStatusMap(nextStatus);
  };

  useEffect(() => {
    refreshStatus();
    setMode(getPracticeMode());
    const refreshAccess = async () => setHasMemberAccess(await hasBetaFullAccessAsync());
    void refreshAccess();
    const unsubscribe = subscribeServiceAuthChanges(() => {
      void refreshAccess();
    });
    return unsubscribe;
  }, [subject.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setAnswer(emptyAnswer(question));
    setResult(null);
    setFavorite(isFavoriteQuestion(subject.id, question.questionNo));
    setMemo(getMemo(subject.id, question.questionNo));
    setMemoSaved(false);
    setReportType("question");
    setReportMessage("");
    setReportSubmitting(false);
    setReportFeedback(null);
    setStudyOpen(false);
    saveLastQuestion(subject.id, question.questionNo);
  }, [question, subject.id]);

  const changeMode = (nextMode: PracticeMode) => {
    setMode(nextMode);
    savePracticeMode(nextMode);
    setResult(null);
  };

  const goTo = (nextQuestionNo: number) => {
    const safeQuestionNo = Math.max(1, Math.min(questions.length, nextQuestionNo));
    setQuestionNo(safeQuestionNo);
    router.replace(`/practice/${subject.id}?q=${safeQuestionNo}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheck = () => {
    const isCorrect = gradeQuestion(question, answer);
    setResult(isCorrect);
    saveProgress(subject.id, question.questionNo, isCorrect ? "correct" : "wrong", answer);

    if (isCorrect) {
      markWrongNoteReviewed(subject.id, question.questionNo, answer);
    } else {
      addWrongNote({
        subject: subject.id,
        questionNo: question.questionNo,
        questionId: question.id,
        chapter: question.chapter,
        questionHtml: question.questionHtml,
        status: "wrong",
        reviewStatus: "active",
        answer,
        updatedAt: new Date().toISOString()
      });
    }

    refreshStatus();
  };

  const handleToggleFavorite = () => {
    setFavorite(toggleFavoriteQuestion(subject.id, question.questionNo));
  };

  const handleSaveMemo = () => {
    saveMemo(subject.id, question.questionNo, memo);
    setMemoSaved(true);
    window.setTimeout(() => setMemoSaved(false), 1500);
  };

  const handleReport = async () => {
    const trimmed = reportMessage.trim();
    if (trimmed.length < 5) {
      setReportFeedback({ tone: "error", text: "오류 내용을 5자 이상 입력해 주세요." });
      return;
    }

    setReportSubmitting(true);
    setReportFeedback({ tone: "info", text: "오류 제보를 저장하는 중입니다." });
    try {
      await submitQuestionReport({
        subject: subject.id,
        questionNo: question.questionNo,
        reportType,
        message: trimmed
      });
      setReportMessage("");
      setReportFeedback({ tone: "success", text: "오류 제보가 접수되었습니다. 관리자가 확인 후 처리 상태를 관리합니다." });
    } catch (error) {
      setReportFeedback({ tone: "error", text: error instanceof Error ? error.message : "오류 제보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-0">
      <section className="space-y-6">
        <div className="sticky top-[68px] z-30 rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color.gradient} text-sm font-black text-white shadow-lg ${color.glow}`}>{subject.name.slice(0, 2)}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={color.soft} variant="outline">{subject.name}</Badge>
                  <Badge variant={question.isFree ? "success" : "warning"}>{question.questionNo <= FREE_LIMIT_PER_SUBJECT ? "무료 문제" : "회원 전용"}</Badge>
                  <Badge variant={mode === "study" ? "premium" : "dark"}>{mode === "study" ? "학습 모드" : "실전 모드"}</Badge>
                  {favorite ? <Badge variant="warning">다시 볼 문제</Badge> : null}
                </div>
                <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">{question.questionNo}번 문제</h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
              <div className="rounded-2xl bg-slate-50 px-3 py-2"><div className="text-xs font-bold text-slate-500">진행률</div><div className="text-lg font-black text-slate-950">{progressPercent}%</div></div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2"><div className="text-xs font-bold text-slate-500">정답률</div><div className="text-lg font-black text-slate-950">{accuracy}%</div></div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2"><div className="text-xs font-bold text-slate-500">학습시간</div><div className="text-lg font-black text-slate-950">{formatTime(elapsed)}</div></div>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-4" indicatorClassName={`bg-gradient-to-r ${color.progress}`} />
        </div>

        <Card className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${color.gradient}`} />
          <CardContent className="p-5 sm:p-8">
            {isLocked ? (
              <LockedQuestion subject={subject} questionNo={question.questionNo} />
            ) : (
              <div className="space-y-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">문제</div>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">{question.questionNo}번 · {question.chapter}</h3>
                  </div>
                  {mode === "study" ? (
                    <div className="flex flex-wrap gap-2">
                      {question.difficulty ? <Badge variant="secondary">{question.difficulty}</Badge> : null}
                      <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                      {question.tags?.slice(0, 2).map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                    </div>
                  ) : (
                    <Badge variant="dark">힌트 최소화</Badge>
                  )}
                </div>

                <div className="prose-question rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-inner" dangerouslySetInnerHTML={{ __html: question.questionHtml }} />

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-950">답안 입력</div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">
                        {mode === "study"
                          ? question.type === "result-table"
                            ? "결과표의 열과 행을 직접 구성한 뒤 정답을 확인하세요."
                            : "공백·대소문자 등 기본 표기 차이는 유연하게 채점합니다. 출력 문제의 줄바꿈은 정답과 동일해야 합니다."
                          : "실전 모드에서는 힌트를 최소화하고 정답 여부만 바로 확인합니다."}
                      </div>
                    </div>
                    <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                  </div>
                  <AnswerInput question={question} value={answer} onChange={setAnswer} />
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button onClick={handleCheck} size="lg" variant="premium" className="w-full min-w-[148px] sm:w-auto">
                      <Check className="size-4" /> 정답 확인
                    </Button>
                    <Button variant="outline" size="lg" className="w-full min-w-[132px] sm:w-auto" onClick={() => { setAnswer(emptyAnswer(question)); setResult(null); }}>
                      <RotateCcw className="size-4" /> 다시 입력
                    </Button>
                    <Button variant="outline" size="lg" className="w-full min-w-[148px] sm:w-auto" onClick={handleToggleFavorite}>
                      <Star className={cn("size-4", favorite ? "fill-amber-400 text-amber-500" : "")} /> {favorite ? "목록에서 해제" : "다시 볼 문제"}
                    </Button>
                    {mode === "study" ? (
                      <Button variant="outline" size="lg" className="w-full min-w-[132px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 sm:w-auto" onClick={() => setStudyOpen(true)}>
                        <BookOpen className="size-4" /> 학습하기
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-col gap-1 border-t border-slate-200/70 pt-3 text-sm font-semibold leading-6 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>{mode === "study" ? "정답을 맞히면 해설이 공개됩니다." : "실전 모드에서는 해설을 숨깁니다."}</span>
                    <span className="text-slate-600">{hasMemberAccess ? "베타 회원 전체 이용 가능" : BETA_UNLOCK_ALL ? "베타 전체 공개" : `무료 잔여 ${freeLeft}문항`}</span>
                  </div>
                </div>

                <AiVariationPanel subject={subject.id} questionNo={question.questionNo} solvedCorrectly={solvedCorrectlyForAi} />

                {result !== null ? <AnswerResult question={question} isCorrect={result} mode={mode} /> : null}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" disabled={questionNo <= 1} onClick={() => goTo(questionNo - 1)} size="lg"><ArrowLeft className="size-4" /> 이전 문제</Button>
          <Button disabled={questionNo >= questions.length} onClick={() => goTo(questionNo + 1)} size="lg" variant="dark">다음 문제 <ArrowRight className="size-4" /></Button>
        </div>
      </section>

      <aside className="space-y-6 lg:space-y-7">
        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-black text-slate-950">문제풀이 모드</div>
                <p className="mt-1 text-xs font-semibold text-slate-500">학습 모드는 해설 중심, 실전 모드는 힌트 최소화입니다.</p>
              </div>
              <ShieldCheck className="size-5 text-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button type="button" onClick={() => changeMode("study")} className={cn("rounded-xl px-3 py-2 text-sm font-black transition", mode === "study" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-950")}>학습 모드</button>
              <button type="button" onClick={() => changeMode("exam")} className={cn("rounded-xl px-3 py-2 text-sm font-black transition", mode === "exam" ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-950")}>실전 모드</button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6 sm:p-7">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-950"><NotebookPen className="size-4 text-blue-600" /> 내 메모</div>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">헷갈린 개념이나 다시 볼 이유를 적어두세요.</p>
            </div>
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="예: 별칭 출력 문제에서 컬럼명까지 확인하기" className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            <Button onClick={handleSaveMemo} variant="outline" className="w-full">메모 저장</Button>
            {memoSaved ? <p className="text-center text-xs font-bold text-emerald-600">메모가 저장되었습니다.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6 sm:p-7">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-950"><Flag className="size-4 text-red-600" /> 문제 오류 제보</div>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">문제·정답·해설에서 이상한 부분을 발견하면 로그인 계정 기준으로 관리자에게 접수됩니다.</p>
            </div>
            <select value={reportType} onChange={(event) => setReportType(event.target.value as IssueReportType)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700">
              <option value="question">문제 내용 오류</option>
              <option value="answer">정답 오류</option>
              <option value="explanation">해설 오류</option>
              <option value="typo">오타</option>
              <option value="other">기타</option>
            </select>
            <textarea value={reportMessage} onChange={(event) => setReportMessage(event.target.value)} placeholder="이상한 부분을 5자 이상 간단히 적어주세요." className="min-h-[104px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100" />
            <Button onClick={handleReport} variant="outline" className="w-full" disabled={reportSubmitting || reportMessage.trim().length < 5}>{reportSubmitting ? "제보 저장 중" : "오류 제보 저장"}</Button>
            {reportFeedback ? <p className={`rounded-2xl p-3 text-center text-xs font-bold leading-5 ${reportFeedback.tone === "success" ? "bg-emerald-50 text-emerald-700" : reportFeedback.tone === "error" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>{reportFeedback.text}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-6 flex items-center gap-2 text-sm font-black text-slate-950"><Target className="size-4 text-blue-600" /> 학습 요약</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.35rem] bg-blue-50 p-4"><ListChecks className="mb-4 size-5 text-blue-600" /><div className="text-3xl font-black text-blue-700">{solvedCount}</div><div className="mt-1 text-xs font-bold text-blue-700/70">풀이 완료</div></div>
              <div className="rounded-[1.35rem] bg-emerald-50 p-4"><CheckCircle2 className="mb-4 size-5 text-emerald-600" /><div className="text-3xl font-black text-emerald-700">{correctCount}</div><div className="mt-1 text-xs font-bold text-emerald-700/70">정답</div></div>
              <div className="rounded-[1.35rem] bg-red-50 p-4"><XCircle className="mb-4 size-5 text-red-600" /><div className="text-3xl font-black text-red-700">{wrongCount}</div><div className="mt-1 text-xs font-bold text-red-700/70">오답</div></div>
              <div className="rounded-[1.35rem] bg-violet-50 p-4"><Clock3 className="mb-4 size-5 text-violet-600" /><div className="text-3xl font-black text-violet-700">{formatTime(elapsed)}</div><div className="mt-1 text-xs font-bold text-violet-700/70">시간</div></div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between text-sm font-bold"><span>전체 진도</span><span>{progressPercent}%</span></div><Progress value={progressPercent} indicatorClassName={`bg-gradient-to-r ${color.progress}`} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6 sm:p-7">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-950"><Filter className="size-4 text-blue-600" /> 문제 검색·필터</div>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">번호, 단원, 유형, 상태별로 원하는 문제를 빠르게 찾습니다.</p>
            </div>
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="번호, 단원, 키워드 검색" className="h-11 rounded-2xl bg-slate-50 pl-9" /></div>
            <div className="grid grid-cols-2 gap-2">
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)} className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"><option value="all">전체 유형</option>{types.map((type) => <option key={type} value={type}>{getQuestionTypeLabel(type)}</option>)}</select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"><option value="all">전체 상태</option><option value="unsolved">안 푼 문제</option><option value="correct">정답 문제</option><option value="wrong">오답 문제</option><option value="free">공개 문제</option><option value="locked">잠금 문제</option></select>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500">
              <span className="font-black text-slate-700">유형 안내</span> · 단답형, SQL 작성형, 결과표 작성형, 서술·실행결과형으로 구분됩니다.
            </div>
            <select value={chapterFilter} onChange={(event) => setChapterFilter(event.target.value)} className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"><option value="all">전체 단원</option>{chapters.map((chapter) => <option key={chapter} value={chapter}>{chapter}</option>)}</select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-black text-slate-950"><Grid3X3 className="size-4" /> 문제 번호 이동</div><p className="mt-1 text-xs font-semibold text-slate-500">필터 결과 {filteredQuestions.length}문항 · 초록 정답 · 빨강 오답 · 노랑 잠금</p></div></div>
            <div className="grid max-h-[520px] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 lg:grid-cols-5">
              {filteredQuestions.map((item) => {
                const locked = BETA_UNLOCK_ALL ? false : (!hasMemberAccess && item.questionNo > FREE_LIMIT_PER_SUBJECT);
                return <button key={item.questionNo} onClick={() => goTo(item.questionNo)} className={`relative h-10 rounded-xl border text-sm font-black transition ${questionNo === item.questionNo ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${locked ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : statusClass(statusMap[item.questionNo])}`} title={locked ? "회원가입 후 이용 가능" : `${item.questionNo}번`}>{locked ? <LockKeyhole className="mx-auto size-4" /> : item.questionNo}</button>;
              })}
            </div>
          </CardContent>
        </Card>
      </aside>

      {studyOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white sm:p-8">
              <div>
                <Badge variant="premium" className="mb-3">정답 힌트 아님 · 개념 학습</Badge>
                <h3 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{studyGuide.title}</h3>
                <p className="mt-2 text-sm font-semibold text-blue-100">{studyGuide.subtitle}</p>
              </div>
              <button type="button" onClick={() => setStudyOpen(false)} className="rounded-2xl bg-white/10 p-2 text-white transition hover:bg-white/20" aria-label="학습 창 닫기">
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-132px)] overflow-y-auto p-5 sm:p-7">
              <div className="mb-5 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-blue-800">
                  <BookOpen className="size-4" /> 학습하기 사용법
                </div>
                <p className="text-sm font-semibold leading-7 text-blue-950">
                  {subject.id === "linux" ? "이 창은 정답을 바로 알려주지 않습니다. 대신 문제에서 봐야 할 단서, 풀이 순서, 실수 포인트, 필수 명령어 도감을 제공해 다시 문제로 돌아가 스스로 풀 수 있게 돕습니다." : "이 창은 정답을 계산해 주지 않습니다. 실제 강사가 옆에서 설명하듯, 지금 문제를 풀기 전에 봐야 할 단서·핵심 이론·비슷한 예시·풀이 순서를 정리합니다."}
                </p>
              </div>

              <div className="space-y-5">
                <section className="rounded-[1.5rem] border border-violet-100 bg-violet-50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="text-base font-black text-violet-950">1. 이 문제는 무엇을 묻나요?</h4>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-violet-700 ring-1 ring-violet-100">30초 요약</span>
                  </div>
                  <ul className="space-y-2.5">
                    {guideQuickPoints.slice(0, 4).map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-3 text-sm font-semibold leading-6 text-violet-950">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-700 text-xs font-black text-white">{index + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
                  <h4 className="mb-4 text-base font-black text-blue-950">2. 문제에서 먼저 봐야 할 단서</h4>
                  <ul className="space-y-2.5">
                    {studyGuide.structure.slice(0, 4).map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-3 text-sm font-semibold leading-6 text-blue-950">
                        <Target className="mt-0.5 size-4 shrink-0 text-blue-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {guideExamples.length ? (
                  <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <h4 className="mb-4 text-base font-black text-slate-950">3. 정답과 다른 비슷한 예시</h4>
                    <div className="space-y-3">
                      {guideExamples.slice(0, 3).map((item, index) => (
                        <pre key={`${item}-${index}`} className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm font-semibold leading-7 text-slate-50"><code>{item}</code></pre>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-bold leading-5 text-slate-500">예시는 현재 문제와 다른 값으로 구성되어 있어 정답을 직접 노출하지 않습니다.</p>
                  </section>
                ) : null}

                <section className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5">
                  <h4 className="mb-4 text-base font-black text-emerald-950">4. 문제 풀 때 확인할 순서</h4>
                  <ol className="space-y-2.5">
                    {studyGuide.approach.slice(0, 5).map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-3 text-sm font-semibold leading-6 text-emerald-950">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5">
                  <h4 className="mb-4 text-base font-black text-amber-950">5. 자주 하는 실수</h4>
                  <ul className="space-y-2.5">
                    {studyGuide.cautions.slice(0, 5).map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-3 text-sm font-semibold leading-6 text-amber-950">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {subject.id === "linux" ? <LinuxCommandReference /> : null}

                <details className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <summary className="cursor-pointer text-base font-black text-slate-950">이 문제를 풀기 위한 자세한 이론 보기</summary>
                  <div className="mt-4 space-y-3">
                    {studyGuide.theory.slice(0, 6).map((item, index) => (
                      <p key={`${item}-${index}`} className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-18px_50px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-[1fr_1.4fr_1fr] gap-2">
          <Button variant="outline" disabled={questionNo <= 1} onClick={() => goTo(questionNo - 1)} size="md">이전</Button>
          <Button onClick={handleCheck} size="md" variant="premium" disabled={isLocked}><Check className="size-4" /> 정답 확인</Button>
          <Button disabled={questionNo >= questions.length} onClick={() => goTo(questionNo + 1)} size="md" variant="dark">다음</Button>
        </div>
      </div>
    </div>
  );
}
