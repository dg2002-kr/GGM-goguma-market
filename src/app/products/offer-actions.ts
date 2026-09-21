"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OfferFormState = {
  error?: string;
  message?: string;
  values?: { offerPrice?: string; note?: string };
} | null;

/* ------------------------------------------------------------------ */
/* 구매자 — 가격 인하 요청 보내기                                       */
/* ------------------------------------------------------------------ */
export async function createPriceOffer(
  _prevState: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> {
  const productId = String(formData.get("product_id") ?? "");
  const priceRaw = String(formData.get("offer_price") ?? "").replace(/[^0-9]/g, "");
  const note = String(formData.get("message") ?? "").trim();

  const values = { offerPrice: priceRaw, note };

  if (!productId) return { error: "잘못된 접근입니다.", values };
  if (!priceRaw) return { error: "제안할 가격을 입력해 주세요.", values };
  if (note.length > 200) return { error: "메시지는 200자까지 쓸 수 있습니다.", values };

  const offerPrice = Number(priceRaw);
  if (!Number.isFinite(offerPrice) || offerPrice < 0 || offerPrice > 999_999_999) {
    return { error: "가격을 다시 확인해 주세요.", values };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다.", values };

  // 지금 가격보다 낮아야 '인하' 요청이다
  const { data: product } = await supabase
    .from("ggm_products")
    .select("price, seller_id, status")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return { error: "상품을 찾을 수 없습니다.", values };
  if (product.seller_id === user.id) {
    return { error: "내 상품에는 요청할 수 없습니다.", values };
  }
  if (product.status !== "selling") {
    return { error: "판매중인 상품에만 요청할 수 있습니다.", values };
  }
  if (offerPrice >= product.price) {
    return {
      error: `지금 가격(${product.price.toLocaleString("ko-KR")}원)보다 낮은 금액을 제안해 주세요.`,
      values,
    };
  }

  const { error } = await supabase.from("ggm_price_offers").insert({
    product_id: productId,
    buyer_id: user.id,
    offer_price: offerPrice,
    message: note,
  });

  if (error) {
    // 같은 상품에 답변 대기중인 요청이 이미 있으면 여기로 온다
    if (error.code === "23505") {
      return { error: "이미 보낸 요청이 있습니다. 답변을 기다려 주세요.", values };
    }
    return { error: `요청을 보내지 못했습니다: ${error.message}`, values };
  }

  revalidatePath(`/products/${productId}`);
  return { message: "가격 인하 요청을 보냈습니다." };
}

/* ------------------------------------------------------------------ */
/* 구매자 — 보낸 요청 취소                                              */
/* ------------------------------------------------------------------ */
export async function cancelPriceOffer(formData: FormData) {
  const offerId = String(formData.get("offer_id") ?? "");
  const productId = String(formData.get("product_id") ?? "");
  if (!offerId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("ggm_price_offers")
    .delete()
    .eq("id", offerId)
    .eq("buyer_id", user.id)
    .eq("status", "pending");

  revalidatePath(`/products/${productId}`);
}

/* ------------------------------------------------------------------ */
/* 판매자 — 수락 / 거절                                                 */
/* ------------------------------------------------------------------ */
export async function respondToPriceOffer(formData: FormData) {
  const offerId = String(formData.get("offer_id") ?? "");
  const productId = String(formData.get("product_id") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (!offerId || !productId) return;
  if (decision !== "accepted" && decision !== "rejected") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 내 상품이 맞는지 먼저 확인한다 (RLS도 막지만 여기서도 한 번 더)
  const { data: product } = await supabase
    .from("ggm_products")
    .select("id")
    .eq("id", productId)
    .eq("seller_id", user.id)
    .maybeSingle();
  if (!product) return;

  const { data: offer } = await supabase
    .from("ggm_price_offers")
    .select("offer_price, status")
    .eq("id", offerId)
    .eq("product_id", productId)
    .maybeSingle();
  if (!offer || offer.status !== "pending") return;

  const { error } = await supabase
    .from("ggm_price_offers")
    .update({ status: decision, responded_at: new Date().toISOString() })
    .eq("id", offerId)
    .eq("status", "pending");
  if (error) return;

  // 수락했으면 상품 가격을 제안받은 금액으로 내린다
  if (decision === "accepted") {
    await supabase
      .from("ggm_products")
      .update({ price: offer.offer_price })
      .eq("id", productId)
      .eq("seller_id", user.id);
  }

  revalidatePath("/");
  revalidatePath("/mypage");
  revalidatePath(`/products/${productId}`);
}
