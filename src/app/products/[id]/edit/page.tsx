import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import type { Product } from "@/types/database";

export const metadata = { title: "상품 수정 · 고구마마켓" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/products/${id}/edit`);

  // 내 상품이 아니면 조회 결과가 비어 404 가 된다
  const { data: product } = await supabase
    .from("ggm_products")
    .select("*")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle<Product>();

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/products/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        ← 상품으로 돌아가기
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">상품 수정</h1>
      <p className="mt-1.5 text-sm text-muted">
        올려 둔 내용을 자유롭게 고칠 수 있습니다
      </p>

      <div className="ggm-card mt-6">
        <ProductForm userId={user.id} product={product} />
      </div>
    </div>
  );
}
