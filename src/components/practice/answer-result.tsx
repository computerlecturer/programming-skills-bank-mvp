"use client";

import { CheckCircle2, Lightbulb, ShieldCheck, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDisplayAnswer } from "@/lib/grading";
import type { PracticeMode, Question, TableAnswer } from "@/types/question";

function isTableAnswer(value: string | TableAnswer): value is TableAnswer {
  return typeof value === "object" && value !== null && "columns" in value && "rows" in value;
}

export function AnswerResult({ question, isCorrect, mode }: { question: Question; isCorrect: boolean; mode: PracticeMode }) {
  if (!isCorrect) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white shadow-none">
        <CardContent className="flex gap-4 p-5 text-red-800 sm:p-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-100">
            <XCircle className="size-6" />
          </div>
          <div>
            <div className="text-lg font-black">오답입니다.</div>
            <p className="mt-1 text-sm leading-6 text-red-700/85">
              오답 복습센터에 저장되었습니다. 다시 풀어서 맞히면 복습 완료로 처리됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === "exam") {
    return (
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-none">
        <CardContent className="flex gap-4 p-5 text-emerald-900 sm:p-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <Badge variant="success" className="mb-2">실전 모드 채점</Badge>
            <div className="text-lg font-black text-slate-950">정답입니다.</div>
            <p className="mt-1 text-sm leading-6 text-emerald-800/85">
              실전 모드에서는 정답 여부만 바로 확인합니다. 자세한 해설은 학습 모드에서 확인할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const answer = getDisplayAnswer(question);

  return (
    <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-none">
      <CardContent className="space-y-5 p-5 text-emerald-950 sm:p-6">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <CheckCircle2 className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <Badge variant="success" className="mb-2">학습 모드 해설</Badge>
            <div className="text-xl font-black tracking-[-0.03em] text-slate-950">정답입니다. 해설을 확인하세요.</div>
            {typeof answer === "string" ? (
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-emerald-100">{answer}</pre>
            ) : isTableAnswer(answer) ? (
              <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
                <table className="w-full min-w-[320px] text-sm">
                  {answer.columns.length ? (
                    <thead>
                      <tr className="bg-emerald-50 text-emerald-900">
                        {answer.columns.map((column, index) => (
                          <th className="border-b border-emerald-100 px-3 py-2 text-left font-black" key={`${column}-${index}`}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                  ) : null}
                  <tbody>
                    {answer.rows.map((row, index) => (
                      <tr key={index}>
                        {row.map((cell, cellIndex) => <td className="border-b border-emerald-50 px-3 py-2 font-semibold text-slate-900" key={cellIndex}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 text-slate-800 shadow-sm ring-1 ring-emerald-100">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><Lightbulb className="size-4 text-amber-500" /> 해설</div>
          <div className="prose-question" dangerouslySetInnerHTML={{ __html: question.explanationHtml }} />
        </div>
      </CardContent>
    </Card>
  );
}
