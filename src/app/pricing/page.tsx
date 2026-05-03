import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Database, LockKeyhole, MonitorSmartphone, ShieldCheck, Sparkles, UserPlus, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSubjects } from "@/lib/question-data";

export const metadata: Metadata = {
  title: "프로그래밍기능사 실기 문제은행 무료 베타 안내",
  description: "비회원은 과목별 50문항, 베타 회원은 전체 620문항을 무료로 이용할 수 있는 프로그래밍기능사 실기 문제은행 무료 베타 안내입니다.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "프로그래밍기능사 실기 문제은행 무료 베타 안내",
    description: "회원가입 시 전체 620문항을 무료로 이용할 수 있습니다."
  }
};


const betaHighlights = [
  {
    icon: LockKeyhole,
    title: "비회원 체험",
    value: "과목별 50문항",
    description: "로그인 없이 바로 문제풀이 흐름 확인",
    className: "bg-slate-50 text-slate-700"
  },
  {
    icon: UserPlus,
    title: "베타 회원",
    value: "전체 문항",
    description: "회원가입 후 전체 620문항 무료 이용",
    className: "bg-blue-50 text-blue-700"
  },
  {
    icon: WandSparkles,
    title: "AI 변형",
    value: "준비중",
    description: "일반 회원에게는 준비중 안내, 관리자만 테스트",
    className: "bg-violet-50 text-violet-700"
  }
];

const memberFeatures = [
  "SQL 200제 전체 학습",
  "Python 150제 전체 학습",
  "Java 150제 전체 학습",
  "Linux 120제 전체 학습",
  "모의고사 이용",
  "오답노트와 학습기록 저장",
  "학습 보관함과 약점 분석",
  "AI 문제 변형 UI 확인: 일반 회원은 서비스 준비중 안내"
];

const guideItems = [
  {
    icon: LockKeyhole,
    title: "비회원 무료 범위",
    description: "SQL, Python, Java, Linux 각 과목별 50문항까지 로그인 없이 풀어볼 수 있습니다."
  },
  {
    icon: MonitorSmartphone,
    title: "회원가입 후 전체 이용",
    description: "현재 베타 서비스 기간에는 회원가입만 하면 51번 이후 문제까지 전체 문제은행을 무료로 이용할 수 있습니다."
  },
  {
    icon: ShieldCheck,
    title: "정식 서비스 준비 구조",
    description: "결제/이용권 DB 구조는 남겨두지만, 현재 화면에서는 결제를 받거나 유도하지 않습니다."
  }
];

const faqs = [
  {
    q: "지금 결제를 해야 하나요?",
    a: "아니요. 현재는 무료 베타 테스트 기간이므로 결제 기능은 비활성화되어 있습니다. 회원가입하면 전체 문제를 무료로 이용할 수 있습니다."
  },
  {
    q: "비회원은 어디까지 가능한가요?",
    a: "SQL, Python, Java, Linux 각 과목별 50문항까지 로그인 없이 풀어볼 수 있습니다."
  },
  {
    q: "문제 오류는 어떻게 제보하나요?",
    a: "회원 로그인 후 문제 풀이 화면 오른쪽의 문제 오류 제보 영역에서 제보할 수 있습니다. 접수된 제보는 관리자 대시보드에서 확인합니다."
  },
  {
    q: "오답노트와 보관함은 어디에 저장되나요?",
    a: "현재 베타에서는 오답노트, 보관함, 학습 진행 상태가 사용자의 브라우저에 저장됩니다. 브라우저 데이터를 삭제하거나 다른 기기를 사용하면 기록이 이어지지 않을 수 있습니다."
  },
  {
    q: "AI 문제 변형은 사용할 수 있나요?",
    a: "일반 회원에게는 ‘서비스 준비중입니다’가 표시됩니다. 현재는 관리자 계정에서만 테스트할 수 있도록 막아두었습니다."
  }
];

