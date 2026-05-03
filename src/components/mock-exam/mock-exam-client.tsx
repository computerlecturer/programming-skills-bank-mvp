"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, FileText, RotateCcw, Trophy, XCircle } from "lucide-react";
import { AnswerInput } from "@/components/practice/answer-input";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { gradeQuestion } from "@/lib/grading";
import { getQuestionTypeLabel } from "@/lib/question-labels";
import { addWrongNote, getMockExamResults, markWrongNoteReviewed, saveMockExamResult, saveProgress } from "@/lib/storage";
import { subjectLabel } from "@/lib/learning-analytics";
import { toPercent } from "@/lib/utils";
import type { MockExamResult, Question, UserAnswer } from "@/types/question";

type Phase = "ready" | "running" | "finished";

type UserAnswerMap = Record<string, UserAnswer>;

const examSizeBySubject = { sql: 5, python: 3, java: 3, linux: 2 } as const;

function questionKey(question: Question) {
  return `${question.subject}:${question.questionNo}`;
}

function emptyAnswer(question: Question): UserAnswer {
  if (question.type === "result-table") return { columns: [""], rows: [[""]] };
  return "";
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickQuestions(questions: Question[]) {
  const selected: Question[] = [];
  for (const [subject, count] of Object.entries(examSizeBySubject)) {
    const pool = questions.filter((question) => question.subject === subject);
    selected.push(...shuffle(pool).slice(0, count));
  }
  return shuffle(selected);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function MockExamClient({ questions }: { questions: Question[] }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<UserAnswerMap>({});
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<MockExamResult | null>(null);
  const [history, setHistory] = useState<MockExamResult[]>([]);

  useEffect(() => setHistory(getMockExamResults()), []);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const total = examQuestions.length;
  const question = examQuestions[current];
  const answeredCount = Object.values(answers).filter((answer) => {
    if (typeof answer === "string") return answer.trim().length > 0;
    if (Array.isArray(answer)) return answer.some((row) => row.some(Boolean));
    return answer.columns.some(Boolean) || answer.rows.some((row) => row.some(Boolean));
  }).length;
  const progress = total ? toPercent(answeredCount, total) : 0;

  const latestScore = history[0];

  const startExam = () => {
    const picked = pickQuestions(questions);
    const initialAnswers: UserAnswerMap = {};
    picked.forEach((item) => { initialAnswers[questionKey(item)] = emptyAnswer(item); });
    setExamQuestions(picked);
    setAnswers(initialAnswers);
    setCurrent(0);
    setElapsed(0);
    setResult(null);
    setPhase("running");
  };

  const finishExam = () => {
    if (answeredCount < total) {
      const ok = window.confirm(`아직 답안을 입력하지 않은 문제가 ${total - answeredCount}개 있습니다. 그대로 제출할까요?`);
      if (!ok) return;
    }

    const graded = examQuestions.map((item) => {
      const answer = answers[questionKey(item)] ?? emptyAnswer(item);
      const isCorrect = gradeQuestion(item, answer);
      saveProgress(item.subject, item.questionNo, isCorrect ? "correct" : "wrong", answer);
      if (isCorrect) {
        markWrongNoteReviewed(item.subject, item.questionNo, answer);
      } else {
        addWrongNote({
          subject: item.subject,
          questionNo: item.questionNo,
          questionId: item.id,
          chapter: item.chapter,
          questionHtml: item.questionHtml,
          status: "wrong",
          reviewStatus: "active",
          answer,
          updatedAt: new Date().toISOString()
        });
      }
      return { subject: item.subject, questionNo: item.questionNo, answer, isCorrect };
    });
    const saved = saveMockExamResult({ durationSeconds: elapsed, total: examQuestions.length, correct: graded.filter((item) => item.isCorrect).length, answers: graded });
    setResult(saved);
    setHistory(getMockExamResults());
    setPhase("finished");
  };

  if (phase === "ready") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50">
          <CardContent className="p-8 sm:p-10">
            <Badge variant="premium" className="mb-5"><FileText className="mr-1 size-4" /> 베타 회원 실전 세트</Badge>
            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">13문항 혼합 모의고사</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">SQL 5문제, Python 3문제, Java 3문제, Linux 2문제를 섞어 실전처럼 풀어봅니다. 제출 후 과목별 오답은 오답 복습센터에 자동 저장됩니다.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <Mini title="SQL" value="5" />
              <Mini title="Python" value="3" />
              <Mini title="Java" value="3" />
              <Mini title="Linux" value="2" />
            </div>
            <Button onClick={startExam} className="mt-8" size="xl" variant="premium">모의고사 시작 <ArrowRight className="size-5" /></Button>
          </CardContent>
        </Card>
        <Card><CardContent className="p-6"><Trophy className="mb-4 size-8 text-amber-500" /><h3 className="text-xl font-black text-slate-950">최근 모의고사 결과</h3>{latestScore ? <p className="mt-3 text-sm leading-6 text-slate-600">{latestScore.total}문항 중 {latestScore.correct}문항 정답 · 정답률 {toPercent(latestScore.correct, latestScore.total)}%</p> : <p className="mt-3 text-sm leading-6 text-slate-600">아직 모의고사 기록이 없습니다.</p>}</CardContent></Card>
      </div>
    );
  }

  if (phase === "finished" && result) {
    const accuracy = toPercent(result.correct, result.total);
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
          <CardContent className="p-8 sm:p-10">
            <Badge variant={accuracy >= 80 ? "success" : accuracy >= 60 ? "warning" : "danger"} className="mb-5">모의고사 결과</Badge>
            <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-950">{result.correct}/{result.total} 정답 · {accuracy}%</h2>
            <p className="mt-4 text-slate-600">소요 시간 {formatTime(result.durationSeconds)} · 틀린 문제는 오답 복습센터에 자동 저장되었습니다.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button onClick={startExam} variant="premium" size="lg"><RotateCcw className="size-4" /> 다시 시작</Button><ButtonLink href="/wrong-notes" variant="outline" size="lg">오답 복습센터로 이동</ButtonLink></div>
          </CardContent>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          {result.answers.map((item) => <Card key={`${item.subject}:${item.questionNo}`}><CardContent className="flex items-center justify-between gap-3 p-4"><div><Badge variant="outline">{subjectLabel[item.subject]}</Badge><div className="mt-2 font-black text-slate-950">{item.questionNo}번</div></div><Badge variant={item.isCorrect ? "success" : "danger"}>{item.isCorrect ? "정답" : "오답"}</Badge></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return question ? (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <Card className="overflow-hidden"><div className="h-2 bg-gradient-to-r from-blue-600 to-violet-600" /><CardContent className="space-y-6 p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><Badge variant="dark" className="mb-3">모의고사 {current + 1}/{total}</Badge><h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">{subjectLabel[question.subject]} {question.questionNo}번 · {question.chapter}</h2></div><Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge></div><div className="prose-question rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5" dangerouslySetInnerHTML={{ __html: question.questionHtml }} /><AnswerInput question={question} value={answers[questionKey(question)] ?? emptyAnswer(question)} onChange={(value) => setAnswers((prev) => ({ ...prev, [questionKey(question)]: value }))} /></CardContent></Card>
        <div className="flex items-center justify-between"><Button variant="outline" disabled={current <= 0} onClick={() => setCurrent((value) => value - 1)}>이전</Button>{current < total - 1 ? <Button variant="premium" onClick={() => setCurrent((value) => value + 1)}>다음</Button> : <Button variant="premium" onClick={finishExam}><Check className="size-4" /> 제출하기</Button>}</div>
      </section>
      <aside className="space-y-5"><Card><CardContent className="p-6"><div className="mb-4 flex items-center gap-2"><Clock3 className="size-5 text-blue-600" /><h3 className="font-black text-slate-950">진행 상황</h3></div><div className="text-3xl font-black text-slate-950">{formatTime(elapsed)}</div><div className="mt-4 flex items-center justify-between text-sm font-bold"><span>답안 작성</span><span>{progress}%</span></div><Progress value={progress} className="mt-2" /></CardContent></Card><Card><CardContent className="grid grid-cols-4 gap-2 p-4">{examQuestions.map((item, index) => <button key={questionKey(item)} onClick={() => setCurrent(index)} className={`h-10 rounded-xl border text-sm font-black ${current === index ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>{index + 1}</button>)}</CardContent></Card></aside>
    </div>
  ) : null;
}

function Mini({ title, value }: { title: string; value: string }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="text-sm font-bold text-slate-500">{title}</div><div className="mt-1 text-3xl font-black text-slate-950">{value}</div></div>;
}
