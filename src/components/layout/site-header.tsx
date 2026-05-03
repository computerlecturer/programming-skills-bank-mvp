"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, ChevronRight, LogIn, NotebookTabs, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { getServiceUser, isAdminUser, refreshServiceUser, subscribeServiceAuthChanges } from "@/lib/service-auth";
import type { ServiceUser } from "@/types/service";

const navItems = [
  { href: "/subjects", label: "과목" },
  { href: "/mock-exam", label: "모의고사" },
  { href: "/wrong-notes", label: "오답" },
  { href: "/my-study", label: "보관함" },
  { href: "/pricing", label: "베타 안내" }
];

function roleLabel(user: ServiceUser | null) {
  if (!user) return "미로그인";
  return user.role === "admin" ? "관리자" : "회원";
}

export function SiteHeader() {
  const [user, setUser] = useState<ServiceUser | null>(null);
  const [admin, setAdmin] = useState(false);
  const loggedIn = Boolean(user);

  useEffect(() => {
    const refresh = async () => {
      const latestUser = await refreshServiceUser();
      const nextUser = latestUser ?? getServiceUser();
      setUser(nextUser);
      setAdmin(nextUser?.role === "admin" || isAdminUser());
    };

    void refresh();
    const unsubscribe = subscribeServiceAuthChanges(() => {
      void refresh();
    });
    return unsubscribe;
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white shadow-[0_16px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-lg shadow-blue-950/30">
            <BookOpenCheck className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="max-w-[170px] truncate text-base font-black tracking-[-0.03em] sm:max-w-[230px] sm:text-lg lg:max-w-[270px]">
              프로그래밍기능사 실기연구소
            </div>
            <div className="hidden max-w-[270px] truncate text-xs font-semibold text-slate-400 xl:block">
              SQL · Python · Java · Linux 실전 문제은행
            </div>
          </div>
        </Link>

        <nav className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white xl:px-3.5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/wrong-notes" className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden" aria-label="오답노트">
            <NotebookTabs className="size-5" />
          </Link>

          {loggedIn ? (
            <>
              <Link
                href="/account"
                title={user?.email}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 text-sm font-black text-white transition hover:bg-white/15 sm:inline-flex"
              >
                {admin ? <ShieldCheck className="size-4 text-violet-300" /> : <UserCheck className="size-4 text-emerald-300" />}
                <span className="whitespace-nowrap">{roleLabel(user)}</span>
              </Link>
              <ButtonLink href="/subjects" size="sm" variant="premium" className="hidden sm:inline-flex">
                문제 풀기 <ChevronRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/account" size="icon" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white hover:text-slate-950 sm:hidden" aria-label="마이페이지">
                {admin ? <ShieldCheck className="size-4" /> : <UserCheck className="size-4" />}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/login" size="sm" variant="outline" className="hidden border-white/20 bg-white/5 text-white hover:bg-white hover:text-slate-950 sm:inline-flex">
                <LogIn className="size-4" /> 로그인
              </ButtonLink>
              <ButtonLink href="/subjects" size="sm" variant="premium" className="hidden sm:inline-flex">
                무료 시작 <ChevronRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/subjects" size="icon" variant="premium" className="sm:hidden" aria-label="무료 시작">
                <Sparkles className="size-4" />
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
