# Startup Run: Bogotá Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current brick-duel starter with the complete procedurally drawn Startup Run: Bogotá endless runner, supporting Solo and two-player co-op within the Platanus Hack 26 restrictions.

**Architecture:** Keep one Phaser scene and one explicit phase machine in `game.js`. Build every sprite and environment texture once from compact primitive recipes, recycle a small pool of world segments and entities, and keep pure balance/generator/storage helpers testable through a Node VM with a stubbed Phaser boot. The runtime remains integrated because the challenge permits only one JavaScript file and imposes a 50 KB minified ceiling.

**Tech Stack:** Phaser 3.87.0, Arcade Physics, vanilla JavaScript, Web Audio API, `window.platanusArcadeStorage`, procedural Phaser Graphics, PNG cover capture.

## Global Constraints

- Shipped files changed: `game.js`, `metadata.json`, and `cover.png` only.
- Phaser version: 3.87.0.
- Canvas: exactly 800×600 with `Phaser.Scale.FIT` and centered scaling.
- `game.js`: no more than 50 KB after minification; working target no more than 40 KB.
- `cover.png`: exactly 800×600 PNG and no more than 500 KB.
- No `import`, `require`, external URLs, network requests, or new dependencies.
- Preserve all existing arrays and physical codes in `CABINET_KEYS`; gameplay uses `P1_1`, `P1_2`, `P2_1`, `P2_2`, `START1`, and `START2`.
- Do not start `npm run dev`; the user owns the development server.
- Run `npm run check-restrictions` after every independently playable milestone.
- Use only approved assets from `docs/plans/2026-08-12-startup-run-bogota-design.md`; neutral or approximate review scenery must not ship.
- Use Pixel Banana V3 everywhere. Do not use the reference JPG or either earlier banana revision.
- Do not implement the rejected hanging cable/sign. Implement the approved roadwork barricade.

---

## File map

- Modify `game.js`: complete state machine, input, procedural textures, world generator, physics, champion powers, enemies, obstacles, pickups, UI, audio, feedback, persistence, and temporary cover-capture entry point.
- Modify `metadata.json`: final public name, Spanish description, and `two_player` declaration.
- Create `cover.png`: captured locally from the same approved procedural recipes at 800×600.
- Read `docs/plans/2026-08-12-startup-run-bogota-design.md`: authoritative behavior and approval boundaries.
- Read the exact approved `.superpowers/brainstorm/.../content/*.html` references indexed below when translating each code-drawn asset; these are process references, not runtime assets, and must never be imported or fetched by the game.
- Read only `docs/phaser-quick-start.md` and `docs/phaser-api.md`: local Phaser method reference.

## Approved visual reference index

Translate geometry and color values from these final approved review files into compact Phaser Graphics calls. Do not use superseded files with the same numeric prefix.

- Champions: `.superpowers/brainstorm/46623-1786460851/content/02-watermelon-v2-eyes.html`, `03-vivvidero-v2.html`, `04-blokay.html`, `05-nodek-v4.html`, `06-airborne-consistency-v2.html`, `07-trutix.html`, `08-plenti.html`, `09-wizybot.html`, `10-runni.html`, and `11-full-roster-consistency.html`.
- Bogotá world: `.superpowers/brainstorm/46623-1786460851/content/12-rooftop-kit-v4-windows.html`, `13-shopfront-windows-v2.html`, `13-la-esquinita-window-v3.html`, `14-bogota-street-surface-v2.html`, `15-transmilenio-full-v4.html`, `16-transmilenio-station-kit.html`, `17-footbridge-scaffolding-v3.html`, `18-skyline-monserrate-v2.html`, `19-street-props.html`, and `20-weather-treatments.html`.
- Gameplay objects: `.superpowers/brainstorm/46623-1786460851/content/21-code-bug.html`, `22-stamp-bot.html`, `23-bogota-pigeons.html`, `24-smog-drone.html`, `25-pothole.html`, `28-roadwork-barricade-final.html`, `29-rooftop-gap.html`, `30-moving-barrier.html`, `33-banana-pixel-v3.html`, `34-traction-token.html`, `35-cross-track-help-switch.html`, `36-feedback-effects.html`, and `37-ghost-revival.html`.
- UI and cover: `.superpowers/brainstorm/29415-1786538890/content/39-title-mode-v2-consistent.html`, `40-roster-ui.html`, `41-solo-coop-hud.html`, `42-countdown.html`, `43-pause-controls.html`, `44-game-over-leaderboard.html`, and `45-cover.html`.
- Explicitly rejected/superseded: every other numbered variant, especially `26-hanging-sign.html`, `38-title-mode-screen.html`, earlier character revisions, earlier banana revisions, and approximate UI scenery.

## Specification coverage map

- Product loop, cabinet controls, Solo/Co-op routes, health, and base persistence: Tasks 1, 3, 4, 5, 8, and 10.
- All eight champion identities, shared construction, exact poses, and passives: Tasks 2 and 5.
- Exact Bogotá rooftops, shops, street surfaces, TransMilenio, station, scaffolding, skyline, Monserrate, props, and Clear/Cloud Cover/Drizzle/Sun Break weather: Tasks 2 and 4.
- Code Bug, Stamp Bot, Bogotá pigeons, Smog Drone, pothole, approved roadwork barricade, gap/ledge, and moving barrier: Tasks 2, 4, and 6.
- Pixel Banana V3, Traction Token, Ayuda/Help Switch, category scoring, shared combo, and feedback: Tasks 2, 7, and 9.
- Ghost/down/revival fairness, safe pause, results, validated initials, and separate top-five Solo and Co-op tables: Tasks 8 and 10.
- Procedural audio, exact UI compositions, metadata, exact code-rendered cover, file/size restrictions, and cabinet acceptance: Tasks 9–12.

## Verification harness

Use this exact VM pattern for pure-function probes without booting a browser:

```bash
node - <<'NODE'
const fs = require('fs');
const vm = require('vm');
const ctx = {
  console,
  Math,
  Date,
  setTimeout,
  clearTimeout,
  window: { addEventListener() {}, removeEventListener() {} },
  Phaser: {
    AUTO: 0,
    Scale: { FIT: 0, CENTER_BOTH: 0 },
    Game: class {},
  },
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('game.js', 'utf8'), ctx);
// Task-specific assertions go here.
NODE
```

Function declarations in `game.js` are visible as `ctx.functionName`. Keep the helpers named in each task as declarations, not arrow functions assigned to `const`, so these probes remain usable without adding test-only runtime exports.

---

### Task 1: Replace the brick duel with the runner foundation

**Files:**
- Modify: `game.js:1-1751`

**Interfaces:**
- Consumes: existing `CABINET_KEYS` values and Phaser host globals.
- Produces: `PHASE`, `MODE`, `makeRunState(mode, seed)`, `phaseAllowed(from, to)`, `setPhase(scene, next)`, `normalizeIncomingKey(key)`, `createControls(scene)`, `isControlHeld(scene, code)`, `consumePressed(scene, codes)`, `clearPressedControls(scene)`, `rngStep(seed)`, `validateSave(value)`, `loadSave()`, and `writeSave(data)`.
- Produces scene groups: `scene.layers`, `scene.ui`, `scene.pool`, `scene.run`, and `scene.controls`.

- [ ] **Step 1: Run a failing foundation probe against the brick-duel starter**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');
const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};
vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.makeRunState!=='function') throw new Error('makeRunState missing');
if(typeof c.phaseAllowed!=='function') throw new Error('phaseAllowed missing');
NODE
```

Expected: FAIL with `makeRunState missing`.

- [ ] **Step 2: Replace the starter’s game-specific constants and top-level lifecycle**

Retain the existing `CABINET_KEYS` object byte-for-byte. Replace the brick-duel constants, state, create/update flow, and storage schema with this foundation:

```js
const W = 800, H = 600, SAVE_KEY = 'startup-run-bogota-v1';
const TXT={fontFamily:'monospace',fontStyle:'bold',color:'#f8f3d4'};
const MODE = { SOLO: 'solo', COOP: 'coop' };
const PHASE = {
  LOAD: 'load', TITLE: 'title', ROSTER: 'roster', COUNT: 'count',
  PLAY: 'play', PAUSE: 'pause', RESULTS: 'results', INITIALS: 'initials',
  BOARD: 'board', CONFIRM: 'confirm',
};
const SCORE = { token: 25, bug: 100, stamp: 200, pigeon: 75, drone: 125, assist: 150 };
const PHASE_EDGES = {
  load: ['title'], title: ['roster', 'board'], roster: ['count', 'title'],
  count: ['play'], play: ['pause', 'results'], pause: ['play', 'confirm', 'title'],
  confirm: ['pause', 'count', 'title'], results: ['initials', 'board', 'count', 'roster', 'title'],
  initials: ['board'], board: ['title', 'results'],
};

function makeRunState(mode, seed) {
  return {
    phase: PHASE.LOAD, mode, seed: seed >>> 0, time: 0, distance: 0,
    speed: 220, score: 0, combo: 1, comboMs: 0, bestCombo: 1,
    stats: { enemies: 0, tokens: 0, assists: 0, revives: 0 },
    selected: [0, 6], locked: [false, false], players: [], patternIndex: 0, weather: 0,
    tutorialSeen: false, resultCursor: 0, countMs: 0, countCompact: false, shotId: 0,
  };
}
function phaseAllowed(from, to) { return (PHASE_EDGES[from] || []).includes(to); }
function setPhase(scene, next) {
  if (!phaseAllowed(scene.run.phase, next)) return false;
  scene.run.phase = next;
  return true;
}
function rngStep(seed) {
  const next = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  return [next, next / 4294967296];
}
function validateSave(v) {
  const validRows = (a,mode) => Array.isArray(a) && a.length <= 5 && a.every(e =>
    e && /^[A-Z0-9.-]{1,3}$/.test(e.tag) && Number.isFinite(e.score) && e.score >= 0 &&
    e.mode === mode && Array.isArray(e.champions) && e.champions.length === (mode===MODE.SOLO?1:2) &&
    e.champions.every(n => Number.isInteger(n) && n >= 0 && n < 8) &&
    ['distance','combo','assists','revives'].every(k=>Number.isFinite(e[k])&&e[k]>=0));
  return v && v.version === 1 && validRows(v.solo,MODE.SOLO) && validRows(v.coop,MODE.COOP) && typeof v.tutorialSeen === 'boolean';
}
```

Use one Phaser scene with `preload`, `create`, and `update`. In `create`, instantiate layer containers in back-to-front order (`sky`, `far`, `world`, `actors`, `fx`, `hud`, `overlay`), create all pools as empty groups, install the existing arcade-code input translator, load persisted data, and enter `PHASE.TITLE`. In `update`, switch only on `scene.run.phase`; no game-specific update function may run while paused.

```js
function create(){
  const scene=this; scene.run=makeRunState(MODE.SOLO,(Date.now()^0x26b0607a)>>>0); scene.save={version:1,solo:[],coop:[],tutorialSeen:false}; scene.ui={}; scene.screens={};
  scene.layers={}; ['sky','far','world','actors','fx','hud','overlay'].forEach((n,i)=>scene.layers[n]=scene.add.container(0,0).setDepth(i*100));
  scene.pool={surfaces:scene.physics.add.staticGroup(),enemies:scene.physics.add.group(),obstacles:scene.physics.add.group(),hazards:scene.physics.add.group(),bananas:scene.physics.add.group(),tokens:scene.physics.add.group(),help:scene.physics.add.group()};
  createControls(scene);
  if(typeof buildTextures==='function')buildTextures(scene);
  if(typeof createTitleUi==='function'){createTitleUi(scene);createRosterUi(scene);createCountdownUi(scene);}
  if(typeof createFxPool==='function')createFxPool(scene); if(typeof createEndUi==='function')createEndUi(scene);
  if(typeof showTitle==='function')showTitle(scene);else scene.run.phase=PHASE.TITLE;
  loadSave().then(v=>{scene.save=v;scene.run.tutorialSeen=v.tutorialSeen;}).catch(()=>{});
}
function update(time,delta){
  const scene=this;if(!scene.run)return;
  if((scene.run.phase===PHASE.TITLE||scene.run.phase===PHASE.ROSTER)&&typeof applyMenuInput==='function')applyMenuInput(scene,time);
  else if(scene.run.phase===PHASE.COUNT&&typeof updateCountdown==='function')updateCountdown(scene,delta);
  else if(scene.run.phase===PHASE.PLAY&&typeof updatePlaying==='function')updatePlaying(scene,delta);
  else if(scene.run.phase===PHASE.PAUSE&&typeof updatePause==='function')updatePause(scene);
  else if(scene.run.phase===PHASE.CONFIRM&&typeof updateConfirmation==='function')updateConfirmation(scene);
  else if(scene.run.phase===PHASE.INITIALS&&typeof updateInitials==='function')updateInitials(scene);
  clearPressedControls(scene);
}
```

- [ ] **Step 3: Add storage wrappers and input helpers**

```js
function normalizeIncomingKey(key) {
  if (typeof key !== 'string' || !key) return '';
  return key === ' ' ? 'space' : key.toLowerCase();
}
function isControlHeld(scene, code) { return scene.controls.held[code] === true; }
function consumePressed(scene, codes) {
  for (const code of codes) if (scene.controls.pressed[code]) {
    scene.controls.pressed[code] = false;
    return code;
  }
  return '';
}
function clearPressedControls(scene){ for(const k of Object.keys(scene.controls.pressed))scene.controls.pressed[k]=false; }
function storageApi() {
  if (window.platanusArcadeStorage) return window.platanusArcadeStorage;
  return {
    async get(k) { const v=localStorage.getItem(k); return { found:v!==null, value:v===null?null:JSON.parse(v) }; },
    async set(k,v) { localStorage.setItem(k,JSON.stringify(v)); },
  };
}
async function loadSave() {
  try {
    const r=await storageApi().get(SAVE_KEY), v=r && r.found ? r.value : null;
    return validateSave(v) ? v : { version:1, solo:[], coop:[], tutorialSeen:false };
  } catch (_) { return { version:1, solo:[], coop:[], tutorialSeen:false }; }
}
async function writeSave(v) { try { await storageApi().set(SAVE_KEY,v); return true; } catch (_) { return false; } }
```

- [ ] **Step 4: Run syntax, pure-state, and restrictions checks**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');
const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};
vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
const s=c.makeRunState('coop',123);
if(s.mode!=='coop'||s.speed!==220||s.players.length) throw Error('bad initial state');
if(!c.phaseAllowed('title','roster')||c.phaseAllowed('title','play')) throw Error('bad phase graph');
const [a,x]=c.rngStep(123),[b,y]=c.rngStep(123);
if(a!==b||x!==y) throw Error('rng is not deterministic');
if(!c.validateSave({version:1,solo:[],coop:[],tutorialSeen:false})) throw Error('valid save rejected');
if(c.validateSave({version:1,solo:[{tag:'BAD!',score:-1,mode:'solo',champions:[9]}],coop:[],tutorialSeen:false})) throw Error('bad save accepted');
NODE
npm run check-restrictions
```

