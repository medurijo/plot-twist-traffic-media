// Episode 51: Zebra crossing – a real zebra is lying on it, perfectly camouflaged
// hook (old style): zebra crossing ahead, nobody waiting, easy -> one of the stripes just blinked: a real zebra lies on it
// wrong: honk -> she jumps up and runs off, and the stripes go with her -> no stripes, no crossing ->
//        everyone walks over your car instead: a school class, a brass band, an elephant (car squashed flat)
// right: stop at the line and wait (the crossing belongs to the zebra) -> she stands up, stretches, trots across ->
//        every stripe she steps on plays a note: it's a piano -> thank-you present: stripes! -> your car is a zebra, best camouflage in town
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tZebra1 = WT('hook1', 'Zebra'), tNobody = WT('hook1', 'Nobody'), tEasy = WT('hook1', 'Easy');
const tStripes1 = WT('hook2', 'stripes'), tBlinked = WT('hook2', 'blinked'), tA2 = WT('hook2', 'A'), tReal = WT('hook2', 'real'), tLying = WT('hook2', 'lying'), tWhat = WT('hook2', 'What');
const tHonk = WT('wrong1', 'honk'), tMake = WT('wrong1', 'make');
const tBig = WT('wrong2', 'Big'), tJumps = WT('wrong2', 'jumps'), tRuns = WT('wrong2', 'runs'), tAndW = WT('wrong2', 'And'), tStripesW = WT('wrong2', 'stripes');
const tNo = WT('wrong3', 'No'), tCrossing = WT('wrong3', 'crossing'), tSo3 = WT('wrong3', 'So'), tWalks = WT('wrong3', 'walks'), tSchool = WT('wrong3', 'school'), tBrass = WT('wrong3', 'brass'), tElephant = WT('wrong3', 'elephant');
const tStopR = WT('right2', 'Stop'), tWait = WT('right2', 'wait'), tA_R = WT('right2', 'A'), tBelongs = WT('right2', 'belongs');
const tStands = WT('right3', 'stands'), tStretch = WT('right3', 'stretches'), tTrots = WT('right3', 'trots');
const tEvery = WT('right4', 'every'), tPlays = WT('right4', 'plays'), tPiano = WT('right4', 'piano');
const tHappy = WT('right5', 'happy'), tGives = WT('right5', 'gives'), tPresent = WT('right5', 'present'), tStripesR = WT('right5', 'Stripes');
const tYour = WT('right6', 'Your'), tZebraR = WT('right6', 'zebra'), tBest = WT('right6', 'Best'), tCamo = WT('right6', 'camouflage');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: town road along z with a zebra crossing ----------------
const RX = 3.6, ZZ = -5.0, CX = 1.8, Z_LINE = ZZ + 4.6;
makeLandscape({ avoid: (x, z) => Math.abs(x) < 24 && z > -140 && z < 120, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 34 && z + d / 2 > -150 && z - d / 2 < 130, near: [0, 0, 160, 300], trees: 1100, seed: 5106 });
plane(-RX, RX, -600, 600, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -300; z < 300; z += 7) if (z > ZZ + 3 || z < ZZ - 12) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.14, 600); g2.rotateX(-Math.PI / 2); instanced(g2, markMat, [[RX - 0.25, 0.08, 0], [-RX + 0.25, 0.08, 0]], false);
  const gd = new THREE.PlaneGeometry(0.5, 0.2); gd.rotateX(-Math.PI / 2); const gl = []; for (let x = 0.3; x < RX - 0.2; x += 0.8) { gl.push([x, 0.081, ZZ + 2.1]); gl.push([-x, 0.081, ZZ - 2.1]); } instanced(gd, markMat, gl, false);
  const gz = new THREE.PlaneGeometry(0.12, 1.25); gz.rotateX(-Math.PI / 2); const zz = [];
  for (const s of [1, -1]) for (let k = 0; k < 9; k++) { const z0 = s > 0 ? ZZ + 2.6 + k * 1.1 : ZZ - 2.6 - k * 1.1; for (const sx of [1, -1]) zz.push([sx * (RX - 0.55), 0.081, z0, (k % 2 ? 0.25 : -0.25) * s]); }
  instanced(gz, L('#f5f5f5', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), zz, false); }
// the zebra stripes: individual meshes (they fly away / light up like piano keys)
const SX = [-3.25, -2.25, -1.25, -0.25, 0.75, 1.75, 2.75];
const STR = SX.map(x => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3.0), new THREE.MeshLambertMaterial({ color: '#f5f5f5', emissive: '#000000', polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.082, ZZ); m.receiveShadow = true; scene.add(m); return { m, x }; });
const paveM = L('#cfc9bc'), kerbM = L('#a9a397');
for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 600), paveM); p.position.set(s * (RX + 0.8), 0.07, 0); p.receiveShadow = true; scene.add(p);
  const k = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 600), kerbM); k.position.set(s * (RX + 0.07), 0.08, 0); k.receiveShadow = true; scene.add(k); }
