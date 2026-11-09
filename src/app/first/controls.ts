import * as THREE from "three";

// Free-look on top of the scripted camera: drag = orbit, right/shift-drag = pan,
// wheel/pinch = zoom, WASD = move, Q/E = turn, +/- = zoom, R/double-click = reset.
// Offsets drift back to the guided view after a while so the tour stays readable.

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
type View = { yaw: number; pitch: number; zoom: number; pan: THREE.Vector3 };
const IDLE_RETURN_MS = 9000;

export function createViewControls(el: HTMLElement, onInteract: () => void) {
  const target: View = { yaw: 0, pitch: 0, zoom: 1, pan: new THREE.Vector3() };
  const cur: View = { yaw: 0, pitch: 0, zoom: 1, pan: new THREE.Vector3() };
  const pointers = new Map<number, { x: number; y: number; pan: boolean }>();
  const keys = new Set<string>();
  let pinch = 0;
  let lastInput = -1e9;
  let heading = 0; // ground-plane yaw of the view direction, for WASD/pan
  const right = new THREE.Vector3();
  const fwd = new THREE.Vector3();

  const poke = () => {
    lastInput = performance.now();
    onInteract();
  };
  const rotate = (dx: number, dy: number) => {
    target.yaw -= dx * 0.006;
    target.pitch = clamp(target.pitch + dy * 0.004, -0.35, 0.6);
  };
  const panBy = (dx: number, dz: number) => {
    fwd.set(Math.sin(heading), 0, Math.cos(heading));
    right.set(-Math.cos(heading), 0, Math.sin(heading));
    target.pan.addScaledVector(right, dx).addScaledVector(fwd, dz);
    if (target.pan.length() > 30) target.pan.setLength(30);
  };
  const zoomBy = (f: number) => {
    target.zoom = clamp(target.zoom * f, 0.4, 1.9);
  };
  const reset = () => {
    target.yaw = target.pitch = 0;
    target.zoom = 1;
    target.pan.set(0, 0, 0);
  };

  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 2) return;
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      pan: e.button === 2 || e.shiftKey,
    });
    pinch = 0;
    poke();
  };
  const move = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.size === 1) {
      if (p.pan)
        panBy(-dx * 0.035 * cur.zoom, dy * 0.035 * cur.zoom); // grab-the-world feel
      else rotate(dx, dy);
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) zoomBy(pinch / dist);
      pinch = dist;
    }
    poke();
  };
  const up = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    pinch = 0;
  };
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    zoomBy(Math.exp(e.deltaY * 0.0012));
    poke();
  };
  const menu = (e: Event) => e.preventDefault();
  const typing = (t: EventTarget | null) =>
    t instanceof HTMLElement &&
    (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  const keydown = (e: KeyboardEvent) => {
    if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "r") reset();
    else if ("wasdqe=+-".includes(k)) keys.add(k);
    else return;
    poke();
  };
  const keyup = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const blur = () => {
    keys.clear();
    pointers.clear();
  };

  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("lostpointercapture", up);
  el.addEventListener("wheel", wheel, { passive: false });
  el.addEventListener("contextmenu", menu);
  el.addEventListener("dblclick", reset);
  addEventListener("keydown", keydown);
  addEventListener("keyup", keyup);
  addEventListener("blur", blur);

  const off = new THREE.Vector3();
  const sph = new THREE.Spherical();
  return {
    reset,
    /** True while the user is steering or the view is still easing. */
    get moving() {
      return (
        keys.size > 0 ||
        pointers.size > 0 ||
        Math.abs(cur.yaw - target.yaw) +
          Math.abs(cur.pitch - target.pitch) +
          Math.abs(cur.zoom - target.zoom) >
          0.002 ||
        cur.pan.distanceTo(target.pan) > 0.01
      );
    },
    update(dt: number, now: number) {
      if (keys.size) {
        const s = 14 * dt * cur.zoom;
        const x = Number(keys.has("d")) - Number(keys.has("a"));
        const z = Number(keys.has("w")) - Number(keys.has("s"));
        if (x || z) panBy(x * s, z * s);
        target.yaw +=
          (Number(keys.has("q")) - Number(keys.has("e"))) * 1.4 * dt;
        if (keys.has("=") || keys.has("+")) zoomBy(1 - dt);
        if (keys.has("-")) zoomBy(1 + dt);
        lastInput = now;
      }
      // Drift back to the guided framing when left alone.
      if (now - lastInput > IDLE_RETURN_MS && pointers.size === 0) {
        const k = Math.min(1, dt * 0.9);
        target.yaw -= target.yaw * k;
        target.pitch -= target.pitch * k;
        target.zoom += (1 - target.zoom) * k;
        target.pan.multiplyScalar(1 - k);
      }
      const k = Math.min(1, dt * 7);
      cur.yaw += (target.yaw - cur.yaw) * k;
      cur.pitch += (target.pitch - cur.pitch) * k;
      cur.zoom += (target.zoom - cur.zoom) * k;
      cur.pan.lerp(target.pan, k);
    },
    /** Apply user offsets + gentle idle orbit to the scripted base pose. */
    apply(
      basePos: THREE.Vector3,
      baseLook: THREE.Vector3,
      idle: number,
      outPos: THREE.Vector3,
      outLook: THREE.Vector3,
    ) {
      off.copy(basePos).sub(baseLook);
      sph.setFromVector3(off);
      sph.theta += cur.yaw + Math.sin(idle * 0.11) * 0.09;
      sph.phi = clamp(
        sph.phi - cur.pitch + Math.sin(idle * 0.17) * 0.015,
        0.2,
        1.45,
      );
      sph.radius *= cur.zoom * (1 + Math.sin(idle * 0.13) * 0.025);
      outLook.copy(baseLook).add(cur.pan);
      off.setFromSpherical(sph);
      heading = Math.atan2(-off.x, -off.z);
      outPos.copy(outLook).add(off);
    },
    dispose() {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("lostpointercapture", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("contextmenu", menu);
      el.removeEventListener("dblclick", reset);
      removeEventListener("keydown", keydown);
      removeEventListener("keyup", keyup);
      removeEventListener("blur", blur);
    },
  };
}
