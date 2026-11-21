// Episode 63: Town crossing – a sinkhole at the traffic light grows with every red light
// hook (old style): red light, first in line, right in front of your bumper the road goes crack -> it's a sinkhole, and
//        every time the light turns red it gets bigger
// wrong: just go, drive round it before it grows -> the traffic light sees you and gets angry: red, red, red (the hole
//        jumps bigger each time) -> the whole crossing falls in, you drop through the middle of the earth and pop out in
//        Australia, upside down
// right: stay behind the line, open the glovebox -> green sunglasses, thrown onto the traffic light (very cool) -> every
//        red looks green and with every green the hole gets smaller -> a tiny little hole -> a golf ball rolls in, hole in
//        one (flag pops up) -> drive on
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, box, instanced, makeLandscape,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, composer, hemi, sun, SKY, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };
// stencil buffer for the hole (the interior is only drawn where the opening is visible)
if (composer) composer.reset(new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4, stencilBuffer: true }));

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
// ---------------- timing ----------------
const tRedH = WT('hook1', 'Red'), tFirst = WT('hook1', 'first'), tThen = WT('hook1', 'Then'), tFront = WT('hook1', 'front'), tBumper = WT('hook1', 'bumper'), tRoad = WT('hook1', 'road'), tCrack = WT('hook1', 'crack');
const tSink = WT('hook2', 'sinkhole'), tEvery = WT('hook2', 'every'), tLightH = WT('hook2', 'light'), tTurns = WT('hook2', 'turns'), tRedH2 = WT('hook2', 'red'), tBigger = WT('hook2', 'bigger'), tWhat = WT('hook2', 'What');
const tJust = WT('wrong1', 'just'), tGo = WT('wrong1', 'go'), tDrive = WT('wrong1', 'Drive'), tQuick = WT('wrong1', 'quick'), tGrows = WT('wrong1', 'grows');
const tBigM = WT('wrong2', 'Big'), tTraffic = WT('wrong2', 'traffic'), tSees = WT('wrong2', 'sees'), tAngry = WT('wrong2', 'angry'), tR0 = WT('wrong2', 'Red', 0), tR1 = WT('wrong2', 'Red', 1), tR2 = WT('wrong2', 'Red', 2);
const tWhole = WT('wrong3', 'whole'), tFalls = WT('wrong3', 'falls'), tYou = WT('wrong3', 'You'), tDrop = WT('wrong3', 'drop'), tMiddle = WT('wrong3', 'middle'), tEarth = WT('wrong3', 'earth'), tAnd = WT('wrong3', 'And'), tPop = WT('wrong3', 'pop'), tAus = WT('wrong3', 'Australia'), tUpside = WT('wrong3', 'Upside');
const tStay = WT('right2', 'Stay'), tLine = WT('right2', 'line'), tOpen = WT('right2', 'open'), tGlove = WT('right2', 'glovebox');
const tSun = WT('right3', 'sunglasses'), tGreenOnes = WT('right3', 'green'), tThrow = WT('right3', 'Throw'), tOnto = WT('right3', 'onto'), tLightR = WT('right3', 'light'), tVery = WT('right3', 'Very'), tCool = WT('right3', 'cool');
const tNow = WT('right4', 'Now'), tRedR = WT('right4', 'red'), tLooks = WT('right4', 'looks'), tG0 = WT('right4', 'green', 0), tG1 = WT('right4', 'green', 1), tHoleR = WT('right4', 'hole'), tSm0 = WT('right4', 'smaller');
const tSm1 = WT('right5', 'smaller', 0), tSm2 = WT('right5', 'smaller', 1), tUntil = WT('right5', 'Until'), tTiny = WT('right5', 'tiny'), tLittle = WT('right5', 'little');
const tGolf = WT('right6', 'golf'), tRolls = WT('right6', 'rolls'), tIn = WT('right6', 'in', 0), tHoleIn = WT('right6', 'Hole'), tOne = WT('right6', 'one'), tDriveR = WT('right6', 'drive');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- town crossing ----------------
const RW = 3.6, LANE = 1.75;
plane(-RW, RW, -400, 400, asphaltMat, 0.04, 7);
plane(-400, -RW, -RW, RW, asphaltMat, 0.045, 7); plane(RW, 400, -RW, RW, asphaltMat, 0.045, 7);
const walkMat = L('#cfc9be');
for (const [x0, x1, z0, z1] of [[-8, -RW, -400, -RW], [-8, -RW, RW, 400], [RW, 8, -400, -RW], [RW, 8, RW, 400], [-400, -8, -8, -RW], [-400, -8, RW, 8], [8, 400, -8, -RW], [8, 400, RW, 8]]) plane(x0, x1, z0, z1, walkMat, 0.09, 4);
{ const dg = new THREE.PlaneGeometry(0.15, 3); dg.rotateX(-PI / 2); const list = [];
  for (let z = 14; z < 300; z += 7) { list.push([0, 0.07, z], [0, 0.07, -z]); }
  const dI = new THREE.InstancedMesh(dg, markMat, list.length * 2); let n = 0;
  list.forEach(p => { _m.compose(_v.set(...p), _q.identity(), _s.set(1, 1, 1)); dI.setMatrixAt(n++, _m); });
  list.forEach(p => { _q.setFromAxisAngle(_v.set(0, 1, 0), PI / 2); _m.compose(_v.set(p[2], 0.075, p[0]), _q, _s.set(1, 1, 1)); dI.setMatrixAt(n++, _m); });
  dI.count = n; scene.add(dI);
  const sl = new THREE.PlaneGeometry(RW, 0.45); sl.rotateX(-PI / 2);
  for (const [x, z, r] of [[LANE, 8.6, 0], [-LANE, -8.6, 0], [-8.6, LANE, PI / 2], [8.6, -LANE, PI / 2]]) { const m = new THREE.Mesh(sl, markMat); m.position.set(x, 0.075, z); m.rotation.y = r; scene.add(m); }
}
makeLandscape({ avoid: (x, z) => (Math.abs(x) < 70 && Math.abs(z) < 70) || Math.abs(x) < 10 || Math.abs(z) < 10, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 75 && Math.abs(z) - d / 2 < 75, near: [0, 0, 300, 300], trees: 1200, seed: 6801 });
const winTex = (base, frame) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = frame; c.fillRect(24 + x * 128, 30 + y * 128, 80, 84); c.fillStyle = '#4f6f8f'; c.fillRect(30 + x * 128, 36 + y * 128, 68, 72); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(34 + x * 128, 40 + y * 128, 20, 64); } }, true);
function house(x, z, w, d, h, col, roofCol, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const t = winTex(col, '#ffffff'); t.repeat.set(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 4)));
  const t2 = winTex(col, '#ffffff'); t2.repeat.set(Math.max(1, Math.round(d / 4)), Math.max(1, Math.round(h / 4)));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [L('#fff', { map: t2 }), L('#fff', { map: t2 }), L(col), L(col), L('#fff', { map: t }), L('#fff', { map: t })]);
  m.position.y = h / 2; m.castShadow = m.receiveShadow = true; g.add(m);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.4, 0); sh.lineTo(w / 2 + 0.4, 0); sh.lineTo(0, 2.6); sh.lineTo(-w / 2 - 0.4, 0);
  const rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.6) / 2);
  const rf = new THREE.Mesh(rg, L(roofCol)); rf.position.y = h; rf.castShadow = true; g.add(rf); return g;
}
const HC = [['#f4e1c1', '#b8462e'], ['#dfe9f2', '#5d6d7e'], ['#f6d6d0', '#8e3b2e'], ['#e8f0d8', '#6d4c41'], ['#fff1c9', '#a5523a']];
[[-21, 24, 9, 8, 7], [-21, 36, 9, 9, 8], [21, 24, 9, 8, 7.5], [21, 36, 9, 9, 6], [-21, -24, 9, 9, 9], [-21, -36, 9, 10, 7], [21, -26, 9, 9, 8], [-34, 21, 9, 8, 6], [34, 21, 9, 8, 7], [-34, -21, 9, 9, 7], [34, -21, 9, 8, 6.5]]
  .forEach(([x, z, w, d, h], i) => house(x, z, w, d, h, HC[i % 5][0], HC[i % 5][1], Math.abs(x) < 25 ? PI / 2 : 0));
{ const pts = [[-6.3, 26], [-6.3, 38], [6.3, 28], [6.3, 40], [-26, 6.3], [-38, 6.3], [-26, -6.3], [-6.3, -28], [-6.3, -40], [26, 6.3], [26, -6.3]];
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.22, 2.6, 6), L('#6d4a2b'), pts.length);
  const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length);
  pts.forEach(([x, z], i) => { _m.compose(_v.set(x, 1.3, z), _q.identity(), _s.set(1, 1, 1)); trunk.setMatrixAt(i, _m); _m.compose(_v.set(x, 3.6, z), _q.identity(), _s.set(1, 1.15, 1)); leaf.setMatrixAt(i, _m); leaf.setColorAt(i, _c.set(['#3f8f2e', '#4fa336', '#5fb33f'][i % 3])); });
  trunk.castShadow = leaf.castShadow = true; scene.add(trunk); scene.add(leaf); }

