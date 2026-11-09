import { CatmullRomCurve3, Vector3 } from "three";

// Voxel town for /first. Pure data (no rendering) so it can be tested in Node.
// Axes: camera looks toward +z, so +x is screen-left: the tour walks right→left (RTL).

export type Blocks = Map<string, string>;
export type Sign = { x: number; y: number; z: number; text: string };
export type Building = { blocks: Blocks; signs: Sign[]; top: number };

export const PAD = 3; // ground block height under every station and the path
export const STATIONS: [number, number][] = [
  [0, 0], // gate (intro)
  [24, -4], // account house
  [48, 3], // level-test tower
  [72, -4], // teacher school
  [96, 4], // level pedestal
  [120, -2], // class clock tower
];
export const DOOR_Z = -7; // where the character stands, relative to a station
export const BOUNDS = { x0: -30, x1: 150, z0: -36, z1: 38 };
export const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

export const walkCurve = new CatmullRomCurve3(
  STATIONS.map(([x, z]) => new Vector3(x, PAD + 1, z + DOOR_Z)),
);
export const stationU = (i: number) => i / (STATIONS.length - 1);

function pathCells() {
  const cells = new Set<string>();
  for (let i = 0; i <= 1200; i++) {
    const p = walkCurve.getPoint(i / 1200);
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++)
        cells.add(`${Math.round(p.x) + dx},${Math.round(p.z) + dz}`);
  }
  return cells;
}

const onPad = (x: number, z: number) =>
  STATIONS.some(
    ([sx, sz]) => Math.abs(x - sx) <= 8 && z - sz >= -9 && z - sz <= 7,
  );

export function heightAt(x: number, z: number, path: Set<string>) {
  if (path.has(`${x},${z}`) || onPad(x, z)) return PAD;
  if (z < -19) return 0; // lake bed
  if (z < -15) return 2; // beach
  const hills =
    z > 10
      ? Math.max(0, Math.floor((z - 10) * 0.8 + Math.sin(x * 0.12) * 3))
      : 0;
  return (
    Math.max(
      PAD - 1,
      PAD + Math.round(Math.sin(x * 0.19) * 0.9 + Math.cos(z * 0.23) * 0.9),
    ) + hills
  );
}

function box(
  b: Blocks,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  t: string,
) {
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++) b.set(key(x, y, z), t);
}

function tree(b: Blocks, x: number, y: number, z: number) {
  box(b, x, y, z, x, y + 3, z, "log");
  for (let dx = -2; dx <= 2; dx++)
    for (let dz = -2; dz <= 2; dz++)
      for (let dy = 3; dy <= 5; dy++)
        if (
          Math.abs(dx) + Math.abs(dz) + (dy === 5 ? 2 : 0) <= 3 &&
          !(dx === 0 && dz === 0 && dy < 4)
        )
          b.set(key(x + dx, y + dy, z + dz), "leaves");
}