const hedgeM = new THREE.MeshLambertMaterial({ color: '#3f8a35', flatShading: true });
{ const hg = new THREE.BoxGeometry(0.9, 1.05, 1.0); const R = rng(5); const list = []; for (const s of [-1, 1]) for (let z = -90; z < 80; z += 0.9) { if (Math.abs(z - ZZ) < 1.6) continue; list.push([s * 5.45, 0.52, z, (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.12, 1]); }
  instanced(hg, hedgeM, list, true); }
{ const cols = ['#f4d6a0', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5d7a99'; c.fillRect(30 + x * 120, 30 + y * 120, 76, 80); c.fillStyle = '#fff'; c.fillRect(66 + x * 120, 30 + y * 120, 4, 80); } });
  let k = 0; for (const s of [-1, 1]) for (let z = -90; z <= 70; z += 13) { const g = new THREE.Group(); g.position.set(s * (14 + (k % 2) * 2), 0, z + (s > 0 ? 6 : 0)); scene.add(g);
    const m = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 9), L(cols[k % cols.length], { map: winT })); m.position.y = 3.5; m.castShadow = m.receiveShadow = true; g.add(m);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.4, 4), L(['#b0473a', '#7b5e57', '#455a64'][k % 3])); rf.rotation.y = Math.PI / 4; rf.position.y = 8.7; rf.castShadow = true; g.add(rf); k++; } }
// Belisha beacons
const beacons = [];
for (const [x, z] of [[RX + 0.95, ZZ - 1.9], [-RX - 0.95, ZZ + 1.9]]) { const g = new THREE.Group(); g.position.set(x, 0.14, z); scene.add(g);
  const poleT = canvasTex(32, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fafafa' : '#111'; c.fillRect(0, i * 32, w, 32); } });
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10), L('#fff', { map: poleT })); p.position.y = 1.3; p.castShadow = true; g.add(p);
  const m = new THREE.MeshStandardMaterial({ color: '#ffb300', emissive: '#ffa000', emissiveIntensity: 0.5, roughness: 0.3, toneMapped: false }); const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), m); b.position.y = 2.75; b.castShadow = true; g.add(b); beacons.push(m); }

// ---------------- materials ----------------
const stripeTex = (n, rot = false) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h); c.fillStyle = '#151515'; for (let i = 0; i < n; i++) { const y = (i + 0.25) * h / n; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 16) c.lineTo(x, y + 4 * Math.sin(x * 0.05 + i)); c.lineTo(w, y + h / n * 0.48); for (let x = w; x >= 0; x -= 16) c.lineTo(x, y + h / n * 0.48 + 4 * Math.sin(x * 0.04 + i * 2)); c.fill(); } });
const ZB = STD('#ffffff', { map: stripeTex(14), roughness: 0.7 }), ZL = STD('#ffffff', { map: stripeTex(7), roughness: 0.7 }), ZN = STD('#ffffff', { map: stripeTex(6), roughness: 0.7 });
const BLK = STD('#1a1a1a', { roughness: 0.6 }), WHT = STD('#fafafa', { roughness: 0.5 });
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }

// ---------------- zebra (local forward +x) ----------------
const ZG = new THREE.Group(); scene.add(ZG);
const ZR = {};
{ const bg = new THREE.SphereGeometry(1, 40, 28); bg.rotateZ(Math.PI / 2);
  ZR.body = new THREE.Group(); ZG.add(ZR.body);
  mk(bg, ZB, 0, 0, 0, ZR.body).scale.set(1.15, 0.6, 0.52);
  // legs: hip pivots, upper + knee pivot + lower + hoof
  ZR.legs = [[0.72, 1], [0.72, -1], [-0.72, 1], [-0.72, -1]].map(([x, s]) => { const hip = new THREE.Group(); hip.position.set(x, -0.15, s * 0.28); ZR.body.add(hip);
    mk(new THREE.CylinderGeometry(0.15, 0.11, 0.62, 12), ZL, 0, -0.31, 0, hip); const knee = new THREE.Group(); knee.position.y = -0.62; hip.add(knee);
    mk(new THREE.CylinderGeometry(0.1, 0.085, 0.6, 12), ZL, 0, -0.3, 0, knee); mk(new THREE.CylinderGeometry(0.1, 0.11, 0.13, 12), BLK, 0, -0.62, 0, knee); return { hip, knee, front: x > 0, s }; });
  // neck + head
  ZR.neck = new THREE.Group(); ZR.neck.position.set(0.95, 0.25, 0); ZR.body.add(ZR.neck);
  const ng = new THREE.CylinderGeometry(0.22, 0.3, 1.0, 14); ng.translate(0, 0.5, 0); mk(ng, ZN, 0, 0, 0, ZR.neck);
  for (let k = 0; k < 8; k++) { const m = mk(new THREE.BoxGeometry(0.1, 0.16, 0.08), k % 2 ? BLK : WHT, -0.22, 0.1 + k * 0.12, 0, ZR.neck); m.rotation.z = 0.12; }
  ZR.head = new THREE.Group(); ZR.head.position.set(0, 1.0, 0); ZR.neck.add(ZR.head);
  const hg = new THREE.SphereGeometry(1, 32, 20); hg.rotateZ(Math.PI / 2);
  mk(hg, ZN, 0.32, 0, 0, ZR.head).scale.set(0.55, 0.27, 0.25);
  mk(new THREE.SphereGeometry(0.2, 18, 12), BLK, 0.8, -0.05, 0, ZR.head).scale.set(0.9, 1.0, 1.05);
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.035, 8, 6), STD('#000'), 0.96, 0.02, s * 0.08, ZR.head);
  ZR.eyes = [-1, 1].map(s => { const w = mk(new THREE.SphereGeometry(0.085, 14, 10), STD('#ffffff', { roughness: 0.3 }), 0.28, 0.12, s * 0.2, ZR.head);
    const p = mk(new THREE.SphereGeometry(0.05, 10, 8), STD('#2b1a10', { roughness: 0.2 }), 0.32, 0.12, s * 0.24, ZR.head);
    const hl = mk(new THREE.SphereGeometry(0.014, 6, 5), new THREE.MeshBasicMaterial({ color: '#fff' }), 0.335, 0.14, s * 0.27, ZR.head);
    const lid = new THREE.Group(); lid.position.set(0.28, 0.12, s * 0.2); ZR.head.add(lid); mk(new THREE.SphereGeometry(0.092, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), STD('#2a2a2a'), 0, 0, 0, lid);
    const lash = []; for (let k = -1; k <= 1; k++) { const l = mk(new THREE.BoxGeometry(0.012, 0.07, 0.012), BLK, 0, 0.09, 0, lid); l.position.set(0.04 + k * 0.03, 0.09, s * 0.035); l.rotation.set(-s * 0.5, 0, -0.3 - k * 0.2); lash.push(l); }
    return { w, p, hl, lid, s }; });
  for (const s of [-1, 1]) { const e = mk(new THREE.ConeGeometry(0.08, 0.32, 10), ZN, 0.0, 0.32, s * 0.13, ZR.head); e.rotation.x = s * 0.35; }
  for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(0.08, 0.14, 0.06), k % 2 ? WHT : BLK, 0.1 + k * 0.04, 0.27, 0, ZR.head);
  ZR.smile = mk(new THREE.TorusGeometry(0.07, 0.015, 6, 14, Math.PI), STD('#550000'), 0.92, -0.15, 0, ZR.head); ZR.smile.rotation.set(Math.PI / 2, 0, 0); ZR.smile.rotation.order = 'YXZ'; ZR.smile.rotation.set(0, Math.PI / 2, Math.PI);
  // tail
  ZR.tail = new THREE.Group(); ZR.tail.position.set(-1.12, 0.2, 0); ZR.body.add(ZR.tail);
  const tg = new THREE.CylinderGeometry(0.03, 0.04, 0.7, 6); tg.translate(0, -0.35, 0); mk(tg, ZN, 0, 0, 0, ZR.tail); mk(new THREE.SphereGeometry(0.09, 8, 6), BLK, 0, -0.75, 0, ZR.tail).scale.set(1, 1.8, 1); }
