-- v7.3.0 관리자 대시보드 조회 권한 보강 SQL
-- 회원 현황과 AI 테스트 현황을 관리자 대시보드에서 집계하기 위한 정책입니다.
-- v7.2.8, v7.2.9 SQL 적용 후 1회 실행하세요.

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

-- profiles: 본인은 자기 profile을 보고, admin은 전체 회원 현황을 볼 수 있습니다.
grant select on public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.is_admin_user(auth.uid())
);

-- ai_usage_logs: 본인은 자기 기록을 보고, admin은 관리자 대시보드에서 전체 테스트 현황을 볼 수 있습니다.
grant select on public.ai_usage_logs to authenticated;

alter table public.ai_usage_logs enable row level security;

drop policy if exists "ai_usage_select_own_or_admin" on public.ai_usage_logs;
create policy "ai_usage_select_own_or_admin"
on public.ai_usage_logs
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin_user(auth.uid())
);

create index if not exists ai_usage_logs_used_date_idx on public.ai_usage_logs(used_date);
create index if not exists ai_usage_logs_created_at_idx on public.ai_usage_logs(created_at desc);
create index if not exists profiles_created_at_idx on public.profiles(created_at desc);
create index if not exists profiles_role_idx on public.profiles(role);

notify pgrst, 'reload schema';
