import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import Logo from "@/components/Logo";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("ggm_profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname ?? user.email?.split("@")[0] ?? null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo />

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link href="/mypage" className="ggm-btn-ghost">
                <span
                  className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-xs"
                  aria-hidden
                >
                  {nickname?.[0] ?? "🍠"}
                </span>
                <span className="hidden sm:inline">{nickname}</span>
              </Link>
              <form action={signOut}>
                <button type="submit" className="ggm-btn-ghost">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="ggm-btn-ghost">
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
