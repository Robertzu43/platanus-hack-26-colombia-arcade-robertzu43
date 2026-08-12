# Startup Run: Bogotá — Game Design Specification

**Status:** Approved for implementation  
**Date:** 2026-08-12  
**Platform:** Platanus Hack 26 arcade cabinet, Phaser 3.87.0, 800×600  
**Players:** Solo or two-player local co-op

## 1. Product vision

Startup Run: Bogotá is an endless autorunner set across Bogotá rooftops, streets, shops, TransMilenio infrastructure, and recognizable skyline landmarks. Players select champions based on Colombian startups accelerated by Platanus, jump through an increasingly fast procedural route, collect Traction Tokens, and throw code-drawn pixel bananas at enemies.

The game must be understandable within one cabinet interaction: Button 1 jumps, Button 2 fires, the world moves continuously, and the objective is to set a high score. Co-op adds teamwork without requiring either player to memorize a new control: the two champions run on parallel rooftop and street routes, share one score, help each other through optional switches, and revive each other by surviving.

The tone is colorful, playful, local, and celebratory. Bogotá identity comes from architecture, transport, signage, weather, and terrain—not stereotypes or copied artwork.

## 2. Success criteria

- A first-time player can understand autorun, jump, banana, score, and hazards during a three-second countdown.
- Solo and co-op both feel complete; co-op is not a second character pasted into the solo lane.
- All eight champions are visually consistent, readable at 32×48 logical pixels, and mechanically distinct.
- Obstacles are readable early enough to react at maximum run speed.
- Every required game visual is generated procedurally in `game.js`; there are no imported runtime assets.
- The minified `game.js` stays at or below 50 KB, with a working target at or below 40 KB.
- The submission cover is exactly 800×600 PNG and at or below 500 KB.
- The game supports the physical cabinet mappings without modifying or replacing existing `CABINET_KEYS` entries.

## 3. Non-goals

- Online multiplayer, networking, accounts, or cloud leaderboards.
- Combat depth resembling a fighting game; bananas are a simple one-button runner weapon.
- Free horizontal movement during a run. Players autorun on fixed parallel routes.
- An authored ending or final boss. Runs continue until the solo player or both co-op players are down.
- Imported sprites, fonts, music, photographs, logos, SVG files, URLs, or runtime downloads.
- Weather that changes friction, physics, visibility, or obstacle rules.

## 4. Challenge and repository constraints

Only the following shipped files may change:

- `game.js`: the complete game, procedural visuals, input, audio, state, and persistence.
- `metadata.json`: final name, description, and `two_player` capability.
- `cover.png`: exactly 800×600, PNG, no more than 500 KB.

Runtime restrictions:

- Phaser 3.87.0, already provided by the host.
- Pure vanilla JavaScript; no `import` or `require`.
- No external URLs, `fetch`, `XMLHttpRequest`, or other network calls.
- No new dependencies.
- No development server started by the implementation agent.
- Validate repeatedly with `npm run check-restrictions`.
- Preserve every existing physical cabinet key in `CABINET_KEYS`; game logic consumes arcade codes such as `P1_1` and `START1`, never raw keyboard keys.

Planning documents and `.superpowers/` review files are process records only. They are not runtime or submission assets.

## 5. Core loop

1. The title presents Solo Run and Co-op Run.
2. Players choose one or two distinct startup champions from the 4×2 roster.
3. A `3 · 2 · 1 · ¡CORRE!` countdown identifies routes and controls.
4. The world scrolls from right to left while champions remain in stable horizontal screen regions.
5. Players jump hazards, fire bananas, collect tokens, trigger champion passives, and maintain a combo.
6. Difficulty increases continuously through speed, denser—but always valid—patterns, and later enemy introductions.
7. Solo ends when the champion is down. Co-op ends only when both champions are down simultaneously.
8. The results screen explains the score, saves qualifying initials, and offers immediate retry.

## 6. Controls and cabinet behavior

### Gameplay

| Player | Arcade input | Action | Local test key already mapped |
|---|---|---|---|
| P1 | `P1_1` | Jump; hold for champion movement power where applicable | U |
| P1 | `P1_2` | Fire banana | I |
| P2 | `P2_1` | Jump; hold for champion movement power where applicable | R |
| P2 | `P2_2` | Fire banana | T |
| Either | `START1` / `START2` | Pause or return from a pause subpage | Enter / 2 |

The joystick navigates menus and initials entry only. Champions autorun during gameplay. Input is locked until `¡CORRE!` and during the compact resume countdown.

### Pause

Either START button freezes physics, scrolling, difficulty, spawns, timers, particles, and gameplay effects on the same frame. Music drops to 25% volume. Continue is the safe default. Restart and Exit require a second confirmation whose default is No. Resume uses a one-second `3 · 2 · 1` protection countdown.

## 7. Modes

