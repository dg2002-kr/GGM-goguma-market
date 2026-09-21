import { updateProductStatus } from "@/app/products/actions";
import { STATUS_LABEL, type ProductStatus } from "@/lib/categories";

/**
 * 판매 상태를 한 번에 바꾸는 버튼들.
 * 버튼마다 name="status" value="..." 를 달아 두면
 * 누른 버튼의 값만 폼과 함께 전송된다. (자바스크립트 없이 동작)
 */
export default function ProductStatusSwitcher({
  productId,
  current,
}: {
  productId: string;
  current: ProductStatus;
}) {
  return (
    <form action={updateProductStatus}>
      <input type="hidden" name="id" value={productId} />
      <p className="mb-2 text-sm font-medium text-muted">판매 상태</p>
      <div className="flex gap-2">
        {(Object.keys(STATUS_LABEL) as ProductStatus[]).map((status) => {
          const active = status === current;
          return (
            <button
              key={status}
              type="submit"
              name="status"
              value={status}
              aria-pressed={active}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {STATUS_LABEL[status]}
            </button>
          );
        })}
      </div>
    </form>
  );
}
