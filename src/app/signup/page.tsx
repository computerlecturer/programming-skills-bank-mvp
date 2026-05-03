import type { Metadata } from "next";
import { AuthClient } from "@/components/auth/auth-client";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기연구소 회원가입",
  description: "회원가입 후 프로그래밍기능사 실기 SQL, Python, Java, Linux 전체 620문항을 베타 기간 무료로 이용하세요.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: false }
};


export default function SignupPage() {
  return <AuthClient mode="signup" />;
}
