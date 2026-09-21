import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "로그인 · 고구마마켓" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          다시 만나 반가워요
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          로그인하고 동네 이웃들을 만나 보세요
        </p>
      </div>

      <div className="ggm-card">
        <LoginForm next={next ?? "/"} initialError={error} />
      </div>
    </div>
  );
}
