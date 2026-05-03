# v7.2.3 회원가입 런타임 오류 수정 보고서

## 수정 목적
회원가입 직후 `supabase.from(...).upsert(...).throwOnError(...).catch is not a function` 오류가 발생하는 문제를 수정했습니다.

## 원인
Supabase PostgREST 쿼리 빌더는 일반 Promise와 다르게 동작할 수 있어, `throwOnError().catch()` 체이닝을 직접 사용하는 방식이 런타임 오류를 유발했습니다.

## 수정 내용
- `src/lib/service-auth.ts`의 `ensureProfileForAuthUser()` 함수 수정
- `throwOnError().catch()` 체이닝 제거
- `await supabase.from(...).upsert(...)` 결과의 `error`를 확인하는 방식으로 변경
- profile upsert 실패가 전체 회원가입 흐름을 중단하지 않도록 안전 처리

## 영향 범위
- 이메일/비밀번호 회원가입
- 로그인 후 `profiles` 조회/동기화
- 관리자 role 조회
- 비회원/회원 접근 권한 판정

## 추가 SQL 필요 여부
기존에 `supabase/migrations/v7_2_2_password_auth.sql`을 실행했다면 추가 SQL 실행은 필요 없습니다.