Expected: both Node commands exit 0; restrictions pass; minified size is below 20 KB at this foundation milestone.

- [ ] **Step 5: Commit the foundation**

```bash
git add game.js
git commit -m "feat: establish Startup Run state foundation"
```

---

### Task 2: Build the procedural asset atlas

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: layer containers and constants from Task 1.
- Produces: `championSpecs()`, `assetKeys()`, `bananaRows()`, `ASSET_SIZE`, `makeTexture(scene, key, w, h, draw)`, `buildTextures(scene)`, `drawChampion(g, spec, pose)`, `drawChampionAccessory(g, key)`, `drawBanana(g, powered)`, `drawToken(g)`, `drawHelpSwitch(g)`, `drawEnemyAsset(g, key)`, `drawObstacleAsset(g, key)`, `drawWorldAsset(g, key)`, `drawApprovedAsset(g, key)`, and texture keys referenced by every later task.

- [ ] **Step 1: Run a failing manifest probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.championSpecs!=='function') throw Error('championSpecs missing');
if(typeof c.assetKeys!=='function') throw Error('assetKeys missing');
if(typeof c.bananaRows!=='function') throw Error('bananaRows missing');
NODE
```

Expected: FAIL with the first missing function.

- [ ] **Step 2: Add the compact champion and asset registries**

```js
function championSpecs() { return [
  ['Watermelon Tools','PIERCE',0x315d38,0xeab989,0x6cbf47,0x243c4a,0xe84954,'</>'],
  ['Vivvidero','REPAIR',0xd2693f,0xc98761,0xffd34d,0x31545a,0xffd34d,'⌂'],
  ['Blokay','OPTIMIZE',0x4f5fbb,0x9e684d,0xeef3e8,0x293552,0x55cdd1,'B'],
  ['Nodek','GLIDE',0x743f91,0xb7795b,0x211d2d,0x29263b,0xffd34d,'N'],
  ['Trutix','VERIFIED PASS',0x343a72,0xb97959,0x34223d,0x252b55,0xf16872,'T'],
  ['Plenti','GLOBAL PULL',0x314d78,0x8f5c45,0x2a1e32,0x202f50,0x8ef25f,'P'],
  ['Wizybot','SUPPORT SYNC',0x514b9e,0xd99b70,0x8b413e,0x302f59,0xff9c5b,'W'],
  ['Runni','BATTERY KICK',0x315466,0xa56c4f,0xffb229,0x263b4b,0x2672d8,'R'],
]; }
function assetKeys() { return [
  ...Array.from({length:8},(_,i)=>['idle','runA','runB','jump','fire','hit','ghost','revive'].map(p=>`champ${i}-${p}`)).flat(),
  'wizyCompanion','banana','bananaPower','token','bug','stamp','pigeon','drone','smog','pothole','barricade','barrier','help',
  'roofA','roofB','shopCorner','shopCafe','shopBike','shopHands','busFront','busJoint','busRear',
  'stationDoor','stationSign','turnstile','bridge','catwalk','scaffold','landing','clouds',
  'lamp','streetSign','bollard','bin','bench','planter','bikeRack','utility','monserrate'
]; }
const ASSET_SIZE={
  wizyCompanion:[28,24],token:[16,16],help:[40,40],bug:[48,32],stamp:[48,48],pigeon:[64,28],drone:[48,32],smog:[56,32],
  pothole:[64,18],barricade:[64,32],barrier:[96,28],roofA:[160,96],roofB:[160,96],
  shopCorner:[160,96],shopCafe:[160,96],shopBike:[160,96],shopHands:[160,96],
  busFront:[160,72],busJoint:[48,72],busRear:[160,72],stationDoor:[96,72],stationSign:[80,40],turnstile:[48,48],
  bridge:[160,64],catwalk:[128,48],scaffold:[96,96],landing:[96,24],lamp:[32,96],streetSign:[40,64],
  clouds:[160,64],bollard:[20,32],bin:[28,40],bench:[64,40],planter:[48,40],bikeRack:[64,32],utility:[40,48],monserrate:[240,128]
};
function bananaRows() { return [
  '............ooo.....','...........obbbo....','...........bbbbo....','...........ogggbo...',
  '..........oggyyooo..','..........oYYyssoo..','..........oYYwsssoo.','.........oYYYwyssoo.',
  '.........oYYwYyssoo.','.......oYYYYwysssoo.','....oYYYYYwYYyssoo..','..oYYYYYwYYyyssooo..',
  '.bbyyYYYyyyssoooo...','..obbyysssooooo.....','....oooooooo........','....................'
]; }
```

Use a shared `drawChampion` body recipe at 32×48 logical pixels and accessory branches keyed by champion index. Draw visible white eyes, matching eyebrows, centered chest marks, exact locked helmets/packs/panels, and the same raised-arm jump. Nodek’s wings remain behind the torso and inside bounds. Generate idle, two run frames, jump, fire, hit, ghost, and revive frame variants through pose offsets rather than duplicate textures wherever Phaser transforms can provide the state.

- [ ] **Step 3: Add texture helpers and exact approved primitive drawers**

```js
function makeTexture(scene,key,w,h,draw) {
  const g=scene.make.graphics({x:0,y:0,add:false});
  draw(g); g.generateTexture(key,w,h); g.destroy();
}
function px(g,color,x,y,w=1,h=1){ g.fillStyle(color,1).fillRect(x,y,w,h); }
function drawBanana(g,powered=false) {
  const pal=powered
    ?{o:0x5b351d,b:0x8d551e,g:0xd8f226,y:0xe1ff00,Y:0xf2ff72,s:0x9fc52b,w:0xffffff}
    :{o:0x5b351d,b:0x8d551e,g:0xa9c91a,y:0xffc42c,Y:0xffe01b,s:0xf29b18,w:0xfff7cf};
  bananaRows().forEach((row,y)=>[...row].forEach((v,x)=>{ if(v!=='.') px(g,pal[v],x,y); }));
}
function buildTextures(scene){
  championSpecs().forEach((spec,i)=>['idle','runA','runB','jump','fire','hit','ghost','revive'].forEach(pose=>
    makeTexture(scene,`champ${i}-${pose}`,32,48,g=>drawChampion(g,spec,pose))));
  makeTexture(scene,'banana',20,16,g=>drawBanana(g,false));
  makeTexture(scene,'bananaPower',20,16,g=>drawBanana(g,true));
  for(const key of assetKeys().filter(k=>!k.startsWith('champ')&&!k.startsWith('banana'))){
    const size=ASSET_SIZE[key];
    makeTexture(scene,key,size[0],size[1],g=>drawApprovedAsset(g,key));
  }
}
```

Define `ASSET_SIZE`, `drawChampion`, and `drawApprovedAsset` immediately above `buildTextures`. Translate the final reference files from the Approved visual reference index in this order: shared four-pixel outline and 8×10 window primitive; champion base and accessories; roof/shop/street modules; bus/station/scaffolding/Monserrate; props; enemies; obstacles; token; Help Switch; effects. Use only `fillRect`, `fillTriangle`, `fillCircle`, `lineBetween`, and integer coordinates. `drawApprovedAsset` must exhaustively switch over every non-champion key returned by `assetKeys()` and throw for an unknown key, so a missing drawing fails during boot instead of silently producing an empty texture:

```js
function drawApprovedAsset(g,key){
  switch(key){
    case 'token': return drawToken(g);
    case 'help': return drawHelpSwitch(g);
    case 'wizyCompanion': return drawChampionAccessory(g,key);
    case 'bug': case 'stamp': case 'pigeon': case 'drone': case 'smog': return drawEnemyAsset(g,key);
    case 'pothole': case 'barricade': case 'barrier': return drawObstacleAsset(g,key);
    case 'roofA': case 'roofB': case 'shopCorner': case 'shopCafe': case 'shopBike': case 'shopHands':
    case 'busFront': case 'busJoint': case 'busRear': case 'stationDoor': case 'stationSign': case 'turnstile':
    case 'bridge': case 'catwalk': case 'scaffold': case 'landing': case 'clouds': case 'lamp': case 'streetSign': case 'bollard':
    case 'bin': case 'bench': case 'planter': case 'bikeRack': case 'utility': case 'monserrate': return drawWorldAsset(g,key);
    default: throw Error(`unmapped approved asset: ${key}`);
  }
}
```

Do not create a hanging-sign texture or a face-bearing banana texture. Compare the generated atlas against the final references at 1× and 4× nearest-neighbor scale before the checkpoint.

- [ ] **Step 4: Run registry and banana-map probes**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
const names=c.championSpecs().map(x=>x[0]);
if(names.join('|')!=='Watermelon Tools|Vivvidero|Blokay|Nodek|Trutix|Plenti|Wizybot|Runni') throw Error('roster mismatch');
const keys=c.assetKeys();
for(const k of ['banana','token','bug','stamp','pigeon','drone','barricade','monserrate']) if(!keys.includes(k)) throw Error('missing '+k);
if(keys.some(k=>/hanging|cableSign/i.test(k))) throw Error('rejected sign present');
const rows=c.bananaRows(); if(rows.length!==16||rows.some(r=>r.length!==20)) throw Error('banana must be 20x16');
NODE
npm run check-restrictions
```

Expected: all pass; minified size remains below 27 KB.

- [ ] **Step 5: Ask for one visual atlas checkpoint and commit**

Ask the user to run the existing dev UI. Inspect an internal atlas/debug phase showing the eight exact champions, Pixel Banana V3, enemies, obstacles, rooftops/windows, bus, and Monserrate. Fix any divergence before committing.

```bash
git add game.js
git commit -m "feat: add approved procedural asset atlas"
```

---

### Task 3: Implement title, mode, roster, and countdown flow

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: `PHASE`, champion textures/specs, input helpers, loaded save data.
- Produces: `screen(scene, name)`, `showScreen(scene, name)`, `createTitleUi(scene)`, `createRosterUi(scene)`, `createCountdownUi(scene)`, `refreshTitleUi(scene)`, `refreshRosterUi(scene)`, `refreshCountdownUi(scene, copy)`, `menuMove(index, delta, length)`, `distinctPick(picks, player, next)`, `rosterReady(run)`, `applyMenuInput(scene, time)`, `showTitle(scene)`, `showRoster(scene)`, `startCountdown(scene, compact)`, and `updateCountdown(scene, dt)`.

