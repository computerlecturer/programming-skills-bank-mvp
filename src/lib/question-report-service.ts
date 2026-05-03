"use client";

import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-client";
import { addIssueReport } from "@/lib/storage";
import { getServiceUser, refreshServiceUser } from "@/lib/service-auth";
import type { IssueReportType, SubjectId } from "@/types/question";

export type QuestionReportStatus = "접수" | "확인중" | "수정 필요" | "수정완료" | "반려";

export type QuestionReport = {
  id: string;
  userId: string;
  userEmail: string;
  subject: SubjectId;
  questionNo: number;
  reportType: IssueReportType;
  message: string;
  status: QuestionReportStatus;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
};

type QuestionReportRow = {
  id: string;
  user_id: string;
  user_email: string;
  subject: SubjectId;
  question_no: number;
  report_type: IssueReportType;
  message: string;
  status: QuestionReportStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export const QUESTION_REPORT_TYPE_LABEL: Record<IssueReportType, string> = {
  question: "문제 내용 오류",
  answer: "정답 오류",
  explanation: "해설 오류",
  typo: "오타",
  other: "기타"
};

export const QUESTION_REPORT_STATUSES: QuestionReportStatus[] = ["접수", "확인중", "수정 필요", "수정완료", "반려"];

function mapReport(row: QuestionReportRow): QuestionReport {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    subject: row.subject,
    questionNo: row.question_no,
    reportType: row.report_type,
    message: row.message,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function submitQuestionReport({
  subject,
  questionNo,
  reportType,
  message
}: {
  subject: SubjectId;
  questionNo: number;
  reportType: IssueReportType;
  message: string;
}) {
  const trimmed = message.trim();
  if (trimmed.length < 5) throw new Error("오류 내용을 5자 이상 입력해 주세요.");

  const user = getServiceUser() ?? await refreshServiceUser();
  if (!user) throw new Error("로그인 후 오류 제보를 저장할 수 있습니다.");

  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) {
    return addIssueReport(subject, questionNo, reportType, trimmed);
  }

  const { data, error } = await supabase
    .from("question_reports")
    .insert({
      user_id: user.id,
      user_email: user.email,
      subject,
      question_no: questionNo,
      report_type: reportType,
      message: trimmed
    })
    .select("id,user_id,user_email,subject,question_no,report_type,message,status,admin_note,created_at,updated_at")
    .single();

  if (error) {
    throw new Error(error.message.includes("row-level security") || error.message.includes("permission")
      ? "오류 제보 저장 권한이 없습니다. 로그인 상태를 확인해 주세요."
      : "오류 제보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }

  // 학생 개인 보관함에서도 최근 제보를 볼 수 있도록 로컬 기록을 함께 남깁니다.
  addIssueReport(subject, questionNo, reportType, trimmed);
  return mapReport(data as QuestionReportRow);
}

export async function fetchQuestionReportsForAdmin() {
  const user = getServiceUser() ?? await refreshServiceUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  if (user.role !== "admin") throw new Error("관리자만 오류 제보 목록을 볼 수 있습니다.");

  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) throw new Error("Supabase 환경변수가 설정되어 있지 않습니다.");

  const { data, error } = await supabase
    .from("question_reports")
    .select("id,user_id,user_email,subject,question_no,report_type,message,status,admin_note,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("오류 제보 목록을 불러오지 못했습니다. RLS 정책과 admin role을 확인해 주세요.");
  return ((data ?? []) as QuestionReportRow[]).map(mapReport);
}

export async function updateQuestionReportForAdmin({
  id,
  status,
  adminNote
}: {
  id: string;
  status: QuestionReportStatus;
  adminNote: string;
}) {
  const user = getServiceUser() ?? await refreshServiceUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  if (user.role !== "admin") throw new Error("관리자만 오류 제보 상태를 변경할 수 있습니다.");

  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) throw new Error("Supabase 환경변수가 설정되어 있지 않습니다.");

  const { data, error } = await supabase
    .from("question_reports")
    .update({
      status,
      admin_note: adminNote.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id,user_id,user_email,subject,question_no,report_type,message,status,admin_note,created_at,updated_at")
    .single();

  if (error) throw new Error("오류 제보 상태를 저장하지 못했습니다.");
  return mapReport(data as QuestionReportRow);
}
