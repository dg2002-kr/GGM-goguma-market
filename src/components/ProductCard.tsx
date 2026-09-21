import Image from "next/image";
import Link from "next/link";
import { categoryEmoji, STATUS_LABEL } from "@/lib/categories";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { productImageUrl } from "@/lib/supabase/storage";
import ProductStatsInline from "@/components/ProductStatsInline";
import type { ProductWithSeller } from "@/types/database";

export default function ProductCard({ product }: { product: ProductWithSeller }) {
  const isClosed = product.status !== "selling";
  const thumbnail = product.image_paths?.[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex gap-4 rounded-2xl border border-border bg-surface p-3 transition hover:border-primary/40 hover:bg-surface-2"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {thumbnail ? (
          <Image
            src={productImageUrl(thumbnail)}
            alt={product.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          // 사진을 안 올린 상품은 카테고리 이모지로 대신한다
          <span className="grid h-full w-full place-items-center text-3xl" aria-hidden>
            {categoryEmoji(product.category)}
          </span>
        )}

        {isClosed && (
          <span className="absolute inset-0 grid place-items-center bg-foreground/55 text-xs font-bold text-white">
            {STATUS_LABEL[product.status]}
          </span>
        )}

        {product.image_paths?.length > 1 && (
          <span className="absolute bottom-1 right-1 rounded-md bg-foreground/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {product.image_paths.length}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="truncate font-semibold group-hover:text-primary">
          {product.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted">
          {product.region} · {formatRelativeTime(product.created_at)}
        </p>
        <p className="mt-2 font-bold">{formatPrice(product.price)}</p>
        <p className="mt-1 truncate text-xs text-muted">
          {categoryEmoji(product.category)} {product.category}
          {product.ggm_profiles?.nickname &&
            ` · ${product.ggm_profiles.nickname}`}
        </p>
        <div className="mt-2">
          <ProductStatsInline
            viewCount={product.view_count}
            offerCount={product.offer_count}
            likeCount={product.like_count}
            chatCount={null}
          />
        </div>
      </div>
    </Link>
  );
}
