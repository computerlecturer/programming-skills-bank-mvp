# v7.2.5 Auth Lock Fix Report

## 수정 목적

Supabase 이메일/비밀번호 인증 환경에서 개발모드 콘솔에 표시되는 `@supabase/gotrue-js` auth token lock 경고를 줄이고, 로그인/회원가입 상태 확인 로직이 중복 실행되는 문제를 완화했습니다.

## 주요 수정 사항

1. `refreshServiceUser()` 동시 호출 방지
   - React Strict Mode와 여러 컴포넌트 동시 마운트 시 `supabase.auth.getSession()`이 여러 번 호출되지 않도록 진행 중인 Promise를 공유합니다.

2. `subscribeServiceAuthChanges()`에서 Supabase `onAuthStateChange` 직접 구독 제거
   - 기존에는 여러 컴포넌트가 각각 `onAuthStateChange`를 등록하고, 콜백 내부에서 프로필 upsert/select 같은 Supabase 작업을 다시 실행했습니다.
   - 이 구조가 gotrue-js lock 경고를 유발할 수 있어, MVP에서는 앱 내부 `AUTH_EVENT`와 `storage` 이벤트만 구독하도록 단순화했습니다.

3. 로그인 상태 캐시 우선 사용
   - AI 사용량 확인과 베타 전체 이용 권한 확인 시 이미 로컬에 저장된 사용자 정보가 있으면 불필요한 `getSession()` 재호출을 줄였습니다.

4. Supabase 클라이언트 URL 세션 감지 비활성화
   - 현재 정책은 구글/카카오/OTP 없이 이메일+비밀번호 방식이므로 `detectSessionInUrl`을 `false`로 변경했습니다.

5. Next.js scroll-behavior 개발 경고 정리
   - `<html>` 태그에 `data-scroll-behavior="smooth"`를 추가했습니다.

## Supabase SQL 추가 작업

이 버전은 프론트엔드 인증 상태 관리 안정화 패치입니다. v7.2.4 SQL을 이미 적용했다면 Supabase SQL Editor에서 추가로 실행할 SQL은 없습니다.