- [ ] **Step 1: Write a failing menu reducer probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.menuMove!=='function') throw Error('menuMove missing');
NODE
```

Expected: FAIL.

- [ ] **Step 2: Add pure selection behavior**

```js
function menuMove(i,d,n){ return (i+d+n)%n; }
function distinctPick(picks,player,next){
  const out=picks.slice();
  if(out[1-player]===next) next=menuMove(next,1,8);
  out[player]=next; return out;
}
```

Create every screen once and toggle containers instead of reallocating text. Title uses the approved `STARTUP RUN! BOGOTÁ` treatment, Solo/Co-op cards, yellow selection, Spanish copy, and cabinet prompt. Its surrounding environment must call the exact world textures from Task 2; do not rebuild approximate bus, windows, building, champion, or Monserrate shapes inside the UI function.

```js
function screen(scene,name){
  if(!scene.screens[name]) scene.screens[name]=scene.add.container(0,0).setDepth(1000).setVisible(false);
  return scene.screens[name];
}
function showScreen(scene,name){
  Object.values(scene.screens).forEach(x=>x.setVisible(false));
  screen(scene,name).setVisible(true);
}
function createTitleUi(scene){
  const c=screen(scene,'title'),sky=scene.add.rectangle(400,300,800,600,0x78c8e8),hill=scene.add.image(675,170,'monserrate'),roof=scene.add.image(160,520,'roofA'),bus=scene.add.container(535,470,[scene.add.image(0,0,'busFront'),scene.add.image(104,0,'busJoint'),scene.add.image(208,0,'busRear')]);
  const title=scene.add.text(400,70,'STARTUP RUN!\nBOGOTÁ',Object.assign({fontSize:'42px',align:'center',color:'#e1ff00',stroke:'#17222c',strokeThickness:8},TXT)).setOrigin(.5,0);
  const cards=[0,1].map((_,i)=>({box:scene.add.rectangle(400,260+i*78,360,58,0x193244,.96).setStrokeStyle(4,0x41586a),label:scene.add.text(400,260+i*78,i?'CO-OP RUN · DOS RUTAS':'SOLO RUN · UNA RUTA',Object.assign({fontSize:'20px'},TXT)).setOrigin(.5)}));
  c.add([sky,hill,roof,bus,title,...cards.flatMap(x=>[x.box,x.label]),scene.add.text(400,440,'JOYSTICK ELIGE · BOTÓN 1 CONFIRMA',Object.assign({fontSize:'15px'},TXT)).setOrigin(.5)]);scene.ui.titleCards=cards;
}
function refreshTitleUi(scene){ scene.ui.titleCards.forEach((x,i)=>{const on=i===scene.run.resultCursor;x.box.setStrokeStyle(4,on?0xe1ff00:0x41586a);x.label.setColor(on?'#e1ff00':'#f8f3d4');}); }
function createRosterUi(scene){
  const c=screen(scene,'roster');c.add([scene.add.rectangle(400,300,800,600,0x101c29,.98),scene.add.text(400,24,'ELIGE TU STARTUP',Object.assign({fontSize:'28px',color:'#e1ff00'},TXT)).setOrigin(.5,0)]);
  scene.ui.rosterCards=championSpecs().map((s,i)=>{const x=120+(i%4)*188,y=125+Math.floor(i/4)*205,box=scene.add.rectangle(x,y,170,184,0x1a3040).setStrokeStyle(3,0x496477),hero=scene.add.image(x,y-36,`champ${i}-idle`).setScale(1.35),name=scene.add.text(x,y+28,s[0].toUpperCase(),Object.assign({fontSize:'13px',align:'center',wordWrap:{width:154}},TXT)).setOrigin(.5,0),power=scene.add.text(x,y+70,s[1],Object.assign({fontSize:'11px',color:'#e1ff00'},TXT)).setOrigin(.5);c.add([box,hero,name,power]);return{box,hero,name,power};});
  scene.ui.rosterCursors=[scene.add.rectangle(0,0,178,192).setStrokeStyle(4,0xe1ff00).setFillStyle(0,0),scene.add.rectangle(0,0,184,198).setStrokeStyle(4,0xff69bf).setFillStyle(0,0)];c.add(scene.ui.rosterCursors);
}
function refreshRosterUi(scene){
  scene.ui.rosterCursors.forEach((q,i)=>{const card=scene.ui.rosterCards[scene.run.selected[i]];q.setPosition(card.box.x,card.box.y).setVisible(i===0||scene.run.mode===MODE.COOP).setAlpha(scene.run.locked[i] ? 0.45 : 1);});
}
function createCountdownUi(scene){ const c=screen(scene,'countdown');c.add(scene.add.rectangle(400,300,800,600,0x07131d,.78));scene.ui.countText=scene.add.text(400,260,'',Object.assign({fontSize:'42px',align:'center',color:'#e1ff00',stroke:'#17222c',strokeThickness:7},TXT)).setOrigin(.5);c.add(scene.ui.countText); }
function refreshCountdownUi(scene,copy){ scene.ui.countText.setText(copy); }
function showTitle(scene){ scene.run.phase=PHASE.TITLE; showScreen(scene,'title'); refreshTitleUi(scene); }
function showRoster(scene){ scene.run.phase=PHASE.ROSTER; showScreen(scene,'roster'); refreshRosterUi(scene); }
function applyMenuInput(scene){
  if(scene.run.phase===PHASE.TITLE){
    const u=consumePressed(scene,['P1_U','P2_U']),d=consumePressed(scene,['P1_D','P2_D']),ok=consumePressed(scene,['P1_1','P2_1']);
    if(u||d) scene.run.resultCursor=menuMove(scene.run.resultCursor,u?-1:1,2);
    if(ok){ scene.run.mode=scene.run.resultCursor?MODE.COOP:MODE.SOLO; showRoster(scene); }
    refreshTitleUi(scene);
  }else if(scene.run.phase===PHASE.ROSTER){
    const active=scene.run.mode===MODE.COOP?2:1;
    for(let p=0;p<active;p++){
      const pre=p?'P2_':'P1_',left=consumePressed(scene,[pre+'L']),right=consumePressed(scene,[pre+'R']),upP=consumePressed(scene,[pre+'U']),downP=consumePressed(scene,[pre+'D']);
      let n=scene.run.selected[p];if(left)n=menuMove(n,-1,8);if(right)n=menuMove(n,1,8);if(upP)n=menuMove(n,-4,8);if(downP)n=menuMove(n,4,8);scene.run.selected=distinctPick(scene.run.selected,p,n);
      if(consumePressed(scene,[pre+'1']))scene.run.locked[p]=true;
    }
    if(consumePressed(scene,['START1','START2']))return showTitle(scene);
    refreshRosterUi(scene);if(rosterReady(scene.run)){
      if(typeof createWorld==='function'){createWorld(scene);createPlayers(scene);wireGameplayCollisions(scene);createHud(scene);}
      startCountdown(scene,scene.save.tutorialSeen);
    }
  }
}
```

- [ ] **Step 3: Build the exact 4×2 roster screen**

Use the champion textures from Task 2 at identical scale. P1 lime and P2 pink cursors move independently; `distinctPick` prevents duplicates. Each card displays exact name, role, and passive. Solo hides P2. Confirmation enters countdown only when every active player is locked.

```js
function rosterReady(run){ return run.mode===MODE.SOLO ? !!run.locked?.[0] : !!run.locked?.[0]&&!!run.locked?.[1]; }
```

`createRosterUi` creates eight card containers once from `championSpecs()`. Store cursor rectangles in `scene.ui.rosterCursors`, card text in `scene.ui.rosterDetails`, and lock flags in `scene.run.locked=[false,false]`. Route P1 joystick/actions only to index 0 and P2 only to index 1; call `distinctPick` after each movement and `rosterReady` after each lock.

- [ ] **Step 4: Build the full and compact countdowns**

Full co-op sequence: `3` lane identification, `2` Button 1 jump, `1` Button 2 banana, `¡CORRE!` activate. Solo hides P2 and expands P1. When `save.tutorialSeen` is true, either action button selects the compact one-second sequence. Inputs, physics, scrolling, spawns, and scoring remain disabled until the final beat.

```js
function startCountdown(scene,compact=false){
  scene.run.phase=PHASE.COUNT; scene.run.countMs=0; scene.run.countCompact=compact;
  scene.physics.pause(); showScreen(scene,'countdown'); refreshCountdownUi(scene,compact?'3':'3 · TECHO / CALLE');
}
function updateCountdown(scene,dt){
  scene.run.countMs+=dt;
  const t=scene.run.countMs, compact=scene.run.countCompact;
  const beat=compact?(t<333?'3':t<666?'2':t<1000?'1':'¡CORRE!'):
    (t<750?'3 · TECHO / CALLE':t<1500?'2 · BOTÓN 1 SALTA':t<2250?'1 · BOTÓN 2 BANANA':'¡CORRE!');
  refreshCountdownUi(scene,beat);
  if(t>=(compact?1200:2700)){ scene.physics.resume(); scene.run.phase=PHASE.PLAY; scene.screens.countdown.setVisible(false); }
}
```

- [ ] **Step 5: Run reducer, syntax, and restriction checks**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(c.menuMove(0,-1,2)!==1||c.menuMove(1,1,2)!==0) throw Error('menu wrap broken');
const p=c.distinctPick([0,1],0,1); if(p[0]===p[1]) throw Error('duplicate champion allowed');
if(!c.rosterReady({mode:'solo',locked:[true,false]})||c.rosterReady({mode:'coop',locked:[true,false]})) throw Error('roster readiness broken');
NODE
npm run check-restrictions
```

- [ ] **Step 6: User checkpoint and commit**

Ask the user to test mode selection, both independent roster cursors, no duplicate champion selection, full tutorial countdown, and compact repeat countdown.

```bash
git add game.js
git commit -m "feat: add mode roster and countdown flow"
```

---

### Task 4: Build the pooled Bogotá world and safe pattern generator

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: approved world textures and seeded RNG.
- Produces: `difficultyAt(ms)`, `laneChoice(seed, difficulty, lane)`, `nextPattern(seed, difficulty, mode)`, `patternSafe(pattern, mode)`, `simulatePatterns(seed, seconds, mode)`, `createWorld(scene)`, `resetWorld(scene)`, `spawnSegment(scene, lane, recipe)`, `composeApprovedSegment(scene, segment, recipe)`, `recycleSegment(scene, segment)`, `updateWorld(scene, dt)`, `pickWeather(seed)`, `updateWeather(scene, dt)`, and `applyWeatherVisuals(scene, weather)`.

