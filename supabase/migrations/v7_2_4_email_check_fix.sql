-- v7.2.4 이메일 중복 확인 무한 대기 방지용 RPC 단순화 SQL
-- v7.2.2_password_auth.sql 실행 후 추가로 1회 실행하세요.
-- 목적:
-- 1) 회원가입 화면의 이메일 중복 확인 RPC를 public.profiles 기준의 단순 조회로 축소
-- 2) 인증 사용자 테이블 직접 조회를 제거해 RPC 응답 지연 가능성을 줄임
-- 3) profiles.email의 소문자 기준 중복 방어는 유지

create unique index if not exists profiles_email_lower_unique
on public.profiles (lower(email));

create or replace function public.is_email_available(check_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select case
    when nullif(lower(btrim(check_email)), '') is null then false
    else not exists (
      select 1
      from public.profiles p
      where lower(btrim(p.email)) = lower(btrim(check_email))
    )
  end;
$$;

grant execute on function public.is_email_available(text) to anon, authenticated;

comment on function public.is_email_available(text) is
'v7.2.4: 회원가입 이메일 중복 확인용 RPC. 인증 사용자 테이블 직접 조회를 제거하고 public.profiles 기준으로 단순화함.';
