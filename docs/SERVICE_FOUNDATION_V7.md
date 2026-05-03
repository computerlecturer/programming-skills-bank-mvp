# v7.1 베타 회원제 서비스 기초 작업 요약

## 반영 정책

- 비회원: 과목별 50문항 무료 이용
- 회원: 베타 기간 전체 620문항 무료 이용
- 결제: 현재 비활성화
- AI 문제 변형: 일반 회원은 “서비스 준비중입니다” 표시
- AI 관리자 테스트: 관리자 role만 가능
- 향후 유료 전환 대비: 결제/이용권 DB 구조 유지

## 구현 범위

- `BETA_UNLOCK_ALL = false`
- `BETA_MEMBERS_FULL_ACCESS = true`
- `BETA_PAYMENTS_ENABLED = false`
- 과목별 51번 이후 문항의 회원가입/로그인 안내 잠금 UI
- 로그인 회원 전체 문항 접근 허용
- 모의고사, 오답노트, 약점 분석, 학습 보관함의 회원 게이트
- AI 문제 변형 버튼 유지
- 일반 회원 AI 버튼 클릭 시 서비스 준비중 안내
- 관리자 계정의 AI 변형 테스트 조건 구성
- Supabase DB 스키마 초안 유지: `supabase/schema.sql`
- 환경변수 예시 유지: `.env.example`

## 관리자 테스트

로컬 테스트 세션 기준으로 다음 이메일은 관리자 role로 처리됩니다.

```text
admin@example.com
admin@psb.test
```

Supabase 연결 후에는 `profiles.role = 'admin'` 기준으로 전환하는 것을 권장합니다.

## 다음 단계

1. Supabase Auth 실제 연결
2. 회원 정보를 `profiles` 테이블과 연동
3. 오답노트/학습기록/메모를 DB 저장으로 전환
4. 관리자 전용 AI 변형 API 테스트
5. 오류 제보 관리 화면 추가
6. 정식 서비스 전환 시 결제와 30일 이용권 활성화
