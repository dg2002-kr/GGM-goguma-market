import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isValidCategory } from "@/lib/categories";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import type { ProductWithSeller } from "@/types/database";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected = category && isValidCategory(category) ? category : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 판매자 닉네임까지 한 번에 가져온다 (ggm_products → ggm_profiles 조인)
  let query = supabase
    .from("ggm_products")
    .select("*, ggm_profiles!ggm_products_seller_id_fkey(nickname)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (selected) query = query.eq("category", selected);

  const { data: products, error } = await query.returns<ProductWithSeller[]>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {selected ?? "우리 동네"} 중고거래
          </h1>
          <p className="mt-1 text-sm text-muted">
            이웃들이 내놓은 물건을 둘러보세요
          </p>
        </div>
      </div>

      <CategoryFilter selected={selected} />

      {error && (
        <p className="mt-6 rounded-xl bg-danger/8 px-4 py-3 text-sm text-danger">
          상품을 불러오지 못했습니다: {error.message}
        </p>
      )}

      {products && products.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <p className="text-4xl" aria-hidden>
              🍠
            </p>
            <p className="mt-4 font-semibold">
              {selected
                ? `'${selected}' 카테고리에 아직 상품이 없어요`
                : "아직 등록된 상품이 없어요"}
            </p>
            <p className="mt-1.5 text-sm text-muted">
              첫 번째 상품을 올려 보세요!
            </p>
            <Link
              href={user ? "/products/new" : "/login?next=/products/new"}
              className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              상품 등록하기
            </Link>
          </div>
        )
      )}

      {/* 글쓰기 버튼 (모바일 앱처럼 우하단 고정) */}
      <Link
        href={user ? "/products/new" : "/login?next=/products/new"}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover active:scale-[0.98]"
      >
        <span className="text-lg leading-none" aria-hidden>
          ＋
        </span>
        글쓰기
      </Link>
    </div>
  );
}
