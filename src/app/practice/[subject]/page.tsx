import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Code2, TimerReset } from "lucide-react";
import { QuestionPlayer } from "@/components/practice/question-player";
import { Badge } from "@/components/ui/badge";
import { getQuestions, getSubjectMeta, getSubjects, isSubjectId } from "@/lib/question-data";

export function generateStaticParams() {
  return getSubjects().map((subject) => ({ subject: subject.id }));
}


const subjectSeoTitle: Record<string, string> = {
  sql: "프로그래밍기능사 SQL 실기 문제은행",
  python: "프로그래밍기능사 Python 실기 문제은행",
  java: "프로그래밍기능사 Java 실기 문제은행",
  linux: "프로그래밍기능사 Linux 명령어 실기 문제"
};

const subjectSeoDescription: Record<string, string> = {
  sql: "프로그래밍기능사 실기 SQL 문제를 SELECT, JOIN, 서브쿼리, DDL/DML 중심으로 반복 학습하는 SQL 실기 문제은행입니다.",
  python: "프로그래밍기능사 실기 Python 문제를 출력 결과 예측, 자료형, 함수, 반복문, 오류 수정 중심으로 학습하는 문제은행입니다.",
  java: "프로그래밍기능사 실기 Java 문제를 문자열 비교, 인터페이스, 상속, 생성자 흐름 중심으로 학습하는 문제은행입니다.",
  linux: "프로그래밍기능사 실기 Linux 명령어와 경로, 권한, 파일·디렉터리 조작 문제를 학습하는 문제은행입니다."
};

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const { subject } = await params;
  if (!isSubjectId(subject)) {
    return {
      title: "프로그래밍기능사 실기 문제은행",
      description: "SQL, Python, Java, Linux 실전형 문제를 학습하는 프로그래밍기능사 실기 문제은행입니다."
    };
  }

  return {
    title: subjectSeoTitle[subject],
    description: subjectSeoDescription[subject],
    alternates: { canonical: `/practice/${subject}` },
    openGraph: {
      title: subjectSeoTitle[subject],
      description: subjectSeoDescription[subject]
    }
  };
}

type PageProps = {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function PracticePage({ params, searchParams }: PageProps) {
  const { subject: subjectParam } = await params;
  const { q } = await searchParams;

  if (!isSubjectId(subjectParam)) notFound();

  const subject = getSubjectMeta(subjectParam);
  const questions = getQuestions(subjectParam);
  if (!subject || !questions.length) notFound();

  const parsedQuestionNo = Number(q ?? 1);
  const initialQuestionNo = Number.isFinite(parsedQuestionNo)
    ? Math.max(1, Math.min(questions.length, parsedQuestionNo))
    : 1;

  return (
    <main>
      <section className="border-b border-slate-200/80 bg-white/75 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <Badge variant="premium" className="mb-4"><Code2 className="mr-1 size-4" /> 실전 문제풀이</Badge>
              <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">{subject.label} 문제풀이</h1>
              <p className="mt-3 max-w-3xl text-slate-600">문제를 풀고 정답을 확인하세요. 틀린 문제와 학습 진도는 현재 브라우저에 자동 저장됩니다.</p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
              <TimerReset className="size-4 text-blue-600" /> 90분 실전 감각 훈련
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <QuestionPlayer subject={subject} questions={questions} initialQuestionNo={initialQuestionNo} />
      </section>
    </main>
  );
}
