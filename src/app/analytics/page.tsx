import type { Metadata } from "next";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { ServiceAccessGate } from "@/components/service/service-access-gate";
import { getAllQuestions, getSubjects } from "@/lib/question-data";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기 약점 분석",
  description: "풀이 기록을 기준으로 프로그래밍기능사 실기 과목별 약점과 오답률을 확인하는 학습 분석 페이지입니다.",
  alternates: { canonical: "/analytics" },
  robots: { index: false, follow: false }
};


export default function AnalyticsPage() {
  const questions = Object.values(getAllQuestions()).flat();
  const subjects = getSubjects();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-blue-600">WEAKNESS ANALYSIS</div>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">약점 분석</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">풀이 기록을 기준으로 과목·단원·문제 유형별 정답률과 오답률을 확인합니다. 베타 기간에는 로그인 회원에게 무료로 제공합니다.</p>
      </div>
      <ServiceAccessGate featureName="약점 분석" description="저장된 풀이 기록을 바탕으로 취약 과목·단원·유형을 확인하는 기능입니다.">
        <AnalyticsClient questions={questions} subjects={subjects} />
      </ServiceAccessGate>
    </main>
  );
}