- [ ] **Step 1: Run a failing deterministic-generator probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.nextPattern!=='function'||typeof c.simulatePatterns!=='function') throw Error('generator missing');
NODE
```

Expected: FAIL.

- [ ] **Step 2: Implement difficulty, pattern vocabulary, and safety rules**

```js
function difficultyAt(ms){
  const t=Math.min(1,ms/180000);
  return { level:Math.min(5,Math.floor(ms/30000)), speed:220+160*t, reaction:Math.max(.82,1.35-.45*t) };
}
const PATTERNS=[
  {id:'flat',min:0,jump:0},{id:'tokens',min:0,jump:0},{id:'gap',min:0,jump:1,route:'roof'},
  {id:'bug',min:1,jump:0},{id:'pothole',min:1,jump:1,route:'street'},
  {id:'barricade',min:2,jump:1,route:'street'},{id:'pigeons',min:2,jump:0},
  {id:'ledge',min:3,jump:1,route:'roof'},{id:'stamp',min:3,jump:0},
  {id:'barrier',min:4,jump:1,route:'street'},{id:'drone',min:4,jump:0}
];
function laneChoice(seed,d,lane){
  const a=PATTERNS.filter(p=>p.min<=d.level&&(!p.route||p.route===lane));
  const q=rngStep(seed); return [q[0],a[Math.floor(q[1]*a.length)]];
}
function patternSafe(p,mode){
  if(!p||!Array.isArray(p.lanes)||p.lanes.length!==(mode===MODE.COOP?2:1)) return false;
  if(p.quietMs<820||p.lanes.some(x=>!x||x.jump>1)) return false;
  if(mode!==MODE.COOP&&p.help) return false;
  return !p.lanes.some(x=>x.id==='gap'&&x.enemy);
}
function nextPattern(seed,d,mode){
  let q=laneChoice(seed,d,mode===MODE.COOP?'roof':'solo'), roof=q[1]; seed=q[0];
  if(mode===MODE.SOLO){
    const all=PATTERNS.filter(x=>x.min<=d.level),r=rngStep(seed); seed=r[0]; roof=all[Math.floor(r[1]*all.length)];
    return [seed,{lanes:[roof],quietMs:Math.ceil(d.reaction*1000),help:false}];
  }
  q=laneChoice(seed,d,'street'); seed=q[0]; const street=q[1];
  q=rngStep(seed); seed=q[0];
  return [seed,{lanes:[roof,street],quietMs:Math.ceil(d.reaction*1000),help:d.level>1&&q[1]<.12}];
}
function simulatePatterns(seed,seconds,mode){
  let count=0; for(let t=0;t<seconds*1000;t+=900){ const q=nextPattern(seed,difficultyAt(t),mode); seed=q[0]; if(!patternSafe(q[1],mode)) return {valid:false,count}; count++; }
  return {valid:true,count,seed};
}
```

`spawnSegment` converts `quietMs` to approach pixels using current speed. Every lane adds that clear approach plus at least 96 clear landing pixels; the scheduler may decorate these areas but cannot attach another colliding object. Help targets the opposite lane and never replaces its lane recipe.

- [ ] **Step 3: Build pooled world layers**

Create 10 recyclable segment containers per lane. Each segment composes exact roof, shop, street, station, bus, scaffold, skyline, or prop textures. Reposition the leftmost segment after it exits; never destroy and recreate it. Solo varies one full-height route. Co-op uses upper roof and lower street routes.

```js
const LANE_Y={solo:470,roof:255,street:500};
function createWorld(scene){
  scene.world={nextX:{solo:0,roof:0,street:0},spawnLock:[0,0],segments:[],weather:{kind:0,next:10000,mix:0}};
  scene.world.sky=scene.add.rectangle(400,300,800,600,WEATHER[0][2]);scene.layers.sky.add(scene.world.sky);
  scene.world.clouds=scene.add.tileSprite(400,110,800,160,'clouds').setAlpha(0);scene.layers.far.add(scene.world.clouds);
  scene.world.rain=scene.add.graphics().setAlpha(0);for(let x=8;x<800;x+=37)scene.world.rain.lineStyle(1,0xc8eef2,.7).lineBetween(x,0,x-12,46);scene.layers.fx.add(scene.world.rain);
  scene.world.sheen=scene.add.rectangle(400,520,800,22,0xbde5e5,.25).setAlpha(0);scene.layers.far.add(scene.world.sheen);
  const lanes=scene.run.mode===MODE.COOP?['roof','street']:['solo'];
  lanes.forEach((lane,li)=>{ for(let i=0;i<10;i++){
    const c=scene.add.container(i*160,LANE_Y[lane]).setDepth(20+li);
    scene.layers.world.add(c); scene.world.segments.push({c,lane,width:160,active:false,objects:[]});
  }});
  resetWorld(scene);
}
function resetWorld(scene){
  scene.world.nextX={solo:1600,roof:1600,street:1600}; scene.world.spawnLock.fill(0);
  scene.world.segments.forEach((s,i)=>{ s.c.x=(i%10)*160; s.active=true; s.objects.forEach(o=>o.disableBody(true,true));s.objects=[];s.c.removeAll(true);composeApprovedSegment(scene,s,{id:'flat',jump:0}); });
}
function spawnSegment(scene,lane,recipe){
  const s=scene.world.segments.filter(x=>x.lane===lane).sort((a,b)=>a.c.x-b.c.x)[0];
  const d=difficultyAt(scene.run.time), approach=Math.ceil(d.speed*d.reaction);
  s.objects.forEach(o=>o.disableBody(true,true));s.objects=[];s.c.x=scene.world.nextX[lane]+approach;s.width=160+approach+96;s.c.removeAll(true);
  composeApprovedSegment(scene,s,recipe); scene.world.nextX[lane]=s.c.x+s.width; return s;
}
function composeApprovedSegment(scene,s,recipe){
  const roof=s.lane==='roof'||s.lane==='solo',skin=roof?(recipe.id==='ledge'?'roofB':'roofA'):(recipe.id==='barrier'?'stationDoor':'shopCorner');
  const count=Math.ceil(s.width/160);for(let i=0;i<count;i++)s.c.add(scene.add.image(i*160+80,-48,skin).setOrigin(.5));
  s.recipe=recipe;s.objects=[];
  if(recipe.id!=='gap'){
    const ground=scene.pool.surfaces.get(s.c.x+s.width/2,LANE_Y[s.lane],roof?'roofA':'landing').setActive(true).setVisible(false);
    ground.setDisplaySize(s.width,20).refreshBody();s.objects.push(ground);
  }
}
function recycleSegment(scene,s){
  const d=difficultyAt(scene.run.time),q=nextPattern(scene.run.seed,d,scene.run.mode);scene.run.seed=q[0];
  const laneIndex=scene.run.mode===MODE.COOP?(s.lane==='roof'?0:1):0;spawnSegment(scene,s.lane,q[1].lanes[laneIndex]);
}
function updateWorld(scene,dt){
  const dx=difficultyAt(scene.run.time).speed*dt/1000;
  scene.world.segments.forEach(s=>{ s.c.x-=dx;s.objects.forEach(o=>{o.x-=dx;if(o.refreshBody)o.refreshBody();});if(s.c.x+s.width<0)recycleSegment(scene,s); });
  updateWeather(scene,dt);
}
```

`composeApprovedSegment` uses only Task 2 textures: Module A windows, skyline pane grid, TransMilenio modules, Monserrate, shops, station kit, scaffolding kit, and street props. It records collision surfaces and spawned objects in `s.objects` so recycling disables all children and bodies.

- [ ] **Step 4: Add cosmetic weather state**

Use weighted states `[55,20,20,5]` for clear, cloud, drizzle, and sun break. Cross-fade sky tint, clouds, sparse diagonal rain, and road sheen over 8–12 seconds. Do not modify velocity, gravity, collision, contrast of active entities, or obstacle selection.

```js
const WEATHER=[['clear',55,0x78c8e8],['cloud',20,0x91a9b5],['drizzle',20,0x829aa8],['sun',5,0x8fd4e6]];
function pickWeather(seed){
  const q=rngStep(seed); let n=q[1]*100;
  for(let i=0;i<WEATHER.length;i++){ n-=WEATHER[i][1]; if(n<0)return[q[0],i]; }
  return[q[0],0];
}
function updateWeather(scene,dt){
  const w=scene.world.weather; w.next-=dt;
  if(w.next<=0){ const q=pickWeather(scene.run.seed); scene.run.seed=q[0]; w.from=w.kind; w.kind=q[1]; w.mix=0; w.duration=8000+q[1]*1000; w.next=w.duration+10000; }
  w.mix=Math.min(1,w.mix+dt/(w.duration||8000)); applyWeatherVisuals(scene,w);
}
function applyWeatherVisuals(scene,w){
  const a=WEATHER[w.from??w.kind],b=WEATHER[w.kind],c=Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.ValueToColor(a[2]),Phaser.Display.Color.ValueToColor(b[2]),100,Math.floor(w.mix*100));
  scene.world.sky.setFillStyle(Phaser.Display.Color.GetColor(c.r,c.g,c.b));scene.world.clouds.setAlpha(w.kind===1||w.kind===2 ? 0.72 : 0);scene.world.rain.setAlpha(w.kind===2 ? 0.62 : 0);scene.world.sheen.setAlpha(w.kind===2||w.kind===3 ? 0.32 : 0);
}
```

- [ ] **Step 5: Simulate long runs and verify restrictions**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
for(const mode of ['solo','coop']) for(let seed=1;seed<=100;seed++){
  const r=c.simulatePatterns(seed,600,mode); if(!r.valid||r.count<600) throw Error(`unsafe ${mode} seed ${seed}`);
}
const a=c.difficultyAt(0),b=c.difficultyAt(180000); if(a.speed!==220||b.speed!==380) throw Error('speed curve wrong');
NODE
npm run check-restrictions
```

- [ ] **Step 6: Commit the world generator**

```bash
git add game.js
git commit -m "feat: add pooled Bogota route generator"
```

---

### Task 5: Implement champions, physics, health, and all eight powers

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: champion specs/textures, route surfaces, input state.
- Produces: `makePlayerModel(id, champion, laneY)`, `powerStep(player, event)`, `createPlayers(scene)`, `updatePlayers(scene, dt)`, `jumpPlayer(player)`, `damagePlayer(scene, player, source)`, `landPlayer(player)`, `applyChampionEvent(scene, player, event, target)`, `repairLedge(scene, target)`, and `refreshChampionCooldowns(scene)`.

- [ ] **Step 1: Run a failing pure-power probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.makePlayerModel!=='function'||typeof c.powerStep!=='function') throw Error('player power model missing');
NODE
```

- [ ] **Step 2: Add the testable player and passive model**

```js
function makePlayerModel(id,champion,laneY){ return {
  id,champion,laneY,hearts:2,alive:true,ghost:false,grounded:true,vy:0,
  invulnerableUntil:0,shots:0,powerCount:0,boostUsed:false,phaseReady:true,
  repairReady:true,reviveMs:0,shieldMs:0,
}; }
function powerStep(p,event){
  if(event==='shot'){ p.shots++; return p.champion===0&&p.shots%5===0?'pierce':p.champion===6&&p.shots%4===0?'copy':'normal'; }
  if(event==='airAction'&&p.champion===7&&!p.boostUsed){ p.boostUsed=true; return 'boost'; }
  if(event==='land'){ p.boostUsed=false; return 'land'; }
  if(event==='obstacle'&&p.champion===4&&p.phaseReady){ p.phaseReady=false; return 'phase'; }
  if(event==='broken'&&p.champion===1&&p.repairReady){ p.repairReady=false; return 'repair'; }
  return '';
}
```

- [ ] **Step 3: Implement Arcade Physics movement and health**

Set gravity to 1250 px/s², jump velocity to −470 px/s, and a forgiving 20×40 body centered inside the 32×48 art. Nodek hold reduces positive descent velocity; Runni boost applies one −260 px/s impulse per airborne cycle. On damage, remove one heart, reset combo, flash three times, nudge camera no more than four pixels, and set 1000 ms of invulnerability. Falling below the route calls the down flow immediately.

```js
function createPlayers(scene){
  const ys=scene.run.mode===MODE.COOP?[LANE_Y.roof,LANE_Y.street]:[LANE_Y.solo];
  scene.run.players=ys.map((y,i)=>{
    const p=makePlayerModel(i,scene.run.selected[i],y),s=scene.physics.add.sprite(150+i*18,y-24,`champ${p.champion}-idle`);
    s.body.setSize(20,40).setOffset(6,8).setGravityY(1250); s.setCollideWorldBounds(false); p.sprite=s;
    if(p.champion===6)p.companion=scene.add.image(s.x-30,s.y-18,'wizyCompanion').setDepth(s.depth+1);return p;
  });
}
function jumpPlayer(p){ if(!p.alive)return false; if(p.grounded){ p.sprite.setVelocityY(-470); p.grounded=false; return true; } return powerStep(p,'airAction')==='boost'&&(p.sprite.setVelocityY(-260),true); }
function landPlayer(p){ p.grounded=true; p.sprite.setVelocityY(0); powerStep(p,'land'); }
function damagePlayer(scene,p,source){
  if(!p.alive||scene.run.time<p.invulnerableUntil||p.shieldMs>0)return false;
  if(source&&source.kind==='obstacle'&&applyChampionEvent(scene,p,'obstacle',source)==='phase')return false;
  p.hearts--; p.invulnerableUntil=scene.run.time+1000; scene.run.combo=1; scene.run.comboMs=0;
  p.sprite.setTintFill(0xffffff); scene.time.delayedCall(90,()=>p.sprite.clearTint()); scene.cameras.main.shake(80,.004);
  if(p.hearts<=0)downPlayer(scene,p); return true;
}
function updatePlayers(scene,dt){
  scene.run.players.forEach((p,i)=>{
    if(!p.alive)return;
    const jump=consumePressed(scene,[i?'P2_1':'P1_1']); if(jump)jumpPlayer(p);
    if(p.champion===3&&!p.grounded&&p.sprite.body.velocity.y>0&&isControlHeld(scene,i?'P2_1':'P1_1')) p.sprite.body.velocity.y=Math.min(150,p.sprite.body.velocity.y);
    if(p.companion)p.companion.setPosition(p.sprite.x-30,p.sprite.y-18+Math.sin(scene.run.time/120)*3);
    if(consumePressed(scene,[i?'P2_2':'P1_2']))fireBanana(scene,p);
    p.shieldMs=Math.max(0,p.shieldMs-dt); if(p.sprite.y>H+40)downPlayer(scene,p);
  });
}
```

- [ ] **Step 4: Wire all eight passives**

- Watermelon: `powerStep('shot') === 'pierce'` creates `bananaPower` and does not recycle on enemy collision.
- Vivvidero: convert the next eligible cracked ledge to its repaired frame and solid state; reset after a fixed cooldown.
- Blokay: multiply banana velocity and combo duration by compact constants.
- Nodek: hold Button 1 after apex to cap descent velocity and show exact wings.
- Trutix: first obstacle collision while ready produces pass FX without damage; recharge visibly by distance.
- Plenti: move tokens inside fixed radius toward player, capped so tokens cannot teleport through hazards.
- Wizybot: spawn the approved separate companion and copy shot four from its position.
- Runni: one additional Button 1 impulse before landing, then reset.

Route all passive decisions through one dispatcher; distance cooldowns are 1400 px for Vivvidero and 1200 px for Trutix, and are reset only after their effect is consumed:

```js
function applyChampionEvent(scene,p,event,target){
  const out=powerStep(p,event);
  if(out==='repair'){ repairLedge(scene,target); p.repairAt=scene.run.distance+1400; }
  if(out==='phase'){ spawnFx(scene,'phase',p.sprite.x,p.sprite.y); p.phaseAt=scene.run.distance+1200; }
  if(out==='pierce'||out==='copy')return out;
  return out;
}
function repairLedge(scene,target){
  if(!target||target.data.values.type!=='ledge'||target.data.values.state==='fallen')return false;
  target.data.values.state='repaired'; target.data.values.ms=0; target.body.enable=true; target.clearTint(); spawnFx(scene,'repair',target.x,target.y); return true;
}
function refreshChampionCooldowns(scene){
  scene.run.players.forEach(p=>{
    if(p.champion===1&&!p.repairReady&&scene.run.distance>=p.repairAt)p.repairReady=true;
    if(p.champion===4&&!p.phaseReady&&scene.run.distance>=p.phaseAt)p.phaseReady=true;
  });
}
```

- [ ] **Step 5: Run passive probes**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
let p=c.makePlayerModel(0,0,200); for(let i=0;i<4;i++) if(c.powerStep(p,'shot')!=='normal') throw Error('early pierce'); if(c.powerStep(p,'shot')!=='pierce') throw Error('fifth shot');
p=c.makePlayerModel(0,6,200); for(let i=0;i<3;i++) c.powerStep(p,'shot'); if(c.powerStep(p,'shot')!=='copy') throw Error('Wizy copy');
p=c.makePlayerModel(0,7,200); if(c.powerStep(p,'airAction')!=='boost'||c.powerStep(p,'airAction')==='boost') throw Error('Runni double boost'); c.powerStep(p,'land'); if(c.powerStep(p,'airAction')!=='boost') throw Error('Runni reset');
p=c.makePlayerModel(0,4,200); if(c.powerStep(p,'obstacle')!=='phase'||c.powerStep(p,'obstacle')==='phase') throw Error('Trutix phase');
NODE
npm run check-restrictions
```

