"use client";

import { getSubjects } from "@/lib/question-data";
import {
  fetchQuestionReportsForAdmin,
  QUESTION_REPORT_STATUSES,
  QUESTION_REPORT_TYPE_LABEL
} from "@/lib/question-report-service";
import type { QuestionReport, QuestionReportStatus } from "@/lib/question-report-service";
import { getServiceUser, refreshServiceUser } from "@/lib/service-auth";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-client";
import type { AiVariationMode } from "@/lib/constants";
import type { IssueReportType, SubjectId } from "@/types/question";
import type { ServiceUser } from "@/types/service";

export type AdminProfile = {
  id: string;
  email: string;
  name?: string | null;
  role?: "user" | "admin" | string | null;
  createdAt?: string | null;
};

export type AdminAiUsage = {
  id: string;
  userId: string;
  subject?: SubjectId | null;
  questionNo?: number | null;
  mode?: AiVariationMode | string | null;
  usedDate?: string | null;
  createdAt?: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  created_at: string | null;
};

type AiUsageRow = {
  id: string;
  user_id: string;
  source_subject: SubjectId | null;
  source_question_no: number | null;
  variation_mode: AiVariationMode | string | null;
  used_date: string | null;
  created_at: string | null;
};

export type AdminDashboardData = {
  user: ServiceUser;
  reports: QuestionReport[];
  profiles: AdminProfile[];
  aiUsage: AdminAiUsage[];
  profileError?: string;
  aiUsageError?: string;
  supabaseReady: boolean;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getDashboardStatics() {
  const subjects = getSubjects();
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.total, 0);
  return {
    subjects,
    totalQuestions
  };
}

export function summarizeReports(reports: QuestionReport[]) {
  const today = todayKey();
  const byStatus = QUESTION_REPORT_STATUSES.reduce((acc, status) => {
    acc[status] = reports.filter((report) => report.status === status).length;
    return acc;
  }, {} as Record<QuestionReportStatus, number>);

  const bySubject = ["sql", "python", "java", "linux"].reduce((acc, subject) => {
    acc[subject as SubjectId] = reports.filter((report) => report.subject === subject).length;
    return acc;
  }, {} as Record<SubjectId, number>);

  const byType = Object.keys(QUESTION_REPORT_TYPE_LABEL).reduce((acc, type) => {
    acc[type as IssueReportType] = reports.filter((report) => report.reportType === type).length;
    return acc;
  }, {} as Record<IssueReportType, number>);

  const pending = reports.filter((report) => !["수정완료", "반려"].includes(report.status));
  const needsFix = reports.filter((report) => report.status === "수정 필요");
  const todayReports = reports.filter((report) => report.createdAt.slice(0, 10) === today);

  return {
    total: reports.length,
    today: todayReports.length,
    pending: pending.length,
    needsFix: needsFix.length,
    completed: reports.length - pending.length,
    byStatus,
    bySubject,
    byType,
    recent: reports.slice(0, 5),
    needsFixList: needsFix.slice(0, 5)
  };
}

export function summarizeProfiles(profiles: AdminProfile[]) {
  const today = todayKey();
  return {
    total: profiles.length,
    today: profiles.filter((profile) => (profile.createdAt ?? "").slice(0, 10) === today).length,
    admins: profiles.filter((profile) => profile.role === "admin").length,
    users: profiles.filter((profile) => profile.role !== "admin").length,
    recent: [...profiles]
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 5)
  };
}

export function summarizeAiUsage(aiUsage: AdminAiUsage[]) {
  const today = todayKey();
  const currentMonth = today.slice(0, 7);
  const todayLogs = aiUsage.filter((log) => log.usedDate === today || (log.createdAt ?? "").slice(0, 10) === today);
  const monthLogs = aiUsage.filter((log) => (log.usedDate ?? log.createdAt ?? "").slice(0, 7) === currentMonth);

  const bySubject = ["sql", "python", "java", "linux"].reduce((acc, subject) => {
    acc[subject as SubjectId] = aiUsage.filter((log) => log.subject === subject).length;
    return acc;
  }, {} as Record<SubjectId, number>);

  return {
    total: aiUsage.length,
    today: todayLogs.length,
    month: monthLogs.length,
    bySubject,
    recent: aiUsage.slice(0, 5)
  };
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const user = await refreshServiceUser() ?? getServiceUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  if (user.role !== "admin") throw new Error("관리자만 대시보드를 볼 수 있습니다.");

  const reports = await fetchQuestionReportsForAdmin();
  const supabase = getSupabaseBrowserClient();

  let profiles: AdminProfile[] = [];
  let aiUsage: AdminAiUsage[] = [];
  let profileError: string | undefined;
  let aiUsageError: string | undefined;

  if (!supabase || !hasSupabaseConfig()) {
    return {
      user,
      reports,
      profiles,
      aiUsage,
      profileError: "Supabase 환경변수가 설정되어 있지 않습니다.",
      aiUsageError: "Supabase 환경변수가 설정되어 있지 않습니다.",
      supabaseReady: false
    };
  }

  const { data: profileRows, error: profileQueryError } = await supabase
    .from("profiles")
    .select("id,email,name,role,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (profileQueryError) {
    profileError = "회원 현황을 불러오지 못했습니다. v7.3.0 관리자 대시보드 SQL을 실행했는지 확인해 주세요.";
  } else {
    profiles = ((profileRows ?? []) as ProfileRow[]).map((row) => ({
      id: row.id,
      email: row.email ?? "",
      name: row.name,
      role: row.role,
      createdAt: row.created_at
    }));
  }

  const { data: aiRows, error: aiQueryError } = await supabase
    .from("ai_usage_logs")
    .select("id,user_id,source_subject,source_question_no,variation_mode,used_date,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (aiQueryError) {
    aiUsageError = "AI 테스트 사용 기록을 불러오지 못했습니다. ai_usage_logs 권한 또는 테이블 구조를 확인해 주세요.";
  } else {
    aiUsage = ((aiRows ?? []) as AiUsageRow[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      subject: row.source_subject,
      questionNo: row.source_question_no,
      mode: row.variation_mode,
      usedDate: row.used_date,
      createdAt: row.created_at
    }));
  }

  return {
    user,
    reports,
    profiles,
    aiUsage,
    profileError,
    aiUsageError,
    supabaseReady: true
  };
}
