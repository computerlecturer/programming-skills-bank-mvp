# v7.2.2 자체 회원가입 UI + 이메일/비밀번호 로그인 안내

## 변경 목적

v7.2.1의 이메일 OTP 로그인은 인증번호 발송 제한과 사용자 혼란이 발생할 수 있었습니다. v7.2.2에서는 수강생이 익숙하게 사용할 수 있도록 우리 홈페이지 자체 회원가입처럼 보이는 구조로 변경했습니다.

## 화면 정책

### 회원가입

- 이름
- 이메일
- 이메일 중복 확인
- 비밀번호
- 비밀번호 확인
- 베타 서비스 이용 안내 동의

### 로그인

- 이메일
- 비밀번호

구글 로그인, 카카오 로그인, 이메일 인증번호 방식은 제거했습니다.

## 접근 정책

| 사용자 | 접근 범위 |
|---|---|
| 비회원 | 과목별 50문항 |
| 일반 회원 | 베타 기간 전체 620문항 |
| 관리자 | 전체 문제 + AI 문제 변형 테스트 |

## Supabase 추가 SQL

Supabase SQL Editor에서 다음 파일을 실행해야 합니다.

```text
supabase/migrations/v7_2_2_password_auth.sql
```

이 파일은 다음을 추가합니다.

- `profiles.email` 중복 방지 인덱스
- `is_email_available(check_email text)` RPC 함수
- 이름 metadata를 반영하는 profile 자동 생성 트리거 보강

## 이메일 중복 확인 방식

RLS 때문에 클라이언트가 다른 회원의 `profiles` 행을 직접 조회하지 않습니다. 대신 `security definer` 함수가 이메일 사용 가능 여부만 `true/false`로 반환합니다.

## Supabase Auth 설정 권장

베타 테스트에서는 회원가입 즉시 앱을 사용할 수 있게 `Confirm email`을 끄는 것을 권장합니다.

```text
Authentication → Providers → Email → Confirm email OFF
```

Confirm email을 켜두면 회원가입은 가능하지만, 메일 인증을 완료한 뒤 로그인해야 합니다.