- [ ] **Step 6: Commit champion gameplay**

```bash
git add game.js
git commit -m "feat: add champion physics and powers"
```

---

### Task 6: Add enemies and physical obstacles

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: world segment spawn requests, pooled textures, player damage.
- Produces: `enemySpec(type)`, `obstacleSpec(type)`, `takePooled(scene, pool, texture)`, `recycleBody(body)`, `spawnEnemy(scene, type, lane, x)`, `spawnObstacle(scene, type, lane, x)`, `updateEnemies(scene, dt)`, `updateObstacles(scene, dt)`, `hitEnemy(scene, enemy, shot)`, `scatterPigeons(scene, enemy, defeated)`, and `spawnSmogCloud(scene, enemy)`.

- [ ] **Step 1: Run a failing combat-spec probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.enemySpec!=='function'||typeof c.obstacleSpec!=='function') throw Error('combat specs missing');
NODE
```

- [ ] **Step 2: Define exact enemy and obstacle data**

```js
function enemySpec(t){ return ({
  bug:{hp:1,score:SCORE.bug,w:48,h:32,telegraph:420},
  stamp:{hp:2,score:SCORE.stamp,w:48,h:48,telegraph:700},
  pigeon:{hp:1,score:SCORE.pigeon,w:64,h:28,telegraph:520,scatter:true},
  drone:{hp:1,score:SCORE.drone,w:48,h:32,telegraph:620},
})[t]; }
function obstacleSpec(t){ return ({
  pothole:{w:64,h:18,route:'street'}, barricade:{w:64,h:32,route:'street'},
  gap:{w:72,h:1,route:'roof'}, ledge:{w:58,h:1,route:'roof',grace:350},
  barrier:{w:96,h:28,route:'street',cycle:[1200,500,1000,500]},
})[t]; }
```

- [ ] **Step 3: Implement approved enemy state machines**

- Code Bug: crawl, antenna blink, one low hop, one hit, three-pixel destruction.
- Stamp Bot: roll, stop, yellow lamp/raised arm/red ground marker, slam, two hits; first hit interrupts, second emits `APROBADO` receipt.
- Pigeons: perched group, synchronized head turn/chirp, predictable upward fan, banana scatter without defeat framing.
- Smog Drone: hover bob, yellow nozzle warning, one rearward purple cloud lasting one second, one-hit tumble.

All warning art is non-colliding. Cloud collision never overlaps another hazard or hides a landing.

```js
function takePooled(scene,pool,texture){
  let s=pool.getFirstDead(false); if(!s)s=scene.physics.add.sprite(-100,-100,texture);
  if(!pool.contains(s))pool.add(s); return s.setTexture(texture).setActive(true).setVisible(true).clearTint();
}
function recycleBody(o){ o.setActive(false).setVisible(false).setVelocity(0,0); if(o.body)o.body.enable=false; }
function spawnEnemy(scene,type,lane,x){
  const e=takePooled(scene,scene.pool.enemies,type),spec=enemySpec(type);
  e.setPosition(x,LANE_Y[lane]-spec.h/2).setData({type,hp:spec.hp,state:'warn',ms:spec.telegraph,lane,hitIds:new Set()});
  e.body.setSize(spec.w-8,spec.h-6).setAllowGravity(false); e.body.enable=false; return e;
}
function updateEnemies(scene,dt){
  scene.pool.enemies.getChildren().filter(e=>e.active).forEach(e=>{
    const d=e.data.values; d.ms-=dt;
    if(d.state==='warn'&&d.ms<=0){ d.state='active'; d.ms=d.type==='drone'?1000:1600; e.body.enable=d.type!=='pigeon'; }
    else if(d.state==='active'&&d.ms<=0){
      if(d.type==='bug'){ e.setVelocityY(-180); d.state='hop'; }
      else if(d.type==='stamp'){ d.state='slam'; e.body.enable=true; }
      else if(d.type==='pigeon'){ scatterPigeons(scene,e,false); }
      else if(d.type==='drone'){ spawnSmogCloud(scene,e); d.state='spent'; e.body.enable=false; }
    }
    e.x-=difficultyAt(scene.run.time).speed*dt/1000; if(e.x<-80)recycleBody(e);
  });
}
function hitEnemy(scene,e,shot){
  const d=e.data.values,id=shot.getData('id'); if(d.hitIds.has(id))return false; d.hitIds.add(id); d.hp--;
  if(d.hp>0){ d.state='warn'; d.ms=220; e.setTint(0xffffff); return false; }
  if(d.type==='pigeon')scatterPigeons(scene,e,true);
  scoreEvent(scene.run,d.type==='pigeon'?'pigeon':d.type); spawnFx(scene,'enemy',e.x,e.y,enemySpec(d.type).score); recycleBody(e);
  if(!shot.getData('pierce'))recycleBody(shot); return true;
}
function scatterPigeons(scene,e,defeated){
  e.body.enable=false; e.setVelocity(-80,-220); e.setAngularVelocity(defeated?180:80); e.data.values.state='scattered';
}
function spawnSmogCloud(scene,e){
  const c=takePooled(scene,scene.pool.hazards,'smog'); c.setPosition(e.x-36,e.y+10).setAlpha(.72).setData('expires',scene.run.time+1000);
  c.body.setSize(52,28).setAllowGravity(false); return c;
}
```

- [ ] **Step 4: Implement approved obstacles**

- Pothole uses only the dark center collision and swaps dry/wet art with weather.
- Barricade is static, street-only, with alternating decorative lamps.
- Gap removes ground over at most 72 pixels.
- Cracked ledge shakes, remains solid for 350 ms after contact, then drops non-colliding chunks.
- Moving barrier follows `[closed, opening, open, closing]`; transition frames have no collision, closed remains normally jumpable.

```js
function spawnObstacle(scene,type,lane,x){
  const o=takePooled(scene,scene.pool.obstacles,type),s=obstacleSpec(type);
  o.setPosition(x,LANE_Y[lane]-s.h/2).setData({type,lane,state:type==='barrier'?'closed':'active',ms:type==='ledge'?s.grace:0});
  o.body.setSize(s.w,s.h).setImmovable(true).setAllowGravity(false); o.body.enable=type!=='gap'; return o;
}
function updateObstacles(scene,dt){
  scene.pool.obstacles.getChildren().filter(o=>o.active).forEach(o=>{
    const d=o.data.values,s=obstacleSpec(d.type); o.x-=difficultyAt(scene.run.time).speed*dt/1000;
    if(d.type==='barrier'){
      d.ms+=dt; const total=s.cycle.reduce((a,b)=>a+b,0),t=d.ms%total,a=s.cycle[0],b=a+s.cycle[1],c=b+s.cycle[2];
      d.state=t<a?'closed':t<b?'opening':t<c?'open':'closing'; o.body.enable=d.state==='closed';
    }
    if(d.type==='ledge'&&d.state==='cracking'&&(d.ms-=dt)<=0){ d.state='fallen'; o.body.enable=false; spawnFx(scene,'debris',o.x,o.y); }
    if(o.x<-120)recycleBody(o);
  });
}
```

- [ ] **Step 5: Run data, syntax, and restriction checks**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
for(const [t,hp] of [['bug',1],['stamp',2],['pigeon',1],['drone',1]]) if(c.enemySpec(t).hp!==hp) throw Error(t+' hp');
if(c.obstacleSpec('gap').w>72||c.obstacleSpec('ledge').grace!==350) throw Error('gap rules');
if(c.obstacleSpec('barrier').cycle.join(',')!=='1200,500,1000,500') throw Error('barrier cycle');
if(c.obstacleSpec('hanging')) throw Error('rejected obstacle present');
NODE
npm run check-restrictions
```

- [ ] **Step 6: User gameplay checkpoint and commit**

Ask the user to test each enemy telegraph, jump each physical obstacle with Watermelon, verify pigeon scatter is harmless, and verify no hanging sign appears.

```bash
git add game.js
git commit -m "feat: add runner enemies and obstacles"
```

---

### Task 7: Add bananas, tokens, Help Switch, score, and combo

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: players, enemies, obstacles, Pixel Banana V3, token and Help Switch textures.
- Produces: `scoreEvent(run, type, count)`, `fireBanana(scene, player)`, `updateProjectiles(scene, dt)`, `spawnTokenTrail(scene, lane, points)`, `updateTokens(scene, dt)`, `collectToken(scene, player, token)`, `spawnHelpSwitch(scene, sourceLane, target)`, `activateHelp(scene, player, help)`, `addTemporaryLip(scene, gap, lifetimeMs)`, and `wireGameplayCollisions(scene)`.

