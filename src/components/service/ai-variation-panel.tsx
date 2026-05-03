"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Sparkles, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AI_DAILY_LIMIT, AI_READY_MESSAGE, AI_VARIATION_MODE_LABEL } from "@/lib/constants";
import type { AiVariationMode } from "@/lib/constants";
import { getServiceUser, getTodayAiRemainingAsync, isAdminUser, recordAiUsage, refreshServiceUser, subscribeServiceAuthChanges } from "@/lib/service-auth";
import type { SubjectId } from "@/types/question";

export function AiVariationPanel({
  subject,
  questionNo,
  solvedCorrectly
}: {
  subject: SubjectId;
  questionNo: number;
  solvedCorrectly: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [remaining, setRemaining] = useState(AI_DAILY_LIMIT);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refresh = async () => {
      const user = await refreshServiceUser();
      setLoggedIn(Boolean(user ?? getServiceUser()));
      setAdmin(isAdminUser());
      setRemaining(await getTodayAiRemainingAsync());
      setMounted(true);
    };
    void refresh();
    const unsubscribe = subscribeServiceAuthChanges(() => {
      void refresh();
    });
    return unsubscribe;
  }, []);

  const adminCanTest = mounted && loggedIn && admin && solvedCorrectly && remaining > 0;
  const memberCanClickReady = mounted && loggedIn && !admin && solvedCorrectly;
  const canClickMode = adminCanTest || memberCanClickReady;

  const reason = !mounted
    ? "이용 상태를 확인하는 중입니다."
    : !loggedIn
      ? "로그인 후 이용할 수 있습니다. 현재는 베타 준비 중인 기능입니다."
      : !solvedCorrectly
        ? "정답을 맞힌 문제에서만 사용할 수 있습니다."
        : admin
          ? remaining <= 0
            ? "오늘의 AI 문제 변형 테스트 가능 횟수를 모두 사용했습니다."
            : "관리자 계정에서만 AI 문제 변형 테스트가 가능합니다."
          : `${AI_READY_MESSAGE} AI 문제 변형 기능은 현재 관리자 테스트 중이며, 정식 서비스에서 제공될 예정입니다.`;

  const handlePrepare = async (mode: AiVariationMode) => {
    if (!loggedIn) {
      setMessage("로그인 후 이용할 수 있습니다.");
      return;
    }
    if (!solvedCorrectly) {
      setMessage("정답을 맞힌 문제에서만 AI 문제 변형을 사용할 수 있습니다.");
      return;
    }
    if (!admin) {
      setMessage(`${AI_READY_MESSAGE} AI 문제 변형 기능은 현재 관리자 테스트 중입니다.`);
      return;
    }
    if (remaining <= 0) {
      setMessage("오늘의 AI 문제 변형 테스트 가능 횟수를 모두 사용했습니다.");
      return;
    }
    await recordAiUsage(subject, questionNo, mode);
    setRemaining(await getTodayAiRemainingAsync());
    setMessage(`${AI_VARIATION_MODE_LABEL[mode]} 모드로 ${subject.toUpperCase()} ${questionNo}번 변형 테스트 요청을 기록했습니다. 실제 OpenAI API 연결은 다음 단계에서 활성화합니다.`);
  };

  return (
    <Card className="border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 shadow-none">
      <CardContent className="p-5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="premium"><WandSparkles className="mr-1 size-4" /> AI 문제 변형</Badge>
              <Badge variant={adminCanTest ? "success" : "outline"}>오늘 남은 횟수 {remaining}/{AI_DAILY_LIMIT}</Badge>
              {admin ? <Badge variant="dark">관리자 테스트</Badge> : <Badge variant="warning">서비스 준비중</Badge>}
            </div>
            <h3 className="text-lg font-black text-slate-950">정답을 맞힌 문제에서 추가 연습 문제를 만들 수 있도록 준비 중입니다.</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{reason}</p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-2xl">
            {!loggedIn ? (
              <ButtonLink href="/login" variant="premium" size="lg" className="w-full justify-center whitespace-normal"><LockKeyhole className="size-4 shrink-0" /> 로그인하기</ButtonLink>
            ) : null}
            <Button disabled={!canClickMode} onClick={() => handlePrepare("same_level")} variant="outline" size="lg" className="w-full min-w-0 justify-center whitespace-normal px-3 text-sm sm:text-base">
              <Sparkles className="size-4 shrink-0" /> 현재 난이도 유지
            </Button>
            <Button disabled={!canClickMode} onClick={() => handlePrepare("harder")} variant="outline" size="lg" className="w-full min-w-0 justify-center whitespace-normal px-3 text-sm sm:text-base">
              <WandSparkles className="size-4 shrink-0" /> 난이도 높이기
            </Button>
          </div>
        </div>
        {message ? <div className="mt-4 rounded-2xl border border-violet-100 bg-white p-4 text-sm font-semibold leading-6 text-violet-900">{message}</div> : null}
      </CardContent>
    </Card>
  );
}
