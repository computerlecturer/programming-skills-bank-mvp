import type { Metadata } from "next";
import { AuthClient } from "@/components/auth/auth-client";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기연구소 로그인",
  description: "프로그래밍기능사 실기 문제은행에 로그인하고 전체 문제와 베타 학습 기능을 이용하세요.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false }
};


export default function LoginPage() {
  return <AuthClient mode="login" />;
}
