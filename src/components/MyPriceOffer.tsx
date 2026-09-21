import { cancelPriceOffer } from "@/app/products/offer-actions";
import { OFFER_STATUS_LABEL } from "@/lib/categories";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import type { PriceOffer } from "@/types/database";

/** 구매자 화면 — 내가 보낸 가격 인하 요청의 상태 */
export default function MyPriceOffer({
  offer,
  productId,
}: {
  offer: PriceOffer;
  productId: string;
}) {
  const tone =
    offer.status === "accepted"
      ? "border-accent/40 bg-accent/8"
      : offer.status === "rejected"
        ? "border-border bg-surface-2"
        : "border-primary/40 bg-primary-soft";

  return (
    <div className={`rounded-2xl border px-5 py-4 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">내가 보낸 요청</p>
        <span className="text-xs font-semibold text-muted">
          {formatRelativeTime(offer.created_at)}
        </span>
      </div>

      <p className="mt-2 text-lg font-extrabold">{formatPrice(offer.offer_price)}</p>

      {offer.message && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
          {offer.message}
        </p>
      )}

      <p className="mt-3 text-sm">
        {offer.status === "pending" && (
          <span className="text-primary">⏳ {OFFER_STATUS_LABEL.pending}</span>
        )}
        {offer.status === "accepted" && (
          <span className="font-semibold text-accent">
            🎉 판매자가 수락했어요! 이 가격으로 살 수 있습니다.
          </span>
        )}
        {offer.status === "rejected" && (
          <span className="text-muted">
            아쉽지만 거절됐어요. 다른 금액으로 다시 요청할 수 있습니다.
          </span>
        )}
      </p>

      {offer.status === "pending" && (
        <form action={cancelPriceOffer} className="mt-4">
          <input type="hidden" name="offer_id" value={offer.id} />
          <input type="hidden" name="product_id" value={productId} />
          <button
            type="submit"
            className="text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            요청 취소하기
          </button>
        </form>
      )}
    </div>
  );
}
