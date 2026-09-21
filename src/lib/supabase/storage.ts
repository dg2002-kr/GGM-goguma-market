/** 상품 이미지를 보관하는 Storage 버킷 이름 */
export const PRODUCT_BUCKET = "ggm-products";

/** 상품 하나에 올릴 수 있는 이미지 수 / 파일당 최대 용량 */
export const MAX_IMAGES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * 저장된 경로 -> 브라우저에서 바로 쓸 수 있는 공개 URL.
 * 버킷이 public 이라 별도 서명 없이 접근할 수 있다.
 */
export function productImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${PRODUCT_BUCKET}/${path}`;
}

/**
 * 업로드 경로는 반드시 "<사용자 id>/<파일명>" 형태여야 한다.
 * Storage 정책이 첫 번째 폴더명을 auth.uid() 와 비교하기 때문.
 */
export function buildImagePath(userId: string, fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  return `${userId}/${crypto.randomUUID()}.${ext}`;
}
