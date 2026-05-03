# v7.1 베타 회원제 운영 기준

## 운영 정책

- 비회원: 각 과목 50문항까지 무료 이용
- 회원: 베타 기간 전체 문제 무료 이용
- 결제: 현재 비활성화
- AI 문제 변형: 일반 회원은 “서비스 준비중입니다” 표시
- AI 관리자 테스트: 관리자 role만 가능

## 향후 유료 전환 시 되살릴 구조

- `payments`
- `user_entitlements`
- 30일 이용권 정책 상수
- AI 하루 20회 제한
- `same_level`, `harder` 두 가지 AI 변형 모드

## 관리자 role 기준

로컬 데모에서는 `admin@example.com`, `admin@psb.test`, `admin+...` 형태 이메일이 관리자 권한으로 처리된다.
Supabase 연결 후에는 `profiles.role = 'admin'` 기준으로 전환하는 것을 권장한다.
