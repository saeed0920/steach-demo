# Developer guide

[Back to README](../README.md) · [Design guidelines](../design.md)

## Stack and files

Three.js handles 3D rendering; Vite bundles browser ES modules. UI and input use native DOM, CSS and Pointer Events. No frontend framework, physics engine, backend, environment variables or API keys are required.

| File | Responsibility |
| --- | --- |
| `index.html` | Canvas, start/pause menu, HUD and touch-control markup |
| `main.js` | Scene, textures, instance meshes, game state, keyboard/mouse input, editing and frame loop |
| `world.js` | Deterministic terrain, voxel keys, collision, movement and grid ray traversal; no DOM dependency |
| `touch.js` | Joystick math, pointer capture, independent move/look fingers, action callbacks and reset |
| `style.css` | Visual styles, touch HUD, safe areas, portrait/landscape and reduced-motion rules |
| `world.test.js` | Node tests for world functions and joystick math |
| `design.md` | Visual and interaction guidelines |
| `package.json` / `package-lock.json` | Commands, dependency ranges and reproducible resolved versions |

## Runtime flow

```text
index.html → main.js
               ├─ createWorld() → Map of voxels
               ├─ textures + rebuild() → Three.js instance meshes
               ├─ bindTouchControls() → analog input and callbacks
               └─ requestAnimationFrame
                    ├─ collect keyboard + touch input
                    ├─ apply gravity + movePlayer()
                    ├─ update camera + traceBlock()
                    └─ update HUD + render

Mouse click / touch action → editBlock()
  → trace target again → validate edit → update Map → rebuild meshes
```

### World representation

- `Map<string, string>` maps `"x,y,z"` integer coordinates to a name from `TYPES`.
- A voxel at `(x,y,z)` occupies `[x,x+1] × [y,y+1] × [z,z+1]`.
- `SIZE = 34`: generated terrain covers integer X/Z positions from −34 through 33.
- `heightAt(x,z)` uses fixed trigonometric terrain with a low river channel. Tree placement is deterministic too; there is no configurable seed.
- Terrain starts at Y = −3. In the edit handler, that bottom layer is protected; placement requires `abs(x) < SIZE`, `abs(z) < SIZE`, and Y between −3 and 24.
- The Map is the source of truth. Render meshes are derived from it; there is no persistence.

### Rendering

`rebuild()` groups exposed blocks by type into `InstancedMesh` objects, sharing cube geometry. It skips blocks surrounded on all six sides, but does not build a face-only or greedy mesh. Grass uses different top/side/bottom materials.

Pixel textures are generated on 16 × 16 canvases; water is a transparent plane, clouds are static boxes, and lighting uses hemisphere/directional lights. There are no external image downloads.

Each successful edit rebuilds all exposed block instances. This is intentional for a finite demo. If terrain or edit frequency grows, profile first, then consider chunk-local rebuilds or face meshing.

The frame callback stays scheduled while paused, but skips physics and rendering unless a redraw was requested, such as on resize or respawn. Initial rendering disables antialiasing on touch-detected devices. Pixel ratio is capped at 1.25 for touch mode and 1.75 for mouse mode.

### Movement and targeting

The player's position represents their feet; camera eye height is 1.62 units above it. `collides()` checks the player's axis-aligned volume against occupied voxels.

`movePlayer(blocks, position, velocity, dt)` mutates position/velocity and returns whether a downward collision grounded the player. Small substeps limit tunneling, resolving X, Z, then Y. This is custom kinematic collision, not a general rigid-body simulation.

`traceBlock(blocks, origin, direction, reach = 6)` traverses the voxel grid and returns `{position, normal}` for the first occupied cell, or `null`. Gameplay passes a normalized camera direction. Editing re-traces immediately so actions do not rely on a stale frame target. Place attempts are rolled back if the new block intersects the player.

### Input and pause state

Play is active when `touchPlaying` is true or the canvas owns pointer lock. CSS classes `.touch` and `.playing` select the relevant HUD. Paused gameplay controls and active menu states use `inert` to prevent unwanted focus/input.

Touch and mouse starts share the same menu. A finger selects touch mode; a mouse selects pointer lock. Keyboard-only activation uses the current detected mode.

`bindTouchControls()` returns `{state, reset}`:

- `state.right` / `state.forward`: analog movement axes, positive right/forward.
- `state.sprinting`: toggle state.
- `reset()`: clears movement, look pointer captures, joystick visuals and sprint.
- Callbacks: `onLook(dx,dy)`, `onJump()`, `onEdit(button)`; edit button is `0` for break, `2` for place.

