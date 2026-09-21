/** 상품 카테고리 목록. value 가 DB에 저장되는 값이다. */
export const CATEGORIES = [
  { value: "디지털기기", emoji: "📱" },
  { value: "생활가전", emoji: "🔌" },
  { value: "가구/인테리어", emoji: "🛋️" },
  { value: "생활/주방", emoji: "🍳" },
  { value: "유아동", emoji: "🧸" },
  { value: "의류/잡화", emoji: "👕" },
  { value: "뷰티/미용", emoji: "💄" },
  { value: "스포츠/레저", emoji: "⚽" },
  { value: "취미/게임/음반", emoji: "🎮" },
  { value: "도서", emoji: "📚" },
  { value: "반려동물용품", emoji: "🐶" },
  { value: "기타", emoji: "📦" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function categoryEmoji(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.emoji ?? "📦";
}

export function isValidCategory(value: string): boolean {
  return CATEGORIES.some((c) => c.value === value);
}

/** 판매 상태 표시용 */
export const STATUS_LABEL = {
  selling: "판매중",
  reserved: "예약중",
  sold: "판매완료",
} as const;

export type ProductStatus = keyof typeof STATUS_LABEL;

/** 가격 인하 요청 상태 표시용 */
export const OFFER_STATUS_LABEL = {
  pending: "답변 기다리는 중",
  accepted: "수락됨",
  rejected: "거절됨",
} as const;
