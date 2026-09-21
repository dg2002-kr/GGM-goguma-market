"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/auth/actions";
import SubmitButton from "@/components/SubmitButton";
import { ErrorMessage } from "@/components/FormMessage";

export default function LoginForm({
  next = "/",
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(
    signIn,
    initialError ? { error: initialError } : null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label className="ggm-label" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          placeholder="goguma@example.com"
          className="ggm-input"
        />
      </div>

      <div>
        <label className="ggm-label" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="ggm-input"
        />
      </div>

      {state?.error && <ErrorMessage>{state.error}</ErrorMessage>}

      <SubmitButton pendingText="로그인 중...">로그인</SubmitButton>

      <p className="pt-1 text-center text-sm text-muted">
        아직 회원이 아니신가요?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:underline"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
}
