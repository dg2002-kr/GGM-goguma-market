import { respondToPriceOffer } from "@/app/products/offer-actions";
import { OFFER_STATUS_LABEL } from "@/lib/categories";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import type { PriceOfferWithBuyer } from "@/types/database";

/**
 * 판매자 화면 — 받은 가격 인하 요청 목록.
 * 답변 대기중인 요청에는 수락 / 거절 버튼이 붙는다.
 */
export default function PriceOfferList({
  productId,
  offers,
  currentPrice,
}: {
  productId: string;
  offers: PriceOfferWithBuyer[];
  currentPrice: number;
}) {
  const pendingCount = offers.filter((o) => o.status === "pending").length;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-bold">받은 가격 인하 요청</h2>
        {pendingCount > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
            {pendingCount}
          </span>
        )}
      </div>

      {offers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center text-sm text-muted">
          아직 들어온 요청이 없어요
        </p>
      ) : (
        <ul className="space-y-3">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {offer.ggm_profiles?.nickname ?? "알 수 없음"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatRelativeTime(offer.created_at)}
                  </p>
                </div>

                {offer.status === "pending" ? (
                  <span className="shrink-0 rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                    {OFFER_STATUS_LABEL.pending}
                  </span>
                ) : (
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${
                      offer.status === "accepted"
                        ? "bg-accent/12 text-accent"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    {OFFER_STATUS_LABEL[offer.status]}
                  </span>
                )}
              </div>

              <p className="mt-3 text-lg font-extrabold">
                {formatPrice(offer.offer_price)}
                {offer.status === "pending" && offer.offer_price < currentPrice && (
                  <span className="ml-2 text-sm font-medium text-muted">
                    ({(currentPrice - offer.offer_price).toLocaleString("ko-KR")}원 인하)
                  </span>
                )}
              </p>

              {offer.message && (
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/90">
                  {offer.message}
                </p>
              )}

              {offer.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <form action={respondToPriceOffer} className="flex-1">
                    <input type="hidden" name="offer_id" value={offer.id} />
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground"
                    >
                      거절
                    </button>
                  </form>
                  <form action={respondToPriceOffer} className="flex-1">
                    <input type="hidden" name="offer_id" value={offer.id} />
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="decision" value="accepted" />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    >
                      수락
                    </button>
                  </form>
                </div>
              )}

              {offer.status === "accepted" && (
                <p className="mt-3 text-xs text-muted">
                  수락해서 판매 가격이 이 금액으로 바뀌었습니다.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
