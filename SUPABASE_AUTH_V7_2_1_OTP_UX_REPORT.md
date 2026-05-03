# v7.2.1 Supabase Auth OTP 로그인 UX 개선 보고서

## 수정 목적

v7.2에서는 이메일 로그인 버튼 문구가 “로그인 링크 받기”로 되어 있었지만, 실제 Supabase 메일에서는 인증번호가 발송될 수 있어 사용자가 혼동할 수 있었습니다. 또한 정상 발송 후 성공 안내 문구가 부족했습니다.

이번 v7.2.1에서는 이메일 로그인 흐름을 “6자리 인증번호 OTP 방식”으로 명확히 정리했습니다.

## 반영 내용

| 구분 | 수정 내용 |
|---|---|
| 이메일 로그인 | `인증번호 받기` → `6자리 인증번호 입력` → `로그인 완료하기` 흐름으로 변경 |
| 성공 안내 | 정상 발송 시 “해당 이메일로 인증번호가 발송되었습니다.” 문구 표시 |
| 오류 안내 | 이메일 형식 오류, 인증번호 6자리 미입력, 인증번호 오류 문구 구분 |
| Supabase Auth | `signInWithOtp`로 발송, `verifyOtp`로 인증번호 검증 |
| 소셜 로그인 | 구글/카카오는 기존 OAuth 방식 유지 |
| Callback | `/auth/callback` 페이지 추가. 구글/카카오 OAuth 및 메일 링크 방식이 섞여 들어와도 세션 교환 처리 가능 |
| 관리자 AI | 기존 `profiles.role = admin` 기준 유지 |
| 비회원/회원 접근 | 비회원 과목별 50문항, 로그인 회원 전체 문항 정책 유지 |

## 테스트 방법

1. `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 있는지 확인합니다.
2. `npm run dev` 실행 후 `/login`으로 이동합니다.
3. 이메일 입력 후 `인증번호 받기`를 누릅니다.
4. 성공 문구가 표시되는지 확인합니다.
5. 메일에 도착한 6자리 인증번호를 입력합니다.
6. `로그인 완료하기`를 누른 뒤 마이페이지에서 이메일이 표시되는지 확인합니다.

## Supabase 설정 주의

- `NEXT_PUBLIC_SUPABASE_URL`에는 `https://프로젝트ID.supabase.co`까지만 입력해야 합니다.
- `/rest/v1`은 붙이면 안 됩니다.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`에는 Supabase의 Publishable key를 입력합니다.
- Secret key는 `.env.local`의 공개 변수에 넣지 않습니다.
