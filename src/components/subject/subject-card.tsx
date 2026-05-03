"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookMarked, CheckCircle2, Database, PlayCircle, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { subjectColorClass } from "@/components/subject/subject-color";
import { getLastQuestion, getSubjectProgress } from "@/lib/storage";
import { toPercent } from "@/lib/utils";
import type { SubjectMeta } from "@/types/question";

const subjectIcon: Record<string, string> = {
  SQL: "DB",
  Python: "PY",
  Java: "JV",
  Linux: "LX"
};

export function SubjectCard({ subject }: { subject: SubjectMeta }) {
  const [solved, setSolved] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lastQuestion, setLastQuestion] = useState(1);
  const color = subjectColorClass[subject.color];

  useEffect(() => {
    const progress = getSubjectProgress(subject.id);
    setSolved(progress.length);
    setCorrect(progress.filter((item) => item.status === "correct").length);
    setLastQuestion(getLastQuestion(subject.id));
  }, [subject.id]);

  const percent = toPercent(solved, subject.total);
  const accuracy = useMemo(() => (solved ? toPercent(correct, solved) : 0), [correct, solved]);

  return (
    <Card className="group relative overflow-hidden border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color.gradient}`} />
      <div className={`absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br ${color.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`} />
      <CardContent className="relative space-y-5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color.gradient} text-base font-black text-white shadow-lg ${color.glow}`}>
            {subjectIcon[subject.name] ?? subject.name.slice(0, 2)}
          </div>
          <Badge className={color.soft} variant="outline">무료 {subject.freeCount}문항</Badge>
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            <BookMarked className="size-4" /> {subject.name}
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950">{subject.label}</h3>
          <p className="mt-3 min-h-[60px] text-sm leading-6 text-slate-600">{subject.description}</p>
        </div>

        <div className="rounded-[1.65rem] border border-slate-100 bg-slate-50 p-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-500">최근 학습 위치</div>
              <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{lastQuestion}번</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500">정답률</div>
              <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{accuracy}%</div>
            </div>
          </div>
          <Progress value={percent} indicatorClassName={`bg-gradient-to-r ${color.progress}`} />
          <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500">
            <span>{solved}/{subject.total}문항 풀이</span>
            <span>진도 {percent}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <Database className="mb-2 size-4 text-slate-400" />
            <div className="text-lg font-black text-slate-950">{subject.total}</div>
            <div className="text-[11px] font-bold text-slate-500">전체 문항</div>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <CheckCircle2 className="mb-2 size-4 text-slate-400" />
            <div className="text-lg font-black text-slate-950">{correct}</div>
            <div className="text-[11px] font-bold text-slate-500">맞힌 문제</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <ButtonLink href={`/practice/${subject.id}?q=${lastQuestion}`} variant="premium" size="lg" className="w-full !text-white [&_svg]:!text-white">
            <PlayCircle className="size-5" /> 학습 이어가기
          </ButtonLink>
          <ButtonLink href={`/practice/${subject.id}?q=1`} variant="ghost" size="lg" className="w-full text-slate-600 hover:bg-slate-100 hover:text-slate-950">
            <RotateCcw className="size-4" /> 처음부터 풀기 <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
