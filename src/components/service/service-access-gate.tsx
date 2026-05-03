"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LockKeyhole, LogIn, Sparkles, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FREE_LIMIT_PER_SUBJECT } from "@/lib/constants";
import { hasBetaFullAccessAsync, subscribeServiceAuthChanges } from "@/lib/service-auth";

export function ServiceAccessGate({
  children,
  featureName,
  description
}: {
  children: ReactNode;
  featureName: string;
  description: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [memberAccess, setMemberAccess] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      setMemberAccess(await hasBetaFullAccessAsync());
      setMounted(true);
    };
    void refresh();
    const unsubscribe = subscribeServiceAuthChanges(() => {
      void refresh();
    });
    return unsubscribe;
  }, []);

  if (!mounted) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">회원 상태를 확인하는 중입니다.</div>;
  }

  if (memberAccess) return <>{children}</>;

  return (
    <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-none">
      <CardContent className="px-6 py-12 text-center sm:px-10 sm:py-16">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/20">
          <LockKeyhole className="size-9" />
        </div>
        <Badge variant="premium" className="mb-5"><Sparkles className="mr-1 size-4" /> {featureName}는 베타 회원 기능</Badge>
        <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
          회원가입 후 전체 기능을 무료로 이용할 수 있습니다.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {description} 현재 베타 서비스 기간에는 회원가입만 하면 전체 문제, 모의고사, 오답노트, 학습기록 기능을 무료로 이용할 수 있습니다. 비회원은 각 과목 {FREE_LIMIT_PER_SUBJECT}문항까지 바로 체험할 수 있습니다.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/login" size="xl" variant="premium"><LogIn className="size-5" /> 로그인하기</ButtonLink>
          <ButtonLink href="/signup" size="xl" variant="outline"><UserPlus className="size-5" /> 회원가입하기</ButtonLink>
          <ButtonLink href="/subjects" size="xl" variant="ghost">무료 문제 풀기</ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
