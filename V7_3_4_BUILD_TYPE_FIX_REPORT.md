# v7.3.4 빌드 타입 오류 수정 보고서

## 문제
`npm.cmd run build` 실행 시 `src/components/auth/auth-client.tsx`에서 TypeScript 오류가 발생했습니다.

원인은 `signUpWithPassword()` 함수가 Supabase 연결이 없을 때 `ServiceUser`를 직접 반환하고, Supabase 연결이 있을 때는 `{ user, needsEmailConfirmation }` 객체를 반환하는 혼합 반환 타입이었습니다.

## 수정 내용
`src/lib/service-auth.ts`의 `signUpWithPassword()` fallback 반환값을 항상 동일한 객체 구조로 통일했습니다.

변경 전:
- Supabase 미설정: `ServiceUser`
- Supabase 설정: `{ user, needsEmailConfirmation }`

변경 후:
- 모든 경우: `{ user, needsEmailConfirmation }`

## 기대 효과
회원가입 처리 코드에서 `result.needsEmailConfirmation`, `result.user`를 안전하게 사용할 수 있고, Next.js production build TypeScript 검사를 통과할 수 있습니다.

## Supabase SQL
추가 SQL 실행은 필요 없습니다.
