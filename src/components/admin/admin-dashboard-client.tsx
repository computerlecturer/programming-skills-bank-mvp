"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  Bug,
  CheckCircle2,
  ClipboardList,
  Database,
  FileQuestion,
  Gauge,
  LogOut,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles
} from "lucide-react";
import { AdminAccessPanel } from "@/components/admin/admin-access-panel";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchAdminDashboardData,
  getDashboardStatics,
  summarizeAiUsage,
  summarizeProfiles,
  summarizeReports
} from "@/lib/admin-dashboard-service";
import { AI_ADMIN_ONLY_BETA, AI_DAILY_LIMIT, BETA_MEMBERS_FULL_ACCESS, BETA_PAYMENTS_ENABLED, FREE_LIMIT_PER_SUBJECT, SERVICE_VERSION } from "@/lib/constants";
import { signOutService } from "@/lib/service-auth";
import { QUESTION_REPORT_STATUSES, QUESTION_REPORT_TYPE_LABEL } from "@/lib/question-report-service";
import type { AdminDashboardData } from "@/lib/admin-dashboard-service";
import type { IssueReportType, SubjectId } from "@/types/question";

const subjectLabel: Record<SubjectId, string> = {
  sql: "SQL",
  python: "Python",
  java: "Java",
  linux: "Linux"
};