- [ ] **Step 1: Run a failing scoring probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.scoreEvent!=='function') throw Error('scoreEvent missing');
NODE
```

- [ ] **Step 2: Implement score and combo as one pure mutation boundary**

```js
function scoreEvent(run,type,count=1){
  const base=SCORE[type]||0, gained=base*count*run.combo;
  run.score+=gained;
  if(base){ run.combo=Math.min(20,run.combo+1); run.comboMs=2200; run.bestCombo=Math.max(run.bestCombo,run.combo); }
  if(type==='token') run.stats.tokens+=count;
  else if(type==='assist') run.stats.assists+=count;
  else if(base) run.stats.enemies+=count;
  return gained;
}
```

Distance points accrue outside `scoreEvent` so they do not grow combo. Damage sets `combo=1` and `comboMs=0`. Blokay multiplies combo duration only, never score directly.

- [ ] **Step 3: Implement pooled Pixel Banana V3 projectiles**

Maintain at most three active bananas per player. Base gap is 280 ms. Animate the same 20×16 texture through four quarter-turn angles with nearest-neighbor rendering. Normal shots recycle on first enemy or solid obstacle. Piercing shots mark already-hit enemy IDs and continue. Wizybot’s copied shot uses the approved companion origin and preserves ownership for shared score effects.

```js
function emitBanana(scene,p,x,y,pierce=false){
  const b=takePooled(scene,scene.pool.bananas,pierce?'bananaPower':'banana'),speed=p.champion===2?690:540;
  b.setPosition(x,y).setVelocityX(speed).setData({owner:p.id,pierce,id:++scene.run.shotId,spin:0});
  b.body.setSize(16,12).setAllowGravity(false); return b;
}
function fireBanana(scene,p){
  const active=scene.pool.bananas.getChildren().filter(b=>b.active&&b.getData('owner')===p.id);
  const gap=p.champion===2?220:280; if(active.length>=3||scene.run.time<(p.nextShot||0))return false;
  p.nextShot=scene.run.time+gap; const kind=powerStep(p,'shot'); emitBanana(scene,p,p.sprite.x+18,p.sprite.y-8,kind==='pierce');
  if(kind==='copy'&&p.companion)emitBanana(scene,p,p.companion.x+12,p.companion.y,false);
  audioCue(scene,kind==='pierce'?'power':'banana'); return true;
}
function updateProjectiles(scene,dt){
  scene.pool.bananas.getChildren().filter(b=>b.active).forEach(b=>{
    b.data.values.spin=(b.data.values.spin+dt)%320; b.setAngle(Math.floor(b.data.values.spin/80)*90);
    if(b.x>W+40)recycleBody(b);
  });
}
```

- [ ] **Step 4: Implement token trails and Plenti pull**

Create three-to-five token arcs from route recipe points. Pickup grants +25 and refreshes combo time. Plenti pulls only active tokens within a 150-pixel radius, moves them at no more than 180 px/s, and cannot pull through a solid obstacle.

```js
function spawnTokenTrail(scene,lane,points){
  points.slice(0,5).forEach(([x,y])=>{ const t=takePooled(scene,scene.pool.tokens,'token'); t.setPosition(x,LANE_Y[lane]+y).setData({lane,flip:0}); t.body.setCircle(7).setAllowGravity(false); });
}
function tokenPathClear(scene,t,p){
  return !scene.pool.obstacles.getChildren().some(o=>o.active&&o.body.enable&&Phaser.Geom.Intersects.LineToRectangle(new Phaser.Geom.Line(t.x,t.y,p.sprite.x,p.sprite.y),o.getBounds()));
}
function updateTokens(scene,dt){
  scene.pool.tokens.getChildren().filter(t=>t.active).forEach(t=>{
    t.x-=difficultyAt(scene.run.time).speed*dt/1000; t.data.values.flip=(t.data.values.flip+dt)%320; t.setScale(Math.max(.18,Math.abs(Math.cos(t.data.values.flip/320*Math.PI*2))),1);
    const p=scene.run.players.find(x=>x.alive&&x.champion===5&&Phaser.Math.Distance.Between(t.x,t.y,x.sprite.x,x.sprite.y)<150&&tokenPathClear(scene,t,x));
    if(p){ const a=Phaser.Math.Angle.Between(t.x,t.y,p.sprite.x,p.sprite.y),v=Math.min(180,90+Phaser.Math.Distance.Between(t.x,t.y,p.sprite.x,p.sprite.y)); t.x+=Math.cos(a)*v*dt/1000; t.y+=Math.sin(a)*v*dt/1000; }
    if(t.x<-30)recycleBody(t);
  });
}
function collectToken(scene,p,t){ scoreEvent(scene.run,'token'); spawnFx(scene,'token',t.x,t.y,25); recycleBody(t); }
```

- [ ] **Step 5: Implement the co-op Help Switch**

Spawn only in co-op and only on the opposite lane from its target. Show the pink link 1.2 seconds early. One banana activates the switch, grants +150, and applies exactly one target simplification: open a moving barrier, delay a Stamp Bot, or add a temporary lip to an easy gap. If missed, the original target remains independently survivable.

```js
function spawnHelpSwitch(scene,sourceLane,target){
  if(scene.run.mode!==MODE.COOP)return null;
  const h=takePooled(scene,scene.pool.help,'help'); h.setPosition(target.x-difficultyAt(scene.run.time).speed*1.2,LANE_Y[sourceLane]-34).setData({target,used:false});
  h.body.setSize(28,28).setAllowGravity(false); return h;
}
function activateHelp(scene,p,h){
  if(h.data.values.used)return false; h.data.values.used=true; const t=h.data.values.target,d=t.data.values;
  if(d.type==='barrier'){ d.state='open'; d.ms=obstacleSpec('barrier').cycle[0]+obstacleSpec('barrier').cycle[1]; t.body.enable=false; }
  else if(d.type==='stamp')d.ms+=900;
  else if(d.type==='gap')addTemporaryLip(scene,t,900);
  scoreEvent(scene.run,'assist'); spawnFx(scene,'assist',h.x,h.y,150); h.setTint(0x65e681); h.body.enable=false; return true;
}
function addTemporaryLip(scene,gap,lifetimeMs){
  const lip=takePooled(scene,scene.pool.surfaces,'landing'); lip.setPosition(gap.x+24,gap.y).setData('expires',scene.run.time+lifetimeMs);
  lip.body.setSize(48,12).setImmovable(true).setAllowGravity(false); return lip;
}
function wireGameplayCollisions(scene){
  scene.run.players.forEach(p=>{
    scene.physics.add.collider(p.sprite,scene.pool.surfaces,()=>landPlayer(p));
    scene.physics.add.overlap(p.sprite,scene.pool.enemies,(_,e)=>damagePlayer(scene,p,{kind:'enemy',body:e}));
    scene.physics.add.overlap(p.sprite,scene.pool.hazards,(_,h)=>damagePlayer(scene,p,{kind:'cloud',body:h}));
    scene.physics.add.collider(p.sprite,scene.pool.obstacles,(_,o)=>damagePlayer(scene,p,{kind:'obstacle',body:o}));
    scene.physics.add.overlap(p.sprite,scene.pool.tokens,(_,t)=>collectToken(scene,p,t));
  });
  scene.physics.add.overlap(scene.pool.bananas,scene.pool.enemies,(b,e)=>hitEnemy(scene,e,b));
  scene.physics.add.collider(scene.pool.bananas,scene.pool.obstacles,b=>recycleBody(b));
  scene.physics.add.overlap(scene.pool.bananas,scene.pool.help,(b,h)=>{const p=scene.run.players[b.getData('owner')];if(activateHelp(scene,p,h))recycleBody(b);});
}
```

- [ ] **Step 6: Run score probes and restriction check**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
const r=c.makeRunState('coop',1); r.combo=2;
if(c.scoreEvent(r,'token')!==50||r.score!==50||r.stats.tokens!==1) throw Error('token scoring');
r.combo=1; if(c.scoreEvent(r,'assist')!==150||r.stats.assists!==1) throw Error('assist scoring');
if(c.scoreEvent(r,'stamp')!==400||r.stats.enemies!==1) throw Error('stamp scoring');
NODE
npm run check-restrictions
```

- [ ] **Step 7: Commit scoring and interactions**

```bash
git add game.js
git commit -m "feat: add bananas tokens and coop assists"
```

---

### Task 8: Implement co-op down, ghost, and revival

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: player models, safe route positions, co-op mode, feedback textures.
- Produces: `downPlayer(scene, player)`, `reviveStep(players, dt, safe)`, `findSafeRevivePoint(scene, laneY)`, `revivePlayer(scene, player, point)`, `updateRevival(scene, dt)`, `beginResults(scene)`, and `teamDefeated(players)`.

- [ ] **Step 1: Run a failing revival-model probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.reviveStep!=='function'||typeof c.teamDefeated!=='function') throw Error('revival model missing');
NODE
```

- [ ] **Step 2: Add the pure countdown and failure rules**

```js
function teamDefeated(players){ return players.every(p=>!p.alive); }
function reviveStep(players,dt,safe){
  if(teamDefeated(players)) return 'end';
  const ghost=players.find(p=>p.ghost), active=players.find(p=>p.alive);
  if(!ghost||!active) return '';
  ghost.reviveMs+=dt;
  if(ghost.reviveMs>=6000&&safe){ ghost.alive=true; ghost.ghost=false; ghost.hearts=2; ghost.shieldMs=1000; ghost.reviveMs=0; return 'revive'; }
  return 'wait';
}
```

- [ ] **Step 3: Wire visual and runtime behavior**

Downed champion tips sideways, shows crossed eyes and lost heart, then becomes the exact cyan ghost treatment. Ghost follows the active partner, has no Arcade body, cannot shoot or collect, and may bob on Button 1. Show a six-second timer in the downed player’s HUD region. `findSafeRevivePoint` rejects gaps, enemies, active obstacles, and reaction windows; revival uses the next clear platform, portal, `¡VOLVISTE!`, full controls, and 1000 ms shield.

```js
function downPlayer(scene,p){
  if(!p.alive)return; p.alive=false; p.sprite.body.enable=false; p.sprite.setTexture(`champ${p.champion}-hit`).setAngle(90);
  if(scene.run.mode===MODE.SOLO||teamDefeated(scene.run.players)){ beginResults(scene); return; }
  p.ghost=true; p.reviveMs=0;
  scene.time.delayedCall(260,()=>{ if(p.ghost)p.sprite.setTexture(`champ${p.champion}-ghost`).setAngle(0).setTint(0x77efff).setAlpha(.72); });
}
function beginResults(scene){ scene.run.phase=PHASE.RESULTS; scene.physics.pause(); scene.run.resultMs=0; }
function findSafeRevivePoint(scene,laneY){
  for(let x=220;x<=420;x+=40){
    const blocked=scene.pool.obstacles.getChildren().some(o=>o.active&&Math.abs(o.x-x)<100&&Math.abs(o.y-laneY)<70)||
      scene.pool.enemies.getChildren().some(e=>e.active&&Math.abs(e.x-x)<120&&Math.abs(e.y-laneY)<70);
    const ground=scene.pool.surfaces.getChildren().some(s=>s.active&&s.body.enable&&s.getBounds().contains(x,laneY+8));
    if(!blocked&&ground)return{x,y:laneY-24};
  }
  return null;
}
function revivePlayer(scene,p,point){
  p.sprite.setPosition(point.x,point.y).setTexture(`champ${p.champion}-revive`).setAngle(0).setAlpha(1).clearTint();
  p.sprite.body.enable=true; p.sprite.setVelocity(0,0); p.grounded=false; scene.run.stats.revives++;
  spawnFx(scene,'revive',point.x,point.y); audioCue(scene,'revive');
}
function updateRevival(scene,dt){
  const ghost=scene.run.players.find(p=>p.ghost),active=scene.run.players.find(p=>p.alive); if(!ghost||!active)return;
  ghost.sprite.setPosition(active.sprite.x-34,active.sprite.y-40+Math.sin(scene.run.time/180)*5);
  const point=findSafeRevivePoint(scene,ghost.laneY),out=reviveStep(scene.run.players,dt,point);
  if(out==='revive')revivePlayer(scene,ghost,point); else if(out==='end')beginResults(scene);
}
```

Solo bypasses ghost logic and enters results immediately. Co-op enters results only when `teamDefeated` is true.

- [ ] **Step 4: Run revival edge-case probes**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
let a=c.makePlayerModel(0,0,180),b=c.makePlayerModel(1,6,420); b.alive=false;b.ghost=true;
if(c.reviveStep([a,b],5999,true)!=='wait') throw Error('early revive');
if(c.reviveStep([a,b],1,false)!=='wait') throw Error('unsafe revive');
if(c.reviveStep([a,b],1,true)!=='revive'||!b.alive||b.shieldMs!==1000) throw Error('revive failed');
a.alive=false;b.alive=false;if(!c.teamDefeated([a,b])||c.reviveStep([a,b],1,true)!=='end') throw Error('team end failed');
NODE
npm run check-restrictions
```

- [ ] **Step 5: Commit co-op recovery**

```bash
git add game.js
git commit -m "feat: add coop ghost revival system"
```

---

### Task 9: Add HUD, feedback, weather presentation, and procedural audio

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: run/player state, textures, phase changes.
- Produces: `updatePlaying(scene, dt)`, `createHud(scene)`, `refreshHud(scene)`, `createFxPool(scene)`, `spawnFx(scene, type, x, y, value)`, `comboTier(combo)`, `audioStart(scene)`, `audioCue(scene, type)`, `updateAudio(scene)`, and `audioPause(scene, paused)`.

