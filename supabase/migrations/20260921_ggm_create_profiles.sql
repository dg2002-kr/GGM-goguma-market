-- 이 파일은 Supabase에 이미 적용된 마이그레이션의 사본(기록용)입니다.
-- 적용 대상: dipkkqlnxzbjwayatsaj (가계부와 동일한 프로젝트)
-- 기존 가계부 테이블과 섞이지 않도록 모든 테이블에 ggm_ 접두사를 붙입니다.

create table if not exists public.ggm_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null check (char_length(nickname) between 2 and 20),
  avatar_url  text,
  region      text not null default '우리동네',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.ggm_profiles enable row level security;

create policy "ggm_profiles_select_all"
  on public.ggm_profiles for select using (true);

create policy "ggm_profiles_insert_own"
  on public.ggm_profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "ggm_profiles_update_own"
  on public.ggm_profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.ggm_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ggm_profiles_set_updated_at
  before update on public.ggm_profiles
  for each row execute function public.ggm_set_updated_at();

-- 회원가입 시 프로필 자동 생성
create or replace function public.ggm_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.ggm_profiles (id, nickname, region)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'region'), ''), '우리동네')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger ggm_on_auth_user_created
  after insert on auth.users
  for each row execute function public.ggm_handle_new_user();
