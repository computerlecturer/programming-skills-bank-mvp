# v7.2.4 이메일 중복 확인 안정화 패치 보고서

## 적용 기준

- 기준 파일: `programming-skills-bank-mvp-v7.2.3-password-auth-runtime-fix.zip`
- 생성 버전: `programming-skills-bank-mvp-v7.2.4-email-check-fix.zip`

## 수정 요약

1. 이메일 중복 확인 RPC 호출에 8초 타임아웃을 추가했습니다.
2. RPC 지연, 실패, 네트워크 오류 발생 시 `잠시 후 다시 시도해 주세요` 안내가 표시되도록 수정했습니다.
3. 이메일 중복 확인 상태가 `이메일 중복확인중입니다.`에서 멈추지 않도록 `finally`에서 확인 상태를 해제하도록 보강했습니다.
4. 회원가입 버튼 클릭 시 이미 중복 확인을 완료한 이메일에 대해 동일 RPC를 다시 호출하지 않도록 `skipEmailAvailabilityCheck` 옵션을 추가했습니다.
5. 오래 걸리는 중복 확인 요청이 끝난 뒤 사용자가 이메일을 바꾼 경우, 이전 결과가 현재 입력값에 잘못 반영되지 않도록 요청 ID 검증을 추가했습니다.
6. Supabase 마이그레이션 파일 `supabase/migrations/v7_2_4_email_check_fix.sql`을 추가했습니다.
7. `is_email_available` RPC는 `auth.users` 직접 조회를 제거하고 `public.profiles` 기준의 단순 boolean 응답 함수로 교체했습니다.

## 유지 정책

- 비회원은 과목별 50문항까지 무료 이용
- 회원가입 사용자는 베타 기간 전체 문제 무료 이용
- 결제 기능 비활성화
- 일반 회원의 AI 문제 변형 클릭 시 `서비스 준비중입니다.` 안내
- `admin` role 사용자만 AI 문제 변형 테스트 가능
- 로그인 방식은 이메일 + 비밀번호 유지