- [ ] **Step 1: Run a failing combo-label probe**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.comboTier!=='function') throw Error('comboTier missing');
NODE
```

- [ ] **Step 2: Implement fixed combo tiers**

```js
function comboTier(n){ return n>=20?'BRUTAL':n>=10?'CHÉVERE':n>=5?'BACANO':n>=2?'BIEN':''; }
```

Use one playing orchestrator so pause can stop the whole simulation by phase alone:

```js
function updatePlaying(scene,dt){
  if(consumePressed(scene,['START1','START2']))return void pauseGame(scene);
  scene.run.time+=dt; const d=difficultyAt(scene.run.time),dx=d.speed*dt/1000; scene.run.speed=d.speed; scene.run.distance+=dx; scene.run.score+=dx*.1;
  const slow=scene.run.players.some(p=>p.alive&&p.champion===2) ? 0.65 : 1; scene.run.comboMs=Math.max(0,scene.run.comboMs-dt*slow); if(!scene.run.comboMs)scene.run.combo=1;
  updateWorld(scene,dt); updatePlayers(scene,dt); refreshChampionCooldowns(scene); updateEnemies(scene,dt); updateObstacles(scene,dt); updateProjectiles(scene,dt); updateTokens(scene,dt); updateRevival(scene,dt);
  scene.pool.hazards.getChildren().filter(x=>x.active&&x.getData('expires')<=scene.run.time).forEach(recycleBody);
  scene.pool.surfaces.getChildren().filter(x=>x.active&&x.getData('expires')&&x.getData('expires')<=scene.run.time).forEach(recycleBody);
  refreshHud(scene); updateAudio(scene);
}
```

- [ ] **Step 3: Build the four approved HUD states**

Keep HUD inside the top 18%. Solo: exact selected portrait/hearts/power left, six-digit score center, combo right. Co-op: P1 left, shared score/assist center, P2 right. One-heart status adds a red border. Ghost timer replaces only the downed player’s power strip. Use exact portraits generated from champion recipes, never independent approximations.

```js
function createHud(scene){
  if(scene.ui.hud)scene.ui.hud.destroy(true);
  const c=scene.add.container(0,0).setDepth(1500),back=scene.add.rectangle(400,52,800,104,0x142332,.9);
  const p1=scene.add.image(42,48,`champ${scene.run.selected[0]}-idle`).setScale(.75),p2=scene.add.image(758,48,`champ${scene.run.selected[1]}-idle`).setScale(.75).setVisible(scene.run.mode===MODE.COOP);
  const left=scene.add.text(72,24,'',Object.assign({fontSize:'16px'},TXT)),score=scene.add.text(400,18,'000000',Object.assign({fontSize:'28px'},TXT)).setOrigin(.5,0);
  const combo=scene.add.text(400,58,'',Object.assign({fontSize:'16px',color:'#e1ff00'},TXT)).setOrigin(.5,0),right=scene.add.text(728,24,'',Object.assign({fontSize:'16px'},TXT)).setOrigin(1,0);
  c.add([back,p1,p2,left,score,combo,right]); scene.ui.hud=c; scene.hud={p1,p2,left,score,combo,right};refreshHud(scene);
}
function heartLine(p){ return `${p.hearts>0?'♥':'♡'}${p.hearts>1?'♥':'♡'}`; }
function refreshHud(scene){
  const a=scene.run.players[0],b=scene.run.players[1],tier=comboTier(scene.run.combo);
  scene.hud.score.setText(String(Math.floor(scene.run.score)).padStart(6,'0'));
  scene.hud.left.setText(a.ghost?`P1 FANTASMA ${(Math.max(0,6000-a.reviveMs)/1000).toFixed(1)}`:`P1 ${heartLine(a)}\n${championSpecs()[a.champion][1]}`);
  scene.hud.right.setVisible(!!b).setText(b?(b.ghost?`P2 FANTASMA ${(Math.max(0,6000-b.reviveMs)/1000).toFixed(1)}`:`P2 ${heartLine(b)}\n${championSpecs()[b.champion][1]}`):'');
  scene.hud.p2.setVisible(!!b); scene.hud.combo.setText(scene.run.combo>1?`×${scene.run.combo} ${tier}`:'');
}
```

- [ ] **Step 4: Build pooled feedback effects**

Use one pool of twelve colored rectangles, two rings, and two text objects for: 160 ms banana `TOK!`, 280 ms enemy blocks, 450 ms damage ring/flash, milestone `RACHA!` ribbon, token pop, Help Switch pulse, ghost portal, and revival shield. Never place confetti inside active lanes.

```js
const FX_MS={banana:160,enemy:280,damage:450,milestone:700,token:260,assist:500,phase:350,debris:420,revive:900};
function spawnFx(scene,type,x,y,value=''){
  const f=scene.fxPool.find(q=>!q.active); if(!f)return null;
  f.active=true; f.box.setPosition(x,y).setVisible(true).setScale(1).setAlpha(1).setFillStyle(type==='damage'?0xff5f65:type==='revive'?0x6ff6ff:0xffd21f);
  f.label.setPosition(x,y-22).setText(value||({banana:'TOK!',milestone:'RACHA!',revive:'¡VOLVISTE!'}[type]||'')).setVisible(true).setAlpha(1);
  scene.tweens.add({targets:[f.box,f.label],alpha:0,scale:1.7,duration:FX_MS[type]||300,onComplete:()=>{f.active=false;f.box.setVisible(false);f.label.setVisible(false);}}); return f;
}
function createFxPool(scene){
  scene.fxPool=Array.from({length:12},()=>({active:false,box:scene.add.rectangle(-50,-50,8,8,0xffffff).setVisible(false).setDepth(1200),label:scene.add.text(-50,-50,'',Object.assign({fontSize:'12px'},TXT)).setOrigin(.5).setVisible(false).setDepth(1201)}));
}
```

- [ ] **Step 5: Add Web Audio with graceful failure**

Start after the first accepted user input. Create one master gain and small oscillator/noise-envelope helpers. Provide cues for banana launch, powered shot, token pitch cycle, bug/stamp/pigeon/drone warning, enemy pop, damage, assist, revive, combo milestone, pause, and menu move. Music is a compact looping oscillator sequence. `audioPause(scene,true)` ramps master music gain to 25%; resume ramps back. Catch all audio creation failures and leave gameplay unaffected.

```js
const CUE={banana:[180,.05],power:[420,.11],token:[620,.08],bug:[145,.09],stamp:[95,.18],pigeon:[880,.05],drone:[210,.14],enemy:[120,.12],damage:[70,.25],assist:[740,.16],revive:[990,.24],milestone:[520,.3],pause:[110,.08],menu:[330,.04]};
function audioStart(scene){
  if(scene.audio)return; try{
    const C=window.AudioContext||window.webkitAudioContext,ctx=new C(),master=ctx.createGain(),music=ctx.createGain();
    master.gain.value=.18; music.gain.value=.22; music.connect(master); master.connect(ctx.destination); scene.audio={ctx,master,music,step:0,next:ctx.currentTime};
  }catch(_){ scene.audio={disabled:true}; }
}
function audioCue(scene,type){
  const a=scene.audio,q=CUE[type]; if(!a||a.disabled||!q)return;
  const o=a.ctx.createOscillator(),g=a.ctx.createGain(),now=a.ctx.currentTime; o.type='square'; o.frequency.setValueAtTime(q[0],now); g.gain.setValueAtTime(.12,now); g.gain.exponentialRampToValueAtTime(.001,now+q[1]); o.connect(g); g.connect(a.master); o.start(now); o.stop(now+q[1]);
}
function audioPause(scene,paused){
  const a=scene.audio;if(!a||a.disabled)return; const now=a.ctx.currentTime;a.music.gain.cancelScheduledValues(now);a.music.gain.linearRampToValueAtTime(paused ? 0.055 : 0.22,now+.12);
}
function updateAudio(scene){
  const a=scene.audio;if(!a||a.disabled)return;const notes=[196,247,294,392,294,247,220,330];
  while(a.next<a.ctx.currentTime+.12){ const o=a.ctx.createOscillator(),g=a.ctx.createGain();o.type='square';o.frequency.value=notes[a.step++%notes.length];g.gain.value=.025;o.connect(g);g.connect(a.music);o.start(a.next);o.stop(a.next+.09);a.next+=.14; }
}
```

- [ ] **Step 6: Run logic and restriction checks**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
const got=[1,2,5,10,20].map(c.comboTier).join('|'); if(got!=='|BIEN|BACANO|CHÉVERE|BRUTAL') throw Error(got);
NODE
npm run check-restrictions
```

- [ ] **Step 7: Commit presentation systems**

```bash
git add game.js
git commit -m "feat: add runner hud feedback and audio"
```

---

### Task 10: Finish pause, results, initials, leaderboards, and retry

**Files:**
- Modify: `game.js`

**Interfaces:**
- Consumes: phase machine, run stats, loaded save, input, audio gain.
- Produces: `resultBreakdown(run)`, `qualifies(rows, score)`, `insertScore(save, entry)`, `createEndUi(scene)`, `pauseGame(scene)`, `resumeGame(scene)`, `updatePause(scene)`, `updateConfirmation(scene)`, `showControlsPage(scene)`, `restartRun(scene, sameChampions)`, `showResults(scene)`, `showInitials(scene)`, `updateInitials(scene)`, `saveRunEntry(scene, tag)`, `showLeaderboard(scene, mode)`, and retry transitions.

- [ ] **Step 1: Run failing result/storage probes**

```bash
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(typeof c.resultBreakdown!=='function'||typeof c.insertScore!=='function') throw Error('results helpers missing');
NODE
```

- [ ] **Step 2: Implement deterministic results and table insertion**

```js
function resultBreakdown(run){ return {
  distance:Math.floor(run.distance), enemies:run.stats.enemies, tokens:run.stats.tokens,
  assists:run.stats.assists, combo:run.bestCombo, revives:run.stats.revives, total:Math.floor(run.score),
}; }
function qualifies(rows,score){ return rows.length<5||rows.some(r=>score>r.score); }
function insertScore(save,e){
  const key=e.mode===MODE.SOLO?'solo':'coop';
  save[key]=save[key].concat(e).sort((a,b)=>b.score-a.score).slice(0,5);
  return save;
}
function createEndUi(scene){
  const make=(name,title)=>{ const c=screen(scene,name),shade=scene.add.rectangle(400,300,800,600,0x08131d,.94),head=scene.add.text(400,58,title,Object.assign({fontSize:'30px',color:'#e1ff00'},TXT)).setOrigin(.5); c.add([shade,head]); return c; };
  const pause=make('pause','PAUSA'),controls=make('controls','CONTROLES'),confirm=make('confirm','¿SEGURO?'),results=make('results','RESULTADO'),initials=make('initials','TU TAG'),board=make('board','RÉCORDS');
  scene.ui.pauseText=scene.add.text(400,150,'',Object.assign({fontSize:'22px',align:'center'},TXT)).setOrigin(.5,0); pause.add(scene.ui.pauseText);
  scene.ui.controlsText=scene.add.text(400,150,'BOTÓN 1  SALTA / MANTÉN\nBOTÓN 2  LANZA BANANA\nJOYSTICK  SOLO MENÚS\nSTART  VOLVER',Object.assign({fontSize:'20px',align:'center'},TXT)).setOrigin(.5,0); controls.add(scene.ui.controlsText);
  scene.ui.confirmText=scene.add.text(400,210,'NO    SÍ',Object.assign({fontSize:'26px',align:'center'},TXT)).setOrigin(.5); confirm.add(scene.ui.confirmText);
  scene.ui.resultText=scene.add.text(400,120,'',Object.assign({fontSize:'18px',align:'center'},TXT)).setOrigin(.5,0); results.add(scene.ui.resultText);
  scene.ui.initialsText=scene.add.text(400,220,'AAA',Object.assign({fontSize:'48px',color:'#e1ff00'},TXT)).setOrigin(.5); initials.add(scene.ui.initialsText);
  scene.ui.boardText=scene.add.text(400,120,'',Object.assign({fontSize:'17px',align:'left'},TXT)).setOrigin(.5,0); board.add(scene.ui.boardText);
}
```

- [ ] **Step 3: Build the approved pause flow**

Either START enters pause and freezes all game updates. Menu order: Continue, Controls, Restart Run, Exit to Title. Continue is selected first. Restart and Exit enter confirmation with No selected. Controls page states Button 1 jump/hold, Button 2 banana, joystick menus only, and START back. Resume uses a compact one-second countdown before `PHASE.PLAY`.

```js
function pauseGame(scene){
  if(scene.run.phase!==PHASE.PLAY)return false; scene.run.phase=PHASE.PAUSE; scene.run.pauseCursor=0;
  scene.physics.pause(); scene.tweens.pauseAll(); audioPause(scene,true); showScreen(scene,'pause'); refreshPauseUi(scene); return true;
}
function resumeGame(scene){
  if(scene.run.phase!==PHASE.PAUSE)return false; scene.tweens.resumeAll(); audioPause(scene,false); startCountdown(scene,true); return true;
}
function updatePause(scene){
  const up=consumePressed(scene,['P1_U','P2_U']),down=consumePressed(scene,['P1_D','P2_D']),ok=consumePressed(scene,['P1_1','P2_1']),start=consumePressed(scene,['START1','START2']);
  if(up||down)scene.run.pauseCursor=menuMove(scene.run.pauseCursor,up?-1:1,4);
  if(start||ok&&scene.run.pauseCursor===0)return resumeGame(scene);
  if(ok&&scene.run.pauseCursor===1)return showControlsPage(scene);
  if(ok&&scene.run.pauseCursor>1){ scene.run.phase=PHASE.CONFIRM; scene.run.confirmAction=scene.run.pauseCursor===2?'restart':'title'; scene.run.confirmYes=false; refreshConfirmUi(scene); }
  refreshPauseUi(scene);
}
function updateConfirmation(scene){
  if(consumePressed(scene,['P1_L','P1_R','P2_L','P2_R']))scene.run.confirmYes=!scene.run.confirmYes;
  if(!consumePressed(scene,['P1_1','P2_1']))return;
  if(!scene.run.confirmYes){scene.run.phase=PHASE.PAUSE;showScreen(scene,'pause');return;}
  scene.run.confirmAction==='restart'?restartRun(scene,true):showTitle(scene);
}
function refreshPauseUi(scene){
  const rows=['CONTINUAR','CONTROLES','REINICIAR CARRERA','SALIR AL INICIO']; scene.ui.pauseText.setText(rows.map((x,i)=>`${i===scene.run.pauseCursor?'▶':' '} ${x}`).join('\n\n'));
}
function refreshConfirmUi(scene){ showScreen(scene,'confirm'); scene.ui.confirmText.setText(scene.run.confirmYes?'NO    ▶ SÍ':'▶ NO    SÍ'); }
function showControlsPage(scene){ showScreen(scene,'controls'); scene.run.pauseSubpage=true; }
function clearRunEntities(scene){
  for(const key of ['enemies','obstacles','hazards','bananas','tokens','help','surfaces'])scene.pool[key].getChildren().forEach(recycleBody);
  scene.run.players.forEach(p=>{if(p.sprite)p.sprite.destroy();if(p.companion)p.companion.destroy();});scene.run.players=[];
}
function restartRun(scene,sameChampions){
  const old=scene.run,mode=old.mode,picks=old.selected.slice();clearRunEntities(scene);scene.run=makeRunState(mode,(Date.now()^old.seed)>>>0);if(sameChampions)scene.run.selected=picks;
  createWorld(scene);createPlayers(scene);wireGameplayCollisions(scene);createHud(scene);startCountdown(scene,scene.save.tutorialSeen);
}
```