// Buildings use local coords: origin = station center at ground (y=0 is first block above pad), front faces -z.
const BUILDERS: ((b: Blocks) => { signs: Sign[]; top: number })[] = [
  (b) => {
    box(b, -6, 0, 0, -5, 7, 1, "log");
    box(b, 5, 0, 0, 6, 7, 1, "log");
    box(b, -7, 8, 0, 7, 9, 1, "plank");
    b.set(key(-6, 10, 0), "torch");
    b.set(key(6, 10, 0), "torch");
    tree(b, -11, 0, 3);
    return { signs: [{ x: 0, y: 8.5, z: -0.6, text: "PLAYTALK" }], top: 11 };
  },
  (b) => {
    box(b, -4, 0, -3, 4, 4, 3, "plaster");
    for (let i = 0; i < 4; i++)
      box(b, -5 + i, 5 + i, -4 + i, 5 - i, 5 + i, 4 - i, "roofBlue");
    box(b, 3, 5, 1, 3, 9, 1, "cobble");
    box(b, 0, 0, -3, 0, 1, -3, "door");
    box(b, -3, 2, -3, -2, 3, -3, "window");
    box(b, 2, 2, -3, 3, 3, -3, "window");
    return { signs: [{ x: -7, y: 2, z: -4, text: "SIGN UP" }], top: 10 };
  },
  (b) => {
    box(b, -3, 0, -3, 3, 10, 3, "cobble");
    for (let x = -3; x <= 3; x += 2) box(b, x, 11, -3, x, 11, 3, "cobble");
    box(b, -2, 7, -3, 2, 8, -3, "gold");
    box(b, 0, 0, -3, 0, 1, -3, "door");
    box(b, -2, 3, -3, -2, 4, -3, "window");
    box(b, 2, 3, -3, 2, 4, -3, "window");
    b.set(key(-4, 2, -4), "torch");
    b.set(key(4, 2, -4), "torch");
    return { signs: [{ x: -6.5, y: 2, z: -4, text: "LEVEL TEST" }], top: 12 };
  },
  (b) => {
    box(b, -6, 0, -3, 6, 4, 3, "brick");
    for (let i = 0; i < 3; i++)
      box(b, -7 + i, 5 + i, -4 + i, 7 - i, 5 + i, 4 - i, "roofDark");
    box(b, -1, 8, -1, 1, 10, 1, "light");
    b.set(key(0, 9, -2), "torch");
    box(b, -1, 0, -3, 1, 2, -3, "door");
    for (const x of [-5, -3, 3, 5]) box(b, x, 2, -3, x, 3, -3, "window");
    return { signs: [{ x: -9, y: 2, z: -4, text: "TEACHER" }], top: 11 };
  },
  (b) => {
    box(b, -6, 0, -2, 6, 0, 2, "cobble");
    const ores = ["light", "iron", "gold", "diamond"];
    ores.forEach((t, i) => {
      box(b, -5 + i * 3, 1, -1, -4 + i * 3, 1 + i * 2, 1, t);
    });
    return { signs: [{ x: -8, y: 2, z: -3, text: "LEVEL" }], top: 9 };
  },
  (b) => {
    box(b, -2, 0, -2, 2, 12, 2, "light");
    box(b, -3, 13, -3, 3, 13, 3, "plank");
    box(b, -2, 14, -2, 2, 14, 2, "plank");
    box(b, -1, 15, -1, 1, 15, 1, "plank");
    box(b, -1, 8, -3, 1, 10, -3, "white");
    box(b, 0, 9, -4, 0, 10, -4, "navy");
    b.set(key(1, 9, -4), "redstone");
    box(b, 0, 0, -3, 0, 1, -3, "door");
    box(b, -1, 4, -3, 1, 5, -3, "window");
    return { signs: [{ x: -5.5, y: 2, z: -4, text: "CLASS" }], top: 16 };
  },
];

export function buildWorld() {
  const path = pathCells();
  const terrain: Blocks = new Map();
  const h = (x: number, z: number) => heightAt(x, z, path);
  for (let x = BOUNDS.x0; x < BOUNDS.x1; x++)
    for (let z = BOUNDS.z0; z < BOUNDS.z1; z++) {
      const top = h(x, z);
      // Only fill down to the lowest neighbour: every placed cube has a visible face.
      const low = Math.min(
        top,
        h(x + 1, z),
        h(x - 1, z),
        h(x, z + 1),
        h(x, z - 1),
      );
      const surface = path.has(`${x},${z}`)
        ? "path"
        : z < -15 && !onPad(x, z)
          ? "sand"
          : "grass";
      for (let y = low; y <= top; y++)
        terrain.set(
          key(x, y, z),
          y === top ? surface : y < top - 3 ? "stone" : "dirt",
        );
    }
  // ponytail: grid-scattered trees; swap for poisson sampling if the layout looks too regular.
  for (let x = BOUNDS.x0 + 4; x < BOUNDS.x1 - 4; x += 6)
    for (let z = -13; z < 30; z += 7) {
      const tx = x + Math.round(Math.sin(z * 3.1 + x) * 2);
      const tz = z + Math.round(Math.cos(x * 1.7) * 2);
      if (tz < 9 || onPad(tx, tz)) continue; // nothing between camera and town
      let near = false;
      for (let dx = -3; dx <= 3; dx++)
        for (let dz = -3; dz <= 3; dz++)
          if (path.has(`${tx + dx},${tz + dz}`)) near = true;
      if (!near) tree(terrain, tx, h(tx, tz) + 1, tz);
    }
  // Grass tufts and flowers on open grass (not path, not building footprints).
  const plants: [number, number, number, string][] = [];
  for (let x = BOUNDS.x0; x < BOUNDS.x1; x++)
    for (let z = -15; z < 30; z++) {
      const r = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
      if (r > 0.16 || path.has(`${x},${z}`)) continue;
      if (
        STATIONS.some(
          ([sx, sz]) => Math.abs(x - sx) <= 8 && z - sz >= -5 && z - sz <= 5,
        )
      )
        continue;
      const y = h(x, z) + 1;
      if (
        terrain.get(key(x, y - 1, z)) !== "grass" ||
        terrain.has(key(x, y, z))
      )
        continue;
      plants.push([
        x,
        y,
        z,
        r < 0.012 ? "poppy" : r < 0.024 ? "dandelion" : "tuft",
      ]);
    }
  const buildings: Building[] = BUILDERS.map((build) => {
    const blocks: Blocks = new Map();
    return { blocks, ...build(blocks) };
  });
  return { terrain, buildings, path, plants };
}
