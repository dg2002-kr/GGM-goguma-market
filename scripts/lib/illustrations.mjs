// 샘플 상품용 그림. 인터넷 사진 대신 물건 모양을 직접 그린다.
// 2배 크기(1600x1200)로 그린 뒤 800x600 으로 줄인다.
import {
  createCanvas,
  downsample2x,
  drawLine,
  encodePng,
  fillBackground,
  fillCircle,
  fillEllipse,
  fillRect,
  fillRoundRect,
} from "./png.mjs";

const W = 1600;
const H = 1200;

/** 배경색이 깔린 기본 장면 */
function newScene(topColor, bottomColor) {
  const c = createCanvas(W, H);
  fillBackground(c, topColor, bottomColor);
  return c;
}

function darken(color, amount) {
  return color.map((v) => Math.max(v - amount, 0));
}

function lighten(color, amount) {
  return color.map((v) => Math.min(v + amount, 255));
}

/* ------------------------------------------------------------------ */
/* 태블릿                                                              */
/* ------------------------------------------------------------------ */
export function tablet(variant = 0) {
  const bg =
    variant === 0
      ? [
          [238, 242, 248],
          [214, 222, 234],
        ]
      : [
          [243, 238, 232],
          [224, 214, 202],
        ];
  const c = newScene(bg[0], bg[1]);

  const bw = 620;
  const bh = 840;
  const x = (W - bw) / 2;
  const y = (H - bh) / 2;

  fillEllipse(c, W / 2, y + bh + 30, bw * 0.52, 44, darken(bg[1], 18));
  fillRoundRect(c, x, y, bw, bh, 52, [62, 66, 74]);

  if (variant === 0) {
    // 앞면 - 화면
    fillRoundRect(c, x + 34, y + 34, bw - 68, bh - 68, 30, [24, 28, 34]);
    fillRoundRect(c, x + 44, y + 44, bw - 88, bh - 88, 24, [86, 132, 214]);

    const iconColors = [
      [255, 255, 255],
      [255, 214, 120],
      [140, 220, 180],
      [255, 160, 160],
    ];
    for (let i = 0; i < 4; i++) {
      const ix = x + 110 + (i % 2) * 190;
      const iy = y + 160 + Math.floor(i / 2) * 190;
      fillRoundRect(c, ix, iy, 130, 130, 30, iconColors[i]);
    }
    fillRoundRect(c, x + bw / 2 - 90, y + bh - 110, 180, 14, 7, [210, 220, 238]);
  } else {
    // 뒷면 - 카메라
    fillRoundRect(c, x + 60, y + 60, 150, 150, 36, [46, 50, 58]);
    fillCircle(c, x + 135, y + 135, 46, [26, 30, 36]);
    fillCircle(c, x + 135, y + 135, 28, [70, 96, 140]);
    fillCircle(c, x + 122, y + 122, 10, [180, 205, 240]);
    fillRoundRect(c, x + bw / 2 - 60, y + bh / 2 - 60, 120, 120, 28, [78, 82, 92]);
  }
  return encodePng(downsample2x(c));
}

/* ------------------------------------------------------------------ */
/* 에어프라이어                                                        */
/* ------------------------------------------------------------------ */
export function airFryer(variant = 0) {
  const bg =
    variant === 0
      ? [
          [245, 241, 236],
          [226, 219, 210],
        ]
      : [
          [236, 243, 241],
          [211, 224, 220],
        ];
  const c = newScene(bg[0], bg[1]);

  const bw = 620;
  const bh = 760;
  const x = (W - bw) / 2;
  const y = (H - bh) / 2 + 20;

  fillEllipse(c, W / 2, y + bh + 26, bw * 0.55, 42, darken(bg[1], 18));

  // 본체
  fillRoundRect(c, x + 26, y, bw - 52, 300, 60, [58, 62, 68]);
  fillRoundRect(c, x, y + 180, bw, bh - 180, 70, [48, 52, 58]);

  // 조작부
  fillRoundRect(c, x + 80, y + 70, bw - 160, 150, 34, [34, 38, 44]);
  fillCircle(c, x + bw / 2 + 110, y + 145, 56, [216, 220, 228]);
  fillCircle(c, x + bw / 2 + 110, y + 145, 40, [150, 156, 166]);
  drawLine(c, x + bw / 2 + 110, y + 145, x + bw / 2 + 110, y + 112, 12, [40, 44, 50]);
  fillRoundRect(c, x + 120, y + 108, 210, 74, 18, [92, 190, 170]);

  // 바스켓
  const basketY = variant === 0 ? y + 380 : y + 420;
  fillRoundRect(c, x + 40, basketY, bw - 80, 300, 52, [38, 42, 48]);
  fillRoundRect(c, x + bw / 2 - 130, basketY + 100, 260, 60, 30, [28, 32, 38]);
  fillRoundRect(c, x + bw / 2 - 110, basketY + 116, 220, 28, 14, [62, 68, 76]);

  if (variant === 1) {
    // 살짝 열린 느낌
    fillRoundRect(c, x + 44, basketY - 16, bw - 88, 14, 7, [140, 148, 160]);
  }
  return encodePng(downsample2x(c));
}