- [ ] **Step 4: Build results, initials, and mode-specific boards**

Results show total and the locked categories. Qualifying runs enter a three-letter uppercase tag UI operated by either active player. Save entries as:

```js
const exampleEntry={ tag:'BOG', score:84250, mode:'coop', champions:[0,6], distance:2800, combo:12, assists:4, revives:2 };
```

Validate again before write. Separate Solo and Co-op tabs, cap each at five, highlight the new row, and show champion names. A non-record run defaults to Retry with same champions. Other options: Choose Startup, View Records, Exit to Title.

```js
function showResults(scene){
  scene.run.phase=PHASE.RESULTS; showScreen(scene,'results'); const b=resultBreakdown(scene.run),mode=scene.run.mode===MODE.SOLO?'SOLO':'CO-OP';
  scene.ui.resultText.setText(`${mode}\n${String(b.total).padStart(6,'0')}\nDISTANCIA ${b.distance}\nENEMIGOS ${b.enemies}\nTOKENS ${b.tokens}\nAYUDAS ${b.assists}\nMEJOR ×${b.combo}\nREVIVIDAS ${b.revives}`);
  scene.run.qualifies=qualifies(scene.save[scene.run.mode],b.total); scene.run.resultCursor=0;
}
function showInitials(scene){ scene.run.phase=PHASE.INITIALS; scene.run.tag=['A','A','A']; scene.run.tagPos=0; showScreen(scene,'initials'); refreshInitialsUi(scene); }
function refreshInitialsUi(scene){ scene.ui.initialsText.setText(scene.run.tag.map((x,i)=>i===scene.run.tagPos?`[${x}]`:` ${x} `).join('')); }
function updateInitials(scene){
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-',up=consumePressed(scene,['P1_U','P2_U']),down=consumePressed(scene,['P1_D','P2_D']);
  if(up||down){ const i=letters.indexOf(scene.run.tag[scene.run.tagPos]); scene.run.tag[scene.run.tagPos]=letters[menuMove(i,up?-1:1,letters.length)]; }
  if(consumePressed(scene,['P1_L','P2_L']))scene.run.tagPos=menuMove(scene.run.tagPos,-1,3);
  if(consumePressed(scene,['P1_R','P2_R']))scene.run.tagPos=menuMove(scene.run.tagPos,1,3);
  if(consumePressed(scene,['P1_1','P2_1']))saveRunEntry(scene,scene.run.tag.join(''));
  refreshInitialsUi(scene);
}
async function saveRunEntry(scene,tag){
  const b=resultBreakdown(scene.run),entry={tag,score:b.total,mode:scene.run.mode,champions:scene.run.selected.slice(0,scene.run.mode===MODE.SOLO?1:2),distance:b.distance,combo:b.combo,assists:b.assists,revives:b.revives};
  const candidate=insertScore(scene.save,entry); if(!validateSave(candidate)){scene.run.saveFailed=true;return showLeaderboard(scene,scene.run.mode);}
  scene.run.saveFailed=!(await writeSave(candidate)); showLeaderboard(scene,scene.run.mode);
}
function showLeaderboard(scene,mode){
  scene.run.phase=PHASE.BOARD; showScreen(scene,'board'); const rows=scene.save[mode].map((e,i)=>`${i+1}. ${e.tag} ${String(e.score).padStart(6,'0')}  ${e.champions.map(n=>championSpecs()[n][0]).join(' + ')}`);
  scene.ui.boardText.setText(`${mode===MODE.SOLO?'SOLO':'CO-OP'} TOP 5\n${rows.join('\n')||'SIN RÉCORDS'}`);
}
```

- [ ] **Step 5: Run result and malformed-storage probes**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
let s={version:1,solo:[],coop:[],tutorialSeen:false};
for(let i=0;i<7;i++) c.insertScore(s,{tag:'A'+i,score:i*10,mode:'solo',champions:[0]});
if(s.solo.length!==5||s.solo[0].score!==60||s.solo[4].score!==20) throw Error('top five wrong');
if(!c.qualifies(s.solo,99)||c.qualifies(s.solo,1)) throw Error('qualification wrong');
const r={distance:10,score:50,bestCombo:2,stats:{enemies:1,tokens:2,assists:0,revives:0}};
if(c.resultBreakdown(r).total!==50) throw Error('breakdown wrong');
NODE
npm run check-restrictions
```

- [ ] **Step 6: User flow checkpoint and commit**

Ask the user to test pause from both START buttons, destructive confirmation defaults, resume countdown, solo results, co-op results, initials entry by both players, separate tables, reload persistence, and same-champion retry.

```bash
git add game.js
git commit -m "feat: add pause results and leaderboards"
```

---

### Task 11: Update metadata and generate the exact cover

**Files:**
- Modify: `metadata.json`
- Create: `cover.png`
- Modify temporarily, then finalize: `game.js`

**Interfaces:**
- Consumes: exact procedural texture recipes and approved cover composition.
- Produces: final submission metadata and 800×600 cover.

- [ ] **Step 1: Verify current metadata and cover fail the final contract**

```bash
node -e "const m=require('./metadata.json');if(m.game_name==='Startup Run: Bogotá')process.exit(1);console.log('expected old metadata:',m.game_name)"
test ! -f cover.png || sips -g pixelWidth -g pixelHeight cover.png
```

Expected: metadata prints the old brick-breaker name; cover is absent or not yet verified.

- [ ] **Step 2: Replace metadata with the final values**

```json
{
  "game_name": "Startup Run: Bogotá",
  "description": "Corre por Bogotá solo o en co-op con startups colombianas, salta obstáculos y lanza bananas para alcanzar el récord.",
  "player_mode": "two_player"
}
```

- [ ] **Step 3: Add and invoke a temporary exact cover composer**

Add `createCoverComposition(scene)` using only the same texture keys and shared champion draw recipes already used in-game. It must place: approved title treatment; exact Watermelon and Wizybot raised-arm sprites; Pixel Banana V3; Rooftop Module A with three locked windows; full articulated TransMilenio modules; improved Monserrate; and `SOLO + 2 PLAYER CO-OP · PLATANUS HACK 26` badge.

```js
function createCoverComposition(scene){
  const c=scene.add.container(0,0),sky=scene.add.rectangle(400,300,800,600,0x78c8e8),hill=scene.add.image(675,176,'monserrate'),roof=scene.add.image(150,510,'roofA').setScale(1.35),bus=scene.add.container(500,492,[scene.add.image(0,0,'busFront'),scene.add.image(104,0,'busJoint'),scene.add.image(208,0,'busRear')]);
  const title=scene.add.text(400,42,'STARTUP RUN!\nBOGOTÁ',Object.assign({fontSize:'50px',align:'center',color:'#e1ff00',stroke:'#17222c',strokeThickness:10},TXT)).setOrigin(.5,0);
  const wm=scene.add.image(210,340,'champ0-jump').setScale(3),wz=scene.add.image(590,340,'champ6-jump').setScale(3),banana=scene.add.image(400,300,'bananaPower').setScale(4).setAngle(-18);
  const badge=scene.add.text(400,560,'SOLO + 2 PLAYER CO-OP · PLATANUS HACK 26',Object.assign({fontSize:'16px',color:'#17222c',backgroundColor:'#e1ff00',padding:{x:12,y:8}},TXT)).setOrigin(.5);
  c.add([sky,hill,roof,bus,title,wm,wz,banana,badge]);return c;
}
```

Expose a temporary user-gesture capture function:

```js
window.captureStartupRunCover = scene => {
  const cover=createCoverComposition(scene).setDepth(9999);
  scene.game.renderer.snapshotArea(0,0,800,600,img=>{
    const a=document.createElement('a'); a.download='cover.png'; a.href=img.src; a.click();
    cover.destroy(true);
  });
};
```

Ask the user to run the existing dev UI. Invoke `captureStartupRunCover(scene)` through the active browser context, move the downloaded file to repository root as `cover.png`, then remove the temporary global capture function and any cover-only unreachable runtime code if it is not reused by the title composition. Do not use image generation, the banana JPG, or any external art.

- [ ] **Step 4: Verify cover dimensions, format, and size**

```bash
sips -g format -g pixelWidth -g pixelHeight cover.png
stat -f '%z bytes' cover.png
```

Expected: `format: png`, `pixelWidth: 800`, `pixelHeight: 600`, and fewer than 512000 bytes.

- [ ] **Step 5: Verify restrictions and commit submission metadata/cover**

```bash
node --check game.js
npm run check-restrictions
git add game.js metadata.json cover.png
git commit -m "feat: finalize Startup Run metadata and cover"
```

---

### Task 12: Integration, fairness, size, and regression verification

**Files:**
- Modify if required: `game.js`
- Verify: `metadata.json`
- Verify: `cover.png`

**Interfaces:**
- Consumes: complete game from Tasks 1–11.
- Produces: release-ready three-file submission.

- [ ] **Step 1: Run all pure regression probes in one pass**

```bash
node --check game.js
node - <<'NODE'
const fs=require('fs'),vm=require('vm');const c={window:{addEventListener(){},removeEventListener(){}},Phaser:{AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{}}};vm.createContext(c);vm.runInContext(fs.readFileSync('game.js','utf8'),c);
if(c.championSpecs().length!==8) throw Error('roster');
if(c.bananaRows().length!==16||c.bananaRows().some(r=>r.length!==20)) throw Error('banana');
for(const mode of ['solo','coop']) for(let seed=1;seed<=250;seed++) if(!c.simulatePatterns(seed,900,mode).valid) throw Error(`unsafe ${mode}:${seed}`);
let p=c.makePlayerModel(0,0,180);for(let i=0;i<4;i++)c.powerStep(p,'shot');if(c.powerStep(p,'shot')!=='pierce')throw Error('pierce');
p=c.makePlayerModel(0,6,420);for(let i=0;i<3;i++)c.powerStep(p,'shot');if(c.powerStep(p,'shot')!=='copy')throw Error('copy');
const save={version:1,solo:[],coop:[],tutorialSeen:true};if(!c.validateSave(save))throw Error('save');
if(c.obstacleSpec('hanging'))throw Error('rejected sign');
NODE
```

- [ ] **Step 2: Run the official restriction check and record size**

```bash
npm run check-restrictions
wc -c game.js
```

Expected: official check passes; minified size reported below 50 KB. If above the 40 KB working target, first deduplicate draw recipes, repeated UI style objects, sound envelopes, and long labels. Do not remove approved mechanics, fairness rules, exact asset identity, or persistence merely to reach the 40 KB target; the hard requirement is below 50 KB.

- [ ] **Step 3: Verify shipped-file contract**

```bash
git status --short
node -e "const m=require('./metadata.json');if(m.game_name!=='Startup Run: Bogotá'||m.player_mode!=='two_player')process.exit(1)"
sips -g format -g pixelWidth -g pixelHeight cover.png
stat -f '%z' cover.png
```

Expected: only intentional uncommitted files are present; metadata matches; cover is PNG 800×600 and below 512000 bytes.

- [ ] **Step 4: Ask the user to run the final cabinet acceptance matrix**

The user runs the existing dev UI. Verify exactly:

1. Title selection works with both cabinet sides.
2. All eight exact roster characters and powers are selectable; no duplicates in co-op.
3. Full and compact countdowns lock input until `¡CORRE!`.
4. Solo survives at least five minutes without impossible patterns.
5. Co-op routes remain independently survivable; Help Switch is optional.
6. Every approved enemy, obstacle, token, banana, weather, and effect appears.
7. Hanging cable/sign and all approximate review scenery are absent.
8. Every passive activates on its documented cadence.
9. Damage, fall, ghost, six-second revive, shield, and both-down failure behave correctly.
10. Either START pauses; restart/exit confirmations default to No; resume countdown protects players.
11. Score breakdown reconciles; Solo and Co-op top-five tables save and reload separately.
12. Audio starts only after input and pause reduces its gain.

- [ ] **Step 5: Fix any acceptance defect using the smallest change, then rerun Steps 1–3**

For each failure, reproduce it with a fixed seed or exact phase/input sequence, add a VM assertion when the defect is in pure logic, apply the minimal correction, and repeat the complete automated verification commands above.

- [ ] **Step 6: Commit final integration fixes**

```bash
git add game.js metadata.json cover.png
git commit -m "fix: complete Startup Run release verification"
```

The final commit is optional if Step 5 produced no changes; do not create an empty commit.
