// 아주 작은 PNG 만들기 도구 (외부 라이브러리 없이 동작)
// - 그림은 2배 크기로 그린 뒤 절반으로 줄인다 → 가장자리가 부드러워진다
import zlib from "node:zlib";

/* ---------------- 그리기 ---------------- */

export function createCanvas(w, h) {
  return { w, h, data: new Uint8Array(w * h * 3) };
}

function setPixel(c, x, y, col) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 3;
  c.data[i] = col[0];
  c.data[i + 1] = col[1];
  c.data[i + 2] = col[2];
}

/** 위에서 아래로 이어지는 배경색 */
export function fillBackground(c, topColor, bottomColor) {
  for (let y = 0; y < c.h; y++) {
    const t = y / (c.h - 1);
    const col = [0, 1, 2].map((k) =>
      Math.round(topColor[k] + (bottomColor[k] - topColor[k]) * t),
    );
    for (let x = 0; x < c.w; x++) setPixel(c, x, y, col);
  }
}

export function fillRect(c, x0, y0, w, h, col) {
  for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
    for (let x = Math.round(x0); x < Math.round(x0 + w); x++) {
      setPixel(c, x, y, col);
    }
  }
}

/** 모서리가 둥근 사각형 */
export function fillRoundRect(c, x0, y0, w, h, r, col) {
  r = Math.min(r, w / 2, h / 2);
  for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
    for (let x = Math.round(x0); x < Math.round(x0 + w); x++) {
      const dx = Math.max(x0 + r - x, 0, x - (x0 + w - r - 1));
      const dy = Math.max(y0 + r - y, 0, y - (y0 + h - r - 1));
      if (dx * dx + dy * dy <= r * r) setPixel(c, x, y, col);
    }
  }
}

export function fillEllipse(c, cx, cy, rx, ry, col) {
  for (let y = Math.round(cy - ry); y <= Math.round(cy + ry); y++) {
    for (let x = Math.round(cx - rx); x <= Math.round(cx + rx); x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) setPixel(c, x, y, col);
    }
  }
}

export function fillCircle(c, cx, cy, r, col) {
  fillEllipse(c, cx, cy, r, r, col);
}

/** 두 점을 잇는 두꺼운 선 */
export function drawLine(c, x1, y1, x2, y2, thickness, col) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    fillCircle(c, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, col);
  }
}

/** 2배로 그린 그림을 절반으로 줄여 부드럽게 만든다 */
export function downsample2x(c) {
  const out = createCanvas(c.w / 2, c.h / 2);
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      for (let k = 0; k < 3; k++) {
        const a = c.data[(y * 2 * c.w + x * 2) * 3 + k];
        const b = c.data[(y * 2 * c.w + x * 2 + 1) * 3 + k];
        const d = c.data[((y * 2 + 1) * c.w + x * 2) * 3 + k];
        const e = c.data[((y * 2 + 1) * c.w + x * 2 + 1) * 3 + k];
        out.data[(y * out.w + x) * 3 + k] = Math.round((a + b + d + e) / 4);
      }
    }
  }
  return out;
}

/* ---------------- PNG 파일로 변환 ---------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

export function encodePng(c) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0);
  ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8; // 색상 깊이
  ihdr[9] = 2; // 색상 방식: RGB
  // 10~12 은 0 (압축/필터/인터레이스 기본값)

  // 각 줄 앞에 필터 종류(0 = 없음) 바이트를 붙인다
  const rowBytes = c.w * 3;
  const raw = Buffer.alloc(c.h * (rowBytes + 1));
  const src = Buffer.from(c.data.buffer, c.data.byteOffset, c.data.length);
  for (let y = 0; y < c.h; y++) {
    raw[y * (rowBytes + 1)] = 0;
    src.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
