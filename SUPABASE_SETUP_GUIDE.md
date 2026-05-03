# Supabase 최종 설정 가이드

본 문서는 프로그래밍기능사 실기 문제은행 MVP를 새 Supabase 프로젝트에 연결할 때 실행해야 하는 SQL 순서와 확인 방법을 정리한 문서입니다.

## 1. Supabase 프로젝트 준비

1. Supabase에서 새 프로젝트를 생성합니다.
2. Project URL과 anon key를 확인합니다.
3. 로컬 프로젝트의 `.env.local`에 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=
```

현재 MVP는 클라이언트 기반 베타 테스트 구조이므로 `SUPABASE_SERVICE_ROLE_KEY`는 비워두어도 됩니다.

## 2. Authentication 설정

Supabase Dashboard에서 다음을 확인합니다.

```text
Authentication → Providers → Email
```

권장 상태:

```text
Email provider: 활성화
Confirm email: 비활성화 권장
```

현재 MVP는 이메일 + 비밀번호 로그인 방식입니다. 구글, 카카오, OTP 로그인은 사용하지 않습니다.

## 3. SQL 실행 순서

Supabase Dashboard에서 아래 경로로 이동합니다.

```text
SQL Editor → New query
```

그리고 프로젝트의 `supabase/migrations` 폴더 안 SQL을 아래 순서대로 실행합니다.

### 1단계. 프로필/권한 기본 정책

```text
supabase/migrations/v7_2_auth_profile_policies.sql
```

역할:
- `profiles` 테이블 생성 또는 보강
- 로그인 사용자 프로필 저장
- `role` 컬럼 관리
- 기본 RLS 정책 적용

### 2단계. 이메일 + 비밀번호 인증 보강

```text
supabase/migrations/v7_2_2_password_auth.sql
```

역할:
- 이메일/비밀번호 로그인 흐름에 필요한 함수와 정책 보강
- 회원가입 후 profile 연동 안정화

### 3단계. 이메일 중복 확인 RPC 안정화

```text
supabase/migrations/v7_2_4_email_check_fix.sql
```

역할:
- 이메일 중복 확인 RPC 단순화
- 회원가입 중복 확인 무한 대기 문제 방지

### 4단계. 오류 제보 테이블 생성

```text
supabase/migrations/v7_2_8_question_reports.sql
```

역할:
- `question_reports` 테이블 생성
- 학생 오류 제보 저장
- 관리자 오류 제보 조회/수정 정책 적용

### 5단계. 오류 제보 검토 상태 보강

```text
supabase/migrations/v7_2_9_question_reports_review_workflow.sql
```

역할:
- `수정 필요` 상태 추가
- 오류 제보 상태값 constraint 보강
- 오류 유형 index 추가

### 6단계. 관리자 대시보드 조회 정책

```text
supabase/migrations/v7_3_0_admin_dashboard_policies.sql
```

역할:
- 관리자 대시보드에서 `profiles` 조회 가능
- 관리자 대시보드에서 `ai_usage_logs` 조회 가능
- 관리자 여부 확인 함수 보강

## 4. 관리자 계정 지정 방법

회원가입 후 관리자 계정으로 사용할 이메일의 `profiles.role` 값을 `admin`으로 변경합니다.

예시:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('관리자이메일@example.com');
```

확인:

```sql
select id, email, role
from public.profiles
where lower(email) = lower('관리자이메일@example.com');
```

결과에서 `role = admin`이면 정상입니다.

## 5. 오류 제보 저장 확인

일반 회원으로 문제 화면에서 오류 제보를 저장한 뒤 SQL Editor에서 확인합니다.

```sql
select *
from public.question_reports
order by created_at desc;
```

## 6. 관리자 대시보드 확인

관리자 계정으로 로그인 후 아래 주소를 확인합니다.

```text
http://localhost:3000/admin
http://localhost:3000/admin/reports
```

정상이라면 관리자 대시보드와 오류 제보 관리 화면이 표시됩니다.

## 7. 주의사항

현재 MVP의 데이터 저장 방식은 다음과 같습니다.

```text
문제 데이터: JSON 파일
회원/권한: Supabase
오류 제보: Supabase
AI 사용 로그: Supabase
오답노트/보관함/학습 진행 상태: 브라우저 localStorage
```

문제 데이터는 아직 Supabase로 옮기지 않습니다. 베타 단계에서는 JSON 문제 데이터가 더 안정적이며, 학생 제보를 받아 JSON을 수정한 뒤 새 버전을 배포하는 방식으로 운영합니다.
