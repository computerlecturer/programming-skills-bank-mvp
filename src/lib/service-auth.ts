"use client";

import { AI_DAILY_LIMIT, BETA_MEMBERS_FULL_ACCESS, PAID_ACCESS_DAYS, PAID_PLAN_CODE } from "@/lib/constants";
import type { AiVariationMode } from "@/lib/constants";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-client";
import type { ServiceUser, UserEntitlement, AiUsageLog } from "@/types/service";
import type { SubjectId } from "@/types/question";

const USER_KEY = "psb:service:user";
const ENTITLEMENT_KEY = "psb:service:entitlement";
const AI_USAGE_KEY = "psb:service:ai-usage";
const AUTH_EVENT = "psb-service-auth-change";
const EMAIL_CHECK_TIMEOUT_MS = 8000;
let refreshServiceUserPromise: Promise<ServiceUser | null> | null = null;


function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T, notify = true) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  if (notify) dispatchAuthChange();
}

function removeItem(key: string, notify = true) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
  if (notify) dispatchAuthChange();
}

function dispatchAuthChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

function inferRole(email: string): ServiceUser["role"] {
  const normalized = email.trim().toLowerCase();
  return normalized === "admin@example.com" || normalized === "admin@psb.test" || normalized.startsWith("admin+") ? "admin" : "user";
}

function profileToServiceUser(profile: {
  id: string;
  email: string | null;
  name?: string | null;
  role?: "user" | "admin" | string | null;
  created_at?: string | null;
}): ServiceUser {
  const email = (profile.email ?? "").toLowerCase();
  return {
    id: profile.id,
    email,
    name: profile.name ?? undefined,
    provider: "email",
    role: profile.role === "admin" ? "admin" : "user",
    createdAt: profile.created_at ?? new Date().toISOString()
  };
}

function authUserToServiceUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}): ServiceUser {
  const email = (user.email ?? "").toLowerCase();
  const rawName = user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.nickname;
  return {
    id: user.id,
    email,
    name: typeof rawName === "string" ? rawName : undefined,
    provider: "email",
    role: inferRole(email),
    createdAt: user.created_at ?? new Date().toISOString()
  };
}

async function ensureProfileForAuthUser(authUser: Parameters<typeof authUserToServiceUser>[0]) {
  const fallback = authUserToServiceUser(authUser);
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    writeJson(USER_KEY, fallback, false);
    return fallback;
  }

  const profilePayload = {
    id: fallback.id,
    email: fallback.email,
    name: fallback.name ?? null,
    updated_at: new Date().toISOString()
  };

  try {
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });
    if (upsertError) console.warn("profiles upsert skipped:", upsertError.message);
  } catch (error) {
    console.warn("profiles upsert skipped:", error);
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,name,role,created_at")
    .eq("id", fallback.id)
    .maybeSingle();

  const user = data ? profileToServiceUser(data) : fallback;
  writeJson(USER_KEY, user, false);
  return user;
}

function normalizeAuthError(error: unknown, fallback = "처리 중 오류가 발생했습니다.") {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (lower.includes("email not confirmed")) return "이메일 인증이 필요한 계정입니다. 메일함에서 인증을 완료한 뒤 로그인해 주세요.";
  if (lower.includes("user already registered") || lower.includes("already registered") || lower.includes("already been registered")) return "이미 가입된 이메일입니다. 로그인 화면에서 로그인해 주세요.";
  if (lower.includes("password")) return "비밀번호는 8자 이상으로 입력해 주세요.";
  if (lower.includes("rate limit")) return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  return message || fallback;
}

export function getServiceUser() {
  return readJson<ServiceUser | null>(USER_KEY, null);
}

export function isLoggedIn() {
  return Boolean(getServiceUser());
}

export function isAdminUser() {
  return getServiceUser()?.role === "admin";
}

export function hasBetaFullAccess() {
  return BETA_MEMBERS_FULL_ACCESS && isLoggedIn();
}

async function refreshServiceUserInternal() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return getServiceUser();

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    const hadCachedUser = Boolean(getServiceUser());
    removeItem(USER_KEY, false);
    if (hadCachedUser) dispatchAuthChange();
    return null;
  }

  return ensureProfileForAuthUser(data.session.user);
}

