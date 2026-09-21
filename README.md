# 🍠 고구마마켓 (Goguma Market)

우리 동네 중고거래 웹서비스. 개발 공부용으로 **단계적으로** 만들어 나갑니다.

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일**: Tailwind CSS v4
- **백엔드/인증**: Supabase (가계부와 **같은 프로젝트**를 공유)

---

## 1단계 (현재): 회원가입 / 로그인 / 로그아웃 ✅

| 경로 | 설명 |
|---|---|
| `/` | 홈 (로그인 상태에 따라 버튼이 바뀜) |
| `/signup` | 회원가입 (닉네임 + 이메일 + 비밀번호) |
| `/login` | 로그인 |
| `/mypage` | 마이페이지 — **로그인해야 접근 가능** |
| `/auth/callback` | 이메일 인증 링크가 돌아오는 곳 |

---

## 실행 방법

```bash
npm install
npm run dev
```

→ http://localhost:3000

> Node.js 24 LTS 설치 완료, 패키지 설치도 끝난 상태입니다. 바로 `npm run dev` 하면 됩니다.

---

## 이메일 인증 설정

현재 이 Supabase 프로젝트는 **Confirm email 이 꺼져 있어** 가입하면 바로 로그인됩니다.
(공부하면서 테스트 계정을 여러 개 만들기 편합니다.)

나중에 실제 배포할 때는 켜 주세요:
https://supabase.com/dashboard/project/dipkkqlnxzbjwayatsaj/auth/providers → **Email** → **Confirm email** 켜기

켜면 회원가입 후 안내 메시지가 뜨고, 메일의 링크를 누르면 `/auth/callback` 이 처리해 줍니다.
(코드는 두 경우 모두 이미 대응되어 있습니다.)

### 배포 전에 한 번 더 켤 것

- **Confirm email** (위 링크)
- **Leaked Password Protection** — 유출된 비밀번호 사용 차단
  (Dashboard → Authentication → Policies)

---

## 데이터베이스

가계부와 **같은 Supabase 프로젝트**를 씁니다. 테이블이 섞이지 않도록
고구마마켓 테이블에는 전부 **`ggm_` 접두사**를 붙입니다.

| 테이블 | 용도 |
|---|---|
| `transactions`, `budgets`, `settings` | 🚫 가계부 것 — 건드리지 않음 |
| `ggm_profiles` | ✅ 고구마마켓 사용자 프로필 |

`auth.users`(Supabase 기본 인증 테이블)는 프로젝트 하나에 하나뿐이라
가계부에서 나중에 로그인을 붙이면 **계정은 공유**됩니다. (가계부는 현재 로그인 없음)

### `ggm_profiles`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid (PK) | `auth.users.id` 와 1:1 |
| `nickname` | text | 2~20자 |
| `avatar_url` | text | 프로필 사진 (아직 미사용) |
| `region` | text | 동네, 기본값 `우리동네` |
| `created_at` / `updated_at` | timestamptz | |

- **RLS 켜짐**: 조회는 누구나, 생성/수정은 본인만
- 회원가입하면 `ggm_on_auth_user_created` 트리거가 프로필을 **자동 생성**

SQL 사본: [`supabase/migrations/`](supabase/migrations/)

---

## 코드 구조

```
src/
├─ proxy.ts                  # 매 요청마다 세션 갱신 + /mypage 접근 보호 (구 middleware.ts)
├─ app/
│  ├─ layout.tsx              # 공통 레이아웃 (헤더/푸터)
│  ├─ page.tsx                # 홈
│  ├─ globals.css             # 디자인 토큰 + 공통 클래스(.ggm-btn 등)
│  ├─ login/page.tsx
│  ├─ signup/page.tsx
│  ├─ mypage/page.tsx
│  └─ auth/
│     ├─ actions.ts           # ★ signUp / signIn / signOut (서버 액션)
│     └─ callback/route.ts    # 이메일 인증 처리
├─ components/                # Header, LoginForm, SignupForm ...
├─ lib/supabase/
│  ├─ client.ts               # 브라우저용
│  ├─ server.ts               # 서버 컴포넌트/액션용
│  └─ proxy.ts               # 세션 갱신 로직
└─ types/database.ts
```

### 인증이 동작하는 흐름

1. 폼 제출 → **서버 액션**(`src/app/auth/actions.ts`)이 Supabase 호출
2. Supabase가 세션을 **쿠키**에 저장 (서버/클라이언트가 함께 읽음)
3. `proxy.ts`가 요청마다 토큰을 갱신 → 로그인이 안 풀림
4. 서버 컴포넌트는 `supabase.auth.getUser()`로 로그인 여부 확인

---

## 앞으로 만들 것 (로드맵)

- [ ] 2단계: 상품 등록 / 목록 / 상세 (`ggm_products`)
- [ ] 3단계: 이미지 업로드 (Supabase Storage)
- [ ] 4단계: 관심(찜) 기능 (`ggm_favorites`)
- [ ] 5단계: 채팅 (`ggm_chat_rooms`, `ggm_messages` + Realtime)
- [ ] 6단계: 동네 설정 / 프로필 수정
- [ ] 배포: Vercel (가계부와 별도 링크)
