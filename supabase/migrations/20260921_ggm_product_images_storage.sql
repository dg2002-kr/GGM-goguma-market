-- 적용 완료(기록용): 3단계 상품 이미지
-- 파일은 Storage 버킷에, DB에는 '경로'만 저장한다.

alter table public.ggm_products
  add column if not exists image_paths text[] not null default '{}';

comment on column public.ggm_products.image_paths is
  'Storage 버킷 ggm-products 안의 파일 경로 목록. 첫 번째가 대표 이미지.';

-- 공개 버킷 (이미지는 누구나 볼 수 있어야 하므로 public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ggm-products', 'ggm-products', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 파일은 "<사용자 id>/<파일명>" 으로 저장한다.
-- storage.foldername(name)[1] 이 폴더명(= 사용자 id)이라,
-- 이것을 auth.uid() 와 비교하면 '내 폴더에만 쓸 수 있게' 만들 수 있다.
create policy "ggm_product_images_read"
  on storage.objects for select
  using (bucket_id = 'ggm-products');

create policy "ggm_product_images_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'ggm-products'
              and (storage.foldername(name))[1] = auth.uid()::text);

create policy "ggm_product_images_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'ggm-products'
         and (storage.foldername(name))[1] = auth.uid()::text);

create policy "ggm_product_images_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'ggm-products'
         and (storage.foldername(name))[1] = auth.uid()::text);
