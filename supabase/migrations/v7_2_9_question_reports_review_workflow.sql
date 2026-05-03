-- v7.2.9 오류 제보 상세 검토 워크플로우 보강
-- 처리 상태에 '수정 필요'를 추가합니다.
-- 기존 v7.2.8 question_reports 테이블이 적용된 상태에서 1회 실행하세요.

alter table public.question_reports
drop constraint if exists question_reports_status_check;

alter table public.question_reports
add constraint question_reports_status_check
check (status in ('접수', '확인중', '수정 필요', '수정완료', '반려'));

create index if not exists question_reports_report_type_idx on public.question_reports(report_type);

notify pgrst, 'reload schema';
