// Episode 73: Roadworks next to a building site – the crane hook lands on your roof, the crane driver thinks you're the bricks
// wrong: floor it -> wheels already in the air, crane swings round faster and faster (fairground ride) -> put on the top floor,
//        builders keep building: walls, windows, roof -> your car now lives on the tenth floor (nose in the window, honk)
// right: stay calm, engine off, hazards -> sign out of the sunroof "I AM NOT THE BRICKS" -> driver reads it with binoculars: oops
//        -> to say sorry he lifts you gently over the whole queue -> sets you down at the front as the light turns green: express lane
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, box, makeLandscape, makeCar, placeCar, applyCam,
  project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, blink,
  roundedPath, pathAt, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;

// ---------------- timing ----------------
const tRoadworks = WT('hook1', 'Roadworks'), tRed = WT('hook1', 'Red'), tThenH = WT('hook1', 'Then'), tSomething = WT('hook1', 'Something');
const tClunk = tSomething - 0.33;
const tCraneH = WT('hook2', 'crane'), tCrane2 = WT('hook2', 'crane', 1), tThinks = WT('hook2', 'thinks'), tBricksH = WT('hook2', 'bricks'), tWhat = WT('hook2', 'What');
const tFloor = WT('wrong1', 'floor'), tGet = WT('wrong1', 'Get');
const tWheels = WT('wrong2', 'wheels'), tAir = WT('wrong2', 'air'), tSwings = WT('wrong2', 'swings'), tFaster = WT('wrong2', 'Faster'), tFair = WT('wrong2', 'fairground');
const tPuts = WT('wrong3', 'puts'), tTop = WT('wrong3', 'top'), tBuilders = WT('wrong3', 'builders'), tWalls = WT('wrong3', 'Walls'), tWindows = WT('wrong3', 'Windows'), tRoof = WT('wrong3', 'roof'), tYour = WT('wrong3', 'Your'), tTenth = WT('wrong3', 'tenth'), tFloor2 = WT('wrong3', 'floor', 1);
const tStay = WT('right2', 'Stay'), tEngine = WT('right2', 'Engine'), tHazard = WT('right2', 'Hazard');
const tHold = WT('right3', 'hold'), tSign = WT('right3', 'sign'), tNot = WT('right3', 'not');
const tCraneR = WT('right4', 'crane'), tBino = WT('right4', 'binoculars'), tReads = WT('right4', 'Reads'), tOops = WT('right4', 'Oops');
const tSorry = WT('right5', 'sorry'), tLift = WT('right5', 'lift'), tGently = WT('right5', 'Gently'), tOver = WT('right5', 'Over');
const tPutsR = WT('right6', 'puts'), tFront = WT('right6', 'front'), tGreen = WT('right6', 'green'), tExpress = WT('right6', 'Express');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- street ----------------
const RW = 3.6, LANE = 1.75;
plane(-RW, RW, -400, 400, asphaltMat, 0.04, 7);
const walkMat = L('#cfc9be');
plane(-8, -RW, -400, 400, walkMat, 0.09, 4); plane(RW, 7.2, -400, 400, walkMat, 0.09, 4);
box(0.18, 0.16, 800, L('#9e9a92'), -RW - 0.09, 0.08, 0); box(0.18, 0.16, 800, L('#9e9a92'), RW + 0.09, 0.08, 0);
{ const dg = new THREE.PlaneGeometry(0.15, 3); dg.rotateX(-PI / 2); const list = []; for (let z = -300; z < 300; z += 7) list.push(z);
  const dI = new THREE.InstancedMesh(dg, markMat, list.length); list.forEach((z, i) => { _m.compose(_v.set(0, 0.07, z), _q.identity(), _s.set(1, 1, 1)); dI.setMatrixAt(i, _m); }); scene.add(dI);
  const sl = new THREE.Mesh(new THREE.PlaneGeometry(RW - 0.2, 0.4), markMat); sl.rotation.x = -PI / 2; sl.position.set(LANE, 0.075, -1.95); scene.add(sl); }
makeLandscape({ avoid: (x, z) => (x > -22 && x < 60 && Math.abs(z) < 90) || Math.abs(x) < 12, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 70 && Math.abs(z) - d / 2 < 100, near: [-40, 0, 60, 300], trees: 1300, seed: 7801 });
// houses on the left side of the street
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
for (let k = -7; k <= 7; k++) { const z = k * 11.5, h = 6 + hash(k + 40) * 4; house(-13.5, z, 10, 9, h, HC[(k + 14) % 5][0], HC[(k + 14) % 5][1], PI / 2); }
{ const pts = []; for (let z = -80; z <= 80; z += 13) pts.push([-6.4, z + 3]);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.22, 2.6, 6), L('#6d4a2b'), pts.length);
  const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length);
  pts.forEach(([x, z], i) => { _m.compose(_v.set(x, 1.3, z), _q.identity(), _s.set(1, 1, 1)); trunk.setMatrixAt(i, _m); _m.compose(_v.set(x, 3.6, z), _q.identity(), _s.set(1, 1.15, 1)); leaf.setMatrixAt(i, _m); leaf.setColorAt(i, _c.set(['#3f8f2e', '#4fa336', '#5fb33f'][i % 3])); });
  trunk.castShadow = leaf.castShadow = true; scene.add(trunk); scene.add(leaf); }

// ---------------- roadworks (right lane, z < -11) ----------------
const RZ0 = -11, RZ1 = -70;
const stripeT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e11d2e'; for (let x = -64; x < w; x += 64) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 32, h); c.lineTo(x + 64, 0); c.lineTo(x + 32, 0); c.fill(); } }, true);
function barrier(x, z, len, ry) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const t = stripeT.clone(); t.needsUpdate = true; t.repeat.set(len / 1.2, 1);
  const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.3, 0.05), L('#fff', { map: t })); b.position.y = 0.95; b.castShadow = true; g.add(b);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.5), L('#333')); f.position.set(s * (len / 2 - 0.1), 0.55, 0); f.castShadow = true; g.add(f);
    const lp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb300', toneMapped: false })); lp.position.set(s * (len / 2 - 0.1), 1.2, 0); g.add(lp); } return g; }
barrier(LANE, RZ0, 3.0, 0);
for (let z = RZ0 - 1.5; z > RZ1; z -= 3.4) barrier(0.25, z - 1.6, 3.2, PI / 2);
{ const cone = new THREE.ConeGeometry(0.22, 0.75, 12); const cm = L('#ff6d00'); const list = [];
  for (let z = -3; z > RZ0 + 0.5; z -= 2.2) list.push([0.25 + (z + 3) * -0.0, 0.4, z]);
  const cI = new THREE.InstancedMesh(cone, cm, list.length); list.forEach((p, i) => { _m.compose(_v.set(...p), _q.identity(), _s.set(1, 1, 1)); cI.setMatrixAt(i, _m); }); cI.castShadow = true; scene.add(cI);
  // trench + sand piles inside the roadworks
  const tr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 40), new THREE.MeshLambertMaterial({ color: '#3a2c20', polygonOffset: true, polygonOffsetFactor: -3 })); tr.rotation.x = -PI / 2; tr.position.set(2.1, 0.08, -38); scene.add(tr);
  for (const [z, s] of [[-18, 1.3], [-27, 1.0], [-48, 1.5]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(1.4 * s, 1.1 * s, 14), L('#d8b878')); p.position.set(2.6, 0.55 * s, z); p.castShadow = p.receiveShadow = true; scene.add(p); } }