// pose: stand 0 (lying) .. 1 (standing); gait phase + amplitude; stretch; neckUp
function zebraPose(t, P) {
  const st = P.stand;
  ZR.body.position.set(0, lerp(0.42, 1.38, st) + P.bob, 0); ZR.body.rotation.set(0, 0, P.pitch);
  ZR.legs.forEach((Lg, i) => { const diag = (i === 0 || i === 3) ? 0 : Math.PI; const sw = Math.sin(P.phase + diag) * P.amp;
    const foldH = Lg.front ? 1.45 : -1.45, foldK = Lg.front ? -2.4 : 2.4;
    Lg.hip.rotation.z = lerp(foldH, 0, st) + sw * 0.55 + (Lg.front ? P.stretchF : -P.stretchB); Lg.knee.rotation.z = lerp(foldK, 0, st) + (Lg.front ? -1 : 1) * Math.max(0, Math.sin(P.phase + diag + 1.2)) * P.amp * 0.8; });
  ZR.neck.rotation.z = P.neck; ZR.head.rotation.set(P.headRoll || 0, P.headYaw || 0, P.head, 'YXZ');
  ZR.tail.rotation.set(0.3 * Math.sin(t * 3.1), 0, -0.35 - 0.3 * Math.abs(Math.sin(t * 2.3)) + (P.tailUp || 0));
  ZR.eyes.forEach(E => { E.lid.rotation.set(lerp(0.0, -1.4, P.shut), 0, 0); E.lid.rotation.order = 'XYZ'; E.lid.rotation.y = 0; E.lid.rotation.x = E.s * lerp(-0.2, 1.5, P.shut); E.lid.rotation.z = 0; E.p.visible = E.hl.visible = P.shut < 0.6; });
  ZR.smile.visible = !!P.smile;
}

// ---------------- crowd: kids, brass band, elephant ----------------
const SKIN = ['#f1c8a5', '#c98f62', '#8d5a3b', '#f5d3b8', '#b97a52'];
function person(kind, i) { const g = new THREE.Group(); scene.add(g); const kid = kind === 'kid';
  const s = kid ? 0.62 : 1.0; const shirt = kid ? ['#e53935', '#43a047', '#1e88e5', '#fdd835', '#8e24aa', '#fb8c00'][i % 6] : '#c62828';
  mk(new THREE.CapsuleGeometry(0.2 * s, 0.55 * s, 4, 10), STD(shirt), 0, 0.75 * s, 0, g);
  for (const z of [-0.09, 0.09]) mk(new THREE.CylinderGeometry(0.07 * s, 0.07 * s, 0.5 * s, 8), STD(kid ? '#37474f' : '#212121'), 0, 0.25 * s, z * s, g);
  mk(new THREE.SphereGeometry(0.2 * s, 14, 10), STD(SKIN[i % SKIN.length], { roughness: 0.7 }), 0, 1.32 * s, 0, g);
  if (kid) { const c = mk(new THREE.SphereGeometry(0.21 * s, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), STD('#ffd600'), 0, 1.36 * s, 0, g); mk(new THREE.BoxGeometry(0.16 * s, 0.03, 0.2 * s), STD('#ffd600'), -0.2 * s, 1.37 * s, 0, g); }
  else { mk(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 12), STD('#1a237e'), 0, 1.62, 0, g); mk(new THREE.SphereGeometry(0.05, 6, 5), STD('#ffd54f'), 0, 1.84, 0, g);
    const tb = new THREE.Group(); tb.position.set(-0.1, 1.0, 0.25); g.add(tb); const gold = STD('#ffc107', { metalness: 0.85, roughness: 0.25 });
    mk(new THREE.TorusGeometry(0.22, 0.05, 8, 20), gold, 0, 0, 0, tb).rotation.y = Math.PI / 2; const bell = mk(new THREE.ConeGeometry(0.22, 0.4, 16, 1, true), gold, 0, 0.42, 0.02, tb); bell.rotation.x = Math.PI; bell.material.side = THREE.DoubleSide; }
  return g; }
