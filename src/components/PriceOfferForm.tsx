"use client";

import { useActionState, useState } from "react";
import { createPriceOffer, type OfferFormState } from "@/app/products/offer-actions";
import SubmitButton from "@/components/SubmitButton";
import { ErrorMessage } from "@/components/FormMessage";
import { formatPrice } from "@/lib/format";

/**
 * 구매자가 "이 가격에 주세요" 하고 제안하는 버튼과 입력창.
 * 버튼을 눌러야 입력창이 펼쳐진다.
 */
export default function PriceOfferForm({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<OfferFormState, FormData>(
    createPriceOffer,
    null,
  );

  const [price, setPrice] = useState(state?.values?.offerPrice ?? "");
  const digitsOnly = price.replace(/[^0-9]/g, "");
  const offerPrice = Number(digitsOnly || "0");
  const discount = currentPrice - offerPrice;
  const isLower = digitsOnly !== "" && offerPrice < currentPrice;

  // 요청을 보내고 나면 서버가 화면을 다시 그려서 '보낸 요청' 카드가 나온다
  if (state?.message) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-primary bg-primary-soft px-4 py-3 text-[15px] font-semibold text-primary transition hover:bg-primary/12"
      >
        💸 가격 인하 요청하기
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <input type="hidden" name="product_id" value={productId} />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">가격 인하 요청</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-muted hover:text-foreground"
        >
          닫기
        </button>
      </div>

      <p className="mb-4 text-sm text-muted">
        지금 가격은 <b className="text-foreground">{formatPrice(currentPrice)}</b> 입니다.
        얼마면 사시겠어요?
      </p>

      <label className="ggm-label" htmlFor="offer_price">
        제안 가격
      </label>
      <div className="relative">
        <input
          id="offer_price"
          name="offer_price"
          type="text"
          inputMode="numeric"
          required
          value={digitsOnly ? Number(digitsOnly).toLocaleString("ko-KR") : ""}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
          className="ggm-input pr-12"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
          원
        </span>
      </div>

      {/* 빠르게 고르기 */}
      <div className="mt-2 flex gap-2">
        {[10, 20, 30].map((percent) => {
          const suggested = Math.max(
            Math.floor((currentPrice * (100 - percent)) / 100 / 1000) * 1000,
            0,
          );
          return (
            <button
              key={percent}
              type="button"
              onClick={() => setPrice(String(suggested))}
              className="flex-1 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs font-medium text-muted transition hover:border-primary hover:text-primary"
            >
              {percent}% down
            </button>
          );
        })}
      </div>

      {isLower && (
        <p className="mt-2 text-xs text-accent">
          지금보다 {discount.toLocaleString("ko-KR")}원 저렴하게 제안합니다.
        </p>
      )}

      <div className="mt-4">
        <label className="ggm-label" htmlFor="offer_message">
          한마디 <span className="font-normal text-muted">(선택)</span>
        </label>
        <textarea
          id="offer_message"
          name="message"
          rows={3}
          maxLength={200}
          defaultValue={state?.values?.note}
          placeholder="예) 오늘 바로 가지러 갈 수 있어요. 조금만 깎아주시면 감사하겠습니다!"
          className="ggm-input resize-y leading-relaxed"
        />
      </div>

      {state?.error && (
        <div className="mt-4">
          <ErrorMessage>{state.error}</ErrorMessage>
        </div>
      )}

      <div className="mt-4">
        <SubmitButton pendingText="보내는 중...">요청 보내기</SubmitButton>
      </div>
    </form>
  );
}