// portable traffic light (faces +z, towards the queue)
const TLP = V3(3.95, 0, -2.6); const lamps = {};
{ const st = STD('#f2c200'); box(0.12, 3.0, 0.12, st, TLP.x, 1.5, TLP.z, true); box(0.9, 0.12, 0.9, STD('#444'), TLP.x, 0.06, TLP.z, true);
  box(0.5, 1.15, 0.36, STD('#222'), TLP.x, 3.3, TLP.z, true);
  [['r', '#ff2a1a', 3.66], ['g', '#22e05a', 2.96]].forEach(([k, col, y]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), new THREE.MeshBasicMaterial({ color: col, toneMapped: false })); m.position.set(TLP.x, y, TLP.z + 0.19); scene.add(m); const m2 = m.clone(); m2.material = m.material; m2.position.z = TLP.z - 0.19; m2.rotation.y = PI; scene.add(m2); lamps[k] = { m, col: new THREE.Color(col) }; });
  const am = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), new THREE.MeshBasicMaterial({ color: '#3a2a08' })); am.position.set(TLP.x, 3.31, TLP.z + 0.19); scene.add(am);
  const sg = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e11d2e'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#111'; c.font = '900 34px Inter'; c.textAlign = 'center'; c.fillText('WAIT HERE', w / 2, 56); c.fillText('WHEN RED', w / 2, 98); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), L('#fff', { map: sg })); sp.position.set(TLP.x, 1.9, TLP.z + 0.08); scene.add(sp); }
const glowT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ff4a2a', transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(0.9); scene.add(halo);

// ---------------- building site (x > 7.2) ----------------
plane(7.3, 60, -40, 60, L('#a08e70', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = 160 + Math.random() * 90 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, true) }), 0.1, 8);
const fenceT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#e8eef0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#9aa3a8'; c.lineWidth = 3; for (let x = 0; x < w; x += 12) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }, true);
{ const t = fenceT.clone(); t.needsUpdate = true; t.repeat.set(30, 1); const fm = new THREE.MeshLambertMaterial({ map: t, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const f1 = new THREE.Mesh(new THREE.PlaneGeometry(56, 2.0), fm); f1.rotation.y = PI / 2; f1.position.set(7.3, 1.0, -10); f1.userData.noAO = true; scene.add(f1);
  const f2 = new THREE.Mesh(new THREE.PlaneGeometry(36, 2.0), fm); f2.rotation.y = PI / 2; f2.position.set(7.3, 1.0, 44); f2.userData.noAO = true; scene.add(f2);
  for (let z = -38; z <= 62; z += 3.5) if (z < 18 || z > 26) box(0.08, 2.1, 0.08, L('#888'), 7.3, 1.05, z, false);
  const bn = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText('BUILD-IT LTD', w / 2, 74); c.font = '800 34px Inter'; c.fillText('HARD HAT AREA', w / 2, 126); });
  const b = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.3), L('#fff', { map: bn })); b.rotation.y = -PI / 2; b.position.set(7.2, 1.25, 12); scene.add(b); }
// the building: concrete frame, 10 slabs, lower floors bricked in
const BX0 = 11, BX1 = 25, BZ0 = -2, BZ1 = 14, BCX = (BX0 + BX1) / 2, BCZ = (BZ0 + BZ1) / 2, FH = 3, NF = 10, TOPY = NF * FH;
const conc = L('#c9c4bb'), concD = L('#b3ada3');
{ const slabG = new THREE.BoxGeometry(BX1 - BX0 + 0.6, 0.35, BZ1 - BZ0 + 0.6); const list = [];
  for (let k = 1; k <= NF; k++) list.push(k * FH - 0.175);
  const sI = new THREE.InstancedMesh(slabG, conc, list.length); list.forEach((y, i) => { _m.compose(_v.set(BCX, y, BCZ), _q.identity(), _s.set(1, 1, 1)); sI.setMatrixAt(i, _m); }); sI.castShadow = sI.receiveShadow = true; scene.add(sI);
  const colG = new THREE.BoxGeometry(0.45, FH - 0.35, 0.45); const cl = [];
  for (let k = 0; k < NF; k++) for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) cl.push([BX0 + 0.3 + i * (BX1 - BX0 - 0.6) / 3, k * FH + (FH - 0.35) / 2 + (k ? 0 : 0), BZ0 + 0.3 + j * (BZ1 - BZ0 - 0.6) / 3]);
  const cI = new THREE.InstancedMesh(colG, concD, cl.length); cl.forEach((p, i) => { _m.compose(_v.set(...p), _q.identity(), _s.set(1, 1, 1)); cI.setMatrixAt(i, _m); }); cI.castShadow = cI.receiveShadow = true; scene.add(cI);
  // bricked floors 1-4 with windows
  const bT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#b5553c'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9c0b4'; for (let y = 0; y < h; y += 16) { c.fillRect(0, y, w, 3); for (let x = (y / 16) % 2 ? 0 : 24; x < w; x += 48) c.fillRect(x, y, 3, 16); }
    for (let x = 40; x < w; x += 128) { c.fillStyle = '#eee'; c.fillRect(x - 6, 70, 72, 120); c.fillStyle = '#5d7d9a'; c.fillRect(x, 76, 60, 108); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x + 4, 80, 14, 100); } }, true);
  for (let k = 0; k < 4; k++) { const y = k * FH + FH / 2 - 0.1;
    const t1 = bT.clone(); t1.needsUpdate = true; t1.repeat.set(4, 1); const t2 = bT.clone(); t2.needsUpdate = true; t2.repeat.set(4, 1);
    const m1 = new THREE.MeshLambertMaterial({ map: t1 }), m2 = new THREE.MeshLambertMaterial({ map: t2 });
    if (k > 0) { box(0.25, FH - 0.35, BZ1 - BZ0, m1, BX0 + 0.15, y, BCZ, true).rotation.y = 0; }
    box(BX1 - BX0, FH - 0.35, 0.25, m2, BCX, y, BZ0 + 0.15, true); box(BX1 - BX0, FH - 0.35, 0.25, m2, BCX, y, BZ1 - 0.15, true);
    box(0.25, FH - 0.35, BZ1 - BZ0, m1, BX1 - 0.15, y, BCZ, true); }
  // brick wall faces on the street side of floors 1-3 need the texture rotated to read along z
  // scaffolding poles on the street side of floors 5-10
  const pole = new THREE.CylinderGeometry(0.05, 0.05, TOPY - 12, 5); const pl = [];
  for (let z = BZ0 - 0.6; z <= BZ1 + 0.7; z += 4) pl.push([BX0 - 0.9, 12 + (TOPY - 12) / 2, z]);
  const pI = new THREE.InstancedMesh(pole, STD('#9aa0a6', { metalness: 0.6 }), pl.length); pl.forEach((p, i) => { _m.compose(_v.set(...p), _q.identity(), _s.set(1, 1, 1)); pI.setMatrixAt(i, _m); }); scene.add(pI);
  for (let k = 5; k <= 9; k++) box(0.06, 0.06, BZ1 - BZ0 + 1.4, STD('#9aa0a6', { metalness: 0.6 }), BX0 - 0.9, k * FH + 1.0, BCZ, false); }
// site props: container, pallets, cement mixer, sand
{ const ct = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#1e6fb8'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.18)'; for (let x = 0; x < w; x += 22) c.fillRect(x, 0, 8, h); c.fillStyle = '#fff'; c.font = '900 54px Inter'; c.textAlign = 'center'; c.fillText('SITE OFFICE', w / 2, h / 2 + 18); });
  const cont = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.6, 6), [L('#1e6fb8'), L('#fff', { map: ct }), L('#1e6fb8'), L('#1e6fb8'), L('#1e6fb8'), L('#1e6fb8')]); cont.position.set(14, 1.3, 30); cont.castShadow = cont.receiveShadow = true; scene.add(cont);
  for (const [x, z] of [[19, 26], [21.5, 27]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.3, 14), L('#d8b878')); p.position.set(x, 0.65, z); p.castShadow = true; scene.add(p); } }

