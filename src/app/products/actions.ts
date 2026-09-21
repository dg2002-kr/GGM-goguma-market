"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCategory, STATUS_LABEL, type ProductStatus } from "@/lib/categories";
import { MAX_IMAGES, PRODUCT_BUCKET } from "@/lib/supabase/storage";

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
/* 폼 값 검증 — 등록과 수정이 똑같이 쓴다                              */
/* ------------------------------------------------------------------ */
type ParsedForm = {
  title: string;
  price: number;
  category: string;
  description: string;
  imagePaths: string[];
};

function parseProductForm(
  formData: FormData,
): { ok: true; data: ParsedForm } | { ok: false; state: ProductFormState } {
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").replace(/[^0-9]/g, "");
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imagePaths = formData
    .getAll("image_paths")
    .map((v) => String(v))
    .filter(Boolean);

  const values = { title, price: priceRaw, category, description };
  const fail = (error: string) => ({ ok: false as const, state: { error, values } });

  if (title.length < 2 || title.length > 60) {
    return fail("제목은 2~60자로 입력해 주세요.");
  }
  if (!isValidCategory(category)) {
    return fail("카테고리를 선택해 주세요.");
  }
  const price = Number(priceRaw || "0");
  if (!Number.isFinite(price) || price < 0 || price > 999_999_999) {
    return fail("가격을 다시 확인해 주세요.");
  }
  if (description.length > 2000) {
    return fail("설명은 2000자까지 쓸 수 있습니다.");
  }
  if (imagePaths.length > MAX_IMAGES) {
    return fail(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.`);
  }

  return { ok: true, data: { title, price, category, description, imagePaths } };
}

/* ------------------------------------------------------------------ */
/* C — 상품 등록                                                       */
/* ------------------------------------------------------------------ */
export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductForm(formData);
  if (!parsed.ok) return parsed.state;
  const { title, price, category, description, imagePaths } = parsed.data;
  const values = { title, price: String(price), category, description };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다.", values };

  // 사진 경로는 브라우저가 보낸 값이므로 '내 폴더' 것인지 서버에서 다시 확인한다.
  if (imagePaths.some((path) => !path.startsWith(`${user.id}/`))) {
    return { error: "잘못된 이미지 경로입니다.", values };
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
      image_paths: imagePaths,
    })
    .select("id")
    .single();

  if (error) return { error: `등록에 실패했습니다: ${error.message}`, values };

  revalidatePath("/");
  revalidatePath("/mypage");
  redirect(`/products/${data.id}`);
}

/* ------------------------------------------------------------------ */
/* U — 상품 수정                                                       */
/* ------------------------------------------------------------------ */
export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "selling");

  const parsed = parseProductForm(formData);
  if (!parsed.ok) return parsed.state;
  const { title, price, category, description, imagePaths } = parsed.data;
  const values = { title, price: String(price), category, description };

  if (!id) return { error: "잘못된 접근입니다.", values };
  if (!(statusRaw in STATUS_LABEL)) {
    return { error: "판매 상태를 다시 선택해 주세요.", values };
  }
  const status = statusRaw as ProductStatus;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다.", values };

  if (imagePaths.some((path) => !path.startsWith(`${user.id}/`))) {
    return { error: "잘못된 이미지 경로입니다.", values };
  }

  // 수정 전 사진 목록을 알아야 '빠진 사진'을 Storage에서 지울 수 있다
  const { data: current } = await supabase
    .from("ggm_products")
    .select("image_paths")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle();

  if (!current) return { error: "내 상품만 수정할 수 있습니다.", values };

  const { error } = await supabase
    .from("ggm_products")
    .update({ title, description, price, category, status, image_paths: imagePaths })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) return { error: `수정에 실패했습니다: ${error.message}`, values };

  const removed = (current.image_paths ?? []).filter(
    (path: string) => !imagePaths.includes(path),
  );
  if (removed.length) {
    await supabase.storage.from(PRODUCT_BUCKET).remove(removed);
  }

  revalidatePath("/");
  revalidatePath("/mypage");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

/* ------------------------------------------------------------------ */
/* U — 판매 상태만 빠르게 변경 (상세 페이지용)                         */
/* ------------------------------------------------------------------ */
export async function updateProductStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !(statusRaw in STATUS_LABEL)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("ggm_products")
    .update({ status: statusRaw as ProductStatus })
    .eq("id", id)
    .eq("seller_id", user.id);

  revalidatePath("/");
  revalidatePath("/mypage");
  revalidatePath(`/products/${id}`);
}

/* ------------------------------------------------------------------ */
/* D — 상품 삭제 (판매자 본인만 — RLS가 한 번 더 막아 준다)            */
/* ------------------------------------------------------------------ */
export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 상품을 지우기 전에 올려 둔 사진부터 정리한다 (Storage는 자동으로 안 지워짐)
  const { data: product } = await supabase
    .from("ggm_products")
    .select("image_paths")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle();

  if (product?.image_paths?.length) {
    await supabase.storage.from(PRODUCT_BUCKET).remove(product.image_paths);
  }

  await supabase
    .from("ggm_products")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  revalidatePath("/");
  revalidatePath("/mypage");
  redirect("/");
}
