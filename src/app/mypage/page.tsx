import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import type { Profile } from "@/types/database";

export const metadata = { title: "마이페이지 · 고구마마켓" };

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미들웨어에서 걸러 주지만, 안전장치로 한 번 더 확인
  if (!user) redirect("/login?next=/mypage");

  const { data: profile } = await supabase
    .from("ggm_profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const joinedAt = new Date(
    profile?.created_at ?? user.created_at,
  ).toLocaleDateString("ko-KR");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">마이페이지</h1>

      <div className="ggm-card">
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-3xl"
            aria-hidden
          >
            🍠
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">
              {profile?.nickname ?? "이름 없음"}
            </p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-muted">동네</dt>
            <dd className="font-medium">{profile?.region ?? "-"}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted">가입일</dt>
            <dd className="font-medium">{joinedAt}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted">사용자 ID</dt>
            <dd className="font-mono text-xs text-muted">
              {user.id.slice(0, 8)}…
            </dd>
          </div>
        </dl>
      </div>

      <form action={signOut} className="mt-4">
        <button
          type="submit"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold text-danger transition hover:bg-danger/6"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
