"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exchangeAuthCodeForSession } from "@/lib/service-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("로그인 세션을 확인하고 있습니다.");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const next = params.get("next") || "/account";

      if (!code) {
        setFailed(true);
        setMessage("로그인 인증 코드가 없습니다. 로그인 화면에서 다시 시도해 주세요.");
        return;
      }

      try {
        await exchangeAuthCodeForSession(code);
        setMessage("로그인되었습니다. 마이페이지로 이동합니다.");
        router.replace(next);
      } catch {
        setFailed(true);
        setMessage("로그인 세션 저장에 실패했습니다. 로그인 화면에서 다시 시도해 주세요.");
      }
    };
    void run();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-10">
      <Card className="w-full border-blue-100 shadow-[0_30px_100px_rgba(37,99,235,0.12)]">
        <CardContent className="p-8 text-center">
          <Badge variant={failed ? "warning" : "premium"} className="mb-4">
            <ShieldCheck className="mr-1 size-4" /> AUTH CALLBACK
          </Badge>
          {!failed ? <Loader2 className="mx-auto mb-5 size-10 animate-spin text-blue-600" /> : null}
          <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950">{failed ? "로그인 확인 필요" : "로그인 처리 중"}</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{message}</p>
          {failed ? <ButtonLink href="/login" variant="premium" size="lg" className="mt-6 w-full">로그인 화면으로 돌아가기</ButtonLink> : null}
        </CardContent>
      </Card>
    </main>
  );
}
