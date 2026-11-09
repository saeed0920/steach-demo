# Blockfield

Original Minecraft-inspired desktop, phone and tablet browser sandbox, not affiliated with Minecraft. Three.js + vanilla JS + Vite; no UI framework.

## Direction
Full-viewport voxel meadow, procedural pixel textures, warm daylight, blue river, trees and drifting-looking static clouds. Compact dark translucent HUD, cream typography, lime accent. Start/pause screen sits over live world; no dashboard or marketing sections. Search recommendation was generic SaaS and rejected; use game-specific art direction.

## Tokens
Background #17251e; text #f6f5e9; muted #c2cdbe; accent #d4f593. System sans headings, monospace utility text. Spacing 8/16/24/40px. Corners 4px, thin translucent borders.

## Components / states
Brand, world badge, start/pause panel, keyboard guide, crosshair, coordinates, five-slot block palette, error notice. Buttons minimum 44px, visible focus, keyboard start, Esc pauses and releases cursor. No automatic camera animation; reduced-motion removes transitions.

## Responsive / scope
Touch play approved: left thumb joystick (analog speed, dead zone), independent drag-to-look on world, explicit Jump / Break / Place buttons, sprint toggle, pause and respawn. Native Pointer Events and pointer capture support simultaneous fingers; release/cancel/lost capture clear input. Pause on blur/background/rotation; resume requires explicit tap. No pointer lock or fullscreen requirement on touch. Mouse/keyboard path stays supported, including hybrid tablets.

Touch HUD uses 48px+ targets, 8px gaps, safe-area insets and compact top bar. Palette stays centered below thumb controls in portrait; between controls in short landscape. Instructions identify aiming at crosshair and selected block. Phone portrait, landscape and tablet all playable; no forced orientation, no horizontal overflow at 320px. Cap touch rendering pixel ratio at 1.25 to avoid high-DPI overdraw. LTR English only. Finite world, gravity, collisions, jump, sprint, block placement/removal, respawn. No multiplayer, crafting, persistence, audio or infinite chunks.

## Verification
Node checks deterministic terrain, collision, spawn clearance, editing. Production build. Browser desktop/phone/tablet screenshots and no overflow at narrow/short sizes. Multi-touch movement + look, jump, edit feedback, palette, pause/resume, pointer cancellation, rotation reset and desktop pointer-lock regression. Touch math gets a Node test. Real iOS/Android hardware performance remains a manual verification target.
