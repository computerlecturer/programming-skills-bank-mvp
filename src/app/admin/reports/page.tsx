import type { Metadata } from "next";
import { QuestionReportsClient } from "@/components/admin/question-reports-client";

export const metadata: Metadata = {
  title: "오류 제보 관리",
  description: "프로그래밍기능사 실기연구소 관리자 오류 제보 관리 페이지입니다.",
  robots: { index: false, follow: false }
};


export default function AdminReportsPage() {
  return <QuestionReportsClient />;
}
