-- v7.2 실제 Supabase Auth 연결 후 1회 실행용 보강 SQL
-- 이미 v7.1.1 schema.sql을 실행한 프로젝트라면 이 파일만 SQL Editor에서 추가로 실행하세요.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nickname'),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "ai_usage_insert_own" on public.ai_usage_logs;
create policy "ai_usage_insert_own" on public.ai_usage_logs for insert with check (auth.uid() = user_id);

drop policy if exists "ai_generated_insert_own" on public.ai_generated_questions;
create policy "ai_generated_insert_own" on public.ai_generated_questions for insert with check (auth.uid() = user_id);

-- 관리자 지정 예시: 선생님 계정으로 로그인한 뒤 실행하세요.
-- update public.profiles set role = 'admin' where email = 'scablog@naver.com';
