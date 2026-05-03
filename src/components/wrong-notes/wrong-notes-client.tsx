"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, CheckCircle2, ExternalLink, Inbox, RefreshCw, Target, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clearWrongNotes, getWrongNotesList } from "@/lib/storage";
import type { SubjectId, WrongNote } from "@/types/question";

const subjectName: Record<SubjectId, string> = {
  sql: "SQL",
  python: "Python",
  java: "Java",
  linux: "Linux"
};

const subjectOrder: SubjectId[] = ["sql", "python", "java", "linux"];

function formatAnswer(answer: WrongNote["answer"]) {
  if (typeof answer === "string") return answer || "입력한 답안이 비어 있습니다.";

  if (Array.isArray(answer)) {
    return answer.map((row) => row.join(" | ")).join("\n") || "입력한 표 답안이 비어 있습니다.";
  }

  if (answer && typeof answer === "object" && "columns" in answer && "rows" in answer) {
    const header = answer.columns.join(" | ");
    const body = answer.rows.map((row) => row.join(" | ")).join("\n");
    return [header, body].filter(Boolean).join("\n") || "입력한 표 답안이 비어 있습니다.";
  }

  return JSON.stringify(answer, null, 2);
}

export function WrongNotesClient() {
  const [allNotes, setAllNotes] = useState<WrongNote[]>([]);
  const [showReviewed, setShowReviewed] = useState(false);

  const refresh = () => setAllNotes(getWrongNotesList({ includeReviewed: true }));

  useEffect(() => {
    refresh();
  }, []);

  const handleClear = () => {
    clearWrongNotes();
    refresh();
  };

  const activeNotes = useMemo(() => allNotes.filter((note) => note.reviewStatus !== "reviewed"), [allNotes]);
  const reviewedNotes = useMemo(() => allNotes.filter((note) => note.reviewStatus === "reviewed"), [allNotes]);
  const visibleNotes = showReviewed ? allNotes : activeNotes;

  const countBySubject = useMemo(() => {
    return activeNotes.reduce<Record<SubjectId, number>>((acc, note) => {
      acc[note.subject] += 1;
      return acc;
    }, { sql: 0, python: 0, java: 0, linux: 0 });
  }, [activeNotes]);

  const mostWrongSubject = useMemo(() => {
    return subjectOrder.reduce((top, current) => (countBySubject[current] > countBySubject[top] ? current : top), "sql" as SubjectId);
  }, [countBySubject]);

  const latest = activeNotes[0];

  if (!allNotes.length) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
          <div className="mb-5 flex size-16 items-center justify-center rounded-[1.75rem] bg-blue-50 text-blue-700">
            <Inbox className="size-8" />
          </div>
          <Badge variant="outline" className="mb-4">복습할 오답 없음</Badge>
          <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950">아직 저장된 오답이 없습니다.</h2>
          <p className="mt-3 max-w-xl text-slate-600">문제를 풀고 틀린 답안을 제출하면 이곳에 자동으로 저장됩니다.</p>
          <ButtonLink href="/subjects" className="mt-8" variant="premium" size="lg">과목 선택하기 <ArrowRight className="size-4" /></ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6 pt-7">
            <BarChart3 className="mb-5 size-7 text-blue-600" />
            <div className="text-4xl font-black tracking-[-0.05em] text-slate-950">{activeNotes.length}</div>
            <div className="mt-1 text-sm font-bold text-slate-500">복습 필요</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardContent className="p-6 pt-7">
            <CheckCircle2 className="mb-5 size-7 text-emerald-600" />
            <div className="text-4xl font-black tracking-[-0.05em] text-slate-950">{reviewedNotes.length}</div>
            <div className="mt-1 text-sm font-bold text-slate-500">복습 완료</div>
          </CardContent>
        </Card>
        {subjectOrder.map((subject) => (
          <Card key={subject}>
            <CardContent className="p-6 pt-7">
              <Badge variant="outline" className="mb-5 mt-1">{subjectName[subject]}</Badge>
              <div className="text-3xl font-black text-slate-950">{countBySubject[subject]}</div>
              <div className="mt-1 text-sm font-bold text-slate-500">복습 필요</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <CardContent className="grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge variant="premium" className="mb-4"><Target className="mr-1 size-4" /> 오늘의 추천 복습</Badge>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
              {activeNotes.length ? `${subjectName[mostWrongSubject]} 오답부터 정리해보세요` : "복습이 모두 완료되었습니다"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {latest
                ? `최근 틀린 문제는 ${subjectName[latest.subject]} ${latest.questionNo}번입니다. 다시 풀어 정답 처리하면 복습 완료로 이동합니다.`
                : "완료된 오답은 아래 버튼을 눌러 다시 확인할 수 있습니다."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            {latest ? (
              <ButtonLink href={`/practice/${latest.subject}?q=${latest.questionNo}`} variant="premium" size="lg">
                추천 문제 다시 풀기 <ExternalLink className="size-4" />
              </ButtonLink>
            ) : null}
            <Button variant="outline" onClick={() => setShowReviewed((value) => !value)} size="lg">
              {showReviewed ? "완료 숨기기" : "완료된 오답 보기"}
            </Button>
            <Button variant="outline" onClick={handleClear} size="lg"><Trash2 className="size-4" /> 전체 삭제</Button>
          </div>
        </CardContent>
      </Card>

      {!visibleNotes.length ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Badge variant="success" className="mb-4">복습 완료</Badge>
            <h3 className="text-2xl font-black tracking-[-0.04em] text-slate-950">현재 표시할 오답이 없습니다.</h3>
            <p className="mt-2 text-sm text-slate-600">완료된 오답까지 보고 싶다면 “완료된 오답 보기”를 선택하세요.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleNotes.map((note) => {
            const reviewed = note.reviewStatus === "reviewed";
            return (
              <Card key={`${note.subject}:${note.questionNo}`} className="overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/80 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="premium">{subjectName[note.subject]}</Badge>
                      <Badge variant="outline">{note.questionNo}번</Badge>
                      <Badge variant="secondary">{note.chapter}</Badge>
                      <Badge variant={reviewed ? "success" : "danger"}>{reviewed ? "복습 완료" : "미복습"}</Badge>
                      <Badge variant="outline">틀린 횟수 {note.wrongCount ?? 1}회</Badge>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{new Date(note.updatedAt).toLocaleString("ko-KR")}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">{subjectName[note.subject]} {note.questionNo}번 다시 풀기</h3>
                </div>
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="prose-question rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-inner" dangerouslySetInnerHTML={{ __html: note.questionHtml }} />
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className={reviewed ? "rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-800" : "rounded-[1.5rem] border border-red-100 bg-red-50 p-5 text-sm text-red-800"}>
                      <div className="flex items-center gap-2 font-black"><RefreshCw className="size-4" /> {reviewed ? "복습 완료 답안" : "내가 입력한 답안"}</div>
                      <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-6">{formatAnswer(note.answer)}</pre>
                    </div>
                    <ButtonLink href={`/practice/${note.subject}?q=${note.questionNo}`} variant="premium" size="lg">
                      다시 풀기 <ExternalLink className="size-4" />
                    </ButtonLink>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
