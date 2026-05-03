"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock3, NotebookTabs, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLastQuestion, getProgress, getSubjectProgress, getWrongNotesList } from "@/lib/storage";
import { getTodayRecommendations, subjectLabel } from "@/lib/learning-analytics";
import { toPercent } from "@/lib/utils";
import type { ProgressItem, Question, SubjectId, SubjectMeta } from "@/types/question";

type DashboardState = {
  solved: number;
  correct: number;
  wrong: number;
  lastSubject: SubjectId;
  lastQuestion: number;
  progressItems: ProgressItem[];
};

export function HomeStudyDashboard({ subjects, questions }: { subjects: SubjectMeta[]; questions: Question[] }) {
  const [state, setState] = useState<DashboardState>({
    solved: 0,
    correct: 0,
    wrong: 0,
    lastSubject: "sql",
    lastQuestion: 1,
    progressItems: []
  });

  useEffect(() => {
    const progressItems = Object.values(getProgress());
    const sorted = [...progressItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const latest = sorted[0];
    const fallbackSubject = subjects[0]?.id ?? "sql";
    const lastSubject = latest?.subject ?? fallbackSubject;

    setState({
      solved: progressItems.length,
      correct: progressItems.filter((item) => item.status === "correct").length,
      wrong: getWrongNotesList().length,
      lastSubject,
      lastQuestion: getLastQuestion(lastSubject),
      progressItems
    });
  }, [subjects]);

  const total = useMemo(() => subjects.reduce((sum, subject) => sum + subject.total, 0), [subjects]);
  const accuracy = state.solved ? toPercent(state.correct, state.solved) : 0;
  const progress = toPercent(state.solved, total);
  const continueHref = `/practice/${state.lastSubject}?q=${state.lastQuestion}`;
  const recommendation = getTodayRecommendations(questions, state.progressItems, state.wrong);

  return (
    <Card className="relative overflow-hidden border-white/10 bg-white/[0.08] text-white shadow-[0_30px_90px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="premium" className="mb-4">나의 학습 현황</Badge>
            <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">오늘 이어서 학습할 위치</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">최근 학습 기록과 오답을 기준으로 다음 학습을 추천합니다.</p>
          </div>
          <div className="hidden size-14 items-center justify-center rounded-2xl bg-white/10 text-blue-200 sm:flex">
            <Target className="size-7" />
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-slate-950/80 p-5 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-bold text-blue-300">최근 학습</div>
              <div className="mt-1 text-2xl font-black">{subjectLabel[state.lastSubject]} {state.lastQuestion}번부터</div>
            </div>
            <ButtonLink href={continueHref} variant="premium" size="lg">
              이어 학습하기 <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl bg-white p-4 text-slate-950">
            <BookOpenCheck className="mb-3 size-5 text-blue-600" />
            <div className="text-2xl font-black">{state.solved}</div>
            <div className="text-xs font-bold text-slate-500">풀이 완료</div>
          </div>
          <div className="rounded-3xl bg-white p-4 text-slate-950">
            <CheckCircle2 className="mb-3 size-5 text-emerald-600" />
            <div className="text-2xl font-black">{accuracy}%</div>
            <div className="text-xs font-bold text-slate-500">누적 정답률</div>
          </div>
          <div className="rounded-3xl bg-white p-4 text-slate-950">
            <NotebookTabs className="mb-3 size-5 text-red-600" />
            <div className="text-2xl font-black">{state.wrong}</div>
            <div className="text-xs font-bold text-slate-500">복습 필요</div>
          </div>
          <div className="rounded-3xl bg-white p-4 text-slate-950">
            <Clock3 className="mb-3 size-5 text-violet-600" />
            <div className="text-2xl font-black">10</div>
            <div className="text-xs font-bold text-slate-500">오늘 추천</div>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 text-slate-950">
          <div className="mb-3 flex items-center justify-between text-sm font-black">
            <span>전체 학습 진도</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
          <div className="mt-5 rounded-2xl bg-blue-50 p-4">
            <div className="text-sm font-black text-blue-900">오늘의 학습 추천</div>
            <p className="mt-2 text-sm leading-6 text-blue-800">{recommendation.primaryText}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-blue-700/75">{recommendation.secondaryText}</p>
            <ButtonLink href={recommendation.href} className="mt-4 text-white hover:text-white" variant="premium" size="sm">
              {recommendation.buttonLabel} <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
