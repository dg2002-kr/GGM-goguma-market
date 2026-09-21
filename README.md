# 🍠 고구마마켓 (Goguma Market)

우리 동네 중고거래 웹서비스. 개발 공부용으로 **단계적으로** 만들어 나갑니다.

- **프레임워크**: Next.js 16 (App Router) + TypeScript
- **스타일**: Tailwind CSS v4
- **백엔드/인증**: Supabase (가계부와 **같은 프로젝트**를 공유)

---

## 지금까지 만든 것

- **1단계 — 회원가입 / 로그인 / 로그아웃** ✅
- **2단계 — 상품 등록 / 목록 / 상세** ✅

| 경로 | 설명 |
|---|---|
| `/` | 상품 목록 (카테고리 필터, 최신순 50개) |
| `/products/new` | 상품 등록 — **로그인 필요** |
| `/products/[id]` | 상품 상세 (본인 상품이면 삭제 가능) |
| `/signup` | 회원가입 (닉네임 + 이메일 + 비밀번호) |
| `/login` | 로그인 |
| `/mypage` | 프로필 + 내가 등록한 상품 — **로그인 필요** |
| `/auth/callback` | 이메일 인증 링크가 돌아오는 곳 |

---

## 실행 방법

```bash
npm run dev
```

→ http://localhost:3000

> Node.js 24 LTS 설치 완료, 패키지 설치도 끝난 상태입니다.
> 새로 클론했다면 `npm install` 을 먼저 하세요.

---

## 이메일 인증 설정

현재 이 Supabase 프로젝트는 **Confirm email 이 꺼져 있어** 가입하면 바로 로그인됩니다.
(공부하면서 테스트 계정을 여러 개 만들기 편합니다.)

나중에 실제 배포할 때는 켜 주세요:
https://supabase.com/dashboard/project/dipkkqlnxzbjwayatsaj/auth/providers → **Email** → **Confirm email**

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
| `ggm_products` | ✅ 판매 상품 |

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

- **RLS**: 조회는 누구나, 생성/수정은 본인만
- 회원가입하면 `ggm_on_auth_user_created` 트리거가 프로필을 **자동 생성**

### `ggm_products`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid (PK) | |
| `seller_id` | uuid | `ggm_profiles.id` 참조 (닉네임 조인용) |
| `title` | text | 2~60자 |
| `description` | text | 최대 2000자 |
| `price` | bigint | 0이면 화면에 **나눔**으로 표시 |
| `category` | text | `src/lib/categories.ts` 의 12종 |
| `status` | text | `selling` / `reserved` / `sold` |
| `region` | text | 등록 시 판매자의 동네를 복사해 둠 |
| `created_at` / `updated_at` | timestamptz | |

- **RLS**: 조회는 누구나, 등록은 본인 이름으로만, 수정·삭제는 판매자 본인만
- 인덱스: `created_at desc`, `seller_id`, `category`

SQL 사본: [`supabase/migrations/`](supabase/migrations/)

---

## 코드 구조

```
src/
├─ proxy.ts                   # 매 요청마다 세션 갱신 + 보호 경로 차단 (구 middleware.ts)
├─ app/
│  ├─ layout.tsx              # 공통 레이아웃 (헤더/푸터)
│  ├─ page.tsx                # 상품 목록 (메인)
│  ├─ globals.css             # 디자인 토큰 + 공통 클래스(.ggm-btn 등)
│  ├─ login/page.tsx
│  ├─ signup/page.tsx
│  ├─ mypage/page.tsx         # 프로필 + 내 상품
│  ├─ products/
│  │  ├─ actions.ts           # ★ createProduct / deleteProduct
│  │  ├─ new/page.tsx         # 등록 폼
│  │  └─ [id]/page.tsx        # 상세
│  └─ auth/
│     ├─ actions.ts           # ★ signUp / signIn / signOut
│     └─ callback/route.ts    # 이메일 인증 처리
├─ components/                # Header, ProductCard, ProductForm, CategoryFilter ...
├─ lib/
│  ├─ categories.ts           # 카테고리 12종 + 상태 라벨
│  ├─ format.ts               # 가격 / 상대시간 포맷
│  └─ supabase/
│     ├─ client.ts            # 브라우저용
│     ├─ server.ts            # 서버 컴포넌트/액션용
│     └─ proxy.ts             # 세션 갱신 로직
└─ types/database.ts
```

### 인증이 동작하는 흐름

1. 폼 제출 → **서버 액션**(`src/app/auth/actions.ts`)이 Supabase 호출
2. Supabase가 세션을 **쿠키**에 저장 (서버/클라이언트가 함께 읽음)
3. `proxy.ts`가 요청마다 토큰을 갱신 → 로그인이 안 풀림
4. 서버 컴포넌트는 `supabase.auth.getUser()`로 로그인 여부 확인

### 상품이 저장되는 흐름

1. `ProductForm`(클라이언트) → `createProduct` 서버 액션
2. 서버에서 한 번 더 검증 후 `ggm_products` 에 insert
   - `seller_id` 는 **폼 값이 아니라 세션의 `user.id`** 를 쓴다 (위조 방지)
   - RLS 정책이 DB 레벨에서 한 번 더 막아 준다
3. `revalidatePath("/")` 로 목록 캐시를 갱신하고 상세 페이지로 이동

---

## 앞으로 만들 것 (로드맵)

- [ ] 3단계: 이미지 업로드 (Supabase Storage) — 지금은 카테고리 이모지로 대체
- [ ] 4단계: 상품 수정 / 판매상태 변경(예약중·판매완료) / 조회수
- [ ] 5단계: 관심(찜) 기능 (`ggm_favorites`)
- [ ] 6단계: 채팅 (`ggm_chat_rooms`, `ggm_messages` + Realtime)
- [ ] 7단계: 검색, 동네 설정, 프로필 수정
- [ ] 배포: Vercel (가계부와 별도 링크)
