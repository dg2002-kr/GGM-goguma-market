import type { NextConfig } from "next";

/**
 * 환경변수 이름 정리
 *
 * Next.js는 원래 `NEXT_PUBLIC_` 으로 시작하는 환경변수만 브라우저로 보낸다.
 * 이 프로젝트는 Vercel 설정에 맞춰 접두사 없는 이름(SUPABASE_URL 등)을 쓰므로,
 * 아래 `env` 항목에 적어서 "이 값들은 브라우저에도 넣어 달라"고 알려 준다.
 *
 * 옛 이름(NEXT_PUBLIC_...)도 그대로 받아 주므로 둘 중 아무거나 있으면 동작한다.
 *
 * ⚠️ 이 값들은 빌드할 때 코드에 박힌다.
 *    Vercel에서 값을 바꾸면 반드시 다시 배포(Redeploy)해야 반영된다.
 */
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Supabase Storage 의 사진을 next/image 로 최적화하려면 도메인을 허용해야 한다.
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  env: {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
