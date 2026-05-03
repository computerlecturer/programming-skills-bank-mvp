import type { Metadata } from "next";
import { AccountClient } from "@/components/auth/account-client";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기연구소 마이페이지",
  description: "프로그래밍기능사 실기연구소 로그인 상태와 베타 이용 권한을 확인하는 마이페이지입니다.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false }
};


export default function AccountPage() {
  return <AccountClient />;
}
