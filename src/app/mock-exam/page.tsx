import type { Metadata } from "next";
import { MockExamClient } from "@/components/mock-exam/mock-exam-client";
import { ServiceAccessGate } from "@/components/service/service-access-gate";
import { getAllQuestions } from "@/lib/question-data";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기 모의고사",
  description: "SQL, Python, Java, Linux 문제를 섞어 제한 시간 안에 풀어보는 프로그래밍기능사 실기 모의고사 페이지입니다.",
  alternates: { canonical: "/mock-exam" },
  openGraph: {
    title: "프로그래밍기능사 실기 모의고사",
    description: "혼합형 실전 문제로 프로그래밍기능사 실기 시험 흐름을 연습하세요."
  }
};


export default function MockExamPage() {
  const questions = Object.values(getAllQuestions()).flat();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-blue-600">MOCK EXAM</div>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">실전 모의고사</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">SQL · Python · Java · Linux 문제를 섞어 제한 시간 안에 풀어봅니다. 베타 기간에는 로그인 회원에게 무료로 제공합니다.</p>
      </div>
      <ServiceAccessGate featureName="모의고사" description="혼합형 실전 세트를 만들고 풀이 결과를 저장하는 기능입니다.">
        <MockExamClient questions={questions} />
      </ServiceAccessGate>
    </main>
  );
}
