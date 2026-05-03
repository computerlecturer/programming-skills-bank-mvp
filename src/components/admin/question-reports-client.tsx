"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ClipboardList, Filter, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";
import { AdminAccessPanel } from "@/components/admin/admin-access-panel";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDisplayAnswer } from "@/lib/grading";
import { getQuestion } from "@/lib/question-data";
import { getQuestionTypeLabel } from "@/lib/question-labels";
import { getServiceUser, refreshServiceUser, signOutService } from "@/lib/service-auth";
import {
  fetchQuestionReportsForAdmin,
  QUESTION_REPORT_STATUSES,
  QUESTION_REPORT_TYPE_LABEL,
  updateQuestionReportForAdmin
} from "@/lib/question-report-service";
import type { QuestionReport, QuestionReportStatus } from "@/lib/question-report-service";
import type { IssueReportType, SubjectId, TableAnswer } from "@/types/question";

const subjectLabel: Record<SubjectId, string> = {
  sql: "SQL",
  python: "Python",
  java: "Java",
  linux: "Linux"
};

const reportTypeOptions: Array<IssueReportType | "전체"> = ["전체", "question", "answer", "explanation", "typo", "other"];
const subjectOptions: Array<SubjectId | "전체"> = ["전체", "sql", "python", "java", "linux"];
const scopeOptions = ["전체", "미처리", "처리완료"] as const;

