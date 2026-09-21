"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "@/app/products/actions";
import ImageUploader from "@/components/ImageUploader";
import { CATEGORIES, STATUS_LABEL } from "@/lib/categories";
import SubmitButton from "@/components/SubmitButton";
import { ErrorMessage } from "@/components/FormMessage";
import type { Product } from "@/types/database";

/**
 * 등록과 수정을 한 폼으로 처리한다.
 * product 가 있으면 수정 모드.
 */
export default function ProductForm({
  userId,
  product,
}: {
  userId: string;
  product?: Product;
}) {
  const isEdit = Boolean(product);
  const [state, formAction] = useActionState<ProductFormState, FormData>(
    isEdit ? updateProduct : createProduct,
    null,
  );

  // 가격은 입력하는 동안 1,000 처럼 콤마를 찍어 준다.
  const [price, setPrice] = useState(
    state?.values?.price ?? (product ? String(product.price) : ""),
  );
  const digitsOnly = price.replace(/[^0-9]/g, "");

  return (
    <form action={formAction} className="space-y-5">
      {isEdit && <input type="hidden" name="id" value={product!.id} />}

      <ImageUploader userId={userId} initialPaths={product?.image_paths ?? []} />

      <div>
        <label className="ggm-label" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={60}
          defaultValue={state?.values?.title ?? product?.title}
          placeholder="예) 거의 새것인 무선 이어폰 팔아요"
          className="ggm-input"
        />
      </div>

      <div>
        <label className="ggm-label" htmlFor="category">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={state?.values?.category ?? product?.category ?? ""}
          className="ggm-input ggm-select"
        >
          <option value="" disabled>
            카테고리를 선택해 주세요
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.value}
            </option>
          ))}
        </select>
      </div>

      {isEdit && (
        <div>
          <label className="ggm-label" htmlFor="status">
            판매 상태
          </label>
          <select
            id="status"
            name="status"
            defaultValue={product!.status}
            className="ggm-input ggm-select"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="ggm-label" htmlFor="price">
          가격
        </label>
        <div className="relative">
          <input
            id="price"
            name="price"
            type="text"
            inputMode="numeric"
            value={digitsOnly ? Number(digitsOnly).toLocaleString("ko-KR") : ""}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="ggm-input pr-12"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
            원
          </span>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          0원으로 두면 <b className="text-accent">나눔</b>으로 표시됩니다.
        </p>
      </div>

      <div>
        <label className="ggm-label" htmlFor="description">
          자세한 설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={7}
          maxLength={2000}
          defaultValue={state?.values?.description ?? product?.description}
          placeholder={
            "상품의 상태, 사용 기간, 거래 방법 등을 적어 주세요.\n\n예) 작년에 구입해서 6개월 정도 썼어요.\n생활기스 조금 있고 작동은 문제 없습니다."
          }
          className="ggm-input resize-y leading-relaxed"
        />
      </div>

      {state?.error && <ErrorMessage>{state.error}</ErrorMessage>}

      <div className="flex gap-3">
        {isEdit && (
          <Link
            href={`/products/${product!.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold transition hover:bg-surface-2"
          >
            취소
          </Link>
        )}
        <div className={isEdit ? "flex-1" : "w-full"}>
          <SubmitButton pendingText={isEdit ? "저장 중..." : "등록 중..."}>
            {isEdit ? "수정 완료" : "상품 등록하기"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
