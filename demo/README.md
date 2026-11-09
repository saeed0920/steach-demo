# Blockfield

A small Minecraft-inspired voxel playground for desktop, phone and tablet. Walk through a procedural meadow, explore trees and shallow water, and build with five block types. Made with Three.js, vanilla JavaScript and Vite. No Minecraft assets or affiliation.

**World changes are not saved. Refreshing or leaving the page resets the world.** Pausing and respawning keep your edits.

## Documentation

- [Setup and player guide](#quick-start) — this page
- [Developer guide](docs/DEVELOPMENT.md) — architecture, tuning, checks and deployment
- [Design guidelines](design.md) — visual direction, responsive layouts and interaction rules

## Quick start

### Requirements

- Node.js 22.12+ recommended. Vite also supports Node.js 20.19+ on the 20.x line.
- npm and a modern browser with WebGL2/hardware acceleration.
- Touch browsers need Pointer Events; desktop mouse-look needs Pointer Lock.

Run from this directory:

```sh
npm ci
npm run dev
```

Open **http://localhost:5173**, then click or tap **Enter the world**. If port 5173 is busy, use the URL printed by Vite.

### Open on a phone or tablet

1. Connect the computer and device to the same Wi-Fi.
2. Keep the dev server running on the computer.
3. Find the computer's local Wi-Fi IP in its network settings.
4. Open `http://<computer-LAN-IP>:5173` on the device, using Vite's actual port.

`localhost` on a phone means the phone itself, not your computer. The dev script listens on all network interfaces. Use a trusted network; do not expose the dev server to the public internet.

## How to play

The center crosshair determines which block you interact with. Move closer until a block outline appears, then break it or place the selected block against its face.

Palette order: **1 Grass · 2 Dirt · 3 Stone · 4 Wood · 5 Leaves**. Blocks are unlimited; there is no inventory collection requirement.

### Phone and tablet

| Control | Action |
| --- | --- |
| Left thumb joystick | Walk; move farther from center for more speed |
| Drag the world | Look around; can be used while holding the joystick |
| Sprint | Toggle running; highlighted when on |
| Jump | Jump when standing on solid ground |
| Break | Remove the block under the crosshair |
| Place | Place selected block against the targeted face |
| Bottom palette | Select a building block |
| Top-right pause button | Pause and open menu |
| Back to spawn, in paused menu | Return to the starting position without undoing edits |

Portrait and landscape both work. Rotation pauses play; viewport resizing clears held touch inputs. Resume explicitly from the menu. Touch play does not require fullscreen or mouse capture.

### Desktop

| Control | Action |
| --- | --- |
| WASD / arrow keys | Walk |
| Mouse | Look around after entering the world |
| Space | Jump when grounded |
| Hold Shift | Sprint |
| Left-click / right-click | Break / place a block |
| 1–5 / mouse wheel | Select a block |
| Esc / pause button | Pause and release the mouse |
| R | Respawn |

On hybrid devices, tap **Enter/Back to the world** with a finger for touch controls, or click it with a mouse for mouse capture. Switch modes by pausing and entering again with the desired device.

### World rules

- Finite terrain, approximately 68 × 68 blocks; no infinite chunks.
- Block interaction range: six world units from the camera.
- Bottom layer cannot be broken. Placement is bounded horizontally and vertically.
- A block cannot be placed inside the player or an occupied cell.
- Gravity and solid-block collisions apply. Falling below the world respawns you.
- Water is visual only: no swimming, buoyancy or water simulation.
- Switching tabs or losing window focus pauses play and clears held inputs.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Start Vite development server, normally port 5173 |
| `npm test` | Run Node checks for world logic and joystick math |
| `npm run build` | Build static production files in `dist/` |
| `npm run preview` | Preview the existing build, normally port 4173 |

## Troubleshooting

| Problem | Try this |
| --- | --- |
| Phone cannot connect | Check LAN IP, actual Vite port, same Wi-Fi, firewall and Wi-Fi client isolation; disable VPN interference if applicable. |
| Mouse capture blocked | Open the page directly in a desktop browser, not an embedded preview, and click Enter again. |
| No touch controls | Pause, then tap the resume button with a finger rather than clicking with a mouse. |
| Cannot break/place | Move closer, aim at a block, avoid bottom layer/world bounds, and step back if placing inside your player. |
| Movement stops after rotation/interruption | Release fingers, resume if paused, and touch the controls again. This prevents stuck movement. |
| Blank scene / WebGL unavailable | Enable hardware acceleration, update browser/graphics drivers, or try another supported browser. |
| Slow rendering | Close GPU-heavy tabs/apps. Software rendering and older phones may be slow; smooth performance is not guaranteed. |
| World disappeared after refresh | Expected: no save system yet. |

## Scope and verification

Single-player, in-memory sandbox. No backend, accounts, saving, multiplayer, crafting, enemies, survival, audio, or offline/PWA support.

Node tests and production build pass. Prior Chromium browser-emulation checks covered multi-touch movement/look, jump, block edits, palette selection, pause/resume, cancellation, rotation and hybrid mouse input, plus phone/tablet portrait and landscape layouts. Those browser checks are not part of `npm test`; see the [manual verification checklist](docs/DEVELOPMENT.md#verification).

**Real iOS/Android hardware performance and browser compatibility remain unverified.**
