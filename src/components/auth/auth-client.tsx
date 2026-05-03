"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, LogIn, LogOut, Mail, ShieldCheck, Sparkles, UserCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FREE_LIMIT_PER_SUBJECT } from "@/lib/constants";
import {
  checkEmailAvailability,
  getServiceUser,
  isValidEmail,
  isValidPassword,
  refreshServiceUser,
  signInWithPassword,
  signOutService,
  signUpWithPassword,
  subscribeServiceAuthChanges
} from "@/lib/service-auth";
import type { ServiceUser } from "@/types/service";

type MessageTone = "info" | "success" | "error";
type EmailCheckState = "idle" | "checking" | "available" | "duplicate" | "error";

function getPasswordGuide(password: string) {
  if (!password) return "8자 이상 입력해 주세요.";
  if (password.length < 8) return `현재 ${password.length}자입니다. 8자 이상 입력해 주세요.`;
  return "사용 가능한 비밀번호 길이입니다.";
}

function roleLabel(user: ServiceUser | null) {
  if (!user) return "미로그인";
  return user.role === "admin" ? "관리자 테스트 계정" : "일반 베타 회원";
}

export function AuthClient({ mode }: { mode: "login" | "signup" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [emailCheckState, setEmailCheckState] = useState<EmailCheckState>("idle");
  const [checkedEmail, setCheckedEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const [currentUser, setCurrentUser] = useState<ServiceUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const emailCheckRequestRef = useRef(0);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const validEmail = isValidEmail(normalizedEmail);
  const validPassword = isValidPassword(password);
  const passwordsMatch = password.length > 0 && password === passwordConfirm;
  const emailCheckedForCurrentValue = emailCheckState === "available" && checkedEmail === normalizedEmail;

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const user = await refreshServiceUser();
      if (active) setCurrentUser(user ?? getServiceUser());
    };
    void refresh();
    const unsubscribe = subscribeServiceAuthChanges(() => {
      setCurrentUser(getServiceUser());
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const showMessage = (text: string, tone: MessageTone = "info") => {
    setMessage(text);
    setMessageTone(tone);
  };

  const normalizeEmailCheckErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    return message.includes("잠시 후")
      ? message
      : "이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  };

  const handleEmailChange = (value: string) => {
    emailCheckRequestRef.current += 1;
    setEmailChecking(false);
    setEmail(value);
    setMessage("");
    if (value.trim().toLowerCase() !== checkedEmail) {
      setEmailCheckState("idle");
      setCheckedEmail("");
    }
  };

  const handleCheckEmail = async () => {
    if (!validEmail) {
      setEmailCheckState("error");
      showMessage("올바른 이메일 주소를 입력해 주세요.", "error");
      return;
    }

    const requestId = emailCheckRequestRef.current + 1;
    const emailToCheck = normalizedEmail;
    emailCheckRequestRef.current = requestId;

    setEmailChecking(true);
    setEmailCheckState("checking");
    showMessage("이메일 중복확인중입니다.", "info");

    try {
      const available = await checkEmailAvailability(emailToCheck);
      if (emailCheckRequestRef.current !== requestId || emailToCheck !== email.trim().toLowerCase()) return;

      setCheckedEmail(emailToCheck);
      if (available) {
        setEmailCheckState("available");
        showMessage("사용 가능한 이메일입니다. 비밀번호를 입력한 뒤 회원가입을 완료해 주세요.", "success");
      } else {
        setEmailCheckState("duplicate");
        showMessage("이미 가입된 이메일입니다. 로그인 화면에서 로그인해 주세요.", "error");
      }
    } catch (error) {
      if (emailCheckRequestRef.current !== requestId || emailToCheck !== email.trim().toLowerCase()) return;
      setEmailCheckState("error");
      showMessage(normalizeEmailCheckErrorMessage(error), "error");
    } finally {
      if (emailCheckRequestRef.current === requestId) setEmailChecking(false);
    }
  };

  const handleSignup = async () => {
    if (name.trim().length < 2) {
      showMessage("이름을 2자 이상 입력해 주세요.", "error");
      return;
    }
    if (!validEmail) {
      showMessage("올바른 이메일 주소를 입력해 주세요.", "error");
      return;
    }
    if (!emailCheckedForCurrentValue) {
      showMessage("이메일 중복 확인을 먼저 해 주세요.", "error");
      return;
    }
    if (!validPassword) {
      showMessage("비밀번호는 8자 이상으로 입력해 주세요.", "error");
      return;
    }
    if (!passwordsMatch) {
      showMessage("비밀번호 확인이 일치하지 않습니다.", "error");
      return;
    }
    if (!agree) {
      showMessage("베타 서비스 이용 안내에 동의해 주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithPassword({
        name,
        email: normalizedEmail,
        password,
        skipEmailAvailabilityCheck: true
      });
      if (!result.needsEmailConfirmation) setCurrentUser(result.user);
      showMessage(
        result.needsEmailConfirmation
          ? "회원가입이 접수되었습니다. Supabase 이메일 확인 설정이 켜져 있어 메일 인증 후 로그인할 수 있습니다. 베타 테스트를 바로 진행하려면 Supabase Auth 설정에서 Confirm email을 꺼 주세요."
          : `회원가입이 완료되었습니다. 현재 계정은 ${result.user.email}이며 권한은 ${roleLabel(result.user)}입니다. 상단 버튼과 마이페이지에서 로그인 상태를 바로 확인할 수 있습니다.`,
        result.needsEmailConfirmation ? "info" : "success"
      );
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validEmail) {
      showMessage("올바른 이메일 주소를 입력해 주세요.", "error");
      return;
    }
    if (!password) {
      showMessage("비밀번호를 입력해 주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      const user = await signInWithPassword(normalizedEmail, password);
      setCurrentUser(user);
      showMessage(`로그인 성공: ${user.email} · ${roleLabel(user)}. 이제 상단 오른쪽 버튼이 ‘회원’ 또는 ‘관리자’와 ‘문제 풀기’로 바뀌고, 마이페이지에서 동일한 상태를 확인할 수 있습니다.`, "success");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutService();
    showMessage("로그아웃되었습니다.", "success");
  };

  const messageClass = messageTone === "error"
    ? "border-rose-100 bg-rose-50 text-rose-950"
    : messageTone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-950"
      : "border-blue-100 bg-blue-50 text-blue-950";

  const emailHelper = mode === "signup"
    ? emailCheckState === "available"
      ? "사용 가능한 이메일입니다."
      : emailCheckState === "duplicate"
        ? "이미 가입된 이메일입니다. 로그인해 주세요."
        : emailCheckState === "checking"
          ? "이메일 중복확인중입니다."
          : "회원가입 전에 이메일 중복 확인을 해 주세요."
    : "가입한 이메일 주소를 입력해 주세요.";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="pt-4">
          <Badge variant="premium" className="mb-5"><Sparkles className="mr-1 size-4" /> v7.2.6 로그인 상태 표시 개선</Badge>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">
            {mode === "signup" ? "회원가입만 하면" : "로그인하고"}<br />전체 문제를 무료로 학습하세요
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            비회원은 과목별 {FREE_LIMIT_PER_SUBJECT}문항까지 바로 체험할 수 있습니다. 회원가입한 사용자는 베타 기간 동안 전체 620문항과 모의고사·오답노트·학습기록 기능을 무료로 이용할 수 있습니다.
          </p>
          <div className="mt-7 grid gap-3 text-sm font-semibold text-slate-700">
            {[
              "구글·카카오·인증번호 없이 이메일과 비밀번호로 간단하게 시작합니다.",
              "회원가입 전 이메일 중복 여부를 확인해 불필요한 가입 실패를 줄였습니다.",
"로그인되면 상단 오른쪽 ‘회원/관리자’ 버튼과 마이페이지에서 로그인 상태를 바로 확인할 수 있습니다."
            ].map((item) => (
              <div key={item} className="flex gap-2"><CheckCircle2 className="size-5 shrink-0 text-emerald-600" /> {item}</div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm font-semibold leading-7 text-blue-950">
            베타 기간에는 결제 기능을 노출하지 않습니다. 나중에 정식 서비스로 전환할 때 30일 이용권과 AI 문제 변형 기능을 활성화할 수 있도록 DB 구조는 유지되어 있습니다.
          </div>
        </section>

        <Card className="overflow-hidden border-blue-100 shadow-[0_30px_100px_rgba(37,99,235,0.12)]">
          <div className="bg-slate-950 p-6 text-white">
            <Badge variant="premium" className="mb-3"><LogIn className="mr-1 size-4" /> 계정</Badge>
            <h2 className="text-2xl font-black tracking-[-0.04em]">{mode === "signup" ? "새 계정 만들기" : "계정으로 로그인"}</h2>
            {currentUser ? <p className="mt-2 text-sm font-semibold text-blue-100">현재 로그인: {currentUser.email}</p> : null}
          </div>
          <CardContent className="space-y-5 p-6 sm:p-7">
            {currentUser ? (
              <div className="space-y-5">
                <div className={`rounded-[1.75rem] border p-5 ${currentUser.role === "admin" ? "border-violet-200 bg-violet-50 text-violet-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black text-slate-500">현재 로그인된 계정</div>
                      <div className="mt-1 text-2xl font-black text-slate-950">{currentUser.email}</div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">권한: {roleLabel(currentUser)}</p>
                    </div>
                    <Badge variant={currentUser.role === "admin" ? "premium" : "success"}>
                      {currentUser.role === "admin" ? <ShieldCheck className="mr-1 size-4" /> : <UserCheck className="mr-1 size-4" />}
                      {currentUser.role === "admin" ? "관리자 로그인됨" : "로그인됨"}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-black text-slate-500">이용 상태</div>
                      <div className="mt-2 text-lg font-black text-slate-950">{currentUser.role === "admin" ? "관리자 테스트 권한 활성" : "베타 회원 전체 이용 가능"}</div>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {currentUser.role === "admin"
                          ? "관리자 대시보드, 오류 제보 관리, AI 테스트 흐름을 확인할 수 있습니다."
                          : "베타 기간 동안 전체 문제와 오답노트·학습기록 기능을 무료로 이용할 수 있습니다."}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-black text-slate-500">바로가기 안내</div>
                      <div className="mt-2 text-lg font-black text-slate-950">입력 폼 숨김 상태</div>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        이미 로그인된 상태이므로 이메일·비밀번호 입력창은 숨겼습니다. 아래 버튼으로 바로 이동하세요.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ButtonLink href="/account" variant="outline" size="lg" className="w-full">마이페이지로 이동</ButtonLink>
                  <ButtonLink href="/subjects" variant="premium" size="lg" className="w-full text-white hover:text-white">문제 풀러 가기</ButtonLink>
                  {currentUser.role === "admin" ? <ButtonLink href="/admin" variant="premium" size="lg" className="w-full text-white hover:text-white"><ShieldCheck className="size-4" /> 관리자 대시보드</ButtonLink> : null}
                  <Button onClick={handleLogout} variant="outline" size="lg" className="w-full"><LogOut className="size-4" /> 로그아웃</Button>
                </div>

                {message ? <div className={`rounded-2xl border p-4 text-sm font-semibold leading-6 ${messageClass}`}>{message}</div> : null}

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
                  {currentUser.role === "admin"
                    ? "관리자 계정은 마이페이지에서 관리자 대시보드로 이동할 수 있으며, 필요할 때 바로 로그아웃할 수 있습니다."
                    : "일반 회원은 마이페이지에서 로그인 상태와 베타 이용 권한을 확인할 수 있습니다."}
                </div>
              </div>
            ) : (
              <>
                {mode === "signup" ? (
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-950">이름</label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="예: 김진원"
                        className="h-12 rounded-2xl bg-slate-50 pl-10"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-950">이메일</label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={email}
                        onChange={(event) => handleEmailChange(event.target.value)}
                        placeholder="name@example.com"
                        className="h-12 rounded-2xl bg-slate-50 pl-10"
                        inputMode="email"
                        autoComplete="email"
                      />
                    </div>
                    {mode === "signup" ? (
                      <Button onClick={handleCheckEmail} disabled={emailChecking || loading || !validEmail} variant="outline" size="lg" className="w-full sm:w-auto">
                        {emailChecking ? "확인 중" : "중복 확인"}
                      </Button>
                    ) : null}
                  </div>
                  <p className={`mt-2 text-xs font-semibold leading-5 ${emailCheckState === "available" ? "text-emerald-600" : emailCheckState === "duplicate" ? "text-rose-600" : "text-slate-500"}`}>
                    {emailHelper}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-950">비밀번호</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="8자 이상 입력"
                      type={showPassword ? "text" : "password"}
                      className="h-12 rounded-2xl bg-slate-50 pl-10 pr-11"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className={`mt-2 text-xs font-semibold ${validPassword ? "text-emerald-600" : "text-slate-500"}`}>{mode === "signup" ? getPasswordGuide(password) : "가입한 비밀번호를 입력해 주세요."}</p>
                </div>

                {mode === "signup" ? (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-950">비밀번호 확인</label>
                      <div className="relative">
                        <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={passwordConfirm}
                          onChange={(event) => setPasswordConfirm(event.target.value)}
                          placeholder="비밀번호를 한 번 더 입력"
                          type={showPasswordConfirm ? "text" : "password"}
                          className="h-12 rounded-2xl bg-slate-50 pl-10 pr-11"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={showPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                        >
                          {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <p className={`mt-2 text-xs font-semibold ${passwordConfirm ? passwordsMatch ? "text-emerald-600" : "text-rose-600" : "text-slate-500"}`}>
                        {passwordConfirm ? passwordsMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다." : "비밀번호 확인을 입력해 주세요."}
                      </p>
                    </div>

                    <label className="flex cursor-pointer gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(event) => setAgree(event.target.checked)}
                        className="mt-1 size-4 rounded border-slate-300"
                      />
                      <span>
                        베타 서비스 이용 안내에 동의합니다. 현재 베타 기간에는 전체 문제를 무료로 제공하며, AI 문제 변형과 결제 기능은 정식 서비스 전환 시 제공될 수 있습니다.
                      </span>
                    </label>
                  </>
                ) : null}

                <Button
                  onClick={mode === "signup" ? handleSignup : handleLogin}
                  disabled={loading || emailChecking}
                  variant="premium"
                  size="xl"
                  className="w-full text-white hover:text-white"
                >
                  {loading ? "처리 중입니다" : mode === "signup" ? "회원가입 완료하기" : "로그인하기"} <ArrowRight className="size-5" />
                </Button>

                {message ? <div className={`rounded-2xl border p-4 text-sm font-semibold leading-6 ${messageClass}`}>{message}</div> : null}

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
                  {mode === "signup" ? "이미 계정이 있다면 로그인 화면으로 이동하세요." : "아직 계정이 없다면 회원가입 후 전체 문제를 무료로 이용하세요."}
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row">
                  <ButtonLink href={mode === "signup" ? "/login" : "/signup"} variant="outline" size="lg" className="w-full">
                    {mode === "signup" ? "로그인하러 가기" : "회원가입하기"}
                  </ButtonLink>
                  <ButtonLink href="/subjects" variant="ghost" size="lg" className="w-full">무료 문제 풀기</ButtonLink>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
