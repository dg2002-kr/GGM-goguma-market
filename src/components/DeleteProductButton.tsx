"use client";

import { useEffect, useState } from "react";
import { deleteProduct } from "@/app/products/actions";
import SubmitButton from "@/components/SubmitButton";

/** 실수로 지우는 일이 없도록 한 번 더 확인받는다. */
export default function DeleteProductButton({
  productId,
  title,
  imageCount,
}: {
  productId: string;
  title: string;
  imageCount: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold text-danger transition hover:bg-danger/6"
      >
        삭제
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <h2 id="delete-dialog-title" className="text-lg font-bold">
              이 상품을 삭제할까요?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <b className="text-foreground">{title}</b>
              {imageCount > 0 && ` 그리고 사진 ${imageCount}장이`}
              {imageCount > 0 ? " 함께 " : " 이(가) "}
              삭제됩니다. 되돌릴 수 없습니다.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold transition hover:bg-surface-2"
              >
                취소
              </button>
              <form action={deleteProduct} className="flex-1">
                <input type="hidden" name="id" value={productId} />
                <SubmitButton
                  pendingText="삭제 중..."
                  className="ggm-btn bg-danger hover:bg-danger/85"
                >
                  삭제
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
