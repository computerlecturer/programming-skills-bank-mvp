import { ArrowRight, CheckCircle2, Code2, CreditCard, Database, LockKeyhole, MonitorSmartphone, NotebookPen, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectCard } from "@/components/subject/subject-card";
import { HomeStudyDashboard } from "@/components/dashboard/home-study-dashboard";
import { getAllQuestions, getSubjects } from "@/lib/question-data";

const featureItems = [
  { icon: Target, title: "2026 실기형 문제 흐름", description: "짧은 코드 해석, SQL 작성, Linux 명령어, 출력 결과 예측 문제를 과목별로 반복 훈련합니다." },
  { icon: NotebookPen, title: "틀린 문제 자동 복습", description: "오답은 자동으로 복습 목록에 저장되고, 다시 풀어 정답 처리하면 목록에서 정리됩니다." },
  { icon: MonitorSmartphone, title: "PC·모바일 이어 학습", description: "수업 중에는 PC로, 이동 중에는 휴대폰으로 현재 진도와 오답을 이어서 확인할 수 있습니다." },
  { icon: LockKeyhole, title: "과목별 50문항 무료 체험", description: "비회원도 SQL, Python, Java, Linux를 각각 50문항까지 바로 풀어볼 수 있습니다." }
];

const steps = [
  { title: "무료 50문항 체험", description: "실제 문제풀이 화면에서 답안을 입력하며 시험 흐름을 먼저 확인합니다." },
  { title: "정답 확인과 AI 변형 준비", description: "정답을 맞힌 문제에서만 AI 문제 변형 버튼이 열리도록 권한 흐름을 준비했습니다." },
  { title: "베타 회원 복습 기능", description: "회원가입한 베타 회원은 전체 문제, 오답노트, 모의고사, 학습기록 저장으로 복습 루틴을 만듭니다." }
];

const trustItems = [
  "SQL · Python · Java · Linux 4개 과목 분리 학습",
  "총 620문항 기반 실전 반복 훈련",
  "정답률·진도·오답 기록 로그인 후 저장",
  "과목별 50문항 체험 후 회원가입으로 전체 이용"
];