/* ------------------------------------------------------------------ */
/* 원목 책장                                                           */
/* ------------------------------------------------------------------ */
export function bookshelf(variant = 0) {
  const bg =
    variant === 0
      ? [
          [247, 243, 236],
          [230, 222, 209],
        ]
      : [
          [240, 244, 247],
          [219, 227, 234],
        ];
  const c = newScene(bg[0], bg[1]);

  const wood = [186, 138, 89];
  const woodDark = [154, 110, 68];
  const back = [206, 166, 121];

  const bw = 860;
  const bh = 880;
  const x = (W - bw) / 2;
  const y = (H - bh) / 2 - 10;

  fillEllipse(c, W / 2, y + bh + 34, bw * 0.55, 40, darken(bg[1], 20));

  fillRect(c, x, y, bw, bh, back);
  fillRect(c, x, y, 46, bh, wood);
  fillRect(c, x + bw - 46, y, 46, bh, wood);
  fillRect(c, x, y, bw, 44, wood);
  fillRect(c, x, y + bh - 44, bw, 44, wood);
  for (let i = 1; i <= 3; i++) {
    fillRect(c, x, y + (bh / 4) * i - 18, bw, 36, woodDark);
  }
  fillRect(c, x + 40, y + bh, 60, 52, woodDark);
  fillRect(c, x + bw - 100, y + bh, 60, 52, woodDark);

  if (variant === 1) {
    // 책을 꽂아 둔 모습
    const bookColors = [
      [206, 84, 74],
      [72, 116, 186],
      [226, 176, 70],
      [96, 166, 122],
      [148, 104, 186],
      [222, 128, 96],
    ];
    for (let shelf = 0; shelf < 3; shelf++) {
      const shelfTop = y + (bh / 4) * shelf + 46;
      const shelfH = bh / 4 - 66;
      let bx = x + 70;
      let i = shelf;
      while (bx < x + bw - 130) {
        const w = 44 + ((i * 17) % 34);
        const h = shelfH - ((i * 11) % 40);
        fillRect(c, bx, shelfTop + (shelfH - h), w, h, bookColors[i % 6]);
        bx += w + 12;
        i++;
      }
    }
  }
  return encodePng(downsample2x(c));
}

/* ------------------------------------------------------------------ */
/* 아기 원목 쌓기 장난감                                               */
/* ------------------------------------------------------------------ */
export function stackingToy(variant = 0) {
  const bg =
    variant === 0
      ? [
          [252, 246, 238],
          [238, 226, 212],
        ]
      : [
          [244, 248, 244],
          [222, 233, 224],
        ];
  const c = newScene(bg[0], bg[1]);

  const cx = W / 2;
  const baseY = 960;

  fillEllipse(c, cx, baseY + 40, 420, 40, darken(bg[1], 20));

  if (variant === 0) {
    // 링 쌓기
    fillEllipse(c, cx, baseY, 330, 60, [196, 150, 100]);
    fillEllipse(c, cx, baseY - 14, 330, 56, [214, 168, 116]);
    fillRoundRect(c, cx - 26, 420, 52, 540, 26, [206, 160, 108]);

    const rings = [
      { rx: 285, col: [226, 96, 86] },
      { rx: 245, col: [238, 160, 72] },
      { rx: 205, col: [238, 206, 92] },
      { rx: 165, col: [116, 190, 130] },
      { rx: 125, col: [96, 150, 214] },
    ];
    let y = baseY - 70;
    for (const r of rings) {
      fillEllipse(c, cx, y, r.rx, r.rx * 0.3, r.col);
      fillEllipse(c, cx, y - 12, r.rx, r.rx * 0.3, lighten(r.col, 26));
      fillEllipse(c, cx, y - 12, 34, 12, [206, 160, 108]);
      y -= 96;
    }
    fillCircle(c, cx, 400, 58, [224, 120, 108]);
  } else {
    // 원목 블록들
    const blocks = [
      { x: -300, y: 0, col: [226, 176, 120] },
      { x: -100, y: 0, col: [206, 150, 96] },
      { x: 100, y: 0, col: [226, 176, 120] },
      { x: -200, y: -200, col: [238, 200, 128] },
      { x: 0, y: -200, col: [206, 150, 96] },
      { x: -100, y: -400, col: [226, 176, 120] },
    ];
    const size = 190;
    for (const b of blocks) {
      fillRoundRect(c, cx + b.x, baseY - size + b.y, size, size, 24, b.col);
      fillCircle(c, cx + b.x + size / 2, baseY - size / 2 + b.y, 44, darken(b.col, 40));
    }
    fillCircle(c, cx, baseY - 590, 92, [226, 128, 112]);
  }
  return encodePng(downsample2x(c));
}

export const DRAWINGS = { tablet, airFryer, bookshelf, stackingToy };
