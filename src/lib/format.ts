/** 12000 -> "12,000원", 0 -> "나눔" */
export function formatPrice(price: number): string {
  if (price === 0) return "나눔";
  return `${price.toLocaleString("ko-KR")}원`;
}

/** 작성 시각을 "3분 전", "2일 전" 처럼 표시한다. */
export function formatRelativeTime(isoDate: string): string {
  const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);

  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)}일 전`;

  return new Date(isoDate).toLocaleDateString("ko-KR");
}
