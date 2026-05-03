-- v7.2.2 자체 회원가입 UI + 이메일/비밀번호 로그인 보강 SQL
-- v7.1.1 schema.sql과 v7.2 auth profile migration을 실행한 뒤 추가로 1회 실행하세요.

-- profiles.email 중복 방지: 프론트 중복 확인과 별개로 DB에서도 최종 방어합니다.
create unique index if not exists profiles_email_lower_unique
on public.profiles (lower(email));

-- 회원가입 화면의 이메일 중복 확인용 RPC입니다.
-- RLS 때문에 클라이언트가 다른 회원의 profiles 행을 직접 볼 수 없으므로,
-- 이메일 사용 가능 여부만 boolean으로 반환하는 security definer 함수를 제공합니다.
create or replace function public.is_email_available(check_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(check_email));
  exists_in_profiles boolean;
  exists_in_auth boolean;
begin
  if normalized_email = '' or normalized_email is null then
    return false;
  end if;

  select exists(
    select 1 from public.profiles p where lower(p.email) = normalized_email
  ) into exists_in_profiles;

  select exists(
    select 1 from auth.users u where lower(u.email) = normalized_email
  ) into exists_in_auth;

  return not (coalesce(exists_in_profiles, false) or coalesce(exists_in_auth, false));
end;
$$;

grant execute on function public.is_email_available(text) to anon, authenticated;

-- 신규 회원 profile 자동 생성 시 이름 metadata를 유지합니다.
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
        name = coalesce(excluded.name, public.profiles.name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- 관리자 지정 예시: 회원가입 후 실제 이메일로 바꿔 실행하세요.
-- update public.profiles set role = 'admin' where email = 'academylecturer@naver.com';
