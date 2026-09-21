-- 적용 완료(기록용): 2단계 상품 테이블
create table if not exists public.ggm_products (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null,          -- 아래에서 ggm_profiles(id) 를 참조하도록 건다
  title       text not null check (char_length(title) between 2 and 60),
  description text not null default '',
  price       bigint not null default 0 check (price >= 0 and price <= 999999999),
  category    text not null default '기타',
  status      text not null default 'selling'
              check (status in ('selling', 'reserved', 'sold')),
  region      text not null default '우리동네',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ggm_products_created_at_idx on public.ggm_products (created_at desc);
create index if not exists ggm_products_seller_id_idx  on public.ggm_products (seller_id);
create index if not exists ggm_products_category_idx   on public.ggm_products (category);

alter table public.ggm_products enable row level security;

-- 목록/상세는 로그인 없이도 조회 가능
create policy "ggm_products_select_all"
  on public.ggm_products for select using (true);

-- 등록은 로그인한 사람이 '자기 이름으로만'
create policy "ggm_products_insert_own"
  on public.ggm_products for insert to authenticated
  with check (auth.uid() = seller_id);

-- 수정/삭제는 판매자 본인만
create policy "ggm_products_update_own"
  on public.ggm_products for update to authenticated
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

create policy "ggm_products_delete_own"
  on public.ggm_products for delete to authenticated
  using (auth.uid() = seller_id);

create trigger ggm_products_set_updated_at
  before update on public.ggm_products
  for each row execute function public.ggm_set_updated_at();

-- seller_id 는 auth.users 가 아니라 ggm_profiles 를 참조하게 한다.
-- 그래야 .select("*, ggm_profiles(nickname)") 로 판매자 닉네임을 조인할 수 있다.
alter table public.ggm_products
  add constraint ggm_products_seller_id_fkey
  foreign key (seller_id) references public.ggm_profiles(id) on delete cascade;
