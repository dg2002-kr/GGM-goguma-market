"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/auth/actions";
import SubmitButton from "@/components/SubmitButton";
import { ErrorMessage, SuccessMessage } from "@/components/FormMessage";

export default function SignupForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(signUp, null);

  // 인증 메일 발송에 성공하면 폼 대신 안내만 보여 준다.
  if (state?.message) {
    return (
      <div className="space-y-4">
        <SuccessMessage>{state.message}</SuccessMessage>
        <Link href="/login" className="ggm-btn">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="ggm-label" htmlFor="nickname">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={20}
          defaultValue={state?.values?.nickname}
          placeholder="동네에서 불릴 이름 (2~20자)"
          className="ggm-input"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="6자 이상"
          className="ggm-input"
        />
      </div>

      <div>
        <label className="ggm-label" htmlFor="passwordConfirm">
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="한 번 더 입력해 주세요"
          className="ggm-input"
        />
      </div>

      {state?.error && <ErrorMessage>{state.error}</ErrorMessage>}

      <SubmitButton pendingText="가입 중...">회원가입</SubmitButton>

      <p className="pt-1 text-center text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
