"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCategory } from "@/lib/categories";

export type ProductFormState = {
  error?: string;
  values?: {
    title?: string;
    price?: string;
    category?: string;
    description?: string;
  };
} | null;

/* ------------------------------------------------------------------ */
/* 상품 등록                                                           */
/* ------------------------------------------------------------------ */
export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").replace(/[^0-9]/g, "");
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const values = { title, price: priceRaw, category, description };

  if (title.length < 2 || title.length > 60) {
    return { error: "제목은 2~60자로 입력해 주세요.", values };
  }
  if (!isValidCategory(category)) {
    return { error: "카테고리를 선택해 주세요.", values };
  }
  const price = Number(priceRaw || "0");
  if (!Number.isFinite(price) || price < 0 || price > 999_999_999) {
    return { error: "가격을 다시 확인해 주세요.", values };
  }
  if (description.length > 2000) {
    return { error: "설명은 2000자까지 쓸 수 있습니다.", values };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다.", values };
  }

  // 판매자의 동네를 상품에 같이 남겨 둔다
  const { data: profile } = await supabase
    .from("ggm_profiles")
    .select("region")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("ggm_products")
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      category,
      region: profile?.region ?? "우리동네",
    })
    .select("id")
    .single();

  if (error) {
    return { error: `등록에 실패했습니다: ${error.message}`, values };
  }

  revalidatePath("/");
  revalidatePath("/mypage");
  redirect(`/products/${data.id}`);
}

/* ------------------------------------------------------------------ */
/* 상품 삭제 (판매자 본인만 — RLS가 한 번 더 막아 준다)                */
/* ------------------------------------------------------------------ */
export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("ggm_products")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  revalidatePath("/");
  revalidatePath("/mypage");
  redirect("/");
}