// ---------------- the sinkhole ----------------
const HX = 1.6, HZ = 5.0;                                    // hole centre (right in front of the hero's bumper)
const NA = 72;
const jag = a => 1 + 0.06 * Math.sin(5 * a + 0.7) + 0.035 * Math.sin(13 * a + 2.1) + 0.02 * Math.sin(29 * a);
const holeG = new THREE.Group(); holeG.position.set(HX, 0, HZ); scene.add(holeG);
// opening: writes 1 into the stencil where it is visible
const openShape = new THREE.Shape(); for (let i = 0; i <= NA; i++) { const a = i / NA * 2 * PI, r = jag(a); const x = Math.cos(a) * r, z = Math.sin(a) * r; i ? openShape.lineTo(x, -z) : openShape.moveTo(x, -z); }
const openGeo = new THREE.ShapeGeometry(openShape); openGeo.rotateX(-PI / 2);
const openM = new THREE.Mesh(openGeo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp }));
openM.position.y = 0.13; openM.renderOrder = 1; openM.userData.noAO = true; holeG.add(openM);
// interior walls + bottom (drawn only inside the stencil, without depth test)
const earthT = canvasTex(256, 512, (c, w, h) => { const bands = ['#8d6e4f', '#7a5a3e', '#9c7b55', '#6e4f35', '#83633f', '#5f4430', '#76583a'];
  let y = 0; let k = 0; while (y < h) { const bh = 12 + (hash(k) * 40 | 0); c.fillStyle = bands[k % bands.length]; c.fillRect(0, y, w, bh); y += bh; k++; }
  for (let i = 0; i < 3000; i++) { const v = hash(i * 3 + 1); c.fillStyle = v < 0.5 ? 'rgba(40,25,10,0.35)' : 'rgba(200,170,120,0.25)'; c.fillRect(hash(i * 7) * w, hash(i * 11) * h, 2 + hash(i) * 5, 2 + hash(i + 9) * 4); }
  for (let i = 0; i < 70; i++) { c.fillStyle = `rgb(${120 + hash(i) * 60 | 0},${110 + hash(i + 1) * 50 | 0},${100 + hash(i + 2) * 40 | 0})`; c.beginPath(); c.ellipse(hash(i + 5) * w, hash(i + 6) * h, 4 + hash(i + 7) * 9, 3 + hash(i + 8) * 6, 0, 0, 2 * PI); c.fill(); } }, true);
const DEPTHS = [0.12, -0.15, -0.5, -1.2, -2.5, -4.5, -8, -14, -24, -40, -70, -120];
const wallGeo = new THREE.BufferGeometry(); { const pos = [], col = [], uv = [], idx = []; const top = new THREE.Color('#c9a77c'), mid = new THREE.Color('#6b4b30'), bot = new THREE.Color('#000000');
  for (let k = 0; k < DEPTHS.length; k++) { const y = DEPTHS[k]; const d = -y; const c = d < 4 ? top.clone().lerp(mid, d / 4) : mid.clone().lerp(bot, clamp((d - 4) / 30));
    for (let i = 0; i <= NA; i++) { const a = i / NA * 2 * PI, r = jag(a); pos.push(Math.cos(a) * r, y, Math.sin(a) * r); col.push(c.r, c.g, c.b); uv.push(i / NA * 6, -y / 6); } }
  for (let k = 0; k < DEPTHS.length - 1; k++) for (let i = 0; i < NA; i++) { const a = k * (NA + 1) + i, b = a + 1, c = a + NA + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); wallGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); wallGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); wallGeo.setIndex(idx); wallGeo.computeVertexNormals(); }
const stIn = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc, stencilZPass: THREE.KeepStencilOp, depthTest: false, depthWrite: true };
const wallM = new THREE.Mesh(wallGeo, new THREE.MeshLambertMaterial(Object.assign({ map: earthT, vertexColors: true, side: THREE.DoubleSide }, stIn)));
wallM.renderOrder = 2; wallM.userData.noAO = true; wallM.frustumCulled = false; holeG.add(wallM);
const botM = new THREE.Mesh(new THREE.CircleGeometry(1.2, 40), new THREE.MeshBasicMaterial(Object.assign({ color: '#000000' }, stIn)));
botM.rotation.x = -PI / 2; botM.position.y = -119; botM.renderOrder = 2; botM.userData.noAO = true; holeG.add(botM);
// cracks around the edge + broken lip
const crackT = canvasTex(1024, 1024, (c, w, h) => { c.clearRect(0, 0, w, h); c.translate(w / 2, h / 2); const R0 = w * 0.5 / 1.6;
  c.strokeStyle = 'rgba(35,25,18,0.95)'; c.lineCap = 'round';
  for (let i = 0; i < 34; i++) { let a = i / 34 * 2 * PI + hash(i) * 0.15, r = R0 * jag(a) * 0.97; c.lineWidth = 3 + hash(i + 4) * 5; c.beginPath(); c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    const len = R0 * (0.12 + hash(i + 9) * 0.42); let rr_ = r; while (rr_ < r + len) { rr_ += 10 + hash(i * 7 + rr_) * 16; a += (hash(rr_ + i) - 0.5) * 0.12; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); c.lineWidth *= 0.93; } c.stroke(); }
  c.fillStyle = 'rgba(60,45,35,0.45)'; c.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * 2 * PI; const r = R0 * jag(a) * 1.07; i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); });
