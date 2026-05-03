import type { Metadata } from "next";
import { ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, LockKeyhole, Route } from "lucide-react";
import { SubjectCard } from "@/components/subject/subject-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSubjects } from "@/lib/question-data";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기 과목별 문제 | SQL·Python·Java·Linux",
  description: "프로그래밍기능사 실기 대비 SQL 200제, Python 150제, Java 150제, Linux 120제를 과목별로 학습하는 문제은행입니다.",
  alternates: { canonical: "/subjects" },
  openGraph: {
    title: "프로그래밍기능사 실기 과목별 문제",
    description: "SQL·Python·Java·Linux 실전형 문제를 과목별로 풀어보세요."
  }
};


export default function SubjectsPage() {
  const subjects = getSubjects();
  const total = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const free = subjects.reduce((sum, subject) => sum + subject.freeCount, 0);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.28),transparent_30rem),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.22),transparent_26rem)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Badge variant="premium" className="mb-5">과목별 문제은행</Badge>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">과목 선택</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                SQL, Python, Java, Linux 중 원하는 과목을 선택해 학습을 시작하세요. 비회원은 과목별 50문항까지 무료 체험할 수 있고, 회원가입하면 베타 기간 동안 전체 문제를 무료로 이용할 수 있습니다.
              </p>
            </div>
            <Card className="border-white/10 bg-white/10 text-white ring-1 ring-white/10">
              <CardContent className="grid grid-cols-3 gap-3 p-5">
                <div className="rounded-2xl bg-white/10 p-4">
                  <BookOpenCheck className="mb-3 size-5 text-blue-300" />
                  <div className="text-2xl font-black">4</div>
                  <div className="text-xs font-bold text-slate-400">과목</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <BarChart3 className="mb-3 size-5 text-emerald-300" />
                  <div className="text-2xl font-black">{total}</div>
                  <div className="text-xs font-bold text-slate-400">전체</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <CheckCircle2 className="mb-3 size-5 text-violet-300" />
                  <div className="text-2xl font-black">{free}</div>
                  <div className="text-xs font-bold text-slate-400">무료</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-blue-700"><Route className="size-4" /> 추천 학습 순서</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">원하는 과목부터 바로 시작하세요</h2>
            <p className="mt-3 text-slate-600">처음이라면 SQL 또는 Python부터 시작한 뒤 Java, Linux로 확장하는 흐름을 추천합니다.</p>
          </div>
          <ButtonLink href="/wrong-notes" variant="outline" size="lg">오답노트 보기 <ArrowRight className="size-4" /></ButtonLink>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <LockKeyhole className="mb-4 size-7 text-amber-600" />
              <h3 className="text-lg font-black text-slate-950">51번부터 잠금</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">각 과목은 50번까지 비회원에게 공개되고, 51번 이후 문항은 회원가입 안내 화면으로 연결됩니다.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CheckCircle2 className="mb-4 size-7 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-950">정답 후 해설 공개</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">정답을 맞히면 해설을 확인할 수 있어 문제풀이와 복습 흐름이 자연스럽게 이어집니다.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <BarChart3 className="mb-4 size-7 text-blue-600" />
              <h3 className="text-lg font-black text-slate-950">학습기록 저장 준비</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">현재 브라우저 기준 학습기록을 저장하며, 추후 Supabase 연결 시 로그인 기반 저장 구조로 확장됩니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