const statusVariant: Record<QuestionReportStatus, "warning" | "default" | "danger" | "success" | "secondary"> = {
  접수: "warning",
  확인중: "default",
  "수정 필요": "danger",
  수정완료: "success",
  반려: "secondary"
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function isTableAnswer(value: string | TableAnswer): value is TableAnswer {
  return typeof value === "object" && value !== null && "columns" in value && "rows" in value;
}

function AnswerPreview({ answer }: { answer: string | TableAnswer }) {
  if (typeof answer === "string") {
    return <pre className="whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm font-semibold leading-7 text-slate-900 ring-1 ring-slate-100">{answer || "정답 데이터가 비어 있습니다."}</pre>;
  }

  if (!isTableAnswer(answer)) return null;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-100">
      <table className="w-full min-w-[320px] text-sm">
        {answer.columns.length ? (
          <thead>
            <tr className="bg-slate-50">
              {answer.columns.map((column, index) => (
                <th className="border-b border-slate-100 px-3 py-2 text-left font-black text-slate-700" key={`${column}-${index}`}>{column}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {answer.rows.length ? answer.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td className="border-b border-slate-50 px-3 py-2 font-semibold text-slate-800" key={cellIndex}>{cell}</td>)}
            </tr>
          )) : (
            <tr><td className="px-3 py-3 text-sm font-semibold text-slate-500">정답 테이블 데이터가 비어 있습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function QuestionReportsClient() {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [selected, setSelected] = useState<QuestionReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuestionReportStatus | "전체">("전체");
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | "전체">("전체");
  const [typeFilter, setTypeFilter] = useState<IssueReportType | "전체">("전체");
  const [scopeFilter, setScopeFilter] = useState<(typeof scopeOptions)[number]>("미처리");
  const [adminNote, setAdminNote] = useState("");
  const [status, setStatus] = useState<QuestionReportStatus>("접수");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    setMessage("");
    try {
      const user = await refreshServiceUser();
      const currentUser = user ?? getServiceUser();
      setIsAdmin(currentUser?.role === "admin");
      if (currentUser?.role !== "admin") {
        setReports([]);
        setSelected(null);
        return;
      }
      const nextReports = await fetchQuestionReportsForAdmin();
      setReports(nextReports);
      setSelected((current) => {
        if (!current) return nextReports[0] ?? null;
        return nextReports.find((item) => item.id === current.id) ?? nextReports[0] ?? null;
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "오류 제보 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setAdminNote(selected.adminNote ?? "");
  }, [selected]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (scopeFilter === "미처리" && ["수정완료", "반려"].includes(report.status)) return false;
      if (scopeFilter === "처리완료" && !["수정완료", "반려"].includes(report.status)) return false;
      if (statusFilter !== "전체" && report.status !== statusFilter) return false;
      if (subjectFilter !== "전체" && report.subject !== subjectFilter) return false;
      if (typeFilter !== "전체" && report.reportType !== typeFilter) return false;
      return true;
    });
  }, [reports, scopeFilter, statusFilter, subjectFilter, typeFilter]);

  const counts = useMemo(() => {
    return QUESTION_REPORT_STATUSES.reduce((acc, item) => {
      acc[item] = reports.filter((report) => report.status === item).length;
      return acc;
    }, {} as Record<QuestionReportStatus, number>);
  }, [reports]);

  const pendingCount = reports.filter((report) => !["수정완료", "반려"].includes(report.status)).length;
  const completedCount = reports.length - pendingCount;
  const selectedQuestion = selected ? getQuestion(selected.subject, selected.questionNo) : undefined;
  const selectedAnswer = selectedQuestion ? getDisplayAnswer(selectedQuestion) : undefined;

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateQuestionReportForAdmin({ id: selected.id, status, adminNote });
      setReports((items) => items.map((item) => item.id === updated.id ? updated : item));
      setSelected(updated);
      setMessage("관리자 처리 상태가 저장되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOutService();
    window.location.href = "/login";
  };

  if (loading && !isAdmin) {
    return <AdminAccessPanel state="checking" />;
  }

  if (!loading && !isAdmin) {
    const loginRequired = message.includes("로그인");
    return (
      <AdminAccessPanel
        state={loginRequired ? "login-required" : "denied"}
        message={message || "오류 제보 관리는 profiles.role 값이 admin인 계정에서만 사용할 수 있습니다."}
      />
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="premium" className="mb-4"><ShieldCheck className="mr-1 size-4" /> ADMIN</Badge>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">오류 제보 검토</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">학생 제보, 실제 문제 원문, 정답, 해설을 한 화면에서 확인하고 처리 상태를 관리합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadReports} variant="outline" size="lg" disabled={loading}><RefreshCcw className="size-4" /> 새로고침</Button>
          <ButtonLink href="/admin" variant="outline" size="lg"><ShieldCheck className="size-4" /> 대시보드</ButtonLink>
          <ButtonLink href="/account" variant="outline" size="lg"><ShieldCheck className="size-4" /> 마이페이지</ButtonLink>
          <Button onClick={handleSignOut} variant="outline" size="lg"><LogOut className="size-4" /> 로그아웃</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <button type="button" onClick={() => { setScopeFilter("전체"); setStatusFilter("전체"); }} className={`rounded-2xl border p-4 text-left transition ${scopeFilter === "전체" && statusFilter === "전체" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
          <div className="text-xs font-black opacity-70">전체</div>
          <div className="mt-1 text-2xl font-black">{reports.length}</div>
        </button>
        <button type="button" onClick={() => { setScopeFilter("미처리"); setStatusFilter("전체"); }} className={`rounded-2xl border p-4 text-left transition ${scopeFilter === "미처리" && statusFilter === "전체" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
          <div className="text-xs font-black opacity-70">미처리</div>
          <div className="mt-1 text-2xl font-black">{pendingCount}</div>
        </button>
        <button type="button" onClick={() => { setScopeFilter("전체"); setStatusFilter("수정 필요"); }} className={`rounded-2xl border p-4 text-left transition ${statusFilter === "수정 필요" ? "border-red-600 bg-red-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
          <div className="text-xs font-black opacity-70">수정 필요</div>
          <div className="mt-1 text-2xl font-black">{counts["수정 필요"] ?? 0}</div>
        </button>
        <button type="button" onClick={() => { setScopeFilter("전체"); setStatusFilter("접수"); }} className={`rounded-2xl border p-4 text-left transition ${statusFilter === "접수" ? "border-amber-500 bg-amber-500 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
          <div className="text-xs font-black opacity-70">접수</div>
          <div className="mt-1 text-2xl font-black">{counts["접수"] ?? 0}</div>
        </button>
        <button type="button" onClick={() => { setScopeFilter("처리완료"); setStatusFilter("전체"); }} className={`rounded-2xl border p-4 text-left transition ${scopeFilter === "처리완료" && statusFilter === "전체" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
          <div className="text-xs font-black opacity-70">처리완료/반려</div>
          <div className="mt-1 text-2xl font-black">{completedCount}</div>
        </button>
        <button type="button" onClick={() => { setSubjectFilter("전체"); setTypeFilter("전체"); setScopeFilter("전체"); setStatusFilter("전체"); }} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-700 transition hover:bg-slate-50">
          <div className="text-xs font-black opacity-70">필터</div>
          <div className="mt-1 text-sm font-black">초기화</div>
        </button>
      </div>

      <Card className="mb-6 border-slate-200 bg-white/80">
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-1 text-xs font-black text-slate-500"><Filter className="size-3" /> 처리 구분</span>
            <select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value as (typeof scopeOptions)[number])} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
              {scopeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">상태</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as QuestionReportStatus | "전체")} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
              <option value="전체">전체</option>
              {QUESTION_REPORT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">과목</span>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value as SubjectId | "전체")} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
              {subjectOptions.map((item) => <option key={item} value={item}>{item === "전체" ? "전체" : subjectLabel[item]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">유형</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as IssueReportType | "전체")} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
              {reportTypeOptions.map((item) => <option key={item} value={item}>{item === "전체" ? "전체" : QUESTION_REPORT_TYPE_LABEL[item]}</option>)}
            </select>
          </label>
        </CardContent>
      </Card>

      {message ? <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold leading-6 text-blue-950">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_1.05fr]">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950"><ClipboardList className="size-4 text-blue-600" /> 제보 목록</div>
              <Badge variant="outline">{filteredReports.length}건</Badge>
            </div>
            <div className="max-h-[780px] divide-y divide-slate-100 overflow-y-auto">
              {loading ? <div className="p-6 text-sm font-bold text-slate-500">불러오는 중입니다...</div> : null}
              {!loading && !filteredReports.length ? <div className="p-6 text-sm font-bold text-slate-500">표시할 오류 제보가 없습니다.</div> : null}
              {filteredReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelected(report)}
                  className={`block w-full p-5 text-left transition hover:bg-slate-50 ${selected?.id === report.id ? "bg-blue-50" : "bg-white"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{subjectLabel[report.subject]} {report.questionNo}번</Badge>
                    <Badge variant={statusVariant[report.status]}>{report.status}</Badge>
                    <Badge variant="secondary">{QUESTION_REPORT_TYPE_LABEL[report.reportType]}</Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">{report.message}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                    <span>{report.userEmail}</span>
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardContent className="space-y-5 p-6 sm:p-7">
            {!selected ? (
              <div className="text-sm font-bold leading-6 text-slate-500">왼쪽 목록에서 제보를 선택하세요.</div>
            ) : (
              <>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{subjectLabel[selected.subject]} {selected.questionNo}번</Badge>
                    <Badge variant={statusVariant[selected.status]}>{selected.status}</Badge>
                    <Badge variant="secondary">{QUESTION_REPORT_TYPE_LABEL[selected.reportType]}</Badge>
                  </div>
                  <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">{QUESTION_REPORT_TYPE_LABEL[selected.reportType]}</h2>
                  <p className="mt-2 text-xs font-bold text-slate-500">제보자: {selected.userEmail} · {formatDate(selected.createdAt)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-black text-slate-500">제보 내용</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-800">{selected.message}</p>
                </div>

                <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><BookOpenCheck className="size-4 text-blue-600" /> 문제 원문 검토</div>
                  {selectedQuestion ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{getQuestionTypeLabel(selectedQuestion.type)}</Badge>
                        <Badge variant="outline">{selectedQuestion.chapter}</Badge>
                        {selectedQuestion.difficulty ? <Badge variant="outline">{selectedQuestion.difficulty}</Badge> : null}
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-black text-slate-500">문제 지문</div>
                        <div className="prose-question max-h-[260px] overflow-y-auto rounded-2xl bg-white p-4 text-sm ring-1 ring-blue-100" dangerouslySetInnerHTML={{ __html: selectedQuestion.questionHtml }} />
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-black text-slate-500">정답</div>
                        {selectedAnswer ? <AnswerPreview answer={selectedAnswer} /> : <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 ring-1 ring-blue-100">정답 데이터를 찾지 못했습니다.</div>}
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-black text-slate-500">해설</div>
                        <div className="prose-question max-h-[220px] overflow-y-auto rounded-2xl bg-white p-4 text-sm ring-1 ring-blue-100" dangerouslySetInnerHTML={{ __html: selectedQuestion.explanationHtml }} />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-slate-500 ring-1 ring-blue-100">
                      {subjectLabel[selected.subject]} {selected.questionNo}번 문제 데이터를 찾지 못했습니다. 문제 번호 또는 데이터 파일을 확인하세요.
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-950">처리 상태</label>
                  <select value={status} onChange={(event) => setStatus(event.target.value as QuestionReportStatus)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
                    {QUESTION_REPORT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-950">관리자 메모</label>
                  <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="확인 내용이나 수정 예정 사항을 기록하세요." className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </div>

                <Button onClick={handleSave} variant="premium" size="lg" className="w-full" disabled={saving}>{saving ? "저장 중" : "처리 상태 저장"}</Button>
                <ButtonLink href={`/practice/${selected.subject}?q=${selected.questionNo}`} variant="outline" size="lg" className="w-full">해당 문제로 이동</ButtonLink>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
