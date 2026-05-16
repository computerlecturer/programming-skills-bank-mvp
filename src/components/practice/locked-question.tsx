import { LockKeyhole, LogIn, RotateCcw, Sparkles, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FREE_LIMIT_PER_SUBJECT } from "@/lib/constants";
import type { SubjectMeta } from "@/types/question";

export function LockedQuestion({ subject, questionNo }: { subject: SubjectMeta; questionNo: number }) {
  return (
    <Card className="overflow-hidden border-amber-100 bg-gradient-to-br from-amber-50 via-white to-blue-50 shadow-none">
      <CardContent className="px-6 py-12 text-center sm:px-10 sm:py-16">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/20">
          <LockKeyhole className="size-9" />
        </div>
        <Badge variant="warning" className="mb-5"><Sparkles className="mr-1 size-4" /> 51번 이후는 회원 전용</Badge>
        <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
          {subject.label} {questionNo}번부터는 로그인 후 이어서 학습할 수 있습니다.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          지금까지 무료 공개 범위인 과목별 {FREE_LIMIT_PER_SUBJECT}문항을 학습했습니다. 베타 기간에는 회원가입만 하면 전체 620문항, 오답노트, 학습 진행률, 실전모드 기록을 무료로 이용할 수 있습니다.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="text-2xl font-black text-slate-950">50문항</div>
            <div className="mt-1 text-sm font-bold text-slate-500">비회원 무료 체험</div>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="text-2xl font-black text-slate-950">620문항</div>
            <div className="mt-1 text-sm font-bold text-slate-500">베타 회원 전체 이용</div>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="text-2xl font-black text-slate-950">학습기록</div>
            <div className="mt-1 text-sm font-bold text-slate-500">오답·북마크 저장</div>
          </div>
        </div>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/signup" size="xl" variant="premium"><UserPlus className="size-5" /> 무료 회원가입하기</ButtonLink>
          <ButtonLink href="/login" size="xl" variant="outline"><LogIn className="size-5" /> 로그인하기</ButtonLink>
          <ButtonLink href={`/practice/${subject.id}?q=${Math.min(questionNo - 1, FREE_LIMIT_PER_SUBJECT)}`} size="xl" variant="ghost"><RotateCcw className="size-5" /> 1~50번 복습하기</ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
