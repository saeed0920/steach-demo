import * as THREE from "three";

// Minecraft-style 16×16 procedural block textures. Deterministic per type.
type Paint = (
  px: (x: number, y: number, c: string) => void,
  r: () => number,
) => void;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const pick = (r: () => number, list: string[]) =>
  list[Math.floor(r() * list.length)];

export function canvasTexture(
  w: number,
  h: number,
  seed: number,
  paint: Paint,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const px = (x: number, y: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, 1, 1);
  };
  paint(px, rng(seed));
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapLinearFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const noise =
  (cols: string[]): Paint =>
  (px, r) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) px(x, y, pick(r, cols));
  };

const GRASS = [
  "#5f9f35",
  "#6aab3c",
  "#78b846",
  "#558f2f",
  "#6aa83f",
  "#82c04f",
];
const DIRT = ["#8b5a2b", "#7a4f27", "#966538", "#6b4422", "#9b6b3e", "#845530"];
const STONE = [
  "#7d7d7d",
  "#888888",
  "#747474",
  "#828282",
  "#6c6c6c",
  "#909090",
];

// Voronoi stones with dark mortar (cobblestone).
const cobble: Paint = (px, r) => {
  const seeds = Array.from({ length: 9 }, () => [r() * 16, r() * 16, r()]);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      let d1 = 99;
      let d2 = 99;
      let tone = 0;
      for (const [sx, sy, t] of seeds)
        for (const ox of [-16, 0, 16])
          for (const oy of [-16, 0, 16]) {
            const d = Math.hypot(x - sx - ox, y - sy - oy);
            if (d < d1) {
              d2 = d1;
              d1 = d;
              tone = t;
            } else if (d < d2) d2 = d;
          }
      const edge = d2 - d1 < 1.1;
      const light = ["#8f8f8f", "#9a9a9a", "#a5a5a5", "#858585"];
      px(
        x,
        y,
        edge ? pick(r, ["#4e4e4e", "#575757"]) : light[Math.floor(tone * 4)],
      );
      if (!edge && d1 < 1.4 && r() < 0.5) px(x, y, "#b2b2b2");
    }
};

// Brick rows: h-px tall, w-px wide, alternate offset, 1px mortar.
const bricks =
  (cols: string[], mortar: string, w = 8, h = 4): Paint =>
  (px, r) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const row = Math.floor(y / h);
        const off = row % 2 ? w / 2 : 0;
        const isM = y % h === h - 1 || (x + off) % w === w - 1;
        const tone = cols[(row * 3 + Math.floor((x + off) / w)) % cols.length];
        px(x, y, isM ? mortar : r() < 0.25 ? pick(r, cols) : tone);
      }
  };

const planks =
  (cols: string[], seam: string): Paint =>
  (px, r) => {
    for (let y = 0; y < 16; y++) {
      const board = Math.floor(y / 4);
      const cut = (board * 7 + 3) % 16;
      for (let x = 0; x < 16; x++) {
        let c = cols[(board + (x > cut ? 1 : 0)) % cols.length];
        if (r() < 0.18) c = pick(r, cols);
        if (y % 4 === 3 || x === cut) c = seam;
        px(x, y, c);
      }
    }
  };

const logSide: Paint = (px, r) => {
  const cols = ["#6b4f2a", "#5a4122", "#7a5b33", "#4e3920"];
  for (let x = 0; x < 16; x++) {
    const base = pick(r, cols);
    for (let y = 0; y < 16; y++) px(x, y, r() < 0.2 ? pick(r, cols) : base);
  }
};
const logTop: Paint = (px, r) => {
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const ring = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
      const c =
        ring > 6.6 ? "#5a4122" : Math.floor(ring) % 2 ? "#b08a55" : "#9c7444";
      px(x, y, r() < 0.1 ? "#8d6a3c" : c);
    }
};

// Beveled metal/gem block (gold, diamond, iron).
const beveled =
  (light: string, mid: string, dark: string): Paint =>
  (px, r) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        let c = mid;
        if (x === 0 || y === 0) c = light;
        else if (x === 15 || y === 15) c = dark;
        else if ((x === 1 || y === 1) && r() < 0.7) c = light;
        else if (r() < 0.12) c = pick(r, [light, dark]);
        px(x, y, c);
      }
  };

const leaves: Paint = (px, r) => {
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++)
      px(
        x,
        y,
        r() < 0.16
          ? "rgba(0,0,0,0)"
          : pick(r, ["#3f7d26", "#4a8f2d", "#356b20", "#58a034", "#2e5f1b"]),
      );
};

const windowPane: Paint = (px, r) => {
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const frame =
        x < 2 ||
        y < 2 ||
        x > 13 ||
        y > 13 ||
        x === 7 ||
        x === 8 ||
        y === 7 ||
        y === 8;
      px(
        x,
        y,
        frame
          ? pick(r, ["#7a5530", "#6b4a29"])
          : pick(r, ["#ffd76a", "#ffe08a", "#f7c84c", "#ffe9a8"]),
      );
    }
};

const door: Paint = (px, r) => {
  planks(["#7a5530", "#6e4b2a", "#86603a"], "#4a3018")(px, r);
  for (let y = 2; y < 8; y++)
    for (let x = 3; x < 13; x++)
      if (x === 7 || x === 8 || y === 4) px(x, y, "#4a3018");
  px(12, 10, "#c9c9c9");
};

