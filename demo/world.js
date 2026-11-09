export const SIZE = 34;
export const TYPES = ['grass', 'dirt', 'stone', 'wood', 'leaves'];
export const key = (x, y, z) => `${x},${y},${z}`;
export function heightAt(x, z) {
  const river = Math.abs(x - 9 - Math.sin(z * .09) * 5);
  return river < 3 ? 0 : Math.floor(3 + Math.sin(x * .13) * 1.8 + Math.cos(z * .16) * 1.6 + Math.sin((x + z) * .09));
}
export function createWorld() {
  const blocks = new Map();
  const set = (x, y, z, type) => blocks.set(key(x, y, z), type);
  for (let x = -SIZE; x < SIZE; x++) for (let z = -SIZE; z < SIZE; z++) {
    const h = heightAt(x, z);
    for (let y = -3; y <= h; y++) set(x, y, z, y === h ? 'grass' : y < h - 2 ? 'stone' : 'dirt');
  }
  for (let x = -28; x <= 28; x += 7) for (let z = -28; z <= 28; z += 8) {
    const tx = x + Math.floor(Math.sin(z * 5) * 2), tz = z + Math.floor(Math.cos(x) * 2);
    if (heightAt(tx, tz) < 2 || Math.hypot(tx, tz - 17) < 6) continue;
    const h = heightAt(tx, tz);
    for (let y = h + 1; y <= h + 4; y++) set(tx, y, tz, 'wood');
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = 3; dy <= 6; dy++) {
      if (Math.abs(dx) + Math.abs(dz) + (dy === 6 ? 2 : 0) > 3 || (dx === 0 && dz === 0 && dy < 5)) continue;
      set(tx + dx, h + dy, tz + dz, 'leaves');
    }
  }
  return blocks;
}
// Player position is feet; voxels occupy [x,x+1] on every axis.
export function collides(blocks, p) {
  const r = .28;
  for (let x = Math.floor(p.x - r); x <= Math.floor(p.x + r - .00001); x++)
    for (let y = Math.floor(p.y + .001); y <= Math.floor(p.y + 1.75); y++)
      for (let z = Math.floor(p.z - r); z <= Math.floor(p.z + r - .00001); z++)
        if (blocks.has(key(x, y, z))) return true;
  return false;
}
export function traceBlock(blocks, origin, direction, reach = 6) {
  const p = [origin.x, origin.y, origin.z].map(Math.floor);
  const o = [origin.x, origin.y, origin.z], d = [direction.x, direction.y, direction.z];
  const step = d.map(Math.sign), delta = d.map(n => n === 0 ? Infinity : Math.abs(1 / n));
  const next = d.map((n,i) => n === 0 ? Infinity : (p[i] + (n > 0 ? 1 : 0) - o[i]) / n);
  let distance = 0, normal = [0,0,0];
  while (distance <= reach) {
    if (blocks.has(key(...p))) return {position:[...p], normal};
    const axis = next[0] < next[1] ? (next[0] < next[2] ? 0 : 2) : (next[1] < next[2] ? 1 : 2);
    distance = next[axis];
    if (!Number.isFinite(distance)) break;
    p[axis] += step[axis]; next[axis] += delta[axis];
    normal = [0,0,0]; normal[axis] = -step[axis];
  }
  return null;
}
export function movePlayer(blocks, p, velocity, dt) {
  let grounded = false;
  // Small substeps avoid tunneling through blocks during a slow frame.
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(velocity.x), Math.abs(velocity.y), Math.abs(velocity.z)) * dt / .15));
  for (let i = 0; i < steps; i++) for (const axis of ['x', 'z', 'y']) {
    const prev = p[axis];
    p[axis] += velocity[axis] * dt / steps;
    if (collides(blocks, p)) {
      p[axis] = prev;
      if (axis === 'y') { if (velocity.y < 0) grounded = true; velocity.y = 0; }
    }
  }
  return grounded;
}
