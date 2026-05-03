import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";

const brandName = "프로그래밍기능사 실기연구소";
const searchTitle = "프로그래밍기능사 실기 문제은행 | SQL·Python·Java·Linux";
const searchDescription =
  "2026 프로그래밍기능사 실기 대비 온라인 문제은행입니다. SQL, Python, Java, Linux 실전형 문제를 과목별로 풀고, 오답노트와 오류 제보 기능으로 반복 학습할 수 있습니다. 비회원은 과목별 50문항, 베타 회원은 전체 620문항을 무료로 이용할 수 있습니다.";
const ogDescription =
  "SQL·Python·Java·Linux 실전형 문제를 무료 베타로 학습하세요. 회원가입 시 전체 620문항을 이용할 수 있습니다.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://programming-skills-bank-mvp.vercel.app"),
  title: {
    default: searchTitle,
    template: `%s | ${brandName}`
  },
  description: searchDescription,
  applicationName: brandName,
  generator: "Next.js",
  keywords: [
    "프로그래밍기능사 실기",
    "프로그래밍기능사 문제",
    "프로그래밍기능사 문제은행",
    "프로그래밍기능사 기출",
    "프로그래밍기능사 실기 모의고사",
    "프로그래밍기능사 SQL",
    "프로그래밍기능사 Python",
    "프로그래밍기능사 Java",
    "프로그래밍기능사 Linux",
    "SQL 실기 문제",
    "Python 코드 실행 결과 문제",
    "Java 실행 결과 문제",
    "Linux 명령어 문제",
    "프로그래밍기능사 독학",
    "프로그래밍기능사 실기 공부법",
    "프로그래밍기능사 실기 대비",
    "프로그래밍기능사 실기 무료 문제",
    "프로그래밍기능사 실기 온라인 문제은행"
  ],
  authors: [{ name: brandName }],
  creator: brandName,
  publisher: brandName,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: "프로그래밍기능사 실기 문제은행",
    description: ogDescription,
    siteName: brandName,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "프로그래밍기능사 실기 문제은행"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "프로그래밍기능사 실기 문제은행",
    description: ogDescription,
    images: ["/og-image.svg"]
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
