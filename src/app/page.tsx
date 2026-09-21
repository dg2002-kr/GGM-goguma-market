import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <section className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          🍠 우리 동네 중고거래
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          동네 이웃과 함께하는
          <br />
          <span className="text-primary">따뜻한 중고거래</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          안 쓰는 물건은 나누고, 필요한 물건은 가까이서.
          <br />
          고구마마켓에서 시작해 보세요.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <Link
              href="/mypage"
              className="rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-primary-hover"
            >
              내 프로필 보기
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-primary-hover"
              >
                시작하기
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-border bg-surface px-6 py-3 text-[15px] font-semibold transition hover:bg-surface-2"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "📦", title: "상품 등록", desc: "사진 찍고 바로 올리기" },
          { icon: "💬", title: "이웃과 채팅", desc: "편하게 흥정하고 약속잡기" },
          { icon: "📍", title: "동네 인증", desc: "가까운 이웃과 안전하게" },
        ].map((f) => (
          <div key={f.title} className="ggm-card">
            <div className="text-2xl" aria-hidden>
              {f.icon}
            </div>
            <h3 className="mt-3 font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.desc}</p>
            <p className="mt-3 text-xs font-medium text-accent">준비 중</p>
          </div>
        ))}
      </section>
    </div>
  );
}