export async function refreshServiceUser() {
  // React Strict Mode와 여러 컴포넌트의 동시 마운트에서 getSession()이 중복 호출되면
  // @supabase/gotrue-js lock 경고가 발생할 수 있어 진행 중인 요청을 공유합니다.
  if (refreshServiceUserPromise) return refreshServiceUserPromise;

  refreshServiceUserPromise = refreshServiceUserInternal().finally(() => {
    refreshServiceUserPromise = null;
  });

  return refreshServiceUserPromise;
}

export async function hasBetaFullAccessAsync() {
  const cachedUser = getServiceUser();
  const user = cachedUser ?? await refreshServiceUser();
  return BETA_MEMBERS_FULL_ACCESS && Boolean(user);
}

export function subscribeServiceAuthChanges(onChange: () => void) {
  const handleLocalChange = () => onChange();

  if (typeof window !== "undefined") {
    window.addEventListener(AUTH_EVENT, handleLocalChange);
    window.addEventListener("storage", handleLocalChange);
  }

  // v7.2.5: Supabase onAuthStateChange 내부에서 다시 Supabase 작업을 실행하면
  // gotrue-js auth lock 경고가 발생할 수 있습니다. 이 MVP는 signIn/signUp/signOut에서
  // 직접 AUTH_EVENT를 발생시키므로 여기서는 앱 내부 이벤트만 구독합니다.
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener(AUTH_EVENT, handleLocalChange);
      window.removeEventListener("storage", handleLocalChange);
    }
  };
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, timeoutMessage: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function checkEmailAvailability(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) throw new Error("올바른 이메일 주소를 입력해 주세요.");

  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) {
    return !normalized.includes("used") && !normalized.includes("duplicate");
  }

  try {
    const result = await withTimeout(
      supabase.rpc("is_email_available", { check_email: normalized }),
      EMAIL_CHECK_TIMEOUT_MS,
      "이메일 중복 확인 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
    ) as { data: boolean | null; error: unknown | null };

    if (result.error) {
      throw new Error("이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }

    return Boolean(result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("시간이 초과")) throw error;
    throw new Error("이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function signUpWithPassword({
  name,
  email,
  password,
  skipEmailAvailabilityCheck = false
}: {
  name: string;
  email: string;
  password: string;
  skipEmailAvailabilityCheck?: boolean;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (trimmedName.length < 2) throw new Error("이름을 2자 이상 입력해 주세요.");
  if (!isValidEmail(normalizedEmail)) throw new Error("올바른 이메일 주소를 입력해 주세요.");
  if (!isValidPassword(password)) throw new Error("비밀번호는 8자 이상으로 입력해 주세요.");

  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) {
    const user = signInDemo(normalizedEmail, trimmedName);
    return { user, needsEmailConfirmation: false };
  }

  if (!skipEmailAvailabilityCheck) {
    const available = await checkEmailAvailability(normalizedEmail);
    if (!available) throw new Error("이미 가입된 이메일입니다. 로그인 화면에서 로그인해 주세요.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { name: trimmedName, full_name: trimmedName }
    }
  });

  if (error) throw new Error(normalizeAuthError(error, "회원가입 중 오류가 발생했습니다."));
  if (!data.user) throw new Error("회원가입 정보를 확인하지 못했습니다. 다시 시도해 주세요.");

  if (!data.session) {
    // Supabase에서 이메일 확인이 켜져 있으면 아직 로그인 세션이 없습니다.
    // 이 경우 로컬에 로그인 상태를 저장하지 않고, 메일 인증 후 로그인하도록 안내합니다.
    return { user: authUserToServiceUser(data.user), needsEmailConfirmation: true };
  }

  const user = await ensureProfileForAuthUser(data.user);
  dispatchAuthChange();
  return { user, needsEmailConfirmation: false };
}

export async function signInWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) throw new Error("올바른 이메일 주소를 입력해 주세요.");
  if (!password) throw new Error("비밀번호를 입력해 주세요.");

  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) {
    return signInDemo(normalizedEmail);
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
  if (error) throw new Error(normalizeAuthError(error, "로그인 중 오류가 발생했습니다."));
  if (!data.user) throw new Error("로그인 세션을 확인하지 못했습니다. 다시 로그인해 주세요.");
  const user = await ensureProfileForAuthUser(data.user);
  dispatchAuthChange();
  return user;
}

export async function exchangeAuthCodeForSession(code: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) return null;
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  if (!data.user) return null;
  const user = await ensureProfileForAuthUser(data.user);
  dispatchAuthChange();
  return user;
}

export async function signOutService() {
  const supabase = getSupabaseBrowserClient();
  if (supabase && hasSupabaseConfig()) await supabase.auth.signOut();
  removeItem(USER_KEY);
}

