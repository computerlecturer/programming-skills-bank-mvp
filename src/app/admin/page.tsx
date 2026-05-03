import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const metadata: Metadata = {
  title: "관리자 대시보드",
  description: "프로그래밍기능사 실기연구소 관리자 대시보드입니다.",
  robots: { index: false, follow: false }
};


export default function AdminPage() {
  return <AdminDashboardClient />;
}