const shingles =
  (cols: string[], gap: string): Paint =>
  (px, r) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const row = Math.floor(y / 4);
        const edge = y % 4 === 3 || (x + (row % 2) * 2) % 4 === 0;
        px(
          x,
          y,
          edge ? gap : r() < 0.3 ? pick(r, cols) : cols[row % cols.length],
        );
      }
  };

export const PAINT: Record<string, Paint> = {
  grass: noise(GRASS),
  dirt: (px, r) => {
    noise(DIRT)(px, r);
    for (let i = 0; i < 6; i++)
      px(Math.floor(r() * 16), Math.floor(r() * 16), "#b3b3a0");
  },
  stone: noise(STONE),
  cobble,
  path: noise(["#a08850", "#94783f", "#ad9459", "#8a6f3a"]),
  sand: noise(["#dbd3a0", "#e3dbab", "#d1c890", "#e9e2b8"]),
  log: logSide,
  leaves,
  plank: planks(["#a87e4c", "#9c7243", "#b38955"], "#6b4a29"),
  plaster: noise(["#ece4d4", "#e6dcc8", "#f2ebdd", "#e1d6c1"]),
  roofBlue: shingles(["#2c4fa8", "#3459b6", "#25449a"], "#1a3170"),
  brick: bricks(["#9c4a3a", "#a95541", "#8e4233", "#b25d48"], "#c9bfb3"),
  roofDark: shingles(["#4a3f3f", "#544848", "#3f3535"], "#2b2323"),
  light: bricks(["#8f8f8f", "#9a9a9a", "#868686"], "#5e5e5e", 8, 8),
  gold: beveled("#fff28a", "#f2c230", "#c48d12"),
  diamond: beveled("#c8fff8", "#4fd8d2", "#22968f"),
  iron: beveled("#ffffff", "#dadde2", "#a9adb3"),
  redstone: beveled("#ff6a55", "#c0281e", "#7d140e"),
  door,
  window: windowPane,
  torch: noise(["#ffd24a", "#f2a030", "#ffe8a0", "#e08a20", "#fff1b8"]),
  white: noise(["#f4f4f4", "#ececec", "#ffffff", "#e4e4e4"]),
  navy: noise(["#1b2a55", "#16234a", "#22336a"]),
};

export const GLOW = new Set(["window", "torch", "diamond"]);

export function blockMaterials() {
  const mats = new Map<string, THREE.Material | THREE.Material[]>();
  const all: { dispose(): void }[] = [];
  const mat = (
    paint: Paint,
    seed: number,
    extra: THREE.MeshLambertMaterialParameters = {},
  ) => {
    const map = canvasTexture(16, 16, seed, paint);
    const m = new THREE.MeshLambertMaterial({ map, ...extra });
    all.push(map, m);
    return m;
  };
  Object.entries(PAINT).forEach(([type, paint], i) => {
    const glow = GLOW.has(type);
    mats.set(
      type,
      mat(paint, i * 97 + 11, {
        ...(glow ? { emissive: 0xffffff, emissiveIntensity: 0.35 } : {}),
        ...(type === "leaves"
          ? { alphaTest: 0.5, side: THREE.DoubleSide }
          : {}),
      }),
    );
    if (glow) {
      const m = mats.get(type) as THREE.MeshLambertMaterial;
      m.emissiveMap = m.map;
    }
  });
  const grassSide = mat((px, r) => {
    PAINT.dirt(px, r);
    for (let x = 0; x < 16; x++) {
      const drip = 3 + Math.floor(r() * 3);
      for (let y = 0; y < drip; y++) px(x, y, pick(r, GRASS));
    }
  }, 5);
  const top = mats.get("grass") as THREE.Material;
  const dirt = mats.get("dirt") as THREE.Material;
  mats.set("grass", [grassSide, grassSide, top, dirt, grassSide, grassSide]);
  const logEnd = mat(logTop, 7);
  const bark = mats.get("log") as THREE.Material;
  mats.set("log", [bark, bark, logEnd, logEnd, bark, bark]);
  return {
    mats,
    dispose: () => {
      for (const d of all) d.dispose();
    },
  };
}

// Cross-plane plants (grass tufts, flowers).
export const PLANTS: Record<string, Paint> = {
  tuft: (px, r) => {
    for (let x = 1; x < 15; x += 2) {
      const h = 5 + Math.floor(r() * 8);
      for (let y = 15; y > 15 - h; y--)
        px(x + (y < 9 && r() < 0.4 ? 1 : 0), y, pick(r, GRASS));
    }
  },
  poppy: (px) => {
    for (let y = 8; y < 16; y++) px(7, y, "#3f7d26");
    px(6, 11, "#4a8f2d");
    px(8, 12, "#4a8f2d");
    for (const [x, y] of [
      [6, 5],
      [7, 5],
      [8, 5],
      [6, 6],
      [8, 6],
      [6, 7],
      [7, 7],
      [8, 7],
      [7, 4],
      [5, 6],
      [9, 6],
    ])
      px(x, y, "#d42a1e");
    px(7, 6, "#2b1a10");
  },
  dandelion: (px) => {
    for (let y = 9; y < 16; y++) px(7, y, "#3f7d26");
    px(8, 12, "#4a8f2d");
    for (const [x, y] of [
      [6, 6],
      [7, 6],
      [8, 6],
      [6, 7],
      [7, 7],
      [8, 7],
      [7, 5],
      [7, 8],
    ])
      px(x, y, "#f7d81f");
    px(7, 7, "#e2a90c");
  },
};
