# 🍠 고구마마켓 (Goguma Market)

우리 동네 중고거래 웹서비스. 개발 공부용으로 **단계적으로** 만들어 나갑니다.

- **프레임워크**: Next.js 16 (App Router) + TypeScript
- **스타일**: Tailwind CSS v4
- **백엔드/인증/파일**: Supabase (가계부와 **같은 프로젝트**를 공유)

---

## 지금까지 만든 것

- **1단계 — 회원가입 / 로그인 / 로그아웃** ✅
- **2단계 — 상품 등록 / 목록 / 상세** ✅
- **3단계 — 상품 사진 업로드** ✅
- **4단계 — 상품 수정 / 삭제 / 판매상태 변경 (CRUD 완성)** ✅

| 경로 | 설명 |
|---|---|
| `/` | 상품 목록 (카테고리 필터, 최신순 50개) |
| `/products/new` | 상품 등록 (사진 최대 5장) — **로그인 필요** |
| `/products/[id]` | 상품 상세 + 사진 갤러리 |
| `/products/[id]/edit` | 상품 수정 — **판매자 본인만** |
| `/signup` | 회원가입 (닉네임 + 이메일 + 비밀번호) |
| `/login` | 로그인 |
| `/mypage` | 프로필 + 내가 등록한 상품 — **로그인 필요** |
| `/auth/callback` | 이메일 인증 링크가 돌아오는 곳 |

### 거래글 CRUD 한눈에 보기

| | 무엇을 | 어디서 | 누가 |
|---|---|---|---|
| **C**reate | 상품 등록 | `/products/new` | 로그인한 사람 |
| **R**ead | 목록 / 상세 | `/`, `/products/[id]` | **누구나** (비로그인 포함) |
| **U**pdate | 전체 수정 | `/products/[id]/edit` | 판매자 본인 |
| **U**pdate | 판매상태만 | 상세 페이지 버튼 | 판매자 본인 |
| **D**elete | 삭제 (확인창) | 상세 페이지 | 판매자 본인 |

세 겹으로 막습니다.

1. **화면** — 내 글이 아니면 수정/삭제 버튼 자체가 안 보인다
2. **서버 액션** — `auth.uid()` 와 `seller_id` 가 같은 행만 건드린다
3. **RLS** — 위 둘을 뚫어도 DB가 거부한다

---

## 환경변수 (연결 정보)

`.env.local` 에 세 개를 둡니다. `.env.example` 에 형식이 있습니다.

| 이름 | 어디서 쓰나 | 설명 |
|---|---|---|
| `SUPABASE_URL` | 서버 + **브라우저** | Supabase 주소 |
| `SUPABASE_ANON_KEY` | 서버 + **브라우저** | 공개용 키 (비밀번호 아님) |
| `SITE_URL` | 서버만 | 이메일 인증 링크 주소. 배포 시 생략 가능 |

### 왜 `NEXT_PUBLIC_` 접두사를 안 쓰나

Next.js는 원래 **`NEXT_PUBLIC_` 으로 시작하는 이름만 브라우저로 보냅니다.**
(접두사가 없으면 브라우저에서 값이 `undefined` 가 되어 로그인·사진업로드가 멈춥니다.)

이 프로젝트는 Vercel 설정에 맞춰 접두사 없는 이름을 쓰기 때문에,
`next.config.ts` 의 `env` 항목에 두 값을 적어서 **브라우저까지 전달되도록** 연결해 두었습니다.
옛 이름(`NEXT_PUBLIC_...`)도 그대로 받아 주므로 둘 중 아무거나 있으면 동작합니다.

> ⚠️ 접두사를 뗐다고 값이 숨겨지는 것은 아닙니다.
> 이 두 값은 **원래 브라우저에 공개되어야 동작**하는 값이고, 실제 데이터 보호는 RLS가 합니다.
> 절대 공개되면 안 되는 `service_role` 키는 이 프로젝트에서 쓰지 않습니다.

