import * as THREE from "three";
import { canvasTexture } from "./textures";

// Blocky PlayTalk explorer: brown hair + headband, black jacket, light jeans, dark boots.
// Built like a Minecraft player: head 8³, body 8×12×4, limbs 4×12×4 (1px = P units).
const P = 0.08;
const SKIN = ["#e0a77d", "#d99b70", "#e6b088"];
const HAIR = ["#5b3a1e", "#4d3018", "#6a4524"];
const JACKET = ["#24272c", "#1d2024", "#2b2f35"];
const JEANS = ["#9cc3e0", "#8db6d6", "#a9cce6"];
const BOOT = ["#3a3d42", "#2f3236"];

type Face = (x: number, y: number) => string[]; // palette chooser per pixel
const face = (w: number, h: number, seed: number, f: Face) =>
  canvasTexture(w, h, seed, (px, r) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const pal = f(x, y);
        px(x, y, pal[Math.floor(r() * pal.length)]);
      }
  });

// Box with 6 painted faces; order +x,-x,+y,-y,+z(front),-z(back). Pivot at top-center.
function part(
  w: number,
  h: number,
  d: number,
  faces: Face[],
  seed: number,
  disposables: { dispose(): void }[],
) {
  const size = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  const mats = faces.map((f, i) => {
    const map = face(size[i][0], size[i][1], seed + i, f);
    map.minFilter = THREE.NearestFilter;
    const m = new THREE.MeshLambertMaterial({ map });
    disposables.push(map, m);
    return m;
  });
  const geo = new THREE.BoxGeometry(w * P, h * P, d * P);
  geo.translate(0, (-h * P) / 2, 0);
  disposables.push(geo);
  const mesh = new THREE.Mesh(geo, mats);
  mesh.castShadow = true;
  return mesh;
}

export function createHero() {
  const disposables: { dispose(): void }[] = [];
  const all =
    (pal: string[]): Face =>
    () =>
      pal;

  // Head: front has hair fringe, headband, eyes, mouth.
  const headFront: Face = (x, y) => {
    if (y < 2 || (y === 2 && (x < 1 || x > 6))) return HAIR;
    if (y === 2) return ["#3a3d42"];
    if (y === 4 && (x === 1 || x === 5)) return ["#ffffff"];
    if (y === 4 && (x === 2 || x === 6)) return ["#2a4fb0"];
    if (y === 6 && x > 2 && x < 5) return ["#9a5a40"];
    if (x === 0 || x === 7) return y < 5 ? HAIR : SKIN;
    return SKIN;
  };
  const headSide: Face = (x, y) =>
    y < 3 || x > 5 ? HAIR : y === 2 ? ["#3a3d42"] : SKIN;
  const head = part(
    8,
    8,
    8,
    [headSide, headSide, all(HAIR), all(SKIN), headFront, all(HAIR)],
    31,
    disposables,
  );

  const bodyFront: Face = (x, y) => {
    if (y === 0 && x > 2 && x < 5) return SKIN;
    if ((x === 3 || x === 4) && y > 0) return ["#3a3d42"]; // zipper
    if ((y === 4 || y === 7) && x > 4 && x < 7) return ["#e8e8e8"]; // white stripes
    return JACKET;
  };
  const body = part(
    8,
    12,
    4,
    [all(JACKET), all(JACKET), all(JACKET), all(JEANS), bodyFront, all(JACKET)],
    51,
    disposables,
  );

  const sleeve: Face = (_x, y) =>
    y > 9 ? SKIN : y === 2 ? ["#e8e8e8"] : JACKET;
  const arm = (seed: number) =>
    part(
      4,
      12,
      4,
      [sleeve, sleeve, all(JACKET), all(SKIN), sleeve, sleeve],
      seed,
      disposables,
    );
  const leg: Face = (_x, y) => (y > 9 ? BOOT : JEANS);
  const legPart = (seed: number) =>
    part(
      4,
      12,
      4,
      [leg, leg, all(JEANS), all(BOOT), leg, leg],
      seed,
      disposables,
    );

  // Rig: root at feet → hips (12px) → torso; shoulders/neck at 24px.
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  bodyPivot.position.y = 12 * P;
  root.add(bodyPivot);
  body.position.y = 12 * P;
  bodyPivot.add(body);
  const neck = new THREE.Group();
  neck.position.y = 12 * P;
  head.position.y = 8 * P;
  neck.add(head);
  bodyPivot.add(neck);
  const armL = new THREE.Group();
  const armR = new THREE.Group();
  armL.position.set(6 * P, 12 * P, 0);
  armR.position.set(-6 * P, 12 * P, 0);
  armL.add(arm(71));
  armR.add(arm(81));
  bodyPivot.add(armL, armR);
  const legL = new THREE.Group();
  const legR = new THREE.Group();
  legL.position.set(2 * P, 12 * P, 0);
  legR.position.set(-2 * P, 12 * P, 0);
  legL.add(legPart(91));
  legR.add(legPart(101));
  root.add(legL, legR);

  let phase = 0;
  let walkAmt = 0;
  let celebrate = -1; // seconds since arrival, -1 = idle
  let yaw = Math.PI;

  return {
    root,
    height: 32 * P,
    /** Called each frame. `moved` = world distance travelled this frame, `heading` = target yaw. */
    update(dt: number, moved: number, heading: number, clock: number) {
      const speed = dt > 0 ? moved / dt : 0;
      const target = Math.min(1, speed / 7);
      walkAmt += (target - walkAmt) * Math.min(1, dt * 8);
      phase += moved * 2.1;

      // Turn smoothly along the shortest arc.
      let d = heading - yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      yaw += d * Math.min(1, dt * 7);
      root.rotation.y = yaw;

      const swing = Math.sin(phase) * 0.9 * walkAmt;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing * 0.85;
      armR.rotation.x = swing * 0.85;
      armL.rotation.z = 0.06 + Math.sin(clock * 1.6) * 0.03 * (1 - walkAmt);
      armR.rotation.z = -armL.rotation.z;
      bodyPivot.position.y =
        12 * P + Math.abs(Math.cos(phase)) * 0.09 * walkAmt;
      bodyPivot.rotation.x = 0.12 * walkAmt; // lean into the walk
      neck.rotation.x = -0.1 * walkAmt;
      neck.rotation.y = Math.sin(clock * 0.7) * 0.35 * (1 - walkAmt);
      root.position.y = 0;

      if (celebrate >= 0) {
        celebrate += dt;
        const k = celebrate;
        // hop
        if (k < 0.45) root.position.y = Math.sin((k / 0.45) * Math.PI) * 0.55;
        // wave right arm (screen-facing), then lower it
        const up =
          k < 0.25 ? k / 0.25 : k > 1.6 ? Math.max(0, 1 - (k - 1.6) / 0.3) : 1;
        armR.rotation.z = -up * 2.7 + Math.sin(k * 14) * 0.35 * up;
        armR.rotation.x = 0;
        neck.rotation.x = -0.15 * up;
        if (k > 1.9) celebrate = -1;
      }
    },
    celebrate() {
      celebrate = 0;
    },
    get busy() {
      return celebrate >= 0 || walkAmt > 0.01;
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
