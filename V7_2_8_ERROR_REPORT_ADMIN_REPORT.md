# v7.2.8 오류 제보 DB 저장 및 관리자 페이지 추가 보고서

## 목적
기존 문제 풀이 화면 오른쪽의 오류 제보 패널을 그대로 유지하면서, 제보 내용을 Supabase DB에 저장하고 관리자 계정에서 확인·처리할 수 있게 했습니다.

## 반영 내용
1. 기존 오른쪽 오류 제보 창 유지
2. 오류 제보 저장 버튼을 Supabase `question_reports` 테이블 insert로 연결
3. 로그인 회원만 오류 제보 가능
4. 저장 성공 시 학생 보관함 localStorage에도 보조 기록 유지
5. 관리자 전용 `/admin/reports` 페이지 추가
6. 관리자 제보 목록 조회, 상태 변경, 관리자 메모 저장 기능 추가
7. 마이페이지에 관리자 전용 `오류 제보 관리` 버튼 추가
8. Supabase SQL 마이그레이션 추가
   - `supabase/migrations/v7_2_8_question_reports.sql`

## Supabase 실행 필요
v7.2.8 적용 후 Supabase SQL Editor에서 `v7_2_8_question_reports.sql` 내용을 1회 실행해야 합니다.

## 테스트 체크리스트
- 비회원 오류 제보 시 로그인 안내 표시
- 일반 회원 오류 제보 저장 후 `question_reports`에 insert 확인
- 일반 회원 `/admin/reports` 접근 차단
- 관리자 `/admin/reports`에서 전체 제보 목록 확인
- 관리자 상태 변경 및 메모 저장 확인