> ⚠️ 이 값들은 **빌드할 때 코드에 박힙니다.**
> Vercel에서 값을 바꾸면 반드시 다시 배포(Redeploy)해야 반영됩니다.

---

## 실행 방법

```bash
npm run dev
```

→ http://localhost:3000

> 새로 클론했다면 `npm install` 을 먼저 하세요. (Node.js 20 이상)
>
> `.claude/launch.json` 에는 node 실행파일의 **전체 경로**가 적혀 있습니다.
> (이번에 Node.js를 새로 설치해서, 앱이 아직 `node`/`npm` 위치를 모르기 때문)
> 컴퓨터를 재시작한 뒤에는 `"runtimeExecutable": "npm"`, `"runtimeArgs": ["run", "dev"]`
> 로 되돌려도 잘 동작합니다.

---

## 샘플 상품 넣기 / 지우기

화면이 비어 있으면 둘러보기 어려우니, 샘플 상품을 넣는 스크립트를 만들어 두었습니다.

```bash
node scripts/seed-samples.mjs
```

- 샘플 판매자 계정 2개(`햇살가득`, `지훈아빠`)를 자동으로 만들고 그 아래에 상품 4개를 넣습니다.
  **내 계정은 건드리지 않습니다.**
- 사진은 인터넷에서 받아오지 않고 `scripts/lib/illustrations.mjs` 가 물건 모양을 직접 그립니다.
  (저작권 걱정 없고, 외부 라이브러리도 필요 없습니다)
- 이미 있는 상품은 건너뛰므로 여러 번 실행해도 안전합니다.

지울 때:

```bash
node scripts/seed-samples.mjs --clean
```

> 상품과 사진은 지워지지만 **샘플 계정 자체는 남습니다.**
> 계정 삭제는 관리자 권한이 필요해서, Supabase 대시보드에서 직접 지워야 합니다.
> 1) supabase.com 접속 → 2) 이 프로젝트 선택 → 3) 왼쪽 메뉴 **Authentication**
> → 4) **Users** → 5) `sample.` 로 시작하는 계정 오른쪽 점 세 개 → **Delete user**

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
| `image_paths` | text[] | Storage 파일 경로 목록, **첫 번째가 대표 사진** |
| `created_at` / `updated_at` | timestamptz | 수정하면 트리거가 `updated_at` 갱신 |

- **RLS**: 조회는 누구나, 등록은 본인 이름으로만, 수정·삭제는 판매자 본인만
- 인덱스: `created_at desc`, `seller_id`, `category`

### Storage — 버킷 `ggm-products`

이미지 **파일 자체는 Storage에**, DB에는 **경로 문자열만** 저장합니다.

| 항목 | 값 |
|---|---|
| 공개 여부 | public (사진은 누구나 볼 수 있어야 하므로) |
| 파일당 최대 | 5MB |
| 허용 형식 | jpeg / png / webp / gif |
| 저장 경로 | `<사용자 id>/<랜덤 uuid>.<확장자>` |

정책의 핵심은 **경로 첫 폴더가 곧 주인**이라는 점입니다.

```sql
(storage.foldername(name))[1] = auth.uid()::text
```

