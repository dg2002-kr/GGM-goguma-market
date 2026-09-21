"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 좋아요 켜기/끄기.
 * 이미 눌러 뒀으면 취소하고, 아니면 추가한다.
 */
export async function toggleFavorite(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const liked = String(formData.get("liked") ?? "") === "true";
  if (!productId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/products/${productId}`);

  if (liked) {
    await supabase
      .from("ggm_favorites")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", user.id);
  } else {
    // 이미 있으면 그냥 넘어간다 (두 번 눌러도 에러가 나지 않게)
    await supabase
      .from("ggm_favorites")
      .upsert(
        { product_id: productId, user_id: user.id },
        { onConflict: "product_id,user_id", ignoreDuplicates: true },
      );
  }

  revalidatePath("/");
  revalidatePath("/mypage");
  revalidatePath(`/products/${productId}`);
}