// ---------------- bricks pallet on the pavement (what the crane SHOULD lift) ----------------
const brickT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#c75b3f'; c.fillRect(0, 0, w, h); c.fillStyle = '#e3d6c4'; for (let y = 0; y < h; y += 16) { c.fillRect(0, y, w, 3); for (let x = (y / 16) % 2 ? 0 : 20; x < w; x += 40) c.fillRect(x, y, 3, 16); } }, true);
const HZ = 22.2;
const PAL = V3(5.4, 0, HZ);
{ const t = brickT.clone(); t.needsUpdate = true; t.repeat.set(3, 1.4);
  const st = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.25, 3.8), L('#fff', { map: t })); st.position.set(PAL.x, 0.85, PAL.z); st.castShadow = st.receiveShadow = true; scene.add(st);
  const pal = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 4.0), L('#b98a52')); pal.position.set(PAL.x, 0.18, PAL.z); pal.castShadow = true; scene.add(pal);
  const tag = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText('LOAD 7:', w / 2, 52); c.fillText('BRICKS', w / 2, 100); });
  const tg = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), L('#fff', { map: tag })); tg.rotation.y = -PI / 2; tg.position.set(PAL.x - 0.86, 1.0, PAL.z); scene.add(tg); }

// ---------------- tower crane ----------------
const T = V3(28, 0, 22), JY = 40, JIB = 42;
const latT = canvasTex(128, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 12; c.strokeRect(6, -10, w - 12, h + 20); c.lineWidth = 8; for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y + 64); c.stroke(); c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y); c.stroke(); } }, true);
const latMat = (rx, ry) => { const t = latT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ color: '#ffc107', map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.2 }); };
const craneY = STD('#ffc107', { roughness: 0.5, metalness: 0.2 });
{ const tw = new THREE.Mesh(new THREE.BoxGeometry(2.2, JY, 2.2), latMat(1, JY / 4.4)); tw.position.set(T.x, JY / 2, T.z); tw.castShadow = true; scene.add(tw);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(5, 0.9, 5), L('#9e9e9e')); foot.position.set(T.x, 0.45, T.z); foot.castShadow = foot.receiveShadow = true; scene.add(foot); }
const slew = new THREE.Group(); slew.position.set(T.x, JY, T.z); scene.add(slew);
{ const jib = new THREE.Mesh(new THREE.BoxGeometry(JIB, 1.6, 1.6), latMat(JIB / 3.2, 0.5)); jib.position.set(JIB / 2, 0.8, 0); jib.castShadow = true; slew.add(jib);
  const cj = new THREE.Mesh(new THREE.BoxGeometry(13, 1.2, 1.6), latMat(4, 0.4)); cj.position.set(-6.5, 0.6, 0); cj.castShadow = true; slew.add(cj);
  const cw = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.2), L('#8d8d8d')); cw.position.set(-11.5, -0.5, 0); cw.castShadow = true; slew.add(cw);
  const peak = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.5, 1.4), latMat(0.6, 1.4)); peak.position.set(0, 4.4, 0); peak.castShadow = true; slew.add(peak);
  const tie = (a, b) => { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, d.length(), 5), STD('#555')); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); m.castShadow = true; slew.add(m); };
  tie(V3(0, 7.6, 0), V3(JIB - 0.5, 1.6, 0)); tie(V3(0, 7.6, 0), V3(JIB * 0.5, 1.6, 0)); tie(V3(0, 7.6, 0), V3(-12.5, 1.2, 0));
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.6, 20), L('#5d5d5d')); ring.position.y = -0.3; slew.add(ring);
  const sg = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd60a'; c.font = '900 72px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUILD-IT', w / 2, h / 2 + 4); });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), L('#fff', { map: sg })); p.position.set(-6.5, 0.6, s * 0.82); if (s < 0) p.rotation.y = PI; slew.add(p); } }
// cab with the crane driver (window looks along the jib, local +x)
const cabG = new THREE.Group(); cabG.position.set(1.0, -1.4, 1.95); slew.add(cabG);
const OP = {};
{ const add = (w, h, d, x, y, z, m = craneY) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; cabG.add(b); return b; };
  add(2.2, 0.15, 2.0, 0, -1.1, 0); add(2.2, 0.15, 2.0, 0, 1.1, 0); add(0.12, 2.2, 2.0, -1.05, 0, 0); add(2.2, 2.2, 0.12, 0, 0, -0.95); add(2.2, 2.2, 0.12, 0, 0, 0.95);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.05), new THREE.MeshStandardMaterial({ color: '#cfe6f5', transparent: true, opacity: 0.15, roughness: 0.05, depthWrite: false })); gl.position.set(1.08, 0, 0); gl.rotation.y = PI / 2; gl.userData.noAO = true; cabG.add(gl);
  const lt = new THREE.PointLight('#fff2d0', 7, 5, 1.5); lt.position.set(0.8, 0.5, 0); cabG.add(lt);
  add(0.45, 0.6, 1.3, 0.7, -0.75, 0, STD('#455a64'));
  const op = new THREE.Group(); op.position.set(-0.1, -0.5, 0); cabG.add(op); OP.g = op;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.8, 12), STD('#ff7043')); op.add(body);
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.37, 0.12, 12), STD('#e0e0e0', { emissive: '#888', emissiveIntensity: 0.3 })); vest.position.y = 0.1; op.add(vest);
  const neck = new THREE.Group(); neck.position.set(0, 0.45, 0); op.add(neck); OP.neck = neck;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), STD('#f0c39d', { roughness: 0.7 })); head.position.set(0.05, 0.25, 0); neck.add(head);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 10, 0, PI * 2, 0, PI / 2), STD('#ffd60a')); hat.position.set(0.05, 0.32, 0); neck.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 18), STD('#ffd60a')); brim.position.set(0.1, 0.32, 0); neck.add(brim);
  
  OP.eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8), STD('#fff')); e.position.set(0.29, 0.31, s * 0.1); neck.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), STD('#111')); p.position.set(0.05, 0, 0); e.add(p); return e; });
  OP.mouth = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 6, 16), STD('#7a1f1f')); OP.mouth.position.set(0.3, 0.11, 0); OP.mouth.rotation.y = PI / 2; neck.add(OP.mouth);
  OP.smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12, PI), STD('#7a1f1f')); OP.smile.position.set(0.31, 0.13, 0); OP.smile.rotation.y = PI / 2; OP.smile.rotation.z = PI; neck.add(OP.smile);
  OP.blush = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), new THREE.MeshBasicMaterial({ color: '#ff6b8a', transparent: true, opacity: 0 })); b.position.set(0.28, 0.2, s * 0.17); b.rotation.y = PI / 2 + s * 0.5; neck.add(b); return b; });
  // right arm (thumbs up / binoculars) – shoulder pivot
  const sh = new THREE.Group(); sh.position.set(0.05, 0.3, -0.3); op.add(sh); OP.sh = sh;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 8), STD('#ff7043')); arm.position.y = -0.27; sh.add(arm);
  const hand = new THREE.Group(); hand.position.y = -0.58; sh.add(hand); OP.hand = hand;
  hand.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), STD('#f0c39d')));
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.08, 4, 6), STD('#f0c39d')); th.position.set(0, -0.1, 0); hand.add(th); OP.thumb = th;
  // binoculars (held with both hands in front of the eyes)
  const bn = new THREE.Group(); neck.add(bn); OP.bino = bn;
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.22, 12), STD('#222', { roughness: 0.4 })); c.rotation.z = PI / 2; c.position.set(0, 0, s * 0.08); bn.add(c);
    const ln = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), STD('#7fb8e8', { metalness: 0.6, roughness: 0.1 })); ln.rotation.y = PI / 2; ln.position.set(0.112, 0, s * 0.08); bn.add(ln); }
  bn.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), STD('#222')));
}
const trolley = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.8), L('#616161')); trolley.castShadow = true; slew.add(trolley);
const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), STD('#2b2b2b')); cable.castShadow = true; scene.add(cable);
// hook block: yellow/black block + two chains to the roof rack (local: y = 0 at the attach point on the car roof)
const hookG = new THREE.Group(); scene.add(hookG);
const HB = 1.25;   // block bottom above the attach point
{ const st = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let x = -128; x < w; x += 64) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 32, h); c.lineTo(x + 32 + h, 0); c.lineTo(x + h, 0); c.fill(); } });
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.6, 0.5), STD('#fff', { map: st })); b.position.y = HB + 0.3; b.castShadow = true; hookG.add(b);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 14), STD('#555', { metalness: 0.6 })); sh.rotation.x = PI / 2; sh.position.y = HB + 0.75; hookG.add(sh);
  const hk = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 16, PI * 1.4), STD('#424242', { metalness: 0.7, roughness: 0.4 })); hk.position.y = HB - 0.12; hk.rotation.z = PI * 0.8; hookG.add(hk);
  for (const s of [-1, 1]) { const a = V3(0, HB - 0.25, 0), b2 = V3(0, 0.0, s * 0.5); const d = b2.clone().sub(a);
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, d.length(), 5), STD('#3a3a3a', { metalness: 0.7 })); ch.position.copy(a).add(b2).multiplyScalar(0.5); ch.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); ch.castShadow = true; hookG.add(ch); }
  hookG.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- cars ----------------
