# v7.1 베타 회원제 접근 정책 수정 보고서

## 수정 목적

기존 v7의 “과목별 50문항 무료 + 51번 이후 30일 이용권 필요” 구조를 베타 운영 정책에 맞게 수정했다.

## v7.1 정책

| 사용자 상태 | 이용 범위 |
|---|---|
| 비회원 | 과목별 50문항까지 무료 이용 |
| 일반 회원 | 베타 기간 전체 문제 무료 이용 |
| 관리자 | 전체 문제 이용 + AI 문제 변형 테스트 가능 |

## 반영 사항

1. 51번 이후 문항 잠금 기준을 “유료 이용권”에서 “로그인 회원 여부”로 변경했다.
2. 비회원은 과목별 50문항까지만 접근 가능하고, 51번 이후에는 회원가입/로그인 안내를 표시한다.
3. 회원가입한 사용자는 베타 기간 동안 전체 620문항을 이용할 수 있게 했다.
4. 결제 기능은 현재 UI에서 비활성화하고 결제 유도 문구를 제거했다.
5. 결제/이용권 관련 DB 구조와 상수는 향후 유료 전환을 위해 남겨두었다.
6. AI 문제 변형 버튼은 유지하되 일반 회원에게는 “서비스 준비중입니다” 문구가 표시되도록 했다.
7. AI 문제 변형 테스트는 관리자 role 사용자만 가능하도록 했다.
8. AI 버튼은 기존 정책대로 정답을 맞힌 문제에서만 의미 있게 동작하도록 유지했다.

## 관리자 테스트 계정

로컬 데모 환경에서는 `admin@example.com` 또는 `admin@psb.test`으로 로그인하면 관리자 role로 처리된다.

## 주요 수정 파일

- `src/lib/constants.ts`
- `src/lib/service-auth.ts`
- `src/types/service.ts`
- `src/components/practice/question-player.tsx`
- `src/components/practice/locked-question.tsx`
- `src/components/service/service-access-gate.tsx`
- `src/components/service/ai-variation-panel.tsx`
- `src/components/auth/auth-client.tsx`
- `src/components/auth/account-client.tsx`
- `src/app/pricing/page.tsx`
- `src/app/page.tsx`
- `src/app/subjects/page.tsx`
- `src/app/mock-exam/page.tsx`
- `src/app/wrong-notes/page.tsx`
- `src/app/my-study/page.tsx`
- `src/app/analytics/page.tsx`
- `src/components/layout/site-header.tsx`

## 검증 메모

- 전체 문항 데이터와 학습하기 데이터는 수정하지 않았다.
- `study_guides_reviewed.json`의 620개 학습하기 데이터는 유지했다.
- `sql/python/java/linux` 원본 문제 데이터 파일도 유지했다.
- 이 환경에는 Next/React 패키지가 설치되어 있지 않아 실제 `next build`는 수행하지 못했다. TypeScript 전역 컴파일러로 확인을 시도했으나 `next`, `react`, `lucide-react` 모듈 타입 미설치 오류가 발생했다.
