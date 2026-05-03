-- v7.2.8 문제 오류 제보 DB 저장 및 관리자 관리 기능
-- 기존 오른쪽 오류 제보 패널을 Supabase question_reports 테이블에 연결합니다.

create table if not exists public.question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  subject text not null check (subject in ('sql', 'python', 'java', 'linux')),
  question_no integer not null check (question_no > 0),
  report_type text not null check (report_type in ('question', 'answer', 'explanation', 'typo', 'other')),
  message text not null check (char_length(btrim(message)) >= 5),
  status text not null default '접수' check (status in ('접수', '확인중', '수정완료', '반려')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_reports_user_id_idx on public.question_reports(user_id);
create index if not exists question_reports_subject_question_idx on public.question_reports(subject, question_no);
create index if not exists question_reports_status_idx on public.question_reports(status);
create index if not exists question_reports_created_at_idx on public.question_reports(created_at desc);

create or replace function public.is_admin_user(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = check_user_id
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin_user(uuid) to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.question_reports to authenticated;
grant insert (user_id, user_email, subject, question_no, report_type, message) on public.question_reports to authenticated;
grant update (status, admin_note, updated_at) on public.question_reports to authenticated;

alter table public.question_reports enable row level security;

drop policy if exists "question_reports_insert_own" on public.question_reports;
create policy "question_reports_insert_own"
on public.question_reports
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "question_reports_select_own_or_admin" on public.question_reports;
create policy "question_reports_select_own_or_admin"
on public.question_reports
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin_user(auth.uid())
);

drop policy if exists "question_reports_update_admin_only" on public.question_reports;
create policy "question_reports_update_admin_only"
on public.question_reports
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

create or replace function public.set_question_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_question_reports_updated_at on public.question_reports;
create trigger trg_question_reports_updated_at
before update on public.question_reports
for each row
execute function public.set_question_reports_updated_at();

notify pgrst, 'reload schema';
