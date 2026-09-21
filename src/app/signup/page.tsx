import Logo from "@/components/Logo";
import SignupForm from "@/components/SignupForm";

export const metadata = { title: "회원가입 · 고구마마켓" };

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          고구마마켓 시작하기
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          30초면 충분해요. 바로 거래를 시작할 수 있습니다
        </p>
      </div>

      <div className="ggm-card">
        <SignupForm />
      </div>
    </div>
  );
}
