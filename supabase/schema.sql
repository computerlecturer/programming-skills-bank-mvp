-- v7 서비스 기초용 Supabase/Postgres 스키마 초안
-- 실제 운영 전에는 Supabase Auth의 auth.users와 RLS 정책을 프로젝트 환경에 맞게 재검토하세요.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null default 'full_bank_30d',
  access_status text not null default 'active' check (access_status in ('active', 'expired', 'cancelled')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null unique,
  payment_provider text not null default 'toss',
  payment_key text,
  amount integer not null,
  status text not null default 'ready' check (status in ('ready', 'paid', 'failed', 'cancelled', 'refunded')),
  paid_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_question_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('sql', 'python', 'java', 'linux')),
  question_no integer not null,
  is_correct boolean not null default false,
  solved_correctly boolean not null default false,
  correct_at timestamptz,
  attempt_count integer not null default 0,
  last_answer jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, subject, question_no)
);

create table if not exists public.wrong_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('sql', 'python', 'java', 'linux')),
  question_no integer not null,
  review_status text not null default 'active' check (review_status in ('active', 'reviewed')),
  wrong_count integer not null default 1,
  last_wrong_answer jsonb,
  first_wrong_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, subject, question_no)
);

create table if not exists public.user_memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('sql', 'python', 'java', 'linux')),
  question_no integer not null,
  memo text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, subject, question_no)
);

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  subject text not null check (subject in ('sql', 'python', 'java', 'linux')),
  question_no integer not null,
  report_type text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'checking', 'fixed', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_generated_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_subject text not null check (source_subject in ('sql', 'python', 'java', 'linux')),
  source_question_no integer not null,
  variation_mode text not null check (variation_mode in ('same_level', 'harder')),
  generated_question jsonb not null,
  generated_answer jsonb not null,
  generated_explanation text,
  generated_study_guide jsonb,
  status text not null default 'active' check (status in ('active', 'reported', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_subject text not null check (source_subject in ('sql', 'python', 'java', 'linux')),
  source_question_no integer not null,
  variation_mode text not null check (variation_mode in ('same_level', 'harder')),
  used_date date not null default current_date,
  model text,
  prompt_tokens integer,
  completion_tokens integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_entitlements_user_status on public.user_entitlements(user_id, access_status, expires_at);
create index if not exists idx_question_status_user_subject on public.user_question_status(user_id, subject, question_no);
create index if not exists idx_ai_usage_user_date on public.ai_usage_logs(user_id, used_date);

alter table public.profiles enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.payments enable row level security;
alter table public.user_question_status enable row level security;
alter table public.wrong_notes enable row level security;
alter table public.user_memos enable row level security;
alter table public.error_reports enable row level security;
alter table public.ai_generated_questions enable row level security;
alter table public.ai_usage_logs enable row level security;

-- 기본 RLS 예시: 운영 전 관리자 정책과 웹훅 서비스 역할 정책을 별도로 추가하세요.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "entitlements_select_own" on public.user_entitlements;
create policy "entitlements_select_own" on public.user_entitlements for select using (auth.uid() = user_id);
drop policy if exists "question_status_all_own" on public.user_question_status;
create policy "question_status_all_own" on public.user_question_status for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "wrong_notes_all_own" on public.wrong_notes;
create policy "wrong_notes_all_own" on public.wrong_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "memos_all_own" on public.user_memos;
create policy "memos_all_own" on public.user_memos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "ai_generated_select_own" on public.ai_generated_questions;
create policy "ai_generated_select_own" on public.ai_generated_questions for select using (auth.uid() = user_id);
drop policy if exists "ai_usage_select_own" on public.ai_usage_logs;
create policy "ai_usage_select_own" on public.ai_usage_logs for select using (auth.uid() = user_id);

-- v7.2 Supabase Auth 연결 보강: 신규 회원 profile 자동 생성 및 관리자 AI 테스트 로그 저장 정책
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

-- 관리자가 자신의 role을 직접 바꾸는 정책은 만들지 않습니다.
-- 관리자 지정은 SQL Editor에서 다음처럼 직접 실행하세요.
-- update public.profiles set role = 'admin' where email = 'scablog@naver.com';


-- v7.2.2 자체 회원가입 UI + 이메일/비밀번호 로그인 보강
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