### Solo Run

- One chosen champion uses a full-height combined route that can transition between street, station, TransMilenio, scaffolding, and rooftops.
- Two hearts; the second damaging collision or any fall ends the run.
- No ghost, revival, Help Switch, partner messaging, or co-op-only score category.
- The complete obstacle and enemy roster appears over the difficulty curve.

### Co-op Run

- P1 runs on the upper rooftop route and P2 on the lower street/TransMilenio route.
- Each champion has two hearts and independent collisions.
- Both players contribute to one team score and one combo chain.
- Each route receives independent hazards, but the deterministic pattern generator guarantees both lanes remain survivable.
- A downed player becomes a non-colliding ghost. If the partner survives six seconds, the champion revives on the next safe platform with one second of protection.
- The run ends only if both champions are down simultaneously.
- Help Switches appear only in co-op and make an already-survivable upcoming partner obstacle easier.

## 8. Champion roster

All champions share a 32×48 logical boundary, four-pixel dark outline, visible human eyes and eyebrows, matching head/torso/limb proportions, a centered chest mark, and the same hands-up jump language. Accessories and palettes create identity without changing the shared collision body.

| Champion | Identity | Passive |
|---|---|---|
| Watermelon Tools | Code Reviewer | Every fifth banana becomes a lime-white piercing shot that passes through all enemies. |
| Vivvidero | Safe Builder | Periodically repairs the next broken or crumbling platform segment before contact. |
| Blokay | Optimizer | Bananas travel faster and the shared combo timer decays more slowly. |
| Nodek | Niche Glider | Holding jump opens magenta/cyan coat-wings and reduces descent speed; arms remain raised and the N stays inside the torso. |
| Trutix | Gatekeeper | Periodically phases through one colliding obstacle with a clear pass effect. |
| Plenti | Currency Conductor | Attracts nearby Traction Tokens without affecting hazards or bananas. |
| Wizybot | Support Pilot | A separate non-colliding companion copies every fourth banana shot. |
| Runni | Volt Courier | Button 1 grants one additional mid-air battery boost before landing. |

No two co-op players may select the same champion.

## 9. Health, failure, revival, and fairness

- Each active champion starts with two hearts.
- Enemy contact, active obstacle collision, or a dangerous cloud removes one heart and grants a brief invulnerability flash.
- A fall below the route immediately downs the champion regardless of remaining heart count.
- Player damage resets the combo but never removes banked score.
- Collision bodies are smaller than decorative outlines. Loose debris, lamp rays, dust, warning arcs, decorative feet, and effect particles never collide.
- No required-jump obstacle appears beside another required-jump obstacle, immediately after a blind landing, or inside another hazard’s reaction window.
- Maximum gap and barrier heights are clearable by every champion using a standard tap jump; powers add expression or forgiveness, not mandatory access.

## 10. Scoring and combo

The score is shared in co-op and individual in solo.

- Distance: continuous primary score source.
- Traction Token: +25 and a small combo-timer refresh.
- Code Bug: +100.
- Stamp Bot: +200 after two hits.
- Pigeon scatter: +75.
- Smog Drone: +125.
- Help Switch assist: +150.
- Combo multiplies qualifying enemy, token, and assist points.
- Milestones: `×2 BIEN`, `×5 BACANO`, `×10 CHÉVERE`, `×20 BRUTAL`.
- Missing a token does not break the combo; taking damage does.
- Results account for distance, enemies, tokens, assists, best combo, and revivals.

Balance values may be tuned during implementation, but category meanings and visible UI labels are locked.

## 11. Difficulty and procedural generation

- Start speed target: approximately 220 px/s.
- Speed rises smoothly toward approximately 380 px/s over the first three minutes, then increases only slightly.
- A seeded segment queue builds valid patterns from small pooled route modules.
- New hazard families unlock progressively: static gaps and tokens first, then basic enemies, barricades and pigeons, then Stamp Bots, moving barriers, and Smog Drones.
- Generator rules operate on reaction time rather than raw pixel distance so fairness persists as speed rises.
- Recycled off-screen segments, enemies, bananas, tokens, and effects are reset rather than recreated.
- No identical decorative prop repeats in adjacent segments.

## 12. World and approved environment assets

The primary visual direction is bright **Bogotá Pixel Day**: chunky 16-bit construction, square shapes, dark four-pixel outlines, restrained pixel shading, and no antialiased imported art.

### Rooftops and buildings

- Terracotta tile/brick ceiling is the primary playable roof surface.
- Building masses are cool gray.
- Module A uses exactly three intentional, evenly spaced, four-pane blue windows with charcoal frames, pale reflection corners, and concrete sills.
- City skyline panes use the locked 8×10 muted-blue recipe, 16-pixel columns, 18-pixel rows, and charcoal outer frames.

### Shops