export default function PricingPage() {
  const subjects = getSubjects();
  const total = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const free = subjects.reduce((sum, subject) => sum + subject.freeCount, 0);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(37,99,235,0.3),transparent_32rem),radial-gradient(circle_at_85%_5%,rgba(168,85,247,0.24),transparent_26rem)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <Badge variant="premium" className="mb-5">
            <Sparkles className="mr-1 size-4" /> 베타 서비스 안내
          </Badge>
          <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
            비회원은 과목별 50문항,
            <span className="block">회원은 베타 기간 전체 {total}문항 무료</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            현재 서비스는 무료 베타 테스트 중입니다. 회원가입한 사용자는 전체 문제은행과 모의고사, 오답노트, 학습기록 기능을 무료로 이용할 수 있으며, 문제 오류 제보를 통해 콘텐츠 품질 개선에 참여할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/subjects" size="xl" variant="premium">
              무료 문제 시작하기 <ArrowRight className="size-5" />
            </ButtonLink>
            <ButtonLink href="/signup" size="xl" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
              회원가입하고 전체 이용
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <Card className="overflow-hidden">
            <div className="bg-slate-50 p-7">
              <Badge variant="outline">비회원</Badge>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950">과목별 50문항</h2>
              <p className="mt-3 text-slate-600">회원가입 전에도 문제풀이 화면, 정답 확인, 해설 확인 흐름을 먼저 확인할 수 있습니다.</p>
            </div>
            <CardContent className="space-y-5 p-7">
              <div>
                <div className="text-4xl font-black tracking-[-0.05em] text-slate-950">무료</div>
                <p className="mt-1 text-sm font-semibold text-slate-500">로그인 없이 바로 체험</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="mb-2 flex items-center justify-between text-sm font-bold">
                  <span>비회원 공개 문항</span>
                  <span>{free}문항</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[32%] rounded-full bg-slate-950" />
                </div>
              </div>
              <ul className="space-y-3 text-sm font-semibold text-slate-700">
                <li className="flex gap-2"><CheckCircle2 className="size-5 text-emerald-600" /> 과목별 50문항 체험</li>
                <li className="flex gap-2"><CheckCircle2 className="size-5 text-emerald-600" /> 정답 확인 및 해설 흐름 확인</li>
                <li className="flex gap-2"><CheckCircle2 className="size-5 text-emerald-600" /> 51번 이후는 회원가입 안내</li>
              </ul>
              <ButtonLink href="/subjects" variant="outline" size="lg" className="w-full">무료 체험 시작</ButtonLink>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-blue-200 shadow-[0_30px_100px_rgba(37,99,235,0.16)]">
            <div className="absolute right-0 top-0 size-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="relative bg-slate-950 p-7 text-white">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="premium"><UserPlus className="mr-1 size-4" /> 베타 회원</Badge>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-200">현재 결제 없음</div>
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em]">회원가입 후 전체 문제 무료 이용</h2>
              <p className="mt-3 max-w-xl text-slate-300">
                전 과목 {total}문항을 잠금 없이 학습하고, 모의고사·오답노트·학습기록을 함께 사용할 수 있는 베타 운영 구조입니다.
              </p>
            </div>
            <CardContent className="relative space-y-6 p-7">
              <div>
                <Badge variant="outline" className="mb-3">베타 회원 포함 기능</Badge>
                <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  정식 서비스 전환 전까지는 회원가입한 사용자가 전체 문제은행을 무료로 이용합니다. AI 문제 변형은 일반 회원에게 준비중 안내만 표시됩니다.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {betaHighlights.map((item) => (
                  <div key={item.title} className={`rounded-3xl p-4 ${item.className}`}>
                    <item.icon className="mb-3 size-5" />
                    <div className="text-2xl font-black">{item.value}</div>
                    <div className="text-sm font-black">{item.title}</div>
                    <p className="mt-2 text-xs font-semibold leading-5 opacity-75">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 text-sm font-black text-slate-950">베타 회원에게 열리는 학습 범위</div>
                <ul className="grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                  {memberFeatures.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-600" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ButtonLink href="/signup" variant="premium" size="xl" className="w-full">
                  회원가입하기 <ArrowRight className="size-5" />
                </ButtonLink>
                <ButtonLink href="/login" variant="outline" size="xl" className="w-full">
                  이미 계정이 있어요
                </ButtonLink>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {guideItems.map((item) => (
            <Card key={item.title} className="border-slate-100 bg-white/80">
              <CardContent className="p-6">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <item.icon className="size-5" />
                </div>
                <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2.5rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 md:p-8 lg:grid-cols-[0.75fr_1.25fr] lg:p-10">
          <div>
            <Badge variant="outline" className="mb-4"><HelpIcon /> 자주 묻는 질문</Badge>
            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950">베타 운영 기준</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">정식 서비스 전환 전까지는 결제 없이 회원 기반 피드백과 오류 제보를 먼저 받는 구조입니다.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-slate-950">
                  {item.q}
                  <span className="text-slate-400 transition group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function HelpIcon() {
  return <Database className="mr-1 size-4" />;
}
