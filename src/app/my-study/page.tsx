import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/question-data";
import { MyStudyClient } from "@/components/my-study/my-study-client";
import { ServiceAccessGate } from "@/components/service/service-access-gate";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기 학습 보관함",
  description: "다시 볼 문제, 개인 메모, 오류 제보 기록을 확인하는 프로그래밍기능사 실기 학습 보관함입니다.",
  alternates: { canonical: "/my-study" },
  robots: { index: false, follow: false }
};


export default function MyStudyPage() {
  const questions = Object.values(getAllQuestions()).flat();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-blue-600">MY STUDY</div>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">내 학습 보관함</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">다시 볼 문제, 개인 메모, 문제 오류 제보 기록을 한 곳에서 확인합니다. 베타 기간에는 로그인 회원에게 전체 기능을 무료로 제공합니다.</p>
      </div>
      <ServiceAccessGate featureName="학습 보관함" description="다시 볼 문제, 메모, 오류 제보 기록을 계정 단위로 관리하는 기능입니다.">
        <MyStudyClient questions={questions} />
      </ServiceAccessGate>
    </main>
  );
}