const KIDS = Array.from({ length: 8 }, (_, i) => person('kid', i));
const BAND = Array.from({ length: 5 }, (_, i) => person('band', i + 2));
const EL = new THREE.Group(); scene.add(EL); const ELR = {};
{ const gm = STD('#8e9aa3', { roughness: 0.85 });
  mk(new THREE.SphereGeometry(1, 28, 20), gm, 0, 2.7, 0, EL).scale.set(1.9, 1.35, 1.3);
  ELR.legs = [[1.1, 0.7], [1.1, -0.7], [-1.1, 0.7], [-1.1, -0.7]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, 2.1, z); EL.add(p); mk(new THREE.CylinderGeometry(0.42, 0.45, 2.1, 14), gm, 0, -1.05, 0, p); mk(new THREE.CylinderGeometry(0.47, 0.47, 0.1, 14), STD('#d7ccc8'), 0, -2.06, 0, p); return p; });
  const hd = new THREE.Group(); hd.position.set(2.0, 3.2, 0); EL.add(hd); mk(new THREE.SphereGeometry(0.95, 24, 18), gm, 0, 0, 0, hd);
  for (const s of [-1, 1]) { const e = mk(new THREE.CircleGeometry(1.0, 24), STD('#9aa6ae', { side: THREE.DoubleSide, roughness: 0.85 }), -0.2, 0.0, s * 0.85, hd); e.rotation.y = s * 0.3; e.scale.set(0.8, 1.0, 1);
    mk(new THREE.SphereGeometry(0.1, 10, 8), STD('#111'), 0.72, 0.25, s * 0.42, hd); mk(new THREE.ConeGeometry(0.08, 0.7, 10), STD('#fffde7'), 0.85, -0.55, s * 0.32, hd).rotation.z = -2.2; }
  ELR.trunk = []; let par = hd; let off = V3(0.85, -0.25, 0);
  for (let k = 0; k < 6; k++) { const p = new THREE.Group(); p.position.copy(off); par.add(p); const r0 = 0.32 - k * 0.04; mk(new THREE.CylinderGeometry(r0 - 0.03, r0, 0.42, 12), gm, 0, -0.2, 0, p); ELR.trunk.push(p); par = p; off = V3(0, -0.4, 0); }
  ELR.hd = hd; }

// ---------------- hero car ----------------
const hero = makeCar('#ff7043');
hero.userData.bodyG.children[1].material.color.set('#4a6c8c');
const carStripeT = canvasTex(512, 64, (c, w, h) => { c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h); c.fillStyle = '#141414'; for (let i = 0; i < 12; i++) c.fillRect(i * w / 12 + 6, 0, w / 24, h); });
carStripeT.wrapS = carStripeT.wrapT = THREE.RepeatWrapping;
const ORIG_BODY = hero.userData.bodyG.children[0].material;
const STRIPED = STD('#ffffff', { map: carStripeT, roughness: 0.4, metalness: 0.1 });
// planar-project UVs along z on the body so stripes run across the car
{ const g = hero.userData.bodyG.children[0].geometry.clone(); const p = g.attributes.position, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[i * 2] = (p.getX(i) + 1.0) / 12; uv[i * 2 + 1] = p.getY(i); } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); hero.userData.bodyG.children[0].geometry = g;
  const r = hero.userData.bodyG.children[2]; const g2 = r.geometry.clone(); const p2 = g2.attributes.position, uv2 = new Float32Array(p2.count * 2); for (let i = 0; i < p2.count; i++) { uv2[i * 2] = (p2.getX(i) + 1.0) / 12; uv2[i * 2 + 1] = p2.getY(i); } g2.setAttribute('uv', new THREE.BufferAttribute(uv2, 2)); r.geometry = g2; }

// puffs
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 80 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }

