-- 적용 완료(기록용): Supabase 보안 권고(advisor) 대응
-- 1) 트리거 함수의 search_path 고정
-- 2) 트리거 전용 함수를 REST(RPC)로 호출하지 못하도록 EXECUTE 권한 회수

create or replace function public.ggm_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.ggm_set_updated_at() from public, anon, authenticated;
revoke all on function public.ggm_handle_new_user() from public, anon, authenticated;
