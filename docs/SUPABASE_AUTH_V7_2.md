# v7.2.1 Supabase Auth 실제 연결 안내

본 버전은 v7.1.1의 베타 회원제 정책을 유지하면서, 로컬 테스트 로그인 대신 Supabase Auth를 실제로 호출하도록 수정한 버전입니다.

## 1. 접근 정책

| 사용자 상태 | 이용 가능 범위 |
|---|---|
| 비회원 | 과목별 50문항까지 이용 가능 |
| 로그인 회원 | 베타 기간 전체 문제 이용 가능 |
| 관리자 role | 전체 문제 + AI 문제 변형 테스트 가능 |

결제 기능은 계속 비활성화되어 있습니다. `payments`, `user_entitlements` 테이블과 상수는 향후 유료 전환을 위해 유지합니다.

## 2. 환경변수

프로젝트 루트에 `.env.local`을 만들고 다음 두 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

`SUPABASE_SERVICE_ROLE_KEY`, 결제 키, OpenAI 키는 v7.2.1에서는 비워둬도 됩니다.

## 3. 기존에 v7.1.1 schema.sql을 실행한 경우 추가 실행

이미 v7.1.1의 `schema.sql`을 실행했다면, Supabase SQL Editor에서 다음 파일을 추가로 1회 실행하세요.

```text
supabase/migrations/v7_2_auth_profile_policies.sql
```

이 파일은 신규 회원의 `profiles` 자동 생성 트리거와 AI 사용 로그 insert 정책을 추가합니다.

## 4. 이메일 로그인 방식

이메일 로그인은 비밀번호 방식이 아니라 6자리 인증번호 OTP 방식입니다.

1. 사용자가 이메일 입력
2. Supabase 인증번호 메일 발송
3. 메일의 6자리 인증번호 확인
4. 앱의 인증번호 입력칸에 입력
5. 인증번호 검증 후 로그인 완료
6. `profiles` 테이블에 회원 정보 생성 또는 갱신

처음 이용하는 사용자도 같은 흐름으로 회원가입됩니다.

## 5. Google/Kakao 로그인

버튼은 Supabase OAuth를 호출하도록 연결되어 있습니다. 실제 동작하려면 Supabase Dashboard에서 각 Provider 설정이 필요합니다.

### Google

Supabase Dashboard → Authentication → Providers → Google에서 Client ID와 Client Secret을 등록합니다.

### Kakao

Supabase Dashboard → Authentication → Providers → Kakao에서 Kakao REST API Key와 Client Secret을 등록합니다.

Provider 설정 전에는 버튼 클릭 시 Supabase에서 provider 설정 관련 오류가 날 수 있습니다.

## 6. 관리자 계정 지정

관리자 테스트 계정을 만들려면 먼저 해당 이메일로 한 번 로그인한 뒤 SQL Editor에서 실행합니다.

```sql
update public.profiles
set role = 'admin'
where email = 'scablog@naver.com';
```

관리자 role 계정만 AI 문제 변형 테스트 버튼을 실제로 기록할 수 있습니다. 일반 회원은 버튼을 눌러도 “서비스 준비중입니다” 안내가 표시됩니다.

## 7. AI 문제 변형 현재 상태

v7.2.1에서는 실제 OpenAI API 호출은 하지 않습니다.

| 사용자 | 동작 |
|---|---|
| 비회원 | 로그인 안내 |
| 일반 회원 | 서비스 준비중입니다 |
| 관리자 | 정답을 맞힌 문제에서 테스트 요청 기록 |

관리자 테스트 요청은 `ai_usage_logs` 테이블과 로컬 캐시에 기록됩니다.

## 8. 실행 순서

```bash
npm install
npm run dev
```

확인 순서:

1. 비회원 상태에서 과목별 50번까지 열리는지 확인
2. 51번 이후 회원가입 안내가 나오는지 확인
3. 이메일 인증번호 OTP 로그인 테스트
4. 로그인 후 51번 이후 문제가 열리는지 확인
5. 관리자 role 지정 후 AI 테스트 배지가 보이는지 확인