이 한 줄로 "남의 폴더에는 못 쓴다"가 보장됩니다. 읽기는 누구나 가능합니다.

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
│  │  ├─ actions.ts           # ★ create / update / updateStatus / delete
│  │  ├─ new/page.tsx         # 등록
│  │  └─ [id]/
│  │     ├─ page.tsx          # 상세
│  │     └─ edit/page.tsx     # 수정
│  └─ auth/
│     ├─ actions.ts           # ★ signUp / signIn / signOut
│     └─ callback/route.ts    # 이메일 인증 처리
├─ components/
│  ├─ Header, Logo, SubmitButton, FormMessage
│  ├─ LoginForm, SignupForm
│  ├─ ProductForm, ImageUploader       # 등록·수정 공용 폼 + 사진 업로드
│  ├─ ProductCard, CategoryFilter      # 목록
│  ├─ ProductGallery                   # 상세 사진 갤러리
│  ├─ ProductStatusSwitcher            # 판매중/예약중/판매완료
│  └─ DeleteProductButton              # 삭제 확인창
├─ lib/
│  ├─ categories.ts           # 카테고리 12종 + 상태 라벨
│  ├─ format.ts               # 가격 / 상대시간 포맷
│  └─ supabase/
│     ├─ client.ts            # 브라우저용
│     ├─ server.ts            # 서버 컴포넌트/액션용
│     ├─ storage.ts           # 버킷 이름, 용량 제한, 공개 URL 만들기
│     └─ proxy.ts             # 세션 갱신 로직
└─ types/database.ts
```

### 인증이 동작하는 흐름

1. 폼 제출 → **서버 액션**(`src/app/auth/actions.ts`)이 Supabase 호출
2. Supabase가 세션을 **쿠키**에 저장 (서버/클라이언트가 함께 읽음)
3. `proxy.ts`가 요청마다 토큰을 갱신 → 로그인이 안 풀림
4. 서버 컴포넌트는 `supabase.auth.getUser()`로 로그인 여부 확인

### 상품이 저장되는 흐름

1. `ProductForm`(클라이언트) → `createProduct` / `updateProduct` 서버 액션
2. 서버에서 한 번 더 검증 후 `ggm_products` 에 insert / update
   - `seller_id` 는 **폼 값이 아니라 세션의 `user.id`** 를 쓴다 (위조 방지)
   - 수정·삭제 쿼리에는 항상 `.eq("seller_id", user.id)` 를 붙인다
   - RLS 정책이 DB 레벨에서 한 번 더 막아 준다
3. `revalidatePath()` 로 목록·상세 캐시를 갱신하고 상세 페이지로 이동

### 사진이 올라가는 흐름

1. 파일을 고르면 `ImageUploader` 가 **브라우저에서 Storage로 바로** 올린다
   - 서버 액션으로 파일을 보내지 않는다 → 서버 메모리/용량 제한을 안 탄다
   - 올라가는 동안 미리보기는 `URL.createObjectURL()` 임시 주소를 쓴다
2. 업로드가 끝나면 **경로만** hidden input 으로 폼에 실린다
3. 서버 액션이 그 경로가 `내 uid/...` 로 시작하는지 다시 검사하고 저장
4. 화면에서는 `productImageUrl(path)` 로 공개 URL을 만들어 `next/image` 로 표시

### 수정할 때 사진을 지우는 시점

| 어떤 사진을 뺐나 | 언제 Storage에서 지워지나 | 왜 |
|---|---|---|
| 방금 새로 올린 사진 | **즉시** | 아직 어느 상품에도 안 붙어 있으니 두면 쓰레기 파일 |
| 원래 있던 사진 | **저장을 눌렀을 때** | 수정을 취소하면 사진이 그대로 남아 있어야 하니까 |

`updateProduct` 가 수정 전 `image_paths` 와 새 목록을 비교해서 빠진 것만 지웁니다.

> ⚠️ 사진만 올리고 등록/수정을 포기하면 Storage에 파일이 남습니다.
> 고아 파일 정리는 나중 단계에서 다룹니다.

---

## 앞으로 만들 것 (로드맵)

- [ ] 5단계: 관심(찜) 기능 (`ggm_favorites`) + 조회수
- [ ] 6단계: 채팅 (`ggm_chat_rooms`, `ggm_messages` + Realtime)
- [ ] 7단계: 검색, 동네 설정, 프로필 수정
- [ ] 정리: 고아 이미지 청소, 목록 무한스크롤
- [ ] 배포: Vercel (가계부와 별도 링크)