export default function HomePage() {
  const subjects = getSubjects();
  const allQuestions = Object.values(getAllQuestions()).flat();
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const totalFree = subjects.reduce((sum, subject) => sum + subject.freeCount, 0);

  return (
    <main className="overflow-hidden">
      <section className="relative bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.30),transparent_32rem),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.22),transparent_28rem),linear-gradient(180deg,rgba(15,23,42,0)_0%,#020617_100%)]" />
        <div className="absolute inset-0 opacity-[0.065] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <Badge variant="premium" className="mb-6 w-fit py-1.5 text-sm">
              <Sparkles className="mr-1 size-4" /> 2026 프로그래밍기능사 실기 대비
            </Badge>
            <h1 className="max-w-4xl text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl lg:text-[4.7rem] lg:leading-[0.98]">
              문제풀이로
              <span className="block text-blue-100">실기 합격 루틴을</span>
              <span className="block">만드세요</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              SQL · Python · Java · Linux 총 {totalQuestions}문항을 과목별로 풀고, 비회원은 50문항까지 체험하며, 회원가입 후 베타 기간 전체 문제를 무료로 학습합니다.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/subjects" size="xl" variant="premium">
                무료 문제 시작하기 <ArrowRight className="size-5" />
              </ButtonLink>
              <ButtonLink href="/pricing" size="xl" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <CreditCard className="size-5" /> 베타 이용 안내
              </ButtonLink>
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
                <div className="text-3xl font-black">{totalQuestions}</div>
                <div className="mt-1 text-sm font-semibold text-slate-400">총 문항</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
                <div className="text-3xl font-black">4</div>
                <div className="mt-1 text-sm font-semibold text-slate-400">과목 구성</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
                <div className="text-3xl font-black">{totalFree}</div>
                <div className="mt-1 text-sm font-semibold text-slate-400">무료 체험</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
                <div className="text-3xl font-black">전체</div>
                <div className="mt-1 text-sm font-semibold text-slate-400">베타 회원</div>
              </div>
            </div>
          </div>

          <div className="relative space-y-5">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-blue-500/18 to-violet-500/18 blur-3xl" />
            <div className="relative">
              <HomeStudyDashboard subjects={subjects} questions={allQuestions} />
            </div>
            <Card className="relative overflow-hidden border-white/10 bg-white/[0.08] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Badge variant="outline" className="border-white/15 bg-white/10 text-slate-200">문제풀이 미리보기</Badge>
                  <Badge variant="warning">51번 이후 잠금</Badge>
                </div>
                <div className="rounded-[1.75rem] bg-slate-950/80 p-5 ring-1 ring-white/10">
                  <div className="text-sm font-bold text-blue-300">SQL 051</div>
                  <div className="mt-1 text-xl font-black text-white">51번 이후 베타 회원 전용</div>
                  <div className="mt-5 space-y-3 rounded-2xl bg-white/5 p-4 font-mono text-sm text-slate-300">
                    <div><span className="text-sky-300">SELECT</span> COUNT(*) <span className="text-sky-300">AS</span> ans</div>
                    <div><span className="text-sky-300">FROM</span> 사원</div>
                    <div><span className="text-sky-300">GROUP BY</span> 부서</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge variant="dark" className="mb-4">과목별 문제은행</Badge>
            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">필요한 과목부터 바로 학습하세요</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">최근 학습 위치, 정답률, 오답 상태를 확인하고 원하는 과목부터 바로 이어갈 수 있습니다.</p>
          </div>
          <ButtonLink href="/subjects" variant="outline" size="lg" className="md:self-end">전체 과목 보기 <ArrowRight className="size-4" /></ButtonLink>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge variant="premium" className="mb-4">학습 흐름</Badge>
              <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">풀고, 확인하고, 다시 푸는 구조</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">실기 대비에서 중요한 것은 많은 문제를 한 번 보는 것이 아니라, 틀린 문제를 다시 맞힐 수 있게 만드는 복습 흐름입니다.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <Card key={step.title} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">{index + 1}</div>
                    <h3 className="text-lg font-black text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-9 text-center">
          <Badge variant="outline" className="mb-4">왜 이 문제은행인가요?</Badge>
          <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">합격 준비가 관리되는 실기 플랫폼</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">문제 수만 많은 사이트가 아니라, 학습 위치와 오답 복습이 이어지도록 구성했습니다.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureItems.map((item) => (
            <Card key={item.title} className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  <item.icon className="size-6" />
                </div>
                <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50">
          <CardContent className="grid gap-8 p-7 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
            <div>
              <Badge variant="premium" className="mb-4"><ShieldCheck className="mr-1 size-4" /> 신뢰 포인트</Badge>
              <h3 className="text-3xl font-black tracking-[-0.05em] text-slate-950">수험생이 매일 이어갈 수 있는 구조</h3>
              <p className="mt-4 text-slate-600">짧은 실기형 문제를 반복하고, 틀린 문제를 따로 모아 다시 푸는 흐름을 우선했습니다.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => (
                <div key={item} className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <span className="text-sm font-bold leading-6 text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-12 text-white shadow-[0_30px_100px_rgba(15,23,42,0.25)] sm:px-10 lg:px-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-300"><Code2 className="size-5" /> 무료 문제부터 실전 흐름 확인</div>
              <h2 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">오늘 10문제부터 시작하세요.</h2>
              <p className="mt-4 max-w-2xl text-slate-300">무료 체험만으로도 문제풀이와 정답 판정 흐름을 확인하고, 베타 회원 회원은 오답노트·학습기록 저장·AI 문제 변형까지 사용할 수 있습니다.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/subjects" size="xl" variant="premium">무료 체험 시작</ButtonLink>
              <ButtonLink href="/pricing" size="xl" variant="outline" className="border-white/15 bg-white/10 text-white hover:bg-white hover:text-slate-950">베타 회원 안내</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