const crackM = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshLambertMaterial({ map: crackT, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }));
crackM.rotation.x = -PI / 2; crackM.position.y = 0.115; crackM.userData.noAO = true; holeG.add(crackM);
// little asphalt chunks on the rim
const CHUNKS = []; { const cg = new THREE.DodecahedronGeometry(0.16, 0); const cm = L('#4a4c50');
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(cg, cm); m.castShadow = true; m.renderOrder = 3; holeG.add(m); CHUNKS.push({ m, a: i / 26 * 2 * PI + hash(i) * 0.2, d: 0.06 + hash(i + 3) * 0.25, s: 0.6 + hash(i + 5) * 1.0 }); } }
// dust puffs
const blobT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const DUST = Array.from({ length: 16 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#c2ad8a', transparent: true, depthWrite: false, opacity: 0 })); s.renderOrder = 4; scene.add(s); return { s, a: hash(i) * 2 * PI, v: 0.5 + hash(i + 2), ph: hash(i + 4) }; });
// radius schedules
function steps(base, list) { return t => { let r = base; for (const [t0, r1, d = 0.35] of list) { if (t <= t0) break; const u = clamp((t - t0) / d); r = lerp(r, r1, u < 1 ? back(u) : 1); } return Math.max(0, r); }; }
const R_HOOK = [[tCrack, 1.3, 0.3], [tRedH2, 3.0, 0.4]];
const Rw = steps(0, [...R_HOOK, [tR0 - 0.05, 4.6], [tR1 - 0.05, 6.2], [tR2 - 0.05, 7.8], [tFalls - 0.1, 19, 0.9]]);
const Rr = steps(3.0, [[tG0, 2.4], [tG1, 1.8], [tSm0, 1.3], [tSm1, 0.85], [tSm2, 0.5], [tTiny, 0.09, 0.45]]);
let Rcur = 0;

// ---------------- traffic light on a mast arm (lamps side by side, facing the hero) ----------------
const TLP = V3(8.4, 0, 10.6), TLY = 5.6, TLZ = 7.9;
const tlG = new THREE.Group(); tlG.position.copy(TLP); scene.add(tlG);       // falls as one piece
const LX = [LANE - 0.62 - TLP.x, LANE - TLP.x, LANE + 0.62 - TLP.x];          // red, yellow, green (local x)
const lamps = {};
{ const pm = STD('#37474f', { metalness: 0.5, roughness: 0.4 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, TLY + 0.6, 10), pm); post.position.set(0, (TLY + 0.6) / 2, 0); tlG.add(post);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, TLP.x - LANE + 1.6, 8), pm); arm.rotation.z = PI / 2; arm.position.set(-(TLP.x - LANE + 1.6) / 2, TLY + 0.55, TLZ - TLP.z); tlG.add(arm);
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, TLP.z - TLZ, 6), pm); arm2.rotation.x = PI / 2; arm2.position.set(0, TLY + 0.55, (TLZ - TLP.z) / 2); tlG.add(arm2);
  const hd = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.72, 0.42), STD('#263238', { roughness: 0.5 })); hd.position.set(LX[1], TLY, TLZ - TLP.z); tlG.add(hd);
  const bp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.02, 0.05), STD('#ffd60a', { roughness: 0.6 })); bp.position.set(LX[1], TLY, TLZ - TLP.z - 0.24); tlG.add(bp);
  const hang = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), pm); hang.position.set(LX[1], TLY + 0.45, TLZ - TLP.z); tlG.add(hang);
  [['r', '#ff2a1a'], ['y', '#ffb300'], ['g', '#22e05a']].forEach(([k, col], i) => {
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.22, 20, 1, true, -PI * 0.5, PI), STD('#1c2428', { side: THREE.DoubleSide })); visor.rotation.x = PI / 2; visor.position.set(LX[i], TLY + 0.02, TLZ - TLP.z + 0.3); tlG.add(visor);
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshBasicMaterial({ color: col, toneMapped: false })); m.position.set(LX[i], TLY, TLZ - TLP.z + 0.215); tlG.add(m); lamps[k] = { m, col: new THREE.Color(col) }; });
  tlG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.renderOrder = 3; } }); }
const OFFC = new THREE.Color('#2a2f33');
// angry eyebrows (wrong way)
const brows = [0, 1].map(i => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.06), STD('#111')); b.position.set(LX[i], TLY + 0.43, TLZ - TLP.z + 0.25); b.rotation.z = i ? 0.38 : -0.38; b.renderOrder = 3; tlG.add(b); return b; });
const haloS = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#ff3a2a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); haloS.renderOrder = 5; scene.add(haloS);
// green sunglasses
const glasses = new THREE.Group(); scene.add(glasses);
{ const fr = STD('#111', { roughness: 0.3, metalness: 0.4 }); const lensM = new THREE.MeshStandardMaterial({ color: '#16c45a', emissive: '#0b6b2e', emissiveIntensity: 0.3, transparent: true, opacity: 0.72, roughness: 0.08, metalness: 0.3, depthWrite: false });
  for (const x of [-0.31, 0.31]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 28), fr); rim.position.x = x; glasses.add(rim); const ln = new THREE.Mesh(new THREE.CircleGeometry(0.29, 28), lensM); ln.position.set(x, 0, 0.005); ln.userData.noAO = true; glasses.add(ln); }
  const br = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.03, 6, 12, PI), fr); br.position.y = 0.05; glasses.add(br);
  for (const s of [-1, 1]) { const tp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.5), fr); tp.position.set(s * 0.62, 0.04, -0.25); glasses.add(tp); }
  glasses.traverse(o => { if (o.isMesh) { o.castShadow = true; o.renderOrder = 6; } }); glasses.visible = false; }
const GL_ON = V3(LANE - 0.31, TLY + 0.02, TLZ + 0.47);          // glasses seat on the red + yellow lamps
const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); glint.renderOrder = 7; scene.add(glint);

