import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryEmoji, STATUS_LABEL } from "@/lib/categories";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { deleteProduct } from "@/app/products/actions";
import ProductGallery from "@/components/ProductGallery";
import type { ProductWithSeller } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ggm_products")
    .select("title")
    .eq("id", id)
    .maybeSingle();

  return { title: data ? `${data.title} · 고구마마켓` : "고구마마켓" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("ggm_products")
    .select("*, ggm_profiles(nickname)")
    .eq("id", id)
    .maybeSingle<ProductWithSeller>();

  if (!product) notFound();

  const isMine = user?.id === product.seller_id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        ← 목록으로
      </Link>

      <div className="relative mt-4">
        {product.image_paths?.length > 0 ? (
          <ProductGallery paths={product.image_paths} title={product.title} />
        ) : (
          // 사진을 안 올린 상품은 카테고리 이모지로 대신한다
          <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-surface-2 text-7xl">
            <span aria-hidden>{categoryEmoji(product.category)}</span>
          </div>
        )}

        {product.status !== "selling" && (
          <span className="absolute left-4 top-4 z-10 rounded-lg bg-foreground/75 px-3 py-1.5 text-sm font-bold text-white">
            {STATUS_LABEL[product.status]}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
        <div
          className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-sm font-bold"
          aria-hidden
        >
          {product.ggm_profiles?.nickname?.[0] ?? "🍠"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {product.ggm_profiles?.nickname ?? "알 수 없음"}
          </p>
          <p className="text-xs text-muted">{product.region}</p>
        </div>
      </div>

      <div className="mt-5">
        <h1 className="text-xl font-bold leading-snug">{product.title}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {categoryEmoji(product.category)} {product.category} ·{" "}
          {formatRelativeTime(product.created_at)}
        </p>
        <p className="mt-3 text-2xl font-extrabold">
          {formatPrice(product.price)}
        </p>

        {product.description ? (
          <p className="mt-5 whitespace-pre-wrap leading-relaxed text-foreground/90">
            {product.description}
          </p>
        ) : (
          <p className="mt-5 text-sm text-muted">설명이 없습니다.</p>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-5">
        {isMine ? (
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button
              type="submit"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold text-danger transition hover:bg-danger/6"
            >
              상품 삭제
            </button>
          </form>
        ) : (
          <button
            type="button"
            disabled
            className="ggm-btn"
            title="채팅 기능은 다음 단계에서 만듭니다"
          >
            💬 채팅하기 (준비 중)
          </button>
        )}
      </div>
    </div>
  );
}
