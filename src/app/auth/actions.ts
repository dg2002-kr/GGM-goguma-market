"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
  /** 에러가 났을 때 입력값을 돌려줘 폼을 다시 채워 준다. */
  values?: { email?: string; nickname?: string };
} | null;

/** Supabase 영문 에러 메시지를 한국어로 바꿔 준다. */
function toKorean(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "Email not confirmed":
      "이메일 인증이 아직 완료되지 않았습니다. 메일함을 확인해 주세요.",
    "User already registered": "이미 가입된 이메일입니다.",
    "Password should be at least 6 characters.":
      "비밀번호는 6자 이상이어야 합니다.",
    "Unable to validate email address: invalid format":
      "이메일 형식이 올바르지 않습니다.",
    "For security purposes, you can only request this after 60 seconds.":
      "보안을 위해 60초 후에 다시 시도해 주세요.",
  };
  return map[message] ?? message;
}

/* ------------------------------------------------------------------ */
/* 회원가입                                                            */
/* ------------------------------------------------------------------ */
export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  const values = { email, nickname };

  if (!email || !password || !nickname) {
    return { error: "모든 항목을 입력해 주세요.", values };
  }
  if (nickname.length < 2 || nickname.length > 20) {
    return { error: "닉네임은 2~20자로 입력해 주세요.", values };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다.", values };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 서로 일치하지 않습니다.", values };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // ggm_handle_new_user() 트리거가 이 값으로 프로필을 만든다.
      data: { nickname },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: toKorean(error.message), values };
  }

  // 이메일 인증이 켜져 있으면 세션 없이 확인 메일만 발송된다.
  if (!data.session) {
    return {
      message: `${email} 로 인증 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해 주세요.`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/* ------------------------------------------------------------------ */
/* 로그인                                                              */
/* ------------------------------------------------------------------ */
export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: toKorean(error.message), values: { email } };
  }

  revalidatePath("/", "layout");
  // 외부 주소로 튕기지 않도록 내부 경로만 허용
  redirect(next.startsWith("/") ? next : "/");
}

/* ------------------------------------------------------------------ */
/* 로그아웃                                                            */
/* ------------------------------------------------------------------ */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