// ---------------- other things that fall in (wrong way) ----------------
const hero = makeCar('#1e88e5');
const redCar = makeCar('#e53935'), yelCar = makeCar('#fdd835');
const PROPS = [];
const benchG = new THREE.Group(); { const wm = L('#a0522d'), mm = STD('#333'); for (let i = 0; i < 3; i++) box(1.8, 0.07, 0.14, wm, 0, 0.5, -0.2 + i * 0.18, true, true, benchG); box(1.8, 0.4, 0.07, wm, 0, 0.8, 0.22, true, true, benchG); for (const x of [-0.8, 0.8]) box(0.07, 0.5, 0.5, mm, x, 0.25, 0, true, true, benchG); }
benchG.position.set(6.2, 0.09, -2.5); benchG.rotation.y = -PI / 2; scene.add(benchG);
const postbox = new THREE.Group(); { const pm = STD('#d32f2f'); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.2, 16), pm); c.position.y = 0.6; postbox.add(c); const t = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 8, 0, 2 * PI, 0, PI / 2), pm); t.position.y = 1.2; postbox.add(t); }
postbox.position.set(-5.6, 0.09, 9.5); scene.add(postbox);
for (const o of [benchG, postbox]) o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.renderOrder = 3; } });
const pRed = { x: -LANE, z: -11.6, h: PI }, pYel = { x: -11.8, z: LANE, h: -PI / 2 };
[[redCar, pRed], [yelCar, pYel]].forEach(([c, p]) => placeCar(c, p));
for (const c of [hero, redCar, yelCar]) c.traverse(o => { if (o.isMesh) o.renderOrder = 3; });
function fallTime(x, z, extra = 0.6) { const d = Math.hypot(x - HX, z - HZ) + extra; for (let t = tRedH; t < tRew0; t += 0.01) if (Rw(t) >= d) return t; return 999; }
PROPS.push({ o: redCar, tf: fallTime(pRed.x, pRed.z, 1.2), base: () => placeCar(redCar, pRed), spin: [0.9, 0.3, 0.5] });
PROPS.push({ o: yelCar, tf: fallTime(pYel.x, pYel.z, 1.2), base: () => placeCar(yelCar, pYel), spin: [-0.4, 0.2, -1.0] });
PROPS.push({ o: benchG, tf: fallTime(6.2, -2.5), p0: benchG.position.clone(), r0: benchG.rotation.clone(), spin: [1.5, 0.4, 0.8] });
PROPS.push({ o: postbox, tf: fallTime(-5.6, 9.5), p0: postbox.position.clone(), r0: postbox.rotation.clone(), spin: [-1.2, 0, 1.1] });
const tTLfall = Math.max(tFalls, fallTime(TLP.x, TLP.z, 0.2));

