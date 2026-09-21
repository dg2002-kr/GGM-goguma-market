import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 모든 요청마다 액세스 토큰을 갱신하고, 갱신된 쿠키를 응답에 실어 보낸다.
 * 이 과정이 없으면 토큰 만료 후 로그인이 임의로 풀린다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims()/getUser() 호출 사이에 다른 코드를 넣지 말 것 (세션 꼬임 방지)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인이 필요한 경로 보호
  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/mypage", "/products/new"];
  const needsAuth =
    protectedPaths.some((path) => pathname.startsWith(path)) ||
    // /products/<id>/edit 처럼 가운데에 id가 끼어 있는 경로
    pathname.endsWith("/edit");

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지로 가면 홈으로
  if (user && ["/login", "/signup"].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
