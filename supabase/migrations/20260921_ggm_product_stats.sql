-- 적용 완료(기록용): 6단계 상품 통계 (조회 인원 / 네고 인원)

-- 화면에 보여줄 숫자는 상품 행에 같이 둔다. (누구나 읽을 수 있어야 하므로)
alter table public.ggm_products
  add column if not exists view_count  integer not null default 0,
  add column if not exists offer_count integer not null default 0;

comment on column public.ggm_products.view_count  is '이 상품을 본 사람 수 (중복 제외, 판매자 본인 제외)';
comment on column public.ggm_products.offer_count is '가격 네고 진행중인 사람 수';

/* ------------------------------------------------------------------ */
/* 누가 봤는지 기록해 두는 표 — 같은 사람을 두 번 세지 않으려고 필요하다  */
/* 정책을 하나도 만들지 않는다 = 앱에서 직접 읽거나 쓸 수 없다.          */
/* (누가 무엇을 봤는지는 비공개. 아래 함수로만 기록한다)                 */
/* ------------------------------------------------------------------ */
create table if not exists public.ggm_product_views (
  product_id uuid not null references public.ggm_products(id) on delete cascade,
  viewer_key text not null,
  created_at timestamptz not null default now(),
  primary key (product_id, viewer_key)
);

alter table public.ggm_product_views enable row level security;

/* ------------------------------------------------------------------ */
/* 조회 기록 함수                                                       */
/* security definer = 이 함수는 주인(관리자) 권한으로 동작한다는 뜻.     */
/* 방문자는 표에 직접 쓸 권한이 없지만 이 함수는 호출할 수 있다.         */
/* 로그인 상태면 화면이 보낸 값을 무시하고 실제 계정으로만 기록한다.     */
/* ------------------------------------------------------------------ */
create or replace function public.ggm_track_product_view(
  p_product_id uuid,
  p_viewer_key text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key   text;
  v_count integer;
begin
  if auth.uid() is not null then
    v_key := 'u:' || auth.uid()::text;
  else
    v_key := p_viewer_key;
  end if;

  if v_key is not null and length(v_key) between 3 and 100 then
    insert into public.ggm_product_views (product_id, viewer_key)
    values (p_product_id, v_key)
    on conflict do nothing;

    -- 처음 본 사람일 때만 숫자를 1 올린다
    if found then
      update public.ggm_products
        set view_count = view_count + 1
        where id = p_product_id;
    end if;
  end if;

  select view_count into v_count
    from public.ggm_products where id = p_product_id;

  return coalesce(v_count, 0);
end;
$$;

grant execute on function public.ggm_track_product_view(uuid, text) to anon, authenticated;

/* ------------------------------------------------------------------ */
/* 네고 인원 자동 집계                                                  */
/* ------------------------------------------------------------------ */
create or replace function public.ggm_sync_offer_count()
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
    set offer_count = (
      select count(distinct o.buyer_id)
      from public.ggm_price_offers o
      where o.product_id = pid and o.status = 'pending'
    )
    where p.id = pid;

  return null;
end;
$$;

revoke all on function public.ggm_sync_offer_count() from public, anon, authenticated;

drop trigger if exists ggm_price_offers_sync_count on public.ggm_price_offers;
create trigger ggm_price_offers_sync_count
  after insert or update or delete on public.ggm_price_offers
  for each row execute function public.ggm_sync_offer_count();

-- 기능을 만들기 전에 들어와 있던 요청들 다시 계산
update public.ggm_products p
  set offer_count = (
    select count(distinct o.buyer_id)
    from public.ggm_price_offers o
    where o.product_id = p.id and o.status = 'pending'
  );

/* ------------------------------------------------------------------ */
/* 숫자만 바뀐 경우는 '수정됨'으로 치지 않도록 updated_at 규칙 변경      */
/* (조회수가 오를 때마다 상품에 '수정됨'이 뜨면 안 되니까)               */
/* ------------------------------------------------------------------ */
create or replace function public.ggm_products_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (to_jsonb(new) - 'view_count' - 'offer_count' - 'updated_at')
     = (to_jsonb(old) - 'view_count' - 'offer_count' - 'updated_at') then
    new.updated_at = old.updated_at;
    return new;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.ggm_products_touch_updated_at() from public, anon, authenticated;

drop trigger if exists ggm_products_set_updated_at on public.ggm_products;
create trigger ggm_products_set_updated_at
  before update on public.ggm_products
  for each row execute function public.ggm_products_touch_updated_at();