// ---------------- shaft through the earth (far away, underground) ----------------
const SX = 900, SZ = 0, SY0 = -40, SL = 1000, SR = 7;
const shaftT = canvasTex(256, 2048, (c, w, h) => { const bands = ['#8d6e4f', '#6e4f35', '#9c7b55', '#5f4430', '#7d7d7d', '#5a5a62', '#8a6a48', '#4a3a30'];
  let y = 0, k = 0; while (y < h * 0.7) { const bh = 16 + (hash(k + 50) * 60 | 0); c.fillStyle = bands[k % bands.length]; c.fillRect(0, y, w, bh); y += bh; k++; }
  const g = c.createLinearGradient(0, h * 0.62, 0, h); g.addColorStop(0, '#5a2a10'); g.addColorStop(0.35, '#d84315'); g.addColorStop(0.7, '#ff9800'); g.addColorStop(1, '#ffe082'); c.fillStyle = g; c.fillRect(0, h * 0.62, w, h * 0.38);
  for (let i = 0; i < 2500; i++) { const yy = hash(i * 13) * h; c.fillStyle = yy < h * 0.65 ? 'rgba(30,20,10,0.35)' : 'rgba(255,240,150,0.5)'; c.fillRect(hash(i * 5) * w, yy, 2 + hash(i) * 6, 2 + hash(i + 1) * 4); }
  for (let i = 0; i < 60; i++) { const yy = h * (0.66 + hash(i + 300) * 0.3); c.strokeStyle = 'rgba(255,235,120,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(hash(i + 400) * w, yy); c.bezierCurveTo(hash(i + 401) * w, yy + 30, hash(i + 402) * w, yy - 30, hash(i + 403) * w, yy + 20); c.stroke(); } });
const shaft = new THREE.Mesh(new THREE.CylinderGeometry(SR, SR, SL, 32, 1, true), new THREE.MeshBasicMaterial({ map: shaftT, side: THREE.BackSide, fog: false }));
shaft.position.set(SX, SY0 - SL / 2, SZ); shaft.userData.noAO = true; scene.add(shaft);
const core = new THREE.Mesh(new THREE.CircleGeometry(SR, 32), new THREE.MeshBasicMaterial({ color: '#fff3c0', fog: false, toneMapped: false })); core.rotation.x = -PI / 2; core.position.set(SX, SY0 - SL + 0.5, SZ); scene.add(core);
const coreLight = new THREE.PointLight('#ff9a3c', 0, 80, 1.2); scene.add(coreLight);
const lid = new THREE.Mesh(new THREE.CircleGeometry(SR, 32), new THREE.MeshBasicMaterial({ color: '#000', fog: false })); lid.rotation.x = PI / 2; lid.position.set(SX, SY0, SZ); scene.add(lid);

// ---------------- Australia (far away, other side of the world) ----------------
const AX = 2600;
const desertT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 190 + hash(i) * 65 | 0; c.fillStyle = `rgb(${v},${v * 0.92 | 0},${v * 0.86 | 0})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2 + hash(i + 1) * 3, 2 + hash(i + 2) * 3); } }, true);
plane(AX - 900, AX + 900, -900, 900, L('#d9774a', { map: desertT }), 0.0, 10);
plane(AX - RW, AX + RW, -900, 900, asphaltMat, 0.04, 7);
{ const dg = new THREE.PlaneGeometry(0.15, 3); dg.rotateX(-PI / 2); const list = []; for (let z = -400; z < 400; z += 7) list.push([AX, 0.07, z]); instanced(dg, markMat, list, false);
  const eg = new THREE.PlaneGeometry(0.15, 800); eg.rotateX(-PI / 2); for (const x of [-RW + 0.3, RW - 0.3]) { const m = new THREE.Mesh(eg, markMat); m.position.set(AX + x, 0.07, 0); scene.add(m); } }
const ahole = new THREE.Mesh(new THREE.CircleGeometry(1.9, 40), new THREE.MeshBasicMaterial({ color: '#0d0805', polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 })); ahole.rotation.x = -PI / 2; ahole.position.set(AX + 0.2, 0.09, 2); scene.add(ahole);
const acrack = crackM.clone(); acrack.material = crackM.material; acrack.position.set(AX + 0.2, 0.085, 2); acrack.scale.setScalar(1.9); scene.add(acrack);
// big red rock on the horizon, spinifex, gum trees
{ const rk = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), L('#c1502e')); rk.scale.set(140, 38, 60); rk.position.set(AX - 120, -6, -520); rk.receiveShadow = true; scene.add(rk);
  const R = rng(63); const sp = []; for (let i = 0; i < 600; i++) { const x = AX + (R() - 0.5) * 500, z = (R() - 0.5) * 700; if (Math.abs(x - AX) < 6) continue; sp.push([x, 0.2, z, R() * 3, 0.6 + R() * 0.8, 0.4 + R() * 0.4, 0.6 + R() * 0.8]); }
  const sm = instanced(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: '#a8a04a', flatShading: true }), sp);
  const gt = []; for (let i = 0; i < 40; i++) { const x = AX + (R() < 0.5 ? -1 : 1) * (14 + R() * 120), z = (R() - 0.5) * 500; gt.push([x, z, 0.8 + R() * 0.7]); }
  const tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.35, 5, 6), L('#e8e0d0'), gt.length), cr = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.4, 1), new THREE.MeshLambertMaterial({ color: '#7d9a5a', flatShading: true }), gt.length);
  gt.forEach(([x, z, s], i) => { _m.compose(_v.set(x, 2.5 * s, z), _q.identity(), _s.set(s, s, s)); tr.setMatrixAt(i, _m); _m.compose(_v.set(x, 5.6 * s, z), _q.identity(), _s.set(s * 1.3, s * 0.7, s * 1.3)); cr.setMatrixAt(i, _m); });
  tr.castShadow = cr.castShadow = true; scene.add(tr); scene.add(cr); }
const roosT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffd60a'; c.save(); c.translate(w / 2, h / 2); c.rotate(PI / 4); c.fillRect(-88, -88, 176, 176); c.lineWidth = 8; c.strokeStyle = '#111'; c.strokeRect(-80, -80, 160, 160); c.restore();
  c.fillStyle = '#111'; c.beginPath(); // simple hopping kangaroo silhouette
  c.ellipse(120, 140, 40, 24, -0.5, 0, 2 * PI); c.fill(); c.beginPath(); c.ellipse(158, 98, 14, 10, -0.3, 0, 2 * PI); c.fill();
  c.beginPath(); c.moveTo(150, 92); c.lineTo(156, 70); c.lineTo(162, 92); c.fill(); c.lineWidth = 9; c.strokeStyle = '#111'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(145, 115); c.lineTo(138, 112); c.stroke(); c.beginPath(); c.moveTo(85, 150); c.quadraticCurveTo(55, 170, 40, 200); c.stroke(); c.beginPath(); c.moveTo(118, 160); c.lineTo(108, 182); c.lineTo(135, 186); c.stroke(); });
const welT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#1b6e3c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 10; c.strokeRect(12, 12, w - 24, h - 24); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '900 50px Inter'; c.fillText("G'DAY!", w / 2, 78); c.font = '900 44px Inter'; c.fillText('WELCOME TO', w / 2, 140); c.fillText('AUSTRALIA', w / 2, 192); });
function sign(x, z, wd, ht, tex, py, ry) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  for (const px of wd > 2 ? [-wd * 0.35, wd * 0.35] : [0]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, py, 8), STD('#9e9e9e', { metalness: 0.6 })); p.position.set(px, py / 2, -0.05); p.castShadow = true; g.add(p); }
  const b = new THREE.Mesh(new THREE.PlaneGeometry(wd, ht), L('#fff', { map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); b.position.y = py; b.castShadow = true; g.add(b); return g; }
sign(AX + 5.6, -3, 1.6, 1.6, roosT, 2.6, -0.35);
sign(AX - 6.4, -9, 4.4, 2.2, welT, 2.9, 0.45);

// ---------------- golf ball + flag (right way) ----------------
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 12), STD('#ffffff', { roughness: 0.35 })); ball.castShadow = true; ball.renderOrder = 3; scene.add(ball);
const flagG = new THREE.Group(); flagG.position.set(HX, 0.1, HZ); scene.add(flagG);
const flagP = new THREE.Group(); flagG.add(flagP);
{ const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8), STD('#f5f5f5')); pole.position.y = 0.75; flagP.add(pole);
  const ft = canvasTex(256, 160, (c, w, h) => { c.fillStyle = '#e11d2e'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h * 0.5); c.lineTo(0, h); c.fill(); c.fillStyle = '#fff'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', 80, h / 2 + 4); });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.44), L('#fff', { map: ft, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); fl.position.set(0.36, 1.25, 0); flagP.add(fl); flagG.userData.fl = fl;
  flagP.traverse(o => { if (o.isMesh) { o.castShadow = true; o.renderOrder = 3; } }); }
flagG.rotation.y = PI - 0.5;

// ---------------- hero motion ----------------
const HZ0 = 11.0;
const pathW = (() => { const P = [[LANE, HZ0], [LANE, 9.6], [-0.4, 7.6], [-2.9, 5.2], [-2.6, 1.5], [0.2, -1.4], [LANE, -3.6], [LANE, -40]]; const pts = []; for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < 12; k++) { const u = k / 12; const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(P.length - 1, i + 2)];
    const cr = (p0, p1, p2, p3) => 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u); pts.push(new THREE.Vector2(cr(a[0], b[0], c[0], d[0]), cr(a[1], b[1], c[1], d[1]))); }
  pts.push(new THREE.Vector2(LANE, -40)); const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1])); return { pts, cum, len: cum[cum.length - 1] }; })();
function pAt(s) { s = clamp(s, 0, pathW.len); let i = 1; while (i < pathW.cum.length - 1 && pathW.cum[i] < s) i++; const a = pathW.pts[i - 1], b = pathW.pts[i], u = (s - pathW.cum[i - 1]) / Math.max(1e-6, pathW.cum[i] - pathW.cum[i - 1]); return { x: lerp(a.x, b.x, u), z: lerp(a.y, b.y, u), h: Math.atan2(-(b.x - a.x), -(b.y - a.y)) }; }
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
// distance along the swerve path: s(HZ0)=0 ; stop where the rear is just over the final edge
let S_STOP = 0; { for (let s = 0; s < pathW.len; s += 0.05) { const p = pAt(s); if (p.z <= -5.2) { S_STOP = s; break; } } }
const sW = mono([[0, 0], [tGo - 0.05, 0], [tDrive + 1.2, 7.5], [tQuick + 0.9, 14.5], [tSees - 0.2, S_STOP - 0.6], [tSees + 0.4, S_STOP], [99, S_STOP]]);
const tHeroFall = tFalls + 0.12;
// Australia: pops out of the hole, flips, lands on the roof
const tPopA = tPop - 0.05, tLand = tUpside - 0.05;
// right: drive on
const zR = mono([[0, HZ0], [tDriveR - 0.35, HZ0], [tDriveR + 2.2, -2], [S('right7').start + 0.6, -18], [TOTAL + 1, -70]]);

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
const FallCam = () => t => { const p = hero.position; return [V3(HX + 1.5, 34, HZ + 14), V3(lerp(HX, p.x, 0.5), Math.max(-30, p.y * 0.5), lerp(HZ, p.z, 0.5) - 2), 40]; };
const ShaftCam = () => t => { const p = hero.position; return [V3(SX + 2.2, p.y + 11, SZ + 1.5), V3(SX, p.y - 6, SZ - 0.5), 60]; };
const camKeys = [
  [0.0, Ac([4.2, 3.4, 22], [1.4, 3.2, 4], 40)],
  [tThen - 0.3, Ac([3.9, 3.3, 20.5], [1.4, 3.1, 4], 40)],
  ...cut(tThen - 0.25, Ac([6.8, 1.7, 1.0], [1.5, 0.4, 8.4], 40)),
  [tCrack - 0.2, Ac([6.6, 1.8, 1.2], [1.6, 0.3, 7.6], 40)],
  [tCrack + 0.5, Ac([6.9, 2.3, 0.6], [1.6, 0.0, 6.6], 40)],
  ...cut(tSink - 0.25, Ac([5.2, 8.5, 15.5], [HX, 0, HZ + 0.5], 40)),
  [tEvery - 0.3, Ac([5.0, 8.8, 15.8], [HX, 0, HZ + 0.4], 40)],
  ...cut(tEvery - 0.25, Ac([4.4, 6.0, 21], [1.6, 2.6, 4.5], 40)),
  [tBigger + 0.3, Ac([4.6, 6.6, 22], [1.6, 2.4, 4.5], 40)],
  ...cut(tWhat - 0.25, Ac([10, 14, 25], [0.8, 0, 2], 40)),
  [S('hook2').end + 0.5, Ac([10, 14, 24.5], [0.8, 0, 2], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, HeroCam([2.6, 2.4, 8.5], [-0.5, 0.8, -14], 40)),
  [tDrive, HeroCam([2.8, 2.6, 8.5], [-0.8, 0.6, -14], 40)],
  [tGrows, HeroCam([3.4, 3.8, 10], [-0.5, 0.6, -14], 40)],
  ...cut(tBigM - 0.15, Ac([LANE + 0.7, 4.6, 19.5], [LANE - 0.1, 5.9, TLZ], 22)),
  [tAngry + 0.2, Ac([LANE + 0.6, 4.7, 18.8], [LANE - 0.1, 5.95, TLZ], 21)],
  ...cut(tR0 - 0.3, Ac([3, 22, 25], [1.2, 0, -1], 40)),
  [tR2 + 0.5, Ac([3, 24, 27], [1.2, 0, -2], 40)],
  ...cut(tWhole - 0.2, Ac([3, 32, 30], [1.0, -2, -3], 40)),
  [tFalls - 0.1, Ac([3, 32, 30], [1.0, -2, -3], 40)],
  [tYou - 0.3, FallCam()],
  ...cut(tYou - 0.05, ShaftCam()),
  [tAnd - 0.1, ShaftCam()],
  ...cut(tAnd + 0.05, Ac([AX + 8, 3.2, 13], [AX + 0.3, 4.6, -1], 44)),
  [tLand - 0.2, Ac([AX + 7.5, 2.8, 11], [AX + 0.4, 2.6, -1.8], 42)],
  [tLand + 0.8, Ac([AX + 6.5, 2.2, 8.5], [AX + 0.5, 1.5, -2.5], 40)],
  [tRew0, Ac([AX + 6.2, 2.1, 8.0], [AX + 0.5, 1.5, -2.5], 40)],
  // right
  ...cut(tRew1, Ac([10, 14, 25], [0.8, 0, 2], 40)),
  ...cut(tStay - 0.2, Ac([5.2, 1.6, 2.6], [LANE - 0.2, 1.0, HZ0 - 0.5], 40)),
  [tGlove + 0.3, Ac([5.0, 1.7, 2.9], [LANE - 0.3, 1.1, HZ0 - 0.5], 40)],
  ...cut(tSun - 0.2, Ac([-3.6, 2.3, 4.2], [0.6, 1.7, 10.6], 30)),
  [tThrow - 0.3, Ac([-3.5, 2.4, 4.4], [0.6, 1.9, 10.6], 30)],
  ...cut(tThrow - 0.2, Ac([-6.5, 3.0, 21], [0.9, 4.0, 9.0], 40)),
  [tLightR + 0.1, Ac([-6.2, 3.4, 20.5], [1.2, 4.6, 8.6], 40)],
  ...cut(tVery - 0.2, Ac([LANE + 0.7, 4.6, 19.5], [LANE - 0.1, 5.9, TLZ], 22)),
  [tLooks + 0.5, Ac([LANE + 0.6, 4.7, 18.8], [LANE - 0.1, 5.95, TLZ], 21)],
  ...cut(tG1 - 0.6, Ac([HX + 7.8, 7.6, HZ + 1.0], [HX, 0, HZ], 40)),
  [tSm1, Ac([HX + 5.2, 5.0, HZ + 0.7], [HX, 0, HZ], 40)],
  [tTiny + 0.3, Ac([HX + 1.45, 1.15, HZ + 0.25], [HX - 0.05, 0, HZ], 40)],
  [tGolf - 0.1, Ac([HX + 1.35, 1.05, HZ + 0.3], [HX - 0.1, 0, HZ], 40)],
  ...cut(tHoleIn - 0.15, Ac([HX - 0.9, 1.5, HZ - 4.6], [HX + 0.5, 1.1, HZ + 4], 40)),
  [tDriveR - 0.3, Ac([HX - 0.8, 1.6, HZ - 4.9], [HX + 0.5, 1.3, HZ + 4], 40)],
  ...cut(tDriveR - 0.25, Ac([LANE + 2.6, 2.6, HZ0 + 7.5], [LANE, 1.2, HZ0 - 8], 40)),
  [S('right7').start, HeroCam([1.6, 3.5, 12], [0, 1.6, -14], 40)],
  [TOTAL, HeroCam([1.2, 5.0, 14], [0, 2.0, -16], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
const SKY_TOWN = new THREE.Color('#bfe3ff'), SKY_AUS = new THREE.Color('#8ec5ff');
let screen = {};
function lampsSet(r, y, g, redAsGreen = false) {
  lamps.r.m.material.color.copy(r > 0 ? (redAsGreen ? new THREE.Color('#5dff7a') : lamps.r.col) : OFFC).multiplyScalar(r > 0 ? Math.max(0.35, r) : 1);
  lamps.y.m.material.color.copy(y > 0 ? lamps.y.col : OFFC); lamps.g.m.material.color.copy(g > 0 ? lamps.g.col : OFFC);
}
function update(t) {
  const right = isRight(t);
  const R = right ? Rr(t) : Rw(t); Rcur = R;
  // ---- hole ----
  holeG.visible = R > 0.01; holeG.scale.set(Math.max(R, 0.001), 1, Math.max(R, 0.001));
  crackM.scale.setScalar(1);
  CHUNKS.forEach((c, i) => { const r = R * jag(c.a) + c.d * Math.min(1, R); c.m.position.set(Math.cos(c.a) * r / Math.max(R, 0.001), 0.12, Math.sin(c.a) * r / Math.max(R, 0.001)); c.m.scale.set(c.s * Math.min(1, R) / Math.max(R, 0.001) * 0.8, c.s * Math.min(1, R) * 0.6, c.s * Math.min(1, R) / Math.max(R, 0.001) * 0.8); c.m.rotation.set(c.a * 3, c.a * 5, 0); c.m.visible = R > 0.25; });
  // ---- lamps ----
  let lr = 1, ly = 0, lg = 0, redAsGreen = false, halo = 0;
  if (!right) {
    if (t > tEvery - 0.1 && t < tLightH - 0.05) { lr = 0; lg = 1; } else if (t >= tLightH - 0.05 && t < tRedH2 - 0.05) { lr = 0; ly = 1; }
    for (const tr of [tR0, tR1, tR2]) { const k = t - tr + 0.08; if (k > 0 && k < 0.45) { halo = Math.max(halo, 1 - k / 0.45); } }
    if (t > tR0 - 0.3 && t < tFalls) lr = (halo > 0.05) ? 1 : 0.45;
  } else {
    redAsGreen = t > tLightR + 0.05;
    if (t > tDriveR - 0.45) { lr = 0; lg = 1; }
    for (const tr of [tG0, tG1, tSm0, tSm1, tSm2, tTiny]) { const k = t - tr + 0.05; if (k > 0 && k < 0.4) lr = 1 + 0.6 * (1 - k / 0.4); }
  }
  lampsSet(lr, ly, lg, redAsGreen);
  const lampW = tlG.localToWorld(V3(LX[0], TLY, TLZ - TLP.z + 0.35));
  haloS.position.copy(lampW); haloS.scale.setScalar(1.3 + 1.6 * halo); haloS.material.opacity = 0.85 * halo; haloS.material.color.set('#ff3a2a');
  // brows: drop in when the light sees you
  const bA = !right ? ramp(t, tSees - 0.1, tSees + 0.25) : 0;
  brows.forEach((b, i) => { b.visible = bA > 0.01; b.position.y = TLY + 0.43 + 0.25 * (1 - bA); b.rotation.z = (i ? 1 : -1) * (0.38 + 0.12 * Math.sin(t * 30) * win(t, tAngry - 0.1, tAngry + 0.6, 0.1)); });
  // traffic light falls into the hole
  tlG.position.copy(TLP); tlG.rotation.set(0, 0, 0);
  if (!right && t > tTLfall) { const k = t - tTLfall; tlG.rotation.z = -Math.min(1.3, 1.8 * k * k + 0.3 * k); tlG.position.y = -0.5 * 14 * Math.max(0, k - 0.25) ** 2; tlG.position.x = TLP.x - Math.min(3, 2 * k); }
  if (!right && t > tAngry - 0.1 && t < tR0) tlG.position.x = TLP.x + 0.04 * Math.sin(t * 60);
  // ---- props falling ----
  PROPS.forEach(pr => { if (pr.base) pr.base(); else { pr.o.position.copy(pr.p0); pr.o.rotation.copy(pr.r0); }
    if (!right && t > pr.tf) { const k = t - pr.tf; pr.o.position.y -= 0.5 * 16 * k * k; pr.o.rotation.x += pr.spin[0] * k; pr.o.rotation.y += pr.spin[1] * k; pr.o.rotation.z += pr.spin[2] * k;
      const dx = HX - pr.o.position.x, dz = HZ - pr.o.position.z, dl = Math.hypot(dx, dz); pr.o.position.x += dx / dl * Math.min(2, k * 3); pr.o.position.z += dz / dl * Math.min(2, k * 3); } });
  // ---- hero ----
  hero.visible = true; hero.rotation.set(0, 0, 0);
  if (!right) {
    if (t < tYou - 0.05) {
      const p = pAt(sW(t)); placeCar(hero, { x: p.x, z: p.z, h: p.h });
      if (t > tR2) { const k = clamp((t - tR2) / 0.4); hero.rotation.x = -0.07 * back(k) + 0.015 * Math.sin(t * 9); }     // rear wheels over the edge: nose up
      if (t > tHeroFall) { const k = t - tHeroFall; hero.position.y = -0.5 * 16 * k * k; hero.rotation.x = -0.07 - 1.4 * k * k; hero.position.z += Math.min(3, k * 2.6); }
    } else if (t < tAnd) { // through the earth
      const u = clamp((t - tYou) / (tAnd - tYou)); const y = SY0 - 30 - (SL - 70) * Math.pow(u, 1.35);
      hero.position.set(SX + 0.8 * Math.sin(u * 7), y, SZ + 0.8 * Math.cos(u * 5)); hero.rotation.set(u * 9, u * 4, u * 6);
    } else { // Australia: pop out, flip, land on the roof
      const ax = AX + 0.2 + LANE * 0, az = 2;
      if (t < tPopA) { hero.position.set(ax, -3, az); }
      else if (t < tLand) { const u = clamp((t - tPopA) / (tLand - tPopA)); hero.position.set(ax + 0.3 * u, 5.8 * 4 * u * (1 - u) + lerp(-1.5, 1.62, u), az - 4.5 * u); hero.rotation.set(-0.4 * Math.sin(PI * u), 0.5 * u, PI * ease(u)); }
      else { const k = t - tLand; hero.position.set(ax + 0.3, 1.62 + 0.3 * Math.exp(-k * 6) * Math.abs(Math.sin(k * 14)), az - 4.5); hero.rotation.set(0.04 * Math.exp(-k * 4) * Math.sin(k * 11), 0.5, PI); }
      hero.userData.spin = (hero.userData.spin || 0) + 0.45; hero.userData.wheels.forEach(w => w.rotation.x = hero.userData.spin);
    }
  } else {
    placeCar(hero, { x: LANE, z: zR(t), h: 0 });
  }
  if (!right && t >= tYou - 0.05) hero.userData.bodyG.rotation.set(0, 0, 0);
  hero.userData.tl.emissiveIntensity = (right && t < tDriveR) || (!right && t < tGo) ? 1.0 : 0.35;
  // ---- sky (town vs Australia) ----
  const aus = !right && t >= tAnd + 0.05 && t < tRew0 + 0.2;
  scene.background.copy(aus ? SKY_AUS : SKY_TOWN); scene.fog.color.copy(aus ? SKY_AUS : SKY_TOWN);
  // core glow while falling
  const cg = !right && t > tYou && t < tAnd ? ramp(t, tMiddle - 0.3, tEarth) : 0; coreLight.intensity = 900 * cg; coreLight.position.set(SX, hero.position.y - 8, SZ);
  // ---- glasses (right way) ----
  glasses.visible = right && t > tSun - 0.1;
  if (glasses.visible) {
    const win0 = V3(LANE - 1.25, 1.75, HZ0 - 0.4);
    if (t < tThrow + 0.1) { const up = back(clamp((t - tSun + 0.1) / 0.45)); glasses.position.set(win0.x - 0.25 * up, lerp(1.2, win0.y + 0.1 * Math.sin(t * 3), up), win0.z); glasses.rotation.set(0.15, -2.6 + 0.2 * Math.sin(t * 2), 0); glasses.scale.setScalar(Math.max(0.01, up) * 1.2); }
    else if (t < tLightR + 0.05) { const u = clamp((t - tThrow - 0.1) / (tLightR + 0.05 - tThrow - 0.1)); const e = ease(u);
      glasses.position.set(lerp(win0.x - 0.25, GL_ON.x, e), lerp(win0.y, GL_ON.y, e) + 4.5 * Math.sin(PI * u), lerp(win0.z, GL_ON.z, e)); glasses.rotation.set(0, lerp(-2.6, 0, e) + 4 * PI * e, 0); glasses.scale.setScalar(lerp(1.2, 1.05, e)); }
    else { const k = t - tLightR - 0.05; glasses.position.copy(GL_ON); glasses.position.y += 0.06 * Math.exp(-k * 8) * Math.sin(k * 30); glasses.rotation.set(0, 0, 0); glasses.scale.setScalar(1.05); }
  }
  const gl = right ? win(t, tCool - 0.15, tCool + 0.7, 0.15) : 0; glint.position.copy(GL_ON).add(V3(-0.45, 0.18, 0.12)); glint.scale.setScalar(0.25 + 0.6 * gl * (0.7 + 0.3 * Math.sin(t * 20))); glint.material.opacity = gl;
  // ---- golf ball + flag ----
  const bIn = tIn + 0.05;
  ball.visible = right && t > tGolf - 0.6 && t < bIn + 0.4;
  if (ball.visible) { const u = clamp((t - (tGolf - 0.6)) / (bIn - (tGolf - 0.6))); const e = 1 - Math.pow(1 - u, 1.6);
    const sx = HX - 3.2, sz = HZ + 0.12; let x = lerp(sx, HX, e), z = lerp(sz, HZ, e), y = 0.18;
    if (t > bIn) { const k = t - bIn; y = 0.18 - 0.6 * k - 4 * k * k; x = HX; z = HZ; }
    ball.position.set(x, y, z); ball.rotation.z = (x - sx) * 8; }
  const fA = right ? back(clamp((t - tHoleIn + 0.05) / 0.4)) : 0; flagG.visible = fA > 0.01; flagG.scale.set(1, Math.max(0.01, fA), 1);
  if (flagG.visible) { let bend = 0; const hzF = hero.position.z - HZ; if (t > tDriveR && hzF < 2.4 && hzF > -2.4) bend = 1.35; let spring = 0; const tPass = (() => { for (let tt = tDriveR; tt < TOTAL; tt += 0.02) if (zR(tt) - HZ < -2.4) return tt; return 999; })(); if (t > tPass) { const k = t - tPass; spring = 1.35 * Math.exp(-k * 3) * Math.cos(k * 14); }
    flagP.rotation.x = -(bend || spring) * (bend ? 1 : 1); flagG.userData.fl.rotation.y = 0.25 * Math.sin(t * 6); }
  // ---- dust ----
  let dA = 0, dT = 0; for (const [tt, a] of [[tCrack, 1], [tRedH2, 0.8], [tR0, 0.9], [tR1, 1], [tR2, 1], [tFalls, 1.2]]) { const k = t - tt; if (!right && k > 0 && k < 1.6) { dA = a; dT = k; } }
  DUST.forEach(d => { const on = dA > 0; d.s.visible = on; if (!on) return; const r = R * jag(d.a) + d.v * dT * 1.5; d.s.position.set(HX + Math.cos(d.a) * r, 0.3 + dT * (0.8 + d.ph), HZ + Math.sin(d.a) * r); d.s.scale.setScalar((0.8 + dT * 2.2) * (0.6 + R * 0.15)); d.s.material.opacity = 0.32 * dA * (1 - dT / 1.6) * ramp(dT, 0.15, 0.4); });
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.12; camera.updateProjectionMatrix();
  let shake = 0; if (!right) for (const tt of [tCrack, tRedH2, tR0, tR1, tR2, tFalls]) shake = Math.max(shake, win(t, tt - 0.02, tt + 0.5, 0.05));
  applyCam(c, t, shake > 0.02 ? 0.1 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { light: project(V3(LANE, TLY + 0.9, TLZ)), hole: project(V3(HX, 0, HZ)), hero: project(hero.localToWorld(V3(0, 1.8, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('RED LIGHT', RED, tRedH - 0.1, tThen - 0.2, 58);
    P_('RIGHT IN FRONT OF YOU...', '#e65100', tThen - 0.1, tCrack - 0.15, 48, iconWarn);
    floatText('CRACK!', W / 2, 760, t, tCrack, tCrack + 1.0, 150, YEL, -0.07);
    P_('SINKHOLE', '#6d4c41', tSink - 0.1, tEvery - 0.2, 64, iconWarn);
    P_('EVERY RED = BIGGER', RED, tEvery - 0.1, S('hook2').end + 0.3, 54, iconWarn);
    P_('JUST GO', RED, tJust - 0.15, tBigM - 0.15, 60, iconX);
    floatText('VROOOM!', W / 2, 780, t, tGo + 0.1, tGo + 1.3, 110, YEL, -0.06);
    P_('IT SEES YOU', RED, tSees - 0.15, tAngry - 0.15, 56, iconWarn);
    P_('ANGRY TRAFFIC LIGHT', RED, tAngry - 0.15, tR0 - 0.25, 50, iconWarn);
    floatText('RED!', W / 2 - 200, 640, t, tR0, tR0 + 0.9, 120, '#ff3b30', -0.12);
    floatText('RED!', W / 2 + 190, 760, t, tR1, tR1 + 0.9, 140, '#ff3b30', 0.1);
    floatText('RED!!', W / 2, 880, t, tR2, tR2 + 1.0, 170, '#ff3b30', -0.05);
    P_('THE CROSSING FALLS IN', RED, tWhole - 0.1, tYou - 0.15, 50, iconX);
    P_('THROUGH THE EARTH', '#e65100', tYou - 0.05, tAnd - 0.1, 54, iconX);
    floatText('AAAAH!', W / 2, 700, t, tDrop, tDrop + 1.2, 120, YEL, 0.06);
    P_('AUSTRALIA', '#00897b', tAus - 0.15, tUpside - 0.2, 60);
    floatText('POP!', W / 2, 760, t, tPop, tPop + 0.8, 140, YEL, -0.06);
    P_('UPSIDE DOWN', RED, tUpside - 0.15, tRew0, 58, iconX);
  } else {
    P_('STAY BEHIND THE LINE', GREEN, tStay - 0.1, tOpen - 0.15, 52, iconCheck);
    P_('OPEN THE GLOVEBOX', GREEN, tOpen - 0.15, tSun - 0.2, 54, iconCheck);
    P_('GREEN SUNGLASSES', GREEN, tSun - 0.15, tThrow - 0.2, 54, iconCheck);
    P_('ON THE TRAFFIC LIGHT', GREEN, tThrow - 0.15, tVery - 0.2, 50, iconCheck);
    P_('VERY COOL', '#00897b', tVery - 0.1, tNow - 0.2, 64);
    floatText('*BLING*', W / 2 + 140, 640, t, tCool - 0.05, tCool + 0.9, 90, '#fff', 0.1);
    P_('RED LOOKS GREEN', GREEN, tRedR - 0.15, tG1 - 0.7, 58, iconCheck);
    P_('EVERY GREEN = SMALLER', GREEN, tG1 - 0.6, S('right4').end + 0.2, 52, iconCheck);
    floatText('SMALLER', W / 2, 760, t, tSm1, tSm1 + 0.8, 100, YEL, -0.06);
    floatText('SMALLER!', W / 2, 860, t, tSm2, tSm2 + 0.8, 110, YEL, 0.06);
    P_('TINY LITTLE HOLE', GREEN, tUntil - 0.1, tGolf - 0.2, 56, iconCheck);
    floatText('HOLE IN ONE!', W / 2, 720, t, tHoleIn - 0.05, tHoleIn + 1.4, 120, YEL, -0.06);
    P_('DRIVE ON', GREEN, tDriveR - 0.2, S('right6').end + 0.5, 60, iconCheck);
  }
}
window.dbg = { hero, Rw, Rr };
start(update, hud);
