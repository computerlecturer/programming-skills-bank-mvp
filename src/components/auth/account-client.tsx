"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ClipboardList, LogOut, ShieldCheck, Sparkles, UserCheck, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AI_DAILY_LIMIT, FREE_LIMIT_PER_SUBJECT } from "@/lib/constants";
import { getServiceUser, getTodayAiRemainingAsync, isAdminUser, refreshServiceUser, signOutService, subscribeServiceAuthChanges } from "@/lib/service-auth";
import type { ServiceUser } from "@/types/service";

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

function roleSummary(user: ServiceUser | null) {
  if (!user) return { title: "미로그인 상태", desc: "로그인 후 전체 문제 이용 상태와 권한을 확인할 수 있습니다.", badge: "warning" as const };
  if (user.role === "admin") {
    return {
      title: "관리자 테스트 계정",
      desc: "AI 문제 변형 테스트와 오류 제보 관리가 가능한 계정입니다.",
      badge: "premium" as const
    };
  }
  return {
    title: "일반 베타 회원",
    desc: "전체 문제 이용은 가능하지만 AI 문제 변형은 아직 서비스 준비중입니다.",
    badge: "success" as const
  };
}

export function AccountClient() {
  const [user, setUser] = useState<ServiceUser | null>(null);
  const [admin, setAdmin] = useState(false);
  const [remaining, setRemaining] = useState(AI_DAILY_LIMIT);
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const latestUser = await refreshServiceUser();
    setUser(latestUser ?? getServiceUser());
    setAdmin(isAdminUser());
    setRemaining(await getTodayAiRemainingAsync());
  };

  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeServiceAuthChanges(() => {
      void refresh();
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await signOutService();
    await refresh();
    setMessage("로그아웃되었습니다.");
  };

  const summary = roleSummary(user);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge variant="premium" className="mb-4"><ShieldCheck className="mr-1 size-4" /> MY ACCOUNT</Badge>
        <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">마이페이지</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">로그인 상태, 베타 전체 이용 권한, AI 문제 변형 준비 상태를 한눈에 확인합니다.</p>
      </div>

      <div className={`mb-6 rounded-[2rem] border p-5 sm:p-6 ${admin ? "border-violet-200 bg-gradient-to-r from-violet-50 via-white to-blue-50" : user ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50" : "border-amber-200 bg-amber-50"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black text-slate-500">현재 로그인 상태 요약</div>
            <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">{summary.title}</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{summary.desc}</p>
            {user ? <p className="mt-2 text-sm font-bold text-slate-700">로그인 계정: {user.email}</p> : null}
          </div>
          <Badge variant={summary.badge}>{user ? (admin ? "ADMIN ACCOUNT" : "LOGGED IN") : "GUEST"}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-5 p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-slate-500">계정</div>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{user ? (user.name ? `${user.name}님` : user.email) : "로그인이 필요합니다"}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">{user ? `${user.email} · 가입일 ${formatDate(user.createdAt)}` : "이메일과 비밀번호로 회원가입하거나 로그인하세요."}</p>
              </div>
              <Badge variant={user ? "success" : "warning"}>{user ? "로그인됨" : "미로그인"}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`rounded-3xl border p-4 ${admin ? "border-violet-200 bg-violet-50" : user ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="text-xs font-black text-slate-500">권한 구분</div>
                <div className="mt-2 text-lg font-black text-slate-950">{admin ? "관리자 테스트 계정" : user ? "일반 베타 회원" : "비회원"}</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {admin ? "관리자 계정은 AI 문제 변형 테스트와 오류 제보 관리를 사용할 수 있습니다." : user ? "일반 회원은 AI 버튼 클릭 시 서비스 준비중 문구가 표시됩니다." : "로그인 후 전체 문제 이용이 가능합니다."}
                </p>
              </div>
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-xs font-black text-slate-500">로그인 판별 기준</div>
                <div className="mt-2 text-lg font-black text-slate-950">상단 헤더 상태 연동</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">로그인되면 상단 오른쪽 버튼이 ‘로그인’에서 ‘회원’ 또는 ‘관리자’와 ‘문제 풀기’로 바뀝니다.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {user ? <Button onClick={handleSignOut} variant="outline" size="lg"><LogOut className="size-4" /> 로그아웃</Button> : <ButtonLink href="/login" variant="premium" size="lg">로그인하기</ButtonLink>}
              <ButtonLink href="/subjects" variant="outline" size="lg">문제 풀기</ButtonLink>
              {admin ? <><ButtonLink href="/admin" variant="premium" size="lg" className="text-white hover:text-white"><ClipboardList className="size-4" /> 관리자 대시보드</ButtonLink><ButtonLink href="/admin/reports" variant="outline" size="lg"><ClipboardList className="size-4" /> 오류 제보 관리</ButtonLink></> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50">
          <CardContent className="space-y-5 p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-slate-500">베타 이용 상태</div>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{user ? "베타 회원 전체 이용 가능" : `비회원 ${FREE_LIMIT_PER_SUBJECT}문항 무료 체험`}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  현재 베타 기간에는 회원가입한 사용자가 전체 620문항, 모의고사, 오답노트, 학습기록 기능을 무료로 이용할 수 있습니다. 결제 기능은 아직 비활성화되어 있습니다.
                </p>
              </div>
              <Badge variant={user ? "success" : "outline"}>{user ? "beta member" : "guest"}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <CalendarDays className="mb-3 size-5 text-blue-600" />
                <div className="text-xs font-bold text-slate-500">결제 상태</div>
                <div className="mt-1 text-sm font-black text-slate-950">베타 기간 결제 없음</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <WandSparkles className="mb-3 size-5 text-violet-600" />
                <div className="text-xs font-bold text-slate-500">오늘 AI 변형</div>
                <div className="mt-1 text-sm font-black text-slate-950">{remaining}/{AI_DAILY_LIMIT}회 남음</div>
              </div>
            </div>
            <div className={`rounded-2xl border p-4 text-sm font-semibold leading-6 ${admin ? "border-violet-100 bg-violet-50 text-violet-950" : "border-amber-100 bg-amber-50 text-amber-950"}`}>
              <span className="font-black">AI 문제 변형:</span> {admin ? "관리자 계정은 정답을 맞힌 문제에서 테스트 요청 문구를 확인할 수 있습니다." : "일반 회원에게는 ‘서비스 준비중입니다’가 표시됩니다. 관리자 계정만 정답을 맞힌 문제에서 테스트할 수 있습니다."}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700">
              <div className="flex items-center gap-2 font-black text-slate-950"><UserCheck className="size-4" /> 권한</div>
              <div className="mt-2 text-base font-black text-slate-950">{admin ? "관리자 테스트 권한 활성" : user ? "일반 베타 회원" : "비회원"}</div>
              <div className="mt-2 text-sm text-slate-600">{admin ? "마이페이지와 문제 화면 모두 관리자 전용 상태가 표시되어야 정상입니다." : user ? "마이페이지와 AI 문구에 일반 회원 상태가 표시되어야 정상입니다." : "로그인 후 상태가 즉시 반영됩니다."}</div>
              {admin ? <div className="mt-3 flex flex-wrap gap-2"><Badge variant="dark"><Sparkles className="mr-1 size-4" /> AI 관리자 테스트 가능</Badge><ButtonLink href="/admin" variant="outline" size="sm"><ClipboardList className="size-4" /> 관리자 대시보드</ButtonLink><ButtonLink href="/admin/reports" variant="outline" size="sm"><ClipboardList className="size-4" /> 오류 제보 관리</ButtonLink></div> : null}
            </div>
            {message ? <div className="rounded-2xl border border-blue-100 bg-white p-4 text-sm font-semibold leading-6 text-blue-950">{message}</div> : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 text-sm font-semibold leading-7 text-slate-600">
        비회원은 과목별 {FREE_LIMIT_PER_SUBJECT}문항까지 무료로 이용할 수 있습니다. 회원가입한 사용자는 베타 기간 동안 51번 이후 문제까지 전체 이용 가능합니다. 향후 정식 서비스 전환 시 결제/이용권 기능을 활성화할 수 있도록 DB 구조는 유지합니다.
      </div>
    </main>
  );
}
