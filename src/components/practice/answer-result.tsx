"use client";

import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw, ShieldCheck, UserCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDisplayAnswer } from "@/lib/grading";
import type { PracticeMode, Question, TableAnswer, UserAnswer } from "@/types/question";

function isTableAnswer(value: string | TableAnswer): value is TableAnswer {
  return typeof value === "object" && value !== null && "columns" in value && "rows" in value;
}

function formatUserAnswer(answer?: UserAnswer) {
  if (answer === undefined) return "아직 저장된 답안이 없습니다.";
  if (typeof answer === "string") return answer.trim() || "(빈 답안)";
  if (Array.isArray(answer)) return answer.map((row) => row.join("\t")).join("\n") || "(빈 답안)";
  const columns = answer.columns?.length ? `${answer.columns.join("\t")}\n` : "";
  const rows = answer.rows?.map((row) => row.join("\t")).join("\n") ?? "";
  return `${columns}${rows}`.trim() || "(빈 답안)";
}

function SubmittedAnswerBox({ answer }: { answer?: UserAnswer }) {
  return (
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-600">
        <UserCheck className="size-4 text-blue-600" /> 내가 제출한 답
      </div>
      <pre className="whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-950">{formatUserAnswer(answer)}</pre>
    </div>
  );
}

function AnswerBlock({ question, tone }: { question: Question; tone: "emerald" | "red" }) {
  const answer = getDisplayAnswer(question);
  const headerClass = tone === "emerald" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900";
  const ringClass = tone === "emerald" ? "ring-emerald-100" : "ring-red-100";
  const borderClass = tone === "emerald" ? "border-emerald-50" : "border-red-50";

  if (typeof answer === "string") {
    return <pre className={`mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ${ringClass}`}>{answer}</pre>;
  }

  if (!isTableAnswer(answer)) return null;

  return (
    <div className={`mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ${ringClass}`}>
      <table className="w-full min-w-[320px] text-sm">
        {answer.columns.length ? (
          <thead>
            <tr className={headerClass}>
              {answer.columns.map((column, index) => (
                <th className={`border-b px-3 py-2 text-left font-black ${borderClass}`} key={`${column}-${index}`}>{column}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {answer.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td className={`border-b px-3 py-2 font-semibold text-slate-900 ${borderClass}`} key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AnswerResultProps = {
  question: Question;
  isCorrect: boolean;
  mode: PracticeMode;
  userAnswer?: UserAnswer;
  onRetry?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
};

export function AnswerResult({ question, isCorrect, mode, userAnswer, onRetry, onNext, canGoNext }: AnswerResultProps) {
  if (!isCorrect) {
    if (mode === "exam") {
      return (
        <Card className="border-red-200 bg-red-50/75 shadow-none">
          <CardContent className="space-y-5 p-5 text-red-900 sm:p-6">
            <div className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <XCircle className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge variant="danger" className="mb-2">실전 모드 채점</Badge>
                <div className="text-xl font-black tracking-[-0.03em] text-slate-950">오답입니다.</div>
                <p className="mt-1 text-sm font-semibold leading-6 text-red-700/85">정답과 해설은 실전 완료 후 복습할 때 확인하세요. 지금은 내가 제출한 답만 확인하고 다음 문제로 이동합니다.</p>
                <SubmittedAnswerBox answer={userAnswer} />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {onRetry ? <Button type="button" variant="outline" onClick={onRetry}><RotateCcw className="size-4" /> 다시 풀기</Button> : null}
              {onNext ? <Button type="button" variant="dark" onClick={onNext} disabled={!canGoNext}>다음 문제 <ArrowRight className="size-4" /></Button> : null}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="overflow-hidden border-red-200 bg-red-50/75 shadow-none">
        <CardContent className="space-y-5 p-5 text-red-900 sm:p-6">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <XCircle className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge variant="danger" className="mb-2">학습 모드 채점</Badge>
              <div className="text-xl font-black tracking-[-0.03em] text-slate-950">제출한 답이 정답과 다릅니다.</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-red-700/85">오답노트에 저장되었습니다. 정답과 해설을 확인한 뒤 다시 풀어보세요.</p>
              <SubmittedAnswerBox answer={userAnswer} />
              <AnswerBlock question={question} tone="red" />
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 text-slate-800 shadow-sm ring-1 ring-red-100">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><Lightbulb className="size-4 text-amber-500" /> 해설</div>
            <div className="prose-question" dangerouslySetInnerHTML={{ __html: question.explanationHtml }} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {onRetry ? <Button type="button" variant="outline" onClick={onRetry}><RotateCcw className="size-4" /> 다시 풀기</Button> : null}
            {onNext ? <Button type="button" variant="dark" onClick={onNext} disabled={!canGoNext}>다음 문제 <ArrowRight className="size-4" /></Button> : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === "exam") {
    return (
      <Card className="border-emerald-200 bg-emerald-50/75 shadow-none">
        <CardContent className="space-y-5 p-5 text-emerald-900 sm:p-6">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <ShieldCheck className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge variant="success" className="mb-2">실전 모드 채점</Badge>
              <div className="text-xl font-black tracking-[-0.03em] text-slate-950">정답입니다.</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800/85">제출한 답을 확인한 뒤 다음 문제로 이동하세요. 자세한 해설은 실전 완료 후 복습 화면에서 확인하는 흐름을 권장합니다.</p>
              <SubmittedAnswerBox answer={userAnswer} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {onRetry ? <Button type="button" variant="outline" onClick={onRetry}><RotateCcw className="size-4" /> 다시 풀기</Button> : null}
            {onNext ? <Button type="button" variant="dark" onClick={onNext} disabled={!canGoNext}>다음 문제 <ArrowRight className="size-4" /></Button> : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-emerald-200 bg-emerald-50/75 shadow-none">
      <CardContent className="space-y-5 p-5 text-emerald-950 sm:p-6">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <CheckCircle2 className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <Badge variant="success" className="mb-2">학습 모드 채점</Badge>
            <div className="text-xl font-black tracking-[-0.03em] text-slate-950">정답입니다.</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800/85">직접 맞힌 문제로 기록되었습니다. 정답과 해설을 확인한 뒤 다음 문제로 넘어가세요.</p>
            <SubmittedAnswerBox answer={userAnswer} />
            <AnswerBlock question={question} tone="emerald" />
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 text-slate-800 shadow-sm ring-1 ring-emerald-100">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><Lightbulb className="size-4 text-amber-500" /> 해설</div>
          <div className="prose-question" dangerouslySetInnerHTML={{ __html: question.explanationHtml }} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onRetry ? <Button type="button" variant="outline" onClick={onRetry}><RotateCcw className="size-4" /> 다시 풀기</Button> : null}
          {onNext ? <Button type="button" variant="dark" onClick={onNext} disabled={!canGoNext}>다음 문제 <ArrowRight className="size-4" /></Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}
