import Link from "next/link";
import { toggleFavorite } from "@/app/products/favorite-actions";

/**
 * 좋아요 버튼.
 * 로그인하지 않았으면 버튼 대신 로그인 링크를 보여 준다.
 */
export default function FavoriteButton({
  productId,
  liked,
  likeCount,
  isLoggedIn,
}: {
  productId: string;
  liked: boolean;
  likeCount: number;
  isLoggedIn: boolean;
}) {
  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=/products/${productId}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold text-muted transition hover:bg-surface-2"
      >
        <span aria-hidden>🤍</span>
        좋아요 {likeCount}
      </Link>
    );
  }

  return (
    <form action={toggleFavorite}>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="liked" value={String(liked)} />
      <button
        type="submit"
        aria-pressed={liked}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[15px] font-semibold transition active:scale-[0.99] ${
          liked
            ? "border-danger/40 bg-danger/8 text-danger"
            : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground"
        }`}
      >
        <span aria-hidden>{liked ? "❤️" : "🤍"}</span>
        좋아요 {likeCount}
      </button>
    </form>
  );
}
