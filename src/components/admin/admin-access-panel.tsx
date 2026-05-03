"use client";

import { AlertCircle, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type AdminAccessState = "checking" | "login-required" | "denied";

export function AdminAccessPanel({
  state,
  message
}: {
  state: AdminAccessState;
  message?: string;
}) {
  const isChecking = state === "checking";
  const isLoginRequired = state === "login-required";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className={isChecking ? "border-blue-100 bg-blue-50" : isLoginRequired ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50"}>
        <CardContent className="p-7 sm:p-8">
          <Badge variant={isChecking ? "default" : isLoginRequired ? "warning" : "danger"} className="mb-4">
            {isChecking ? <Loader2 className="mr-1 size-4 animate-spin" /> : isLoginRequired ? <LogIn className="mr-1 size-4" /> : <AlertCircle className="mr-1 size-4" />}
            {isChecking ? "권한 확인 중" : isLoginRequired ? "로그인 필요" : "접근 권한 없음"}
          </Badge>

          <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950">
            {isChecking ? "관리자 권한을 확인하고 있습니다." : isLoginRequired ? "로그인 후 이용할 수 있습니다." : "관리자만 접근할 수 있습니다."}
          </h1>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            {message ?? (
              isChecking
                ? "확인이 끝나기 전까지 관리자 대시보드 데이터는 불러오지 않습니다."
                : isLoginRequired
                  ? "관리자 계정으로 로그인한 뒤 다시 접속해 주세요."
                  : "현재 계정은 관리자 권한이 없습니다. profiles.role 값이 admin인 계정에서만 이 화면을 볼 수 있습니다."
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {isLoginRequired ? <ButtonLink href="/login" variant="premium"><LogIn className="size-4" /> 로그인하기</ButtonLink> : null}
            <ButtonLink href="/account" variant="outline"><ShieldCheck className="size-4" /> 마이페이지</ButtonLink>
            <ButtonLink href="/subjects" variant="outline">문제 풀기</ButtonLink>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
