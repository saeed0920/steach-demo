import { expect, test } from "bun:test";
import {
  buildWorld,
  heightAt,
  PAD,
  STATIONS,
  stationU,
  walkCurve,
} from "./world";

test("stations, path and walk curve sit on flat PAD ground", () => {
  const { path, terrain, buildings } = buildWorld();
  for (const [x, z] of STATIONS)
    for (let dx = -8; dx <= 8; dx++)
      expect(heightAt(x + dx, z, path)).toBe(PAD);
  for (let i = 0; i <= 200; i++) {
    const p = walkCurve.getPoint(i / 200);
    expect(heightAt(Math.round(p.x), Math.round(p.z), path)).toBe(PAD);
    expect(terrain.get(`${Math.round(p.x)},${PAD},${Math.round(p.z)}`)).toBe(
      "path",
    );
  }
  expect(buildings).toHaveLength(STATIONS.length);
  STATIONS.forEach(([x], i) => {
    expect(walkCurve.getPoint(stationU(i)).x).toBeCloseTo(x);
  });
});