const QZ = [6.0, 11.4, 16.8];
const queue = QZ.map((z, i) => { const c = makeCar(['#e53935', '#f5f5f5', '#43a047'][i]); placeCar(c, { x: LANE, z, h: 0 }); return c; });
const hero = makeCar('#1e88e5');
const RACKY = 1.72;
{ const rm = STD('#2b2d31', { roughness: 0.5, metalness: 0.4 });
  for (const z of [-0.5, 0.5]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 8), rm); b.rotation.z = PI / 2; b.position.set(0, RACKY, z); hero.userData.bodyG.add(b);
    for (const x of [-0.6, 0.6]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.08), rm); f.position.set(x, RACKY - 0.07, z); hero.userData.bodyG.add(f); } }
  const sr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.5), STD('#0e1620', { roughness: 0.1, metalness: 0.6 })); sr.rotation.x = -PI / 2; sr.position.set(0.3, 1.612, 0.05); hero.userData.bodyG.add(sr);
  hero.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// sign out of the sunroof (two faces so it reads from both sides)
const signG = new THREE.Group(); hero.userData.bodyG.add(signG);
{ const st = canvasTex(512, 300, (c, w, h) => { c.fillStyle = '#c99a5b'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(120,80,40,0.25)'; for (let i = 0; i < 30; i++) c.fillRect(Math.random() * w, Math.random() * h, 40, 3);
    c.fillStyle = '#1b1b1b'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('I AM NOT', w / 2, 92, w - 50); c.fillStyle = '#c62828'; c.fillText('THE BRICKS!', w / 2, 208, w - 50); });
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), L('#8d6e63')); stick.position.y = 0.5; signG.add(stick);
  const tilt = new THREE.Group(); tilt.position.y = 0.85; tilt.rotation.z = 0.55; signG.add(tilt);
  for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.0), L('#fff', { map: st })); p.position.set(s * 0.012, 0.45, 0); p.rotation.y = s > 0 ? PI / 2 : -PI / 2; p.castShadow = true; tilt.add(p); }
  signG.position.set(0.8, 1.55, 0.1); }
// hazard halos (additive blobs on the indicators)
const hzM = new THREE.SpriteMaterial({ map: glowT, color: '#ffae00', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const hz = [[-0.82, 0.78, -2.2], [0.82, 0.78, -2.2], [-0.78, 0.86, 2.24], [0.78, 0.86, 2.24]].map(p => { const s = new THREE.Sprite(hzM); s.scale.setScalar(0.85); s.position.set(...p); hero.userData.bodyG.add(s); return s; });
const hlM = new THREE.SpriteMaterial({ map: glowT, color: '#fff6c8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const hlS = [-0.6, 0.6].map(x => { const s = new THREE.Sprite(hlM); s.scale.setScalar(0.9); s.position.set(x, 0.76, -2.3); hero.userData.bodyG.add(s); return s; });
// wheel-spin smoke
const SMOKE = Array.from({ length: 16 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#d0d0d0', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return s; });

// ---------------- new top floor (wrong way: built around your car) ----------------
const NY = TOPY;                         // slab top
const top = new THREE.Group(); scene.add(top);
const wallM = L('#d9d3c9'), frameM = L('#ffffff'), glassM = new THREE.MeshStandardMaterial({ color: '#8fb8d8', roughness: 0.08, metalness: 0.5, envMapIntensity: 1.3 });
const WALLS = [], WINS = [];
function wpiece(w, h, d, x, y, z, grp) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM); m.position.set(x, y - NY, z); m.castShadow = m.receiveShadow = true; grp.add(m); return m; }
const CARZ = 6.0, WH = 2.9;
{ // street facade (x = BX0) with openings: car window z 4..8, small windows z -0.6..1.6 and 10.4..12.6
  const g = new THREE.Group(); g.position.set(0, NY, 0); top.add(g); WALLS.push(g);
  const x = BX0 + 0.15, y0 = NY, yb = NY + 0.55, yt = NY + 2.45;
  wpiece(0.3, 0.55, BZ1 - BZ0, x, y0 + 0.275, BCZ, g); wpiece(0.3, WH - 2.45, BZ1 - BZ0, x, (yt + NY + WH) / 2, BCZ, g);
  for (const [z0, z1] of [[BZ0, -0.6], [1.6, 3.9], [8.1, 10.4], [12.6, BZ1]]) wpiece(0.3, yt - yb, z1 - z0, x, (yb + yt) / 2, (z0 + z1) / 2, g);
  for (const [z0, z1, glass] of [[-0.6, 1.6, 1], [3.9, 8.1, 0], [10.4, 12.6, 1]]) { const wg = new THREE.Group(); wg.position.set(x - 0.05, (yb + yt) / 2, (z0 + z1) / 2); top.add(wg); WINS.push(wg);
    const fw = z1 - z0, fh = yt - yb;
    for (const [w2, h2, dz, dy] of [[fw, 0.12, 0, fh / 2], [fw, 0.12, 0, -fh / 2], [0.12, fh, fw / 2, 0], [0.12, fh, -fw / 2, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.22, h2, w2), frameM); f.position.set(-0.05, dy, dz); f.castShadow = true; wg.add(f); }
    if (glass) { const gp = new THREE.Mesh(new THREE.BoxGeometry(0.04, fh, fw), glassM); wg.add(gp); const mul = new THREE.Mesh(new THREE.BoxGeometry(0.1, fh, 0.08), frameM); wg.add(mul); }
    else { const bx = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, fw + 0.3), frameM); bx.position.set(-0.25, -fh / 2 - 0.05, 0); wg.add(bx);
      // flower box under the car window
      for (let k = 0; k < 6; k++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), STD(['#e91e63', '#ffeb3b', '#ff5722'][k % 3])); fl.position.set(-0.3, -fh / 2 + 0.12, -fw / 2 + 0.4 + k * (fw - 0.8) / 5); wg.add(fl); } } }
}
for (const [w, d, x, z] of [[BX1 - BX0, 0.3, BCX, BZ0 + 0.15], [BX1 - BX0, 0.3, BCX, BZ1 - 0.15], [0.3, BZ1 - BZ0, BX1 - 0.15, BCZ]]) { const g = new THREE.Group(); g.position.set(0, NY, 0); top.add(g); WALLS.push(g);
  wpiece(w, WH, d, x, NY + WH / 2, z, g);
  const n = Math.round(Math.max(w, d) / 3.5); for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; const wg = new THREE.Group(); top.add(wg); WINS.push(wg);
    const along = d > w ? V3(0, 0, 1) : V3(1, 0, 0), nrm = d > w ? V3(1, 0, 0) : V3(0, 0, z > BCZ ? 1 : -1);
    const px = d > w ? x + 0.17 : BX0 + u * (BX1 - BX0), pz = d > w ? BZ0 + u * (BZ1 - BZ0) : z + nrm.z * 0.17;
    wg.position.set(px, NY + 1.5, pz); const gp = new THREE.Mesh(new THREE.BoxGeometry(d > w ? 0.06 : 1.6, 1.5, d > w ? 1.6 : 0.06), glassM); wg.add(gp);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(d > w ? 0.08 : 1.8, 1.7, d > w ? 1.8 : 0.08), frameM); fr.position.copy(nrm).multiplyScalar(-0.03); wg.add(fr); } }
