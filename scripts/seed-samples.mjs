/**
 * 샘플 중고거래 상품 넣기
 *
 *   node scripts/seed-samples.mjs          넣기
 *   node scripts/seed-samples.mjs --clean  샘플 계정과 상품·사진 전부 지우기
 *
 * - 샘플 판매자 계정을 따로 만들어서, 내 계정이 샘플로 채워지지 않게 한다.
 * - 사진은 인터넷에서 받아오지 않고 물건 모양을 직접 그려서 올린다.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { airFryer, bookshelf, stackingToy, tablet } from "./lib/illustrations.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUCKET = "ggm-products";
const PASSWORD = "goguma-sample-1234";

/* ---------------- .env.local 읽기 ---------------- */
function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) {
    throw new Error(".env.local 파일이 없습니다.");
  }
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

/* ---------------- 샘플 내용 ---------------- */
const SELLERS = [
  {
    nickname: "햇살가득",
    email: "sample.sunny@goguma.test",
    products: [
      {
        title: "아이패드 9세대 64GB 와이파이 팝니다",
        category: "디지털기기",
        price: 190000,
        description:
          "작년에 인강용으로 샀는데 요즘 안 써서 내놓습니다.\n\n액정 필름 처음부터 붙여서 기스 하나 없어요.\n배터리 성능 91%이고 충전기, 정품 박스 다 있습니다.\n펜슬은 포함 안 되어 있어요.\n\n직거래 선호하고 지하철역 근처에서 뵐 수 있습니다.",
        draw: tablet,
      },
      {
        title: "에어프라이어 5.5L 거의 새것",
        category: "생활가전",
        price: 45000,
        description:
          "선물 받았는데 집에 이미 하나 있어서 다섯 번 정도밖에 안 썼어요.\n\n안쪽 바스켓 코팅 멀쩡하고 냄새도 안 납니다.\n5.5리터라 통닭도 통째로 들어가요.\n설명서랑 박스 그대로 있습니다.",
        draw: airFryer,
      },
    ],
  },
  {
    nickname: "지훈아빠",
    email: "sample.jihoon@goguma.test",
    products: [
      {
        title: "원목 4단 책장 (이사로 급처)",
        category: "가구/인테리어",
        price: 60000,
        description:
          "이사 가면서 자리가 안 나와서 내놓습니다.\n\n가로 80 / 세로 120 / 깊이 30 정도예요.\n원목이라 묵직하고 튼튼합니다. 흔들림 전혀 없어요.\n윗면에 컵자국 하나 있는데 사진으로는 잘 안 보일 정도입니다.\n\n차 가지고 오셔야 하고, 1층까지는 같이 들어 드릴게요.",
        draw: bookshelf,
      },
      {
        title: "아기 원목 쌓기 장난감 나눔해요",
        category: "유아동",
        price: 0,
        description:
          "아이가 커서 이제 안 가지고 놀아요. 필요하신 분 가져가세요.\n\n원목이라 모서리 둥글고 안전합니다.\n소독 티슈로 전부 닦아서 드릴게요.\n링 5개랑 블록 다 있습니다.\n\n나눔이라 예약 안 받고 먼저 오시는 분께 드려요.",
        draw: stackingToy,
      },
    ],
  },
];

/* ---------------- 로그인 (없으면 가입) ---------------- */
async function signInOrUp(supabase, { email, nickname }) {
  const signIn = await supabase.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });
  if (signIn.data.user) return signIn.data.user;

  const signUp = await supabase.auth.signUp({
    email,
    password: PASSWORD,
    options: { data: { nickname } },
  });
  if (signUp.error) {
    throw new Error(`${nickname} 계정 준비 실패: ${signUp.error.message}`);
  }
  if (!signUp.data.session) {
    throw new Error(
      `${nickname} 가입은 됐지만 로그인이 안 됩니다. ` +
        "Supabase 설정에서 Confirm email 이 켜져 있는지 확인해 주세요.",
    );
  }
  return signUp.data.user;
}

/* ---------------- 넣기 ---------------- */
async function seed(supabase) {
  for (const seller of SELLERS) {
    console.log(`\n[${seller.nickname}] 계정 준비 중...`);
    const user = await signInOrUp(supabase, seller);
    console.log(`  로그인 완료 (${seller.email})`);

    for (const product of seller.products) {
      const { data: exists } = await supabase
        .from("ggm_products")
        .select("id")
        .eq("seller_id", user.id)
        .eq("title", product.title)
        .maybeSingle();

      if (exists) {
        console.log(`  건너뜀 (이미 있음): ${product.title}`);
        continue;
      }

      // 사진 2장 그려서 올리기
      const imagePaths = [];
      for (let variant = 0; variant < 2; variant++) {
        const png = product.draw(variant);
        const filePath = `${user.id}/${crypto.randomUUID()}.png`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, png, { contentType: "image/png" });
        if (error) throw new Error(`사진 업로드 실패: ${error.message}`);
        imagePaths.push(filePath);
      }

      const { error } = await supabase.from("ggm_products").insert({
        seller_id: user.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        region: "우리동네",
        image_paths: imagePaths,
      });
      if (error) throw new Error(`상품 등록 실패: ${error.message}`);

      const priceText = product.price === 0 ? "나눔" : `${product.price.toLocaleString("ko-KR")}원`;
      console.log(`  등록: ${product.title} (${priceText}, 사진 2장)`);
    }

    await supabase.auth.signOut();
  }
}

/* ---------------- 지우기 ---------------- */
async function clean(supabase) {
  for (const seller of SELLERS) {
    const signIn = await supabase.auth.signInWithPassword({
      email: seller.email,
      password: PASSWORD,
    });
    if (!signIn.data.user) {
      console.log(`[${seller.nickname}] 계정이 없습니다. 건너뜁니다.`);
      continue;
    }
    const user = signIn.data.user;

    const { data: products } = await supabase
      .from("ggm_products")
      .select("id, title, image_paths")
      .eq("seller_id", user.id);

    for (const p of products ?? []) {
      if (p.image_paths?.length) {
        await supabase.storage.from(BUCKET).remove(p.image_paths);
      }
      await supabase.from("ggm_products").delete().eq("id", p.id);
      console.log(`[${seller.nickname}] 삭제: ${p.title}`);
    }
    await supabase.auth.signOut();
  }
  console.log(
    "\n상품과 사진은 지웠습니다.\n" +
      "샘플 계정 자체는 Supabase 대시보드 > Authentication > Users 에서 지워 주세요.\n" +
      "(계정 삭제는 관리자 권한이 필요해서 이 스크립트로는 할 수 없습니다.)",
  );
}

/* ---------------- 실행 ---------------- */
const env = loadEnv();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

const mode = process.argv.includes("--clean") ? "clean" : "seed";
try {
  if (mode === "clean") {
    await clean(supabase);
  } else {
    await seed(supabase);
    console.log("\n완료! http://localhost:3000 에서 확인하세요.");
  }
} catch (e) {
  console.error(`\n실패: ${e.message}`);
  process.exit(1);
}
