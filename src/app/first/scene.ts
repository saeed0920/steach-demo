import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createViewControls } from "./controls";
import { createHero } from "./hero";
import { blockMaterials, canvasTexture, PLANTS } from "./textures";
import {
  type Blocks,
  buildWorld,
  PAD,
  STATIONS,
  stationU,
  walkCurve,
} from "./world";

function signTexture(text: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "#4a2f18";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#9c7243";
  ctx.fillRect(10, 10, 492, 108);
  ctx.fillStyle = "#86603a";
  for (let y = 10; y < 118; y += 27) ctx.fillRect(10, y + 24, 492, 3);
  ctx.fillStyle = "#2b1a10";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${text.length > 8 ? 34 : 44}px "Press Start 2P", monospace`;
  ctx.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export type TownScene = {
  goTo(step: number): void;
  setPaused(paused: boolean): void;
  dispose(): void;
};

export function createTownScene(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
  events: { onArrive?: () => void; onInteract?: () => void } = {},
): TownScene {
  const coarse = matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !coarse,
    powerPreference: "high-performance",
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // refreshed only when something moves (see frame)
  let pixelRatio = Math.min(devicePixelRatio, coarse ? 1.25 : 1.75);
  const sky = new THREE.Color("#9fcdf7");
  renderer.setClearColor(sky);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(sky, 55, 130);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 220);
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1.5));
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  // Sun follows the camera target so the shadow map stays sharp where we look.
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
  const SUN_OFFSET = new THREE.Vector3(22, 42, -26);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -38,
    right: 38,
    top: 38,
    bottom: -38,
    near: 1,
    far: 140,
  });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const disposables: { dispose(): void }[] = [];
  const blocks = blockMaterials();
  const mats = blocks.mats;

  const cube = new THREE.BoxGeometry(1, 1, 1);
  disposables.push(cube);
  const dummy = new THREE.Object3D();
  function instanced(list: Blocks, parent: THREE.Object3D) {
    const byType = new Map<string, number[][]>();
    for (const [k, t] of list) {
      const arr = byType.get(t) ?? [];
      arr.push(k.split(",").map(Number));
      byType.set(t, arr);
    }
    for (const [t, arr] of byType) {
      const mesh = new THREE.InstancedMesh(
        cube,
        mats.get(t) as THREE.Material,
        arr.length,
      );
      arr.forEach(([x, y, z], i) => {
        dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.computeBoundingSphere();
      mesh.castShadow =
        t !== "grass" && t !== "dirt" && t !== "sand" && t !== "path";
      mesh.receiveShadow = true;
      parent.add(mesh);
      disposables.push(mesh);
    }
  }

  const world = buildWorld();
  instanced(world.terrain, scene);
  const buildingGroups = world.buildings.map((b, i) => {
    const g = new THREE.Group();
    g.position.set(STATIONS[i][0], PAD + 1, STATIONS[i][1]);
    instanced(b.blocks, g);
    scene.add(g);
    return g;
  });

  // Plants: two crossed quads, Minecraft "cross" model.
  const a = new THREE.PlaneGeometry(0.9, 0.9);
  a.rotateY(Math.PI / 4);
  const bq = new THREE.PlaneGeometry(0.9, 0.9);
  bq.rotateY(-Math.PI / 4);
  const cross = mergeGeometries([a, bq]);
  cross.translate(0, 0.45, 0);
  disposables.push(a, bq, cross);
  Object.entries(PLANTS).forEach(([kind, paint], i) => {
    const list = world.plants.filter((p) => p[3] === kind);
    const map = canvasTexture(16, 16, 300 + i, paint);
    const m = new THREE.MeshLambertMaterial({
      map,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.InstancedMesh(cross, m, list.length);
    list.forEach(([x, y, z], j) => {
      dummy.position.set(x + 0.5, y, z + 0.5);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(j, dummy.matrix);
    });
    mesh.receiveShadow = true;
    scene.add(mesh);
    disposables.push(map, m, mesh);
  });

  const signs: THREE.Mesh[] = [];
  const clearSigns = () => {
    for (const s of signs) {
      s.parent?.remove(s);
      (s.material as THREE.MeshLambertMaterial).map?.dispose();
      (s.material as THREE.Material).dispose();
      s.geometry.dispose();
    }
    signs.length = 0;
  };
  const drawSigns = () => {
    clearSigns();
    world.buildings.forEach((b, i) => {
      for (const s of b.signs) {
        const w = s.text === "PLAYTALK" ? 10 : 4;
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, w / 4),
          new THREE.MeshLambertMaterial({
            map: signTexture(s.text),
            side: THREE.DoubleSide,
          }),
        );
        mesh.position.set(s.x + 0.5, s.y + 0.5, s.z);
        mesh.rotation.y = Math.PI;
        buildingGroups[i].add(mesh);
        signs.push(mesh);
      }
    });
  };
  drawSigns();
  const font = new FontFace(
    "Press Start 2P",
    "url(/assets/website/fonts/PressStart2P-Regular.woff2)",
  );
  font.load().then(
    (f) => {
      document.fonts.add(f);
      drawSigns();
    },
    () => {},
  );

  // Pixel water with a slow scroll.
  const waterMap = canvasTexture(16, 16, 900, (px, r) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++)
        px(
          x,
          y,
          ["#3f76e4", "#4a82ec", "#3569d2", "#5a90f0"][Math.floor(r() * 4)],
        );
  });
  waterMap.wrapS = waterMap.wrapT = THREE.RepeatWrapping;
  waterMap.repeat.set(220, 24);
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 24),
    new THREE.MeshLambertMaterial({
      map: waterMap,
      transparent: true,
      opacity: 0.82,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(60, 2.7, -28);
  water.receiveShadow = true;
  scene.add(water);
  disposables.push(waterMap, water.geometry, water.material);

  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(cloudMat);
  const clouds = Array.from({ length: 16 }, (_, i) => {
    const c = new THREE.Mesh(
      new THREE.BoxGeometry(10 + (i % 3) * 5, 1.5, 5 + (i % 2) * 4),
      cloudMat,
    );
    c.position.set(
      -30 + i * 12 + Math.sin(i * 7) * 5,
      32 + (i % 3) * 2,
      20 + Math.cos(i * 3) * 18,
    );
    scene.add(c);
    disposables.push(c.geometry);
    return c;
  });

  // Blocky hero.
  const hero = createHero();
  scene.add(hero.root);

  // Floating gem above the current building.
  const gemMat = new THREE.MeshLambertMaterial({
    color: 0xffd24a,
    emissive: 0xffb800,
    emissiveIntensity: 0.5,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.8), gemMat);
  gem.castShadow = true;
  scene.add(gem);
  disposables.push(gem.geometry, gemMat);

  // Pooled pixel particles: dust puffs from footsteps + arrival confetti.
  type Part = {
    p: THREE.Vector3;
    v: THREE.Vector3;
    life: number;
    max: number;
    size: number;
    g: number;
  };
  const POOL = 90;
  const partMat = new THREE.MeshLambertMaterial();
  const partMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    partMat,
    POOL,
  );
  partMesh.frustumCulled = false;
  scene.add(partMesh);
  disposables.push(partMesh.geometry, partMat, partMesh);
  const parts: Part[] = Array.from({ length: POOL }, () => ({
    p: new THREE.Vector3(),
    v: new THREE.Vector3(),
    life: 0,
    max: 0,
    size: 0,
    g: 0,
  }));
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < POOL; i++) partMesh.setMatrixAt(i, zero);
  let nextPart = 0;
  let particlesAlive = false;
  const spawn = (
    pos: THREE.Vector3,
    vel: THREE.Vector3,
    color: string,
    max: number,
    size: number,
    g: number,
  ) => {
    const i = nextPart++ % POOL;
    Object.assign(parts[i], { life: 0, max, size, g });
    parts[i].p.copy(pos);
    parts[i].v.copy(vel);
    partMesh.setColorAt(i, new THREE.Color(color));
    if (partMesh.instanceColor) partMesh.instanceColor.needsUpdate = true;
  };

  // ---- camera framing ----
  let portrait = false;
  const tops = world.buildings.map((b) => b.top);
  // Follow-camera for a point along the walk; pulls back for taller buildings.
  const follow = (at: number) => {
    const c = walkCurve.getPoint(at);
    const i = at * (STATIONS.length - 1);
    const a0 = Math.floor(i);
    const top =
      tops[a0] +
      (tops[Math.min(a0 + 1, tops.length - 1)] - tops[a0]) * (i - a0);
    const pos = c
      .clone()
      .add(
        portrait
          ? new THREE.Vector3(-1, 8 + top * 0.5, -22 - top * 1.1)
          : new THREE.Vector3(-6, 5 + top * 0.35, -16 - top * 0.8),
      );
    const look = c
      .clone()
      .add(
        portrait
          ? new THREE.Vector3(-0.5, top * 0.12, 6)
          : new THREE.Vector3(-5, 2 + top * 0.3, 6),
      );
    return { pos, look };
  };
  const poseFor = (step: number) => {
    if (step > 0) return follow(stationU(step));
    const g = new THREE.Vector3(STATIONS[0][0], PAD + 1, STATIONS[0][1]);
    return portrait
      ? {
          pos: g.clone().add(new THREE.Vector3(-12, 22, -40)),
          look: g.clone().add(new THREE.Vector3(10, 0, 4)),
        }
      : {
          pos: g.clone().add(new THREE.Vector3(-20, 15, -34)),
          look: g.clone().add(new THREE.Vector3(14, 3, 6)),
        };
  };

  let step = 0;
  let u = 0; // hero position along the walk curve
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  type Off = { pos: THREE.Vector3; look: THREE.Vector3 };
  let tween: null | {
    t0: number;
    dur: number;
    u0: number;
    u1: number;
    off0: Off;
    off1: Off;
  } = null;

  const snap = () => {
    const p = poseFor(step);
    camPos.copy(p.pos);
    camLook.copy(p.look);
    u = stationU(step);
  };

  function goTo(next: number) {
    if (next === step && !tween) return;
    const u1 = stationU(next);
    step = next;
    controls.reset();
    if (reducedMotion) {
      snap();
      return;
    }
    // Offsets from the follow-camera at start/end; blending them makes intro<->tour and interrupts seamless.
    const f0 = follow(u);
    const f1 = follow(u1);
    const p1 = poseFor(next);
    const hops = Math.abs(u1 - u) * (STATIONS.length - 1);
    tween = {
      // short wind-up so the hero turns before walking
      t0: performance.now() + 180,
      dur: Math.min(4200, 1700 + hops * 650),
      u0: u,
      u1,
      off0: {
        pos: camPos.clone().sub(f0.pos),
        look: camLook.clone().sub(f0.look),
      },
      off1: { pos: p1.pos.sub(f1.pos), look: p1.look.sub(f1.look) },
    };
  }

  function arrive() {
    if (step === 0) return;
    hero.celebrate();
    events.onArrive?.();
    const door = walkCurve.getPoint(stationU(step));
    const colors = ["#ffd24a", "#22b356", "#4fd8d2", "#ffffff", "#c0281e"];
    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * Math.PI * 2;
      spawn(
        door.clone().add(new THREE.Vector3(0, 2.8, 0.5)),
        new THREE.Vector3(
          Math.cos(ang) * (2 + (i % 4)),
          7 + (i % 5) * 1.2,
          Math.sin(ang) * (2 + (i % 3)),
        ),
        colors[i % colors.length],
        1.4,
        0.2,
        22,
      );
    }
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    portrait = w / h < 0.9;
    camera.fov = portrait ? 58 : 42;
    // Portrait: the step card covers the lower part, so render a window shifted down → town sits higher.
    if (portrait) camera.setViewOffset(w, h, 0, h * 0.13, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    if (!tween) snap();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const controls = createViewControls(canvas, () => events.onInteract?.());
  const viewPos = new THREE.Vector3();
  const viewLook = new THREE.Vector3();
  const lastLook = new THREE.Vector3(Infinity, 0, 0);

  let paused = false;
  let raf = 0;
  let last = performance.now();
  let frames = 0;
  let slowFrames = 0;
  let idleFrames = 0;
  let clock = 0;
  let dustAcc = 0;
  const prevHero = walkCurve.getPoint(u);
  const tangent = new THREE.Vector3();
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    // Idle → ~30fps; paused & idle → ~4fps; anything moving → full rate.
    const busy = !!tween || hero.busy || controls.moving || particlesAlive;
    if (!busy && now - last < (paused || reducedMotion ? 250 : 33)) return;
    const raw = now - last;
    const dt = Math.min(raw / 1000, 0.05);
    last = now;
    // ponytail: crude adaptive resolution; drop DPR when busy frames run under ~40fps.
    if (busy && raw < 200) {
      frames++;
      if (raw > 25) slowFrames++;
      if (frames === 90) {
        if (slowFrames > 45 && pixelRatio > 0.85) {
          pixelRatio = Math.max(0.75, pixelRatio - 0.25);
          resize();
        }
        frames = slowFrames = 0;
      }
    }
    controls.update(dt, now);
    if (!paused && !reducedMotion) clock += dt;

    let heading = Math.PI; // face the camera when standing
    if (tween) {
      const k = Math.max(0, Math.min(1, (now - tween.t0) / tween.dur));
      const e = ease(k);
      u = tween.u0 + (tween.u1 - tween.u0) * e;
      const f = follow(u);
      const lift =
        Math.sin(Math.PI * e) * Math.min(1, Math.abs(tween.u1 - tween.u0) * 5);
      camPos
        .copy(f.pos)
        .addScaledVector(tween.off0.pos, 1 - e)
        .addScaledVector(tween.off1.pos, e);
      camPos.y += lift * 4;
      camPos.z -= lift * 6;
      camLook
        .copy(f.look)
        .addScaledVector(tween.off0.look, 1 - e)
        .addScaledVector(tween.off1.look, e);
      walkCurve.getTangent(Math.min(0.999, Math.max(0.001, u)), tangent);
      const dir = Math.sign(tween.u1 - tween.u0) || 1;
      if (k < 0.985) heading = Math.atan2(tangent.x * dir, tangent.z * dir);
      if (k === 1) {
        tween = null;
        arrive();
      }
    }

    const hp = walkCurve.getPoint(u);
    const moved = hp.distanceTo(prevHero);
    prevHero.copy(hp);
    hero.root.position.set(hp.x, hp.y, hp.z);
    hero.update(dt, moved, heading, clock);
    hero.root.position.y += hp.y; // update() sets the hop height relative to the feet

    // Footstep dust.
    dustAcc += moved;
    if (dustAcc > 0.55 && !reducedMotion) {
      dustAcc = 0;
      for (let i = 0; i < 3; i++)
        spawn(
          hp
            .clone()
            .add(
              new THREE.Vector3(
                (Math.random() - 0.5) * 0.6,
                0.1,
                (Math.random() - 0.5) * 0.6,
              ),
            ),
          new THREE.Vector3(
            (Math.random() - 0.5) * 1.2,
            0.9 + Math.random() * 0.6,
            (Math.random() - 0.5) * 1.2,
          ),
          ["#c9b48a", "#b39d70", "#ddd0b0"][i],
          0.6,
          0.16,
          1.5,
        );
    }

    let alive = false;
    parts.forEach((q, i) => {
      if (q.life >= q.max) return;
      alive = true;
      q.life += dt;
      q.v.y -= q.g * dt;
      q.p.addScaledVector(q.v, dt);
      const fade = Math.max(0, 1 - q.life / q.max);
      dummy.position.copy(q.p);
      dummy.rotation.set(q.life * 6 + i, q.life * 4, 0);
      dummy.scale.setScalar(q.size * (q.g < 5 ? 0.6 + q.life * 2 : 1) * fade);
      dummy.updateMatrix();
      partMesh.setMatrixAt(i, q.life >= q.max ? zero : dummy.matrix);
    });
    if (alive) partMesh.instanceMatrix.needsUpdate = true;
    particlesAlive = alive;

    const b = step;
    gem.position.set(
      STATIONS[b][0],
      PAD + 1 + tops[b] + 1.5 + Math.sin(clock * 2.5) * 0.4,
      STATIONS[b][1],
    );
    gem.rotation.y = clock * 1.6;
    gem.visible = step > 0 && !tween;

    if (!paused && !reducedMotion)
      for (const c of clouds) {
        c.position.x += dt * 0.8;
        if (c.position.x > 165) c.position.x = -40;
      }
    waterMap.offset.x = clock * 0.15;

    controls.apply(camPos, camLook, clock, viewPos, viewLook);
    viewPos.y = Math.max(viewPos.y, PAD + 2.5); // never dip under the ground
    camera.position.copy(viewPos);
    camera.lookAt(viewLook);
    // Shadows: re-render the map only when the light frame or a caster moved.
    if (
      busy ||
      lastLook.distanceToSquared(viewLook) > 0.01 ||
      idleFrames % 8 === 0
    ) {
      sun.target.position.copy(viewLook);
      sun.position.copy(viewLook).add(SUN_OFFSET);
      lastLook.copy(viewLook);
      renderer.shadowMap.needsUpdate = true;
    }
    if (!busy) idleFrames++;
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    goTo,
    setPaused(p) {
      paused = p;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      clearSigns();
      hero.dispose();
      blocks.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}