Move and look own separate pointer IDs. Pointer up, cancellation and lost capture clear their respective input. Buttons use pointer-down for fast response, with keyboard/assistive click handling that avoids duplicate touch actions. Joystick math uses a 12% dead zone and clamps diagonal magnitude to one.

Pause clears keyboard and touch input, releases mouse capture, and preserves the world. Blur, hidden-page and orientation-change handlers pause active play. Resize updates projection/render size and resets touch input. Respawn resets player position, camera angles and velocity, not terrain.

## Tuning

Values are currently local constants rather than a settings system:

| Change | Location / current value |
| --- | --- |
| World size / terrain shape | `world.js`: `SIZE`, `heightAt()`, `createWorld()` |
| Walk / sprint speed | `main.js`, `frame()`: 4.3 / 7 units per second |
| Jump / gravity / terminal fall speed | `main.js`: 8 / 23 / 22 |
| Mouse / touch look sensitivity | `main.js`: .002 / .004 radians per pixel |
| Vertical look clamp | `main.js`: −1.5 to 1.5 radians |
| Frame delta cap | `main.js`, `frame()`: .05 seconds |
| Interaction reach | `world.js`, `traceBlock()`: 6 units |
| Player radius / collision height | `world.js`, `collides()`: .28 / approximately 1.75 |
| Joystick dead zone / travel | `touch.js`: .12 / joystick width × .32 |
| Appearance / responsive layout | `style.css`; preserve safe-area and touch-action behavior |

Adding a block type requires updating `TYPES` in `world.js` and matching color/material entries in `main.js` in the same order. Palette buttons are generated automatically, but numeric key handling currently supports only 1–5; adjust it if you add slots. Recheck narrow-screen palette fit.

Changing world size or physics also requires reviewing spawn clearance, edit bounds, water plane, collision tests and browser checks. The frame delta cap deliberately slows simulation on very slow frames rather than catching up large time gaps.

## Verification

From project root:

```sh
npm test
npm run build
npm run preview
```

`npm test` uses built-in `node:test` and `node:assert`, with no browser dependency. The two tests cover joystick dead zone/analog response/diagonal clamp, deterministic world generation, spawn clearance, ground/wall collisions, basic voxel ray hits/misses, and Map edits affecting collision. They do **not** prove DOM events, full edit-handler validation, rendering, or mobile compatibility.

### Manual browser checklist

Use the dev or preview URL; test both phone and desktop paths. No browser automation framework or browser-test script is committed in this repository.

- [ ] Start, pause and resume without losing edits; refresh resets the world.
- [ ] Desktop: capture mouse, look, WASD/arrows, jump, sprint, edit, palette keys/wheel, R, Esc.
- [ ] Hybrid tablet: finger start uses touch; mouse start after pause captures the mouse.
- [ ] Hold joystick and drag view simultaneously; adding a jump/edit finger does not steal movement.
- [ ] Release/cancel a gesture or interrupt the app; no stuck movement or sprint after pause.
- [ ] Test analog speed, diagonal speed and sprint toggle feedback.
- [ ] Break/place with different blocks; reject occupied cells, player overlap, out-of-range targets and protected bottom layer.
- [ ] Pause button, return to spawn, background/foreground, rotation and resize behave as documented.
- [ ] Check 320 × 568 and 390 × 844 portrait, 844 × 390 landscape, 768 × 1024 and 1024 × 768 tablet.
- [ ] Check safe-area/notch and browser toolbar changes on real devices; no clipped or overlapping controls.
- [ ] Check keyboard focus, labels/pressed states, reduced motion and menu access with larger text.
- [ ] Check browser console and visual rendering; measure sustained frame rate and heat on actual phones.

Prior Chromium-emulated checks passed for the core interactions and layouts above, but they are not a guarantee for Safari, real touch hardware, GPU performance or assistive technology. Headless software-rendered frame rates are not representative of real-device performance.

## Production deployment

```sh
npm ci
npm test
npm run build
```

Publish the **contents of `dist/`** to a static host over HTTPS. No application server or database is needed. `npm run preview` is a local build check, not a production server.

The current build assumes hosting at the domain root. If deploying under a subdirectory, build with Vite's matching base path, for example:

```sh
npm run build -- --base=/blockfield/
```

Serve files through HTTP(S), not by double-clicking `index.html`. Do not publish the source directory, `node_modules/`, or a publicly accessible Vite development server. There is no service worker, installable PWA or offline caching guarantee.

## Current limits

No saves, backend, multiplayer, crafting, audio, swimming or infinite terrain. Bounds and per-edit full mesh rebuilds are deliberate demo constraints. See [README troubleshooting](../README.md#troubleshooting) for player-facing issues; see [design.md](../design.md) before changing interaction or layout conventions.
