import Link from "next/link";
import { categoryEmoji, STATUS_LABEL } from "@/lib/categories";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import type { ProductWithSeller } from "@/types/database";

export default function ProductCard({ product }: { product: ProductWithSeller }) {
  const isClosed = product.status !== "selling";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex gap-4 rounded-2xl border border-border bg-surface p-3 transition hover:border-primary/40 hover:bg-surface-2"
    >
      {/* 이미지 업로드는 다음 단계 — 지금은 카테고리 이모지로 대신한다 */}
      <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-surface-2 text-3xl">
        <span aria-hidden>{categoryEmoji(product.category)}</span>
        {isClosed && (
          <span className="absolute inset-0 grid place-items-center rounded-xl bg-foreground/55 text-xs font-bold text-white">
            {STATUS_LABEL[product.status]}
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
      </div>
    </Link>
  );
}