// 환경변수 미설정 시 로컬 구조 검증용으로만 사용하는 fallback입니다.
export function signInDemo(email: string, name?: string) {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) throw new Error("올바른 이메일을 입력해 주세요.");
  const existing = getServiceUser();
  const role = existing?.email === normalized ? existing.role ?? inferRole(normalized) : inferRole(normalized);
  const user: ServiceUser = {
    id: existing?.email === normalized ? existing.id : uid("user"),
    email: normalized,
    name: name?.trim() || existing?.name,
    provider: "email",
    role,
    createdAt: existing?.createdAt ?? new Date().toISOString()
  };
  writeJson(USER_KEY, user, false);
  dispatchAuthChange();
  return user;
}

export function signOutDemo() {
  void signOutService();
}

// 향후 유료 전환 대비용. 현재 베타 UI에서는 결제/이용권 구매를 노출하지 않습니다.
export function getEntitlement() {
  return readJson<UserEntitlement | null>(ENTITLEMENT_KEY, null);
}

export function hasActiveEntitlement() {
  const user = getServiceUser();
  const entitlement = getEntitlement();
  if (!user || !entitlement) return false;
  if (entitlement.userId !== user.id) return false;
  if (entitlement.status !== "active") return false;
  return new Date(entitlement.expiresAt).getTime() > Date.now();
}

export function getEntitlementStatusLabel() {
  const entitlement = getEntitlement();
  if (!entitlement) return "정식 서비스 전환 시 이용권 제공 예정";
  if (!hasActiveEntitlement()) return "이용권 만료";
  const days = Math.max(0, Math.ceil((new Date(entitlement.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return `30일 이용권 활성 · ${days}일 남음`;
}

export function grantDemoEntitlement(days = PAID_ACCESS_DAYS) {
  const user = getServiceUser();
  if (!user) throw new Error("로그인 후 테스트 이용권을 부여할 수 있습니다.");
  const starts = new Date();
  const expires = new Date(starts);
  expires.setDate(expires.getDate() + days);
  const entitlement: UserEntitlement = {
    id: uid("ent"),
    userId: user.id,
    planCode: PAID_PLAN_CODE,
    status: "active",
    startsAt: starts.toISOString(),
    expiresAt: expires.toISOString(),
    createdAt: starts.toISOString()
  };
  writeJson(ENTITLEMENT_KEY, entitlement);
  return entitlement;
}

export function clearDemoEntitlement() {
  removeItem(ENTITLEMENT_KEY);
}

export function getAiUsageLogs() {
  return readJson<AiUsageLog[]>(AI_USAGE_KEY, []);
}

export function getTodayAiUsageCount() {
  const user = getServiceUser();
  if (!user) return 0;
  const day = todayKey();
  return getAiUsageLogs().filter((log) => log.userId === user.id && log.usedDate === day).length;
}

export async function getTodayAiUsageCountAsync() {
  const user = getServiceUser() ?? await refreshServiceUser();
  if (!user) return 0;
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !hasSupabaseConfig()) return getTodayAiUsageCount();

  const { count, error } = await supabase
    .from("ai_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("used_date", todayKey());

  if (error) return getTodayAiUsageCount();
  return count ?? 0;
}

export function getTodayAiRemaining() {
  return Math.max(0, AI_DAILY_LIMIT - getTodayAiUsageCount());
}

export async function getTodayAiRemainingAsync() {
  const count = await getTodayAiUsageCountAsync();
  return Math.max(0, AI_DAILY_LIMIT - count);
}

export async function recordAiUsage(subject: SubjectId, questionNo: number, mode: AiVariationMode) {
  const user = getServiceUser() ?? await refreshServiceUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const log: AiUsageLog = {
    id: uid("ai"),
    userId: user.id,
    subject,
    questionNo,
    mode,
    usedDate: todayKey(),
    createdAt: new Date().toISOString()
  };

  const supabase = getSupabaseBrowserClient();
  if (supabase && hasSupabaseConfig()) {
    const { error } = await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      source_subject: subject,
      source_question_no: questionNo,
      variation_mode: mode,
      used_date: todayKey()
    });
    if (!error) {
      writeJson(AI_USAGE_KEY, [log, ...getAiUsageLogs()]);
      return log;
    }
  }

  writeJson(AI_USAGE_KEY, [log, ...getAiUsageLogs()]);
  return log;
}