// ---------------- choreography ----------------
const ZX0 = -1.5;                                  // zebra lying centre x (left lane), facing +x
const Z_H0 = ZZ + 62, Z_H1 = ZZ + 18;
const zHook = t => lerp(Z_H0, Z_H1, easeOut(clamp(t / S('hook2').end)));
const tArr = tHonk - 0.2;
const zArrive = (t, t0, t1) => lerp(Z_H1, Z_LINE, 1 - Math.pow(1 - clamp((t - t0) / (t1 - t0)), 2.0));
const zWrong = t => t < S('wrong1').start - 0.3 ? zHook(t) : zArrive(t, S('wrong1').start - 0.3, tArr);
const zRightA = t => zArrive(t, tRew1 - 0.2, tWait + 0.1);
const Z_CAMO = ZZ;
const zRight = t => t < tBest - 0.3 ? zRightA(t) : lerp(Z_LINE, Z_CAMO, ease(clamp((t - tBest + 0.3) / 1.6)));
// zebra right-way path: stand at tStands, stretch, trot +x from tTrots; keys hit at stripes while x passes
const TROT_V = 1.25;
const zxRight = t => { const d = Math.max(0, t - tTrots + 0.1); return ZX0 + (d < 0.6 ? TROT_V * d * d / 1.2 : TROT_V * (d - 0.3)); };
const ZX_STOP = 3.0;
const zxR = t => Math.min(zxRight(t), ZX_STOP);
// wrong-way run: jump at tJumps, gallop -x from tRuns
const zxWrong = t => { const d = Math.max(0, t - tRuns + 0.15); return ZX0 - (3.5 * d * d / 0.8 * (d < 0.4 ? 1 : 0) + (d >= 0.4 ? 3.5 * 0.4 * 0.4 / 0.8 + 7 * (d - 0.4) : 0)); };
// crowd walking -x over the car at z = car z
const CROWD_V = 2.4;
const carH = x => 1.62 * clamp(1 - (Math.abs(x - CX) - 0.55) / 0.55);
const kidT0 = i => tWalks - 0.3 + i * 0.28, bandT0 = i => tBrass - 1.6 + i * 0.36;
const EL_HIT = tElephant + 0.35, EL_V = 2.0, EL_X = t => CX + 0.9 - EL_V * (t - EL_HIT);
// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const chase = (dz, dy, look = 10) => t => { const z = isRight(t) ? zRight(t) : zWrong(t); return [V3(CX + 0.4, dy, z + dz), V3(CX - 1.0, 0.8, z - look), 40]; };
const EYE = Ac([0.9, 1.3, ZZ + 4.4], [0.2, 0.5, ZZ], 32);
const WIDE = Ac([4.2, 4.2, ZZ + 12.0], [-0.8, 0.6, ZZ], 40);
const FRONT = Ac([1.6, 5.6, ZZ - 9.5], [0.4, 0.4, ZZ + 0.6], 40);
const camKeys = [
  [0.0, chase(9.5, 3.4, 12)],
  [tStripes1 - 0.3, chase(8.5, 3.2, 12)],
  ...cut(tStripes1 - 0.25, EYE),
  [tA2 - 0.25, Ac([0.85, 1.25, ZZ + 4.0], [0.2, 0.5, ZZ], 32)],
  ...cut(tA2 - 0.2, WIDE),
  [S('hook2').end + 0.3, Ac([4.0, 4.4, ZZ + 11.2], [-0.8, 0.6, ZZ], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.1, chase(8.5, 3.0, 10)),
  [tMake, chase(8.0, 3.0, 10)],
  ...cut(tBig - 0.1, WIDE),
  [tAndW - 0.3, Ac([3.4, 4.4, ZZ + 11.0], [-2.0, 0.8, ZZ], 40)],
  ...cut(tAndW - 0.25, Ac([3.5, 8.0, ZZ + 9.5], [-4.0, 0.5, ZZ - 1.0], 40)),
  [tNo - 0.2, Ac([3.3, 8.2, ZZ + 9.0], [-4.5, 0.5, ZZ - 1.0], 40)],
  ...cut(tNo - 0.15, Ac([1.8, 5.5, ZZ + 13.0], [0.4, 0.2, ZZ], 40)),
  [tSo3 - 0.25, Ac([1.8, 5.8, ZZ + 13.5], [0.4, 0.2, ZZ], 40)],
  ...cut(tSo3 - 0.2, Ac([-6.5, 4.6, Z_LINE + 7.5], [1.4, 1.2, Z_LINE - 0.5], 40)),
  [tElephant - 0.8, Ac([-7.2, 5.4, Z_LINE + 9.5], [1.6, 1.8, Z_LINE - 0.5], 40)],
  [tRew0, Ac([-7.6, 5.8, Z_LINE + 10.5], [1.6, 1.8, Z_LINE - 0.5], 40)],
  // right
  ...cut(tRew1, chase(9.0, 3.2, 12)),
  [tA_R - 0.3, chase(8.0, 3.0, 10)],
  ...cut(tA_R - 0.25, Ac([0.5, 2.6, ZZ + 7.4], [-0.4, 0.9, ZZ], 36)),
  [S('right2').end + 0.2, Ac([0.5, 2.5, ZZ + 7.0], [-0.4, 0.9, ZZ], 36)],
  ...cut(tStands - 0.25, WIDE),
  [tEvery - 0.3, Ac([4.0, 4.4, ZZ + 11.2], [-0.6, 0.8, ZZ], 40)],
  ...cut(tEvery - 0.25, FRONT),
  [S('right4').end + 0.2, Ac([1.9, 5.4, ZZ - 9.0], [0.8, 0.5, ZZ + 0.6], 40)],
  ...cut(tHappy - 0.3, Ac([0.9, 3.9, ZZ + 11.5], [2.7, 1.0, ZZ + 0.8], 38)),
  [S('right5').end + 0.2, Ac([1.0, 3.8, ZZ + 10.8], [2.7, 1.0, ZZ + 0.8], 38)],
  ...cut(tYour - 0.1, Ac([-3.2, 3.6, ZZ - 5.0], [2.2, 1.0, ZZ + 3.0], 40)),
  [tBest - 0.3, Ac([-3.4, 3.8, ZZ - 5.4], [2.2, 1.0, ZZ + 3.0], 40)],
  ...cut(tBest - 0.25, Ac([2.2, 9.5, ZZ + 7.0], [0.6, 0.0, ZZ - 0.6], 40)),
  [TOTAL, Ac([2.0, 10.5, ZZ + 8.0], [0.6, 0.0, ZZ - 0.6], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {}, keyLit = [];
const KEYCOL = ['#ff5252', '#ffab40', '#ffee58', '#69f0ae', '#40c4ff', '#7c4dff', '#ff4081'];
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  // ---- zebra
  const P = { stand: 0, bob: 0, pitch: 0, phase: 0, amp: 0, stretchF: 0, stretchB: 0, neck: -1.15, head: -0.35, headYaw: 0, shut: 1, smile: false };
  let zx = ZX0, zz = ZZ, yaw = 0, zy = 0, zvis = true;
  const blinkE = (t % 3.3) < 0.12 ? 1 : 0;
  if (!right) {
    // hook: eyes closed, blink at "blinked", lifts head at "real"
    if (t > tBlinked - 0.1 && t < tBlinked + 0.35) P.shut = 1 - win(t, tBlinked - 0.1, tBlinked + 0.35, 0.1);
    if (t > tReal - 0.2) { const u = ramp(t, tReal - 0.2, tReal + 0.4); P.neck = lerp(-1.15, -0.55, u); P.head = lerp(-0.35, 0.25, u); P.shut = t > tBlinked + 0.35 ? Math.max(blinkE, 1 - u) : P.shut; P.headYaw = 0.3 * u; }
    if (t > tHonk) { P.shut = 0; P.headYaw = 0.5; }
    if (t > tJumps - 0.15) { const u = clamp((t - tJumps + 0.15) / 0.35); P.stand = easeOut(u); zy = 1.1 * Math.sin(Math.PI * clamp(u * 0.8)); P.neck = lerp(-0.55, -0.15, u); P.head = 0.4; P.shut = 0; P.tailUp = 1.0; }
    if (t > tRuns - 0.15) { const d = t - tRuns + 0.15; zx = zxWrong(t); yaw = Math.PI * ease(clamp(d / 0.35)); P.phase = d * 13; P.amp = clamp(d / 0.3) * 0.9; P.bob = 0.12 * Math.abs(Math.sin(d * 13)); P.pitch = 0.08 * Math.sin(d * 13); P.neck = -0.2; P.head = 0.5;
      // leaps the hedge
      if (zx < -4.6 && zx > -7.0) zy = 1.3 * Math.sin(Math.PI * (-4.6 - zx) / 2.4); zvis = zx > -24; }
  } else {
    if (t > tA_R - 0.3) { P.shut = blinkE; P.neck = lerp(-1.15, -0.65, ramp(t, tA_R - 0.3, tA_R + 0.3)); P.head = lerp(-0.35, 0.15, ramp(t, tA_R - 0.3, tA_R + 0.3)); P.headYaw = 0.35; }
    if (t > tStands - 0.2) { const u = ease(clamp((t - tStands + 0.2) / 0.6)); P.stand = u; P.neck = lerp(P.neck, -0.25, u); P.head = lerp(P.head, 0.35, u); }
    if (t > tStretch - 0.15 && t < tTrots + 0.1) { const s = win(t, tStretch - 0.15, tTrots + 0.1, 0.3); P.stretchF = 0.55 * s; P.stretchB = -0.0; P.pitch = -0.22 * s; P.neck = lerp(P.neck, 0.15, s); P.head = lerp(P.head, 0.7, s); P.shut = s > 0.5 ? 1 : P.shut; }
    if (t > tTrots - 0.1) { zx = zxR(t); const moving = zxRight(t) < ZX_STOP; const d = t - tTrots + 0.1; P.phase = d * 7.5; P.amp = moving ? clamp(d / 0.4) * 0.55 : Math.max(0, 0.55 - (t - (tTrots - 0.1 + (ZX_STOP - ZX0) / TROT_V + 0.3)) * 2); P.bob = 0.08 * Math.abs(Math.sin(d * 7.5)) * P.amp / 0.55; P.neck = -0.3 + 0.05 * Math.sin(d * 7.5); P.head = 0.3; P.headYaw = 0.0; P.shut = blinkE; }
    if (t > tHappy - 0.3) { const u = ease(clamp((t - tHappy + 0.3) / 0.6)); yaw = 0.95 * u; P.headYaw = 0.25 * u; P.smile = true; P.shut = t > tGives && t < tGives + 0.5 ? 1 : blinkE; }
    if (t > tStripesR - 0.35 && t < tStripesR + 0.3) { const s = win(t, tStripesR - 0.35, tStripesR + 0.3, 0.1); P.bob += 0.15 * s * Math.abs(Math.sin(t * 30)); P.pitch += 0.06 * s * Math.sin(t * 40); }
    if (t > tBest - 0.3) { const u = ease(clamp((t - tBest + 0.3) / 1.6)); zz = lerp(ZZ, ZZ - 0.0, u); yaw = lerp(0.95, Math.PI / 2 + 0.0, u) ; zx = lerp(ZX_STOP, 3.0, u); P.smile = true; if (t > tCamo + 0.5) P.shut = (t % 1.6) < 0.25 && t > tCamo + 1.0 ? 1 : 0; }
  }
  zebraPose(t, P);
  ZG.position.set(zx, zy, zz); ZG.rotation.set(0, -yaw, 0); ZG.visible = zvis;
  ZG.updateMatrixWorld(true);
  // ---- stripes: fly after her (wrong) / piano keys (right)
  STR.forEach((S_, k) => { const m = S_.m; m.visible = true; m.material.emissive.set('#000'); m.material.color.set('#f5f5f5'); m.position.set(S_.x, 0.082, ZZ); m.rotation.set(-Math.PI / 2, 0, 0); m.scale.set(1, 1, 1);
    if (!right) { const t0 = tStripesW - 0.45 + (6 - k) * 0.1; if (t > t0) { const u = clamp((t - t0) / 1.0); const tgt = ZG.localToWorld(V3(0, 1.4, 0)); const p0 = V3(S_.x, 0.082, ZZ); const p = p0.clone().lerp(tgt, easeIn(u)); p.y += 2.5 * Math.sin(Math.PI * u); m.position.copy(p); m.rotation.set(-Math.PI / 2 + u * 5 + k, u * 3, u * 2); m.scale.setScalar(1 - 0.85 * u); m.visible = u < 0.98; } }
    else { const fx = zx + 1.1 * Math.cos(yaw); const lit = t > tTrots && Math.abs(fx - S_.x) < 0.35 && t < tHappy; const since = keyLit[k] != null ? t - keyLit[k] : 99; if (lit && (keyLit[k] == null || since > 1.2)) keyLit[k] = t; const g = keyLit[k] != null && t - keyLit[k] < 0.7 && t > keyLit[k] ? 1 - (t - keyLit[k]) / 0.7 : 0;
      m.material.color.set('#f5f5f5'); if (g > 0) { m.material.color.set(KEYCOL[k]); m.material.emissive.set(KEYCOL[k]); m.material.emissive.multiplyScalar(0.8 * g); m.position.y = 0.082 - 0.0; } } });
  if (!right) keyLit = [];
  // ---- car
  let carZ = right ? zRight(t) : zWrong(t);
  placeCar(hero, { x: CX, z: carZ, h: 0 }); hero.scale.set(1, 1, 1);
  let squash = 0; if (!right && t > EL_HIT - 0.05) squash = easeOut(clamp((t - EL_HIT + 0.05) / 0.15));
  hero.scale.set(1 + 0.18 * squash, 1 - 0.68 * squash, 1 + 0.08 * squash);
  const striped = right && t > tStripesR - 0.05; hero.userData.bodyG.children[0].material = striped ? STRIPED : ORIG_BODY; hero.userData.bodyG.children[2].material = striped ? STRIPED : ORIG_BODY;
  hero.userData.bodyG.children.forEach(o => { if (o.material === ORIG_BODY || o.material === STRIPED) o.material = striped ? STRIPED : ORIG_BODY; });
  hero.userData.hl.emissiveIntensity = 0.4; blink(hero, t, false, false);
  hero.updateMatrixWorld(true);
  // poof of stripes onto the car
  if (right) { const d = t - tStripesR + 0.05; if (d > 0 && d < 0.9) for (let k = 0; k < 26; k++) { const a = hash(k) * 6.28, ph = clamp(d * 1.6 - hash(k + 3) * 0.2); const p = hero.localToWorld(V3(Math.cos(a) * 1.4 * ph, 0.9 + ph * 1.2 * hash(k + 5), Math.sin(a) * 2.6 * ph)); puff(p, 0.4 + ph * 0.9, 0.85 * (1 - ph), k % 2 ? '#ffffff' : '#222222'); } }
  // ---- crowd (wrong)
  const walker = (g, t0, i, scale) => { const d = t - t0; if (right || d < 0) { g.visible = false; return; } const x = 5.6 - CROWD_V * d; if (x < -6.5) { g.visible = false; return; } g.visible = true;
    const y = carH(x) * (1 - squash) + 0.06 * Math.abs(Math.sin(d * 10)); g.position.set(x, y, carZ + (hash(i) - 0.5) * 0.8); g.rotation.set(0, Math.PI, 0.05 * Math.sin(d * 10)); };
  KIDS.forEach((g, i) => walker(g, kidT0(i), i)); BAND.forEach((g, i) => walker(g, bandT0(i), i + 20));
  EL.visible = !right && t > tBrass - 0.5; if (EL.visible) { const ex = EL_X(t); EL.position.set(ex, 0, carZ); EL.rotation.set(0, Math.PI, 0); const ph = t * 4.2;
    ELR.legs.forEach((lg, i) => lg.rotation.z = 0.25 * Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)));
    ELR.trunk.forEach((p, k) => p.rotation.z = -0.12 - 0.08 * Math.sin(t * 2.5 + k * 0.6) + (t > EL_HIT && t < EL_HIT + 1.0 ? 0.25 * win(t, EL_HIT, EL_HIT + 1.0, 0.2) : 0));
    EL.position.y = 0.05 * Math.abs(Math.sin(ph)); }
  if (!right && t > EL_HIT && t < EL_HIT + 0.8) { const d = t - EL_HIT; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; puff(V3(CX + Math.cos(a) * (1.2 + d * 3), 0.3 + d * 0.5, carZ + Math.sin(a) * (2.2 + d * 3)), 0.8 + d * 1.5, 0.7 * (1 - d / 0.8), '#d7ccc8'); } }
  // beacons blink
  beacons.forEach(m => m.emissiveIntensity = 0.3 + 0.7 * ((t % 1.0) < 0.5 ? 1 : 0));
  // ---- camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? win(t, EL_HIT, EL_HIT + 0.5, 0.05) : 0;
  applyCam(c, t, shk > 0.02 ? 0.08 * shk : 0);
  camera.updateMatrixWorld(true);
  screen = { head: project(ZR.head.localToWorld(V3(0.3, 0.6, 0))), car: project(hero.localToWorld(V3(0, 2.0, 0))), el: project(EL.localToWorld(V3(0, 4.6, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0) => [clamp(p.x, 230, W - 230), clamp(p.y + dy, 560, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -120) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  ctx.translate(clamp(x, w / 2 + 30, W - w / 2 - 30) - x, 0);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, h / 2 - 4); ctx.lineTo(0, h / 2 + 34); ctx.lineTo(22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function notes(t, a, b) { if (t < a || t > b) return; for (let k = 0; k < 8; k++) { const t0 = a + k * 0.33; const d = t - t0; if (d < 0 || d > 1.3) continue; ctx.save(); ctx.globalAlpha = (1 - d / 1.3) * win(t, a, b, 0.2); ctx.translate(200 + (k * 97) % 700, 900 - d * 260); ctx.rotate(0.2 * Math.sin(k + d * 4)); ctx.fillStyle = KEYCOL[k % 7]; ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, 0, 30, 22, -0.4, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillRect(22, -110, 12, 108); ctx.strokeRect(22, -110, 12, 108); ctx.beginPath(); ctx.moveTo(34, -110); ctx.quadraticCurveTo(80, -80, 60, -30); ctx.quadraticCurveTo(66, -70, 34, -78); ctx.fill(); ctx.stroke(); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('ZEBRA CROSSING AHEAD', '#455a64', tZebra1 - 0.1, tNobody - 0.1, 56);
    P_('NOBODY WAITING', '#455a64', tNobody - 0.1, tEasy - 0.1, 62);
    P_('EASY.', GREEN, tEasy - 0.1, S('hook1').end + 0.3, 70, iconCheck);
    P_('A STRIPE JUST BLINKED?!', '#6d4c41', tBlinked - 0.15, tReal - 0.1, 54);
    P_("IT'S A REAL ZEBRA", '#212121', tReal - 0.1, S('hook2').end + 0.3, 60);
    P_('HONK TO MAKE HER MOVE', RED, tHonk - 0.1, S('wrong1').end + 0.3, 52, iconWarn);
    floatText('HONK! HONK!', 540, 760, t, tHonk, tHonk + 1.0, 110, YEL, -0.08);
    P_('SHE RUNS OFF', RED, tJumps - 0.1, tAndW - 0.1, 62, iconX);
    P_('...WITH THE STRIPES!', RED, tAndW - 0.1, S('wrong2').end + 0.3, 58, iconX);
    P_('NO STRIPES = NO CROSSING', RED, tNo - 0.1, tSo3 - 0.1, 52, iconX);
    P_('EVERYONE WALKS OVER YOU', RED, tSo3 - 0.1, tSchool - 0.15, 50, iconX);
    P_('A SCHOOL CLASS', '#f9a825', tSchool - 0.15, tBrass - 0.15, 60);
    P_('A BRASS BAND', '#c62828', tBrass - 0.15, tElephant - 0.15, 62);
    P_('AN ELEPHANT', '#455a64', tElephant - 0.15, tRew0, 64, iconX);
    floatText('SQUASH!', 540, 800, t, EL_HIT, EL_HIT + 1.0, 140, YEL, -0.1);
  } else {
    P_('STOP AT THE LINE', GREEN, tStopR - 0.1, tWait - 0.1, 62, iconCheck);
    P_('AND WAIT', GREEN, tWait - 0.1, tA_R - 0.1, 66, iconCheck);
    P_('IT BELONGS TO THE ZEBRA', '#212121', tA_R - 0.1, S('right2').end + 0.3, 52);
    floatText('STREEETCH', 540, 740, t, tStretch - 0.1, tStretch + 1.0, 100, YEL, -0.06);
    P_('EVERY STRIPE = A NOTE', '#7c4dff', tEvery - 0.1, tPiano - 0.15, 54);
    P_("IT'S A PIANO!", '#7c4dff', tPiano - 0.15, S('right4').end + 0.3, 66, iconHeart);
    notes(t, tEvery - 0.1, tPiano + 0.8);
    P_('THANK-YOU PRESENT', GREEN, tPresent - 0.3, tStripesR - 0.1, 56, iconHeart);
    floatText('STRIPES!', 540, 760, t, tStripesR - 0.05, tStripesR + 1.0, 140, YEL, -0.08);
    P_('YOUR CAR = A ZEBRA', '#212121', tZebraR - 0.15, tBest - 0.1, 58, iconCheck);
    P_('BEST CAMOUFLAGE IN TOWN', GREEN, tBest - 0.1, S('right7').start - 0.1, 50, iconCheck);
    floatText('WHERE IS IT?', 540, 900, t, tCamo + 0.6, S('right7').start, 90, '#fff', 0.06);
  }
}
window.dbg = { zRight, zWrong };
start(update, hud);
