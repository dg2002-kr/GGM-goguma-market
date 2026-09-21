-- 적용 완료(기록용): 5단계 가격 인하 요청
-- 구매자가 "이 가격에 주세요" 하고 제안하면, 판매자가 수락/거절한다.

create table if not exists public.ggm_price_offers (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.ggm_products(id) on delete cascade,
  buyer_id     uuid not null references public.ggm_profiles(id) on delete cascade,
  offer_price  bigint not null check (offer_price >= 0 and offer_price <= 999999999),
  message      text not null default '' check (char_length(message) <= 200),
  status       text not null default 'pending'
               check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists ggm_price_offers_product_idx
  on public.ggm_price_offers (product_id, created_at desc);

-- 같은 사람이 같은 상품에 답변 대기중인 요청을 두 개 만들지 못하게 막는다
create unique index if not exists ggm_price_offers_one_pending
  on public.ggm_price_offers (product_id, buyer_id)
  where status = 'pending';

alter table public.ggm_price_offers enable row level security;

-- 조회: 요청을 보낸 구매자 본인과, 그 상품의 판매자만 (남에게는 안 보인다)
create policy "ggm_price_offers_select_related"
  on public.ggm_price_offers for select to authenticated
  using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.ggm_products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

-- 생성: 로그인한 사람이 '자기 이름으로', '남의 상품에만'
create policy "ggm_price_offers_insert_buyer"
  on public.ggm_price_offers for insert to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.ggm_products p
      where p.id = product_id and p.seller_id <> auth.uid()
    )
  );

-- 수락/거절: 그 상품의 판매자만
create policy "ggm_price_offers_update_seller"
  on public.ggm_price_offers for update to authenticated
  using (
    exists (
      select 1 from public.ggm_products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.ggm_products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

-- 취소: 구매자 본인이 자기 요청을 거둘 수 있다
create policy "ggm_price_offers_delete_buyer"
  on public.ggm_price_offers for delete to authenticated
  using (buyer_id = auth.uid());