- La Esquinita, Café 2.600, Rueda Libre, and Manos de Cerro.
- La Esquinita’s window remains intentionally empty.

### Street surfaces and transport

- Primary red-brick sidewalk, zebra crossing, and bike-lane transition only; the discarded accessible curb module is not included.
- Full articulated red TransMilenio: eight framed windows, doors, gray accordion, yellow stripe, lowered wheels, left-aligned `TRANSMILENIO` wordmark, and safe roof read.
- Station kit: platform edge, empty glass boarding doors, wagon/route sign, and card turnstiles.
- Footbridge/scaffolding kit: footbridge deck, cantilever maintenance catwalk, pass-through scaffold, and scaffold landing deck.

### Skyline and props

- Improved Monserrate: green Eastern Hills, white shrine, red roofs, portico, rose window, bell tower, cross, terrace, stairs, and trees.
- Non-colliding street props: tubular streetlamp, Calle/Carrera sign, concrete bollard, steel litter bin, wood/steel bench, city planter, three-loop bike rack, and painted utility box.

### Weather

- Clear Pixel Day: 55%.
- Passing Cloud Cover: 20%.
- Light Bogotá Drizzle: 20%.
- Post-rain Sun Break: 5%.
- Transitions cross-fade over 8–12 seconds.
- Weather is cosmetic; there is no storm, lightning, fog, slippery physics, or visibility penalty.

## 13. Enemies and obstacles

### Enemies

- **Code Bug:** green glitch beetle; walks toward the player, telegraphs a low hop, and takes one banana.
- **Bureaucracy Stamp Bot:** rolling office machine with a red `NO` stamp; warns through arm, lamp, and ground marker; takes two bananas; defeat releases an `APROBADO` receipt.
- **Bogotá pigeons:** groups of two or three; head-turn and chirp before a predictable upward fan; one banana harmlessly scatters the flock.
- **Smog Drone:** charcoal/orange airborne machine with cyan lens and purple tank; yellow warning before a one-second rearward cloud; takes one banana.

### Physical obstacles

- Street pothole, with dry and rain-filled visuals but identical collision.
- Static roadwork barricade with alternating lamps; replaces the rejected hanging cable/sign concept.
- Permanent rooftop gap and forgiving cracked ledge; the ledge provides a visible 0.35-second grace before non-colliding collapse debris.
- Red-and-white moving parking barrier; closed is always jumpable, open is passable, transitions have no collision.

The rejected hanging `OBRA` cable/sign must not be implemented.

## 14. Pickups, projectiles, and co-op interaction

### Pixel Banana V3

- Original code-drawn 20×16 logical pixel map; no face.
- Stepped brown outline, green neck, brown stem and tip, bright yellow body, orange lower/right shading, and square white highlights.
- Four crisp quarter-turn spin frames with nearest-neighbor rendering.
- Straight flight, 0.28-second base fire gap, maximum three active bananas per player.
- Normal shots disappear on the first enemy or solid barrier. Watermelon’s fifth shot pierces.

The supplied banana JPG was inspiration only. It is never imported, embedded, traced pixel-for-pixel, or included in the submission.

### Traction Token

- 16×16 teal octagonal coin with gold rim and white rising chart.
- Four-frame front/edge/back/edge flip.
- Appears in groups of three to five that trace useful or safe jump arcs.
- Plenti visibly bends nearby tokens toward its wallet.

### Ayuda Switch

- Co-op only: yellow box, pink heart button, cross-track arrows, blinking light.
- Appears 1.2 seconds before a normal partner obstacle.
- One banana activates it, turns it green, and sends a pulse to the other route.
- Effects include opening a moving barrier early, delaying a Stamp Bot, or adding a temporary lip to an easy gap.
- Missing the switch never makes the partner pattern impossible.

## 15. Feedback and audio

### Visual feedback

- Banana impact: pale eight-point star, yellow ring, square chips, and `TOK!` for 0.16 seconds.
- Enemy destruction: five color-matched blocks, score pop, no gore, fire, or lingering smoke.
- Player damage: red ring, white flash, lost heart, and a maximum four-pixel camera nudge.
- Combo milestones: compact `RACHA!` ribbon and square confetti outside running lanes.
- Ghost/revival: cyan treatment, six-second timer, portal, safe landing marker, `¡VOLVISTE!`, and one-second protection.

### Audio

- Procedural Web Audio only.
- Short wooden `tok` on banana launch; crunchy pop on enemy destruction.
- Pigeon chirp, Stamp Bot digital warning, Help Switch confirmation, token pitch cycle, damage tone, pause tone, and milestone stinger.
- Light looping arcade music starts only after user interaction and gracefully disables if Web Audio is unavailable.
- Pausing reduces music gain rather than restarting the loop.

## 16. UI flow and copy

State machine:

