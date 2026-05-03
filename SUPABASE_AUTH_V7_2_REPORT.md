# v7.2.1 Supabase Auth 연결 수정 보고서

## 수정 목표

v7.1.1 베타 회원제 버전을 기준으로 실제 Supabase Auth를 연결했다.

## 반영 내용

| 항목 | 반영 |
|---|---|
| 이메일 로그인/회원가입 | Supabase `signInWithOtp` + `verifyOtp` 인증번호 방식으로 연결 |
| Google 로그인 | Supabase OAuth 호출로 연결 |
| Kakao 로그인 | Supabase OAuth 호출로 연결 |
| 회원 상태 확인 | Supabase 세션 기준으로 `profiles` 조회 |
| 비회원 제한 | 과목별 50문항 유지 |
| 회원 전체 이용 | Supabase 로그인 회원이면 전체 문제 이용 가능 |
| 관리자 AI 테스트 | `profiles.role = 'admin'` 기준으로 제어 |
| 일반 회원 AI | “서비스 준비중입니다” 안내 유지 |
| 결제 | 비활성화 유지 |
| DB 보강 | 신규 회원 profile 자동 생성 트리거와 AI 로그 insert 정책 추가 |

## 주요 수정 파일

```text
package.json
.env.example
src/lib/supabase-client.ts
src/lib/service-auth.ts
src/components/auth/auth-client.tsx
src/components/auth/account-client.tsx
src/components/service/service-access-gate.tsx
src/components/service/ai-variation-panel.tsx
src/components/practice/question-player.tsx
supabase/schema.sql
supabase/migrations/v7_2_auth_profile_policies.sql
docs/SUPABASE_AUTH_V7_2.md
```

## 추가 실행 필요 SQL

기존 v7.1.1 테이블을 이미 만든 경우, Supabase SQL Editor에서 아래 파일 내용을 추가로 실행해야 한다.

```text
supabase/migrations/v7_2_auth_profile_policies.sql
```

## 검증 메모

이 작업 환경에는 `node_modules`가 설치되어 있지 않아 `npm run build`는 실행하지 못했다. `package.json`에는 `@supabase/supabase-js` 의존성을 추가했다. 로컬에서 `npm install` 후 `npm run dev`로 실제 Supabase Auth 흐름을 확인해야 한다.
