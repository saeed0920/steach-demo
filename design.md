# PlayTalk media design

Scope: user rejected branded frame; current approved direction is four short cinematic videos similar to `ug4547u5ink`, with clean still-frame thumbnails. No page redesign; `demo/design.md` governs the separate sandbox.

Audience: Persian-speaking children and parents. Direction: original Minecraft scene, restrained block corners, navy #122447, grass green #5CB83A, yellow #FBDB0D, white text. Preserve source Minecraft titles; no claim of affiliation. Existing PlayTalk logo on a white badge. Asset-only English label, no RTL layout changes.

Deliverables: five selected videos including supplied clip; 960×540 clean WebP posters from cinematic source frames, no added logos, text, or borders. Prior branding assets and unselected videos removed. Keep 16:9. Page must supply accessible video label and keyboard-operable playback separately. No new dependencies.

Verification: inspect cinematic contact sheets, choose scene frames rather than title cards, validate H264/AAC streams and full video decoding, update both manifests to new selections and clean posters.

## /first — Living City (3D step tour)

Source idea: "۶ · شهر زنده" board in `PlayTalk Landing — Mobile.html`. Voxel engine evolved from `demo/`; Three.js in Next.js.

- Each sign-up step is a building on a winding path: gate (intro) → account house → level-test tower → teacher school → level-ore pedestal → class clock tower. The camera faces +z, so the tour moves right→left (RTL).
- Blocks: procedural Minecraft-style 16px textures (`textures.ts`): cobblestone (Voronoi), planks, bark + log rings, bricks, shingles, stone bricks, beveled gold/diamond/iron, glass-pane windows, leaves with holes. Mipmapped nearest filtering, soft sun shadows, cross-plane grass tufts and flowers, scrolling pixel water.
- Hero (`hero.ts`): original blocky player-proportion character (head 8³, body 8×12×4, limbs 4×12×4) in PlayTalk mascot colours, with a rig. It turns before walking, plays a walk cycle synced to distance travelled (limb swing, bob, lean), kicks up footstep dust, then turns to the camera, hops and waves on arrival with confetti. When idle it breathes and looks around.
- Camera: a scripted follow/crane shot between stations plus a slow idle orbit. Free look (`controls.ts`): drag to orbit, right/shift-drag to pan, wheel/pinch to zoom, WASD to move, Q/E to turn, +/- to zoom, R or double-click to reset. It drifts back to the guided view after 9s idle and resets on a step change.
- Music (`music.ts`): opt-in generative calm piano (original, C418-like mood) via WebAudio with reverb, plus an arrival chime. Off by default; the preference is remembered and resumes on the next user gesture. Suspended while the tab is hidden.
- Performance: full rate only while something moves, ~30fps when idle, ~4fps when paused or reduced-motion. The shadow map re-renders only when needed. DPR is capped at 1.25 on touch / 1.75 on desktop and steps down adaptively if busy frames run slow.
- Card: Persian copy + tokens from the board (navy #0E1733 / #1B3A7A, green #287A32, Estedad). Bottom sheet on mobile (view offset lifts the town), right side on desktop. Arrow Left = next, Arrow Right = back. Reduced motion → instant cuts, no idle motion or dust/confetti. If WebGL fails, a gradient is shown and the card still works.
- Files: `src/app/first/{page.tsx,town-tour.tsx,scene.ts,world.ts,textures.ts,hero.ts,controls.ts,music.ts}`; `bun test src/app/first` checks flat ground under stations and the path.

## /second — Glassy landscape (full landing)

Source: the "۲ · شیشه‌ای — منظره" board in `PlayTalk Landing — Mobile.html`. Frosted-glass cards float over Minecraft landscapes. Mobile-first; on desktop it switches to 2-column grids, and the hero card sits on the right (RTL start).

- Hero: a looping muted trailer (`/assets/youtube/ug4547u5ink.mp4#t=8`) behind the glass card. Its `<source media="(prefers-reduced-motion: no-preference)">` means reduced-motion users get the still poster only.
- Sections: hero → page chips (mobile only) → session timeline → video band → 14 levels → town tabs → FAQ → final CTA with the floating mascot → footer with real links (Aparat, Instagram, Bale, Rubika, WhatsApp, phone).
- Native-first: popover menu (closes on Esc and outside click), `<dialog>` video player that loads only on demand and has an error state, `<details>` for the levels and FAQ (`name="faq"` makes it exclusive), and ARIA tabs with roving focus (ArrowLeft = next).
- Motion is CSS-only and scroll-driven where supported: card reveal, hero/band parallax and the session bar growing in. Everything is static under reduced motion. Glass falls back to solid with no `backdrop-filter`, under reduced transparency, or with high contrast.
- Only the intro video ships locally. The other video cards open the PlayTalk Aparat channel in a new tab.
- Files: `src/app/second/{page.tsx,islands.tsx}`, glass CSS in `globals.css`, shared Estedad font in `src/app/fonts.ts`. `/` lists all designs.
