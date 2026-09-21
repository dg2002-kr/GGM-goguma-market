import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";

export const metadata = { title: "상품 등록 · 고구마마켓" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts 에서도 막지만 안전장치로 한 번 더
  if (!user) redirect("/login?next=/products/new");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">상품 등록</h1>
      <p className="mt-1.5 text-sm text-muted">
        이웃에게 팔고 싶은 물건을 소개해 주세요
      </p>

      <div className="ggm-card mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
