"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, ListChecks, Target, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProgress } from "@/lib/storage";
import { getQuestionTypeLabel } from "@/lib/question-labels";
import { getQuestionKey, getWeakAreas, subjectLabel } from "@/lib/learning-analytics";
import { toPercent } from "@/lib/utils";
import type { ProgressItem, Question, SubjectId, SubjectMeta } from "@/types/question";

type Props = { questions: Question[]; subjects: SubjectMeta[] };

type Group = { key: string; title: string; subtitle: string; solved: number; correct: number; wrong: number; href?: string };

export function AnalyticsClient({ questions, subjects }: Props) {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

  useEffect(() => setProgressItems(Object.values(getProgress())), []);

  const questionMap = useMemo(() => new Map(questions.map((question) => [getQuestionKey(question.subject, question.questionNo), question])), [questions]);
  const solved = progressItems.length;
  const correct = progressItems.filter((item) => item.status === "correct").length;
  const wrong = progressItems.filter((item) => item.status === "wrong").length;
  const accuracy = solved ? toPercent(correct, solved) : 0;
  const weakAreas = useMemo(() => getWeakAreas(questions, progressItems, 8), [progressItems, questions]);

  const subjectGroups: Group[] = subjects.map((subject) => {
    const items = progressItems.filter((item) => item.subject === subject.id);
    const correctCount = items.filter((item) => item.status === "correct").length;
    return { key: subject.id, title: subject.name, subtitle: `${items.length}/${subject.total}문항 풀이`, solved: items.length, correct: correctCount, wrong: items.length - correctCount, href: `/practice/${subject.id}` };
  });

  const typeGroups = useMemo(() => {
    const map = new Map<string, Group>();
    for (const item of progressItems) {
      const question = questionMap.get(getQuestionKey(item.subject, item.questionNo));
      if (!question) continue;
      const key = question.type;
      const group = map.get(key) ?? { key, title: getQuestionTypeLabel(key as any), subtitle: "문제 유형", solved: 0, correct: 0, wrong: 0 };
      group.solved += 1;
      if (item.status === "correct") group.correct += 1;
      if (item.status === "wrong") group.wrong += 1;
      map.set(key, group);
    }
    return Array.from(map.values()).sort((a, b) => b.wrong - a.wrong);
  }, [progressItems, questionMap]);

  if (!solved) {
    return (
      <Card>
        <CardContent className="px-6 py-16 text-center">
          <Target className="mx-auto mb-5 size-12 text-blue-600" />
          <Badge variant="outline" className="mb-4">분석 대기</Badge>
          <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950">아직 분석할 풀이 기록이 없습니다.</h2>
          <p className="mt-3 text-slate-600">문제를 몇 개 풀면 과목·단원·유형별 약점이 자동으로 표시됩니다.</p>
          <ButtonLink href="/subjects" className="mt-8" variant="premium" size="lg">문제 풀러 가기</ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={ListChecks} label="풀이 완료" value={solved} tone="blue" />
        <Stat icon={CheckCircle2} label="정답" value={correct} tone="emerald" />
        <Stat icon={XCircle} label="오답" value={wrong} tone="red" />
        <Stat icon={BarChart3} label="누적 정답률" value={`${accuracy}%`} tone="violet" />
      </div>

      <Card className="overflow-hidden border-red-100 bg-gradient-to-br from-red-50 via-white to-amber-50">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2"><AlertTriangle className="size-5 text-red-600" /><h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">우선 복습할 약점 영역</h2></div>
          {!weakAreas.length ? <p className="text-sm text-slate-600">아직 뚜렷한 약점 영역이 없습니다. 더 많은 문제를 풀면 분석이 정교해집니다.</p> : (
            <div className="grid gap-3 md:grid-cols-2">
              {weakAreas.map((area) => (
                <div key={`${area.subject}:${area.chapter}:${area.type}`} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-red-100">
                  <div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="danger">오답률 {area.wrongRate}%</Badge><Badge variant="outline">{subjectLabel[area.subject]}</Badge><Badge variant="secondary">{getQuestionTypeLabel(area.type as any)}</Badge></div>
                  <h3 className="font-black text-slate-950">{area.chapter}</h3>
                  <p className="mt-2 text-sm text-slate-600">{area.solved}문항 중 {area.wrong}문항 오답 · 정답률 {area.accuracy}%</p>
                  <ButtonLink href={`/practice/${area.subject}`} className="mt-4" size="sm" variant="outline">해당 과목 복습</ButtonLink>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <GroupCard title="과목별 학습 현황" groups={subjectGroups} />
        <GroupCard title="유형별 정답률" groups={typeGroups} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string | number; tone: string }) {
  const className = tone === "emerald" ? "bg-emerald-50 text-emerald-700" : tone === "red" ? "bg-red-50 text-red-700" : tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700";
  return <Card><CardContent className="p-5"><div className={`mb-4 flex size-11 items-center justify-center rounded-2xl ${className}`}><Icon className="size-5" /></div><div className="text-3xl font-black text-slate-950">{value}</div><div className="mt-1 text-sm font-bold text-slate-500">{label}</div></CardContent></Card>;
}

function GroupCard({ title, groups }: { title: string; groups: Group[] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-5 text-xl font-black text-slate-950">{title}</h2>
        {!groups.length ? <p className="rounded-3xl bg-slate-50 p-6 text-sm font-bold text-slate-500">표시할 데이터가 없습니다.</p> : (
          <div className="space-y-4">
            {groups.map((group) => {
              const accuracy = group.solved ? Math.round((group.correct / group.solved) * 100) : 0;
              return <div key={group.key} className="rounded-3xl border border-slate-100 bg-slate-50 p-4"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="font-black text-slate-950">{group.title}</div><div className="text-xs font-semibold text-slate-500">{group.subtitle}</div></div><Badge variant={accuracy >= 80 ? "success" : accuracy >= 60 ? "warning" : "danger"}>{accuracy}%</Badge></div><Progress value={accuracy} /></div>;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