`boot/loading → title/mode → roster → countdown → playing ↔ paused → results → initials (if qualified) → leaderboard/quick retry`

### Title and mode selection

Locked UI elements:

- `STARTUP RUN! BOGOTÁ` title treatment.
- Solo and Co-op cards.
- Yellow selected state.
- Spanish explanatory copy and cabinet control prompt.

**Important approval boundary:** the title-screen review’s approximate surrounding scenery was explicitly rejected. Implementation must assemble only the exact locked environment constructions listed in section 12. No approximate character, bus, window, building, or Monserrate art from a UI mockup may ship.

### Roster

- Exact 4×2 grid of all eight approved champion constructions.
- Independent lime P1 and pink P2 cursors.
- Card shows name, role, and one-line passive.
- Detail bars show locked selection and power.

### HUD

- Top 18% of screen only.
- Solo: selected portrait/hearts/power at left, score center, combo right.
- Co-op: P1 status left, shared score center, P2 status right.
- Ghost timer replaces the downed player’s power status without shifting shared score.
- HUD review backgrounds were neutral contrast fields only, not environment designs.

### Countdown

- `3`: identify P1 roof and P2 street lanes.
- `2`: Button 1 jump.
- `1`: Button 2 banana.
- `¡CORRE!`: enable autorun, physics, spawns, score, and input.
- After the first tutorial, either action button may use the compact one-second version.

### Results and leaderboards

- Results hierarchy: total, placement, score breakdown, save/retry/home.
- Three-letter initials/tag entry through joystick and Button 1.
- Separate top-five Solo and Co-op tables.
- Co-op saves one shared tag and both champion names.
- Non-record runs default to Retry with the same champion selection.

All UI review scenery labeled neutral or scaffolding is excluded from implementation.

## 17. Persistence

Use `window.platanusArcadeStorage`, with localStorage fallback matching the starter’s established pattern.

- One versioned storage value contains `{ version, solo, coop, tutorialSeen }`.
- `solo` and `coop` are arrays capped at five validated entries.
- Each entry stores tag, score, mode, champion IDs, and summary metrics needed by the results table.
- Reject malformed stored values, invalid tags, non-finite/negative scores, unknown modes, or unknown champion IDs.
- Storage failure never blocks a run; the UI reports that the result could not be saved.

## 18. Technical architecture

The complete runtime remains in one `game.js` to satisfy the challenge.

- One Phaser scene and a small explicit phase/state machine.
- Compact constant registries for colors, champions, powers, segment recipes, score values, and cabinet inputs.
- Procedural textures generated once during `create`: champions, tiles, windows, props, enemies, banana, token, UI icons, and effects.
- Arcade Physics bodies for champions, route surfaces, enemies, hazards, bananas, and pickups.
- Deterministic segment scheduler with object pools for route modules and active entities.
- Separate update functions for menu state, countdown, playing, paused, and end flow.
- Lightweight debug/test hooks may expose pure balance and validation helpers under a single non-production object, but must not change cabinet behavior.
- Render resolution is 800×600 with `Phaser.Scale.FIT` and centered scaling.

Code-size strategy:

- Target no more than 40 KB minified; hard limit 50 KB.
- Prefer data tables and reusable primitive drawers over duplicated pose or environment code.
- Use one shared champion drawing recipe plus small accessory callbacks/data.
- Use pooled simple shapes for effects rather than particle systems with large configuration objects.
- Check restrictions after every independently playable milestone.

## 19. Cover

- Exactly 800×600 PNG and at most 500 KB.
- Title treatment plus exact locked Watermelon and Wizybot raised-arm constructions.
- Pixel Banana V3.
- Exact Rooftop Module A and three-window system.
- Exact articulated TransMilenio treatment.
- Exact improved Monserrate construction.
- `SOLO + 2 PLAYER CO-OP · PLATANUS HACK 26` badge.
- Locally rendered from approved code-drawn primitives; no downloaded or external artwork.

## 20. Acceptance checklist

- Solo and co-op can each start, play, pause, end, and retry without errors.
- All eight champion passives work and are visible.
- Both co-op lanes remain independently survivable across a long seeded simulation.
- Ghost revival triggers at six seconds and never revives into danger.
- Every enemy and obstacle has the approved telegraph and counterplay.
- Pixel Banana V3 is used everywhere; earlier banana versions are absent.
- Hanging cable/sign is absent; roadwork barricade is present.
- Exact locked environment recipes are used; neutral/approximate UI scenery is absent.
- Score categories reconcile to the displayed total.
- Separate top-five Solo and Co-op tables validate, save, reload, and recover from malformed data.
- Audio begins only after user input and pause gain works.
- `metadata.json` describes Startup Run: Bogotá and declares `two_player`.
- `cover.png` is 800×600 and no more than 500 KB.
- `npm run check-restrictions` passes and minified `game.js` stays below 50 KB.