const subjectBadge: Record<SubjectId, "default" | "success" | "warning" | "premium"> = {
  sql: "default",
  python: "success",
  java: "warning",
  linux: "premium"
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function StatCard({
  title,
  value,
  desc,
  icon,
  tone = "default"
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: React.ReactNode;
  tone?: "default" | "blue" | "red" | "green" | "violet" | "amber";
}) {
  const toneClass = {
    default: "border-slate-200 bg-white",
    blue: "border-blue-100 bg-blue-50",
    red: "border-red-100 bg-red-50",
    green: "border-emerald-100 bg-emerald-50",
    violet: "border-violet-100 bg-violet-50",
    amber: "border-amber-100 bg-amber-50"
  }[tone];

  return (
    <Card className={toneClass}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-xs font-black text-slate-500">{title}</div>
          <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-100">{icon}</div>
        </div>
        <div className="text-3xl font-black tracking-[-0.05em] text-slate-950">{value}</div>
        <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{desc}</p>
      </CardContent>
    </Card>
  );
}

function BarRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black text-slate-600">
        <span>{label}</span>
        <span>{value}건</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function AdminDashboardClient() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await fetchAdminDashboardData();
      setData(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "관리자 대시보드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const handleSignOut = async () => {
    await signOutService();
    window.location.href = "/login";
  };

  const statics = useMemo(() => getDashboardStatics(), []);
  const reportSummary = useMemo(() => summarizeReports(data?.reports ?? []), [data?.reports]);
  const profileSummary = useMemo(() => summarizeProfiles(data?.profiles ?? []), [data?.profiles]);
  const aiSummary = useMemo(() => summarizeAiUsage(data?.aiUsage ?? []), [data?.aiUsage]);

  if (loading && !data) {
    return <AdminAccessPanel state="checking" />;
  }

  if (!data && message) {
    const isLoginMessage = message.includes("로그인");
    return <AdminAccessPanel state={isLoginMessage ? "login-required" : "denied"} message={message} />;
  }

  if (!data) {
    return <AdminAccessPanel state="denied" message="관리자 대시보드 데이터를 불러오지 못했습니다." />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="premium" className="mb-4"><ShieldCheck className="mr-1 size-4" /> ADMIN DASHBOARD</Badge>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">관리자 대시보드</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            오류 제보, 회원, 문제은행, AI 테스트, 베타 운영 상태를 한 화면에서 확인합니다.
          </p>
          {data?.user ? <p className="mt-2 text-sm font-bold text-slate-500">현재 관리자: {data.user.email}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadDashboard} variant="outline" size="lg" disabled={loading}><RefreshCcw className="size-4" /> 새로고침</Button>
          <ButtonLink href="/account" variant="outline" size="lg"><ShieldCheck className="size-4" /> 마이페이지</ButtonLink>
          <ButtonLink href="/admin/reports" variant="premium" size="lg"><ClipboardList className="size-4" /> 오류 제보 관리</ButtonLink>
          <Button onClick={handleSignOut} variant="outline" size="lg"><LogOut className="size-4" /> 로그아웃</Button>
        </div>
      </div>

      {message && data ? <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold leading-6 text-blue-950">{message}</div> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="전체 오류 제보" value={reportSummary.total} desc={`오늘 접수 ${reportSummary.today}건`} icon={<Bug className="size-5 text-blue-600" />} tone="blue" />
        <StatCard title="미처리 제보" value={reportSummary.pending} desc="접수·확인중·수정 필요 상태" icon={<ClipboardList className="size-5 text-amber-600" />} tone="amber" />
        <StatCard title="수정 필요" value={reportSummary.needsFix} desc="실제 문제 데이터 수정 검토 대상" icon={<AlertCircle className="size-5 text-red-600" />} tone="red" />
        <StatCard title="전체 회원" value={data?.profileError ? "확인 필요" : profileSummary.total} desc={data?.profileError ?? `오늘 가입 ${profileSummary.today}명`} icon={<Users className="size-5 text-emerald-600" />} tone="green" />
        <StatCard title="오늘 AI 테스트" value={data?.aiUsageError ? "확인 필요" : aiSummary.today} desc={data?.aiUsageError ?? `월간 ${aiSummary.month}회 · 일일 제한 ${AI_DAILY_LIMIT}회`} icon={<WandSparkles className="size-5 text-violet-600" />} tone="violet" />
        <StatCard title="전체 문항" value={statics.totalQuestions} desc="SQL·Python·Java·Linux 문제은행" icon={<FileQuestion className="size-5 text-slate-900" />} />
        <StatCard title="베타 이용 정책" value={BETA_MEMBERS_FULL_ACCESS ? "전체 무료" : "제한"} desc={`비회원 과목별 ${FREE_LIMIT_PER_SUBJECT}문항 무료`} icon={<Sparkles className="size-5 text-blue-600" />} tone="blue" />
        <StatCard title="현재 버전" value={SERVICE_VERSION.replace("v", "v ")} desc="관리자 대시보드 적용 버전" icon={<Gauge className="size-5 text-slate-900" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-slate-950"><BarChart3 className="size-4 text-blue-600" /> 오류 제보 상태별 현황</div>
                <p className="mt-1 text-xs font-semibold text-slate-500">운영자가 매일 확인해야 하는 핵심 지표입니다.</p>
              </div>
              <ButtonLink href="/admin/reports" variant="outline" size="sm">상세 관리</ButtonLink>
            </div>
            <div className="space-y-4">
              {QUESTION_REPORT_STATUSES.map((status) => (
                <BarRow key={status} label={status} value={reportSummary.byStatus[status] ?? 0} total={Math.max(1, reportSummary.total)} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-2 text-sm font-black text-slate-950"><BookOpenCheck className="size-4 text-violet-600" /> 과목별 문제은행 현황</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {statics.subjects.map((subject) => (
                <div key={subject.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <Badge variant={subjectBadge[subject.id]}>{subject.name}</Badge>
                  <div className="mt-3 text-2xl font-black text-slate-950">{subject.total}문항</div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{subject.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950"><ClipboardList className="size-4 text-blue-600" /> 최근 오류 제보</div>
              <Badge variant="outline">{reportSummary.recent.length}건</Badge>
            </div>
            <div className="space-y-3">
              {reportSummary.recent.length ? reportSummary.recent.map((report) => (
                <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{subjectLabel[report.subject]} {report.questionNo}번</Badge>
                    <Badge variant={report.status === "수정 필요" ? "danger" : report.status === "수정완료" ? "success" : report.status === "반려" ? "secondary" : "warning"}>{report.status}</Badge>
                    <Badge variant="secondary">{QUESTION_REPORT_TYPE_LABEL[report.reportType]}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">{report.message}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">{formatDate(report.createdAt)} · {report.userEmail}</p>
                </div>
              )) : <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">최근 오류 제보가 없습니다.</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950"><AlertCircle className="size-4 text-red-600" /> 수정 필요 제보</div>
              <ButtonLink href="/admin/reports" variant="outline" size="sm">검토하기</ButtonLink>
            </div>
            <div className="space-y-3">
              {reportSummary.needsFixList.length ? reportSummary.needsFixList.map((report) => (
                <div key={report.id} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="danger">{subjectLabel[report.subject]} {report.questionNo}번</Badge>
                    <Badge variant="secondary">{QUESTION_REPORT_TYPE_LABEL[report.reportType]}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-red-950">{report.message}</p>
                </div>
              )) : <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-800"><CheckCircle2 className="mb-2 size-5" /> 현재 수정 필요로 분류된 제보가 없습니다.</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-2 text-sm font-black text-slate-950"><Users className="size-4 text-emerald-600" /> 회원 현황</div>
            {data?.profileError ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">{data.profileError}</div>
            ) : (
              <>
                <div className="mb-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">전체</div><div className="mt-1 text-2xl font-black">{profileSummary.total}</div></div>
                  <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black text-slate-500">일반</div><div className="mt-1 text-2xl font-black">{profileSummary.users}</div></div>
                  <div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black text-slate-500">관리자</div><div className="mt-1 text-2xl font-black">{profileSummary.admins}</div></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black text-slate-500">오늘 가입</div><div className="mt-1 text-2xl font-black">{profileSummary.today}</div></div>
                </div>
                <div className="space-y-2">
                  {profileSummary.recent.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-black text-slate-900">{profile.email}</div>
                        <div className="text-xs font-semibold text-slate-500">{formatDate(profile.createdAt)}</div>
                      </div>
                      <Badge variant={profile.role === "admin" ? "premium" : "success"}>{profile.role === "admin" ? "admin" : "user"}</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-2 text-sm font-black text-slate-950"><WandSparkles className="size-4 text-violet-600" /> AI 테스트 현황</div>
            {data?.aiUsageError ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">{data.aiUsageError}</div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black text-slate-500">오늘</div><div className="mt-1 text-2xl font-black">{aiSummary.today}</div></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black text-slate-500">이번 달</div><div className="mt-1 text-2xl font-black">{aiSummary.month}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">전체 로그</div><div className="mt-1 text-2xl font-black">{aiSummary.total}</div></div>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm font-semibold leading-6 text-violet-950">
                  일반 회원은 AI 문제 변형 클릭 시 “서비스 준비중입니다”가 표시되며, 관리자만 테스트 요청을 기록할 수 있습니다.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-2 text-sm font-black text-slate-950"><Database className="size-4 text-slate-700" /> 베타 운영·시스템 상태</div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">회원가입</div>
                <div className="mt-2 text-sm font-black text-slate-950">이메일 + 비밀번호</div>
                <p className="mt-1 text-xs font-semibold text-slate-500">구글·카카오·OTP 비활성화</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">결제</div>
                <div className="mt-2 text-sm font-black text-slate-950">{BETA_PAYMENTS_ENABLED ? "활성화" : "비활성화"}</div>
                <p className="mt-1 text-xs font-semibold text-slate-500">베타 기간 결제 없음</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">AI 변형</div>
                <div className="mt-2 text-sm font-black text-slate-950">{AI_ADMIN_ONLY_BETA ? "관리자 테스트" : "전체 활성화"}</div>
                <p className="mt-1 text-xs font-semibold text-slate-500">정식 서비스 전 제공 예정</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">학습기록</div>
                <div className="mt-2 text-sm font-black text-slate-950">로컬 저장</div>
                <p className="mt-1 text-xs font-semibold text-slate-500">오답노트·보관함은 DB 미저장</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <ButtonLink href="/admin/reports" variant="premium"><ClipboardList className="size-4" /> 오류 제보 관리</ButtonLink>
              <ButtonLink href="/subjects" variant="outline"><BookOpenCheck className="size-4" /> 문제 풀기</ButtonLink>
              <ButtonLink href="/account" variant="outline"><ShieldCheck className="size-4" /> 마이페이지</ButtonLink>
              <ButtonLink href="/pricing" variant="outline"><Sparkles className="size-4" /> 베타 안내</ButtonLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
