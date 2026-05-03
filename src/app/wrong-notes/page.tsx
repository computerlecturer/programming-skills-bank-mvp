import type { Metadata } from "next";
import { NotebookTabs, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WrongNotesClient } from "@/components/wrong-notes/wrong-notes-client";
import { ServiceAccessGate } from "@/components/service/service-access-gate";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기 오답노트",
  description: "프로그래밍기능사 실기 문제풀이에서 틀린 문제를 자동으로 모아 다시 복습할 수 있는 오답노트입니다.",
  alternates: { canonical: "/wrong-notes" },
  robots: { index: false, follow: false }
};


export default function WrongNotesPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(37,99,235,0.28),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(168,85,247,0.22),transparent_26rem)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <Badge variant="premium" className="mb-5"><NotebookTabs className="mr-1 size-4" /> 오답 복습센터</Badge>
          <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">틀린 문제를 다시 맞히는 공간</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            틀린 문제는 자동으로 저장됩니다. 다시 풀어 정답 처리하면 복습 완료로 이동되어 학습 이력을 관리할 수 있습니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><Sparkles className="size-4 text-blue-300" /> 베타 회원 저장</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><RotateCcw className="size-4 text-emerald-300" /> 다시 맞히면 복습 완료</span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <ServiceAccessGate featureName="오답노트" description="틀린 문제를 저장하고 시험 전 다시 풀 수 있도록 관리하는 기능입니다.">
          <WrongNotesClient />
        </ServiceAccessGate>
      </section>
    </main>
  );
}
