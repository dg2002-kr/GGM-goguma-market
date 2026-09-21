import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * 모든 요청이 페이지에 닿기 전에 여기를 먼저 지나간다.
 * (Next.js 15까지는 이 파일 이름이 middleware.ts 였다 → 16부터 proxy.ts)
 */
export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 정적 파일과 이미지 요청을 제외한 모든 경로에서 실행
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
