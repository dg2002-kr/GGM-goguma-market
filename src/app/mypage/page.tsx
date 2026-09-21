import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import ProductCard from "@/components/ProductCard";
import type { Profile, ProductWithSeller } from "@/types/database";

export const metadata = { title: "마이페이지 · 고구마마켓" };

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts 에서 걸러 주지만, 안전장치로 한 번 더 확인
  if (!user) redirect("/login?next=/mypage");

  const { data: profile } = await supabase
    .from("ggm_profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const { data: myProducts } = await supabase
    .from("ggm_products")
    .select("*, ggm_profiles!ggm_products_seller_id_fkey(nickname)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ProductWithSeller[]>();

  const joinedAt = new Date(
    profile?.created_at ?? user.created_at,
  ).toLocaleDateString("ko-KR");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">마이페이지</h1>

      <div className="ggm-card">
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-3xl"
            aria-hidden
          >
            🍠
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">
              {profile?.nickname ?? "이름 없음"}
            </p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-muted">동네</dt>
            <dd className="font-medium">{profile?.region ?? "-"}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted">가입일</dt>
            <dd className="font-medium">{joinedAt}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted">등록한 상품</dt>
            <dd className="font-medium">{myProducts?.length ?? 0}개</dd>
          </div>
        </dl>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">내가 등록한 상품</h2>
          <Link
            href="/products/new"
            className="text-sm font-semibold text-primary hover:underline"
          >
            + 새 상품 등록
          </Link>
        </div>

        {myProducts && myProducts.length > 0 ? (
          <ul className="space-y-3">
            {myProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted">
            아직 등록한 상품이 없어요
          </p>
        )}
      </section>

      <form action={signOut} className="mt-10">
        <button
          type="submit"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold text-danger transition hover:bg-danger/6"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
