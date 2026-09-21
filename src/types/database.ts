import type { ProductStatus } from "@/lib/categories";

/** 고구마마켓 프로필 (public.ggm_profiles) */
export type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  region: string;
  created_at: string;
  updated_at: string;
};

/** 고구마마켓 상품 (public.ggm_products) */
export type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  region: string;
  image_paths: string[];
  created_at: string;
  updated_at: string;
};

/** 상품 + 판매자 닉네임을 함께 조회했을 때의 형태 */
export type ProductWithSeller = Product & {
  ggm_profiles: Pick<Profile, "nickname"> | null;
};

/** 가격 인하 요청 상태 */
export type OfferStatus = "pending" | "accepted" | "rejected";

/** 가격 인하 요청 (public.ggm_price_offers) */
export type PriceOffer = {
  id: string;
  product_id: string;
  buyer_id: string;
  offer_price: number;
  message: string;
  status: OfferStatus;
  created_at: string;
  responded_at: string | null;
};

/** 요청 + 보낸 사람 닉네임 */
export type PriceOfferWithBuyer = PriceOffer & {
  ggm_profiles: Pick<Profile, "nickname"> | null;
};