const roofG = new THREE.Group(); top.add(roofG);
{ const r = new THREE.Mesh(new THREE.BoxGeometry(BX1 - BX0 + 0.8, 0.4, BZ1 - BZ0 + 0.8), concD); r.position.set(BCX, 0.2, BCZ); r.castShadow = r.receiveShadow = true; roofG.add(r);
  const eave = new THREE.Mesh(new THREE.BoxGeometry(BX1 - BX0 + 1.0, 0.15, BZ1 - BZ0 + 1.0), L('#8d6e63')); eave.position.set(BCX, 0.45, BCZ); roofG.add(eave);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 0.05), STD('#888')); fl.position.set(BX0 + 1, 1.3, BZ0 + 1); roofG.add(fl);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), new THREE.MeshLambertMaterial({ color: '#e11d2e', side: THREE.DoubleSide })); flag.position.set(BX0 + 1, 1.8, BZ0 + 1.5); flag.rotation.y = PI / 2; roofG.add(flag); }
// builders on the top slab
const BUILDERS = [[17.5, 2.5], [19.5, 9.5], [21.5, 5.0]].map(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, NY, z); scene.add(g);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.95, 10), STD('#ff8f00')); b.position.y = 0.95; g.add(b);
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 8), STD('#37474f')); l.position.y = 0.25; g.add(l);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), STD('#f0c39d')); h.position.y = 1.65; g.add(h);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 8, 0, PI * 2, 0, PI / 2), STD('#ffd60a')); hat.position.y = 1.72; g.add(hat);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), STD('#111')); e.position.set(s * 0.09, 1.7, -0.21); g.add(e); }
  const arm = new THREE.Group(); arm.position.set(0.32, 1.3, 0); g.add(arm); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 6), STD('#ff8f00')); a.position.y = 0.27; arm.add(a);
  const tw = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 4), STD('#9e9e9e', { metalness: 0.6 })); tw.position.y = 0.62; arm.add(tw);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.rotation.y = [-2.0, 2.4, 1.6][i]; return { g, arm, i }; });
const POOF = Array.from({ length: 22 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#e8e0d0', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, a: hash(i) * PI * 2, k: hash(i + 9) }; });

// ---------------- motion ----------------
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
const angOf = p => Math.atan2(-(p.z - T.z), p.x - T.x);
const radOf = p => Math.hypot(p.x - T.x, p.z - T.z);
const HP = V3(LANE, 0, HZ);                    // hero home
const SP = V3(LANE, 0, 0.6);                   // right way: set-down at the front
const BP = V3(BX0 + 2.45, NY, CARZ);           // wrong way: car on the top slab (facing -x)
let aH = angOf(HP); const rH = radOf(HP);
const aB = angOf(BP) + 4 * PI, rB = radOf(BP);
if (aH < 0) aH += 2 * PI;
const TROLY = JY - 0.65;                       // trolley underside
const ATT_GROUND = RACKY + 0.03;               // attach point height when the car stands on the road
// wrong way keys
const spinA = mono([[tSwings - 0.35, aH], [tFaster + 0.2, aH + 2.2], [tFair + 0.5, aH + 8.4], [tPuts + 0.2, aB - 0.15], [tPuts + 0.6, aB]]);
const tPlaced = tTop + 0.65;
const tLift0 = tWhat - 0.1;
const attYW = mono([[tLift0, ATT_GROUND], [tLift0 + 1.0, ATT_GROUND + 0.35], [tFloor + 0.2, ATT_GROUND + 0.45], [tWheels - 0.1, ATT_GROUND + 0.9], [tAir + 0.3, ATT_GROUND + 8], [tFaster + 0.5, 36.2], [tPuts + 0.4, 36.2], [tPlaced - 0.05, NY + ATT_GROUND]]);
const rW = mono([[tPuts - 0.2, rH], [tTop + 0.4, rB]]);
const Y0 = (aB - aH);                                   // yaw gained while slewing
const yawFix = (() => { let d = PI / 2 - Y0; d = ((d % (2 * PI)) + 3 * PI) % (2 * PI) - PI; return d; })();
const yawW = mono([[tPuts - 0.3, 0], [tTop + 0.45, yawFix]]);
// right way: straight line over the queue
const tUp0 = tSorry - 0.2, tUp1 = tLift + 0.6, tGo1 = tPutsR - 0.1, tDown1 = tFront + 0.2;
const attYR = mono([[tLift0, ATT_GROUND], [tLift0 + 1.0, ATT_GROUND + 0.35], [tUp0, ATT_GROUND + 0.35], [tUp1, 8.6], [tGo1, 8.6], [tDown1, ATT_GROUND]]);
const goR = mono([[tUp1 - 0.3, 0], [tGo1, 1]]);
const tRelease = tDown1 + 0.35;
function craneState(t) {
  const right = isRight(t);
  let a = aH, r = rH, attY = ATT_GROUND, yaw = 0, onHook = true, hookOnlyY = null;
  if (t < tClunk) { onHook = false; hookOnlyY = lerp(24, ATT_GROUND, easeIn(clamp((t - (tClunk - 1.1)) / 1.1))); }
  else if (!right) {
    a = spinA(t); r = rW(t); attY = attYW(t); yaw = (a - aH) + yawW(t);
    if (t > tPlaced) { onHook = false; hookOnlyY = lerp(NY + ATT_GROUND, NY + 7, ease(clamp((t - tPlaced - 0.3) / 1.2))); a = aB - 1.1 * ease(clamp((t - tPlaced - 0.7) / 1.6)); r = rB; yaw = Y0 + yawFix; }
  } else {
    const u = goR(t); const p = HP.clone().lerp(SP, ease(u)); a = angOf(p); r = radOf(p); attY = attYR(t);
    if (t > tRelease) { onHook = false; hookOnlyY = lerp(ATT_GROUND, 12, ease(clamp((t - tRelease) / 1.4))); a = angOf(SP); r = radOf(SP); }
  }
  if (t < tClunk) attY = ATT_GROUND;
  return { a, r, attY, yaw, onHook, hookOnlyY };
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + look[0], p.y + look[1], p.z + look[2]), fov]; };
const dirOf = a => V3(Math.cos(a), 0, -Math.sin(a));
const CabCam = (off, up = 0.35, fov = 26, side = 0) => t => { const c = cabG.getWorldPosition(V3(0, 0, 0)); const d = dirOf(slew.rotation.y); const sd = V3(-d.z, 0, d.x);
  return [c.clone().addScaledVector(d, off).addScaledVector(sd, side).add(V3(0, up, 0)), c.clone().add(V3(0, -0.05, 0)), fov]; };
