"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Flag, NotebookPen, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFavoritesList, getIssueReports, getMemosList } from "@/lib/storage";
import { getQuestionKey, stripHtml, subjectLabel } from "@/lib/learning-analytics";
import type { FavoriteQuestion, IssueReport, Question, QuestionMemo } from "@/types/question";

type Props = { questions: Question[] };

export function MyStudyClient({ questions }: Props) {
  const [favorites, setFavorites] = useState<FavoriteQuestion[]>([]);
  const [memos, setMemos] = useState<QuestionMemo[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);

  useEffect(() => {
    setFavorites(getFavoritesList());
    setMemos(getMemosList());
    setReports(getIssueReports());
  }, []);

  const questionMap = useMemo(() => new Map(questions.map((question) => [getQuestionKey(question.subject, question.questionNo), question])), [questions]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-2"><Star className="size-5 text-amber-500" /><h2 className="text-xl font-black text-slate-950">다시 볼 문제</h2><Badge variant="warning">{favorites.length}</Badge></div>
          {!favorites.length ? <Empty label="즐겨찾기한 문제가 없습니다." /> : (
            <div className="space-y-3">
              {favorites.map((item) => {
                const question = questionMap.get(getQuestionKey(item.subject, item.questionNo));
                return <StudyItem key={getQuestionKey(item.subject, item.questionNo)} href={`/practice/${item.subject}?q=${item.questionNo}`} badge={subjectLabel[item.subject]} title={`${subjectLabel[item.subject]} ${item.questionNo}번`} description={question ? stripHtml(question.questionHtml).slice(0, 90) : "저장된 문제"} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-2"><NotebookPen className="size-5 text-blue-600" /><h2 className="text-xl font-black text-slate-950">내 메모</h2><Badge variant="premium">{memos.length}</Badge></div>
          {!memos.length ? <Empty label="저장한 메모가 없습니다." /> : (
            <div className="space-y-3">
              {memos.map((item) => <StudyItem key={getQuestionKey(item.subject, item.questionNo)} href={`/practice/${item.subject}?q=${item.questionNo}`} badge={subjectLabel[item.subject]} title={`${subjectLabel[item.subject]} ${item.questionNo}번 메모`} description={item.memo} />)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-2"><Flag className="size-5 text-red-600" /><h2 className="text-xl font-black text-slate-950">오류 제보 기록</h2><Badge variant="danger">{reports.length}</Badge></div>
          {!reports.length ? <Empty label="저장한 오류 제보가 없습니다." /> : (
            <div className="space-y-3">
              {reports.map((item) => <StudyItem key={item.id} href={`/practice/${item.subject}?q=${item.questionNo}`} badge={item.type} title={`${subjectLabel[item.subject]} ${item.questionNo}번`} description={item.message} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">{label}</div>;
}

function StudyItem({ href, badge, title, description }: { href: string; badge: string; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-2"><Badge variant="outline">{badge}</Badge><Bookmark className="size-4 text-slate-300" /></div>
      <div className="font-black text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <ButtonLink href={href} className="mt-3 w-full" size="sm" variant="outline">문제로 이동</ButtonLink>
    </div>
  );
}
