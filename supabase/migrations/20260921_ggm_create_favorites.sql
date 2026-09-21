-- 적용 완료(기록용): 7단계 좋아요

alter table public.ggm_products
  add column if not exists like_count integer not null default 0;

comment on column public.ggm_products.like_count is '좋아요 누른 사람 수';

create table if not exists public.ggm_favorites (
  product_id uuid not null references public.ggm_products(id) on delete cascade,
  user_id    uuid not null references public.ggm_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

create index if not exists ggm_favorites_user_idx
  on public.ggm_favorites (user_id, created_at desc);

alter table public.ggm_favorites enable row level security;

-- 조회: 내가 누른 것만 (남이 뭘 좋아하는지는 비공개)
-- 화면에 보이는 '몇 명'은 ggm_products.like_count 에서 읽는다
create policy "ggm_favorites_select_own"
  on public.ggm_favorites for select to authenticated
  using (user_id = auth.uid());

-- 누르기: 로그인한 사람이 자기 이름으로, 남의 상품에만
create policy "ggm_favorites_insert_own"
  on public.ggm_favorites for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.ggm_products p
      where p.id = product_id and p.seller_id <> auth.uid()
    )
  );

-- 취소: 본인만
create policy "ggm_favorites_delete_own"
  on public.ggm_favorites for delete to authenticated
  using (user_id = auth.uid());

/* ------------------------------------------------------------------ */
/* 좋아요 인원 자동 집계                                                */
/* ------------------------------------------------------------------ */
create or replace function public.ggm_sync_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);

  update public.ggm_products p
    set like_count = (
      select count(*) from public.ggm_favorites f where f.product_id = pid
    )
    where p.id = pid;

  return null;
end;
$$;

revoke all on function public.ggm_sync_like_count() from public, anon, authenticated;

drop trigger if exists ggm_favorites_sync_count on public.ggm_favorites;
create trigger ggm_favorites_sync_count
  after insert or delete on public.ggm_favorites
  for each row execute function public.ggm_sync_like_count();

/* ------------------------------------------------------------------ */
/* 좋아요 수가 바뀌어도 '수정됨' 으로 치지 않는다                       */
/* ------------------------------------------------------------------ */
create or replace function public.ggm_products_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (to_jsonb(new) - 'view_count' - 'offer_count' - 'like_count' - 'updated_at')
     = (to_jsonb(old) - 'view_count' - 'offer_count' - 'like_count' - 'updated_at') then
    new.updated_at = old.updated_at;
    return new;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.ggm_products_touch_updated_at() from public, anon, authenticated;

/* ------------------------------------------------------------------ */
/* 참고: ggm_favorites 가 상품과 프로필을 둘 다 참조하면서              */
/* "상품 → 판매자 닉네임" 조인 경로가 두 개로 보이게 되었다.            */
/* 그래서 앱 코드에서 조인 경로를 이름으로 지정한다:                    */
/*   .select("*, ggm_profiles!ggm_products_seller_id_fkey(nickname)")  */
/* ------------------------------------------------------------------ */