const BinoCam = () => t => { const c = cabG.getWorldPosition(V3(0, 0, 0)).add(V3(0, 0.3, 0)).addScaledVector(dirOf(slew.rotation.y), 1.4); const tgt = signG.getWorldPosition(V3(0, 0, 0)).add(V3(0, 1.2, 0)); return [c, tgt, 4.6]; };
const RideCam = () => t => { const d = dirOf(slew.rotation.y); const sd = V3(-d.z, 0, d.x); const c = V3(T.x, JY + 3.2, T.z).addScaledVector(d, 5).addScaledVector(sd, 2.2); const hp = hero.position.clone(); return [c, hp.add(V3(0, 0.8, 0)), 50]; };
const camKeys = [
  [0.0, Ac([-5.0, 9.5, 44], [4.0, 8.5, 4], 44)],
  [tThenH - 0.3, Ac([-4.0, 7.5, 39], [3.4, 5.0, 8], 44)],
  ...cut(tThenH - 0.25, Ac([-4.2, 3.4, HZ + 5.2], [LANE, 1.7, HZ], 38)),
  [S('hook1').end + 0.3, Ac([-4.0, 3.2, HZ + 4.8], [LANE, 1.9, HZ], 38)],
  ...cut(tCraneH - 0.3, Ac([-2.6, 1.0, HZ + 4.5], [LANE + 6, 24, HZ - 6], 52)),
  [tCrane2 - 0.3, Ac([-2.6, 1.1, HZ + 4.3], [LANE + 7, 27, HZ - 6], 52)],
  ...cut(tCrane2 - 0.25, CabCam(6.8, 1.0, 30, 1.2)),
  [tWhat - 0.3, CabCam(6.2, 1.0, 30, 1.2)],
  ...cut(tWhat - 0.25, Ac([-3.5, 7.5, HZ + 10.5], [3.6, 1.4, HZ - 0.5], 40)),
  [S('hook2').end + 0.5, Ac([-3.3, 7.2, HZ + 10.0], [3.6, 1.4, HZ - 0.5], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([-2.8, 1.0, HZ + 7.5], [LANE, 1.0, HZ], 38)),
  [tGet + 0.6, Ac([-2.6, 1.1, HZ + 7.0], [LANE, 1.2, HZ], 38)],
  ...cut(tWheels - 0.2, t => { const hp = hero.position; return [V3(-5.5, 1.4, HZ + 8), V3(hp.x, hp.y + 0.6, hp.z), 44]; }),
  [tSwings - 0.35, t => { const hp = hero.position; return [V3(-5.5, 1.4, HZ + 8), V3(hp.x, hp.y + 0.6, hp.z), 44]; }],
  ...cut(tSwings - 0.3, t => [V3(-26, 44, 52), hero.position.clone().lerp(V3(16, 26, 14), 0.4), 50]),
  [tFair - 0.4, t => [V3(-28, 46, 48), hero.position.clone().lerp(V3(16, 26, 14), 0.4), 50]],
  ...cut(tFair - 0.35, RideCam()),
  [tPuts - 0.25, RideCam()],
  ...cut(tPuts - 0.2, Ac([0.5, 38.5, -9.5], [BP.x + 1, NY + 1.5, BP.z], 42)),
  [tBuilders - 0.2, Ac([1.0, 38.0, -9.0], [BP.x + 1.5, NY + 0.8, BP.z], 42)],
  ...cut(tBuilders - 0.15, Ac([2.0, 38.5, -7.5], [BCX - 1.5, NY + 0.8, BCZ], 46)),
  [tRoof - 0.2, Ac([0.5, 39.5, -9.5], [BCX - 1.5, NY + 1.0, BCZ], 46)],
  ...cut(tYour - 0.2, Ac([-7.5, NY + 1.8, CARZ - 0.6], [BX0, NY + 1.3, CARZ], 34)),
  [tFloor2 + 0.3, Ac([-9.0, NY + 1.5, CARZ - 0.8], [BX0, NY + 1.2, CARZ], 36)],
  [tRew0, Ac([-36, 17, CARZ - 2], [BX0, 20.5, CARZ], 50)],
  // right
  ...cut(tRew1, Ac([-3.3, 7.2, HZ + 10.0], [3.6, 1.4, HZ - 0.5], 40)),
  ...cut(tStay - 0.2, Ac([-4.6, 2.2, HZ - 7.5], [LANE, 1.3, HZ], 38)),
  [tHazard + 0.6, Ac([-4.2, 2.0, HZ - 7.0], [LANE, 1.3, HZ], 38)],
  ...cut(tHold - 0.15, Ac([11.5, 5.6, HZ - 6.0], [LANE + 0.6, 2.4, HZ + 0.3], 40)),
  [S('right3').end + 0.2, Ac([11.0, 5.8, HZ - 5.6], [LANE + 0.6, 2.7, HZ + 0.3], 40)],
  ...cut(tCraneR - 0.2, CabCam(4.4, 0.25, 30, -0.9)),
  [tReads - 0.2, CabCam(4.2, 0.25, 30, -0.9)],
  ...cut(tReads - 0.15, BinoCam()),
  [tOops - 0.12, BinoCam()],
  ...cut(tOops - 0.1, CabCam(3.4, 0.3, 30, 0.6)),
  [S('right4').end + 0.3, CabCam(3.2, 0.3, 30, 0.6)],
  ...cut(tSorry - 0.2, Ac([-6.5, 9.5, HZ + 14], [1.5, 3.5, 11], 46)),
  [tOver, Ac([-6.0, 12.0, HZ + 9], [1.5, 4.0, 6], 46)],
  [tPutsR - 0.2, Ac([-5.5, 11.5, HZ + 4], [1.5, 3.5, 2], 46)],
  ...cut(tPutsR - 0.15, Ac([-5.0, 3.2, -11], [3.2, 5.0, -0.5], 40)),
  [tFront + 0.4, Ac([-5.0, 2.9, -11], [3.2, 2.4, -0.5], 40)],
  [tExpress - 0.3, Ac([-4.8, 2.8, -10.5], [3.2, 2.2, -0.5], 40)],
  ...cut(tExpress - 0.25, HeroCam([-1.6, 3.0, 8.0], [0.2, 1.0, -8], 40)),
  [S('right7').start, HeroCam([-1.2, 3.6, 8.5], [0.2, 2.0, -16], 42)],
  [TOTAL, HeroCam([-1.0, 4.4, 10.5], [0.2, 3.0, -20], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const driveR = roundedPath([[SP.x, SP.z], [SP.x, -2.5], [-LANE, -9.8], [-LANE, -260]], 5);
let prevA = aH;
function update(t) {
  const right = isRight(t);
  const cs = craneState(t);
  slew.rotation.y = cs.a; slew.updateMatrixWorld(true);
  trolley.position.set(cs.r, -0.35, 0);
  const tp = trolley.getWorldPosition(V3(0, 0, 0)).add(V3(0, -0.3, 0));
  // pendulum: outward swing from the slew speed (numerical derivative, pure function of t)
  const rate = (craneState(t + 0.05).a - craneState(t - 0.05).a) / 0.1;
  const th = clamp(Math.abs(rate) * 0.22, 0, 0.85) * (cs.onHook ? 1 : 0);
  const dir = dirOf(cs.a), tang = V3(-dir.z, 0, dir.x).multiplyScalar(-Math.sign(rate));
  const Lc = Math.max(0.5, tp.y - (cs.onHook ? cs.attY : cs.hookOnlyY) - HB - 0.6);
  const sway = cs.onHook ? ramp(t, tLift0, tLift0 + 1) * (right ? 0.05 * Math.sin(t * 1.6) * (t < tUp0 ? 1 : 0.4) : 0.06 * Math.sin(t * 1.9)) * Math.min(1, Lc / 3) : 0;
  const att = V3(tp.x, 0, tp.z).addScaledVector(dir, (Lc + HB) * Math.sin(th) + sway).addScaledVector(tang, (Lc + HB) * Math.sin(th) * 0.25);
  att.y = cs.onHook ? tp.y - (Lc + HB + 0.6) * Math.cos(th) : cs.hookOnlyY;
  if (!cs.onHook && t < tClunk) { att.set(HP.x, cs.hookOnlyY, HP.z); }
  const up = tp.clone().sub(att).normalize();
  // ---- hero ----
  let heroRest = !cs.onHook && t >= tClunk;   // standing on slab / road after release
  if (t < tClunk || (right && t > tRelease)) {
    if (right && t > tRelease) { const tD = tExpress - 0.25; const s = t < tD ? 0 : 0.5 * 4.5 * Math.min(t - tD, 2.2) ** 2 + (t > tD + 2.2 ? 9.9 * (t - tD - 2.2) : 0); const p = pathAt(driveR, s); placeCar(hero, { x: p.x, z: p.z, h: p.h, y: 0 }); }
    else placeCar(hero, { x: HP.x, z: HP.z, h: 0, y: 0 });
  } else if (!right && t > tPlaced) { placeCar(hero, { x: BP.x, z: BP.z, h: PI / 2, y: NY }); }
  else {
    const qy = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), cs.yaw);
    const qt = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), up);
    const q = qt.multiply(qy);
    // clunk bounce while still on the road
    const bnc = (t > tClunk && t < tLift0) ? 0.03 * Math.exp(-(t - tClunk) * 6) * Math.sin((t - tClunk) * 30) : 0;
    const pos = att.clone().sub(V3(0, ATT_GROUND, 0).applyQuaternion(q)); pos.y += bnc;
    hero.position.copy(pos); hero.quaternion.copy(q);
    const ud = hero.userData; ud.bodyG.rotation.set(0, 0, 0); ud.bodyG.position.y = 0; ud.prev = null;
    // wheels: spin hard when flooring it
    const spinning = !right && t > tFloor - 0.1 && t < tSwings;
    ud.spin = (ud.spin || 0) + (spinning ? -0.9 : 0); ud.wheels.forEach(w => w.rotation.x = spinning ? -t * 55 : 0);
  }
  // ---- hook block ----
  const hq = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), up);
  if (cs.onHook && t >= tClunk) { hookG.quaternion.copy(hero.quaternion); hookG.position.copy(hero.localToWorld(V3(0, ATT_GROUND, 0))); }
  else { hookG.quaternion.copy(hq); hookG.position.copy(att); }
  const hb = hookG.localToWorld(V3(0, HB + 1.0, 0)); const cd = tp.clone().sub(hb);
  cable.position.copy(tp).add(hb).multiplyScalar(0.5); cable.scale.set(1, Math.max(0.05, cd.length()), 1); cable.quaternion.setFromUnitVectors(V3(0, 1, 0), cd.normalize());
  // ---- hero lights ----
  const ud = hero.userData;
  const hazOn = right && t > tHazard - 0.1 && t < tExpress;
  blink(hero, t, hazOn, hazOn); const on = hazOn && Math.floor(t * 2.6) % 2 === 0; hzM.opacity = on ? 0.85 : 0;
  ud.tl.emissiveIntensity = (!right && t > tFloor - 0.1 && t < tSwings) ? 1.6 : 0.35;
  const flash = !right && t > tTenth - 0.1 && t < tRew0 ? (Math.floor((t - tTenth) * 4) % 2 === 0 ? 1 : 0.15) : 0;
  hlM.opacity = flash * 0.9; ud.hl.emissiveIntensity = 0.3 + 2 * flash;
  // ---- sign ----
  const su = right ? clamp((t - tSign + 0.1) / 0.45) : 0; signG.visible = su > 0 && (t < tRelease + 0.5);
  signG.scale.setScalar(Math.max(0.01, back(su))); signG.rotation.z = 0.08 * Math.sin(t * 2.2) * su;
  // ---- crane driver ----
  const thumbs = !right ? win(t, tCrane2 - 0.2, S('hook2').end + 0.3, 0.25) : 0;
  const binoU = right ? win(t, tBino - 0.3, tOops + 0.1, 0.25) : 0;
  const oops = right && t > tOops - 0.12 && t < tRelease + 2;
  OP.sh.rotation.set(0, 0, 0);
  if (thumbs > 0) { OP.sh.rotation.z = lerp(0, 2.3, thumbs); }
  else if (oops) { OP.sh.rotation.z = 2.6; OP.sh.rotation.x = -0.35; OP.thumb.position.set(0, -0.1, 0); }
  else OP.thumb.position.set(0, -0.1, 0);
  OP.bino.visible = binoU > 0.02; OP.bino.position.set(lerp(0.15, 0.42, binoU), lerp(-0.2, 0.31, binoU), 0); OP.bino.rotation.z = lerp(-0.6, 0, binoU);
  if (binoU > 0.5) { OP.sh.rotation.z = 2.0; OP.sh.rotation.x = -0.5; }
  OP.neck.rotation.z = right ? (oops ? 0.12 : -0.05) : -0.08 + 0.05 * Math.sin(t * 1.3);
  OP.eyes.forEach(e => e.scale.setScalar(oops ? 1.45 : 1));
  OP.mouth.visible = oops; OP.smile.visible = !oops; OP.blush.forEach(b => b.material.opacity = oops ? 0.8 : 0);
  // ---- new top floor ----
  const wu = !right ? ramp(t, tWalls - 0.15, tWalls + 0.25) : 0, gu = !right ? ramp(t, tWindows - 0.15, tWindows + 0.2) : 0, ru = !right ? clamp((t - tRoof + 0.45) / 0.45) : 0;
  WALLS.forEach(g => { g.visible = wu > 0.01; g.scale.y = Math.max(0.01, back(wu)); g.position.y = NY; });
  WINS.forEach((g, k) => { g.visible = gu > 0.01; g.scale.setScalar(Math.max(0.01, back(clamp(gu * 1.3 - (k % 4) * 0.08)))); });
  roofG.visible = ru > 0; roofG.position.y = NY + WH + lerp(7, 0, easeIn(ru)) + (ru >= 1 ? 0.06 * Math.exp(-(t - tRoof) * 8) * Math.sin((t - tRoof) * 30) : 0);
  const bu = !right ? ramp(t, tBuilders - 0.3, tBuilders + 0.1) : 0;
  BUILDERS.forEach(b => { b.g.visible = bu > 0.01 && t < tYour; b.g.scale.setScalar(Math.max(0.01, back(bu))); b.arm.rotation.x = -1.2 + 0.7 * Math.sin(t * 9 + b.i * 2); b.g.position.y = NY + 0.06 * Math.abs(Math.sin(t * 9 + b.i)); });
  const pk = !right ? Math.max(win(t, tWalls - 0.1, tWalls + 0.9, 0.1) * 0.8, win(t, tRoof - 0.05, tRoof + 1.1, 0.1)) : 0;
  POOF.forEach(p => { const k = !right ? (t > tRoof - 0.05 ? t - tRoof : t - tWalls) : 0; p.s.visible = pk > 0.01; if (!p.s.visible) return;
    const r = 7 + 3 * k + p.k * 2; p.s.position.set(BCX + Math.cos(p.a) * r * 0.9, NY + 0.5 + p.k * 3 + k * 0.6, BCZ + Math.sin(p.a) * r); p.s.scale.setScalar(2.2 + k * 2); p.s.material.opacity = 0.45 * pk; });
  // ---- traffic light ----
  const green = right && t > tGreen - 0.05;
  lamps.r.m.material.color.copy(green ? new THREE.Color('#3a1010') : lamps.r.col); lamps.g.m.material.color.copy(green ? lamps.g.col : new THREE.Color('#0d2a14'));
  halo.position.set(TLP.x, green ? 2.96 : 3.66, (cam(t).p.z < TLP.z ? TLP.z - 0.26 : TLP.z + 0.26)); halo.material.color.set(green ? '#30ff70' : '#ff4a2a');
  // ---- smoke from spinning wheels ----
  const sm = !right ? win(t, tFloor - 0.05, tAir + 0.3, 0.2) : 0;
  SMOKE.forEach((s, k) => { const ph = (t * 1.4 + k / SMOKE.length) % 1; const side = k % 2 ? 1 : -1; const base = hero.localToWorld(V3(side * 0.85, 0.2, 1.4)); s.position.copy(base).add(V3(side * ph * 0.8, -ph * 0.4, ph * 2.2)); s.scale.setScalar(0.5 + ph * 1.6); s.material.opacity = 0.3 * sm * Math.sin(PI * ph); s.visible = sm > 0.01; });
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(0.5 * win(t, tClunk - 0.02, tClunk + 0.3, 0.05), 0.5 * win(t, tTop + 0.3, tTop + 0.7, 0.05), 0.6 * win(t, tRoof - 0.02, tRoof + 0.4, 0.05)) : 0;
  applyCam(c, t, shake > 0.02 ? 0.12 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { hero: project(hero.localToWorld(V3(0, 1.0, 0))), pal: project(PAL.clone().add(V3(0, 1.0, 0))), hook: project(hookG.localToWorld(V3(0, HB + 0.3, 0))), win_: project(V3(BX0, NY + 1.4, CARZ)) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function ringAt(p, r, a, b, label) { if (!p || !p.ok) return; const f = win(gT, a, b, 0.2); if (f <= 0) return; const k = back((gT - a) / 0.35);
  ctx.save(); ctx.globalAlpha = f; ctx.lineWidth = 10; ctx.strokeStyle = YEL; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(p.x, p.y, r * k, 0, PI * 2); ctx.stroke(); ctx.restore();
  if (label) floatText(label, clamp(p.x, 220, W - 220), p.y - r - 60, gT, a, b, 52, YEL, 0); }
function bino(t) { const a = win(t, tReads - 0.15, tOops - 0.1, 0.08); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, W, H); const r = 300, cy = 820; ctx.arc(W / 2 - 205, cy, r, 0, PI * 2, true); ctx.moveTo(W / 2 + 205 + r, cy); ctx.arc(W / 2 + 205, cy, r, 0, PI * 2, true); ctx.fill('evenodd'); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('ROADWORKS', '#ff6d00', tRoadworks - 0.1, tRed - 0.1, 56, iconWarn);
    P_('RED LIGHT', RED, tRed - 0.1, tThenH - 0.2, 56);
    floatText('CLUNK!', W / 2 + 120, 700, t, tClunk, tClunk + 0.9, 130, YEL, 0.08);
    P_('SOMETHING ON YOUR ROOF', '#455a64', tSomething - 0.1, S('hook1').end + 0.2, 46, iconWarn);
    P_('THE CRANE HOOK', '#e65100', tCraneH - 0.1, tCrane2 - 0.25, 56, iconWarn);
    P_('CRANE DRIVER: "BRICKS!"', '#e65100', tCrane2 - 0.15, tWhat - 0.3, 48);
    ringAt(screen.pal, 150, tWhat - 0.15, S('wrong1').start - 0.15, null);
    P_('FLOOR IT', RED, tFloor - 0.15, tWheels - 0.2, 58, iconX);
    floatText('VROOOM!', W / 2, 760, t, tFloor, tFloor + 1.3, 110, YEL, -0.06);
    P_('WHEELS: IN THE AIR', RED, tWheels - 0.15, tSwings - 0.3, 52, iconWarn);
    floatText('WHEEE!', W / 2 + 60, 700, t, tFaster - 0.1, tFaster + 1.2, 120, YEL, 0.08);
    P_('FAIRGROUND RIDE', '#8e24aa', tFair - 0.15, tPuts - 0.25, 56);
    P_('TOP FLOOR', RED, tTop - 0.2, tBuilders - 0.2, 58);
    P_('THE BUILDERS KEEP BUILDING', '#e65100', tBuilders - 0.15, tWalls - 0.1, 44);
    floatText('WALLS!', W / 2 - 150, 700, t, tWalls - 0.05, tWalls + 0.75, 100, YEL, -0.08);
    floatText('WINDOWS!', W / 2 + 120, 820, t, tWindows - 0.05, tWindows + 0.75, 100, YEL, 0.06);
    floatText('ROOF!', W / 2, 640, t, tRoof - 0.05, tRoof + 0.8, 120, YEL, -0.04);
    P_('NEW ADDRESS: 10TH FLOOR', RED, tYour - 0.1, tRew0, 48, iconX);
    floatText('HONK!', W / 2 + 200, 640, t, tFloor2 + 0.45, tFloor2 + 1.3, 100, YEL, 0.1);
  } else {
    P_('ENGINE OFF', GREEN, tEngine - 0.15, tHazard - 0.1, 56, iconCheck);
    P_('HAZARD LIGHTS ON', GREEN, tHazard - 0.1, tHold - 0.2, 54, iconCheck);
    P_('SIGN OUT OF THE SUNROOF', GREEN, tSign - 0.15, S('right3').end + 0.2, 48, iconCheck);
    P_('BINOCULARS', '#455a64', tBino - 0.15, tReads - 0.2, 54);
    bino(t);
    floatText('OOPS!', W / 2 - 130, 640, t, tOops - 0.05, tOops + 1.0, 130, YEL, -0.08);
    P_('A FREE LIFT', GREEN, tLift - 0.15, tOver - 0.15, 56, iconHeart);
    P_('OVER THE WHOLE QUEUE', GREEN, tOver - 0.15, S('right5').end + 0.3, 50, iconCheck);
    floatText('GREEN!', W / 2, 700, t, tGreen - 0.05, tGreen + 0.9, 110, '#39ff4a', -0.05);
    P_('EXPRESS LANE', '#1565c0', tExpress - 0.1, S('right6').end + 0.5, 58, iconCheck);
  }
}
window.dbg = { hero, hookG, slew, craneState, BP, SP, HP };
start(update, hud);
