# 프로그래밍기능사 실기연구소 v7.2.2 베타 회원가입

2026 프로그래밍기능사 실기 대비 문제은행의 베타 회원제 서비스 버전입니다. v7.2.2에서는 구글/카카오/OTP 흐름을 제거하고, 수강생이 이해하기 쉬운 **이름 + 이메일 + 비밀번호 회원가입** 방식으로 정리했습니다.

## 포함 콘텐츠

- SQL 200문항
- Python 150문항
- Java 150문항
- Linux 120문항
- 전체 620문항
- 문항별 학습하기 미니 강의 데이터 620개

## v7.2.2 베타 운영 정책

- 비회원은 과목별 50문항까지 무료로 이용할 수 있습니다.
- 회원가입한 사용자는 베타 기간 동안 전체 620문항을 무료로 이용할 수 있습니다.
- 결제 기능은 현재 비활성화되어 있습니다.
- 결제/이용권 DB 구조와 상수는 향후 정식 서비스 전환을 위해 남겨두었습니다.
- AI 문제 변형 기능은 UI만 유지하고 일반 회원에게는 “서비스 준비중입니다”를 표시합니다.
- `profiles.role = 'admin'`인 관리자 계정만 정답을 맞힌 문제에서 AI 문제 변형 테스트를 할 수 있습니다.

## 구현된 것

- 자체 회원가입 UI: 이름, 이메일, 비밀번호, 비밀번호 확인
- 이메일 중복 확인 기능
- 이메일 + 비밀번호 로그인
- 로그인 회원 전체 문제 접근 권한
- 비회원 과목별 50문항 제한
- 모의고사, 오답노트, 약점 분석, 보관함의 회원 게이트
- 일반 회원 AI 클릭 시 서비스 준비중 안내
- 관리자 role 기반 AI 테스트 조건
- Supabase DB 스키마 및 v7.2.2 보강 SQL

## 환경변수

프로젝트 루트에 `.env.local`을 만들고 다음 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

`SUPABASE_SERVICE_ROLE_KEY`, 결제 키, OpenAI 키는 v7.2.2에서는 비워둬도 됩니다.

## Supabase 추가 SQL

이미 v7.1.1의 `schema.sql`과 v7.2의 profile 보강 SQL을 실행한 Supabase 프로젝트라면, 다음 파일 내용을 Supabase SQL Editor에서 추가로 1회 실행하세요.

```text
supabase/migrations/v7_2_2_password_auth.sql
```

이 SQL은 이메일 중복 확인용 RPC 함수와 `profiles.email` 중복 방지 인덱스를 추가합니다.

## Supabase Auth 권장 설정

베타 테스트에서 회원가입 즉시 로그인되게 하려면 Supabase Dashboard에서 이메일 확인을 꺼두는 것을 권장합니다.

```text
Authentication → Providers → Email
Confirm email: OFF 권장
```

Confirm email이 켜져 있으면 회원가입 후 메일 인증을 먼저 완료해야 로그인할 수 있습니다.

## 관리자 계정 지정

선생님 계정으로 회원가입한 뒤 Supabase SQL Editor에서 실행합니다.

```sql
update public.profiles
set role = 'admin'
where email = '실제_가입한_이메일@example.com';
```

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:3000
```

## 다음 개발 단계

1. 이메일/비밀번호 회원가입 실제 동작 검증
2. 51번 이후 문제의 로그인 접근 확인
3. 학습기록/오답노트/메모를 Supabase DB 저장으로 이전
4. 오류 제보 DB 저장 및 관리자 확인 흐름 정리
5. 관리자 전용 AI 문제 변형 API 연결
6. 정식 서비스 전환 시 결제/이용권 기능 활성화
